import {Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Blog} from "./blog-entity";
import {PostDTO} from "../input.classes";
import {APIComment} from "./api-comment-entity";
import {APILike} from "./api-like-entity";



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

    @Column()
    blogId: string;
    @Column()
    blogName: string;
    @Column({type : "varchar"})
    createdAt: string;
    @Column()
    isHiden: boolean;

    @OneToMany(() => APIComment, c => c.post, {onDelete : 'SET NULL'})
    comments : APIComment[]
    @OneToMany(() => APILike, l => l.post, {onDelete : 'SET NULL'})
    likes : APILike[]



    getViewModel(){
        return {
            title : this.title,

        }
    }
    static create(postDTO : PostDTO, blogName : string) {
        const newPost = new APIPost()
        newPost.title = postDTO.title
        newPost.shortDescription = postDTO.shortDescription
        newPost.content = postDTO.content
        newPost.blogId = postDTO.blogId
        newPost.blogName = blogName
        newPost.createdAt = new Date().toISOString()
        newPost.isHiden = false

        return newPost
    }
}