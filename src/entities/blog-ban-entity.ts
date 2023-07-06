import {ObjectId} from "mongodb";
import {Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Blog} from "./blog-entity";
import {randomUUID} from "crypto";
import {BanBlogDTO} from "../input.classes";

@Entity({ database: "tfaepjvr" })
export class BlogBan {
    @PrimaryColumn()
    id: string;
    @Column()
    isBanned : boolean
    @Column()
    banDate: string
    @OneToOne(() => Blog,(blog) => blog.blogBan, {onDelete : 'SET NULL'})
    blog : Blog

    static create(DTO : BanBlogDTO, blog : Blog) {
        const newBan = new BlogBan()
        newBan.id = randomUUID()
        newBan.isBanned = DTO.isBanned
        newBan.banDate = new Date().toISOString()
        newBan.blog = blog
        return newBan

    }
}