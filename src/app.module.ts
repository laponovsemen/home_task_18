import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { BlogsService } from "./blogs/blogs.service";
import { BlogsRepository } from "./blogs/blogs.repository";
import * as process from "process";

import { Common } from "./common";
import { BloggerBlogsController } from "./blogs/blogger.blogs.controller";
import { TestingController } from "./testing/testing.controller";
import { TestingService } from "./testing/testing.service";
import { PostsRepository } from "./posts/posts.repository";
import { UsersRepository } from "./users/users.reposiroty";
import { CommentsRepository } from "./comments/comments.repository";
import { PostsController } from "./posts/posts.controller";
import { PostsService } from "./posts/posts.service";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";
import { AuthModule } from "./auth/auth.module";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { EmailAdapter } from "./auth/email.adapter";
import { LikeService } from "./likes/likes.service";
import { LikeRepository } from "./likes/likes.repository";
import { CommentsController } from "./comments/comments.controller";
import { CommentsService } from "./comments/comments.service";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { BlogIdExistsRule } from "./auth/custom.validators/blogIdExists.validator";
import { SecurityDevicesRepository } from "./security.devices/security.devices.repository";
import { SecurityDevicesService } from "./security.devices/security.devices.service";
import { SecurityDevicesController } from "./security.devices/security.devices.controller";
import { BlogsController } from "./blogs/blogs.controller";
import { SABlogsController } from "./blogs/sa.blogs.controller";
import { SAUsersController } from "./users/sa.users.controller";
import { BanProcedureCommand, BanProcedureUseCase } from "./users/use-cases/banProcedure-use-case";
import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import {
  GettingAllUsersForSuperAdminCommand,
  GettingAllUsersForSuperAdminUseCase
} from "./users/use-cases/getting-all-users-for-super-admin";
import {
  GettingAllBlogsForSpecifiedBloggerCommand,
  GettingAllBlogsForSpecifiedBloggerUseCase
} from "./blogs/use-cases/getting-all-blogs-for-specified-blogger";
import { BanBlogCommand, BanBlogUseCase } from "./blogs/use-cases/ban-blog-use-case";
import { BlogsQueryRepository } from "./blogs/blogs.query.repository";
import { BanUserByBloggerCommand, BanUserByBloggerUseCase } from "./blogs/use-cases/ban-user-by-blogger-use-case";
import {
  GetBannedUsersForSpecificBlogCommand,
  GetBannedUsersForSpecificBlogUseCase
} from "./blogs/use-cases/get-banned-users-for-specific-blog-use-case";
import { BansRepository } from "./blogs/bans.repository";
import { BloggerUsersController } from "./blogs/blogger.users.controller";
import {
  BanVerificationOfUserCommand,
  BanVerificationOfUserUseCase
} from "./posts/use-cases/ban-verification-of-user-use-case";
import { GetAllCommentForUserCommand, GetAllCommentForUserUseCase } from "./blogs/use-cases/get-all-comments-for-user";
import { PostsQueryRepository } from "./posts/posts.query.repository";
import { CommentsQueryRepository } from "./comments/comments.query.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {BlogBan} from "./entities/blog-ban-entity";
import {Blog} from "./entities/blog-entity";
import {User} from "./entities/user-entity";
import {APIComment} from "./entities/api-comment-entity";
import {APILike} from "./entities/api-like-entity";
import {APISession} from "./entities/api-session-entity";
import {APIPost} from "./entities/api-post-entity";
import {BloggerBansForSpecificBlog} from "./entities/blogger-bans-for-specific-blog-entity";
import {QuizQuestionsRepository} from "./quiz/sa.quiz.questions.repository";
import {APIQuizQuestion} from "./entities/quiz-entity";
import {SAQuizController} from "./quiz/sa.quiz.controller";
import {
  CreateNewQuestionOfQuizCommand,
  CreateNewQuestionOfQuizUseCase
} from "./quiz/use-cases/create-new-question-of-quiz-use-case";
import {
  deleteQuestionOfQuizCommand,
  deleteQuestionOfQuizUseCase
} from "./quiz/use-cases/delete-question-of-quiz-by-id-use-case";
import {
  getAllQuestionsOfQuizCommand,
  getAllQuestionsOfQuizUseCase
} from "./quiz/use-cases/get-all-questions-of-quiz-use-case";
import {
  publishOrUnpublishQuestionOfQuizByIdCommand,
  publishOrUnpublishQuestionOfQuizByIdUseCase
} from "./quiz/use-cases/publish-or-unpublish-of-quiz-use-case";
import {
  updateQuestionOfQuizCommand,
  updateQuestionOfQuizUseCase
} from "./quiz/use-cases/update-question-of-quiz-by-id-use-case";
import {PairQuizGameController} from "./pair.quiz.game/pair.quiz.game.controller";
import {APIQuizQuestionAnswer} from "./entities/api-quiz-question-answer-entity";
import {PairGameQuiz} from "./entities/api-pair-game-quiz-entity";
import {
  CreateOrConnectPairCommand,
  CreateOrConnectPairUseCase
} from "./pair.quiz.game/use-cases/create-or-connect-pair-use-case";
import {
  returnCurrentUnfinishedUserGameCommand, returnCurrentUnfinishedUserGameUseCase
} from "./pair.quiz.game/use-cases/return-current-unfinished-user-game-use-case";
import {returnGameByIdCommand, returnGameByIdUseCase} from "./pair.quiz.game/use-cases/return-game-by-id-use-case";
import {
  sendAnswerForNextQuestionCommand,
  sendAnswerForNextQuestionUseCase
} from "./pair.quiz.game/use-cases/send-answer-for-next-question-use-case";
import {PairGameQuizRepository} from "./pair.quiz.game/pair.game.quiz.repository";
const modules = [AuthModule]

