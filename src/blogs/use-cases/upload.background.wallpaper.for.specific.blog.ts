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
import { BlogWallpaperPhotoEntity } from "../../entities/photo.entities/blog.wallpaper.photo-entity";

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
    protected photosRepository: PhotosRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected common: Common,
  ) {

  }
  async execute(command : UploadBackgroundWallPapperForSpecificBlogCommand) : Promise<BlogImagesViewModel> {
    const uploadedFile = await this.googleStorageService.uploadFile(command.fileType, command.fileBuffer, command.fileName)
    console.log(uploadedFile, " uploadedFile");
    const url : string = await this.googleStorageService.getPublicUrl(uploadedFile)
    console.log(url , " url");

    const blogsWallpaper : BlogWallpaperPhotoEntity = await BlogWallpaperPhotoEntity.create({fileBuffer : command.fileBuffer, url : url})
    const blogWithUpdatedWallpaper : Blog = Blog.updateWallpaper(command.blog, blogsWallpaper)
    await this.blogsQueryRepository.saveBlogToDB(blogWithUpdatedWallpaper)

    return BlogImagesViewModel.getViewModel(blogsWallpaper, blogWithUpdatedWallpaper.main)
  }
}