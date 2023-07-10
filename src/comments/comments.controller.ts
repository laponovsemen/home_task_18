import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get, HttpCode, HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { Request, Response } from "express";
import { CommentForSpecifiedPostDTO, LikeStatusDTO } from "../input.classes";
import { AuthGuard } from "../auth/auth.guard";
import { CommentsService } from "./comments.service";
import { AuthService } from "../auth/auth.service";
import { LikeService } from "../likes/likes.service";
import {AccessToken} from "../auth/decorators/public.decorator";

@Controller('comments')
export class CommentsController {
  constructor(protected readonly commentsService : CommentsService,
              protected readonly authService : AuthService,
              protected readonly likeService : LikeService,
              ) {
  }
  @UseGuards(AuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeComment(@Req() req : Request,
                    @Res({passthrough : true}) res : Response,
                    @Param('commentId') commentId,
                    @Body() DTO : LikeStatusDTO){
    const token = req.headers.authorization.split(" ")[1]
    console.log(req.headers, "request.headers");
    const result = await this.likeService.likeComment(DTO, token, commentId);
    if(!result){
      throw new NotFoundException()
    }
    return true
  }


  @UseGuards(AuthGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(@Req() req : Request,
                      @Res({passthrough : true}) res : Response,
                      @Param('commentId') commentId,
                      @AccessToken() accessToken,
                      @Body() DTO : CommentForSpecifiedPostDTO){
    const token : string = accessToken
    console.log(token , " token")
    const userFromToken = await this.authService.getUserByToken(token)
    const commentToUpdate = await this.commentsService.getCommentById(commentId, token)
    console.log(commentToUpdate, " found comment to update in updateComment")
    if(!commentToUpdate){
      throw new NotFoundException()
    }
    const userIdFromDB = commentToUpdate.commentatorInfo.userId
    console.log(userIdFromDB, " userIdFromDB  in updateComment")
    console.log(userFromToken, " userFromToken  in updateComment")
    if(!userFromToken || userFromToken.id !== userIdFromDB){
      console.log("userFromToken.id !== userIdFromDB")
      throw new ForbiddenException()
    }


    const result = await this.commentsService.updateCommentById(commentId, DTO)
    if(!result){
      throw new NotFoundException()
    }
    return true
  }
  @UseGuards(AuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Req() req : Request,
                      @Res({passthrough : true}) res : Response,
                      @AccessToken() accessToken,
                      @Param('commentId') commentId){

    console.log(accessToken, " accessToken")
    const userFromToken = await this.authService.getUserByToken(accessToken)
    const commentToDelete = await this.commentsService.getCommentById(commentId, accessToken)
    if(!commentToDelete){
      throw new NotFoundException()
    }
    const userIdFromDB = commentToDelete.commentatorInfo.userId
    console.log(userIdFromDB, " userIdFromDB")
    console.log(userFromToken, " userFromToken")
    if(userFromToken.id !== userIdFromDB ){
      throw new ForbiddenException()
    }

    const result = await this.commentsService.deleteCommentById(commentId)
    if(!result){
      throw new NotFoundException()
    }
    return true
  }
  @Get(':commentId')
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Req() req : Request,
                       @Res({passthrough : true}) res : Response,
                       @Param('commentId') commentId){
    const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null
    const result =  await this.commentsService.getCommentById(commentId, token)
    console.log(result, "result 228")
    if(!result){
      throw new NotFoundException("post not found")
    }
    return result
  }

}
