import {SchemaFactory} from "@nestjs/mongoose";
import {ObjectId} from "mongodb";
import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user-entity";


@Entity({ database: "tfaepjvr" })
export class APISession {
    @PrimaryColumn('uuid')
    id: string;
    @ManyToOne(() => User, u => u.session, {onDelete : 'SET NULL'})
    user : User
    @Column()
    userId: string;
    @Column()
    ip:	string // IP address of device during signing in
    @Column()
    title:	string // Device name: for example Chrome 105 (received by parsing http header "user-agent")
    @Column()
    lastActiveDate:	string // Date of the last generating of refresh/access tokens
    @Column()
    refreshToken: string;
}