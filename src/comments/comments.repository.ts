import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { CommentForSpecifiedPostDTO } from "../input.classes";
import { Common } from "../common";
import { LikeRepository } from "../likes/likes.repository";
import {DataSource, Repository} from "typeorm";
import {APIComment} from "../entities/api-comment-entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Blog} from "../entities/blog-entity";

@Injectable()
export class CommentsRepository{
  constructor(protected readonly dataSource: DataSource,
              protected readonly common : Common,
              @InjectRepository(APIComment) protected commentsTypeORMRepository : Repository<APIComment>,
              protected readonly likeRepository : LikeRepository,
  ) {
  }
  async deleteAllData(){
    await this.commentsTypeORMRepository.delete({})
  }
  async createNewComment(newComment : any, ){
    console.log(newComment, " new comment to create")
    /*const comment = await this.dataSource.query(`
    INSERT INTO public."APICommentTable"("content", "commentatorId", "createdAt", "postId", "isHiden")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING CAST("id" AS TEXT);
    `,[newComment.content, newComment.commentatorInfo.userId,newComment.createdAt, newComment.postId, newComment.isHiden])*/

    const comment = await this.commentsTypeORMRepository
        .save(newComment)

    console.log(comment, " commentSelectQuery")
    return comment
  }

  async getCommentById(commentId: string, userId: string) {
    if (!commentId) {
      return null
    }


    /*const  foundCommentQuery = await this.dataSource.query(`
    SELECT 
      cast(c."id" as TEXT),
      c."content",
      c."createdAt",
      c."postId",
      c."isHiden",
      cast(c."commentatorId" as TEXT),
      u."login"
    FROM public."APICommentTable" c
    LEFT JOIN 
    public."UserTable" u
    ON c."commentatorId" = u."id"
    WHERE c."id" =  $1 AND u."isBanned" = $2
    `, [commentId, false])*/

    const foundComment = await this.commentsTypeORMRepository
        .findOne({
          relations:{
            commentator : true
          },
          where : {
            id : commentId,
            commentator : {
              isBanned : false
            }
          }
        })
    console.log(foundComment , " foundCommentQuery")


    if (!foundComment) {
      return null
    } else {
      console.log(userId, "userId in getPostById");
      const foundCommentFrame = this.common.SQLCommentMapping(foundComment)
      const likesCount = await this.likeRepository.findLikesCountForSpecificComment(commentId)
      const dislikesCount = await this.likeRepository.findDisikesCountForSpecificComment(commentId)
      const myLike = await this.likeRepository.findMyStatusForSpecificComment(commentId, userId)
      foundCommentFrame.likesInfo.likesCount = likesCount
      foundCommentFrame.likesInfo.dislikesCount = dislikesCount
      foundCommentFrame.likesInfo.myStatus = myLike ? myLike : "None"
      //console.log(foundPostFrame);
      //console.log(foundPostFrame, "foundPostFrame");
      console.log(myLike, "myLike");
      //console.log(userId , "userId");
      console.log(foundCommentFrame, "результат")
      return foundCommentFrame
    }
  }

  async deleteCommentById(commentId: string) {


    /*const deletedComment = await this.dataSource.query(`
    DELETE FROM public."APICommentTable"
    WHERE "id" = $1;
    `, [commentId])*/

    const deletedComment = await this.commentsTypeORMRepository
        .delete({
          id : commentId
        })

    return true
  }

  async updateCommentById(commentId: string, DTO: CommentForSpecifiedPostDTO) {

    /*const result = await this.dataSource.query(`
    UPDATE public."APICommentTable"
    SET "content" = $2
    WHERE "id" = $1;
    `, [commentId, DTO.content])*/

    const result = await this.commentsTypeORMRepository
        .update({
          id : commentId
        },{
          content : DTO.content
        })

    return true
  }

  async getCommentByIdWithOutLikes(commentId: string) {
    /*try {
      query = await this.dataSource.query(`
    SELECT * FROM public."APICommentTable"
    WHERE "id" = $1
    `, [commentId])
    } catch (e) {
      console.log(e)
      return null
    }*/

    const comment = await this.commentsTypeORMRepository
        .findOneBy({
          id : commentId
        })

    console.log(comment, " query in getCommentByIdWithOutLikes")
    return comment
  }

  async makeCommentsHiden(userId: string) {
    /*await this.dataSource.query(`
    UPDATE public."APICommentTable"
    SET "isHiden" = $2
    WHERE "commentatorId" = $1;
    `, [userId, true])*/

    await this.commentsTypeORMRepository
        .update({commentator: {id : userId}},
            {isHiden : true})
  }
  async makeCommentsVisible(userId: string) {
    /*await this.dataSource.query(`
    UPDATE public."APICommentTable"
    SET "isHiden" = $2
    WHERE "commentatorId" = $1;
    `, [userId, false])*/

    await this.commentsTypeORMRepository
        .update({commentator: {id : userId}},
            {isHiden : false})
  }
}