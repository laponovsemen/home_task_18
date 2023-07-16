import {AnswersViewModel} from "./answers.view.model";
import {PlayerViewModel} from "./player.view.model";
import { User } from "../../entities/user-entity";

export class GamePlayerProgressViewModel {
    answers : AnswersViewModel[]
    player : PlayerViewModel
    score : number

    static getViewModel(answersOfUser: AnswersViewModel[], player: User, playerScore: number) : GamePlayerProgressViewModel | null {
        if(!player){
            return null;
        }
        const newUser = new GamePlayerProgressViewModel()
        newUser.player = PlayerViewModel.getViewModel(player)
        newUser.answers = answersOfUser
        newUser.score = playerScore
        return newUser
    }
}