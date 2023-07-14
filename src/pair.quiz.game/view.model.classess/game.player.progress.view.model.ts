import {AnswersViewModel} from "./answers.view.model";
import {PlayerViewModel} from "./player.view.model";

export class GamePlayerProgressViewModel {
    answers : AnswersViewModel[]
    player : PlayerViewModel
    score : number
}