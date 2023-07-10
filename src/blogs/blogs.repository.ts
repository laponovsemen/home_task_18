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
                blogBan : null
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
                where : {
                name : ILike(filter.name),
                blogBan : null
                },
                order : {
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
        const totalCountQuery = await this.dataSource.query(`
    SELECT CAST(COUNT(*) AS TEXT) FROM public."BlogsTable"
        WHERE "blogOwnerId" = $1 AND public."BlogsTable"."name" ILIKE $2
    `, [userId, filter.name])

        const totalCount = parseInt(totalCountQuery[0].count, 10)
        const pagesCount = Math.ceil(totalCount / pageSize);
        const page = blogsPagination.pageNumber;
        const sortBy = blogsPagination.sortBy;
        const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
        const ToSkip = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);


        const result = await this.dataSource.query(`
    SELECT CAST("id" AS TEXT),
    "name" COLLATE "C",
    "description",
    "websiteUrl",
    "isMembership",
    "createdAt"
     FROM public."BlogsTable"
     WHERE "blogOwnerId" = $1  AND public."BlogsTable"."name" ILIKE $4
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
                    blog : true
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
        const blogToCreate : Blog = Blog.create(DTO, blogOwner)

        const createdBlog: Blog = await this.blogsTypeORMRepository.save(blogToCreate)
        console.log(createdBlog, "createdBlog to return")
        return {
            id: createdBlog.id,
            name: blogToCreate.name,
            description: blogToCreate.description,
            websiteUrl: blogToCreate.websiteUrl,
            isMembership: blogToCreate.isMembership,
            createdAt: blogToCreate.createdAt,
            banInfo: {
                banDate: null,
                isBanned: false
            }
        }
    }

    async getBlogById(blogId: string) {

        if (!blogId) {
            return null
        }
        /*const foundBlogQuery = await this.dataSource.query(`
        SELECT * FROM public."BlogsTable"
        WHERE "id" = $1 AND "blogBanId" IS NULL
        `, [blogId])*/

        const foundBlogQuery = await this.blogsTypeORMRepository.findBy({
            id: blogId
        })

        if (foundBlogQuery.length === 0) {
            return null
        }
        const foundBlog = foundBlogQuery[0]
        return {
            id: foundBlog.id.toString(),
            name: foundBlog.name,
            description: foundBlog.description,
            websiteUrl: foundBlog.websiteUrl,
            isMembership: foundBlog.isMembership,
            createdAt: foundBlog.createdAt,

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
        //const blogId = this.common.tryConvertToObjectId(id)
        if (!blogId) {
            return null
        }
        /*const foundBlogQuery = await this.dataSource.query(`
        SELECT * FROM public."BlogsTable"
        WHERE "id" = $1
        `, [parseInt(blogId,10 )])*/
        let foundBlogQuery

        try {
            foundBlogQuery = await this.blogsTypeORMRepository.findOne({
                    where: {id: blogId},
                    relations: {
                        blogOwner: true
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

        console.log(foundBlogQuery, " ffoundBlogQuery  in getBlogByIdWithBloggerInfo")
        if (!foundBlogQuery) {
            return null
        }
        const foundBlog = foundBlogQuery
        return {
            id: blogId,
            name: foundBlog.name,
            description: foundBlog.description,
            websiteUrl: foundBlog.websiteUrl,
            isMembership: foundBlog.isMembership,
            createdAt: foundBlog.createdAt,
            blogOwner: foundBlog.blogOwner
        }
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

    async BanBlog(DTO: BanBlogDTO, blog : Blog) {

        const newBan = BlogBan.create(DTO, blog)
        /*const ban = await this.dataSource.query(`
    INSERT INTO public."BlogBanTable"
    ("isBanned", "banDate")
    VALUES ($1, $2)
    RETURNING "id";
    `, [true, banDate])

        const updateBlog = await this.dataSource.query(`UPDATE public."BlogsTable"
    SET "blogBanId"= $2
        WHERE "id" = $1;
        
    `, [blogId, ban[0].id])*/


        const ban = await this.blogBansTypeORMRepository
            .save(newBan)

        return
    }

    async UnbanBlog(blogId: string, banId: string) {
        const ban = await this.blogBansTypeORMRepository
            .delete({

                blog : {
                    id : blogId
                },
                id : banId
            })

        return
    }
}
