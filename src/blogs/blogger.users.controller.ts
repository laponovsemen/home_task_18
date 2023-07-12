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
  BlogInsertModelType,
  BlogsPaginationCriteriaType, BlogViewModelType,
  paginationCriteriaType,
  PaginatorViewModelType,
  PostsPaginationCriteriaType
} from "../appTypes";
import express, {Request, Response} from 'express';
import { BlogsService } from './blogs.service';
import { isNotEmpty, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";
import { AllPostsForSpecificBlogGuard, AuthGuard, BasicAuthGuard } from "../auth/auth.guard";
import { BanUserByBloggerDTO, BlogDTO, PostForSpecificBlogDTO } from "../input.classes";
import { User } from "../auth/decorators/public.decorator";
import { GettingAllUsersForSuperAdminCommand } from "../users/use-cases/getting-all-users-for-super-admin";
import { CommandBus } from "@nestjs/cqrs";
import { GettingAllBlogsForSpecifiedBloggerCommand } from "./use-cases/getting-all-blogs-for-specified-blogger";
import { PostsService } from "../posts/posts.service";
import { BanUserByBloggerCommand } from "./use-cases/ban-user-by-blogger-use-case";
import { GetBannedUsersForSpecificBlogCommand } from "./use-cases/get-banned-users-for-specific-blog-use-case";
import { BlogsQueryRepository } from "./blogs.query.repository";
import {Blog} from "../entities/blog-entity";
import {TokenPayload} from "../working.classess";




@UseGuards(AuthGuard)

@Controller('/blogger')
export class BloggerUsersController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly common: Common,
    private readonly commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
  ) {}

  @UseGuards(AuthGuard)
  @Put("/users/:userIdToBan/ban")
  @HttpCode(204)
  async banUserByBlogger(@Query() QueryParams,
                         @User() user : TokenPayload,
                         @Res({passthrough : true}) res : Response,
                         @Body() DTO : BanUserByBloggerDTO,
                         @Param("userIdToBan") userIdToBan): Promise<PaginatorViewModelType<Blog>> {


    const blogOwnerIdFromToken = user.userId
    const blog = await this.blogsQueryRepository.getBlogByIdWithBloggerInfo(DTO.blogId)
    if(!blog){
      throw new NotFoundException()
    }
    const blogOwnerFromDB = blog.blogOwnerInfo.userId

    if(blogOwnerIdFromToken.toString() !== blogOwnerFromDB.toString()){
      throw new ForbiddenException()
    }
    const result = await this.commandBus.execute( new BanUserByBloggerCommand(DTO, userIdToBan, blogOwnerIdFromToken))
    if(!result){
      throw new NotFoundException()
    } else {
      return
    }

  }

  @UseGuards(AuthGuard)
  @Get("/users/blog/:blogId")
  @HttpCode(200)
  async getBannedUsersForSpecificBlog(
                          @Query() QueryParams,
                          @User() user,
                          @Res({passthrough : true}) res : Response,
                          @Param("blogId") blogId): Promise<PaginatorViewModelType<Blog>>{
    console.log("getting all banned users for specific blog procedure");
    const blogOwnerFromToken = user.userId
    const blog = await this.blogsQueryRepository.getBlogByIdWithBloggerInfo(blogId)
    console.log(blog , " blog in getting all banned users for specific blog procedure")
    if(!blog){
      throw new NotFoundException()
    }
    const blogOwnerFromDB = blog.blogOwnerInfo.userId
    console.log(blogOwnerFromToken.toString(), "userid from token");
    console.log(blogOwnerFromDB.toString(), "userid from DB");
    if(blogOwnerFromToken.toString() !== blogOwnerFromDB.toString()){
      throw new ForbiddenException()
    }
    const result = await this.commandBus.execute( new GetBannedUsersForSpecificBlogCommand(QueryParams,blogOwnerFromToken, blogId))
    if(!result){
      throw new NotFoundException()
    } else {
      return result
    }
  }
}
