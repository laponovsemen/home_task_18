import sharp from "sharp";
import { PhotoEntity } from "../../entities/photo-entity";

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

    static getViewModel(photo: PhotoEntity) {

      const image = new PhotoSizeViewModel()
      image.url = photo.url
      image.width = photo.width
      image.height = photo.height
      image.fileSize = photo.fileSize
      return image
    }
}