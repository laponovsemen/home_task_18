import { Common } from "../common";
import { Injectable } from "@nestjs/common";
import { Brackets, DataSource, QueryRunner, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PairGameQuiz } from "../entities/api-pair-game-quiz-entity";
import { GameStatuses } from "./view.model.classess/game.statuses.enum";
import { User } from "../entities/user-entity";
import { QuizQuestionsRepository } from "../quiz/sa.quiz.questions.repository";
import { isLogLevelEnabled } from "@nestjs/common/services/utils";
import { AnswersInputModel } from "./view.model.classess/answers.input.model";

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
        const fiveQuestions = await this.quizQuestionsRepository.generateFiveRandomQuestions() // how to generate
        const newGame = PairGameQuiz.create(user, fiveQuestions)
        console.log(newGame, " new game")
        return this.pairGameQuizTypeORMRepository.create(newGame);
    }

    async addSecondUserToPendingGame(gameWithPengingSecondUser: PairGameQuiz, user: User) {
        const gameWithAddedSecondUser  = PairGameQuiz.addSecondUser(gameWithPengingSecondUser, user)
        return await this.pairGameQuizTypeORMRepository
          .save(gameWithAddedSecondUser)
    }

    async findGameByIdWhereUserIsParticipate(user: User, gameId: string) {
        const game = await this.pairGameQuizTypeORMRepository
            .createQueryBuilder("game")
            .where('game.id = :id', {
                id : gameId
            })
            .andWhere(new Brackets(qb => {
                qb.where('game.firstPlayerId = :userId', { userId: user.id})
                    .orWhere('game.secondPlayerId = :userId', { userId: user.id});
            }))

        return game
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

            const checkOfParticipatingInAnotherGame : PairGameQuiz
              = await pairGameQuizRepoFromQueryRunner
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

            console.log(await pairGameQuizRepoFromQueryRunner.find({}), " all games in db");
            console.log(checkOfParticipatingInAnotherGame, " checkOfParticipatingInAnotherGame")
            //check if user is participating in another game
            if (checkOfParticipatingInAnotherGame) return null;

            const gameWithPendingSecondUser : PairGameQuiz = await pairGameQuizRepoFromQueryRunner.findOne({
                  where: {
                      status: GameStatuses.PendingSecondPlayer
                  }
              })


            if (gameWithPendingSecondUser) {
                const gameWithAddedSecondUser = PairGameQuiz.addSecondUser(gameWithPendingSecondUser, user)
                result = await pairGameQuizRepoFromQueryRunner.save(gameWithAddedSecondUser)
            } else {
                const fiveQuestions = await this.quizQuestionsRepository.generateFiveRandomQuestions() // how to generate
                const newGame = PairGameQuiz.create(user, fiveQuestions)
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
        .where('game.status = :status', {
            status : GameStatuses.Active
        })
        .andWhere(new Brackets(qb => {
            qb.where('game.firstPlayerId = :userId', { userId: user.id})
              .orWhere('game.secondPlayerId = :userId', { userId: user.id});
        }))

      return game
  }

    async answerNextQuestion(user: User, answer: AnswersInputModel) {
        const queryRunner : QueryRunner =  this.dataSource.createQueryRunner()
        let result
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const pairGameQuizRepoFromQueryRunner = queryRunner.manager.getRepository(PairGameQuiz)
        try {

            const checkOfParticipatingInAnotherGame : PairGameQuiz
              = await pairGameQuizRepoFromQueryRunner
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

            console.log(await pairGameQuizRepoFromQueryRunner.find({}), " all games in db");
            console.log(checkOfParticipatingInAnotherGame, " checkOfParticipatingInAnotherGame")
            //check if user is participating in another game
            if (checkOfParticipatingInAnotherGame) return null;

            const gameWithPendingSecondUser : PairGameQuiz = await pairGameQuizRepoFromQueryRunner.findOne({
                where: {
                    status: GameStatuses.PendingSecondPlayer
                }
            })


            if (gameWithPendingSecondUser) {
                const gameWithAddedSecondUser = PairGameQuiz.addSecondUser(gameWithPendingSecondUser, user)
                result = await pairGameQuizRepoFromQueryRunner.save(gameWithAddedSecondUser)
            } else {
                const fiveQuestions = await this.quizQuestionsRepository.generateFiveRandomQuestions() // how to generate
                const newGame = PairGameQuiz.create(user, fiveQuestions)
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
}
