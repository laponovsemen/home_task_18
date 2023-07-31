import sharp from "sharp";

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
}