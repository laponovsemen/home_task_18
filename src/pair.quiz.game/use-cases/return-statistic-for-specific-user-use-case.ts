import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";
import {UsersRepository} from "../../users/users.reposiroty";
import { PairGameQuizViewModel } from "../view.model.classess/pair.game.quiz.view.model";
import { paginationCriteriaType, paginationGamesCriteriaType, PaginatorViewModelType } from "../../appTypes";
import { StaticsViewModel } from "../view.model.classess/statistics.view.model";

export class returnStatisticForSpecificUserCommand{
  constructor(public tokenPayload : TokenPayload,
  ) {}
}



@CommandHandler(returnStatisticForSpecificUserCommand)
export class returnStatisticForSpecificUserUseCase
  implements ICommandHandler<returnStatisticForSpecificUserCommand, StaticsViewModel> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
    protected usersRepositiry: UsersRepository,
  ) {}

  async execute(command: returnStatisticForSpecificUserCommand) : Promise<StaticsViewModel> {
    console.log("start returnGameByIdCommand");
    const user = await this.usersRepositiry.findUserById(command.tokenPayload.userId)
    console.log(user , " user in returnGameByIdCommand");
    const foundStatistic : StaticsViewModel = await this.pairGameQuizRepository
        .findStatisticForSpecificUser(user)

    return foundStatistic
  }
}