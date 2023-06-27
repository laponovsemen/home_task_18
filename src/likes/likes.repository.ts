import { LikeStatusDTO } from "../input.classes";
import { ObjectId } from "mongodb";
import { InjectModel } from "@nestjs/mongoose";
import { APILike, LikesDocument, parentTypeEnum, StatusTypeEnum } from "../mongo/mongooseSchemas";
import { Model, Types } from "mongoose";
import { Injectable } from "@nestjs/common";
import { Common } from "../common";
import {DataSource} from "typeorm";


@Injectable()
export class LikeRepository{
  constructor(protected readonly dataSource: DataSource,
              protected readonly common : Common) {
  }
  async createNewLike(Like : APILike){

  }

  async likePost(DTO: LikeStatusDTO, Id: string, login : string, postId: string) {
    const myLike = await this.findMyStatusForSpecificPost(postId, Id)
    const status = DTO.likeStatus
    if (!myLike) {
      const dateOfCreation = new Date().toISOString()
      const parentId = postId
      const parentType = parentTypeEnum.post
      const addedAt = dateOfCreation
      const userId = Id

      await this.dataSource.query(`
     INSERT INTO public."APILikeTable"(
    "parentId", "parentType", "addedAt", "userId", "login", "status", "isHiden")
    VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [parentId, parentType, addedAt, userId, login, status, false])
      return true
    } else {

      await this.changeMyLikeStatus(status, Id,  postId, parentTypeEnum.post)

      return true
    }
  }

  async changeMyLikeStatus(status : StatusTypeEnum, userId : string, parentId: string, parentType: parentTypeEnum){
    await this.dataSource.query(`
    UPDATE public."APILikeTable"
    SET status = $1
    WHERE "userId" = $2 AND "parentId" = $3 AND "parentType" = $4;
    `, [status, userId, parentId, parentType])

  }

  async findLikesCountForSpecificPost(postId: string) {
    const likes = await this.dataSource.query(`
    SELECT cast(count(*) as INTEGER) FROM public."APILikeTable"
    WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3;
    `, [parentTypeEnum.post, postId, StatusTypeEnum.Like])
    return likes[0].count

  }

  async findDisikesCountForSpecificPost(postId: string) {
    const dislikes = await this.dataSource.query(`
    SELECT cast(count(*) as INTEGER) FROM public."APILikeTable"
    WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3;
    `, [parentTypeEnum.post, postId, StatusTypeEnum.Dislike])
    return dislikes[0].count
  }

  async findNewestLikesForSpecificPost(postId: string) {

    const newestLikesToUpdate = await this.dataSource.query(`
   SELECT 
   "login",
   "addedAt",
   "userId"
    FROM public."APILikeTable"
    WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3 AND "isHiden" = $4;
    `, [parentTypeEnum.post, postId, StatusTypeEnum.Like, false])

    //console.log(newestLikesToUpdate, " newestLikesToUpdate")
    return newestLikesToUpdate
  }

  async findMyStatusForSpecificPost(postId: string, userId: string) {
    console.log(userId, "userIdAsString")
    console.log(postId, "postId")
    if(!userId){
      console.log(userId, "нету юзер ай ди");
      return null

    }
    console.log("before filter");


    const result = await this.dataSource.query(`
    SELECT "status" FROM public."APILikeTable"
    WHERE "parentId" = $1 AND "userId" = $2 AND "parentType" = $3;
    `, [postId, userId, parentTypeEnum.post])
    console.log(result, "result");
    return result[0] ? result[0].status : null
  }
  async findMyStatusForComment(commentId: string, userIdAsString: string) {
    if(!userIdAsString){
      return null
    }

    const result = await this.dataSource.query(`
    SELECT * FROM public."APILikeTable"
    WHERE "parentId" = $1 AND "parentType" = $2 AND "userId" = $3;
    `, [commentId, parentTypeEnum.comment, userIdAsString])
    console.log(result, " MY STATUS IN findMyStatusForComment");
    return result
  }

  async deleteAllData(){
    await this.dataSource.query(`
    DELETE FROM public."APILikeTable"
    WHERE 1 = 1;
    `)
  }

  async likeComment(DTO: LikeStatusDTO, userIdFromToken: string, login: string, commentId: string) {
    const [myLike] = await this.findMyStatusForComment(commentId, userIdFromToken)
    const status = DTO.likeStatus
    if (!myLike) {
      const dateOfCreation = new Date()
      const parentId = commentId
      const parentType = parentTypeEnum.comment
      const addedAt = dateOfCreation
      const userId = userIdFromToken

      await this.dataSource.query(`
      INSERT INTO public."APILikeTable"(
     "parentId", "parentType", "addedAt", "userId", "login", "status", "isHiden")
        VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [parentId, parentType, addedAt, userId, login, status, false])
      return true
    } else {

      await this.changeMyLikeStatus(status, userIdFromToken,  commentId, parentTypeEnum.comment)

      return true
    }
  }

  async findLikesCountForSpecificComment(commentId: string) {
    const likes = await this.dataSource.query(`
    SELECT cast(count(*) as INTEGER) FROM public."APILikeTable"
    WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3;
    `, [parentTypeEnum.comment, commentId, StatusTypeEnum.Like])
    console.log(likes[0].count, " findLikesCountForSpecificComment")
    return likes[0].count
  }

  async findDisikesCountForSpecificComment(commentId: string) {
    const dislikes = await this.dataSource.query(`
    SELECT cast(count(*) as INTEGER) FROM public."APILikeTable"
    WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3;
    `, [parentTypeEnum.comment, commentId, StatusTypeEnum.Dislike])
    console.log(dislikes[0].count, " findDisikesCountForSpecificComment")
    return dislikes[0].count
  }

  async findMyStatusForSpecificComment(commentId: string, userId: string) {

    console.log(userId, "after user id");
    if(!userId){
      console.log(userId, "нету юзер ай ди");
      return null
    }

    console.log("before filter");
    console.log({
      parentId: commentId,
      parentType: parentTypeEnum.comment,
      userId: userId
    }, "filter");
    const filter = {
      parentId: commentId,
      parentType: parentTypeEnum.comment,
      userId: userId
    }

    const result = await this.dataSource.query(`
    SELECT "status" FROM public."APILikeTable"
    WHERE "parentType" = $1 AND "parentId" = $2 AND "userId" = $3;
    `, [parentTypeEnum.comment, commentId, userId])

    console.log(result, "result");
    return result[0] ? result[0].status : null

  }

  async makeLikesHiden(userId: string) {
    await this.dataSource.query(`
    UPDATE public."APILikeTable"
    SET "isHiden" = $2
    WHERE "userId" = $1;
    `, [userId, true])
  }
  async makeLikesVisible(userId: string) {
    await this.dataSource.query(`
    UPDATE public."APILikeTable"
    SET "isHiden" = $2
    WHERE "userId" = $1;
    `, [userId, false])
  }
}