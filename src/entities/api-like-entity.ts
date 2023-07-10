import {parentTypeEnum, StatusTypeEnum} from "../mongo/mongooseSchemas";
import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {APIPost} from "./api-post-entity";
import {APIComment} from "./api-comment-entity";
import {User} from "./user-entity";
import {LikeStatusDTO} from "../input.classes";
import {randomUUID} from "crypto";

@Entity({ database: "tfaepjvr" })
export class APILike{
    @PrimaryColumn('uuid')
    id: string;
    @Column({
        type: 'enum',
        enum: parentTypeEnum,
    })
    parentType :parentTypeEnum
    @Column()
    addedAt : string
    @Column()
    status : StatusTypeEnum
    @Column()
    isHiden : boolean

    @ManyToOne(() => APIPost, p => p.likes, {onDelete : 'SET NULL'})
    @JoinColumn()
    post : APIPost

    @ManyToOne(() => APIComment, c => c.likes, {onDelete : 'SET NULL'})
    @JoinColumn()
    comment : APIComment
    @ManyToOne(() => User,  {onDelete : 'SET NULL'})
    @JoinColumn()
    user : User

    static create(DTO: LikeStatusDTO) {
        
    }

    static createPost(DTO: LikeStatusDTO, user : User, post : APIPost) {
        const newLikeForPost = new APILike()

        newLikeForPost.id = randomUUID()
        newLikeForPost.parentType = parentTypeEnum.post
        newLikeForPost.addedAt = new Date().toISOString()
        newLikeForPost.status = DTO.likeStatus
        newLikeForPost.isHiden = false
        newLikeForPost.post = post
        newLikeForPost.user = user

        return newLikeForPost
    }

    static createLikeForComment(user: User, comment: APIComment, status: StatusTypeEnum) {
        const newLikeForComment = new APILike()

        newLikeForComment.id = randomUUID()
        newLikeForComment.parentType = parentTypeEnum.comment
        newLikeForComment.addedAt = new Date().toISOString()
        newLikeForComment.status = status
        newLikeForComment.isHiden = false
        newLikeForComment.comment = comment
        newLikeForComment.user = user

        return newLikeForComment
    }
}