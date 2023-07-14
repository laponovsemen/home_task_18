import {Common} from '../common';
import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {PairGameQuiz} from "../entities/api-pair-game-quiz-entity";
import {GameStatuses} from "./view.model.classess/game.statuses.enum";
import {User} from "../entities/user-entity";

@Injectable()
export class PairGameQuizRepository {
    constructor(
        @InjectRepository(PairGameQuiz) protected pairGameQuizTypeORMRepository: Repository<PairGameQuiz>,
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
        return Promise.resolve(undefined);
    }

    async addSecondUserToPendingGame(gameWithPengingSecondUser: PairGameQuiz, user: User) {
        return Promise.resolve(undefined);
    }
}
