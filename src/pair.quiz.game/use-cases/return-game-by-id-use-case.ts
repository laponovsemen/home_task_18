import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";
import {UsersRepository} from "../../users/users.reposiroty";

export class returnGameByIdCommand{
  constructor(public tokenPayload : TokenPayload,
              public gameId : string
  ) {}
}
@CommandHandler(returnGameByIdCommand)
export class returnGameByIdUseCase implements ICommandHandler<returnGameByIdCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
    protected usersRepositiry: UsersRepository,
  ) {

  }

  async execute(command: returnGameByIdCommand) {
    console.log("start returnGameByIdCommand");
    const user = await this.usersRepositiry.findUserById(command.tokenPayload.userId)
    console.log(user , " user in returnGameByIdCommand");
    const foundGameByIdWhereUserIsParticipate = await this.pairGameQuizRepository
        .findGameByIdWhereUserIsParticipate(user, command.gameId)

    return foundGameByIdWhereUserIsParticipate
  }
}