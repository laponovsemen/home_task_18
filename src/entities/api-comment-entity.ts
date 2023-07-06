import {Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {APIPost} from "./api-post-entity";
import {APILike} from "./api-like-entity";
import {CommentForSpecifiedPostDTO} from "../input.classes";
import {randomUUID} from "crypto";
import {User} from "./user-entity";


@Entity({ database: "tfaepjvr" })
export class APIComment {
    @PrimaryColumn()
    id: string;
    @Column()
    content: string;

    @Column()
    login: string
    @Column()
    createdAt: string;

    @Column()
    isHiden : boolean

    @ManyToOne(() => APIPost, p => p.comments, {onDelete : 'SET NULL'})
    post : APIPost

    @ManyToOne(() => User, u => u.comments, {onDelete : 'SET NULL'})
    commentator : User



    @OneToMany(() => APILike, l => l.comment, {onDelete : 'SET NULL'})
    likes : APILike[]

    static create(DTO: CommentForSpecifiedPostDTO, user: any, post: any) {
        const newComment = new APIComment()
        newComment.id = randomUUID()
        newComment.content = DTO.content
        newComment.commentator = user
        newComment.login = user.login
        newComment.post = post
        newComment.createdAt = new Date().toISOString()
        newComment.isHiden = false

        return newComment
    }

    static getViewModelOfComment(comment: APIComment) {
        return {
            "id": comment.id,
            "content": comment.content,
            "commentatorInfo": {
                "userId": comment.commentator.id,
                "userLogin": comment.commentator.login
            },
            "createdAt": comment.createdAt,
            "likesInfo": {
                "likesCount": 0,
                "dislikesCount": 0,
                "myStatus": "None"
            },
            "postInfo": {
                "id": comment.post.id,
                "title": comment.post.title,
                "blogId": comment.post.blog.id,
                "blogName": comment.post.blog.name
            }
        }
    }
}