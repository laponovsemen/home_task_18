import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";

export class CreateOrConnectPairCommand{
  constructor(public tokenPayload : TokenPayload) {}
}
@CommandHandler(CreateOrConnectPairCommand)
export class CreateOrConnectPairUseCase implements ICommandHandler<CreateOrConnectPairCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
  ) {

  }

  async execute(command: CreateOrConnectPairCommand) {
    /*const quizQuestion = APIQuizQuestion.create(command.DTO)

    return await this.quizQuestionsRepository.createNewQuizQuestion(quizQuestion)*/

  }
}