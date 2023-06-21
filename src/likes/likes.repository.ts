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
    const myLike = await this.findMyStatusForSpecificPost(new ObjectId(postId), Id)
    const status = DTO.likeStatus
    if (!myLike) {
      const dateOfCreation = new Date()
      const parentId = new ObjectId(postId)
      const parentType = parentTypeEnum.post
      const addedAt = dateOfCreation
      const userId = new ObjectId(Id)


      const newLikeToCreate: APILike = {
        parentId: parentId,
        parentType: parentType,
        addedAt: addedAt,
        userId: userId,
        login: login,
        status: status,
        isHiden : false
      }
      await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
      return true
    } else {

      await this.changeMyLikeStatus(status, Id,  postId, parentTypeEnum.post)

      return true
    }
  }

  async changeMyLikeStatus(status : StatusTypeEnum, userId : string, parentId: string, parentType: parentTypeEnum){
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)

  }

  async findLikesCountForSpecificPost(postId: ObjectId) {
    const likes = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)

    return likes.length
  }

  async findDisikesCountForSpecificPost(postId: ObjectId) {
    const dislikes = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    return dislikes.length

  }

  async findNewestLikesForSpecificPost(postId:ObjectId) {
    const likesFilter = { $and: [
        { parentId: postId },
        { parentType: parentTypeEnum.post },
        { status: StatusTypeEnum.Like },
        { isHiden : false}
      ] }
    const newestLikesToUpdate = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)

    //console.log(newestLikesToUpdate, " newestLikesToUpdate")
    return newestLikesToUpdate
  }

  async findMyStatusForSpecificPost(postId: ObjectId, userIdAsString: string) {
    console.log(userIdAsString, "userIdAsString")
    const userId = this.common.tryConvertToObjectId(userIdAsString)
    console.log(userId, "after user id");
    if(!userId){
      console.log(userId, "нету юзер ай ди");
      return null

    }
    console.log("before filter");
    console.log({
      parentId: postId,
      parentType: parentTypeEnum.post,
      userId: userId
    }, "filter");
    const filter = {
      parentId: postId,
      parentType: parentTypeEnum.post,
      userId: userId
    }

    const result = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    console.log(result, "result");
    return result
  }
  async findMyStatusForComment(commentId: ObjectId, userIdAsString: string) {
    const userId = this.common.tryConvertToObjectId(userIdAsString)
    if(!userId){
      return null
    }
    const filter = {
      $and:
        [
          { parentId: commentId },
          { parentType: parentTypeEnum.comment },
          { userId: new ObjectId(userId) }
        ]
    }
    const result = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    console.log(result);
    return result
  }

  async deleteAllData(){
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async likeComment(DTO: LikeStatusDTO, userIdFromToken: string, login: string, commentId: string) {
    const myLike = await this.findMyStatusForComment(new ObjectId(commentId), userIdFromToken)
    const status = DTO.likeStatus
    if (!myLike) {
      const dateOfCreation = new Date()
      const parentId = new ObjectId(commentId)
      const parentType = parentTypeEnum.comment
      const addedAt = dateOfCreation
      const userId = new ObjectId(userIdFromToken)


      const newLikeToCreate: APILike = {
        parentId: parentId,
        parentType: parentType,
        addedAt: addedAt,
        userId: userId,
        login: login,
        status: status,
        isHiden : false
      }
      await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
      return true
    } else {

      await this.changeMyLikeStatus(status, userIdFromToken,  commentId, parentTypeEnum.comment)

      return true
    }
  }

  async findLikesCountForSpecificComment(commentId: ObjectId) {
    const likes = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    return likes.length
  }

  async findDisikesCountForSpecificComment(commentId: ObjectId) {
    const dislikes = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    return dislikes.length
  }

  async findMyStatusForSpecificComment(commentId: ObjectId, userIdAsString: string) {
    console.log(userIdAsString, "userIdAsString")
    const userId = this.common.tryConvertToObjectId(userIdAsString)
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
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    console.log(result, "result");
    return result

  }

  async makeLikesHiden(userId: string) {
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }
  async makeLikesVisible(userId: string) {
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }
}