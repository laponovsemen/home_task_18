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

    @ManyToMany(() => APIQuizQuestionAnswer, q => q.gamesOfFirstUser)
    @JoinColumn()
    answersOfFirstUser : APIQuizQuestionAnswer[]

    @Column()
    firstPlayerScore : number

    @ManyToOne(() => User, u => u.gameAsSecondPlayer)
    @JoinColumn()
    secondPlayer : User

    @ManyToMany(() => APIQuizQuestionAnswer, q => q.gamesOfSecondUser)
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




    static create( user: User, randomlyGeneratedFiveQuestions : APIQuizQuestion[]) {
        const newPairGameQuiz = new PairGameQuiz()

        newPairGameQuiz.id = randomUUID()
        newPairGameQuiz.firstPlayer = user
        newPairGameQuiz.answersOfFirstUser  = []
        newPairGameQuiz.firstPlayerScore = 0

        newPairGameQuiz.secondPlayer = null
        newPairGameQuiz.answersOfSecondUser = []
        newPairGameQuiz.secondPlayerScore = 0

        newPairGameQuiz.questions = randomlyGeneratedFiveQuestions
        newPairGameQuiz.status =  GameStatuses.PendingSecondPlayer;

        newPairGameQuiz.pairCreatedDate	= new Date().toISOString();  //Date when first player initialized the pair
        newPairGameQuiz.startGameDate = null; //Game starts immediately after second player connection to this pair
        newPairGameQuiz.finishGameDate = null; //Game finishes immediately after both players have answered all the questions

        return newPairGameQuiz
    }


}


