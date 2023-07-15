import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";
import { UsersRepository } from "../../users/users.reposiroty";

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

  async execute(command: returnCurrentUnfinishedUserGameCommand) {

    const user = await this.usersRepository.findUserById(command.tokenPayload.userId)
    const foundGame = await this.pairGameQuizRepository.findUnfinishedGameWhereUserParticipate(user)
    return foundGame
  }
}