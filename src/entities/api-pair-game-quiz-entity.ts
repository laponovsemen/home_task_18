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
import {APIQuizQuestionAnswer} from "./api-quiz-question-answer-entity";









@Entity({ database: "tfaepjvr" })
export class PairGameQuiz {
    @PrimaryColumn({type : 'uuid'})
    id: string;
    @ManyToOne(() => User, u => u.gameAsFirstPlayer)
    @JoinColumn()
    firstPlayer : User

    @ManyToMany(() => APIQuizQuestionAnswer, q => q.games)
    @JoinColumn()
    answersOfFirstUser : APIQuizQuestionAnswer[]

    @Column()
    firstPlayerScore : number

    @ManyToOne(() => User, u => u.gameAsSecondPlayer)
    @JoinColumn()
    secondPlayer : User

    @ManyToMany(() => APIQuizQuestionAnswer, q => q.games)
    @JoinColumn()
    answersOfSecondUser : APIQuizQuestionAnswer[]

    @Column()
    secondPlayerScore : number

    @ManyToMany(() => APIQuizQuestion, q => q.games)
    @JoinColumn()
    questions : APIQuizQuestion[]

    @Column({
        type : 'enum',
        enum: GameStatuses,
        nullable: false,
    })
    status: GameStatuses;

    @Column({nullable : false})
    pairCreatedDate	: string;  //Date when first player initialized the pair

    @Column({nullable : true})
    startGameDate	: string; //Game starts immediately after second player connection to this pair

    @Column({nullable : true})
    finishGameDate	: string; //Game finishes immediately after both players have answered all the questions




    static create(DTO: CommentForSpecifiedPostDTO, user: any, post: any) {
        const newPairGameQuiz = new PairGameQuiz()
        newPairGameQuiz.id = randomUUID()

        return newPairGameQuiz
    }


}


