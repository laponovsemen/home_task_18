import { InjectModel, Prop } from "@nestjs/mongoose";

import { FilterQuery, Model } from "mongoose";
import { paginationCriteriaType } from "../appTypes";
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

@Injectable()
export class BansRepository {
  constructor(
      protected readonly dataSource: DataSource,
    protected readonly common: Common,
    protected readonly usersRepository: UsersRepository,
    @InjectRepository(BloggerBansForSpecificBlog) protected bloggerBansForSpecificBlogTypeORMRepository : Repository<BloggerBansForSpecificBlog>,
  ) {
  }

  async banUserForSpecificBlog(ownerId: string, userToBanId: string, DTO: BanUserByBloggerDTO) {
    const blogId = DTO.blogId;
    const userToBan = await this.usersRepository.findUserById(userToBanId);
    if (!userToBan) {
      console.log('no user');
      return null;
    }

    const banExists = await this.bloggerBansForSpecificBlogTypeORMRepository
        .findOne({
          where: {
            bannedUser:{
              id: userToBanId
            },
            blog: {
              id : blogId
            }
          },
          relations : {
            blog : true
          }
  })
    const blog = await this.bloggerBansForSpecificBlogTypeORMRepository
        .findBy({
          id : blogId
        })
    console.log(banExists, 'is banned');
    if (banExists && DTO.isBanned) {
      console.log('u want to ban banned user');
      return true;
    }
    if (!banExists && !DTO.isBanned) {
      console.log('u want to unban not banned user');
      return true;
    }
    if (DTO.isBanned) {
      const newBan =  BloggerBansForSpecificBlog.create(ownerId, userToBanId, blogId, DTO)
      const res = await this.bloggerBansForSpecificBlogTypeORMRepository
          .save(newBan)

      console.log('i ban this user, ban ibfo =>', res);
      return true;
    } else {


      await this.bloggerBansForSpecificBlogTypeORMRepository.delete({
        bannedUser : {
          id : userToBanId
        }
        ,
        blog : {
          id : blogId
        }
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

    const result = await this.dataSource
        .getRepository(BloggerBansForSpecificBlog)
        .createQueryBuilder("BloggerBansForSpecificBlog")
        .leftJoinAndSelect('BloggerBansForSpecificBlog.bannedUser', 'bannedUser')
        .getMany()

    console.log(result, " result")

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
