import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { randomUUID } from "crypto";
import { User } from "./user-entity";
import { GameStatuses } from "../pair.quiz.game/view.model.classess/game.statuses.enum";
import { APIQuizQuestionAnswer } from "./api-quiz-question-answer-entity";
import { userNumberInGame } from "../pair.quiz.game/view.model.classess/user.number.in.game.enum";


@Entity({ database: "tfaepjvr" })
export class PairGameQuiz {
    @PrimaryColumn({type : 'uuid'})
    id: string;
    @ManyToOne(() => User, u => u.gameAsFirstPlayer, {nullable : true, onDelete : 'SET NULL'})
    @JoinColumn()
    firstPlayer : User

    @OneToMany(() => APIQuizQuestionAnswer, qqa => qqa.gameOfFirstUser, {nullable : true, onDelete : 'SET NULL'})
    answersOfFirstUser : APIQuizQuestionAnswer[]

    @Column()
    firstPlayerScore : number

    @ManyToOne(() => User, u => u.gameAsSecondPlayer, {nullable : true, onDelete : 'SET NULL'})
    @JoinColumn()
    secondPlayer : User

    @OneToMany(() => APIQuizQuestionAnswer, qqa => qqa.gameOfSecondUser, {nullable : true, onDelete : 'SET NULL'} )
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




    static create( user: User) {
        const newPairGameQuiz = new PairGameQuiz()

        newPairGameQuiz.id = randomUUID()
        newPairGameQuiz.firstPlayer = user
        newPairGameQuiz.answersOfFirstUser  = []
        newPairGameQuiz.firstPlayerScore = 0

        newPairGameQuiz.answersOfSecondUser = []
        newPairGameQuiz.secondPlayerScore = 0

        newPairGameQuiz.questions = null
        newPairGameQuiz.status =  GameStatuses.PendingSecondPlayer;

        newPairGameQuiz.pairCreatedDate	= new Date().toISOString();  //Date when first player initialized the pair
        newPairGameQuiz.startGameDate = null; //Game starts immediately after second player connection to this pair
        newPairGameQuiz.finishGameDate = null; //Game finishes immediately after both players have answered all the questions

        return newPairGameQuiz
    }



    static addSecondUser(gameWithPengingSecondUser: PairGameQuiz, user: User,randomlyGeneratedFiveQuestionsIds : string[]) {
        const newPairGameQuizWithAddedSecondUser = new PairGameQuiz()

        newPairGameQuizWithAddedSecondUser.id = gameWithPengingSecondUser.id
        newPairGameQuizWithAddedSecondUser.firstPlayer = gameWithPengingSecondUser.firstPlayer
        newPairGameQuizWithAddedSecondUser.answersOfFirstUser  = gameWithPengingSecondUser.answersOfFirstUser
        newPairGameQuizWithAddedSecondUser.firstPlayerScore = gameWithPengingSecondUser.firstPlayerScore

        newPairGameQuizWithAddedSecondUser.secondPlayer = user
        newPairGameQuizWithAddedSecondUser.answersOfSecondUser = gameWithPengingSecondUser.answersOfSecondUser
        newPairGameQuizWithAddedSecondUser.secondPlayerScore = gameWithPengingSecondUser.secondPlayerScore

        newPairGameQuizWithAddedSecondUser.questions = randomlyGeneratedFiveQuestionsIds
        newPairGameQuizWithAddedSecondUser.status =  GameStatuses.Active;

        newPairGameQuizWithAddedSecondUser.pairCreatedDate	= gameWithPengingSecondUser.pairCreatedDate;  //Date when first player initialized the pair
        newPairGameQuizWithAddedSecondUser.startGameDate = new Date().toISOString(); //Game starts immediately after second player connection to this pair
        newPairGameQuizWithAddedSecondUser.finishGameDate = null; //Game finishes immediately after both players have answered all the questions

        return newPairGameQuizWithAddedSecondUser
    }

    static findoutNumberOfUser(user: User, gameWhichUserParticipateIn: PairGameQuiz) {
        if(gameWhichUserParticipateIn.firstPlayer.id === user.id){
            return userNumberInGame.first
        } else if(gameWhichUserParticipateIn.secondPlayer.id === user.id){
            return userNumberInGame.second
        } else {
            return userNumberInGame.none
        }
  }


