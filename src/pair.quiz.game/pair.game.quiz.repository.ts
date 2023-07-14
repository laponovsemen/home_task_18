import {Common} from '../common';
import {Injectable} from "@nestjs/common";
import {Brackets, DataSource, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {PairGameQuiz} from "../entities/api-pair-game-quiz-entity";
import {GameStatuses} from "./view.model.classess/game.statuses.enum";
import {User} from "../entities/user-entity";
import {APIQuizQuestion} from "../entities/quiz-entity";
import {QuizQuestionsRepository} from "../quiz/sa.quiz.questions.repository";

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
        return newGame
    }

    async addSecondUserToPendingGame(gameWithPengingSecondUser: PairGameQuiz, user: User) {
        return Promise.resolve(undefined);
    }

    async findGameByIdWhereUserIsParticipate(user: User, gameId: string) {
        const game = await this.pairGameQuizTypeORMRepository
            .createQueryBuilder("game")
            .where('game.id = :id', {
                id : gameId
            })
            .andWhere(new Brackets(qb => {
                qb.where('game.firstPlayer = :user', { user: user})
                    .orWhere('game.secondPlayer = :user', { user: user});
            }))


        return game
    }

    async checkOfParticipatingUserInAnotherGame(user: User) : Promise<boolean> {
        const game = await this.pairGameQuizTypeORMRepository
            .createQueryBuilder("game")
            .where( new Brackets(qb => {
                    qb.where('game.status = :status', { status: GameStatuses.PendingSecondPlayer})
                        .orWhere('game.secondPlayer = :user', { user: user});
                })
            )
            .andWhere(new Brackets(qb => {
                qb.where('game.firstPlayer = :user', { user: user})
                    .orWhere('game.secondPlayer = :user', { user: user});
            }))


        return !!game
    }
}
