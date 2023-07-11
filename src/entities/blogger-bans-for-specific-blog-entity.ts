import {ObjectId} from "mongodb";
import {Column, Entity, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Blog} from "./blog-entity";
import {User} from "./user-entity";
import {BanUserByBloggerDTO} from "../input.classes";
import {randomUUID} from "crypto";



@Entity({ database: "tfaepjvr" })
export class BloggerBansForSpecificBlog {
    @PrimaryColumn('uuid')
    id: string;
    @ManyToOne(() => User, {onDelete: 'SET NULL', nullable : true})
    owner : User

    @ManyToOne(() => Blog, {onDelete: 'SET NULL', nullable : true})
    blog : Blog

    @Column()
    banDate: string | null;
    @Column()
    createdAt: string ;
    @Column()
    banReason: String | null;
    @Column()
    isBanned: boolean;
    @ManyToOne(() => User, {onDelete: 'SET NULL', nullable : true})
    bannedUser : User



    static create(owner : User, bannedUser: User, blog: Blog, DTO: BanUserByBloggerDTO) {
        const newBanForSpecificBlog = new  BloggerBansForSpecificBlog()

        newBanForSpecificBlog.id = randomUUID()
        newBanForSpecificBlog.blog = blog
        newBanForSpecificBlog.banDate = new Date().toISOString()
        newBanForSpecificBlog.createdAt = new Date().toISOString()
        newBanForSpecificBlog.owner = owner
        newBanForSpecificBlog.banReason = DTO.banReason
        newBanForSpecificBlog.isBanned = DTO.isBanned
        newBanForSpecificBlog.bannedUser = bannedUser

        return newBanForSpecificBlog
    }
}