import sharp from "sharp";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { randomUUID } from "crypto";

@Entity({ database: "tfaepjvr" })
export class PhotoEntity {
  @PrimaryColumn()
  id: string
  @Column()
  url:	string
  @Column()
  width:	number // In pixels
  @Column()
  height:	number //  In pixels
  @Column()
  fileSize : 	number //   In bytes
  static async create(param: { fileBuffer: Buffer; url: string }) {
    const image = new PhotoEntity()
    const metadata = await sharp(param.fileBuffer).metadata()
    image.id = randomUUID()
    image.url = param.url
    image.width = metadata.width
    image.height = metadata.height
    image.fileSize = metadata.size
    return image
  }
}