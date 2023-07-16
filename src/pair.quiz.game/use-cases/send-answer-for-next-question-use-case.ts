import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {TokenPayload} from "../../working.classess";
import {PairGameQuizRepository} from "../pair.game.quiz.repository";
import {QuizQuestionsRepository} from "../../quiz/sa.quiz.questions.repository";
import { AnswersInputModel } from "../view.model.classess/answers.input.model";
import { UsersRepository } from "../../users/users.reposiroty";

export class sendAnswerForNextQuestionCommand{
  constructor(public tokenPayload : TokenPayload,
              public answer : AnswersInputModel) {}
}
@CommandHandler(sendAnswerForNextQuestionCommand)
export class sendAnswerForNextQuestionUseCase implements ICommandHandler<sendAnswerForNextQuestionCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
    protected pairGameQuizRepository: PairGameQuizRepository,
    protected usersRepository: UsersRepository,
  ) {

  }

  async execute(command: sendAnswerForNextQuestionCommand) {
    const user = await this.usersRepository.findUserById(command.tokenPayload.userId)
    const answerProcedure = await this.pairGameQuizRepository
      .answerNextQuestion(user, command.answer)
    return answerProcedure
  }
}