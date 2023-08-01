import {InjectModel, Prop} from "@nestjs/mongoose";
import {paginationCriteriaType} from '../appTypes';
import {Common} from '../common';
import {ObjectId} from 'mongodb';
import {Injectable} from "@nestjs/common";
import {BanBlogDTO, BlogDTO} from "../input.classes";
import { DataSource, ILike, In, Repository } from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {Blog} from "../entities/blog-entity";
import {APIPost} from "../entities/api-post-entity";
import {User} from "../entities/user-entity";
import {BlogBan} from "../entities/blog-ban-entity";
import {TokenPayload} from "../working.classess";
import { BlogMainPhotoEntity } from "../entities/photo.entities/blog.main.photo-entity";
import { BlogWallpaperPhotoEntity } from "../entities/photo.entities/blog.wallpaper.photo-entity";

@Injectable()
export class BlogMainPhotosRepository {
    constructor(
        @InjectRepository(BlogMainPhotoEntity) protected photosTypeORMRepository: Repository<BlogMainPhotoEntity>,
        protected readonly dataSource: DataSource,
        protected readonly common: Common,
    ) {
    }



    async saveMainToDB(blogsWallpaper: BlogMainPhotoEntity) {
        await this.dataSource.getRepository(BlogMainPhotoEntity).save(blogsWallpaper)
    }
}
