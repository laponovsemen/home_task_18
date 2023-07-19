import {AnswerStatuses} from "./answer.statuses.enum";
import { APIQuizQuestionAnswer } from "../../entities/api-quiz-question-answer-entity";
import { WithPlayerRawCredentials } from "../../mongo/mongooseSchemas";

export class StaticsViewModel {
    sumScore : number
    avgScores : number
    gamesCount : number
    winsCount : number
    lossesCount : number
    drawsCount : number

    player? : {
        id : string,
      login : string
    }

  static getViewModelForTopOfPlayers(item: WithPlayerRawCredentials<StaticsViewModel>) {
    const newStatistics = new StaticsViewModel()
    newStatistics.player = {
      id : item.id,
      login : item.login
    }
    newStatistics.avgScores = Number(item.avgScores)
    newStatistics.drawsCount = item.drawsCount
    newStatistics.gamesCount = item.gamesCount
    newStatistics.lossesCount = item.lossesCount
    newStatistics.sumScore = item.sumScore
    newStatistics.winsCount = item.winsCount

    return newStatistics
  }
}