import {
  Body,
  Controller,
  Delete, ForbiddenException,
  Get, HttpCode, HttpStatus, NotFoundException,
  Param,
  Post,
  Put,
  Query, Req, Res, UploadedFile, UseGuards, UseInterceptors
} from "@nestjs/common";
import {

  APIPostDTO,
  WithMongoId,
  WithPagination
} from "../mongo/mongooseSchemas";
import { Common } from "../common";
import {
  BlogInsertModelType,
  BlogsPaginationCriteriaType, BlogViewModelType,
  paginationCriteriaType,
  PaginatorViewModelType,
  PostsPaginationCriteriaType
} from "../appTypes";
import express, { Express, Request, Response } from "express";
import { BlogsService } from "./blogs.service";
import { isNotEmpty, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";
import { AllPostsForSpecificBlogGuard, AuthGuard, BasicAuthGuard } from "../auth/auth.guard";
import { BanUserByBloggerDTO, BlogDTO, PostForSpecificBlogDTO } from "../input.classes";
import { User } from "../auth/decorators/public.decorator";
import { CommandBus } from "@nestjs/cqrs";
import { GettingAllBlogsForSpecifiedBloggerCommand } from "./use-cases/getting-all-blogs-for-specified-blogger";
import { PostsService } from "../posts/posts.service";
import { GetAllCommentForUserCommand } from "./use-cases/get-all-comments-for-user";
import { Blog } from "../entities/blog-entity";
import { UsersService } from "../users/users.service";
import { BlogImagesViewModel } from "./blogs.view.models/blog.images.view.model";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  UploadBackgroundWallPapperForSpecificBlogCommand
} from "./use-cases/upload.background.wallpaper.for.specific.blog";
import { UploadMainPhotosForSpecificBlogCommand } from "./use-cases/upload.main.photos.for.specific.blog";
import { FileValidator } from "../auth/custom.validators/file-size.validator";
import { FileValidatorPipe } from "../auth/custom.validators/file-validator.pipe";
import { PostImagesViewModel } from "../posts/posts.view.models/post.images.view.model";
import {
  UploadMainPhotosForPostForSpecificBlogCommand
} from "../posts/use-cases/upload.main.photos.for.post.for.specific.blog";
import { APIPost } from "../entities/api-post-entity";
import { PostsQueryRepository } from "../posts/posts.query.repository";
import { TokenPayload } from "../working.classess";


@UseGuards(AuthGuard)

