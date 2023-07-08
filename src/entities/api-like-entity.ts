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
        const newUser = new APILike()

        newUser.id = randomUUID()
        newUser.parentType = parentTypeEnum.post
        newUser.addedAt = new Date().toISOString()
        newUser.status = DTO.likeStatus
        newUser.isHiden = false
        newUser.post = post
        newUser.user = user

        return newUser
    }
}