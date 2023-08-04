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
import {PairQuizGamePairsController} from "./pair.quiz.game/pair.quiz.game.pairs.controller";
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
import {TypeORMTransactionService} from "./transaction.service";
import {
  returnAllMyGamesCommand,
  returnAllMyGamesUseCase
} from "./pair.quiz.game/use-cases/return-all-my-games-use-case";
import {
  returnStatisticForSpecificUserCommand, returnStatisticForSpecificUserUseCase
} from "./pair.quiz.game/use-cases/return-statistic-for-specific-user-use-case";
import { PairQuizGameUsersController } from "./pair.quiz.game/pair.quiz.game.users.controller";
import { returnTopUsersCommand, returnTopUsersUseCase } from "./pair.quiz.game/use-cases/return-top-users-use-case";
import { ScheduleModule } from "@nestjs/schedule";
import {
  autoFinishingEscapedGamesCommand,
  autoFinishingEscapedGamesUseCase
} from "./pair.quiz.game/use-cases/auto-checking-for-unfinished-games-use-case";
import { AvatarController } from "./avatar/avatar.controller";
import { FileSystemAdapter } from "./utils/fs-utils";
import { SaveAvatarToFSCommand, SaveAvatarToFSUseCase } from "./utils/use-cases/save-avatar-to-file-system.use-case";
import { Storage } from "@google-cloud/storage";
import { MulterModule } from "@nestjs/platform-express";
import { GoogleStorageService } from "./utils/google-storage-adapter/google.storage.service";
import {
  UploadBackgroundWallPapperForSpecificBlogCommand, UploadBackgroundWallPapperForSpecificBlogUseCase
} from "./blogs/use-cases/upload.background.wallpaper.for.specific.blog";
import { PhotosRepository } from "./blogs/photos.repository";
import { BlogMainPhotoEntity } from "./entities/photo.entities/blog.main.photo-entity";
import { BlogWallpaperPhotoEntity } from "./entities/photo.entities/blog.wallpaper.photo-entity";
import {
  UploadMainPhotosForSpecificBlogCommand,
  UploadMainPhotosForSpecificBlogUseCase
} from "./blogs/use-cases/upload.main.photos.for.specific.blog";
import { BlogWallpaperPhotosRepository } from "./blogs/blog.wallpaper.photos.repository";
import { BlogMainPhotosRepository } from "./blogs/blog.main.photos.repository";
import {
  UploadMainPhotosForPostForSpecificBlogCommand, UploadMainPhotosForPostForSpecificBlogUseCase
} from "./posts/use-cases/upload.main.photos.for.post.for.specific.blog";
import { PostMainPhotosRepository } from "./posts/post.main.photos.repository";
import { PostMainPhotoEntity } from "./entities/photo.entities/post.main.photo-entity";
import { TelegramController } from "./telegram/telegram.controller";
import { TelegramAdapter } from "./utils/telegram.adapter/telegram.adapter";
import { APISubscriptionEntity } from "./entities/api-subscription-entity";
import { SubscriptionsRepository } from "./blogs/subscriptions.repository";
import { UnubscribeBlogCommand, UnubscribeBlogUseCase } from "./blogs/use-cases/unsubscribe.blog.use-case";
import { SubscribeBlogCommand, SubscribeBlogUseCase } from "./blogs/use-cases/subscribe.blog.use-case";
const modules = [AuthModule]

const services = [AppService,BlogsService, PostsService, TestingService, UsersService, AuthService,
  LikeService, CommentsService, JwtService, SecurityDevicesService, TypeORMTransactionService, GoogleStorageService]

const repositories = [BlogsRepository, PostsRepository, UsersRepository,CommentsRepository, LikeRepository,CommentsQueryRepository,
  BlogsQueryRepository, SecurityDevicesRepository,BansRepository, PostsQueryRepository, QuizQuestionsRepository, PairGameQuizRepository,
  PhotosRepository,BlogWallpaperPhotosRepository, BlogMainPhotosRepository,PostMainPhotosRepository, SubscriptionsRepository]

