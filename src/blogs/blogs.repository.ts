import { InjectModel, Prop } from "@nestjs/mongoose";
import {
  APIPost,
  Blog,
  BlogDocument, NewestLike,
  PostDocument
} from "../mongo/mongooseSchemas";
import { Model } from 'mongoose';
import { paginationCriteriaType } from '../appTypes';
import { Common } from '../common';
import { ObjectId } from 'mongodb';
import { Injectable } from "@nestjs/common";
import {BanBlogDTO, BlogDTO} from "../input.classes";
import {DataSource} from "typeorm";

@Injectable()
export class BlogsRepository {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly common: Common,
  ) {}
  async getAllBlogs(blogsPagination: paginationCriteriaType) {
    let filter : {name? : any} = {}

    filter.name = blogsPagination.searchNameTerm ? `%${blogsPagination.searchNameTerm}%` : '%'

    const pageSize = blogsPagination.pageSize;
    const sqlCountQuery = await this.dataSource.query(`
    SELECT COUNT(*) 
    FROM public."BlogsTable"
    WHERE "blogBanId" IS NULL  AND "name" ILike $1
    `,[filter.name])
    const totalCount = parseInt(sqlCountQuery[0].count, 10)

    console.log(totalCount)
    console.log(sqlCountQuery)
    const pagesCount = Math.ceil(totalCount / pageSize);
    console.log(pagesCount, "pagesCount")
    const page = blogsPagination.pageNumber;
    const sortBy = blogsPagination.sortBy;
    const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
    const ToSkip = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);



    const result =await this.dataSource.query(`
    SELECT *
    FROM public."BlogsTable"
    WHERE "blogBanId" IS NULL  AND "name" ILike $1
    `,[filter.name])

    if (result) {
      const items = result.map((item) => {
        return this.common.mongoBlogSlicing(item);
      });
      const array = await Promise.all(items);
      console.log(
        {
          pageSize: pageSize,
          totalCount: totalCount,
          pagesCount: pagesCount,
          page: page,
          items: array,
        },
        'its fucking result',
      );
      return {
        pageSize: pageSize,
        totalCount: totalCount,
        pagesCount: pagesCount,
        page: page,
        items: array,
      };
    }
  }
  async getAllBlogsForSpecifiedBlogger(blogsPagination: paginationCriteriaType, userId : string) {
    let filter : {name? : any} = {}
    filter.name = blogsPagination.searchNameTerm ? `%${blogsPagination.searchNameTerm}%`:  '%%'

    const pageSize = blogsPagination.pageSize;
    const totalCountQuery = await this.dataSource.query(`
    SELECT CAST(COUNT(*) AS TEXT) FROM public."BlogsTable"
        WHERE "blogOwnerId" = $1 AND public."BlogsTable"."name" ILIKE $2
    `, [userId, filter.name])

  const totalCount = parseInt(totalCountQuery[0].count, 10)
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = blogsPagination.pageNumber;
    const sortBy = blogsPagination.sortBy;
    const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
    const ToSkip = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);



    const result = await this.dataSource.query(`
    SELECT CAST("id" AS TEXT),
    "name" COLLATE "C",
    "description",
    "websiteUrl",
    "isMembership",
    "createdAt"
     FROM public."BlogsTable"
     WHERE "blogOwnerId" = $1  AND public."BlogsTable"."name" ILIKE $4
     ORDER BY "${sortBy}" ${sortDirection.toUpperCase()} 
     LIMIT $2 OFFSET $3
    `, [userId,pageSize , ToSkip, filter.name ])

    if (result) {
      const items = result.map((item) => {
        return this.common.mongoBlogSlicingWithoutBlogOwnerInfo(item);
      });
      const array = await Promise.all(items);
      console.log(
        {
          pageSize: pageSize,
          totalCount: totalCount,
          pagesCount: pagesCount,
          page: page,
          items: array,
        },
        'its fucking result',
      );
      return {
        pageSize: pageSize,
        totalCount: totalCount,
        pagesCount: pagesCount,
        page: page,
        items: array,
      };
    }
  }
  async getAllPostsForSpecificBlog(paginationCriteria: paginationCriteriaType, blogId: string,) {
    const countBlogsQuery = await this.dataSource.query(`
    SELECT CAST(COUNT(*) AS INTEGER) 
    FROM public."APIPostTable"
     WHERE "blogId" = $1
    `, [blogId])

    const pageSize = paginationCriteria.pageSize;
    const totalCount = countBlogsQuery[0].count
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip =
      paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

    const result = await this.dataSource.query(`
    SELECT CAST("id" AS TEXT),
     "title",
      "shortDescription",
       "content",
        CAST("blogId" AS TEXT),
         "blogName",
          "createdAt",
           "isHiden"
    
     FROM public."APIPostTable"
     WHERE "blogId" = $1
     ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
     LIMIT $2 OFFSET $3
    `, [blogId,pageSize, ToSkip])


      console.log(
        {
          pageSize: pageSize,
          totalCount: totalCount,
          pagesCount: pagesCount,
          page: page,
          items: result,
        },
        'its fucking result',
      );
      return {
        pageSize: pageSize,
        totalCount: totalCount,
        pagesCount: pagesCount,
        page: page,
        items: result.map(item => this.common.SQLPostMapping(item)),
      };
    }

  async createNewBlog(DTO: any, user: any) {
    const blogOwnerInfo = {
      userId : user.userId,
      userLogin :user.login,
    }
    const createdAt = new Date().toISOString()
    const description = DTO.description
    const isMembership = false
    const name = DTO.name
    const websiteUrl = DTO.websiteUrl
    const banInfo = {
      banDate: null,
      isBanned: false
    }

    const blogToCreate : Blog = {
      name,
      description,
      websiteUrl,
      isMembership,
      createdAt,
      blogOwnerInfo,
       banInfo
    }
    const createdBlog : Blog = await this.dataSource.query(`
    INSERT INTO public."BlogsTable"(
    "name", "description", "websiteUrl", "isMembership", "createdAt", "blogOwnerId", "blogBanId")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING CAST("id" AS TEXT);
    `, [name, description , websiteUrl, isMembership, createdAt, blogOwnerInfo.userId, null])

    // const foundBlogAfterCreation = await this.dataSource.query(`
    // SELECT cast("id" as TEXT) FROM public."BlogsTable"
    // WHERE "name" = $1 AND "description" = $2 AND "websiteUrl" = $3
    // `, [name, description, websiteUrl])
    return {
      id: createdBlog[0].id,
      name,
      description,
      websiteUrl,
      isMembership,
      createdAt,
      banInfo
    }
  }
  async getBlogById(blogId: string) {

    if (!blogId) {
      return null
    }
    const foundBlogQuery = await this.dataSource.query(`
    SELECT * FROM public."BlogsTable"
    WHERE "id" = $1 AND "blogBanId" IS NULL
    `, [blogId])
    if(foundBlogQuery.length === 0){
      return null
    }
    const foundBlog = foundBlogQuery[0]
    return {
      id: foundBlog.id.toString(),
      name: foundBlog.name,
      description: foundBlog.description,
      websiteUrl: foundBlog.websiteUrl,
      isMembership: foundBlog.isMembership,
      createdAt: foundBlog.createdAt,

    }
  }
  async updateBlogById(DTO: BlogDTO, blogId: string) {

    if (!blogId) {
      console.log("blogId convertation failed");
      return null
    }
    const updateResult = await this.dataSource.query(`
    UPDATE public."BlogsTable"
    SET  "name" = $2, "description" = $3, "websiteUrl" = $4
    WHERE "id" = $1;
    `, [blogId, DTO.name, DTO.description, DTO.websiteUrl])
    console.log(updateResult, " updateResult")
    return updateResult.matchedCount === 1
  }
  async deleteBlogById(blogId: string) {

    if (!blogId) {
      return null
    }
    const deletedBlog = await this.dataSource.query(`
    DELETE FROM public."BlogsTable"
    WHERE "id" = $1
    `, [blogId])


    return
  }
  async createPostForSpecificBlog(DTO: any, id: string) {
    const createdAt = new Date()

    const blogsQuery = await this.dataSource.query(`
    SELECT * FROM public."BlogsTable"
    WHERE "id" = $1
    `,[id])

    const blog = blogsQuery[0]
    console.log(blogsQuery, " blogsQuery in createPostForSpecificBlog")
    console.log(blog, " blog in createPostForSpecificBlog")
    if(!blog){
      return null
    }
    const newPost: APIPost = {
      title: DTO.title, //    maxLength: 30
      shortDescription: DTO.shortDescription, //maxLength: 100
      content: DTO.content, // maxLength: 1000
      blogId: id,
      blogName : blog.name,
      createdAt: createdAt,
      isHiden: false
    }
    const createdPostForSpecificBlog = await this.dataSource.query(`
    INSERT INTO public."APIPostTable"(
     "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "isHiden")
    VALUES ( $1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `, [
      newPost.title,
      newPost.shortDescription,
      newPost.content,
      newPost.blogId,
      newPost.blogName,
      newPost.createdAt,
      false])

    console.log(newPost, "newPost")
    console.log(createdPostForSpecificBlog, "createdPostForSpecificBlog")
    return this.common.SQLPostMapping(createdPostForSpecificBlog[0])
  }
  async deleteAllData(){
    await this.dataSource.query(`
    DELETE FROM public."BlogsTable"
    WHERE 1 = 1;
    `)
  }

  async getBlogByIdWithBloggerInfo(blogId) {
    //const blogId = this.common.tryConvertToObjectId(id)
    if (!blogId) {
      return null
    }
    const foundBlogQuery = await this.dataSource.query(`
    SELECT * FROM public."BlogsTable"
    WHERE "id" = $1
    `, [parseInt(blogId,10 )])
    if (foundBlogQuery.length === 0) {
      return null
    }
    const foundBlog = foundBlogQuery[0]
    return {
      id: blogId,
      name: foundBlog.name,
      description: foundBlog.description,
      websiteUrl: foundBlog.websiteUrl,
      isMembership: foundBlog.isMembership,
      createdAt: foundBlog.createdAt,
      blogOwnerId: foundBlog.blogOwnerId
    }
  }


  async changeBanStatusOfBlog(DTO: BanBlogDTO, blogId: string) {
    const isBanned = DTO.isBanned
    if (isBanned){
      
    }
    const ban =  await this.dataSource.query(`
    INSERT INTO public."BlogBanTable"(
    id, "isBanned", "banDate")
    VALUES ($1, $2, $3);
    `, [])
  }

  async BanBlog(DTO: BanBlogDTO, blogId: string) {
    const banDate = new Date().toISOString()

    const ban =  await this.dataSource.query(`
    INSERT INTO public."BlogBanTable"
    ("isBanned", "banDate")
    VALUES ($1, $2)
    RETURNING "id";
    `, [true, banDate])

    const updateBlog = await this.dataSource.query(`UPDATE public."BlogsTable"
    SET "blogBanId"= $2
        WHERE "id" = $1;
        
    `, [blogId, ban[0].id])
    console.log(ban, " ban")
    console.log(updateBlog, " updateBlog")
    console.log(ban[0].id, " ban[0].id")

    return
  }

  async UnbanBlog( blogId: string, banId : string) {

    const unban = await this.dataSource.query(`
    DELETE  FROM public."BlogBanTable"
    WHERE "id" = $1
    `, [banId])

    const updateBlog = await this.dataSource.query(`UPDATE public."BlogsTable"
    SET "blogBanId"= $2
        WHERE "id" = $1;
    `, [blogId, null])
    console.log(unban, " unban")
    console.log(updateBlog, " updateBlog")
    return
  }
}
