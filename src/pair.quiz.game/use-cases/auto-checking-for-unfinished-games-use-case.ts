import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import { PairGameQuizRepository } from "../pair.game.quiz.repository";
import { QuizQuestionsRepository } from "../../quiz/sa.quiz.questions.repository";
import { UsersRepository } from "../../users/users.reposiroty";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PairGameQuiz } from "../../entities/api-pair-game-quiz-entity";
import { DataSource, QueryRunner } from "typeorm";
import { GameStatuses } from "../view.model.classess/game.statuses.enum";
import { addSeconds } from "date-fns";
import { APIQuizQuestion } from "../../entities/quiz-entity";

export class autoFinishingEscapedGamesCommand{
  constructor() {}
}



@CommandHandler(autoFinishingEscapedGamesCommand)
export class autoFinishingEscapedGamesUseCase
  implements ICommandHandler<autoFinishingEscapedGamesCommand, void> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
    protected usersRepositiry: UsersRepository,
    protected dataSource: DataSource,
  ) {

  }

  //@Cron(CronExpression.EVERY_SECOND)
  async execute() {
  const timeToGiveAnAnswer = 9
    console.log("start autoFinishingEscapedGamesCommand");

    const queryRunner: QueryRunner =  await this.dataSource.createQueryRunner()
    let result
    await queryRunner.connect()
    await queryRunner.startTransaction()
    const pairGameQuizRepoFromQueryRunner = queryRunner.manager.getRepository(PairGameQuiz)
    const apiQuizQuestionRepoFromQueryRunner = queryRunner.manager.getRepository(APIQuizQuestion)
    console.log("before try catch");

    try {
      console.log("after try");
      const presentTime = new Date().toISOString()
      const listOfActiveGames: PairGameQuiz[] = await pairGameQuizRepoFromQueryRunner
        .find({
          relations: {
            firstPlayer : true,
            secondPlayer : true,
            answersOfFirstUser: true,
            answersOfSecondUser: true
          },
          where: {
            status: GameStatuses.Active
          }
        })

      console.log(listOfActiveGames, " listOfActiveGames");
      for (const item of listOfActiveGames) {
        if (PairGameQuiz.checkForCompletedAnswersOfAnyUserInTheGame(item) === 1) {
          console.log(1);
          const sortedAnswersOfFirstUser = item.answersOfFirstUser
            .sort((n1,n2) => {
              if (n1.addedAt > n2.addedAt) {
                return 1;
              }
              if (n1.addedAt < n2.addedAt) {
                return -1;
              }
              return 0;
            })
          const sortedAnswersOfSecondUser = item.answersOfSecondUser
            .sort((n1,n2) => {
              if (n1.addedAt > n2.addedAt) {
                return 1;
              }
              if (n1.addedAt < n2.addedAt) {
                return -1;
              }
              return 0;
            })

          console.log(sortedAnswersOfFirstUser, " sortedAnswersOfFirstUser");
          console.log(sortedAnswersOfSecondUser, " sortedAnswersOfSecondUser");


          if (
            (sortedAnswersOfFirstUser[sortedAnswersOfFirstUser.length - 1].addedAt
            < addSeconds(new Date(), -timeToGiveAnAnswer).toISOString() && sortedAnswersOfSecondUser.length === 0)
            ||
            sortedAnswersOfSecondUser[sortedAnswersOfSecondUser.length - 1].addedAt
            < addSeconds(new Date(), -timeToGiveAnAnswer).toISOString()){
            const finishedAheadOfScheduleGame = PairGameQuiz.finishEscapedBySecondUserGame(item);
            console.log(" ban nahui ", finishedAheadOfScheduleGame);
            console.log("my time");
            await pairGameQuizRepoFromQueryRunner.save(finishedAheadOfScheduleGame)
          }
        }
        else if(PairGameQuiz.checkForCompletedAnswersOfAnyUserInTheGame(item) === 2){
          console.log(2);
          const sortedAnswersOfFirstUser = item.answersOfFirstUser
            .sort((n1,n2) => {
              if (n1.addedAt > n2.addedAt) {
                return 1;
              }
              if (n1.addedAt < n2.addedAt) {
                return -1;
              }
              return 0;
            })
          const sortedAnswersOfSecondUser = item.answersOfSecondUser
            .sort((n1,n2) => {
              if (n1.addedAt > n2.addedAt) {
                return 1;
              }
              if (n1.addedAt < n2.addedAt) {
                return -1;
              }
              return 0;
            })

          console.log(sortedAnswersOfFirstUser, " sortedAnswersOfFirstUser");
          console.log(sortedAnswersOfSecondUser, " sortedAnswersOfSecondUser");


          if (
            (sortedAnswersOfSecondUser[sortedAnswersOfSecondUser.length - 1].addedAt
              < addSeconds(new Date(), -timeToGiveAnAnswer).toISOString()
              && sortedAnswersOfFirstUser.length === 0)
            ||
            sortedAnswersOfFirstUser[sortedAnswersOfFirstUser.length - 1].addedAt
            < addSeconds(new Date(), -timeToGiveAnAnswer).toISOString()){
            const finishedAheadOfScheduleGame = PairGameQuiz.finishEscapedByFirstUserGame(item);
            await pairGameQuizRepoFromQueryRunner.save(finishedAheadOfScheduleGame)
          }
        } else{
          console.log("game is not finished and is going to continue");
        }
      }

      await queryRunner.commitTransaction()
    } catch (e) {
      console.log(e, " error");
      await queryRunner.rollbackTransaction()
    } finally {
      console.log(" finally")
      await queryRunner.release()
    }
    console.log("after try catch");
    return

  }
}