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
import {CreateNewQuestionOfQuizCommand} from "./use-cases/create-new-question-of-quiz-use-case";
import {deleteQuestionOfQuizCommand} from "./use-cases/delete-question-of-quiz-by-id-use-case";
import {publishOrUnpublishQuestionOfQuizByIdCommand} from "./use-cases/publish-or-unpublish-of-quiz-use-case";
import {updateQuestionOfQuizCommand} from "./use-cases/update-question-of-quiz-by-id-use-case";
import {getAllQuestionsOfQuizCommand} from "./use-cases/get-all-questions-of-quiz-use-case";




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
        return await this.commandBus.execute(new getAllQuestionsOfQuizCommand(paginationCriteria))
    }



    @Get(`/:gameId`)
    @HttpCode(201)
    async returnGameById(
                               @Res({passthrough : true}) res: Response,
    ) {
        const resultOfCreation = await this.commandBus
        return resultOfCreation
    }

    @Post("/connection")
    @HttpCode(201)
    async connectOrCreatePair( @Res({passthrough : true}) res: Response,

    ) {
        return
    }

    @Post("/my-current/answers")
    @HttpCode(204)
    async sendAnswerForNextQuestion(@Body() quizDTO : QuizDTO,
                                   @Res({passthrough : true}) res: Response,
                               @Param("quizQuestionId") quizQuestionId
    ) {
        const resultOfUpdating = await this.commandBus.execute(new updateQuestionOfQuizCommand(quizQuestionId, quizDTO))
        if(!resultOfUpdating){
            throw new NotFoundException()
        } else {
            return true
        }
    }

}
