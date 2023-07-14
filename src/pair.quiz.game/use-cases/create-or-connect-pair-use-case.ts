import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";
import {UsersRepository} from "../../users/users.reposiroty";

export class CreateOrConnectPairCommand{
  constructor(public tokenPayload : TokenPayload) {}
}
@CommandHandler(CreateOrConnectPairCommand)
export class CreateOrConnectPairUseCase implements ICommandHandler<CreateOrConnectPairCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
    protected usersRepository : UsersRepository
  ) {

  }

  async execute(command: CreateOrConnectPairCommand) {
    const user = await this.usersRepository.findUserById(command.tokenPayload.userId)
    const checkOfParticipatingInAnotherGame = true
    //check if user is participating in another game
    if(!checkOfParticipatingInAnotherGame) return null;

    const gameWithPengingSecondUser = await this.pairGameQuizRepository.findGameWithPengingSecondUser()

    if(gameWithPengingSecondUser) {
      return await this.pairGameQuizRepository.addSecondUserToPendingGame(gameWithPengingSecondUser, user)
    } else {
      return await this.pairGameQuizRepository.createNewGame(user)
    }

  }
}