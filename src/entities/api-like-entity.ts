import {ObjectId} from "mongodb";
import {parentTypeEnum, StatusTypeEnum} from "../mongo/mongooseSchemas";
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {APIPost} from "./api-post-entity";
import {APIComment} from "./api-comment-entity";
@Entity({ database: "tfaepjvr" })
export class APILike{
    @PrimaryGeneratedColumn()
    id?: ObjectId;
    parentId : ObjectId
    parentType :parentTypeEnum
    addedAt : Date
    userId : ObjectId
    login : string
    status : StatusTypeEnum
    isHiden : boolean

    @ManyToOne(() => APIPost, p => p.likes, {onDelete : 'SET NULL'})
    post : APIPost

    @ManyToOne(() => APIComment, c => c.likes, {onDelete : 'SET NULL'})
    comment : APIComment
}