import { BanBlogDTO, BanUserDTO } from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { LikeRepository } from "../../likes/likes.repository";
import { CommentsRepository } from "../../comments/comments.repository";
import { paginationCriteriaType } from "../../appTypes";
import { Common } from "../../common";
import { Blog } from "../../entities/blog-entity";
import { GoogleStorageService } from "../../utils/google-storage-adapter/google.storage.service";
import sharp from "sharp";
import { BlogMainPhotoEntity } from "../../entities/photo.entities/blog.main.photo-entity";
import { PostImagesViewModel } from "../posts.view.models/post.images.view.model";
import { PostMainPhotosRepository } from "../post.main.photos.repository";
import { APIPost } from "../../entities/api-post-entity";
import { mainPostPhotosEnum } from "../posts.view.models/main.photos.sizes.enum";
import * as Buffer from "buffer";
import { BlogImagesViewModel } from "../../blogs/blogs.view.models/blog.images.view.model";
import * as url from "url";
import { PostMainPhotoEntity } from "../../entities/photo.entities/post.main.photo-entity";
import { PostsQueryRepository } from "../posts.query.repository";

export class UploadMainPhotosForPostForSpecificBlogCommand{
  constructor(
              public post : APIPost,
              public fileName : string,
              public fileType : string,
              public fileBuffer : Buffer,
  ) {
  }
}
@CommandHandler(UploadMainPhotosForPostForSpecificBlogCommand)
export class UploadMainPhotosForPostForSpecificBlogUseCase implements ICommandHandler<UploadMainPhotosForPostForSpecificBlogCommand>{
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected googleStorageService: GoogleStorageService,
    protected postsMainPhotoRepository: PostMainPhotosRepository,
    protected postQueryRepository: PostsQueryRepository,
    protected common: Common,
  ) {

  }
  async execute(command : UploadMainPhotosForPostForSpecificBlogCommand) : Promise<PostImagesViewModel> {

    const middleFile = await sharp(command.fileBuffer)
      .resize(mainPostPhotosEnum.widthOfMiddleImage, mainPostPhotosEnum.heightOfMiddleImage)
      .toBuffer()
    const smallFile = await sharp(command.fileBuffer)
      .resize(mainPostPhotosEnum.widthOfSmallImage, mainPostPhotosEnum.heightOfSmallImage)
      .toBuffer()

    const uploadedOriginalFile = await this.googleStorageService
      .uploadFile(command.fileType, command.fileBuffer, `Original_${command.fileName}`)
    const uploadedMiddleFile = await this.googleStorageService
      .uploadFile(command.fileType, middleFile, `Middle_${command.fileName}`)
    const uploadedSmallFile = await this.googleStorageService
      .uploadFile(command.fileType, smallFile, `Small_${command.fileName}`)

    console.log(uploadedOriginalFile, " uploadedFile");
    console.log(uploadedMiddleFile, " uploadedFile");
    console.log(uploadedSmallFile, " uploadedFile");
    const [urlOfOriginalFile, urlOfMiddleFile, urlOfSmallFile] = await Promise.all([
      this.googleStorageService.getPublicUrl(uploadedOriginalFile),
      this.googleStorageService.getPublicUrl(uploadedMiddleFile),
      this.googleStorageService.getPublicUrl(uploadedSmallFile)
    ])
    /*const urlOfOriginalFile = await this.googleStorageService.getPublicUrl(uploadedOriginalFile)
    const urlOfMiddleFile = await this.googleStorageService.getPublicUrl(uploadedOriginalFile)
    const urlOfSmallFile = await this.googleStorageService.getPublicUrl(uploadedOriginalFile)*/
    console.log(urlOfOriginalFile , " urlOfOriginalFile");
    console.log(urlOfMiddleFile , " urlOfMiddleFile");
    console.log(urlOfSmallFile , " urlOfSmallFile");

    const postsMain : PostMainPhotoEntity[] = await Promise.all([
       PostMainPhotoEntity.create({fileBuffer : command.fileBuffer, url : urlOfOriginalFile}),
       PostMainPhotoEntity.create({fileBuffer : middleFile, url : urlOfMiddleFile}),
       PostMainPhotoEntity.create({fileBuffer : smallFile, url : urlOfSmallFile}),
  ])
    await this.postsMainPhotoRepository.saveMainToDB(postsMain)
    console.log(command.post , " blog");
    const postWithUpdatedMain = APIPost.updateMain(command.post, postsMain)
    await this.postQueryRepository.savePostToDB(postWithUpdatedMain)
    console.log(postWithUpdatedMain, " blogWithUpdatedMain");

    return PostImagesViewModel.getViewModel(postWithUpdatedMain.main)



  }
}