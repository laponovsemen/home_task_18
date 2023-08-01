import sharp from "sharp";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { randomUUID } from "crypto";
import { Blog } from "../blog-entity";

@Entity({ database: "tfaepjvr" })
export class BlogMainPhotoEntity {
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
  @ManyToOne(() => Blog, blog => blog.main, {onDelete: "SET NULL"})
  blog : Blog

  static async create(param: { fileBuffer: Buffer; url: string }) {
    const imageOriginal = new BlogMainPhotoEntity()
    const metadata = await sharp(param.fileBuffer).metadata()
    imageOriginal.id = randomUUID()
    imageOriginal.url = param.url
    imageOriginal.width = metadata.width
    imageOriginal.height = metadata.height
    imageOriginal.fileSize = metadata.size
    return imageOriginal
  }
}