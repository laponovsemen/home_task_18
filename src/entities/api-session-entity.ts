import {SchemaFactory} from "@nestjs/mongoose";
import {ObjectId} from "mongodb";
import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user-entity";
import {randomUUID} from "crypto";


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

    static create(Obj: { ip: string; title: string; userId: string;deviceId : string; refreshToken: string }) {
        const newSession = new APISession()
        newSession.id = Obj.deviceId
        newSession.lastActiveDate = new Date().toISOString()
        newSession.ip = Obj.ip
        newSession.title = Obj.title
        newSession.userId = Obj.userId
        newSession.refreshToken = Obj.refreshToken
        return newSession


    }
}