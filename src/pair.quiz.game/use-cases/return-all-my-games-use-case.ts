import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";
import {UsersRepository} from "../../users/users.reposiroty";
import { PairGameQuizViewModel } from "../view.model.classess/pair.game.quiz.view.model";
import { paginationCriteriaType, paginationGamesCriteriaType, PaginatorViewModelType } from "../../appTypes";

export class returnAllMyGamesCommand{
  constructor(public tokenPayload : TokenPayload,
              public queryParams : any
  ) {}
}



@CommandHandler(returnAllMyGamesCommand)
export class returnAllMyGamesUseCase
  implements ICommandHandler<returnAllMyGamesCommand, PaginatorViewModelType<PairGameQuizViewModel[]>> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
    protected usersRepositiry: UsersRepository,
  ) {

  }

  async execute(command: returnAllMyGamesCommand) : Promise<PaginatorViewModelType<PairGameQuizViewModel[]>> {
    console.log("start returnGameByIdCommand");
    const user = await this.usersRepositiry.findUserById(command.tokenPayload.userId)
    const paginationCriteria: paginationGamesCriteriaType = this.common.getGamesPaginationCriteria(command.queryParams);
    console.log(user , " user in returnGameByIdCommand");
    console.log(paginationCriteria , " paginationCriteria in returnGameByIdCommand");
    const foundAllGames : PaginatorViewModelType<PairGameQuizViewModel[]> = await this.pairGameQuizRepository
        .findAllGamesWhereUserIsParticipate(user, paginationCriteria)

    return foundAllGames
  }
}