import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";

export class returnCurrentUnfinishedUserGameCommand{
  constructor(public tokenPayload : TokenPayload) {}
}
@CommandHandler(returnCurrentUnfinishedUserGameCommand)
export class returnCurrentUnfinishedUserGameUseCase implements ICommandHandler<returnCurrentUnfinishedUserGameCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
  ) {

  }

  async execute(command: returnCurrentUnfinishedUserGameCommand) {
    /*const quizQuestion = APIQuizQuestion.create(command.DTO)

    return await this.quizQuestionsRepository.createNewQuizQuestion(quizQuestion)*/

  }
}