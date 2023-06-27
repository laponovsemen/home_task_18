import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { APIComment, APIPost, Blog, BlogDocument } from "../mongo/mongooseSchemas";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { paginationCriteriaType } from "../appTypes";
import { Common } from "../common";
import { LikeRepository } from "../likes/likes.repository";
import {DataSource} from "typeorm";
import {PostDTO} from "../input.classes";

@Injectable()
export class PostsRepository {
  constructor(protected readonly dataSource: DataSource,
              protected readonly common: Common,
              protected readonly likeRepository: LikeRepository,
  ) {
  }

  async createNewPost(DTO: any) {
    const blogId = this.common.tryConvertToObjectId(DTO.blogId)
    const createdAt = new Date()
    if(!blogId){
      return null
    }
    const blog = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    if(!blog) return null;
    const newPost = {
      title: DTO.title, //    maxLength: 30
      shortDescription: DTO.shortDescription, //maxLength: 100
      content: DTO.content, // maxLength: 1000
      blogId: new ObjectId(blogId),
      blogName: blog.name,
      createdAt: createdAt,
    }
    const createdPost = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    return {
      id: createdPost._id,
      title: DTO.title, //    maxLength: 30
      shortDescription: DTO.shortDescription, //maxLength: 100
      content: DTO.content, // maxLength: 1000
      blogId: new ObjectId(blogId),
      blogName: blog.name,
      createdAt: createdAt,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: "None",
        newestLikes: [],
      },
    }

  }

  async getPostById(postId: string, userId : string) {
    console.log(isNaN(parseInt(postId, 10)), parseInt(postId, 10),postId, "parse")
    if (!postId) {
      return null
    }
    let foundPostQuery
    try {
      foundPostQuery = await this.dataSource.query(`
    SELECT * FROM public."APIPostTable"
    WHERE "id" = $1 AND "isHiden" = $2;
    `, [postId, false])
    } catch (error) {
      console.log(error)
      return null
    }

    const foundPost = foundPostQuery[0]
    if (foundPostQuery.length === 0) {
      console.log("empty result of query ingetPostById")
      return null
    } else {
      console.log(userId , "userId in getPostById");
      const foundPostFrame = this.common.SQLPostMapping(foundPost)
      //const likesCount = await this.likeRepository.findLikesCountForSpecificPost(postId)
      //const dislikesCount = await this.likeRepository.findDisikesCountForSpecificPost(postId)
      //const newestLikes = await this.likeRepository.findNewestLikesForSpecificPost(postId)
      //const myLike = await this.likeRepository.findMyStatusForSpecificPost(postId, userId)
      //foundPostFrame.extendedLikesInfo.likesCount = likesCount
      //foundPostFrame.extendedLikesInfo.dislikesCount = dislikesCount
      //foundPostFrame.extendedLikesInfo.newestLikes = newestLikes
      //foundPostFrame.extendedLikesInfo.myStatus = myLike ? myLike.status : "None"
      //console.log(foundPostFrame);
      //console.log(foundPostFrame, "foundPostFrame");
      //console.log(myLike , "myLike");
      //console.log(userId , "userId");
      return foundPostFrame
    }
  }

  async getAllPosts(paginationCriteria: paginationCriteriaType) {

    const pageSize = paginationCriteria.pageSize;
    const totalCount = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

    const result = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    const items = result.map((item) => {
      return this.common.SQLPostMapping(item)
    });

    /*console.log({
        pageSize: pageSize,
        totalCount: totalCount,
        pagesCount: pagesCount,
        page: page,
        items: items,
      },
      'its fucking result',
    );*/
    return {
      pageSize: pageSize,
      totalCount: totalCount,
      pagesCount: pagesCount,
      page: page,
      items: items,
    };
  }
  async deletePostById(id : string) {
    let postId = 0
    try{
      postId = parseInt(id, 10)
    } catch {
      return null
    }
    if(!postId){
      return null
    }
    const foundPostQuery =await this.dataSource.query(`
    SELECT * FROM public."APIPostTable"
    WHERE "id" = $1;
    `, [postId])
    if(foundPostQuery.length === 0){
      return null
    }

    const deletedPost = await this.dataSource.query(`
    DELETE FROM public."APIPostTable"
    WHERE "id" = $1;
    `, [postId])
    return  true
  }
  async updatePostById( DTO : PostDTO, id : string) {
    let postId = 0
    try{
      postId = parseInt(id, 10)
    } catch {
      return null
    }
    console.log(postId, " postId after convert");

    if(!postId){
      return null
    }
    const foundPostQuery = await this.dataSource.query(`
    SELECT * FROM public."APIPostTable"
    WHERE "id" = $1;
    `, [postId])
    if(foundPostQuery.length === 0){
      return null
    }


    const updatedPost = await this.dataSource.query(`
    UPDATE public."APIPostTable"
    SET "title" = $2 , "shortDescription" = $3 , "content" = $4
    WHERE "id" = $1;
    `, [postId, DTO.title, DTO.shortDescription, DTO.content])

    return true
  }
  async deleteAllData(){
    await this.dataSource.query(`
    DELETE FROM public."APIPostTable"
    WHERE 1 = 1
   ;
    `)
  }

  async getAllCommentsForSpecificPosts(paginationCriteria: paginationCriteriaType, id: string) {
    const foundPost = await this.dataSource.query(`
    SELECT * FROM public."APIPostTable"
    WHERE "id" = $1 ;
    `, [id])
    if (!foundPost[0]) {
      console.log("post not found")
      return null
    } else {
      const pageSize = paginationCriteria.pageSize;

      const totalCountQuery = await this.dataSource.query(`
            SELECT CAST(COUNT(*) AS INTEGER) FROM public."APICommentTable"
            WHERE "postId" = $1 AND "isHiden" = $2
    `, [id, false])
      const totalCount = totalCountQuery[0].count
      const pagesCount = Math.ceil(totalCount / pageSize);
      const page = paginationCriteria.pageNumber;
      const sortBy = paginationCriteria.sortBy;
      const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
      const ToSkip =
        paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

      const result = await this.dataSource.query(`
            SELECT * 
            FROM 
            public."APICommentTable" c
            LEFT JOIN 
            public."UserTable" u
            ON c."commentatorId" = u."id"
            WHERE "postId" = $1 AND "isHiden" = $2
            ORDER BY c."${sortBy}" ${sortDirection.toUpperCase()}
            LIMIT $3 OFFSET $4
    `, [id, false, pageSize, ToSkip])
      const items = result.map((item) => {
        return this.common.SQLCommentMapping(item)
      });
      return {
        pagesCount,
        page,
        totalCount,
        pageSize,
        items
      }
    }

  }

  async getPostByIdWithOutLikes(postIdAsString: string) {

    if(!postIdAsString){
      return null
    }
    const foundPostQuery = await this.dataSource.query(`
    SELECT *  FROM public."APIPostTable"
    WHERE "id" = $1;
    `, [postIdAsString])
    const foundPost = foundPostQuery[0]
    return foundPost
  }

  async makeAllPostsForBlogHiden(blogId: string) {
    await this.dataSource.query(`
    UPDATE public."APIPostTable"
    SET "isHiden" = $2
    WHERE "blogId" = $1;

    `, [blogId, true])
  }

  async makeAllPostsForBlogVisible(blogId: string) {
    await this.dataSource.query(`
    UPDATE public."APIPostTable"
    SET "isHiden" = $2
    WHERE "blogId" = $1;

    `, [blogId, false])
  }
}