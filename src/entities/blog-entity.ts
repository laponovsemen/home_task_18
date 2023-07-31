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
import { PhotoEntity } from "./photo-entity";

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
    @Column('varchar', {
        array : true,
        nullable : true
    })
    main: string[];
    @Column({nullable : true})
    wallpaper: string | null;


    @OneToMany(() => APIPost, p => p.blog)
    @JoinColumn()
    posts : APIPost[]

    static create(DTO: BlogDTO, blogOwner: User, newBanWithEmptyFields : BlogBan) {
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
        newBlog.wallpaper = null

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

    static updateWallpaper(blog: Blog, blogsWallpaper: PhotoEntity) {
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
        newBlogToUpdate.wallpaper = blogsWallpaper.id

        return newBlogToUpdate
    }
}