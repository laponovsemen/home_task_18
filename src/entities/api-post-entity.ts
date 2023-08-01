import {Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Blog} from "./blog-entity";
import {PostDTO} from "../input.classes";
import {APIComment} from "./api-comment-entity";
import {APILike} from "./api-like-entity";
import {randomUUID} from "crypto";
import { PostMainPhotoEntity } from "./photo.entities/post.main.photo-entity";



@Entity({ database: "tfaepjvr" })
export class APIPost {
    @PrimaryColumn('uuid')
    id : string;
    @Column()
    title: string; //    maxLength: 30
    @Column()
    shortDescription: string; //maxLength: 100
    @Column()
    content: string; // maxLength: 1000
    @ManyToOne(() => Blog, b => b.posts, {onDelete : 'SET NULL'})
    blog : Blog

    @Column({type : "varchar"})
    createdAt: string;
    @Column()
    isHiden: boolean;
    @OneToMany(() => PostMainPhotoEntity, main => main.post, {onDelete : "SET NULL"})
    main: PostMainPhotoEntity[];

    @OneToMany(() => APIComment, c => c.post, {onDelete : 'SET NULL'})
    comments : APIComment[]
    @OneToMany(() => APILike, l => l.post, {onDelete : 'SET NULL'})
    likes : APILike[]



    getViewModel(){
        return {
            title : this.title,

        }
    }
    static create(postDTO : PostDTO, blog : any) {
        const newPost = new APIPost()
        newPost.id = randomUUID()
        newPost.title = postDTO.title
        newPost.shortDescription = postDTO.shortDescription
        newPost.content = postDTO.content
        newPost.blog = blog
        newPost.createdAt = new Date().toISOString()
        newPost.isHiden = false
        newPost.main = []

        return newPost
    }

    static createToUpdate(foundPostQuery: APIPost, DTO: PostDTO) {
        const newPostToUpdate = new APIPost()
        newPostToUpdate.id = foundPostQuery.id
        newPostToUpdate.title = DTO.title
        newPostToUpdate.shortDescription = DTO.shortDescription
        newPostToUpdate.content = DTO.content
        newPostToUpdate.blog = foundPostQuery.blog
        newPostToUpdate.createdAt = foundPostQuery.createdAt
        newPostToUpdate.isHiden = foundPostQuery.isHiden

        return newPostToUpdate
    }

    static updateMain(post: APIPost, postsMain: PostMainPhotoEntity[]) {
        const newPostToUpdate = new APIPost()
        //const main = blog.main
        //main.push(blogsMain)
        newPostToUpdate.id = post.id
        newPostToUpdate.title = post.title
        newPostToUpdate.blog = post.blog
        newPostToUpdate.likes = post.likes
        newPostToUpdate.comments = post.comments
        newPostToUpdate.createdAt = post.createdAt
        newPostToUpdate.content = post.content
        newPostToUpdate.shortDescription = post.shortDescription
        newPostToUpdate.main = postsMain


        return newPostToUpdate
    }
}