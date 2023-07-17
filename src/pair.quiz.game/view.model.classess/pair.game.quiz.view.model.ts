import {AnswersViewModel} from "./answers.view.model";
import {PlayerViewModel} from "./player.view.model";
import { GamePlayerProgressViewModel } from "./game.player.progress.view.model";
import { PairGameQuizQuestion } from "./pair.game.quiz.question";
import { GameStatuses } from "./game.statuses.enum";
import { PairGameQuiz } from "../../entities/api-pair-game-quiz-entity";
import { APIQuizQuestionAnswer } from "../../entities/api-quiz-question-answer-entity";
import { APIQuizQuestion } from "../../entities/quiz-entity";

export class PairGameQuizViewModel {
    id : string
    firstPlayerProgress : GamePlayerProgressViewModel
    secondPlayerProgress : GamePlayerProgressViewModel
    questions : PairGameQuizQuestion[]
    status : GameStatuses
    pairCreatedDate : string
    startGameDate : string
    finishGameDate : string

    static getViewModelForFront(game : PairGameQuiz, questionsList : APIQuizQuestion[] | null) : PairGameQuizViewModel {
        const newGameForFront = new PairGameQuizViewModel()
        const answersOfFirstUser : AnswersViewModel[] =  AnswersViewModel.getViewModelOfListOfQuestion(game.answersOfFirstUser)
        const answersOfSecondUser : AnswersViewModel[] = AnswersViewModel.getViewModelOfListOfQuestion(game.answersOfSecondUser)
        const firstPlayerProgress : GamePlayerProgressViewModel | null =
          GamePlayerProgressViewModel.getViewModel(answersOfFirstUser, game.firstPlayer, game.firstPlayerScore)
        const secondPlayerProgress : GamePlayerProgressViewModel | null =
          GamePlayerProgressViewModel.getViewModel(answersOfSecondUser, game.secondPlayer, game.secondPlayerScore)

        newGameForFront.id = game.id
        newGameForFront.firstPlayerProgress = firstPlayerProgress
        newGameForFront.secondPlayerProgress = secondPlayerProgress
        newGameForFront.questions = questionsList
        newGameForFront.status = game.status
        newGameForFront.finishGameDate = game.finishGameDate
        newGameForFront.startGameDate = game.startGameDate
        newGameForFront.pairCreatedDate = game.pairCreatedDate
        return newGameForFront

    }
}