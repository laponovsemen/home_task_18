import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn
} from "typeorm";
import {APIPost} from "./api-post-entity";
import {APILike} from "./api-like-entity";
import {CommentForSpecifiedPostDTO} from "../input.classes";
import {randomUUID} from "crypto";
import {User} from "./user-entity";
import {APIQuizQuestion} from "./quiz-entity";
import {GameStatuses} from "../pair.quiz.game/view.model.classess/game.statuses.enum";
import {APIComment} from "./api-comment-entity";
import {AnswerStatuses} from "../pair.quiz.game/view.model.classess/answer.statuses.enum";
import {PairGameQuiz} from "./api-pair-game-quiz-entity";

@Entity({ database: "tfaepjvr" })
export class APIQuizQuestionAnswer {
    @PrimaryColumn({type : 'uuid'})
    id: string;
    @ManyToOne(() => PairGameQuiz, u => u.answersOfFirstUser)

    gameOfFirstUser : PairGameQuiz

    @ManyToOne(() => PairGameQuiz, u => u.answersOfSecondUser)

    gameOfSecondUser : PairGameQuiz


    @Column({
        type: 'enum',
        enum: AnswerStatuses
    })
    answerStatus : AnswerStatuses

    @ManyToOne(() => APIQuizQuestion, q => q.answers)
    @JoinColumn()
    question : APIQuizQuestion

    @Column({nullable : true})
    addedAt	: string; //Game finishes immediately after both players have answered all the questions




    static create(DTO: CommentForSpecifiedPostDTO, user: any, post: any) {
        const newAPIQuizQuestionAnswer = new APIQuizQuestionAnswer()
        newAPIQuizQuestionAnswer.id = randomUUID()

        return newAPIQuizQuestionAnswer
    }


}


