import {
    BadRequestException,
    Body,
    Controller,
    Delete, ForbiddenException,
    Get, HttpCode, HttpStatus, NotFoundException,
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
import { isNotEmpty, IsNotEmpty, IsString, IsUrl, isUUID, Length } from "class-validator";
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
        console.log("start returnCurrentUnfinishedUserGame procedure");
        const resultOfGetting = await this.commandBus.execute(new returnCurrentUnfinishedUserGameCommand(tokenPayload))
        if(!resultOfGetting){
            console.log(resultOfGetting, "resultOfGetting in returnCurrentUnfinishedUserGame must throw 404");
            throw new NotFoundException()
        } else {
            console.log(resultOfGetting, "resultOfGetting in returnCurrentUnfinishedUserGame");
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
        console.log("start sendAnswerForNextQuestion procedure");
        const answerProcedure = await  this.commandBus.execute(new sendAnswerForNextQuestionCommand(tokenPayload, answer))

        if (!answerProcedure){
            throw new ForbiddenException()
        } else {
            return answerProcedure
        }
    }



    @Get(`/:gameId`)
    @HttpCode(200)
    async returnGameById(
      @User() tokenPayload : TokenPayload,
      @Param("gameId", ParseUUIDPipe) gameId : string
    ) {
        /*if (!isUUID(gameId)) throw new BadRequestException([{
            message: "wrong format in id in param",
            field: "gameId"
        }]);*/

        console.log(" returnGameById Procedure Controller");
        const resultOfGetting : PairGameQuizViewModel = await this.commandBus.execute(new returnGameByIdCommand(tokenPayload, gameId))
        if(!resultOfGetting){
            console.log(resultOfGetting, " resultOfGetting in returnGameById Procedure Controller, must throw new error NotFoundException");
            throw new NotFoundException()
        } else if (
          (resultOfGetting.firstPlayerProgress.player.id !== tokenPayload.userId
            && resultOfGetting.secondPlayerProgress === null)
          ||
          (resultOfGetting.firstPlayerProgress.player.id !== tokenPayload.userId
            && resultOfGetting.secondPlayerProgress.player.id !== tokenPayload.userId)
        ) {

            console.log(resultOfGetting, " resultOfGetting in returnGameById 403");
            throw new ForbiddenException()
        } else {
            console.log(resultOfGetting, " resultOfGetting in returnGameById Procedure Controller");
            return resultOfGetting
        }

    }
}
