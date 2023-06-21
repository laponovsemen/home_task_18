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


}