import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn} from "typeorm";
import {Blog} from "./blog-entity";
import {UserDTO} from "../input.classes";
import add from "date-fns/add";
import {randomUUID} from "crypto";
import {APISession} from "./api-session-entity";
import {APIComment} from "./api-comment-entity";
import {PairGameQuiz} from "./api-pair-game-quiz-entity";
import {APIQuizQuestionAnswer} from "./api-quiz-question-answer-entity";

@Entity({ database: "tfaepjvr" })
export class User {
    @PrimaryColumn('uuid')
    id: string;
    @Column({type: 'varchar', collation: 'C', unique: true, nullable: false})
    login: string;
    @Column()
    email: string;
    @Column()
    password: string
    @Column()
    createdAt: string
    @Column()
    isConfirmed: boolean;
    @Column({nullable : true})
    code: string ;
    @Column({nullable : true})
    codeDateOfExpiary: string | null;
    @Column({nullable : true})
    banDate: string | null
    @Column({nullable : true})
    banReason: string | null
    @Column()
    isBanned: boolean
    @OneToMany(() => Blog, (blog) => blog.blogOwner)
    blogs : Blog[]

    @OneToMany(() => APISession, (session) => session.user)
    session : APISession[]

    @OneToMany(() => APIComment, (comment) => comment.commentator)
    comments : APIComment[]

    @OneToMany(() => PairGameQuiz, g => g.firstPlayer)
    @JoinColumn()
    gameAsFirstPlayer : PairGameQuiz

    @OneToMany(() => PairGameQuiz, g => g.secondPlayer)
    @JoinColumn()
    gameAsSecondPlayer : PairGameQuiz

    @OneToMany(() => APIQuizQuestionAnswer, g => g.answerer)
    @JoinColumn()
    answers : APIQuizQuestionAnswer[]



    static createAsAdmin(DTO: UserDTO) {
        const newUser = new User()

        newUser.id = randomUUID()
        newUser.login = DTO.login
        newUser.password = DTO.password
        newUser.email = DTO.email
        newUser.createdAt = new Date().toISOString()
        newUser.isConfirmed = true
        newUser.code = null
        newUser.codeDateOfExpiary = null
        newUser.banDate = null
        newUser.banReason = null
        newUser.isBanned = false

        return newUser
    }

    static createUnconfirmedUser(login: string, password: string, email: string, code : string) {
        const newUser = new User()

        const dateOfCreation = new Date()

        newUser.id = randomUUID()
        newUser.login = login
        newUser.password = password
        newUser.email = email
        newUser.createdAt = dateOfCreation.toISOString()
        newUser.isConfirmed = false
        newUser.code = code
        newUser.codeDateOfExpiary = add(dateOfCreation, {minutes: 10}).toISOString()
        newUser.banDate = null
        newUser.banReason = null
        newUser.isBanned = false

        return newUser
    }

    static getViewModelOfAllCommentsForSpecificUser(user: User) {

        const blogs = user.blogs
        /*{
            "id": "string",
            "content": "string",
            "commentatorInfo": {
            "userId": "string",
                "userLogin": "string"
        },
            "createdAt": "2023-07-06T12:36:55.205Z",
            "likesInfo": {
            "likesCount": 0,
                "dislikesCount": 0,
                "myStatus": "None"
        },
            "postInfo": {
            "id": "string",
                "title": "string",
                "blogId": "string",
                "blogName": "string"
        }
        }*/
    }
}