import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { APIComment, APIPost, CommentsDocument } from "../mongo/mongooseSchemas";
import { ObjectId } from "mongodb";
import { CommentForSpecifiedPostDTO } from "../input.classes";
import { Common } from "../common";
import { LikeRepository } from "../likes/likes.repository";
import {DataSource} from "typeorm";

@Injectable()
export class CommentsQueryRepository{
  constructor(protected readonly dataSource: DataSource,
              protected readonly common : Common,
              protected readonly likeRepository : LikeRepository,
  ) {
  }
  async deleteAllData(){
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async getListOfCommentsByPostIds(paginationCriteria : any,
                                   listOfPostsForBlogs: APIPost[],
                                   listOfPostsIdsForBlogs: ObjectId[]
  ){
    console.log( "i`m in getListOfCommentsByPostIds");
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
    console.log(listOfPostsForBlogs, "list of posts nhui");
    const result = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    console.log(result, " result in getListOfCommentsByPostIds");
    console.log(result, "blyat");


    const array = {
      pageSize: pageSize,
      totalCount: totalCount,
      pagesCount: pagesCount,
      page: page,
      items: result.map(item => this.common.mongoPostAndCommentCommentSlicing(item, listOfPostsForBlogs)),
    };
    return array
  }


    async getListOfCommentsForSpecificUser(paginationCriteria: any, userFromToken: any) {
      console.log( "i`m in getListOfCommentsForSpecificUser");
      const pageSize = paginationCriteria.pageSize;
      const userId = userFromToken.userId
      const totalCountQuery = await this.dataSource.query(`
    SELECT CAST(COUNT(*) AS INTEGER) FROM public."UserTable" u
    LEFT JOIN
    public."BlogsTable" b
    ON b."blogOwnerId" = u."id"
    LEFT JOIN public."APIPostTable" p
    ON b."id" = p."blogId"
    LEFT JOIN public."APICommentTable" c
    ON c."postId" = p."id"
    WHERE b."blogOwnerId" = $1;
    `, [userId])
      const totalCount = totalCountQuery[0].count
      const pagesCount = Math.ceil(totalCount / pageSize);
      const page = paginationCriteria.pageNumber;
      const sortBy = paginationCriteria.sortBy;
      const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
      const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);
      //console.log(listOfPostsForBlogs, "list of posts nhui");
      const result = await this.dataSource.query(`
    SELECT CAST(c."id" AS TEXT),
        u."login",
        "email",
        "password",
        c."createdAt",
        "isConfirmed",
        "code",
        "codeDateOfExpiary",
        "banDate",
        "banReason",
        "isBanned",
        "name",
        "description",
        "websiteUrl",
        "isMembership",
        CAST("blogOwnerId" AS TEXT),
        "blogBanId",
        "title",
        "shortDescription",
        c."content",
        CAST("blogId" AS TEXT),
        "blogName",
        c."isHiden",
        CAST("postId" AS TEXT),
        CAST("commentatorId" AS TEXT) 
        FROM public."UserTable" u
    RIGHT JOIN public."APICommentTable" b
    ON c."commentatorId" = u."id"
    RIGHT JOIN public."APIPostTable" c
    ON c."postId" = p."id"
    RIGHT JOIN public."blogTable" p
    ON b."id" = p."blogId"
    
    WHERE b."blogOwnerId" = $1
    ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
    LIMIT $2 OFFSET $3;
    `, [userId, pageSize, ToSkip])
      console.log(result, " result in getListOfCommentsByPostIds");
      console.log(result, "blyat");


      const array = {
        pageSize: pageSize,
        totalCount: totalCount,
        pagesCount: pagesCount,
        page: page,
        items: result.map(item => this.common.mongoPostAndCommentCommentSlicing(item, result)),
      };
      console.log(array, " console.log(array) to return")
      return array

    }
}