import {
  BadRequestException,
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
import { BlogsService } from './blogs.service';
import { isNotEmpty, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";
import { AllPostsForSpecificBlogGuard, AuthGuard, BasicAuthGuard } from "../auth/auth.guard";
import { BlogDTO, PostForSpecificBlogDTO } from "../input.classes";
import { User } from "../auth/decorators/public.decorator";
import { TokenPayload } from "../working.classess";
import { CommandBus } from "@nestjs/cqrs";
import { SubscribeBlogCommand } from "./use-cases/subscribe.blog.use-case";
import { UnubscribeBlogCommand } from "./use-cases/unsubscribe.blog.use-case";





@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly common: Common,
    private readonly commandBus: CommandBus,
  ) {}



  @Get()
  @HttpCode(200)
  async getAllBlogs(
    @Query() QueryParams,
  ): Promise<PaginatorViewModelType<any>> {
    const paginationCriteria: paginationCriteriaType =
      this.common.getPaginationCriteria(QueryParams);
    return this.blogsService.getAllBlogs(paginationCriteria);
  }


  @Get(':id/posts')
  @HttpCode(200)
  async getAllPostsForSpecificBlog(@Req() req : Request,
                                   @Res({passthrough : true}) res: Response,
                                   @Query() QueryParams,
                                   @Param('id') blogId) {
    const token = req.headers.authorization
    console.log(token, "accessToken")
    const paginationCriteria: paginationCriteriaType = this.common.getPaginationCriteria(QueryParams);
    const result =  await this.blogsService.getAllPostsForSpecificBlog(paginationCriteria, blogId, token);
    console.log(result)
    if(!result){
      throw new NotFoundException("Blog not found")
    }
    return result

  }


  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  @HttpCode(201)
  async createPostForSpecificBlog(
    @Body() DTO : PostForSpecificBlogDTO,
    @Param('id') blogId,
    @Res({passthrough : true}) res: Response): Promise<any | void> {

    const result =  await this.blogsService.createPostForSpecificBlog(DTO, blogId);
    if(!result){
      throw new NotFoundException("Blog not found")
    } else {
      return result
    }
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  async getBlogById(
    @Res({passthrough : true}) res: Response,
    @Param('id') id,
    @User() tokenPayload : TokenPayload
  ): Promise<any> {
    const result = await this.blogsService.getBlogById(id, tokenPayload.userId);
    if(!result){
      throw new NotFoundException("Blog not found")
    }
    return result
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlogById(@Res({passthrough : true}) res: Response,
                       @Body() DTO : BlogDTO,
                       @Param('id') id): Promise<void> {
    const updateResult = await this.blogsService.updateBlogById(DTO, id);
    if(!updateResult){
      throw new NotFoundException("Blog not found")
    }
    return

  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Res({passthrough : true}) res: Response,
                       @Param('id') id) {
    const deletedBlog = await this.blogsService.deleteBlogById(id);
    if(!deletedBlog){
      throw new ForbiddenException("Blog not found")
    }
    return

  }

  @UseGuards(AuthGuard)
  @Post('/:blogId/subscription')
  @HttpCode(204)
  async subscribeBlog(@Res({passthrough : true}) res: Response,
                       @Param('blogId') blogId,
                       @User() tokenPayload : TokenPayload
  ) {
    const subscribeResult = await this.commandBus.execute(new SubscribeBlogCommand(blogId, tokenPayload));
    if(!subscribeResult){
      throw new BadRequestException("Blog not found")
    }
    return

  }

  @UseGuards(AuthGuard)
  @Delete('/:blogId/subscription')
  @HttpCode(204)
  async unsubscribeBlog(@Res({passthrough : true}) res: Response,
                      @Param('blogId') blogId,
                        @User() tokenPayload : TokenPayload) {
    const unsubscribeResult = await this.commandBus.execute(new UnubscribeBlogCommand(blogId, tokenPayload));
    if(!unsubscribeResult){
      throw new BadRequestException("Blog not found")
    }
    return

  }
}
