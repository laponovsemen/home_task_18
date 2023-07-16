import { Common } from "../common";
import { Injectable } from "@nestjs/common";
import { Brackets, DataSource, QueryRunner, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PairGameQuiz } from "../entities/api-pair-game-quiz-entity";
import { GameStatuses } from "./view.model.classess/game.statuses.enum";
import { User } from "../entities/user-entity";
import { QuizQuestionsRepository } from "../quiz/sa.quiz.questions.repository";
import { AnswersInputModel } from "./view.model.classess/answers.input.model";
import { userNumberInGame } from "./view.model.classess/user.number.in.game.enum";
import { APIQuizQuestionAnswer } from "../entities/api-quiz-question-answer-entity";
import { APIQuizQuestion } from "../entities/quiz-entity";
import { AnswerStatuses } from "./view.model.classess/answer.statuses.enum";
import { PairGameQuizViewModel } from "./view.model.classess/pair.game.quiz.view.model";
import { AnswersViewModel } from "./view.model.classess/answers.view.model";

@Injectable()
export class PairGameQuizRepository {
    constructor(
        @InjectRepository(PairGameQuiz) protected pairGameQuizTypeORMRepository: Repository<PairGameQuiz>,
        protected quizQuestionsRepository: QuizQuestionsRepository,
        protected readonly dataSource: DataSource,
        protected readonly common: Common,
    ) {
    }



    async deleteAllData() {
        await this.pairGameQuizTypeORMRepository.delete({})
    }


    async findGameWithPengingSecondUser() {


        return await this.pairGameQuizTypeORMRepository
            .findOne({
                where: {
                    status: GameStatuses.PendingSecondPlayer
                }
            })
    }

    async createNewGame(user: User) {
        const newGame = PairGameQuiz.create(user)
        console.log(newGame, " new game")
        return this.pairGameQuizTypeORMRepository.create(newGame);
    }

    async addSecondUserToPendingGame(gameWithPengingSecondUser: PairGameQuiz, user: User) {
        const fiveQuestions : string[] = await this.quizQuestionsRepository.generateFiveRandomQuestions() // how to generate
        const gameWithAddedSecondUser  = PairGameQuiz.addSecondUser(gameWithPengingSecondUser, user,fiveQuestions)
        return await this.pairGameQuizTypeORMRepository
          .save(gameWithAddedSecondUser)
    }

    async findGameByIdWhereUserIsParticipate(user: User, gameId: string) {
        const game : PairGameQuiz | null = await this.pairGameQuizTypeORMRepository
            .createQueryBuilder("game")
            .leftJoinAndSelect("game.firstPlayer", "firstUser")
            .leftJoinAndSelect("game.secondPlayer", "secondUser")
            .where('game.id = :id', {
                id : gameId
            })
          .getOne()


        console.log(game, 'found game');
        if (!game) return null;
        const questionsList : APIQuizQuestion[] = await this.quizQuestionsRepository
          .findQuizQuestionsListByListOfIds(game.questions)

        const result : PairGameQuizViewModel = PairGameQuizViewModel.getViewModelForFront(game, questionsList)
        console.log(result);
        return result
    }

    async checkOfParticipatingUserInAnotherGame(user: User) : Promise<boolean> {
        const game = await this.pairGameQuizTypeORMRepository
            .createQueryBuilder("game")
            .where( new Brackets(qb => {
                    qb.where('game.status = :status', { status: GameStatuses.PendingSecondPlayer})
                        .orWhere('game.status = :status', { status: GameStatuses.Active});
                })
            )
            .andWhere(new Brackets(qb => {
                qb.where('game.firstPlayerId = :userId', { userId: user.id})
                    .orWhere('game.secondPlayerId = :userId', { userId: user.id});
            }))
            .getOne()

        console.log(await this.pairGameQuizTypeORMRepository.find({}), " all games in db");
        console.log(game, " game in checkOfParticipatingUserInAnotherGame")
        return !!game
    }

