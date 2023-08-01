import sharp from "sharp";
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { randomUUID } from "crypto";
import { Blog } from "../blog-entity";

@Entity({ database: "tfaepjvr" })
export class BlogWallpaperPhotoEntity {
  @PrimaryColumn({type : 'varchar'})
  id: string
  @Column({type : 'varchar', nullable : true})
  url:	string | null
  @Column({type : 'integer', nullable : true})
  width:	number | null // In pixels
  @Column({type : 'integer', nullable : true})
  height:	number | null //  In pixels
  @Column({type : 'integer', nullable : true})
  fileSize : 	number | null //   In bytes



  static async create(param: { fileBuffer: Buffer; url: string }) {
    const image = new BlogWallpaperPhotoEntity()
    const metadata = await sharp(param.fileBuffer).metadata()
    image.id = randomUUID()
    image.url = param.url
    image.width = metadata.width
    image.height = metadata.height
    image.fileSize = metadata.size
    return image
  }

  static createEmptyPhoto() {
    const image = new BlogWallpaperPhotoEntity()
    image.id = randomUUID()
    image.url = null
    image.width = null
    image.height = null
    image.fileSize = null
    return image
  }
}