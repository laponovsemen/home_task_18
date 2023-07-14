import {
    Body,
    Controller,
    Delete,
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
                                @Res({passthrough : true}) res: Response

                                ): Promise<PaginatorViewModelType<any>> {
        const paginationCriteria: paginationCriteriaType =
            this.common.getPaginationCriteria(QueryParams);
        return await this.commandBus.execute(new returnCurrentUnfinishedUserGameCommand(paginationCriteria))
    }



    @Get(`/:gameId`)
    @HttpCode(201)
    async returnGameById(
                               @Res({passthrough : true}) res: Response,
    ) {
        const resultOfCreation = await this.commandBus.execute(new returnGameByIdCommand())
        return resultOfCreation
    }

    @Post("/connection")
    @HttpCode(201)
    async createOrConnectPair(@Res({passthrough: true}) res: Response,
                              @User() tokenPayload : TokenPayload
    ) {

        const pairConnection = await this.commandBus.execute(new CreateOrConnectPairCommand(tokenPayload))
        return pairConnection
    }

    @Post("/my-current/answers")
    @HttpCode(204)
    async sendAnswerForNextQuestion(@Body() quizDTO : QuizDTO,
                                   @Res({passthrough : true}) res: Response,
                               @Param("quizQuestionId") quizQuestionId
    ) {
        const resultOfUpdating = await this.commandBus.execute(new sendAnswerForNextQuestionCommand(quizQuestionId, quizDTO))
        if(!resultOfUpdating){
            throw new NotFoundException()
        } else {
            return true
        }
    }

}
