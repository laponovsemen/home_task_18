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
import { BanBlogDTO } from "../input.classes";
import {DataSource} from "typeorm";

@Injectable()
export class BlogsRepository {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly common: Common,
  ) {}
  async getAllBlogs(blogsPagination: paginationCriteriaType) {
    let filter : {name? : any} = {}
    if (blogsPagination.searchNameTerm) {
      filter.name = blogsPagination.searchNameTerm ?? ''
    }
    const pageSize = blogsPagination.pageSize;
    const sqlCountQuery = await this.dataSource.query(`
    SELECT COUNT(*) 
    FROM public."BlogsTable"
    WHERE public."BlogsTable"."blogBanId" = null AND public."BlogsTable"."name" Like $1
    `, [filter.name])
    const totalCount = parseInt(sqlCountQuery[0].count, 10)

    console.log(totalCount)
    console.log(sqlCountQuery)
    const pagesCount = Math.ceil(totalCount / pageSize);
    console.log(pagesCount)
    const page = blogsPagination.pageNumber;
    const sortBy = blogsPagination.sortBy;
    const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
    const ToSkip = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);



    const result =await this.dataSource.query(`
    SELECT *
   FROM public."BlogsTable"
    WHERE public."BlogsTable"."blogBanId" = null AND public."BlogsTable"."name" Like $1
    `, [filter.name])

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
    const filter: { name?: any,  "blogOwnerInfo.userId" : string} = {"blogOwnerInfo.userId" : userId}
    if (blogsPagination.searchNameTerm) {
      filter.name = {$regex: blogsPagination.searchNameTerm, $options: 'i'}
    }
    const pageSize = blogsPagination.pageSize;
    const totalCount = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = blogsPagination.pageNumber;
    const sortBy = blogsPagination.sortBy;
    const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
    const ToSkip = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);



    const result = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)

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
    const foundBlog = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    if(!foundBlog) {
      return null
    }
    const pageSize = paginationCriteria.pageSize;
    const totalCount = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip =
      paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

    const result = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)


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
        items: result.map(item => this.common.mongoPostSlicing(item)),
      };
    }

  async createNewBlog(DTO: any, user: any) {
    const blogOwnerInfo = {
      userId : user.userId,
      userLogin :user.login,
    }
    const createdAt = new Date()
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
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    return {
      id: createdBlog.id,
      name,
      description,
      websiteUrl,
      isMembership,
      createdAt,
      banInfo
    }
  }
  async getBlogById(id: string) {
    const blogId = this.common.tryConvertToObjectId(id)
    if (!blogId) {
      return null
    }
    const foundBlog = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    if(!foundBlog){
      return null
    }
    return {
      id: foundBlog._id,
      name: foundBlog.name,
      description: foundBlog.description,
      websiteUrl: foundBlog.websiteUrl,
      isMembership: foundBlog.isMembership,
      createdAt: foundBlog.createdAt,
      //blogOwnerInfo : foundBlog.blogOwnerInfo
    }
  }
  async updateBlogById(DTO: any, id: string) {
    const blogId = this.common.tryConvertToObjectId(id)

    if (!blogId) {
      console.log("blogId convertation failed");
      return null
    }
    const updateResult = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    return updateResult.matchedCount === 1
  }
  async deleteBlogById(id: string) {
    const blogId = this.common.tryConvertToObjectId(id)
    console.log(blogId);
    if (!blogId) {
      return null
    }
    const deletedBlog = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    console.log(deletedBlog);
    console.log(deletedBlog.deletedCount === 1);

    return deletedBlog.deletedCount === 1
  }
  async createPostForSpecificBlog(DTO: any, id: string) {
    const createdAt = new Date()
    const blog = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    if(!blog){
      return null
    }
    const newPost: APIPost = {
      title: DTO.title, //    maxLength: 30
      shortDescription: DTO.shortDescription, //maxLength: 100
      content: DTO.content, // maxLength: 1000
      blogId: new ObjectId(id),
      blogName : blog.name,
      createdAt: createdAt,
      isHiden: false
    }
    const createdPostForSpecificBlog = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    console.log(newPost + "newPost")
    return this.common.mongoPostSlicing(createdPostForSpecificBlog)
  }
  async deleteAllData(){
    await this.dataSource.query(`
    DELETE FROM public."BlogsTable"
    WHERE 1 = 1;
    `)
  }

  async getBlogByIdWithBloggerInfo(id) {
    const blogId = this.common.tryConvertToObjectId(id)
    if (!blogId) {
      return null
    }
    const foundBlog = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
    if (!foundBlog) {
      return null
    }
    return {
      id: foundBlog._id,
      name: foundBlog.name,
      description: foundBlog.description,
      websiteUrl: foundBlog.websiteUrl,
      isMembership: foundBlog.isMembership,
      createdAt: foundBlog.createdAt,
      blogOwnerInfo: foundBlog.blogOwnerInfo
    }
  }


  async changeBanStatusOfBlog(DTO: BanBlogDTO, blogId: string) {
    return await this.dataSource.query(`
    SELECT COUNT(*) FROM public."BlogsTable"
    `)
  }
}
