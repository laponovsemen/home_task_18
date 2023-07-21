import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";
import {UsersRepository} from "../../users/users.reposiroty";
import { PairGameQuizViewModel } from "../view.model.classess/pair.game.quiz.view.model";
import {
  paginationCriteriaType,
  paginationGamesCriteriaType,
  paginationTopUsersCriteriaType,
  PaginatorViewModelType
} from "../../appTypes";
import { WithPlayerCredentials } from "../../mongo/mongooseSchemas";
import { StaticsViewModel } from "../view.model.classess/statistics.view.model";

export class returnTopUsersCommand{
  constructor(public queryParams : any) {}
}



@CommandHandler(returnTopUsersCommand)
export class returnTopUsersUseCase
  implements ICommandHandler<returnTopUsersCommand, PaginatorViewModelType<StaticsViewModel>> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
    protected usersRepositiry: UsersRepository,
  ) {

  }

  async execute(command: returnTopUsersCommand) : Promise<PaginatorViewModelType<StaticsViewModel>> {
    console.log("start returnGameByIdCommand");

    const paginationCriteria: paginationTopUsersCriteriaType = this.common.getGamesTopUsersPaginationCriteria(command.queryParams);
    console.log(paginationCriteria , " paginationCriteria in returnGameByIdCommand");
    const foundTop : PaginatorViewModelType<StaticsViewModel> = await this.pairGameQuizRepository
        .getTopOfUsersAccordingTogamesStatistics(paginationCriteria)

    return foundTop
  }
}