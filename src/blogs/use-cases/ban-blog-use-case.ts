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

export class BanBlogCommand{
  constructor(public DTO : BanBlogDTO,
              public blogId : string
  ) {
  }
}
@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand>{
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected common: Common,
  ) {

  }
  async execute(command : BanBlogCommand) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(command.blogId)
    console.log(foundBlog, " foundBlog to ban")

    if (command.DTO.isBanned && foundBlog.blogBan.isBanned){
      console.log(" u try to ban already banned blog")
      return
    } else if (!command.DTO.isBanned && !foundBlog.blogBan.isBanned){
      console.log(" u try to unban already unbanned blog")
      return
    } else if (command.DTO.isBanned && !foundBlog.blogBan.isBanned){
      console.log("you are bunning blog")
      await this.postsRepository.makeAllPostsForBlogHiden(command.blogId)
      await this.blogsRepository.BanBlog(foundBlog);
    }else {
      console.log("you are unbunning blog")
      await this.postsRepository.makeAllPostsForBlogVisible(command.blogId)
      await this.blogsRepository.UnbanBlog(foundBlog);
    }
    return
  }
}