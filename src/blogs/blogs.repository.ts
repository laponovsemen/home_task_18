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

@Injectable()
export class BlogsRepository {
    constructor(
        @InjectRepository(Blog) protected blogsTypeORMRepository: Repository<Blog>,
        @InjectRepository(BlogBan) protected blogBansTypeORMRepository: Repository<BlogBan>,
        @InjectRepository(APIPost) protected postsTypeORMRepository: Repository<APIPost>,
        @InjectRepository(User) protected usersTypeORMRepository: Repository<User>,
        protected readonly dataSource: DataSource,
        protected readonly common: Common,
    ) {
    }

    async getAllBlogs(blogsPagination: paginationCriteriaType) {
        let filter: { name?: any } = {}
        filter.name = blogsPagination.searchNameTerm ? `%${blogsPagination.searchNameTerm}%` : '%%'

        const pageSize = blogsPagination.pageSize;
       /* const totalCountQuery = await this.dataSource.query(`
        SELECT CAST(COUNT(*) AS INTEGER) FROM public."BlogsTable"
        WHERE  "name" ILIKE $1 AND "blogBanId" IS NULL
    `, [filter.name])
*/
        const totalCount = await this.blogsTypeORMRepository
            .countBy({
                name : ILike(filter.name),
                blogBan : {
                    isBanned : false
                }
            })
        const pagesCount = Math.ceil(totalCount / pageSize);
        const page = blogsPagination.pageNumber;
        const sortBy = blogsPagination.sortBy;
        const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
        const ToSkip = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);


        /*const result = await this.dataSource.query(`
    SELECT CAST("id" AS TEXT),
    "name" COLLATE "C",
    "description",
    "websiteUrl",
    "isMembership",
    "createdAt"
     FROM public."BlogsTable"
     WHERE  "name" ILIKE $3 AND "blogBanId" IS NULL
     ORDER BY "${sortBy}" ${sortDirection.toUpperCase()} 
     LIMIT $1 OFFSET $2
    `, [pageSize, ToSkip, filter.name])*/

        const result = await this.blogsTypeORMRepository
            .find({
                relations : {
                  main : true,
                  wallpaper : true
                },
                where: {
                    name: ILike(filter.name),
                    blogBan: {
                        isBanned: false
                    }
                },
                order: {
                    [sortBy] :  sortDirection.toUpperCase()
                },
                take : pageSize,
                skip : ToSkip
            })


