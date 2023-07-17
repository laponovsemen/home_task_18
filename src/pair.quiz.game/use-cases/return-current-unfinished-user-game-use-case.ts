import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";
import { UsersRepository } from "../../users/users.reposiroty";
import { PairGameQuizViewModel } from "../view.model.classess/pair.game.quiz.view.model";

export class returnCurrentUnfinishedUserGameCommand{
  constructor(public tokenPayload : TokenPayload) {}
}
@CommandHandler(returnCurrentUnfinishedUserGameCommand)
export class returnCurrentUnfinishedUserGameUseCase implements ICommandHandler<returnCurrentUnfinishedUserGameCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
    protected usersRepository: UsersRepository,
  ) {

  }

  async execute(command: returnCurrentUnfinishedUserGameCommand) : Promise<PairGameQuizViewModel> {

    const user = await this.usersRepository.findUserById(command.tokenPayload.userId)
    console.log(user, " user in returnCurrentUnfinishedUserGameCommand");
    const foundGame : PairGameQuizViewModel = await this.pairGameQuizRepository.findUnfinishedGameWhereUserParticipate(user)
    console.log(foundGame, " found game");
    return foundGame
  }
}