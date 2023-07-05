import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {APIPost} from "./api-post-entity";
import {APILike} from "./api-like-entity";
import {CommentForSpecifiedPostDTO} from "../input.classes";
import {randomUUID} from "crypto";


@Entity({ database: "tfaepjvr" })
export class APIComment {
    @PrimaryGeneratedColumn()
    id?: string;
    @Column()
    content: string;
    @Column()
    commentatorId: string   ;
    @Column()
    login: string
    @Column()
    createdAt: string;

    @Column()
    isHiden : boolean

    @ManyToOne(() => APIPost, p => p.comments, {onDelete : 'SET NULL'})
    post : APIPost
    @Column()
    postId : string;


    @OneToMany(() => APILike, l => l.comment, {onDelete : 'SET NULL'})
    likes : APILike[]

    static create(DTO: CommentForSpecifiedPostDTO, user: any, postIdAsString: string) {
        const newComment = new APIComment()
        newComment.id = randomUUID()
        newComment.content = DTO.content
        newComment.commentatorId = user.id
        newComment.login = user.login
        newComment.postId = postIdAsString
        newComment.createdAt = new Date().toISOString()
        newComment.isHiden = false

        return newComment
    }
}