import {ObjectId} from "mongodb";
import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Blog} from "./blog-entity";

@Entity({ database: "tfaepjvr" })
export class BlogBan {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    isBanned : boolean
    @Column()
    banDate: string
    @OneToOne(() => Blog,(blog) => blog.blogBan, {onDelete : 'SET NULL'})
    blog : Blog
}