import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { paginationCriteriaType } from "../appTypes";
import { ObjectId } from "mongodb";
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";


export type WithMongoId<Type> = Type & { _id: ObjectId };
export type WithPagination<Type> = Type & paginationCriteriaType;
export class NewestLike {
  addedAt: Date;
  userId: string;
  login: string;
}
export class BanInfoDB {
  banDate: Date | null
  banReason: String | null
  isBanned: boolean
}
export class BlogBanInfoDB {
  banDate: Date | null
  isBanned: boolean
}
const BanInfoDBIS= SchemaFactory.createForClass(BanInfoDB)
const BlogBanInfoDBIS= SchemaFactory.createForClass(BlogBanInfoDB)

export class APIDeviceModel {
  ip:	string // IP address of device during signing in
  title:	string // Device name: for example Chrome 105 (received by parsing http header "user-agent")
  lastActiveDate:	string // Date of the last generating of refresh/access tokens
  deviceId:	string //  Id of connected device session
}
export const DeviceModelSchema = SchemaFactory.createForClass(APIDeviceModel);

export class APISession {
  _id?: ObjectId;
  userId: ObjectId;
  device: APIDeviceModel;
  refreshToken: string;
}


export class BloggerBansForSpecificBlog {
  _id?: ObjectId;
  ownerId: string;
  blogId: string;
  banInfo : BanInfoDB

  userId: ObjectId;
  login: string

}

export class APIPost {
  id? : string;
  title: string; //    maxLength: 30
  shortDescription: string; //maxLength: 100
  content: string; // maxLength: 1000
  blogId: string;
  blogName: string;
  createdAt: Date;
  isHiden: boolean;
}
export class APIPostDTO {
  title: string; //    maxLength: 30
  shortDescription: string; //maxLength: 100
  content: string; // maxLength: 1000
  blogId: ObjectId;
  blogName: string;
  createdAt: Date;
}

export class blogOwnerInfoModel{
  userId : string | null;
  userLogin :string | null;
}
export class Blog {
  id?: ObjectId
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: string;
  blogOwnerInfo : blogOwnerInfoModel;
  banInfo: BlogBanInfoDB
}
export class commentatorInfoModel {
  userId: number;
  userLogin: string;
}



export class APIComment {
  id?: string;
  content: string;
  commentatorInfo: commentatorInfoModel;
  createdAt: string;
  postId : string;
  isHiden : boolean
}
export class SQLComment {
  id?: string;
  content: string;
  commentatorId: string;
  login: string
  createdAt: string;
  postId : string;
  isHiden : boolean
}

export class APILike{
  id?: ObjectId;
  parentId : ObjectId
  parentType :parentTypeEnum
  addedAt : Date
  userId : ObjectId
  login : string
  status : StatusTypeEnum
  isHiden : boolean
}

export enum StatusTypeEnum {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}


export enum parentTypeEnum {
  comment = "comment",
  post = "post"
}


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column({type: 'varchar', collation: 'C', unique: true, nullable: false})
  login: string;
  email: string;
  password: string
  createdAt: Date
  isConfirmed: boolean;
  code: string | null;
  codeDateOfExpiary: Date | null;
  banDate: Date | null
  banReason: String | null
  isBanned: boolean
}
export class UserViewClass {
  id: string;
  login: string;
  email: string;
  password: string
  createdAt: string
  banInfo: BanInfoDB
}

export type BlogDocument = HydratedDocument<Blog>;
export type BanInfoDBDocument = HydratedDocument<BanInfoDB>;
export type PostDocument = HydratedDocument<APIPost>;
export type CommentsDocument = HydratedDocument<APIComment>;
export type UsersDocument = HydratedDocument<User>;
export type SessionDocument = HydratedDocument<APISession>;
export type DeviceDocument = HydratedDocument<APIDeviceModel>;
export type LikesDocument = HydratedDocument<APILike>;
export type BloggerBansForSpecificBlogDocument = HydratedDocument<BloggerBansForSpecificBlog>;
export const BlogsSchema = SchemaFactory.createForClass(Blog);
export const PostsSchema = SchemaFactory.createForClass(APIPost);
export const CommentsSchema = SchemaFactory.createForClass(APIComment);
export const UsersSchema = SchemaFactory.createForClass(User);
export const LikesSchema = SchemaFactory.createForClass(APILike);
export const SessionSchema = SchemaFactory.createForClass(APISession);
export const BloggerBansForSpecificBlogSchema = SchemaFactory.createForClass(BloggerBansForSpecificBlog);
