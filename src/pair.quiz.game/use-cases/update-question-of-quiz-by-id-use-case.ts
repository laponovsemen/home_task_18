import {BanBlogDTO, BanUserDTO, QuizDTO} from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {QuizQuestionsRepository} from "../sa.quiz.questions.repository";
import {APIQuizQuestion} from "../../entities/quiz-entity";

export class updateQuestionOfQuizCommand{
  constructor(public quizQuestionId : string,
              public updateQuizDTO : QuizDTO) {}
}
@CommandHandler(updateQuestionOfQuizCommand)
export class updateQuestionOfQuizUseCase implements ICommandHandler<updateQuestionOfQuizCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
  ) {

  }

  async execute(command: updateQuestionOfQuizCommand) {

    console.log("start update question")
    const foundQuestion = await this.quizQuestionsRepository.findQuizQuestionById(command.quizQuestionId)
    if (!foundQuestion){
      console.log("foundQuestion not found")
      return null
    }
    await this.quizQuestionsRepository.updateQuestionOfQuizById(command.updateQuizDTO, foundQuestion)
    console.log("foundQuestion is updated")
    return true

  }
}