import { Injectable } from "@nestjs/common";
import { BlogsRepository } from "../blogs/blogs.repository";
import { CommentsRepository } from "../comments/comments.repository";
import { UsersRepository } from "../users/users.reposiroty";
import { PostsRepository } from "../posts/posts.repository";
import { LikeRepository } from "../likes/likes.repository";
import { SecurityDevicesRepository } from "../security.devices/security.devices.repository";
import { BansRepository } from "../blogs/bans.repository";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import {QuizQuestionsRepository} from "../quiz/sa.quiz.questions.repository";
import { PairGameQuizRepository } from "../pair.quiz.game/pair.game.quiz.repository";
import { APIQuizQuestionAnswer } from "../entities/api-quiz-question-answer-entity";
import { TRUNCATE } from "./truncate.all.tables.SQL.script";


@Injectable()
export class TestingService {
  constructor(private readonly blogsRepository: BlogsRepository,
              private readonly postsRepository: PostsRepository,
              private readonly usersRepository: UsersRepository,
              private readonly commentsRepository: CommentsRepository,
              private readonly likeRepository: LikeRepository,
              private readonly bansRepository: BansRepository,
              private readonly securityDevicesRepository: SecurityDevicesRepository,
              private readonly quizQuestionsRepository : QuizQuestionsRepository,
              private readonly pairGameQuizRepository : PairGameQuizRepository,
              @InjectRepository(APIQuizQuestionAnswer) protected answerRepository : Repository<APIQuizQuestionAnswer>,
              @InjectDataSource() private dataSource: DataSource
              ) {
  }
  async  deleteAllData(){
    // try {
    //   const entities = this.dataSource.entityMetadatas
    //   const tableNames = entities.map(e => `"${e.tableName}"`).join(', ')
    //   return this.dataSource.query(`TRUNCATE ${tableNames} CASCADE`)
    // } catch (e) {
    //   console.log(e)
    //   return null
    // }
    // await Promise.all([
    //  this.blogsRepository.deleteAllData(),
    //  this.postsRepository.deleteAllData(),
    //  this.usersRepository.deleteAllData(),
    //  this.commentsRepository.deleteAllData(),
    //  this.likeRepository.deleteAllData(),
    //  this.securityDevicesRepository.deleteAllData(),
    //  this.bansRepository.deleteAllData(),
    //  this.quizQuestionsRepository.deleteAllData(),
    //  this.pairGameQuizRepository.deleteAllData(),
    //  this.answerRepository.delete({})
    //   ])
    await  this.dataSource.query(TRUNCATE)
  }
}