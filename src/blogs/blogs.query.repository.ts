import { InjectModel, Prop } from "@nestjs/mongoose";

import { Model } from 'mongoose';
import { paginationCriteriaType } from '../appTypes';
import { Common } from '../common';
import { Injectable } from "@nestjs/common";
import { BanBlogDTO } from "../input.classes";
import {DataSource, ILike, Repository} from "typeorm";
import {Blog} from "../entities/blog-entity";
import {APIPost} from "../entities/api-post-entity";
import {User} from "../entities/user-entity";
import {InjectRepository} from "@nestjs/typeorm";
import {isUUID} from "class-validator";

@Injectable()
export class BlogsQueryRepository {
  constructor(
      protected readonly dataSource: DataSource,
      @InjectRepository(Blog) protected readonly bR: Repository<Blog>,
      @InjectRepository(User) protected readonly userTypeORMRepository: Repository<User>,

    protected readonly common: Common,
  ) {}
  async getAllBlogsSA(blogsPagination: paginationCriteriaType) {
    let filter : {name? : any} = {}

    filter.name = blogsPagination.searchNameTerm ? `%${blogsPagination.searchNameTerm}%` : '%'

    const pageSize = blogsPagination.pageSize;
   /* const sqlCountQuery = await this.dataSource.query(`
    SELECT COUNT(*) 
    FROM public."blog"
    WHERE "blogBanId"   AND "name" ILike $1
    `,[filter.name])*/



    const totalCount = await this.bR.countBy({
      blogBan : {
        isBanned : false
      },
      name : ILike(filter.name)
    })

    console.log(totalCount)
    const pagesCount = Math.ceil(totalCount / pageSize);
    console.log(pagesCount, "pagesCount")
    const page = blogsPagination.pageNumber;
    const sortBy = blogsPagination.sortBy;
    const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
    const ToSkip = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);



    const result =await this.dataSource.query(`
    SELECT 
    CAST(b."id" AS TEXT),
    "name" COLLATE "C",
    b."description",
    b."websiteUrl",
    b."isMembership",
    b."createdAt",
    CAST(b."blogOwnerId" AS TEXT),
    u."login",
    bb."isBanned",
    bb."banDate"
    
    FROM public."blog" b
    LEFT JOIN public."user" u
    ON b."blogOwnerId" = u."id"
    LEFT JOIN public."blog_ban" bb
    ON b."blogBanId" = bb."id"
    WHERE "name" ILike $1
    ORDER BY b."${sortBy}" ${sortDirection.toUpperCase()} 
    LIMIT $2 OFFSET $3
    `,[filter.name, pageSize, ToSkip])

    if (result) {
      const items = result.map((item) => {
        return this.common.SQLBlogMapping(item);
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
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = blogsPagination.pageNumber;
    const sortBy = blogsPagination.sortBy;
    const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
    const ToSkip = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);



    const result = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
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
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    if(!foundBlog) {
      return null
    }
    const pageSize = paginationCriteria.pageSize;
    const totalCount = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip =
      paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

    const result = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
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
        items: result.map(item => this.common.SQLPostMapping(item)),
      };
    }

  /*async createNewBlog(DTO: any, user: any) {
    const blogOwner = await this.userTypeORMRepository.findOneBy({
      id : user.userId
    })


    const banInfo = {
      banDate: null,
      isBanned: false
    }

    const blogToCreate  = Blog.create(DTO,blogOwner)



    const createdBlog : Blog = await this.bR.save(blogToCreate)
    return {
      id: createdBlog.id,
      name : createdBlog.name,
      description : createdBlog.description,
      websiteUrl : createdBlog.websiteUrl,
      isMembership : createdBlog.isMembership,
      createdAt : createdBlog.createdAt,
      banInfo
    }
  }*/
  async getBlogById(blogId: string) {
    if (!blogId) {
      return null
    }
    /*const foundBlog = await this.dataSource.query(`
    SELECT * FROM public."BlogsTable"
    WHERE id = $1
    `, [blogId])*/

    const foundBlog = await this.bR
        .findOne({
          where : {
            id: blogId
          },
          relations : {
            blogBan : true
          }
        })

    if(!foundBlog){
      return null
    }

    return foundBlog
  }
  async updateBlogById(DTO: any, id: string) {
    const blogId = this.common.tryConvertToObjectId(id)

    if (!blogId) {
      console.log("blogId convertation failed");
      return null
    }
    const updateResult = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
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
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    console.log(deletedBlog);
    console.log(deletedBlog.deletedCount === 1);

    return deletedBlog.deletedCount === 1
  }
  async createPostForSpecificBlog(DTO: any, id: string) {
    const createdAt = new Date()
    const blog = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    if(!blog){
      return null
    }
    const newPost = APIPost.create(DTO, blog.name)

    const createdPostForSpecificBlog = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    console.log(newPost + "newPost")
    return this.common.SQLPostMapping(createdPostForSpecificBlog)
  }
  async deleteAllData(){
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async getBlogByIdWithBloggerInfo(blogId) {
    if (!isUUID(blogId)){
      return null
    }
    /*const foundBlogQuery = await this.dataSource.query(`
    SELECT b."id", b."name", b."description", b."websiteUrl", b."isMembership", b."createdAt", b."blogOwnerId", u."login"
    FROM public."BlogsTable" b
    LEFT JOIN 
    public."UserTable" u
    ON u."id" = b."blogOwnerId"
    WHERE b."id" = $1;
    `, [parseInt(blogId, 10)]);*/

    console.log(await this.bR.findOne({where: {id: blogId}}))


    const foundBlogs =  this.dataSource
        .getRepository(Blog)
        .createQueryBuilder("blog")
        .leftJoinAndSelect('blog.blogOwner', 'blogOwner')
        .where('blog.id = :blogId', { blogId })
        .getSql()

    const foundBlog = await this.dataSource
        .getRepository(Blog)
        .createQueryBuilder("blog")
        .leftJoinAndSelect('blog.blogOwner', 'blogOwner')
        .where('blog.id = :blogId', { blogId })
        .getOne()


    if (!foundBlog) return null;

        // .getOne()



    return {
      id: foundBlog.id,
      name: foundBlog.name,
      description: foundBlog.description,
      websiteUrl: foundBlog.websiteUrl,
      isMembership: foundBlog.isMembership,
      createdAt: foundBlog.createdAt,
      blogOwnerInfo: {
        userId : foundBlog.blogOwner.id,
        userLogin : foundBlog.blogOwner.login
      }
    }
  }


  async changeBanStatusOfBlog(DTO: BanBlogDTO, blogId: string) {
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async getListOfBlogsByUserId(userFromToken: string) {
    const result = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    return result.map(item => item._id.toString())
  }

  async saveBlogToDB(blogWithUpdatedWallpaper: Blog) {
    await this.dataSource.getRepository(Blog).save(blogWithUpdatedWallpaper)
  }
}
