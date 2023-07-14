import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";

export class returnGameByIdCommand{
  constructor(public tokenPayload : TokenPayload) {}
}
@CommandHandler(returnGameByIdCommand)
export class returnGameByIdUseCase implements ICommandHandler<returnGameByIdCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
  ) {

  }

  async execute(command: returnGameByIdCommand) {
    /*const quizQuestion = APIQuizQuestion.create(command.DTO)

    return await this.quizQuestionsRepository.createNewQuizQuestion(quizQuestion)*/

  }
}