import {ObjectId} from "mongodb";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn
} from "typeorm";
import {BlogBan} from "./blog-ban-entity";
import {User} from "./user-entity";
import {Post} from "@nestjs/common";
import {APIPost} from "./api-post-entity";
import {BlogDTO} from "../input.classes";
import {randomUUID} from "crypto";
import { BlogMainPhotoEntity } from "./photo.entities/blog.main.photo-entity";
import { BlogWallpaperPhotoEntity } from "./photo.entities/blog.wallpaper.photo-entity";
import { APISubscriptionEntity } from "./api-subscription-entity";

@Entity({ database: "tfaepjvr" })
export class Blog {
    @PrimaryColumn('uuid')
    id: string;
    @Column({type : "varchar"})
    name: string;
    @Column()
    description: string;
    @Column()
    websiteUrl: string;
    @Column()
    isMembership: boolean;
    @Column()
    createdAt: string;
    @ManyToOne(() => User, (user) => user.blogs, )
    @JoinColumn()
    blogOwner: User

    @OneToOne(() => BlogBan, {onDelete: "SET NULL"})
    @JoinColumn()
    blogBan : BlogBan
    @OneToMany(() => BlogMainPhotoEntity, main => main.blog, {onDelete: "SET NULL"})
    @JoinColumn()
    main: BlogMainPhotoEntity[];
    @OneToOne(() => BlogWallpaperPhotoEntity, {onDelete: "SET NULL"})
    @JoinColumn()
    wallpaper: BlogWallpaperPhotoEntity

    @OneToMany(() => APIPost, p => p.blog)
    @JoinColumn()
    posts : APIPost[]
    @OneToMany(() => APISubscriptionEntity, subscribtion => subscribtion.blog)

    subscribtionOfBlog : APISubscriptionEntity[]

    static create(DTO: BlogDTO, blogOwner: User, newBanWithEmptyFields : BlogBan, wallpaper : BlogWallpaperPhotoEntity) {
        const newBlog = new Blog()

        newBlog.id = randomUUID()
        newBlog.name = DTO.name
        newBlog.description = DTO.description
        newBlog.websiteUrl = DTO.websiteUrl
        newBlog.isMembership = false
        newBlog.createdAt = new Date().toISOString()
        newBlog.blogOwner = blogOwner
        newBlog.blogBan = newBanWithEmptyFields
        newBlog.main = []
        newBlog.wallpaper = wallpaper

        return newBlog
    }

    static createToUpdate(DTO: BlogDTO, presentBlog: Blog) {
        const newBlogToUpdate = new Blog()
        newBlogToUpdate.id = presentBlog.id
        newBlogToUpdate.name = DTO.name
        newBlogToUpdate.description = DTO.description
        newBlogToUpdate.websiteUrl = DTO.websiteUrl
        newBlogToUpdate.isMembership = false
        newBlogToUpdate.createdAt = presentBlog.createdAt


        return newBlogToUpdate
    }

    static updateWallpaper(blog: Blog, blogsWallpaper: BlogWallpaperPhotoEntity) {
        const newBlogToUpdate = new Blog()
        newBlogToUpdate.id = blog.id
        newBlogToUpdate.name = blog.name
        newBlogToUpdate.description = blog.description
        newBlogToUpdate.websiteUrl = blog.websiteUrl
        newBlogToUpdate.isMembership = blog.isMembership
        newBlogToUpdate.createdAt = blog.createdAt
        newBlogToUpdate.blogBan = blog.blogBan
        newBlogToUpdate.posts = blog.posts
        newBlogToUpdate.blogOwner = blog.blogOwner
        newBlogToUpdate.main = blog.main
        newBlogToUpdate.wallpaper = blogsWallpaper

        return newBlogToUpdate
    }

    static updateMain(blog: Blog, blogsMain: BlogMainPhotoEntity) {
        const newBlogToUpdate = new Blog()
        const main = blog.main
        main.push(blogsMain)
        newBlogToUpdate.id = blog.id
        newBlogToUpdate.name = blog.name
        newBlogToUpdate.description = blog.description
        newBlogToUpdate.websiteUrl = blog.websiteUrl
        newBlogToUpdate.isMembership = blog.isMembership
        newBlogToUpdate.createdAt = blog.createdAt
        newBlogToUpdate.blogBan = blog.blogBan
        newBlogToUpdate.posts = blog.posts
        newBlogToUpdate.blogOwner = blog.blogOwner
        newBlogToUpdate.main = main
        newBlogToUpdate.wallpaper = blog.wallpaper

        return newBlogToUpdate
    }
}