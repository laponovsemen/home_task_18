import { ObjectId } from 'mongodb';
import { Mongoose } from 'mongoose';
import { BlogViewModelType, paginationCriteriaType, PostDBModel } from "./appTypes";
import {
  APIComment,
  APILike,
  APIPost,
  Blog,
  BloggerBansForSpecificBlog,
  commentatorInfoModel, SQLComment,
  User,
  WithMongoId
} from "./mongo/mongooseSchemas";
import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import {v4 as uuidv4} from "uuid";
import { Prop } from "@nestjs/mongoose";

@Injectable()
export class Common {
  mongoObjectId = function () {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
      return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
  }


 tryConvertToObjectId = (id: string): Types.ObjectId | null => {
  try {
    const convertedId = new Types.ObjectId(id);

    return convertedId;
  } catch (e) {
    return null;
  }
}
  NewestLikesTypeSlicing = (Obj2: APILike) => {
    return {
      addedAt : Obj2.addedAt,
      userId : Obj2.userId,
      login : Obj2.login
    }
  }
   delay = async (milliseconds: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, milliseconds)
    })
  }
  getPaginationCriteria(QueryParams: any) : paginationCriteriaType{
    const banStatus = QueryParams.banStatus ? QueryParams.banStatus.toString() : "all";
    const searchNameTerm = QueryParams.searchNameTerm ? QueryParams.searchNameTerm.toString() : null;
    const searchLoginTerm = QueryParams.searchLoginTerm ? QueryParams.searchLoginTerm.toString() : null;
    const searchEmailTerm = QueryParams.searchEmailTerm ? QueryParams.searchEmailTerm.toString() : null;
    const pageNumber: number = QueryParams.pageNumber ? parseInt(QueryParams.pageNumber.toString(), 10) : 1;
    const pageSize: number = QueryParams.pageSize ? parseInt(QueryParams.pageSize.toString(), 10) : 10;
    const sortBy: string = QueryParams.sortBy ? QueryParams.sortBy.toString() : 'createdAt';
    const sortDirection: 'asc' | 'desc' = QueryParams.sortDirection === 'asc' ? 'asc' : 'desc';
    return {
      searchNameTerm,
      searchLoginTerm,
      searchEmailTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      banStatus
    };
  }
  SQLPostMapping = (Obj2: WithMongoId<APIPost>) => {
    return {
      id: Obj2.id.toString(),
      title: Obj2.title,
      shortDescription: Obj2.shortDescription,
      content: Obj2.content,
      blogId: Obj2.blogId.toString(),
      blogName: Obj2.blogName,
      createdAt: Obj2.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: [],
      },
    };
  };
  mongoCommentSlicing = (Obj2: APIComment) => {
    return {
      id: Obj2.id,
      content: Obj2.content,
      commentatorInfo: {
        userId : Obj2.commentatorInfo.userId,
        userLogin : Obj2.commentatorInfo.userLogin,
      },
      createdAt: Obj2.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
      },
    };
  };
  SQLCommentMapping = (Obj2: SQLComment) => {
    return {
      id: Obj2.id,
      content: Obj2.content,
      commentatorInfo: {
        userId : Obj2.commentatorId,
        userLogin : Obj2.login,
      },
      createdAt: Obj2.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
      },
    };
  };
  mongoBlogSlicing = (Obj2: Blog) => {
    return {
      id: Obj2.id,
      name: Obj2.name,
      description: Obj2.description,
      websiteUrl: Obj2.websiteUrl,
      isMembership: Obj2.isMembership,
      createdAt: Obj2.createdAt,
      blogOwnerInfo: Obj2.blogOwnerInfo,
      banInfo : Obj2.banInfo
    };
  };
  mongoBlogSlicingWithoutBlogOwnerInfo = (Obj2: Blog) => {
    return {
      id: Obj2.id,
      name: Obj2.name,
      description: Obj2.description,
      websiteUrl: Obj2.websiteUrl,
      isMembership: Obj2.isMembership,
      createdAt: Obj2.createdAt,
      banInfo : Obj2.banInfo

    };
  };

  createEmailSendCode() {
    return uuidv4()
  }
  /*mongoUserSlicing = (Obj2: User) => {
    return {
      id: Obj2.id,
      login: Obj2.login,
      email: Obj2.email,
      createdAt : Obj2.createdAt,
      banInfo : Obj2.banInfo
    };
  };*/


  mongoBanSlicing= (Obj2: any) => {
    return {banInfo:
        {banDate: Obj2.banDate,
          banReason:Obj2.banReason,
          isBanned: Obj2.isBanned
        },
      id: Obj2.userId,
      login: Obj2.login}
  }

  mongoPostAndCommentCommentSlicing = (item : any, listOfPostsForBlogs: APIPost[]) =>  {
    const post  = listOfPostsForBlogs.find(post => post.id.toString() === item.postId.toString())
    console.log(post , " post mongoPostAndCommentCommentSlicing");
    console.log(listOfPostsForBlogs, " listOfPostsForBlogs");
    console.log(item, "item");
    //console.log(post.id.toString() === item.postId.toString(), "post._id.toString() === item.postId.toString()");
    //console.log(post.id.toString(), " post._id.toString()");
    console.log(item.postId.toString(), " item.postId.toString()");
    const result = {id: item.id,
      content: item.content,
      createdAt: item.createdAt,
      commentatorInfo:{
        userId: item.commentatorId,
        userLogin: item.login
    },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None"
    },
      postInfo:{
        blogId: item.blogId,
        blogName: item.blogName,
        title: item.title,
        id: item.postId
    }
    }
    console.log(result, " blyat blyat");
    return result
  }

  SQLUsermapping(Obj: User) {
        return {
          id: Obj.id.toString(),
          login: Obj.login,
          email: Obj.email,
          createdAt: Obj.createdAt,
          banInfo : {
            banDate: Obj.banDate,
            banReason: Obj.banReason,
            isBanned: Obj.isBanned
          }
        }
    }

  SQLUserWithPasswordMapping(Obj: User) {
    return {
      id: Obj.id.toString(),
      login: Obj.login,
      email: Obj.email,
      createdAt: '2023-06-22T04:50:48.741+03:00',
      password: Obj.password,
      banInfo: {
        banDate: Obj.banDate,
        banReason: Obj.banReason,
        isBanned: Obj.isBanned
      }
    }
  }

    SQLBlogMapping(Obj : any) {
      return {
          id: Obj.id,
          name: Obj.name,
          description: Obj.description,
          websiteUrl: Obj.websiteUrl,
          isMembership: Obj.isMembership,
          createdAt: Obj.createdAt,
          blogOwnerInfo:{
            userId: Obj.blogOwnerId,
            userLogin: Obj.login
          },
          banInfo:{
            isBanned: !!Obj.isBanned ,
            banDate: Obj.banDate ? Obj.banDate : null}}
        }
}
