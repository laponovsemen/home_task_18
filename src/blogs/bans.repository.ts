import { InjectModel, Prop } from "@nestjs/mongoose";

import { FilterQuery, Model } from "mongoose";
import {paginationCriteriaType, sortDirectionEnum} from "../appTypes";
import { Common } from "../common";
import { ObjectId } from "mongodb";
import { Injectable } from "@nestjs/common";
import { BanBlogDTO, BanUserByBloggerDTO } from "../input.classes";
import { UsersRepository } from "../users/users.reposiroty";
import {DataSource, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../entities/user-entity";
import {BloggerBansForSpecificBlog} from "../entities/blogger-bans-for-specific-blog-entity";
import {Blog} from "../entities/blog-entity";
import {BlogBan} from "../entities/blog-ban-entity";

@Injectable()
export class BansRepository {
  constructor(
      protected readonly dataSource: DataSource,
    protected readonly common: Common,
    protected readonly usersRepository: UsersRepository,
    @InjectRepository(BloggerBansForSpecificBlog) protected bloggerBansForSpecificBlogTypeORMRepository : Repository<BloggerBansForSpecificBlog>,
    @InjectRepository(Blog) protected blogsTypeORMRepository : Repository<Blog>,
  ) {
  }

  async banUserForSpecificBlog(ownerId: string, userToBanId: string, DTO: BanUserByBloggerDTO) {
    const blogId = DTO.blogId;
    const userToBan : User = await this.usersRepository.findUserById(userToBanId);
    const owner : User = await this.usersRepository.findUserById(ownerId)
    if (!userToBan) {
      console.log('no user');
      return null;
    }

    const banExists: BloggerBansForSpecificBlog = await this.bloggerBansForSpecificBlogTypeORMRepository
        .findOne({
          where: {
            bannedUser: {
              id: userToBanId
            },
            blog : {
              id : blogId
            }
          },
          relations: {
            blog: true,
            bannedUser: true
          }
        })

    /*const banExists: BloggerBansForSpecificBlog = await this.bloggerBansForSpecificBlogTypeORMRepository
        .findOneBy(null)*/


    const blog : Blog = await this.blogsTypeORMRepository
        .findOneBy({
          id : blogId
        })
    console.log(banExists, 'is banned');
    if (banExists && DTO.isBanned) {
      console.log('u want to ban banned user');
      return true;
    } else if (!banExists && !DTO.isBanned) {
      console.log('u want to unban not banned user');
      return true;
    } else if (DTO.isBanned) {
      const newBan =  BloggerBansForSpecificBlog.create(owner, userToBan, blog, DTO)
      const res = await this.bloggerBansForSpecificBlogTypeORMRepository
          .save(newBan)

      console.log('i ban this user, ban ibfo =>', res);
      return true;
    } else {
      await this.bloggerBansForSpecificBlogTypeORMRepository.delete({
        id : banExists.id
      })
      console.log('unban user');
      return true;
    }

  }

  async getAllBannedUsersForSpecificBlog(paginationCriteria: paginationCriteriaType, blogOwnerFromToken: string, blogId: string) {

    //const filter = {ownerId: blogOwnerFromToken, blogId: new ObjectId(blogId)}
    const pageSize = paginationCriteria.pageSize;



    const totalCount = await this.bloggerBansForSpecificBlogTypeORMRepository
        .countBy({
          "isBanned" : true,
          blog : {
            id : blogId
          }
        })

    console.log(totalCount , "totalCount in bloggerBansForSpecificBlogTypeORMRepository")


    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: "asc" | "desc" = paginationCriteria.sortDirection;
    const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

   /* const result =  await this.dataSource.query(`
    SELECT b."banDate",
     b."isBanned",
      CAST(b."userId" AS TEXT),
       b."banReason",
        u."login" COLLATE "C"
        
      FROM public."BloggerBanForBlogInfoTable" b
      LEFT JOIN 
      public."UserTable" u
      ON b."userId" = u."id"
      
    WHERE b."isBanned" = $1 AND "blogId" = $2
    ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
    LIMIT $3 OFFSET $4;
    `, [true, blogId, pageSize, ToSkip])*/


    /*const request = this.dataSource
        .getRepository(BloggerBansForSpecificBlog)
        .createQueryBuilder("BloggerBansForSpecificBlog")
        .leftJoinAndSelect('BloggerBansForSpecificBlog.bannedUser', 'bannedUser')
        .leftJoinAndSelect('BloggerBansForSpecificBlog.blog', 'blog')
        .where()
        .orderBy(`bannedUser.${sortBy}`, sortDirection.toUpperCase() as "ASC" | "DESC")
        .take(pageSize)
        .skip(ToSkip)


    const result =  await request
        .getMany()*/

      const result = await this.bloggerBansForSpecificBlogTypeORMRepository
          .find({
              relations : {
                  bannedUser : true,
                  blog : true,
                  owner : true
              },
              where : {
                  blog : {
                      id : blogId
                  },
              },
              take : pageSize,
              skip : ToSkip,
              order : {
                  bannedUser: {
                      [sortBy]: sortDirection.toUpperCase() as "ASC" | "DESC"
                  }
              }
          })

    //    SELECT "BloggerBansForSpecificBlog"."id" AS "BloggerBansForSpecificBlog_id",
    //    "BloggerBansForSpecificBlog"."banDate" AS "BloggerBansForSpecificBlog_banDate",
    //    "BloggerBansForSpecificBlog"."createdAt" AS "BloggerBansForSpecificBlog_createdAt",
    //    "BloggerBansForSpecificBlog"."banReason" AS "BloggerBansForSpecificBlog_banReason",
    //    "BloggerBansForSpecificBlog"."isBanned" AS "BloggerBansForSpecificBlog_isBanned",
    //    "BloggerBansForSpecificBlog"."ownerId" AS "BloggerBansForSpecificBlog_ownerId",
    //    "BloggerBansForSpecificBlog"."blogId" AS "BloggerBansForSpecificBlog_blogId",
    //    "BloggerBansForSpecificBlog"."bannedUserId" AS "BloggerBansForSpecificBlog_bannedUserId",
    //    "bannedUser"."id" AS "bannedUser_id", "bannedUser"."login" AS "bannedUser_login",
    //    "bannedUser"."email" AS "bannedUser_email", "bannedUser"."password" AS "bannedUser_password",
    //    "bannedUser"."createdAt" AS "bannedUser_createdAt", "bannedUser"."isConfirmed" AS "bannedUser_isConfirmed",
    //    "bannedUser"."code" AS "bannedUser_code", "bannedUser"."codeDateOfExpiary" AS "bannedUser_codeDateOfExpiary",
    //    "bannedUser"."banDate" AS "bannedUser_banDate", "bannedUser"."banReason" AS "bannedUser_banReason",
    //    "bannedUser"."isBanned" AS "bannedUser_isBanned"
    //    FROM "blogger_bans_for_specific_blog" "BloggerBansForSpecificBlog"
    //    LEFT JOIN "user" "bannedUser"
    //    ON "bannedUser"."id"="BloggerBansForSpecificBlog"."bannedUserId"
    //    ORDER BY bannedUser.createdAt" DESC  result

    const items = result.map((item) => {
      return this.common.mongoBanSlicing(item);
    });
    const array = await Promise.all(items);
    console.log(
      {
        pageSize: pageSize,
        totalCount: totalCount,
        pagesCount: pagesCount,
        page: page,
        items: array
      },
      "its fucking result"
    );
    return {
      pageSize: pageSize,
      totalCount: totalCount,
      pagesCount: pagesCount,
      page: page,
      items: array
    };

  }

  async deleteAllData() {
    await this.bloggerBansForSpecificBlogTypeORMRepository.delete({})
  }

  async findBanStatusForSpecificUser(blogId: string, commentatorId: string) {

    //return this.banModel.findOne({ blogId: new ObjectId(blogId), userId: new ObjectId(commentatorId) });

    /*const findBanStatusQuery =  await this.dataSource.query(`
    SELECT * FROM public."BloggerBanForBlogInfoTable"
    WHERE "blogId" = $1 AND "userId" = $2;
    `, [blogId, commentatorId])
    const result = findBanStatusQuery[0]*/

    const result = await this.bloggerBansForSpecificBlogTypeORMRepository
        .findOneBy({
          blog : {
            id : blogId
          },
          bannedUser : {
            id : commentatorId
          }
        })
    console.log(result, " result in findBanStatusForSpecificUser")
    if(!result){
      return false
    } else {
      return result
    }
  }
}
