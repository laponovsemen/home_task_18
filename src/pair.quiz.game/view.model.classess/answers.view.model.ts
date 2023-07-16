import {AnswerStatuses} from "./answer.statuses.enum";
import { APIQuizQuestionAnswer } from "../../entities/api-quiz-question-answer-entity";

export class AnswersViewModel {
    questionId : string
    answerStatus : AnswerStatuses
    addedAt : string

    static getViewModelOfListOfQuestion(answersOfFirstUser: APIQuizQuestionAnswer[]) : AnswersViewModel[] {

        let array : AnswersViewModel[] = []
        if(!answersOfFirstUser) return array;
        answersOfFirstUser.forEach(item => { return AnswersViewModel.getViewModel(item)})
        return array
    }

    private static getViewModel(item: APIQuizQuestionAnswer) {
        const newAnswer = new AnswersViewModel()
        newAnswer.questionId = item.question.id
        newAnswer.answerStatus = item.answerStatus
        newAnswer.addedAt = item.addedAt
        return newAnswer
    }
}