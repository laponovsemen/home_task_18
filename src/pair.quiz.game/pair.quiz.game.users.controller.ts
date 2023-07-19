import {
    BadRequestException,
    Body,
    Controller,
    Delete, ForbiddenException,
    Get, HttpCode, HttpStatus, NotFoundException, Optional,
    Param, ParseUUIDPipe,
    Post,
    Put,
    Query, Req, Res, UseGuards
} from "@nestjs/common";

import { Common } from '../common';
import {
    BlogsPaginationCriteriaType,
    paginationCriteriaType,
    PaginatorViewModelType,
    PostsPaginationCriteriaType,
} from '../appTypes';
import express, {Request, Response} from 'express';
import { isNotEmpty, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, isUUID, Length } from "class-validator";
import { AllPostsForSpecificBlogGuard, AuthGuard, BasicAuthGuard } from "../auth/auth.guard";
import {BanBlogDTO, BlogDTO, PostForSpecificBlogDTO, PublishedDTO, QuizDTO} from "../input.classes";
import { CommandBus } from "@nestjs/cqrs";

import {TokenPayload} from "../working.classess";
import {User} from "../auth/decorators/public.decorator";
import {CreateOrConnectPairCommand} from "./use-cases/create-or-connect-pair-use-case";
import {returnCurrentUnfinishedUserGameCommand} from "./use-cases/return-current-unfinished-user-game-use-case";
import {returnGameByIdCommand} from "./use-cases/return-game-by-id-use-case";
import { AnswersInputModel } from "./view.model.classess/answers.input.model";
import { sendAnswerForNextQuestionCommand } from "./use-cases/send-answer-for-next-question-use-case";
import { PairGameQuizViewModel } from "./view.model.classess/pair.game.quiz.view.model";
import { AnswersViewModel } from "./view.model.classess/answers.view.model";
import { returnAllMyGamesCommand } from "./use-cases/return-all-my-games-use-case";
import { returnStatisticForSpecificUserCommand } from "./use-cases/return-statistic-for-specific-user-use-case";
import { StaticsViewModel } from "./view.model.classess/statistics.view.model";
import { WithPagination, WithPlayerCredentials } from "../mongo/mongooseSchemas";
import { returnTopUsersCommand } from "./use-cases/return-top-users-use-case";


/*export class GetGameByIdDto {
    @IsUUID()
    @IsString()
    gameId: string
}*/



@Controller('/pair-game-quiz/users')
export class PairQuizGameUsersController {
    constructor(
        private readonly common: Common,
        private readonly commandBus: CommandBus,
    ) {}
    @UseGuards(AuthGuard)
    @Get("/my-statistic")
    @HttpCode(200)
    async returnStatisticForSpecificUser(
                           @Res({ passthrough: true }) res: Response,
                           @User() tokenPayload: TokenPayload
    ) : Promise<StaticsViewModel> {
        console.log("start returnStatisticForSpecificUser procedure");
        const resultOfGetting : StaticsViewModel
          = await this.commandBus.execute<returnStatisticForSpecificUserCommand, StaticsViewModel>(
          new returnStatisticForSpecificUserCommand(tokenPayload)
        )

        return resultOfGetting
    }

    @Get("/top")
    @HttpCode(200)
    async returnTopUsers(
      @Res({ passthrough: true }) res: Response,
      @Query() queryParams: any
    ) : Promise<PaginatorViewModelType<WithPlayerCredentials<StaticsViewModel>[]>> {
        console.log("start returnTopUsers procedure");
        const resultOfGetting : PaginatorViewModelType<WithPlayerCredentials<StaticsViewModel>[]>
          = await this.commandBus.execute<
          returnTopUsersCommand,
          PaginatorViewModelType<WithPlayerCredentials<StaticsViewModel>[]>
        >(new returnTopUsersCommand(queryParams))

        return resultOfGetting
    }

}
