import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { Common } from "../../common";
import { BlogsRepository } from "../blogs.repository";
import {BlogsQueryRepository} from "../blogs.query.repository";
import { TokenPayload } from "../../working.classess";
import { UsersRepository } from "../../users/users.reposiroty";
import { APISubscriptionEntity } from "../../entities/api-subscription-entity";
import { SubscriptionsRepository } from "../subscriptions.repository";

export class SubscribeBlogCommand{
  constructor(public blogId : string,
              public tokenPayload : TokenPayload
  ) {
  }
}
@CommandHandler(SubscribeBlogCommand)
export class SubscribeBlogUseCase implements ICommandHandler<SubscribeBlogCommand>{
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected usersRepository: UsersRepository,
    protected blogsRepository: BlogsRepository,
    protected subscriptionsRepository: SubscriptionsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected common: Common,
  ) {

  }
  async execute(command : SubscribeBlogCommand) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(command.blogId)
    const foundUser = await this.usersRepository.findUserById(command.tokenPayload.userId)
    if (!foundBlog || !foundUser){
      return null
    }
    let newSubscription: APISubscriptionEntity;
    newSubscription = APISubscriptionEntity.createNewSubscribtion(foundBlog, foundUser);

    await this.subscriptionsRepository.saveNewSubscriptionToDB(newSubscription)

    return true
  }
}