        if (result) {
            const items = result.map((item) => {
                return this.common.mongoBlogSlicingWithoutBlogOwnerInfo(item);
            });
            const array = await Promise.all(items);
            console.log(
                {
                    pageSize: pageSize,
                    totalCount: totalCount,
                    pagesCount: pagesCount,
                    page: page,
                    items: array,
                },
                'its fucking result',
            );
            return {
                pageSize: pageSize,
                totalCount: totalCount,
                pagesCount: pagesCount,
                page: page,
                items: array,
            };
        }

    }

    async getAllBlogsForSpecifiedBlogger(blogsPagination: paginationCriteriaType, userId: string) {
        let filter: { name?: any } = {}
        filter.name = blogsPagination.searchNameTerm ? `%${blogsPagination.searchNameTerm}%` : '%%'

        const pageSize = blogsPagination.pageSize;


        /*const totalCountQuery = await this.dataSource.query(`
    SELECT CAST(COUNT(*) AS TEXT) FROM public."BlogsTable"
        WHERE "blogOwnerId" = $1 AND public."BlogsTable"."name" ILIKE $2
    `, [userId, filter.name])*/

        const totalCount = await this.blogsTypeORMRepository
            .count({
                where: {
                    blogOwner : {
                        id : userId
                    },
                    name: ILike(filter.name)
                }
            })
        const pagesCount : number = Math.ceil(totalCount / pageSize);
        const page : number = blogsPagination.pageNumber;
        const sortBy : string = blogsPagination.sortBy;
        const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
        const ToSkip : number = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);


        const result = await this.dataSource.query(`
    SELECT CAST("id" AS TEXT),
    "name" COLLATE "C",
    "description",
    "websiteUrl",
    "isMembership",
    "createdAt"
     FROM public."blog"
     WHERE "blogOwnerId" = $1  AND public."blog"."name" ILIKE $4
     ORDER BY "${sortBy}" ${sortDirection.toUpperCase()} 
     LIMIT $2 OFFSET $3
    `, [userId, pageSize, ToSkip, filter.name])

        if (result) {
            const items = result.map((item) => {
                return this.common.mongoBlogSlicingWithoutBlogOwnerInfo(item);
            });
            const array = await Promise.all(items);
            console.log(
                {
                    pageSize: pageSize,
                    totalCount: totalCount,
                    pagesCount: pagesCount,
                    page: page,
                    items: array,
                },
                'its fucking result',
            );
            return {
                pageSize: pageSize,
                totalCount: totalCount,
                pagesCount: pagesCount,
                page: page,
                items: array,
            };
        }
    }

    async getAllPostsForSpecificBlog(paginationCriteria: paginationCriteriaType, blogId: string,) {

        const foundBlog = await this.blogsTypeORMRepository
            .findOneBy({
                id : blogId
            })

        if(!foundBlog){
            return null
        }

        let totalCount
        try {
            /*countBlogsQuery = await this.dataSource.query(`
    SELECT CAST(COUNT(*) AS INTEGER) 
    FROM public."APIPostTable"
     WHERE "blogId" = $1
    `, [blogId])*/

            totalCount = await this.postsTypeORMRepository
                .countBy({
                    blog : {id : blogId}
                })

        } catch (e) {
            console.log(e)
            return null
        }
        console.log(totalCount, " countBlogsQuery")
        const pageSize = paginationCriteria.pageSize;
        const pagesCount = Math.ceil(totalCount / pageSize);
        const page = paginationCriteria.pageNumber;
        const sortBy = paginationCriteria.sortBy;
        const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
        const ToSkip =
            paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);

        /*const result = await this.dataSource.query(`
    SELECT CAST("id" AS TEXT),
     "title",
      "shortDescription",
       "content",
        CAST("blogId" AS TEXT),
         "blogName",
          "createdAt",
           "isHiden"

     FROM public."APIPostTable"
     WHERE "blogId" = $1
     ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
     LIMIT $2 OFFSET $3
    `, [blogId, pageSize, ToSkip])
*/
        const result = await this.postsTypeORMRepository
            .find({
                relations: {
                    blog : true,
                    main : true
                },
                where : {
                    blog : {
                        id : blogId
                    }
                },
                order : {
                    [sortBy]: sortDirection.toUpperCase()
                },
                skip : ToSkip,
                take : pageSize
            })

        console.log(
            {
                pageSize: pageSize,
                totalCount: totalCount,
                pagesCount: pagesCount,
                page: page,
                items: result,
            },
            'its fucking result',
        );
        return {
            pageSize: pageSize,
            totalCount: totalCount,
            pagesCount: pagesCount,
            page: page,
            items: result.map(item => this.common.SQLPostMapping(item)),
        };
    }

    async createNewBlog(DTO: BlogDTO, user: TokenPayload) {

        const blogOwner : User = await this.usersTypeORMRepository.findOneBy({id: user.userId})
        const newBanWithEmptyFields = BlogBan.create()
        const newBan : BlogBan = await this.blogBansTypeORMRepository.save(newBanWithEmptyFields)
        const emptyWallpaper : BlogWallpaperPhotoEntity = BlogWallpaperPhotoEntity.createEmptyPhoto()
        const newWallpaper : BlogWallpaperPhotoEntity = await this.dataSource // ask mentor
          .getRepository(BlogWallpaperPhotoEntity).save(emptyWallpaper)

        const blogToCreate: Blog = Blog.create(DTO, blogOwner, newBan, emptyWallpaper)
        console.log(blogToCreate, " blog");
        const createdBlog: Blog = await this.blogsTypeORMRepository.save(blogToCreate)
        console.log(createdBlog, "createdBlog to return")
        return {
            id: createdBlog.id,
            name: blogToCreate.name,
            description: blogToCreate.description,
            websiteUrl: blogToCreate.websiteUrl,
            isMembership: blogToCreate.isMembership,
            createdAt: blogToCreate.createdAt,
            images : {
              main : blogToCreate.main,
              wallpaper : blogToCreate.wallpaper.url ? blogToCreate.wallpaper : null
            },
            banInfo: {
                banDate: null,
                isBanned: false
            }
        }
    }

    async getBlogById(blogId: string, userId : string) {

        if (!blogId) {
            return null
        }
        /*const foundBlogQuery = await this.dataSource.query(`
        SELECT * FROM public."BlogsTable"
        WHERE "id" = $1 AND "blogBanId" IS NULL
        `, [blogId])*/

        const foundBlog = await this.blogsTypeORMRepository.findOne({
            where : {
                id: blogId,
                blogBan: {
                    isBanned: false
                }
            },
            relations : {
                main : true,
                wallpaper : true,
                subscribtionOfBlog : {
                    subscriber : true
                }
            }
        })

        if (!foundBlog) {
            return null
        }
        return {
            id: foundBlog.id,
            name: foundBlog.name,
            description: foundBlog.description,
            websiteUrl: foundBlog.websiteUrl,
            isMembership: foundBlog.isMembership,
            createdAt: foundBlog.createdAt,
            images : {
                main : foundBlog.main.map(item => PhotoSizeViewModel.getViewModel(item)),
                wallpaper : foundBlog.wallpaper.url ? PhotoSizeViewModel.getViewModelForWallpaper(foundBlog.wallpaper) : null
            },
            subscribersCount : foundBlog.subscribtionOfBlog.length,
            currentUserSubscriptionStatus : foundBlog.subscribtionOfBlog.find(item => item.subscriber.id === userId)
              ? foundBlog.subscribtionOfBlog.find(item => item.subscriber.id === userId).isSubscribed
                ? "Subscribed" : "Unsubscribed"
              : "None"

        }
    }

    async updateBlogById(DTO: BlogDTO, blogId: string) {

        /*const updateResult = await this.dataSource.query(`
        UPDATE public."BlogsTable"
        SET  "name" = $2, "description" = $3, "websiteUrl" = $4
        WHERE "id" = $1;
        `, [blogId, DTO.name, DTO.description, DTO.websiteUrl])*/
        const presentBlog = await this.blogsTypeORMRepository.findOneBy({
            id: blogId
        })
        if (!presentBlog) {
            return null
        }
        const blogToUpdate = Blog.createToUpdate(DTO, presentBlog)

        const updateBlogResult: Blog = await this.blogsTypeORMRepository.save(blogToUpdate)
        console.log(blogToUpdate, "createdBlog to return")
        console.log(updateBlogResult, " updateResult")
        return true
    }

    async deleteBlogById(blogId: string) {

        if (!blogId) {
            return null
        }

        const foundBlog = await this.blogsTypeORMRepository
            .findOneBy({
                id : blogId
            })

        if(!foundBlog){
            return null
        }
        const deletedBlog = await this.blogsTypeORMRepository
            .delete({
                id : blogId
            })


        return true
    }

    async createPostForSpecificBlog(DTO: any, id: string) {

        /*const blogsQuery = await this.dataSource.query(`
        SELECT * FROM public."BlogsTable"
        WHERE "id" = $1
        `,[id])*/
        const blog = await this.blogsTypeORMRepository.findOneBy({id: id})
        console.log(blog, " blogsQuery in createPostForSpecificBlog")
        console.log(blog, " blog in createPostForSpecificBlog")
        if (!blog) {
            return null
        }
        const newPost = APIPost.create(DTO, blog)


        const createdPostForSpecificBlog = await this.postsTypeORMRepository.save(newPost)

        /*const createdPostForSpecificBlog = await this.dataSource.query(`
        INSERT INTO public."APIPostTable"(
         "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "isHiden")
        VALUES ( $1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        `, [
          newPost.title,
          newPost.shortDescription,
          newPost.content,
          newPost.blogId,
          newPost.blogName,
          newPost.createdAt,
          false])*/

        console.log(newPost, "newPost")
        console.log(createdPostForSpecificBlog, "createdPostForSpecificBlog")
        return this.common.SQLPostMapping(createdPostForSpecificBlog)
    }

    async deleteAllData() {
        await this.blogsTypeORMRepository.delete({})
    }


    async getBlogByIdWithBloggerInfo(blogId) {
        if (!blogId) {
            return null
        }

        let foundBlogQuery

        try {
            foundBlogQuery = await this.blogsTypeORMRepository.findOne({
                    where: {id: blogId},
                    relations: {
                        blogOwner: true,
                        blogBan : true,
                        posts : true,
                        main : true,
                        wallpaper : true
                    },
                    select: {
                        blogOwner: {
                            id: true,
                            login: true
                        }
                    }
                },
            )
        } catch (e) {
            console.log(e)
            return null
        }

        console.log(foundBlogQuery, " foundBlogQuery  in getBlogByIdWithBloggerInfo")
        if (!foundBlogQuery) {
            return null
        }
        return foundBlogQuery

    }


    async changeBanStatusOfBlog(DTO: BanBlogDTO, blogId: string) {
        const isBanned = DTO.isBanned
        if (isBanned) {

        }
        const ban = await this.dataSource.query(`
    INSERT INTO public."BlogBanTable"(
    id, "isBanned", "banDate")
    VALUES ($1, $2, $3);
    `, [])
    }

    async BanBlog(blog : Blog) {

        console.log(blog, "blog")
        const banToUpdate = blog.blogBan
        const updatedBan =  await this.blogBansTypeORMRepository
            .update({
                id : banToUpdate.id
            }, {
                    banDate : new Date().toISOString(),
                    isBanned : true
            })

        return
    }

    async UnbanBlog(blog : Blog) {
        console.log(blog, "blog")
        const banToUpdate = blog.blogBan
        const updatedBan =  await this.blogBansTypeORMRepository
            .update({
                id : banToUpdate.id
            }, {
                banDate : null,
                isBanned : false
            })

        return
    }
}