const services = [AppService,BlogsService, PostsService, TestingService, UsersService, AuthService,
  LikeService, CommentsService, JwtService, SecurityDevicesService]

const repositories = [BlogsRepository, PostsRepository, UsersRepository,CommentsRepository, LikeRepository,CommentsQueryRepository,
  BlogsQueryRepository, SecurityDevicesRepository,BansRepository, PostsQueryRepository, QuizQuestionsRepository, PairGameQuizRepository]

const useCases = [BanProcedureUseCase, GettingAllUsersForSuperAdminUseCase,BanVerificationOfUserUseCase,GetAllCommentForUserUseCase,
  GettingAllBlogsForSpecifiedBloggerUseCase, BanBlogUseCase,BanUserByBloggerUseCase , GetBannedUsersForSpecificBlogUseCase,
  CreateNewQuestionOfQuizUseCase, deleteQuestionOfQuizUseCase, getAllQuestionsOfQuizUseCase, publishOrUnpublishQuestionOfQuizByIdUseCase,
  updateQuestionOfQuizUseCase,CreateOrConnectPairUseCase, returnCurrentUnfinishedUserGameUseCase, returnGameByIdUseCase, sendAnswerForNextQuestionUseCase]

const commands = [BanProcedureCommand, GettingAllUsersForSuperAdminCommand,BanVerificationOfUserCommand,GetAllCommentForUserCommand,
  GettingAllBlogsForSpecifiedBloggerCommand, BanBlogCommand,BanUserByBloggerCommand, GetBannedUsersForSpecificBlogCommand,
  CreateNewQuestionOfQuizCommand, deleteQuestionOfQuizCommand, getAllQuestionsOfQuizCommand, publishOrUnpublishQuestionOfQuizByIdCommand,
  updateQuestionOfQuizCommand, CreateOrConnectPairCommand, returnCurrentUnfinishedUserGameCommand, returnGameByIdCommand, sendAnswerForNextQuestionCommand]

const adapters = [EmailAdapter, Common, BlogIdExistsRule]


@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Blog, User, BlogBan, APIComment, APILike, APISession,
      APIPost, BloggerBansForSpecificBlog, APIQuizQuestion, APIQuizQuestionAnswer,PairGameQuiz]),
    JwtModule.register({secret: "123"}),
    ThrottlerModule.forRoot({
    ttl: 10,
    limit: 500,
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: "lucky.db.elephantsql.com",
      port: 5432,
      username: 'tfaepjvr',
      password: 'pbzw6dDdgwDXKcr5QzUU9qAwZyLdsoHo',
      database: 'tfaepjvr',
      entities: [Blog, User, BlogBan, APIComment, APILike, APISession, APIPost, BloggerBansForSpecificBlog,
        APIQuizQuestion, APIQuizQuestionAnswer, PairGameQuiz],
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],

  controllers: [AppController, BloggerBlogsController, TestingController,BlogsController,SABlogsController,SAUsersController,
    PostsController, UsersController, AuthController, CommentsController, SecurityDevicesController, BloggerUsersController,
    SAQuizController, PairQuizGameController],

  providers: [...modules,
    ...services,
    ...repositories,
    ...useCases,
    ...commands,
    ...adapters,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }]
})


export class AppModule {
}

