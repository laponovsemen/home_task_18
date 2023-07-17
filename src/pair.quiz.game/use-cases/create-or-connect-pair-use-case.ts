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
import { PairGameQuizViewModel } from "../view.model.classess/pair.game.quiz.view.model";

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

  async execute(command: CreateOrConnectPairCommand) : Promise<PairGameQuizViewModel | null> {
    const user : User = await this.usersRepository.findUserById(command.tokenPayload.userId)

    const resultOfCreationOrConnectionPair : PairGameQuizViewModel
      = await this.pairGameQuizRepository.createOrConnectPair(user)

    return resultOfCreationOrConnectionPair

  }
}