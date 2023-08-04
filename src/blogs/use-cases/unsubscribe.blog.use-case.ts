import { BanBlogDTO, BanUserDTO } from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { LikeRepository } from "../../likes/likes.repository";
import { CommentsRepository } from "../../comments/comments.repository";
import { paginationCriteriaType } from "../../appTypes";
import { Common } from "../../common";
import { BlogsRepository } from "../blogs.repository";
import { PostsRepository } from "../../posts/posts.repository";
import {BlogsQueryRepository} from "../blogs.query.repository";
import { TokenPayload } from "../../working.classess";
import { UsersRepository } from "../../users/users.reposiroty";
import { APISubscriptionEntity } from "../../entities/api-subscription-entity";
import { SubscriptionsRepository } from "../subscriptions.repository";

export class UnubscribeBlogCommand{
  constructor(public blogId : string,
              public tokenPayload : TokenPayload
  ) {
  }
}
@CommandHandler(UnubscribeBlogCommand)
export class UnubscribeBlogUseCase implements ICommandHandler<UnubscribeBlogCommand>{
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected usersRepository: UsersRepository,
    protected blogsRepository: BlogsRepository,
    protected subscriptionsRepository: SubscriptionsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected common: Common,
  ) {

  }
  async execute(command : UnubscribeBlogCommand) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(command.blogId)
    const foundUser = await this.usersRepository.findUserById(command.tokenPayload.userId)
    if (!foundBlog || !foundUser){
      return null
    }
    const oldSubscription : APISubscriptionEntity = await this.subscriptionsRepository.findSubscriptionByUserAndBlog(foundBlog, foundUser)
    const newSubscription : APISubscriptionEntity = APISubscriptionEntity.createNewUnsubscribtion(oldSubscription)

    await this.subscriptionsRepository.saveNewSubscriptionToDB(newSubscription)
    return true
  }
}