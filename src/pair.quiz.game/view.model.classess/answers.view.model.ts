import {AnswerStatuses} from "./answer.statuses.enum";
import { APIQuizQuestionAnswer } from "../../entities/api-quiz-question-answer-entity";

export class AnswersViewModel {
    questionId : string
    answerStatus : AnswerStatuses
    addedAt : string

    static getViewModelOfListOfAnswers(answersOfUser: APIQuizQuestionAnswer[]) : AnswersViewModel[] {
        console.log(answersOfUser, " answersOfUser");
        let array : AnswersViewModel[] = []
        if(!answersOfUser) return array;
        answersOfUser.forEach(item => { array.push(AnswersViewModel.getViewModel(item))})
        console.log(array, "array");
        return array
    }

    private static getViewModel(item: APIQuizQuestionAnswer) {
        const newAnswer = new AnswersViewModel()
        newAnswer.questionId = item.question.id
        newAnswer.answerStatus = item.answerStatus
        newAnswer.addedAt = item.addedAt
        return newAnswer
    }

    static getViewModelFromDBClass(answerOfUser: APIQuizQuestionAnswer) {
        const n = new AnswersViewModel()
        n.addedAt = answerOfUser.addedAt
        n.answerStatus = answerOfUser.answerStatus
        n.questionId = answerOfUser.question.id
        return n
    }
}