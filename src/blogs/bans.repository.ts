import { InjectModel, Prop } from "@nestjs/mongoose";
import {
  APIPost, BanInfoDB,
  Blog,
  BlogDocument,
  BloggerBansForSpecificBlog,
  BloggerBansForSpecificBlogDocument,
  BloggerBansForSpecificBlogSchema,
  NewestLike,
  PostDocument
} from "../mongo/mongooseSchemas";
import { FilterQuery, Model } from "mongoose";
import { paginationCriteriaType } from "../appTypes";
import { Common } from "../common";
import { ObjectId } from "mongodb";
import { Injectable } from "@nestjs/common";
import { BanBlogDTO, BanUserByBloggerDTO } from "../input.classes";
import { UsersRepository } from "../users/users.reposiroty";
import {DataSource} from "typeorm";

@Injectable()
export class BansRepository {
  constructor(
      protected readonly dataSource: DataSource,
    protected readonly common: Common,
    protected readonly usersRepository: UsersRepository
  ) {
  }

  async banUserForSpecificBlog(ownerId: string, userToBanId: string, DTO: BanUserByBloggerDTO) {
    const blogId = DTO.blogId;
    const userToBan = await this.usersRepository.findUserById(userToBanId);
    if (!userToBan) {
      console.log('no user');
      return null;
    }

    const banExists =  await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
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
      const newBan = {
        ownerId: new ObjectId(ownerId),
        blogId: new ObjectId(blogId),
        banInfo: {
          banDate: new Date().toISOString(),
          banReason: DTO.banReason,
          isBanned: DTO.isBanned
        },
        userId: new ObjectId(userToBanId),
        login: userToBan.login
      };
      const res =  await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
      console.log('i ban this user, ban ibfo =>', res);
      return true;
    } else {
      await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
      console.log('unban user');
      return true;
    }

  }

  async getAllBannedUsersForSpecificBlog(paginationCriteria: paginationCriteriaType, blogOwnerFromToken: string, blogId: string) {
    /*const filter: FilterQuery<BloggerBansForSpecificBlog> = {
      name: {
        $regex: paginationCriteria.searchNameTerm ?? "",
        $options: "i"
      }
    };*/
    const filter = {ownerId: new ObjectId(blogOwnerFromToken), blogId: new ObjectId(blogId)}
    const pageSize = paginationCriteria.pageSize;
    const totalCount =  await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: "asc" | "desc" = paginationCriteria.sortDirection;
    const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

    console.log(filter, " filter");
    const result =  await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)


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
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async findBanStatusForSpecificUser(blogId: string, commentatorId: string) {

    //return this.banModel.findOne({ blogId: new ObjectId(blogId), userId: new ObjectId(commentatorId) });

    const findBanStatusQuery =  await this.dataSource.query(`
    SELECT * FROM public."BlogBanInfoTable"
    WHERE "blogId" = $1 AND "userId" = $2;
    `, [blogId, commentatorId])
    const result = findBanStatusQuery[0]
    if(findBanStatusQuery.length === 0){
      return false
    } else {
      return result
    }
  }
}
