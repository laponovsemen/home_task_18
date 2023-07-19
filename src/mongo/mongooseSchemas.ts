import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { paginationCriteriaType } from "../appTypes";
import { ObjectId } from "mongodb";
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {BloggerBansForSpecificBlog} from "../entities/blogger-bans-for-specific-blog-entity";


export type WithMongoId<Type> = Type & { _id: ObjectId };
export type WithPlayerCredentials<Type> = Type & { player: { id : string, login : string } };
export type WithPlayerRawCredentials<Type> = Type & {  id : string, login : string  };
export type WithPagination<Type> = Type & paginationCriteriaType;
export class NewestLike {
  addedAt: Date;
  userId: string;
  login: string;
}

export class APIPostDTO {
  title: string; //    maxLength: 30
  shortDescription: string; //maxLength: 100
  content: string; // maxLength: 1000
  blogId: ObjectId;
  blogName: string;
  createdAt: Date;
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