    async createOrConnectPair(user: User) : Promise<PairGameQuiz> {
        const queryRunner : QueryRunner =  this.dataSource.createQueryRunner()
        let result
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const pairGameQuizRepoFromQueryRunner = queryRunner.manager.getRepository(PairGameQuiz)
        try {
        //TODO FD
            const checkOfParticipatingInAnotherGame : PairGameQuiz
              = await pairGameQuizRepoFromQueryRunner
              .createQueryBuilder("game")
              .leftJoinAndSelect("game.firstPlayer", "firstPlayer")
              .leftJoinAndSelect("game.secondPlayer", "secondPlayer")
              /*.where( new Brackets(qb => {
                    qb.where("game.status = 'PendingSecondPlayer'")
                      .orWhere("game.status = 'Active'");
                })
              )*/
              .where( new Brackets(qb => {
                    qb.where(`game.status = '${GameStatuses.PendingSecondPlayer}'`)
                      .orWhere(`game.status = '${GameStatuses.Active}'`)
                })
              )
              .andWhere(new Brackets(qb => {
                  qb.where('game.firstPlayer.id = :userId', { userId: user.id})
                    .orWhere('game.secondPlayer.id = :userId', { userId: user.id});
              }))
              .getOne()

            console.log(checkOfParticipatingInAnotherGame, " checkOfParticipatingInAnotherGame")
            //check if user is participating in another game
            if (checkOfParticipatingInAnotherGame) return null;


            console.log(pairGameQuizRepoFromQueryRunner
              .createQueryBuilder("game")
              .leftJoinAndSelect("game.firstPlayer", "firstPlayer")
              .leftJoinAndSelect("game.secondPlayer", "secondPlayer")
              .where( new Brackets(qb => {
                    qb.where("game.status = 'PendingSecondPlayer'")
                      .orWhere("game.status = 'Active'");
                })
              )
              /*.where( new Brackets(qb => {
                    qb.where("game.status = ':status'", {status : GameStatuses.PendingSecondPlayer})
                      .orWhere("game.status = ':status'", {status : GameStatuses.Active})
                })
              )*/
              .andWhere(new Brackets(qb => {
                  qb.where('game.firstPlayer.id = :userId', { userId: user.id})
                    .orWhere('game.secondPlayer.id = :userId', { userId: user.id});
              }))
              .getSql());


            const gameWithPendingSecondUser : PairGameQuiz = await pairGameQuizRepoFromQueryRunner.findOne({
                  where: {
                      status: GameStatuses.PendingSecondPlayer
                  }
              })


            if (gameWithPendingSecondUser) {
                const fiveQuestions : string[] = await this.quizQuestionsRepository.generateFiveRandomQuestions()
                console.log(fiveQuestions, " fiveQuestions");
                const gameWithAddedSecondUser = PairGameQuiz.addSecondUser(gameWithPendingSecondUser, user, fiveQuestions)
                result = await pairGameQuizRepoFromQueryRunner.save(gameWithAddedSecondUser)
            } else {

                const newGame = PairGameQuiz.create(user)
                console.log(newGame, " new game")
                result = await pairGameQuizRepoFromQueryRunner.save(newGame);
                //console.log(p);

            }
            await queryRunner.commitTransaction()
            console.log(result, " result ");

        } catch (e) {
            console.log(" catch error")
            console.log(e)
            await queryRunner.rollbackTransaction()
        } finally {
            console.log(" finally")
            await queryRunner.release()
            // ask why it works if I don't use release transaction
        }

        return result
    }

  async findUnfinishedGameWhereUserParticipate(user: User) {
      const game = await this.pairGameQuizTypeORMRepository
        .createQueryBuilder("game")
        .where(`game.status = '${GameStatuses.Active}'`)
        .andWhere(new Brackets(qb => {
            qb.where('game.firstPlayerId = :userId', { userId: user.id})
              .orWhere('game.secondPlayerId = :userId', { userId: user.id});
        }))
        .getOne()

      return game
  }

