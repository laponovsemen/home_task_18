import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import {parentTypeEnum, StatusTypeEnum} from "../mongo/mongooseSchemas";
import {APIPost} from "./api-post-entity";
import {APIComment} from "./api-comment-entity";
import {User} from "./user-entity";
import {LikeStatusDTO, PublishedDTO, QuizDTO} from "../input.classes";
import {randomUUID} from "crypto";
import {PairGameQuiz} from "./api-pair-game-quiz-entity";
import {APIQuizQuestionAnswer} from "./api-quiz-question-answer-entity";
import { PairGameQuizQuestion } from "../pair.quiz.game/view.model.classess/pair.game.quiz.question";

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



    @OneToMany(() => APIQuizQuestionAnswer, g => g.question, {onDelete : 'SET NULL'})
    answers : APIQuizQuestionAnswer[]

    @Column({ type : 'varchar'})
    createdAt	 : string
    @Column({ type : 'varchar', nullable : true})
    updatedAt	: string


    static create(DTO: QuizDTO) {
        const newAPIQuizQuestion = new APIQuizQuestion()
        const dateOfCreation = new Date().toISOString()

        newAPIQuizQuestion.id = randomUUID()
        newAPIQuizQuestion.body = DTO.body
        newAPIQuizQuestion.correctAnswers = DTO.correctAnswers
        newAPIQuizQuestion.published = false
        newAPIQuizQuestion.createdAt = dateOfCreation
        newAPIQuizQuestion.updatedAt = null

        return newAPIQuizQuestion
    }

    static createToUpdate(DTO: QuizDTO, presentQuizQuestion: APIQuizQuestion) {
        const newAPIQuizQuestionToUpdate = new APIQuizQuestion()


        newAPIQuizQuestionToUpdate.id = presentQuizQuestion.id
        newAPIQuizQuestionToUpdate.body = DTO.body
        newAPIQuizQuestionToUpdate.correctAnswers = DTO.correctAnswers
        newAPIQuizQuestionToUpdate.published = presentQuizQuestion.published
        newAPIQuizQuestionToUpdate.createdAt = presentQuizQuestion.createdAt
        newAPIQuizQuestionToUpdate.updatedAt = new Date().toISOString()

        return newAPIQuizQuestionToUpdate
    }

    static createToPublish(publishedDTO: PublishedDTO, foundQuestion: APIQuizQuestion) {
        const newAPIQuizQuestionToPublish = new APIQuizQuestion()
        newAPIQuizQuestionToPublish.id = foundQuestion.id
        newAPIQuizQuestionToPublish.body = foundQuestion.body
        newAPIQuizQuestionToPublish.correctAnswers = foundQuestion.correctAnswers
        newAPIQuizQuestionToPublish.published = publishedDTO.published
        newAPIQuizQuestionToPublish.createdAt = foundQuestion.createdAt
        newAPIQuizQuestionToPublish.updatedAt = new Date().toISOString()

        return newAPIQuizQuestionToPublish
    }

  static getViewModelForList(questionsList: APIQuizQuestion[]) {
        if(!questionsList || questionsList.length === 0){
            return questionsList
        } else {
            let array :PairGameQuizQuestion[] = []
            questionsList.forEach(item => { array.push(PairGameQuizQuestion.getViewModel(item))})
            return array
        }
  }
}