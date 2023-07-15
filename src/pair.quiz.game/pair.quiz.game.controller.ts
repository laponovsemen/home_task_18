import {
    Body,
    Controller,
    Delete, ForbiddenException,
    Get, HttpCode, HttpStatus, NotFoundException,
    Param,
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
import { isNotEmpty, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";
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




@UseGuards(AuthGuard)
@Controller('/pair-game-quiz/pairs')
export class PairQuizGameController {
    constructor(
        private readonly common: Common,
        private readonly commandBus: CommandBus,
    ) {}



    @Get("/my-current")
    @HttpCode(200)
    async returnCurrentUnfinishedUserGame(@Query() QueryParams,
                                          @Res({ passthrough: true }) res: Response,
                                          @User() tokenPayload: TokenPayload
                                ) {
        const resultOfGetting = await this.commandBus.execute(new returnCurrentUnfinishedUserGameCommand(tokenPayload))
        if(!resultOfGetting){
            throw new NotFoundException()
        } else {
            return resultOfGetting
        }
    }

    @Get(`/:gameId`)
    @HttpCode(200)
    async returnGameById(@Res({passthrough : true}) res: Response,
                         @User() tokenPayload : TokenPayload,
                         @Param("gameId") gameId : string
    ) {
        const resultOfGetting = await this.commandBus.execute(new returnGameByIdCommand(tokenPayload, gameId))
        if(!resultOfGetting){
            throw new ForbiddenException()
        } else {
            return resultOfGetting
        }

    }

    @Post("/connection")
    @HttpCode(200)
    async createOrConnectPair(@Res({passthrough: true}) res: Response,
                              @User() tokenPayload : TokenPayload
    ) {

        const pairConnection = await this.commandBus.execute(new CreateOrConnectPairCommand(tokenPayload))
        console.log(pairConnection, " pairConnection")
        if (!pairConnection){
            throw new ForbiddenException()
        } else {
            return pairConnection
        }
    }

    @Post("/my-current/answers")
    @HttpCode(200)
    async sendAnswerForNextQuestion(@Res({passthrough : true}) res: Response,
                               @Body() answer : AnswersInputModel,
                               @User() tokenPayload : TokenPayload,
                               @Param("quizQuestionId") quizQuestionId
    ) {
        const answerProcedure = await  this.commandBus.execute(new sendAnswerForNextQuestionCommand(tokenPayload, answer))
    }

}
