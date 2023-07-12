import {BanBlogDTO, BanUserDTO, QuizDTO} from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {QuizQuestionsRepository} from "../sa.quiz.questions.repository";
import {APIQuizQuestion} from "../../entities/quiz-entity";

export class CreateNewQuestionOfQuizCommand{
  constructor(public DTO : QuizDTO) {}
}
@CommandHandler(CreateNewQuestionOfQuizCommand)
export class CreateNewQuestionOfQuizUseCase implements ICommandHandler<CreateNewQuestionOfQuizCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
  ) {

  }

  async execute(command: CreateNewQuestionOfQuizCommand) {
    const quizQuestion = APIQuizQuestion.create(command.DTO)

    return await this.quizQuestionsRepository.createNewQuizQuestion(quizQuestion)

  }
}