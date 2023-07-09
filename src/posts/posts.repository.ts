import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { paginationCriteriaType } from "../appTypes";
import { Common } from "../common";
import { LikeRepository } from "../likes/likes.repository";
import {DataSource, Repository} from "typeorm";
import {PostDTO} from "../input.classes";
import {InjectRepository} from "@nestjs/typeorm";
import {Blog} from "../entities/blog-entity";
import {APIPost} from "../entities/api-post-entity";

@Injectable()
export class PostsRepository {
  constructor(protected readonly dataSource: DataSource,
              protected readonly common: Common,
              @InjectRepository(APIPost) protected postsTypeORMRepository : Repository<APIPost>,
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

    let foundPost
    try {
      foundPost = await this.postsTypeORMRepository
          .findOne({where : {
                id: postId,
                isHiden : false
              },
                relations: {
                  blog : true
                }
              })
    } catch (error) {
      console.log(error)
      return null
    }
    console.log(foundPost, " foundPost")
    if (!foundPost) {
      console.log("empty result of query ingetPostById")
      return null
    } else {
      console.log(userId , "userId in getPostById");
      const foundPostFrame = this.common.SQLPostMapping(foundPost)
      const likesCount = await this.likeRepository.findLikesCountForSpecificPost(postId)
      const dislikesCount = await this.likeRepository.findDisikesCountForSpecificPost(postId)
      const newestLikes = await this.likeRepository.findNewestLikesForSpecificPost(postId)
      const myLike = await this.likeRepository.findMyStatusForSpecificPost(postId, userId)
      foundPostFrame.extendedLikesInfo.likesCount = likesCount
      foundPostFrame.extendedLikesInfo.dislikesCount = dislikesCount
      foundPostFrame.extendedLikesInfo.newestLikes = newestLikes
      foundPostFrame.extendedLikesInfo.myStatus = myLike ? myLike : "None"
      console.log(foundPostFrame, "foundPostFrame");
      console.log(foundPostFrame.extendedLikesInfo.newestLikes , " newestLikes")
      console.log(myLike , "myLike");
      console.log(userId , "userId");
      return foundPostFrame
    }
  }

  async getAllPosts(paginationCriteria: paginationCriteriaType) {

    const pageSize = paginationCriteria.pageSize;
    /*const totalCountQuery = await this.dataSource.query(`
    SELECT CAST(COUNT(*) AS INTEGER) 
    FROM public."APIPostTable"
     
    `)*/
    const totalCount =  await this.postsTypeORMRepository
        .count({

        })
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

    const result = await this.dataSource.query(`
    SELECT 
    blog."name" as "blogName",
    blog."id" as "blogId",
    api_post.*
    FROM public."api_post"
    LEFT JOIN public."blog"
    ON blog."id" = api_post."blogId"
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT ${pageSize} OFFSET ${ToSkip}
    `)

    console.log(result, "result")
    /*const result = await this.postsTypeORMRepository
        .find({
          skip : ToSkip,
          take : pageSize,
          relations : {
            blog : true
          },
          order : {
            [sortBy] : sortDirection.toUpperCase()
          },
          select : {
            blog: {
              name: true
            }
          }

        })*/

    /*const items = result.map((item) => {
      return this.common.SQLPostMapping(item)
    });*/

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
      items: result,
    };
  }
  async deletePostById(id : string) {

    /*const foundPostQuery = await this.dataSource.query(`
    SELECT * FROM public."APIPostTable"
    WHERE "id" = $1;
    `, [postId])*/

    let foundPostQuery
    try{
      foundPostQuery = await this.postsTypeORMRepository
          .findOneBy({
            id : id
          })
    } catch (e) {
      return null
    }

    if(!foundPostQuery){
      return null
    }

    const deletedPost = await this.postsTypeORMRepository
        .delete({
          id : id
        })
    return  true
  }
  async updatePostById( DTO : PostDTO, postId : string) {

    console.log(postId, " postId after convert");

    if(!postId){
      return null
    }
    /*const foundPostQuery = await this.dataSource.query(`
    SELECT * FROM public."APIPostTable"
    WHERE "id" = $1;
    `, [postId])*/
    let foundPostQuery
    try{
      foundPostQuery = await this.postsTypeORMRepository
          .findOneBy({
            id : postId
          })
    } catch (e) {
      return null
    }

    console.log(foundPostQuery)
    if(!foundPostQuery){
      return null
    }

      const newPostToUpdate = APIPost.createToUpdate(foundPostQuery, DTO)

    /*const updatedPost = await this.dataSource.query(`
    UPDATE public."APIPostTable"
    SET "title" = $2 , "shortDescription" = $3 , "content" = $4
    WHERE "id" = $1;
    `, [postId, DTO.title, DTO.shortDescription, DTO.content])*/

    const updatedPost = await this.postsTypeORMRepository
        .save(newPostToUpdate)

    return true
  }
  async deleteAllData(){
    await this.postsTypeORMRepository.delete({})
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
            SELECT 
            CAST(c."id" AS TEXT),
            "content",
            CAST(c."commentatorId" AS TEXT),
            u."login",
            c."createdAt"
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
    let foundPost
    try{
    /*  foundPostQuery= await this.dataSource.query(`
    SELECT *  FROM public."APIPostTable"
    WHERE "id" = $1;
    `, [postIdAsString])*/

      foundPost = await this.postsTypeORMRepository.findOne({
        relations : {
          blog : true
        },
        where : {
          id: postIdAsString
        }
      })
    } catch (e) {
      console.log(e)
      return null
    }
    return foundPost
  }

  async makeAllPostsForBlogHiden(blogId: string) {
    /*await this.dataSource.query(`
    UPDATE public."APIPostTable"
    SET "isHiden" = $2
    WHERE "blogId" = $1;

    `, [blogId, true])*/

    await this.postsTypeORMRepository
        .update({blog :{id : blogId}},
            {isHiden : true})

  }

  async makeAllPostsForBlogVisible(blogId: string) {
    await this.postsTypeORMRepository
        .update({blog :{id : blogId}},
            {isHiden : false})
  }
}