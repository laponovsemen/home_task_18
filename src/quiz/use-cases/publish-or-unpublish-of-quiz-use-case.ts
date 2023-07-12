import {BanBlogDTO, BanUserDTO, PublishedDTO, QuizDTO} from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Common } from "../../common";
import {QuizQuestionsRepository} from "../sa.quiz.questions.repository";
import {APIQuizQuestion} from "../../entities/quiz-entity";

export class publishOrUnpublishQuestionOfQuizByIdCommand{
  constructor(public publishedDTO : PublishedDTO,
              public quizQuestionId : string) {}
}
@CommandHandler(publishOrUnpublishQuestionOfQuizByIdCommand)
export class publishOrUnpublishQuestionOfQuizByIdUseCase implements ICommandHandler<publishOrUnpublishQuestionOfQuizByIdCommand> {
  constructor(
    protected common: Common,
    protected quizQuestionsRepository: QuizQuestionsRepository,
  ) {

  }

  async execute(command: publishOrUnpublishQuestionOfQuizByIdCommand) {

    const foundQuestion = await this.quizQuestionsRepository.findQuizQuestionById(command.quizQuestionId)
    if(!foundQuestion) return null;

    const quizQuestion = APIQuizQuestion.createToPublish(command.publishedDTO, foundQuestion)

    return await this.quizQuestionsRepository.createNewQuizQuestion(quizQuestion)

  }
}