import sharp from "sharp";
import { BlogMainPhotoEntity } from "../../entities/photo.entities/blog.main.photo-entity";
import { BlogWallpaperPhotoEntity } from "../../entities/photo.entities/blog.wallpaper.photo-entity";
import { PostImagesViewModel } from "./post.images.view.model";
import { PostMainPhotoEntity } from "../../entities/photo.entities/post.main.photo-entity";

export class PhotoSizeViewModel {
    url:	string
    width:	number // In pixels

    height:	number //  In pixels

    fileSize : 	number //   In bytes
  static async create(param: { fileBuffer: Buffer; url: string }) {
      const image = new PhotoSizeViewModel()
      const metadata = await sharp(param.fileBuffer).metadata()
      image.url = param.url
      image.width = metadata.width
      image.height = metadata.height
      image.fileSize = metadata.size
      return image
  }

    static getViewModel(photo: BlogMainPhotoEntity) {

      const image = new PhotoSizeViewModel()
      image.url = photo.url
      image.width = photo.width
      image.height = photo.height
      image.fileSize = photo.fileSize
      return image
    }

  static getViewModelForPost(photo:  PostMainPhotoEntity) {

    const image = new PhotoSizeViewModel()
    image.url = photo.url
    image.width = photo.width
    image.height = photo.height
    image.fileSize = photo.fileSize
    return image
  }

  static getViewModelForWallpaper(blogsWallpaper: BlogWallpaperPhotoEntity) {
    const image = new PhotoSizeViewModel()
    image.url = blogsWallpaper.url
    image.width = blogsWallpaper.width
    image.height = blogsWallpaper.height
    image.fileSize = blogsWallpaper.fileSize
    return image
  }

  static getViewModelForMain(blogMain: BlogMainPhotoEntity) {
    const image = new PhotoSizeViewModel()
    image.url = blogMain.url
    image.width = blogMain.width
    image.height = blogMain.height
    image.fileSize = blogMain.fileSize
    return image
  }
}