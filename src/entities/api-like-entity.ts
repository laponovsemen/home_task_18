import {ObjectId} from "mongodb";
import {parentTypeEnum, StatusTypeEnum} from "../mongo/mongooseSchemas";
import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {APIPost} from "./api-post-entity";
import {APIComment} from "./api-comment-entity";
import {User} from "./user-entity";
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
}