const useCases = [BanProcedureUseCase, GettingAllUsersForSuperAdminUseCase,BanVerificationOfUserUseCase,
  GetAllCommentForUserUseCase,
  GettingAllBlogsForSpecifiedBloggerUseCase, BanBlogUseCase,BanUserByBloggerUseCase , GetBannedUsersForSpecificBlogUseCase,
  CreateNewQuestionOfQuizUseCase, deleteQuestionOfQuizUseCase, getAllQuestionsOfQuizUseCase,
  publishOrUnpublishQuestionOfQuizByIdUseCase,
  updateQuestionOfQuizUseCase,CreateOrConnectPairUseCase, returnCurrentUnfinishedUserGameUseCase,
  returnGameByIdUseCase, sendAnswerForNextQuestionUseCase, returnAllMyGamesUseCase, returnStatisticForSpecificUserUseCase,
  returnTopUsersUseCase, autoFinishingEscapedGamesUseCase, SaveAvatarToFSUseCase,
  UploadBackgroundWallPapperForSpecificBlogUseCase, UploadMainPhotosForSpecificBlogUseCase, UploadMainPhotosForPostForSpecificBlogUseCase,
  UnubscribeBlogUseCase, SubscribeBlogUseCase]

const commands = [BanProcedureCommand, GettingAllUsersForSuperAdminCommand,BanVerificationOfUserCommand,
  GetAllCommentForUserCommand,
  GettingAllBlogsForSpecifiedBloggerCommand, BanBlogCommand,BanUserByBloggerCommand, GetBannedUsersForSpecificBlogCommand,
  CreateNewQuestionOfQuizCommand, deleteQuestionOfQuizCommand, getAllQuestionsOfQuizCommand,
  publishOrUnpublishQuestionOfQuizByIdCommand, updateQuestionOfQuizCommand, CreateOrConnectPairCommand,
  returnCurrentUnfinishedUserGameCommand, returnGameByIdCommand, sendAnswerForNextQuestionCommand, returnAllMyGamesCommand,
  returnStatisticForSpecificUserCommand, returnTopUsersCommand, autoFinishingEscapedGamesCommand, SaveAvatarToFSCommand,
  UploadBackgroundWallPapperForSpecificBlogCommand, UploadMainPhotosForSpecificBlogCommand, UploadMainPhotosForPostForSpecificBlogCommand,
  UnubscribeBlogCommand, SubscribeBlogCommand]

const adapters = [EmailAdapter, Common, BlogIdExistsRule, FileSystemAdapter, Storage, TelegramAdapter]


@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Blog, User, BlogBan, APIComment, APILike, APISession,
      APIPost, BloggerBansForSpecificBlog, APIQuizQuestion, APIQuizQuestionAnswer,PairGameQuiz, BlogMainPhotoEntity,
      BlogWallpaperPhotoEntity, PostMainPhotoEntity, APISubscriptionEntity
    ]),
    JwtModule.register({secret: "123"}),
    ThrottlerModule.forRoot({
    ttl: 10,
    limit: 500,
    }),
    ScheduleModule.forRoot(),

    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      /*type: 'postgres',
      host: "lucky.db.elephantsql.com",
      port: 5432,
      username: 'tfaepjvr',
      password: 'pbzw6dDdgwDXKcr5QzUU9qAwZyLdsoHo',
      database: 'tfaepjvr',*/
      type: 'postgres',
      /*url : "postgres://laponovsemen:jb5zyBeHskM2@ep-floral-block-080205-pooler.eu-central-1.aws.neon.tech/neondb",
      ssl : true,*/
      host: "localhost",
      port: 5432,
      username: 'postgres',
      password: '2233',
      database: 'postgres',
      entities: [Blog, User, BlogBan, APIComment, APILike, APISession, APIPost, BloggerBansForSpecificBlog,
        APIQuizQuestion, APIQuizQuestionAnswer, PairGameQuiz, BlogMainPhotoEntity, BlogWallpaperPhotoEntity, PostMainPhotoEntity,
        APISubscriptionEntity],
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],

  controllers: [AppController, BloggerBlogsController, TestingController,BlogsController,SABlogsController,SAUsersController,
    PostsController, UsersController, AuthController, CommentsController, SecurityDevicesController, BloggerUsersController,
    SAQuizController, PairQuizGamePairsController, PairQuizGameUsersController, AvatarController, TelegramController],

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

