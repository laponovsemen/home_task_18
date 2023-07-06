import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { CommentForSpecifiedPostDTO } from "../input.classes";
import { Common } from "../common";
import { LikeRepository } from "../likes/likes.repository";
import {DataSource} from "typeorm";
import {APIPost} from "../entities/api-post-entity";
import {User} from "../entities/user-entity";

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
      /*const totalCountQuery = await this.dataSource.query(`
    SELECT CAST(COUNT(*) AS INTEGER) FROM public."UserTable" u
    LEFT JOIN
    public."BlogsTable" b
    ON b."blogOwnerId" = u."id"
    LEFT JOIN public."APIPostTable" p
    ON b."id" = p."blogId"
    LEFT JOIN public."APICommentTable" c
    ON c."postId" = p."id"
    WHERE b."blogOwnerId" = $1;
    `, [userId])*/
      console.log("start making request of totalCount in getListOfCommentsForSpecificUser")
      const totalCount =  this.dataSource
          .getRepository(User)
          .createQueryBuilder('user')
            .leftJoin('user.blogs', 'blogs')
            .leftJoin('blogs.posts', 'posts')
            .leftJoin('posts.comments', 'comments')
            .loadRelationCountAndMap('user.comments', 'user.comments')
            .where("blogs.blogOwnerId" = "user.id")
            .getSql();

      //SELECT "user"."id" AS "user_id", "user"."login" AS "user_login", "user"."email" AS "user_email", "user"."password" AS "user_password",
      // "user"."createdAt" AS "user_createdAt", "user"."isConfirmed" AS "user_isConfirmed", "user"."code" AS "user_code",
      // "user"."codeDateOfExpiary" AS "user_codeDateOfExpiary", "user"."banDate" AS "user_banDate", "user"."banReason" AS "user_banReason",
      // "user"."isBanned" AS "user_isBanned" FROM "user" "user" LEFT JOIN "blog" "blogs" ON "blogs"."blogOwnerId"="user"."id"
      // LEFT JOIN "api_post" "posts"
      // ON "posts"."blogId"="blogs"."id"
      // LEFT JOIN "api_comment" "comments"
      // ON "comments"."postId"="posts"."id"
      // WHERE 3a97ba3c-90cc-48e3-ad3c-45e789ffc22a  totalCount in getListOfCommentsForSpecificUser

      console.log(totalCount, " totalCount in getListOfCommentsForSpecificUser")
      const pagesCount = Math.ceil(0 / pageSize);
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
        FROM public."APICommentTable" c
    RIGHT JOIN public."UserTable" u
    ON c."commentatorId" = u."id"
    RIGHT JOIN public."APIPostTable" p
    ON c."postId" = p."id"
    RIGHT JOIN public."BlogsTable" b
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