    static getAnswersOfUserByQueue(numberOfUserInGame: userNumberInGame.first | userNumberInGame.second | userNumberInGame.none,
                                   gameWhichUserParticipateIn: PairGameQuiz) {
        if(numberOfUserInGame === userNumberInGame.first){
            return gameWhichUserParticipateIn.answersOfFirstUser
        } else {
            return gameWhichUserParticipateIn.answersOfSecondUser
        }
    }

    static getScoreOfUser(game : PairGameQuiz, numberOfUserInGame: userNumberInGame.first | userNumberInGame.second) {
        if(numberOfUserInGame === userNumberInGame.first){
            return  game.firstPlayerScore
        } else {
            return  game.secondPlayerScore
        }

    }

    static updateScore(oldGame: PairGameQuiz,
                       numberOfUserInGame: userNumberInGame.first | userNumberInGame.second,
                       newScore: number) {
        const newGameWhichUserParticipateIn = new PairGameQuiz()

        newGameWhichUserParticipateIn.id = oldGame.id
        newGameWhichUserParticipateIn.firstPlayer = oldGame.firstPlayer
        newGameWhichUserParticipateIn.secondPlayer = oldGame.secondPlayer


        if (numberOfUserInGame === userNumberInGame.first){
            newGameWhichUserParticipateIn.firstPlayerScore = newScore
            newGameWhichUserParticipateIn.secondPlayerScore = oldGame.secondPlayerScore
        } else {
            newGameWhichUserParticipateIn.firstPlayerScore = oldGame.firstPlayerScore
            newGameWhichUserParticipateIn.secondPlayerScore = newScore
        }

        newGameWhichUserParticipateIn.questions = oldGame.questions
        newGameWhichUserParticipateIn.status = oldGame.status
        newGameWhichUserParticipateIn.pairCreatedDate = oldGame.pairCreatedDate
        newGameWhichUserParticipateIn.startGameDate = oldGame.startGameDate
        newGameWhichUserParticipateIn.finishGameDate = oldGame.finishGameDate

        return newGameWhichUserParticipateIn
    }


  static checkForFinishingTheGame(gameWithUpdatedScore: PairGameQuiz) {
    if(gameWithUpdatedScore.secondPlayerScore === 5 && gameWithUpdatedScore.firstPlayerScore === 5){
        return  PairGameQuiz.finishGame(gameWithUpdatedScore)
    } else {
        return gameWithUpdatedScore
    }
  }

    private static finishGame(gameWithUpdatedScore: PairGameQuiz) {
        const finishedGame = new PairGameQuiz()
        let additionalMarkForFirstUser : number
        let additionalMarkForSecondUser : number
        if(gameWithUpdatedScore.answersOfFirstUser[4].addedAt < gameWithUpdatedScore.answersOfSecondUser[4].addedAt ){
            additionalMarkForFirstUser = 1
            additionalMarkForSecondUser = 0
        } else {
            additionalMarkForFirstUser = 0
            additionalMarkForSecondUser = 1
        }

        finishedGame.id = gameWithUpdatedScore.id
        finishedGame.firstPlayer = gameWithUpdatedScore.firstPlayer
        finishedGame.answersOfFirstUser  = gameWithUpdatedScore.answersOfFirstUser
        finishedGame.firstPlayerScore = gameWithUpdatedScore.firstPlayerScore + additionalMarkForFirstUser
        finishedGame.secondPlayer = gameWithUpdatedScore.secondPlayer
        finishedGame.answersOfSecondUser = gameWithUpdatedScore.answersOfSecondUser
        finishedGame.secondPlayerScore = gameWithUpdatedScore.secondPlayerScore+ additionalMarkForSecondUser

        finishedGame.questions = gameWithUpdatedScore.questions
        finishedGame.status =  GameStatuses.Finished;

        finishedGame.pairCreatedDate	= gameWithUpdatedScore.pairCreatedDate  //Date when first player initialized the pair
        finishedGame.startGameDate = gameWithUpdatedScore.startGameDate; //Game starts immediately after second player connection to this pair
        finishedGame.finishGameDate = new Date().toISOString();; //Game finishes immediately after both players have answered all the questions

        return finishedGame
    }
}


