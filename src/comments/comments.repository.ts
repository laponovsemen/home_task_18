import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { APIComment, CommentsDocument } from "../mongo/mongooseSchemas";
import { ObjectId } from "mongodb";
import { CommentForSpecifiedPostDTO } from "../input.classes";
import { Common } from "../common";
import { LikeRepository } from "../likes/likes.repository";
import {DataSource} from "typeorm";

@Injectable()
export class CommentsRepository{
  constructor(protected readonly dataSource: DataSource,
              protected readonly common : Common,
              protected readonly likeRepository : LikeRepository,
  ) {
  }
  async deleteAllData(){
    await this.dataSource.query(`
    DELETE FROM public."APICommentTable"
    WHERE 1 = 1;
    `)
  }
  async createNewComment(newComment : APIComment){
    const comment = await this.dataSource.query(`
    INSERT INTO public."APICommentTable"("content", "commentatorId", "createdAt", "postId", "isHiden")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING CAST("id" AS TEXT);
    `,[newComment.content, newComment.commentatorInfo.userId,newComment.createdAt, newComment.postId, newComment.isHiden])


    console.log(comment, " commentSelectQuery")
    return comment[0]
  }

  async getCommentById(commentId: string, userId: string) {
    if (!commentId) {
      return null
    }
    let foundCommentQuery
    try {
      foundCommentQuery = await this.dataSource.query(`
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
    `, [commentId, false])
    } catch (e) {
      console.log(e)
      return null
    }
    const foundComment = foundCommentQuery[0]
    console.log(foundCommentQuery , " foundCommentQuery")


    if (foundCommentQuery.length === 0) {
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
    const foundComment = await this.dataSource.query(`
    SELECT *  FROM public."APICommentTable"
    WHERE "id" = $1;
    `, [commentId])

    console.log(foundComment, " foundComment deleteCommentById")
    if (foundComment.length === 0){
      return null
    }

    const deletedComment = await this.dataSource.query(`
    DELETE FROM public."APICommentTable"
    WHERE "id" = $1;
    `, [commentId])
    return true
  }

  async updateCommentById(commentId: string, DTO: CommentForSpecifiedPostDTO) {

    const result = await this.dataSource.query(`
    UPDATE public."APICommentTable"
    SET "content" = $2
    WHERE "id" = $1;
    `, [commentId, DTO.content])

    return true
  }

  async getCommentByIdWithOutLikes(commentId: string) {
    const query = await this.dataSource.query(`
    SELECT * FROM public."APICommentTable"
    WHERE "id" = $1
    `, [commentId])
    console.log(query, " query in getCommentByIdWithOutLikes")
    return query[0]
  }

  async makeCommentsHiden(userId: string) {
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }
  async makeCommentsVisible(userId: string) {
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }
}