import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { paginationCriteriaType } from "../appTypes";
import { Common } from "../common";
import { LikeRepository } from "../likes/likes.repository";
import {DataSource} from "typeorm";
import { APIPost } from "../entities/api-post-entity";

@Injectable()
export class PostsQueryRepository {
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
      id: createdPost.id,
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


  async getListOfPostsIdsByBlogs(listOfBlogsForSpecifiedUser: string[]) {
    let postIdArray = []
    for (let blogId of listOfBlogsForSpecifiedUser) {
      const posts = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
      postIdArray.push(...posts.map(item => item._id))
    }
    return postIdArray
  }
  async getListOfPostsByBlogs(listOfBlogsForSpecifiedUser: string[]) {
    let postIdArray = []
    for (let blogId of listOfBlogsForSpecifiedUser) {
      const posts = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
      postIdArray.push(...posts)
    }
    return postIdArray
  }

  async getPostById(id : string) : Promise<APIPost>{
    return this.dataSource.getRepository(APIPost).findOne({
      relations : {
        blog : true,
        main : true,
        comments : true,
        likes : true
      },
      where : {
        id : id
      }
    })
  }

  async savePostToDB(postWithUpdatedMain: APIPost) {
    await this.dataSource.getRepository(APIPost).save(postWithUpdatedMain)
  }
}