@Controller("/blogger/blogs")
export class BloggerBlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly userService: UsersService,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly common: Common,
    private readonly commandBus: CommandBus,
    private readonly postsService: PostsService
  ) {
  }


  @Post(":blogId/images/wallpaper")
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file"))
  async uploadBackGroundWallPapperForBlog(@Res({ passthrough: true }) res: Response,
                                          @Req() req: Request,
                                          @User() user,
                                          @UploadedFile(
                                            new FileValidatorPipe(
                                              {
                                                width: 1028,
                                                height: 312,
                                                type: ['jpeg', 'jpg','png'],
                                                fileSize: 100 * 1000 /* 10 MB */ }
                                            )
                                          ) file: Express.Multer.File,
                                          @Param("blogId") blogId): Promise<BlogImagesViewModel> {
    const foundBlog : Blog = await this.blogsService.getBlogByIdWithBloggerInfo(blogId);
    console.log(" Blog not found in updateBlogById");
    if (!foundBlog) {
      throw new NotFoundException("Blog not found");
    }
    if (foundBlog.blogOwner.id.toString() !== user.userId) {
      throw new ForbiddenException("Blog not found");
    }

    const wallpaperUploadResult: BlogImagesViewModel = await this.commandBus.execute(new UploadBackgroundWallPapperForSpecificBlogCommand(
      foundBlog,
      file.originalname,
      file.mimetype,
      file.buffer
    ));

    return wallpaperUploadResult;

  }

  @Post(":blogId/images/main")
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file"))
  async uploadMainForBlog(@Res({ passthrough: true }) res: Response,
                                          @Req() req: Request,
                                          @User() user,
                                          @UploadedFile(
                                            new FileValidatorPipe(
                                              {
                                                width: 156,
                                                height: 156,
                                                type: ['jpeg', 'jpg','png'],
                                                fileSize: 100 * 1000 /* 10 MB */ }
                                            )) file: Express.Multer.File,
                                          @Param("blogId") blogId): Promise<BlogImagesViewModel> {
    const foundBlog : Blog = await this.blogsService.getBlogByIdWithBloggerInfo(blogId);
    console.log(" Blog not found in updateBlogById");
    if (!foundBlog) {
      throw new NotFoundException("Blog not found");
    }
    if (foundBlog.blogOwner.id.toString() !== user.userId) {
      throw new ForbiddenException("Blog not found");
    }

    const mainUploadResult: BlogImagesViewModel = await this.commandBus.execute(new UploadMainPhotosForSpecificBlogCommand(
      foundBlog,
      file.originalname,
      file.mimetype,
      file.buffer
    ));

    return mainUploadResult;

  }


  @Post(":blogId/posts/:postId/images/main")
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file"))
  async uploadMainForPostForSpecificBlog(@Res({ passthrough: true }) res: Response,
                          @Req() req: Request,
                          @User() user,
                          @UploadedFile(
                            new FileValidatorPipe(
                              {
                                width: 940,
                                height: 432,
                                type: ['jpeg', 'jpg','png'],
                                fileSize: 100 * 1000 /* 10 MB */ }
                            )) file: Express.Multer.File,
                                         @Param("blogId") blogId,
                                         @Param("postId") postId): Promise<PostImagesViewModel> {
    const foundBlog: Blog = await this.blogsService.getBlogByIdWithBloggerInfo(blogId);
    console.log(" Blog not found in updateBlogById");
    if (!foundBlog) {
      throw new NotFoundException("Blog not found");
    }
    const foundPost : APIPost = await this.postQueryRepository.getPostById(postId);
    if (!foundPost) {
      throw new NotFoundException("Post not found");
    }
    if (foundBlog.blogOwner.id.toString() !== user.userId) {
      throw new ForbiddenException("Blog not found");
    }

    const mainUploadResult: PostImagesViewModel = await this.commandBus.execute(new UploadMainPhotosForPostForSpecificBlogCommand(
      foundPost,
      file.originalname,
      file.mimetype,
      file.buffer
    ));

    return mainUploadResult;

  }
  @Get("/comments")
  @HttpCode(200)
  async getAllCommentsForSpecificBlog(@Req() req: Request,
                                      @Res({ passthrough: true }) res: Response,
                                      @Query() QueryParams,
                                      @User() userFromToken
  ) {
    return await this.commandBus.execute(new GetAllCommentForUserCommand(QueryParams, userFromToken));


  }

  @Get()
  @HttpCode(200)
  async getAllBlogs(@Query() QueryParams,
                    @User() user): Promise<PaginatorViewModelType<Blog>> {
    console.log("getting all blogs procedure");
    const userId = user.userId;
    return this.commandBus.execute(new GettingAllBlogsForSpecifiedBloggerCommand(QueryParams, userId));
  }

  @Post()
  async createNewBlog(@Body() DTO: BlogDTO,
                      @User() user
  ): Promise<any> {
    const foundBlog = await this.blogsService.createNewBlog(DTO, user);
    const { banInfo, ...result } = foundBlog; // ask what it is ???
    return result;
  }

  @Get(":id/posts")
  @HttpCode(200)
  async getAllPostsForSpecificBlog(@Req() req: Request,
                                   @Res({ passthrough: true }) res: Response,
                                   @Query() QueryParams,
                                   @Param("id") blogId) {
    const token = req.headers.authorization;
    console.log(token, "accessToken");
    const paginationCriteria: paginationCriteriaType = this.common.getPaginationCriteria(QueryParams);
    const result = await this.blogsService.getAllPostsForSpecificBlog(paginationCriteria, blogId, token);
    console.log(result);
    if (!result) {
      throw new NotFoundException("Blog not found");
    }
    return result;

  }

  @Post("/:id/posts")
  @HttpCode(201)
  async createPostForSpecificBlog(
    @Body() DTO: PostForSpecificBlogDTO,
    @Param("id") blogId,
    @Res({ passthrough: true }) res: Response,
    @User() user
  ): Promise<any | void> {
    const foundBlog = await this.blogsService.getBlogByIdWithBloggerInfo(blogId);
    const foundUserInDB = await this.userService.findUserById(user.userId); // to delete after test ht22
    const allUsersFromDBWithoutPagination = await this.userService.getAllUsersFromDBWithoutPagination(); // to delete after test ht22
    if (!foundBlog) {
      console.log("blog not found");
      throw new NotFoundException("Blog not found");
    }
    console.log(foundBlog, " foundBlog");
    if (foundBlog.blogOwner.id !== user.userId) {
      console.log("FORBIDDEN EXCEPTION");
      console.log(foundBlog, " foundBlog");
      console.log(user, " user");
      console.log(foundBlog.blogOwner.id, " foundBlog.blogOwner.id");
      console.log(user.userId, " user.userId");
      console.log(foundUserInDB, " foundUserInDB");
      console.log(allUsersFromDBWithoutPagination, " ебаный тайпорм сука");
      throw new ForbiddenException("Blog not found");

    }

    const result = await this.blogsService.createPostForSpecificBlog(DTO, blogId);
    if (!result) {
      throw new NotFoundException("Blog not found");
    } else {
      return result;
    }
  }


  @Get(":id")
  async getBlogById(@Res({ passthrough: true }) res: Response,
                    @Param("id") id,
                    @User() tokenPayload : TokenPayload): Promise<any> {
    const result = await this.blogsService.getBlogById(id, tokenPayload.userId);
    if (!result) {
      throw new NotFoundException("Blog not found");
    }
    return result;
  }


  @Put(":id")
  @HttpCode(204)
  async updateBlogById(@Res({ passthrough: true }) res: Response,
                       @Req() req: Request,
                       @Body() DTO: BlogDTO,
                       @User() user,
                       @Param("id") id): Promise<void> {
    const foundBlog = await this.blogsService.getBlogByIdWithBloggerInfo(id);
    console.log(" Blog not found in updateBlogById");
    if (!foundBlog) {
      throw new NotFoundException("Blog not found");
    }
    if (foundBlog.blogOwner.id.toString() !== user.userId) {
      throw new ForbiddenException("Blog not found");
    }

    const updateResult = await this.blogsService.updateBlogById(DTO, id);

    return;

  }

  @Delete(":id")
  @HttpCode(204)
  async deleteBlogById(@Res({ passthrough: true }) res: Response,
                       @User() user,
                       @Param("id") id) {

    const foundBlog = await this.blogsService.getBlogByIdWithBloggerInfo(id);
    if (!foundBlog) {
      throw new NotFoundException("Blog not found");
    }
    if (foundBlog.blogOwner.id.toString() !== user.userId) {
      throw new ForbiddenException("Blog not found");
    }

    const deletedBlog = await this.blogsService.deleteBlogById(id);

    return;

  }


  @Put("/:blogId/posts/:postId")
  @HttpCode(204)
  async updatePostForSpecificBlogById(@Res({ passthrough: true }) res: Response,
                                      @Req() req: Request,
                                      @Body() DTO: PostForSpecificBlogDTO,
                                      @User() user,
                                      @Param("blogId") blogId,
                                      @Param("postId") postId
  ): Promise<void> {
    const foundBlog = await this.blogsService.getBlogByIdWithBloggerInfo(blogId);
    if (!foundBlog) {
      throw new NotFoundException("Blog not found");
    }
    //console.log(foundBlog, "foundBlog in /:blogId/posts/:postId");
    //console.log(foundBlog.blogOwnerInfo.userId.toString(), "foundBlog.blogOwnerInfo.userId.toString()");
    //console.log(user.userId, "user.userId");

    if (foundBlog.blogOwner.id.toString() !== user.userId.toString()) {
      throw new ForbiddenException("Blog not found");
    }

    const updateResult = await this.postsService.updatePostById(DTO, postId);

    //console.log(updateResult, "updateResult");

    if (!updateResult) {
      throw new NotFoundException("Post not found");
    }
    return;

  }

  @Delete("/:blogId/posts/:postId")
  @HttpCode(204)
  async deletePostForSpecificBlogById(@Res({ passthrough: true }) res: Response,
                                      @User() user,
                                      @Param("blogId") blogId,
                                      @Param("postId") postId
  ) {

    const foundBlog = await this.blogsService.getBlogByIdWithBloggerInfo(blogId);
    if (!foundBlog) {
      throw new NotFoundException("Blog not found");
    }

    if (foundBlog.blogOwner.id.toString() !== user.userId) {
      throw new ForbiddenException("Blog not found");
    }

    const deletedPost = await this.postsService.deletePostById(postId);
    if (!deletedPost) {
      throw new NotFoundException("Post not found");
    }
    return;

  }
}
