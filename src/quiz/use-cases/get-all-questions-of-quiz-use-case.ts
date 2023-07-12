import {BanBlogDTO, BanUserDTO, QuizDTO} from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {QuizQuestionsRepository} from "../sa.quiz.questions.repository";
import {APIQuizQuestion} from "../../entities/quiz-entity";
import {paginationCriteriaType} from "../../appTypes";

export class getAllQuestionsOfQuizCommand{
  constructor(public paginationCriteria : paginationCriteriaType) {}
}
@CommandHandler(getAllQuestionsOfQuizCommand)
export class getAllQuestionsOfQuizUseCase implements ICommandHandler<getAllQuestionsOfQuizCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
  ) {

  }

  async execute(command: getAllQuestionsOfQuizCommand) {

    const allQuestionsWithPagination = await this.quizQuestionsRepository
        .getAllQuizQuestionsWithPagination(command.paginationCriteria)
    return allQuestionsWithPagination
  }
}