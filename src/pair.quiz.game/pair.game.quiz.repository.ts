import { Common } from "../common";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Brackets, DataSource, QueryRunner, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PairGameQuiz } from "../entities/api-pair-game-quiz-entity";
import { GameStatuses } from "./view.model.classess/game.statuses.enum";
import { User } from "../entities/user-entity";
import { QuizQuestionsRepository } from "../quiz/sa.quiz.questions.repository";
import { AnswersInputModel } from "./view.model.classess/answers.input.model";
import { userNumberInGame } from "./view.model.classess/user.number.in.game.enum";
import { APIQuizQuestionAnswer } from "../entities/api-quiz-question-answer-entity";
import { APIQuizQuestion } from "../entities/quiz-entity";
import { AnswerStatuses } from "./view.model.classess/answer.statuses.enum";
import { PairGameQuizViewModel } from "./view.model.classess/pair.game.quiz.view.model";
import { AnswersViewModel } from "./view.model.classess/answers.view.model";
import { paginationGamesCriteriaType, paginationTopUsersCriteriaType, PaginatorViewModelType } from "../appTypes";
import { PairGameQuizQuestion } from "./view.model.classess/pair.game.quiz.question";
import { WithPlayerCredentials, WithPlayerRawCredentials } from "../mongo/mongooseSchemas";
import { StaticsViewModel } from "./view.model.classess/statistics.view.model";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class PairGameQuizRepository implements OnModuleInit{
    constructor(
        @InjectRepository(PairGameQuiz) protected pairGameQuizTypeORMRepository: Repository<PairGameQuiz>,
        protected quizQuestionsRepository: QuizQuestionsRepository,
        protected readonly dataSource: DataSource,
        protected readonly common: Common,
    ) {
    }

    async onModuleInit () {
        // const query = `
        //     select gamesCount, winsCount
        //     from (select cast(count(*) as integer) from pair_game_quiz where "firstPlayerId" = 'd5af8ddf-145d-4b58-9124-23fc14b08f89' or "secondPlayerId" = 'd5af8ddf-145d-4b58-9124-23fc14b08f89') as gamesCount
        //     from (select count("firstPlayerScores") from pair_game_quiz where "firstPlayerId" = 'd5af8ddf-145d-4b58-9124-23fc14b08f89' ) as winsCount
        // `
        /*const query = `
           select
           u."id",
           u."login",
        ((select cast(sum("firstPlayerScore") as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = u."id") 
        + 
        (select cast(sum("secondPlayerScore") as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = u."id"))
        as "sumScore"
        
        from "user" u
        left join "pair_game_quiz" fpg
        on fpg."firstPlayerId" = u."id"
        left join "pair_game_quiz" spg
        on spg."secondPlayerId" = u."id"
        
        group by u."id"
        order by 
        `

        const result = await this.dataSource.query(query)
        console.log(result, " result of sql query for getting statistics");*/
    }

    async deleteAllData() {
        await this.pairGameQuizTypeORMRepository.delete({})
    }


    async findGameWithPengingSecondUser() {


        return await this.pairGameQuizTypeORMRepository
            .findOne({
                where: {
                    status: GameStatuses.PendingSecondPlayer
                }
            })
    }

    async createNewGame(user: User) {
        const newGame = PairGameQuiz.create(user)
        console.log(newGame, " new game")
        return this.pairGameQuizTypeORMRepository.create(newGame);
    }

    async addSecondUserToPendingGame(gameWithPengingSecondUser: PairGameQuiz, user: User) {
        const fiveQuestions : string[] = await this.quizQuestionsRepository.generateFiveRandomQuestions() // how to generate
        const gameWithAddedSecondUser  = PairGameQuiz.addSecondUser(gameWithPengingSecondUser, user,fiveQuestions)
        return await this.pairGameQuizTypeORMRepository
          .save(gameWithAddedSecondUser)
    }

    async findGameByIdWhereUserIsParticipate(user: User, gameId: string) {
        const game : PairGameQuiz | null = await this.pairGameQuizTypeORMRepository
            .createQueryBuilder("game")
            .leftJoinAndSelect("game.firstPlayer", "firstUser")
            .leftJoinAndSelect("game.secondPlayer", "secondUser")
            .leftJoinAndSelect("game.answersOfFirstUser", "answersOfFirstUser")
            .leftJoinAndSelect("game.answersOfSecondUser", "answersOfSecondUser")
            .leftJoinAndSelect("answersOfFirstUser.question", "questionOne")
            .leftJoinAndSelect("answersOfSecondUser.question", "questionTwo")
            .where('game.id = :id', {
                id : gameId
            })
          .getOne()


        console.log(game, 'found game');
        if (!game) return null;
        const questionsList : APIQuizQuestion[] = await this.quizQuestionsRepository
          .findQuizQuestionsListByListOfIds(game.questions)

        const result : PairGameQuizViewModel = PairGameQuizViewModel.getViewModelForFront(game, questionsList)
        console.log(result);
        return result
    }

    async checkOfParticipatingUserInAnotherGame(user: User) : Promise<boolean> {
        const game = await this.pairGameQuizTypeORMRepository
            .createQueryBuilder("game")
            .where( new Brackets(qb => {
                    qb.where('game.status = :status', { status: GameStatuses.PendingSecondPlayer})
                        .orWhere('game.status = :status', { status: GameStatuses.Active});
                })
            )
            .andWhere(new Brackets(qb => {
                qb.where('game.firstPlayerId = :userId', { userId: user.id})
                    .orWhere('game.secondPlayerId = :userId', { userId: user.id});
            }))
            .getOne()

        console.log(await this.pairGameQuizTypeORMRepository.find({}), " all games in db");
        console.log(game, " game in checkOfParticipatingUserInAnotherGame")
        return !!game
    }

    async createOrConnectPair(user: User) : Promise<PairGameQuizViewModel> {
        const queryRunner : QueryRunner =  this.dataSource.createQueryRunner()
        let result
        let rawResult
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const pairGameQuizRepoFromQueryRunner = queryRunner.manager.getRepository(PairGameQuiz)
        try {
        //TODO FD
            const checkOfParticipatingInAnotherGame : PairGameQuiz
              = await pairGameQuizRepoFromQueryRunner
              .createQueryBuilder("game")
              .leftJoinAndSelect("game.firstPlayer", "firstPlayer")
              .leftJoinAndSelect("game.secondPlayer", "secondPlayer")
              /*.where( new Brackets(qb => {
                    qb.where("game.status = 'PendingSecondPlayer'")
                      .orWhere("game.status = 'Active'");
                })
              )*/
              .where( new Brackets(qb => {
                    qb.where(`game.status = '${GameStatuses.PendingSecondPlayer}'`)
                      .orWhere(`game.status = '${GameStatuses.Active}'`)
                })
              )
              .andWhere(new Brackets(qb => {
                  qb.where('game.firstPlayer.id = :userId', { userId: user.id})
                    .orWhere('game.secondPlayer.id = :userId', { userId: user.id});
              }))
              .getOne()

            //[{status:active, firtsId: id,}, { status: active, secondId: id }]

            console.log(checkOfParticipatingInAnotherGame, " checkOfParticipatingInAnotherGame")
            //check if user is participating in another game
            if (checkOfParticipatingInAnotherGame) return null;


            const gameWithPendingSecondUser : PairGameQuiz = await pairGameQuizRepoFromQueryRunner.findOne({
                relations : {
                  firstPlayer : true,
                  secondPlayer : true,
                  answersOfSecondUser :true,
                  answersOfFirstUser : true
                },
                  where: {
                      status: GameStatuses.PendingSecondPlayer
                  }
              })


            if (gameWithPendingSecondUser) {
                const fiveQuestions : string[] = await this.quizQuestionsRepository.generateFiveRandomQuestions()
                console.log(fiveQuestions, " fiveQuestions");
                const gameWithAddedSecondUser = PairGameQuiz.addSecondUser(gameWithPendingSecondUser, user, fiveQuestions)
                rawResult = await pairGameQuizRepoFromQueryRunner.save(gameWithAddedSecondUser)
            } else {

                const newGame = PairGameQuiz.create(user)
                console.log(newGame, " new game")
                rawResult = await pairGameQuizRepoFromQueryRunner.save(newGame);
                //console.log(p);
            }
            const questionsList : APIQuizQuestion[] = await this.quizQuestionsRepository
              .findQuizQuestionsListByListOfIds(rawResult.questions)
            result = PairGameQuizViewModel.getViewModelForFront(rawResult, questionsList)
            await queryRunner.commitTransaction()
            console.log(result, " result ");

        } catch (e) {
            console.log(" catch error")
            console.log(e)
            await queryRunner.rollbackTransaction()
        } finally {
            console.log(" finally")
            await queryRunner.release()
            // ask why it works if I don't use release transaction
        }
        return result
    }

    async findUnfinishedGameWhereUserParticipate(user: User) {
      const game = await this.pairGameQuizTypeORMRepository
        .createQueryBuilder("game")
        .leftJoinAndSelect("game.firstPlayer", "firstPlayer")
        .leftJoinAndSelect("game.secondPlayer", "secondPlayer")
        .leftJoinAndSelect("game.answersOfFirstUser", "answersOfFirstUser")
        .leftJoinAndSelect("game.answersOfSecondUser", "answersOfSecondUser")
        .leftJoinAndSelect("answersOfFirstUser.question", "questionOne")
        .leftJoinAndSelect("answersOfSecondUser.question", "questionTwo")
        .where(
      new Brackets(qb => {
          qb.where(`game.status = '${GameStatuses.PendingSecondPlayer}'`)
            .orWhere(`game.status = '${GameStatuses.Active}'`);
      }))
        .andWhere(new Brackets(qb => {
            qb.where('game.firstPlayerId = :userId', { userId: user.id})
              .orWhere('game.secondPlayerId = :userId', { userId: user.id});
        }))
        .getOne()

      console.log(game, 'found game');
      if (!game) return null;
      const questionsList : APIQuizQuestion[] = await this.quizQuestionsRepository
        .findQuizQuestionsListByListOfIds(game.questions)

      const result : PairGameQuizViewModel = PairGameQuizViewModel.getViewModelForFront(game, questionsList)
      console.log(result);
      return result
  }

    async answerNextQuestion(user: User, answer: AnswersInputModel) : Promise<AnswersViewModel> {
        const queryRunner : QueryRunner =  this.dataSource.createQueryRunner()
        let result
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const pairGameQuizRepoFromQueryRunner = queryRunner.manager.getRepository(PairGameQuiz)
        const answerRepoFromQueryRunner = queryRunner.manager.getRepository(APIQuizQuestionAnswer)
        const apiQuizQuestionRepoFromQueryRunner = queryRunner.manager.getRepository(APIQuizQuestion)
        try {

            const gameWhichUserParticipateIn : PairGameQuiz
              = await pairGameQuizRepoFromQueryRunner
              .createQueryBuilder("game")
              .leftJoinAndSelect("game.firstPlayer", "firstPlayer")
              .leftJoinAndSelect("game.secondPlayer", "secondPlayer")
              .leftJoinAndSelect("game.answersOfFirstUser", "answersOfFirstUser")
              .leftJoinAndSelect("game.answersOfSecondUser", "answersOfSecondUser")
              .where('game.status = :status', { status: GameStatuses.Active}) // check for enum injection
              .andWhere(new Brackets(qb => {
                  qb.where('game.firstPlayerId = :userId', { userId: user.id})
                    .orWhere('game.secondPlayerId = :userId', { userId: user.id});
              }))
              .getOne() // how to check length of array

            console.log(gameWhichUserParticipateIn, " checkOfParticipatingInAnotherGame")

            if (!gameWhichUserParticipateIn) return null; //check if user is participating in this game, if no -> 403

            const numberOfUserInGame : userNumberInGame = PairGameQuiz.findoutNumberOfUser(user, gameWhichUserParticipateIn)
            if(numberOfUserInGame === userNumberInGame.none) return null; // user don't participate in game

            const answersOfUserFromDB : APIQuizQuestionAnswer[] = PairGameQuiz.getAnswersOfUserByQueue(numberOfUserInGame, gameWhichUserParticipateIn)

            console.log(answersOfUserFromDB, " answersOfUserFromDB");
            if(answersOfUserFromDB.length > 4) return null; // too many answers for questions
            console.log("length of users answers is less then 5 and actually equals", answersOfUserFromDB.length)
            const questionToAnwser : APIQuizQuestion = await apiQuizQuestionRepoFromQueryRunner
              .findOneBy({id : gameWhichUserParticipateIn.questions[answersOfUserFromDB.length]})
            //find question in db by length of answers
            console.log("question to answer", questionToAnwser);
            const answerOfUser : APIQuizQuestionAnswer = APIQuizQuestionAnswer
              .createAnswer(answer, questionToAnwser, user, numberOfUserInGame, gameWhichUserParticipateIn) // create instance of answer
            console.log(answerOfUser, " answerOfUser");
            await answerRepoFromQueryRunner.save(answerOfUser)
            const gameAfterAnswerCreation = await pairGameQuizRepoFromQueryRunner.findOne({
                relations : {
                    answersOfFirstUser : true,
                    answersOfSecondUser : true,
                    firstPlayer : true,
                    secondPlayer : true
                }, where:{
                    id : gameWhichUserParticipateIn.id
                }
            })
            console.log(" answer saved");
            const previousScore = PairGameQuiz.getScoreOfUser(gameAfterAnswerCreation, numberOfUserInGame)
            const scoreToAdd : number = answerOfUser.answerStatus === AnswerStatuses.Correct ? 1 : 0
            const newScore : number = previousScore + scoreToAdd
            console.log(newScore, " newScore");
            const gameWithUpdatedScore : PairGameQuiz = PairGameQuiz.updateScore(gameAfterAnswerCreation,
              numberOfUserInGame,
              newScore)

            const resultOfMakingAnswer : PairGameQuiz = PairGameQuiz.checkForFinishingTheGame(gameWithUpdatedScore)
            result = AnswersViewModel.getViewModelFromDBClass(answerOfUser)
            console.log(resultOfMakingAnswer);

            await pairGameQuizRepoFromQueryRunner.save(resultOfMakingAnswer)
            await queryRunner.commitTransaction()

        } catch (e) {
            console.log(" catch error")
            console.log(e)
            await queryRunner.rollbackTransaction()
        } finally {
            console.log(" finally")
            await queryRunner.release()
            // ask why it works if I don't use release transaction
        }
        return result
    }

    async findAllGamesWhereUserIsParticipate(user: User, paginationCriteria: paginationGamesCriteriaType)
     : Promise<PaginatorViewModelType<PairGameQuizViewModel[]>> {
        const totalCount = await this.pairGameQuizTypeORMRepository
          .count({
              where: [
                  { firstPlayer: { id: user.id } },
                  { secondPlayer: { id: user.id } }
              ]
          });
        console.log(totalCount, " totalCount of games for specific user");
        const pageSize = paginationCriteria.pageSize;
        const pagesCount = Math.ceil(totalCount / pageSize);
        const page = paginationCriteria.pageNumber;
        const sortBy = paginationCriteria.sortBy;
        const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
        const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

        /*console.log(this.pairGameQuizTypeORMRepository
          .createQueryBuilder("game")
          .leftJoinAndSelect("game.firstPlayer", "firstPlayer")
          .leftJoinAndSelect("game.secondPlayer", "secondPlayer")
          .leftJoinAndSelect("game.answersOfFirstUser", "answersOfFirstUser")
          .leftJoinAndSelect("game.answersOfSecondUser", "answersOfSecondUser")
          .leftJoinAndSelect("answersOfFirstUser.question", "questionOne")
          .leftJoinAndSelect("answersOfSecondUser.question", "questionOne")
          .where(new Brackets(qb => {
              qb.where('game.firstPlayer.id = :userId', { userId: user.id})
                .orWhere('game.secondPlayer.id = :userId', { userId: user.id});
          }))
          .orderBy(`game."${sortBy}"`, sortDirection.toUpperCase() as "ASC" | "DESC")
          .skip(ToSkip)
          .take(pageSize)
          .getSql() , " SQL QUERY");*/

        const allGamesForSpecificUserTypeORMQuery = await this.pairGameQuizTypeORMRepository
          .createQueryBuilder("game")
          .leftJoinAndSelect("game.firstPlayer", "firstPlayer")
          .leftJoinAndSelect("game.secondPlayer", "secondPlayer")
          .leftJoinAndSelect("game.answersOfFirstUser", "answersOfFirstUser")
          .leftJoinAndSelect("game.answersOfSecondUser", "answersOfSecondUser")
          .leftJoinAndSelect("answersOfFirstUser.question", "questionOne")
          .leftJoinAndSelect("answersOfSecondUser.question", "questionTwo")
          .where('game.firstPlayerId = :userId', { userId: user.id})
          .orWhere('game.secondPlayerId = :userId', { userId: user.id})
          .orderBy(`game.${sortBy}`, sortDirection.toUpperCase() as "ASC" | "DESC")
          .addOrderBy(`game.pairCreatedDate`,"DESC")
          .skip(ToSkip)
          .take(pageSize)
          .getMany()


        let array : PairGameQuizViewModel[] = []
        for (const item of allGamesForSpecificUserTypeORMQuery) {
            const questions :  APIQuizQuestion[] = await this.quizQuestionsRepository
              .findQuizQuestionsListByListOfIds(item.questions)
            array.push(PairGameQuizViewModel.getViewModelForFront(item, questions))
        }


        return paginationGamesCriteriaType
          .bindWithPagination(
            paginationCriteria,
            array,
            pagesCount,
            totalCount,
            )
    }

    async findStatisticForSpecificUser(user: User) {
        const query = `
           select 
        ((select cast(sum("firstPlayerScore") as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = $1) 
        + 
        (select cast(sum("secondPlayerScore") as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = $1))
        as "sumScore",
      
        (round((
        (select cast(sum("firstPlayerScore") as numeric)
        from "pair_game_quiz" 
        where "firstPlayerId" = $1) 
        + 
        (select cast(sum("secondPlayerScore") as numeric)
        from "pair_game_quiz" 
        where "secondPlayerId" = $1))
         /
         ((select count(*)
        from "pair_game_quiz" 
        where "firstPlayerId" = $1) 
        + 
        (select count(*)
        from "pair_game_quiz" 
        where "secondPlayerId" = $1)), 2))
        as "avgScores",
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = $1) 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = $1))
        as "gamesCount",
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = $1
        and "firstPlayerScore" > "secondPlayerScore") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = $1
        and "firstPlayerScore" < "secondPlayerScore"))
        as "winsCount",
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = $1
        and "firstPlayerScore" < "secondPlayerScore") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = $1
        and "firstPlayerScore" > "secondPlayerScore"))
        as "lossesCount",
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = $1
        and "firstPlayerScore" = "secondPlayerScore") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = $1
        and "firstPlayerScore" = "secondPlayerScore"))
        as "drawsCount"
        
       
        `

        const result = await this.dataSource.query(query, [user.id])
        console.log(result, " result of sql query for getting statistics");
        result[0].avgScores = Number(result[0].avgScores)
        return result[0];
    }

    async getTopOfUsersAccordingTogamesStatistics(paginationCriteria: paginationTopUsersCriteriaType)
      : Promise<PaginatorViewModelType<StaticsViewModel>> {
        const totalCount = await this.dataSource.query(`
        select cast(count(*) as integer)
        from
        (select
        count(u."id")
        from "user" u
        left join "pair_game_quiz" fpg
        on fpg."firstPlayerId" = u."id"
        left join "pair_game_quiz" spg
        on spg."secondPlayerId" = u."id"
        group by u."id") ds
        `)
        console.log(totalCount, " total count");
        const pageSize = paginationCriteria.pageSize
        const pagesCount = Math.ceil(totalCount[0].count / pageSize);
        const page = paginationCriteria.pageNumber;
        const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

        // let sortParams : string[] = []
        console.log(paginationCriteria, " paginationCriteria");
        const sortParams  = paginationCriteria.sort.split(",").map(item =>  {

            const [field, direction] = item.split(' ')
            return `"${field}" ${direction}`
        })
          .join(", ")




        const query = `
        select *
        from
           (select
           u."id",
           u."login",
        ((select cast(sum("firstPlayerScore") as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = u."id") 
        + 
        (select cast(sum("secondPlayerScore") as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = u."id"))
        as "sumScore",
        
        (round((
        (select cast(sum("firstPlayerScore") as numeric)
        from "pair_game_quiz" 
        where "firstPlayerId" = u."id") 
        + 
        (select cast(sum("secondPlayerScore") as numeric)
        from "pair_game_quiz" 
        where "secondPlayerId" = u."id"))
         /
         ((select count(*)
        from "pair_game_quiz" 
        where "firstPlayerId" = u."id") 
        + 
        (select count(*)
        from "pair_game_quiz" 
        where "secondPlayerId" = u."id")), 2))
        as "avgScores",
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = u."id") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = u."id"))
        as "gamesCount",
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = u."id"
        and "firstPlayerScore" > "secondPlayerScore") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = u."id"
        and "firstPlayerScore" < "secondPlayerScore"))
        as "winsCount",
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = u."id"
        and "firstPlayerScore" < "secondPlayerScore") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = u."id"
        and "firstPlayerScore" > "secondPlayerScore"))
        as "lossesCount",
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = u."id"
        and "firstPlayerScore" = "secondPlayerScore") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = u."id"
        and "firstPlayerScore" = "secondPlayerScore"))
        as "drawsCount"
        
        from "user" u
        left join "pair_game_quiz" fpg
        on fpg."firstPlayerId" = u."id"
        left join "pair_game_quiz" spg
        on spg."secondPlayerId" = u."id"
        
        group by u."id"
        order by ${sortParams}
        limit $1 offset $2     
        ) dr  `
        const result : WithPlayerRawCredentials<StaticsViewModel>[]
          = await this.dataSource.query(query, [ pageSize, ToSkip])

        return {
            pagesCount,
            page,
            pageSize,
            totalCount: totalCount[0].count,
            items : result.map(item => {
                console.log(item , " item while last mapping");
                const newItem = StaticsViewModel.getViewModelForTopOfPlayers(item)
                return newItem
            })
        };
    }

    async findAllActiveGames() {
        const result =  await this.dataSource
          .getRepository(PairGameQuiz)
          .find({
              relations: {
                  answersOfFirstUser: true,
                  answersOfSecondUser: true
              },
              where: {
                  status: GameStatuses.Active
              }
          })
        console.log(result, " result");
        return result
    }
}