    async answerNextQuestion(user: User, answer: AnswersInputModel) : Promise<AnswersViewModel> {
        const queryRunner : QueryRunner =  this.dataSource.createQueryRunner()
        let result
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const pairGameQuizRepoFromQueryRunner = queryRunner.manager.getRepository(PairGameQuiz)
        const answerRepoFromQueryRunner = queryRunner.manager.getRepository(APIQuizQuestionAnswer)
        const apiQuizQuestionRepoFromQueryRunner = queryRunner.manager.getRepository(APIQuizQuestion)
        try {

            const gameWhichUserParticipateIn : PairGameQuiz
              = await pairGameQuizRepoFromQueryRunner
              .createQueryBuilder("game")
              .leftJoinAndSelect("game.firstPlayer", "firstPlayer")
              .leftJoinAndSelect("game.secondPlayer", "secondPlayer")
              .leftJoinAndSelect("game.answersOfFirstUser", "answersOfFirstUser")
              .leftJoinAndSelect("game.answersOfSecondUser", "answersOfSecondUser")
              .where('game.status = :status', { status: GameStatuses.Active}) // check for enum injection
              .andWhere(new Brackets(qb => {
                  qb.where('game.firstPlayerId = :userId', { userId: user.id})
                    .orWhere('game.secondPlayerId = :userId', { userId: user.id});
              }))
              .getOne() // how to check length of array

            console.log(gameWhichUserParticipateIn, " checkOfParticipatingInAnotherGame")

            if (!gameWhichUserParticipateIn) return null; //check if user is participating in this game, if no -> 403

            const numberOfUserInGame : userNumberInGame = PairGameQuiz.findoutNumberOfUser(user, gameWhichUserParticipateIn)
            if(numberOfUserInGame === userNumberInGame.none) return null; // user don't participate in game

            const answersOfUserFromDB : APIQuizQuestionAnswer[] = PairGameQuiz.getAnswersOfUserByQueue(numberOfUserInGame, gameWhichUserParticipateIn)
            console.log(answersOfUserFromDB, " answersOfUserFromDB");
            if(answersOfUserFromDB.length > 4) return null; // too many answers for questions
            console.log("length of users answers is less then 5 and actually equals", answersOfUserFromDB.length)
            const questionToAnwser : APIQuizQuestion = await apiQuizQuestionRepoFromQueryRunner
              .findOneBy({id : gameWhichUserParticipateIn.questions[answersOfUserFromDB.length]})
            //find question in db by length of answers
            console.log("question to answer", questionToAnwser);
            const answerOfUser : APIQuizQuestionAnswer = APIQuizQuestionAnswer
              .createAnswer(answer, questionToAnwser, user, numberOfUserInGame, gameWhichUserParticipateIn) // create instance of answer
            console.log(answerOfUser, " answerOfUser");
            await answerRepoFromQueryRunner.save(answerOfUser)
            console.log(" answer saved");
            const previousScore = PairGameQuiz.getScoreOfUser(gameWhichUserParticipateIn, numberOfUserInGame)
            const scoreToAdd : number = answerOfUser.answerStatus === AnswerStatuses.Correct ? 1 : 0
            const newScore : number = previousScore + scoreToAdd
            console.log(newScore, " newScore");
            const gameWithUpdatedScore : PairGameQuiz = PairGameQuiz.updateScore(gameWhichUserParticipateIn,
              numberOfUserInGame,
              newScore)
            result = gameWithUpdatedScore
            console.log(result);

            await pairGameQuizRepoFromQueryRunner.save(gameWithUpdatedScore)
            await queryRunner.commitTransaction()

        } catch (e) {
            console.log(" catch error")
            console.log(e)
            await queryRunner.rollbackTransaction()
        } finally {
            console.log(" finally")
            await queryRunner.release()
            // ask why it works if I don't use release transaction
        }
        return result
    }
}
