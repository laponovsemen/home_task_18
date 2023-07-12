import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {parentTypeEnum, StatusTypeEnum} from "../mongo/mongooseSchemas";
import {APIPost} from "./api-post-entity";
import {APIComment} from "./api-comment-entity";
import {User} from "./user-entity";
import {LikeStatusDTO, PublishedDTO, QuizDTO} from "../input.classes";
import {randomUUID} from "crypto";

@Entity({ database: "tfaepjvr" })
export class APIQuizQuestion{
    @PrimaryColumn('uuid')
    id: string;
    @Column({type : 'varchar', nullable : true})
    body : string // Text of question, for example: How many continents are there?

    @Column({type : 'varchar', array: true, nullable : true})
    correctAnswers : string[] // All variants of possible correct answers for current questions Examples: ['6', 'six', 'шесть', 'дофига'] In Postgres save this data in JSON column


    @Column({ type : 'boolean', default : false})
    published : boolean // If question is completed and can be used in the Quiz game


    @Column({ type : 'varchar'})
    createdAt	 : string
    @Column({ type : 'varchar'})
    updatedAt	: string


    static create(DTO: QuizDTO) {
        const newAPIQuizQuestion = new APIQuizQuestion()
        const dateOfCreation = new Date().toISOString()

        newAPIQuizQuestion.id = randomUUID()
        newAPIQuizQuestion.body = DTO.body
        newAPIQuizQuestion.correctAnswers = DTO.correctAnswers
        newAPIQuizQuestion.published = false
        newAPIQuizQuestion.createdAt = dateOfCreation
        newAPIQuizQuestion.updatedAt = dateOfCreation

        return newAPIQuizQuestion
    }

    static createToUpdate(DTO: QuizDTO, presentQuizQuestion: APIQuizQuestion) {
        const newAPIQuizQuestionToUpdate = new APIQuizQuestion()


        newAPIQuizQuestionToUpdate.body = DTO.body
        newAPIQuizQuestionToUpdate.correctAnswers = DTO.correctAnswers
        newAPIQuizQuestionToUpdate.published = presentQuizQuestion.published
        newAPIQuizQuestionToUpdate.createdAt = presentQuizQuestion.createdAt
        newAPIQuizQuestionToUpdate.updatedAt = new Date().toISOString()

        return newAPIQuizQuestionToUpdate
    }

    static createToPublish(publishedDTO: PublishedDTO, foundQuestion: APIQuizQuestion) {
        const newAPIQuizQuestionToPublish = new APIQuizQuestion()

        newAPIQuizQuestionToPublish.body = foundQuestion.body
        newAPIQuizQuestionToPublish.correctAnswers = foundQuestion.correctAnswers
        newAPIQuizQuestionToPublish.published = publishedDTO.published
        newAPIQuizQuestionToPublish.createdAt = foundQuestion.createdAt
        newAPIQuizQuestionToPublish.updatedAt = new Date().toISOString()

        return newAPIQuizQuestionToPublish
    }
}