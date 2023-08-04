import {InjectModel, Prop} from "@nestjs/mongoose";
import {paginationCriteriaType} from '../appTypes';
import {Common} from '../common';
import {ObjectId} from 'mongodb';
import {Injectable} from "@nestjs/common";
import {BanBlogDTO, BlogDTO} from "../input.classes";
import {DataSource, ILike, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {Blog} from "../entities/blog-entity";
import {APIPost} from "../entities/api-post-entity";
import {User} from "../entities/user-entity";
import {BlogBan} from "../entities/blog-ban-entity";
import {TokenPayload} from "../working.classess";
import { BlogWallpaperPhotoEntity } from "../entities/photo.entities/blog.wallpaper.photo-entity";
import { PhotoSizeViewModel } from "../posts/posts.view.models/photo.size.view.model";
import { APISubscriptionEntity } from "../entities/api-subscription-entity";

@Injectable()
export class SubscriptionsRepository {
    constructor(
        @InjectRepository(APISubscriptionEntity) protected subscriptionsTypeORMRepository: Repository<APISubscriptionEntity>,
        protected readonly dataSource: DataSource,
        protected readonly common: Common,
    ) {
    }


    async saveNewSubscriptionToDB(newSubscription: APISubscriptionEntity) {
        await this.subscriptionsTypeORMRepository.save(newSubscription)
    }

    async findSubscriptionByUserAndBlog(foundBlog: Blog, foundUser: User) : Promise<APISubscriptionEntity> {
        return await this.subscriptionsTypeORMRepository.findOne(
          {
              relations: {
                  blog : true,
                  subscriber : true
              },
              where : {
                  blog : {
                      id : foundBlog.id
                  },
                  subscriber : {
                      id : foundUser.id
                  }
              }
          }
        )
    }
}
