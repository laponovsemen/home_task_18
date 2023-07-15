import {
    Column,
    Entity,
    JoinColumn, JoinTable,
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
    @ManyToOne(() => User, u => u.gameAsFirstPlayer, {nullable : true, onDelete : 'SET NULL'})
    @JoinColumn()
    firstPlayer : User

    @OneToMany(() => APIQuizQuestionAnswer, qqa => qqa.gameOfFirstUser)
    answersOfFirstUser : APIQuizQuestionAnswer[]

    @Column()
    firstPlayerScore : number

    @ManyToOne(() => User, u => u.gameAsSecondPlayer, {nullable : true, onDelete : 'SET NULL'})
    @JoinColumn()
    secondPlayer : User

    @OneToMany(() => APIQuizQuestionAnswer, qqa => qqa.gameOfSecondUser, )
    answersOfSecondUser : APIQuizQuestionAnswer[]

    @Column()
    secondPlayerScore : number

    @Column('varchar', {
        array : true,
        nullable : true
    })
    questions : string[]

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




    static create( user: User, randomlyGeneratedFiveQuestionsIds : string[]) {
        const newPairGameQuiz = new PairGameQuiz()

        newPairGameQuiz.id = randomUUID()
        newPairGameQuiz.firstPlayer = user
        newPairGameQuiz.answersOfFirstUser  = []
        newPairGameQuiz.firstPlayerScore = 0

        newPairGameQuiz.secondPlayer = null
        newPairGameQuiz.answersOfSecondUser = []
        newPairGameQuiz.secondPlayerScore = 0

        newPairGameQuiz.questions = randomlyGeneratedFiveQuestionsIds
        newPairGameQuiz.status =  GameStatuses.PendingSecondPlayer;

        newPairGameQuiz.pairCreatedDate	= new Date().toISOString();  //Date when first player initialized the pair
        newPairGameQuiz.startGameDate = null; //Game starts immediately after second player connection to this pair
        newPairGameQuiz.finishGameDate = null; //Game finishes immediately after both players have answered all the questions

        return newPairGameQuiz
    }



    static addSecondUser(gameWithPengingSecondUser: PairGameQuiz, user: User) {
        const newPairGameQuizWithAddedSecondUser = new PairGameQuiz()

        newPairGameQuizWithAddedSecondUser.id = gameWithPengingSecondUser.id
        newPairGameQuizWithAddedSecondUser.firstPlayer = gameWithPengingSecondUser.firstPlayer
        newPairGameQuizWithAddedSecondUser.answersOfFirstUser  = gameWithPengingSecondUser.answersOfFirstUser
        newPairGameQuizWithAddedSecondUser.firstPlayerScore = gameWithPengingSecondUser.firstPlayerScore

        newPairGameQuizWithAddedSecondUser.secondPlayer = user
        newPairGameQuizWithAddedSecondUser.answersOfSecondUser = gameWithPengingSecondUser.answersOfSecondUser
        newPairGameQuizWithAddedSecondUser.secondPlayerScore = gameWithPengingSecondUser.secondPlayerScore

        newPairGameQuizWithAddedSecondUser.questions = gameWithPengingSecondUser.questions
        newPairGameQuizWithAddedSecondUser.status =  GameStatuses.Active;

        newPairGameQuizWithAddedSecondUser.pairCreatedDate	= gameWithPengingSecondUser.pairCreatedDate;  //Date when first player initialized the pair
        newPairGameQuizWithAddedSecondUser.startGameDate = new Date().toISOString(); //Game starts immediately after second player connection to this pair
        newPairGameQuizWithAddedSecondUser.finishGameDate = null; //Game finishes immediately after both players have answered all the questions

        return newPairGameQuizWithAddedSecondUser
    }
}


