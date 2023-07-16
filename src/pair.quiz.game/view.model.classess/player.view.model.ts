import { use } from "passport";
import { User } from "../../entities/user-entity";

export class PlayerViewModel {
    id : string
    login : string

  static getViewModel(player: User) {
    const user = new PlayerViewModel()
    user.id = player.id
    user.login = player.login
    return user
  }
}