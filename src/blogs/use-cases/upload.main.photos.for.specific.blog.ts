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
import { PhotoSizeViewModel } from "../../posts/posts.view.models/photo.size.view.model";
import sharp from "sharp";
import { BlogImagesViewModel } from "../blogs.view.models/blog.images.view.model";
import { BlogMainPhotoEntity } from "../../entities/photo.entities/blog.main.photo-entity";
import { PhotosRepository } from "../photos.repository";
import { BlogMainPhotosRepository } from "../blog.main.photos.repository";

export class UploadMainPhotosForSpecificBlogCommand{
  constructor(
              public blog : Blog,
              public fileName : string,
              public fileType : string,
              public fileBuffer : Buffer,
  ) {
  }
}
@CommandHandler(UploadMainPhotosForSpecificBlogCommand)
export class UploadMainPhotosForSpecificBlogUseCase implements ICommandHandler<UploadMainPhotosForSpecificBlogCommand>{
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected googleStorageService: GoogleStorageService,
    protected blogsMainPhotoRepository: BlogMainPhotosRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected common: Common,
  ) {

  }
  async execute(command : UploadMainPhotosForSpecificBlogCommand) : Promise<BlogImagesViewModel> {
    const uploadedFile = await this.googleStorageService.uploadFile(command.fileType, command.fileBuffer, command.fileName)
    console.log(uploadedFile, " uploadedFile");
    const url = await this.googleStorageService.getPublicUrl(uploadedFile)
    console.log(url , " url");

    const blogsMain : BlogMainPhotoEntity = await BlogMainPhotoEntity.create({fileBuffer : command.fileBuffer, url : url})
    await this.blogsMainPhotoRepository.saveMainToDB(blogsMain)
    console.log(command.blog , " blog");
    const blogWithUpdatedMain = Blog.updateMain(command.blog, blogsMain)
    await this.blogsQueryRepository.saveBlogToDB(blogWithUpdatedMain)
    console.log(blogWithUpdatedMain, " blogWithUpdatedMain");

    return BlogImagesViewModel.getViewModel(blogWithUpdatedMain.wallpaper, blogWithUpdatedMain.main)



  }
}