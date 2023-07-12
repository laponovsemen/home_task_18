import {BanBlogDTO, BanUserDTO, QuizDTO} from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {QuizQuestionsRepository} from "../sa.quiz.questions.repository";
import {APIQuizQuestion} from "../../entities/quiz-entity";

export class deleteQuestionOfQuizCommand{
  constructor(public quizQuestionId : string) {}
}
@CommandHandler(deleteQuestionOfQuizCommand)
export class deleteQuestionOfQuizUseCase implements ICommandHandler<deleteQuestionOfQuizCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
  ) {

  }

  async execute(command: deleteQuestionOfQuizCommand) {


    const foundQuestion = await this.quizQuestionsRepository.findQuizQuestionById(command.quizQuestionId)
    if (!foundQuestion){
      return null
    }
    await this.quizQuestionsRepository.deleteQuizQuestionById(command.quizQuestionId)
    return true

  }
}