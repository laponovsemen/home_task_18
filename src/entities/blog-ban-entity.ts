import {ObjectId} from "mongodb";
import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Blog} from "./blog-entity";
import {randomUUID} from "crypto";
import {BanBlogDTO} from "../input.classes";

@Entity({ database: "tfaepjvr" })
export class BlogBan {
    @PrimaryColumn('uuid')
    id: string;
    @Column({nullable : true})
    isBanned : boolean
    @Column({nullable : true})
    banDate: string




    static create() {
        const newBan = new BlogBan()
        newBan.id = randomUUID()
        newBan.isBanned = false
        newBan.banDate = null

        return newBan
    }
}