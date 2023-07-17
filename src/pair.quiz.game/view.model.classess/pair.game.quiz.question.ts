import { APIQuizQuestion } from "../../entities/quiz-entity";

export class PairGameQuizQuestion {
    id : string
    body : string

  static getViewModel(item: APIQuizQuestion) {
    const q = new PairGameQuizQuestion()
    q.id = item.id
    q.body = item.body
    return q
  }
}