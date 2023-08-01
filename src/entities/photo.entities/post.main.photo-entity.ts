import sharp from "sharp";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { randomUUID } from "crypto";
import { Blog } from "../blog-entity";
import { APIPost } from "../api-post-entity";

@Entity({ database: "tfaepjvr" })
export class PostMainPhotoEntity {
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
  @ManyToOne(() => APIPost, post => post.main, {onDelete: "SET NULL"})
  post : APIPost

  static async create(param: { fileBuffer: Buffer; url: string }) {
    const imageOriginal = new PostMainPhotoEntity()
    const metadata = await sharp(param.fileBuffer).metadata()
    imageOriginal.id = randomUUID()
    imageOriginal.url = param.url
    imageOriginal.width = metadata.width
    imageOriginal.height = metadata.height
    imageOriginal.fileSize = metadata.size
    return imageOriginal
  }
}