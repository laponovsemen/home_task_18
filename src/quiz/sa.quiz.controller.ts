// import {
//     Body,
//     Controller,
//     Delete,
//     Get, HttpCode, HttpStatus, NotFoundException,
//     Param,
//     Post,
//     Put,
//     Query, Req, Res, UseGuards
// } from "@nestjs/common";
//
// import { Common } from '../common';
// import {
//     BlogsPaginationCriteriaType,
//     paginationCriteriaType,
//     PaginatorViewModelType,
//     PostsPaginationCriteriaType,
// } from '../appTypes';
// import express, {Request, Response} from 'express';
// import { isNotEmpty, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";
// import { AllPostsForSpecificBlogGuard, AuthGuard, BasicAuthGuard } from "../auth/auth.guard";
// import { BanBlogDTO, BlogDTO, PostForSpecificBlogDTO } from "../input.classes";
// import { CommandBus } from "@nestjs/cqrs";
//
//
//
//
//
// @Controller('/sa/quiz')
// export class SAQuizController {
//     constructor(
//         private readonly common: Common,
//         private readonly commandBus: CommandBus,
//     ) {}
//
//
//
//     @Get("/questions")
//     @HttpCode(200)
//     async getAllQuestionsOfQuiz(@Query() QueryParams,): Promise<PaginatorViewModelType<any>> {
//         const paginationCriteria: paginationCriteriaType =
//             this.common.getPaginationCriteria(QueryParams);
//         return this.blogsQueryRepository.getAllBlogsSA(paginationCriteria);
//     }
//     @UseGuards(BasicAuthGuard)
//     @Post("/questions")
//     @HttpCode(204)
//     async createQuestionOfQuiz(@Body() DTO : BanBlogDTO,
//                   @Param("blogId") blogId
//     ) {
//
//
//         await this.commandBus.execute(new BanBlogCommand(DTO, blogId))
//         return
//     }
//
//
// }
