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




@UseGuards(BasicAuthGuard)
@Controller('/sa/quiz')
export class SAQuizController {
    constructor(
        private readonly common: Common,
        private readonly commandBus: CommandBus,
    ) {}



    @Get("/questions")
    @HttpCode(200)
    async getAllQuestionsOfQuiz(@Query() QueryParams,
                                @Res({passthrough : true}) res: Response

                                ): Promise<PaginatorViewModelType<any>> {
        const paginationCriteria: paginationCriteriaType =
            this.common.getPaginationCriteria(QueryParams);
        return await this.commandBus.execute(new getAllQuestionsOfQuizCommand(paginationCriteria))

    }



    @Post("/questions")
    @HttpCode(201)
    async createQuestionOfQuiz(@Body() quizDTO : QuizDTO,
                               @Res({passthrough : true}) res: Response,
    ) {
        const resultOfCreation = await this.commandBus.execute(new CreateNewQuestionOfQuizCommand(quizDTO))
        return resultOfCreation
    }

    @Delete("/questions/:quizQuestionId")
    @HttpCode(204)
    async deleteQuestionOfQuizById(
                                   @Res({passthrough : true}) res: Response,
                               @Param("quizQuestionId") quizQuestionId
    ) {


        const resultOfDeletion = await this.commandBus.execute(new deleteQuestionOfQuizCommand(quizQuestionId))
        if(!resultOfDeletion){
            throw new NotFoundException()
        } else {
            return true
        }

    }

    @Put("/questions/:quizQuestionId")
    @HttpCode(204)
    async updateQuestionOfQuizById(@Body() quizDTO : QuizDTO,
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

    @Put("/questions/:id/publish")
    @HttpCode(204)
    async publishOrUnpublishQuestionOfQuizById(@Body() publishedDTO : PublishedDTO,
                               @Param("id") quizQuestionId,
                                               @Res({passthrough : true}) res: Response
    ) {


        const resultOfPublishing = await this.commandBus
            .execute(new publishOrUnpublishQuestionOfQuizByIdCommand(publishedDTO, quizQuestionId))

        if(!resultOfPublishing){
            throw new NotFoundException()
        } else {
            return true
        }
    }


}
