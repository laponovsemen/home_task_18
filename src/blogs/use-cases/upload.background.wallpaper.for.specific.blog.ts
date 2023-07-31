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
import { Blog } from "../../entities/blog-entity";
import { GoogleStorageService } from "../../utils/google-storage-adapter/google.storage.service";

export class UploadBackgroundWallPapperForSpecificBlogCommand{
  constructor(
              public blog : Blog,
              public fileName : string,
              public fileType : string,
              public fileBuffer : Buffer,
  ) {
  }
}
@CommandHandler(UploadBackgroundWallPapperForSpecificBlogCommand)
export class UploadBackgroundWallPapperForSpecificBlogUseCase implements ICommandHandler<UploadBackgroundWallPapperForSpecificBlogCommand>{
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected googleStorageService: GoogleStorageService,
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected common: Common,
  ) {

  }
  async execute(command : UploadBackgroundWallPapperForSpecificBlogCommand) {
    const uploadedFile = await this.googleStorageService.uploadFile(command.fileType, command.fileBuffer, command.fileName)
    console.log(uploadedFile, " uploadedFile");
    return uploadedFile

  }
}