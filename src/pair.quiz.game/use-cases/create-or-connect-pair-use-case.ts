import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";
import {UsersRepository} from "../../users/users.reposiroty";
import {Inject} from "@nestjs/common";
import {TypeORMTransactionService} from "../../transaction.service";
import {User} from "../../entities/user-entity";
import {PairGameQuiz} from "../../entities/api-pair-game-quiz-entity";

export class CreateOrConnectPairCommand{
  constructor(public tokenPayload : TokenPayload) {}
}
@CommandHandler(CreateOrConnectPairCommand)
export class CreateOrConnectPairUseCase implements ICommandHandler<CreateOrConnectPairCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
    protected usersRepository : UsersRepository,

   private transactionService: TypeORMTransactionService
  ) {

  }

  async execute(command: CreateOrConnectPairCommand) {
    const user : User = await this.usersRepository.findUserById(command.tokenPayload.userId)

    await this.transactionService.connect()
    await this.transactionService.startTransaction()
    try {

      const checkOfParticipatingInAnotherGame : boolean
          = await this.pairGameQuizRepository.checkOfParticipatingUserInAnotherGame(user)
      //check if user is participating in another game
      if (!checkOfParticipatingInAnotherGame) return null;

      const gameWithPengingSecondUser : PairGameQuiz = await this.pairGameQuizRepository.findGameWithPengingSecondUser()

      if (gameWithPengingSecondUser) {
        const result = await this.pairGameQuizRepository.addSecondUserToPendingGame(gameWithPengingSecondUser, user)
        await this.transactionService.commitTransaction()
        return result
      } else {
        const result = await this.pairGameQuizRepository.createNewGame(user)
        await this.transactionService.commitTransaction()
        return result
      }

    } catch (e) {
      console.log(" catch error")
      console.log(e)
      await this.transactionService.rollbackTransaction()
    } finally {
      console.log(" finally")
      //await this.transactionService.release()
      // ask why it works if i dont use release transaction
    }





  }
}