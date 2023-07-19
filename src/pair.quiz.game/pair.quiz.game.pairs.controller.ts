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


/*export class GetGameByIdDto {
    @IsUUID()
    @IsString()
    gameId: string
}*/


@UseGuards(AuthGuard)
@Controller('/pair-game-quiz/pairs')
export class PairQuizGamePairsController {
    constructor(
        private readonly common: Common,
        private readonly commandBus: CommandBus,
    ) {}


    @Get("/my")
    @HttpCode(200)
    async returnAllMyGames(@Query() QueryParams,
                                          @Res({ passthrough: true }) res: Response,
                                          @User() tokenPayload: TokenPayload
    ) : Promise<PairGameQuizViewModel[]> {
        console.log("start returnAllMyGames procedure");
        const resultOfGetting : PairGameQuizViewModel[]
          = await this.commandBus.execute<returnAllMyGamesCommand, PairGameQuizViewModel[]>(
            new returnAllMyGamesCommand(tokenPayload, QueryParams)
        )

        return resultOfGetting

    }


    @Get("/my-current")
    @HttpCode(200)
    async returnCurrentUnfinishedUserGame(@Query() QueryParams,
                                          @Res({ passthrough: true }) res: Response,
                                          @User() tokenPayload: TokenPayload
                                ) : Promise<PairGameQuizViewModel> {
        console.log("start returnCurrentUnfinishedUserGame procedure");
        const resultOfGetting : PairGameQuizViewModel = await this.commandBus.execute<returnCurrentUnfinishedUserGameCommand, PairGameQuizViewModel>(new returnCurrentUnfinishedUserGameCommand(tokenPayload))
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
    ) : Promise<PairGameQuizViewModel>{

        const pairConnection : PairGameQuizViewModel =
          await this.commandBus.execute<CreateOrConnectPairCommand, PairGameQuizViewModel>(
            new CreateOrConnectPairCommand(tokenPayload))

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

    ) : Promise<AnswersViewModel> {
        console.log("start sendAnswerForNextQuestion procedure");
        const answerProcedure : AnswersViewModel
          = await  this.commandBus.execute<sendAnswerForNextQuestionCommand, AnswersViewModel>
        (new sendAnswerForNextQuestionCommand(tokenPayload, answer))

        if (!answerProcedure){
            throw new ForbiddenException()
        } else {
            return answerProcedure
        }
    }



    @Get(`/:gameId`)
    @HttpCode(200)
    async returnGameById(
      @Res({passthrough : true}) res: Response,
      @User() tokenPayload : TokenPayload,
      @Param("gameId") gameId : string
    ) : Promise<PairGameQuizViewModel> {

        if(!isUUID(gameId)) throw new BadRequestException({message : ["bad game id format"], field : "gameId"});
        // HLEB HELP
        console.log(gameId," returnGameById Procedure Controller");
        const resultOfGetting = await this.commandBus.execute<returnGameByIdCommand, PairGameQuizViewModel>(new returnGameByIdCommand(tokenPayload, gameId));
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
