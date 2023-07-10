import {LikeStatusDTO} from "../input.classes";
import {Injectable} from "@nestjs/common";
import {Common} from "../common";
import {DataSource, Repository} from "typeorm";
import {APILike} from "../entities/api-like-entity";
import {parentTypeEnum, StatusTypeEnum} from "../mongo/mongooseSchemas";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../entities/user-entity";
import {APIPost} from "../entities/api-post-entity";
import {APIComment} from "../entities/api-comment-entity";


@Injectable()
export class LikeRepository {
    constructor(protected readonly dataSource: DataSource,
                @InjectRepository(APILike) protected likesTypeORMRepository: Repository<APILike>,
                @InjectRepository(User) protected usersTypeORMRepository: Repository<User>,
                protected readonly common: Common) {
    }

    async createNewLike(Like: APILike) {

    }

    async likePost(DTO: LikeStatusDTO, userId: string, login: string, post : APIPost) {
        const myLike = await this.findMyStatusForSpecificPost(post.id, userId)
        const status = DTO.likeStatus
        if (!myLike) {
            const user = await this.usersTypeORMRepository.findOneBy({
                id : userId
            })
            const dateOfCreation = new Date().toISOString()


            const newLike = APILike.createPost(DTO, user, post)

            await this.likesTypeORMRepository.save(newLike)
            /*await this.dataSource.query(`
     INSERT INTO public."APILikeTable"(
    "parentId", "parentType", "addedAt", "userId", "login", "status", "isHiden")
    VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [parentId, parentType, addedAt, userId, login, status, false])*/


            return true
        } else {

            await this.changeMyLikeStatus(status, userId, post.id, parentTypeEnum.post)

            return true
        }
    }

    async changeMyLikeStatus(status: StatusTypeEnum, userId: string, parentId: string, parentType: parentTypeEnum) {
        await this.dataSource.query(`
    UPDATE public."APILikeTable"
    SET status = $1
    WHERE "userId" = $2 AND "parentId" = $3 AND "parentType" = $4;
    `, [status, userId, parentId, parentType])

    }

    async findLikesCountForSpecificPost(postId: string) {
        /*const likes = await this.dataSource.query(`
        SELECT cast(count(*) as INTEGER) FROM public."APILikeTable"
        WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3 AND "isHiden" = $4;
        `, [parentTypeEnum.post, postId, StatusTypeEnum.Like, false])*/

        const likes = await this.likesTypeORMRepository.count({
            where: {
                parentType: parentTypeEnum.post,
                post: {
                    id: postId
                },
                status: StatusTypeEnum.Like,
                isHiden: false

            }
        })
        return likes

    }

    async findDisikesCountForSpecificPost(postId: string) {
        /*const dislikes = await this.dataSource.query(`
        SELECT cast(count(*) as INTEGER) FROM public."APILikeTable"
        WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3 AND "isHiden" = $4;
        `, [parentTypeEnum.post, postId, StatusTypeEnum.Dislike, false])
        return dislikes[0].count*/


        const dislikes = await this.likesTypeORMRepository.count({
            where: {
                parentType: parentTypeEnum.post,
                post: {
                    id: postId
                },
                status: StatusTypeEnum.Dislike,
                isHiden: false

            }
        })
        return dislikes
    }

    async findNewestLikesForSpecificPost(postId: string) {

        /* const newestLikesToUpdate = await this.dataSource.query(`
        SELECT
        "login",
        "addedAt",
        CAST("userId" AS TEXT)
         FROM public."APILikeTable"
         WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3 AND "isHiden" = $4
         ORDER BY "addedAt" DESC
         LIMIT 3 OFFSET 0;
         `, [parentTypeEnum.post, postId, StatusTypeEnum.Like, false])*/

        const newestLikesToUpdate = await this.likesTypeORMRepository.find(
            {
                relations: {
                    user: true,
                    post: true
                },
                where: {
                    parentType: parentTypeEnum.post,
                    post: {id: postId},
                    status: StatusTypeEnum.Like,
                    isHiden: false
                },
                order: {
                    addedAt: 'DESC',
                },
                skip: 0,
                take: 3,

            }
        )

        console.log(newestLikesToUpdate, " newestLikesToUpdate")
        return newestLikesToUpdate.map(like => {
            return {
                addedAt : like.addedAt,
                login : like.user.login,
                userId : like.user.id,
            }

        })
    }

    async findMyStatusForSpecificPost(postId: string, userId: string) {
        console.log(userId, "userIdAsString")
        console.log(postId, "postId")
        if (!userId) {
            console.log(userId, "нету юзер ай ди");
            return null

        }
        console.log("before filter");


        /*const result = await this.dataSource.query(`
    SELECT "status" FROM public."APILikeTable"
    WHERE "parentId" = $1 AND "userId" = $2 AND "parentType" = $3;
    `, [postId, userId, parentTypeEnum.post])
        */

        const result = await  this.likesTypeORMRepository
            .findBy({
                post : {
                    id : postId
                },
                user : {
                    id : userId
                },
                parentType : parentTypeEnum.post
            })
        console.log(result, "result");
        return result[0] ? result[0].status : null
    }

    async findMyStatusForComment(commentId: string, userIdAsString: string) {
        if (!userIdAsString) {
            return null
        }

       /* const result = await this.dataSource.query(`
        SELECT * FROM public."APILikeTable"
        WHERE "parentId" = $1 AND "parentType" = $2 AND "userId" = $3;
        `, [commentId, parentTypeEnum.comment, userIdAsString])*/
        const result = await this.likesTypeORMRepository
            .findOneBy({
                comment : {
                    id : commentId
                },
                parentType : parentTypeEnum.comment,
                user : {
                    id : userIdAsString
                }
            })
        console.log(result, " MY STATUS IN findMyStatusForComment");
        return result

    }

    async deleteAllData() {
        await this.likesTypeORMRepository.delete({})
    }

    async likeComment(DTO: LikeStatusDTO, userIdFromToken: string, login: string, comment: APIComment) {
        const user = await this.usersTypeORMRepository.findOneBy({
            id : userIdFromToken
        })
        const myLike = await this.findMyStatusForComment(comment.id, user.id)
        const status = DTO.likeStatus
        if (!myLike) {

            /*await this.dataSource.query(`
      INSERT INTO public."APILikeTable"(
     "parentId", "parentType", "addedAt", "userId", "login", "status", "isHiden")
        VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [parentId, parentType, addedAt, userId, login, status, false])*/

            const newLike = APILike.createLikeForComment(user, comment, status)
            await this.likesTypeORMRepository.save(newLike)

            return true
        } else {

            await this.changeMyLikeStatus(status, userIdFromToken, comment.id, parentTypeEnum.comment)

            return true
        }
    }

    async findLikesCountForSpecificComment(commentId: string) {
       /* const likes = await this.dataSource.query(`
    SELECT cast(count(*) as INTEGER) FROM public."APILikeTable"
    WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3 AND "isHiden" = $4;
    `, [parentTypeEnum.comment, commentId, StatusTypeEnum.Like, false])
        console.log(likes[0].count, " findLikesCountForSpecificComment")
        return likes[0].count*/

        const likes = await this.likesTypeORMRepository.count({
            where: {
                parentType: parentTypeEnum.comment,
                comment: {
                    id: commentId
                },
                status: StatusTypeEnum.Like,
                isHiden: false

            }
        })
        return likes


    }

    async findDisikesCountForSpecificComment(commentId: string) {
        /*const dislikes = await this.dataSource.query(`
    SELECT cast(count(*) as INTEGER) FROM public."APILikeTable"
    WHERE "parentType" = $1 AND "parentId" = $2 AND "status" = $3 AND "isHiden" = $4;
    `, [parentTypeEnum.comment, commentId, StatusTypeEnum.Dislike, false])
        console.log(dislikes[0].count, " findDisikesCountForSpecificComment")
        return dislikes[0].count*/

        const likes = await this.likesTypeORMRepository.count({
            where: {
                parentType: parentTypeEnum.comment,
                comment: {
                    id: commentId
                },
                status: StatusTypeEnum.Dislike,
                isHiden: false

            }
        })
        return likes
    }

    async findMyStatusForSpecificComment(commentId: string, userId: string) {

        console.log(userId, "after user id");
        if (!userId) {
            console.log(userId, "нету юзер ай ди");
            return null
        }

        console.log("before filter");
        const result = await  this.likesTypeORMRepository
            .findBy({
                comment : {
                    id : commentId
                },
                user : {
                    id : userId
                },
                parentType : parentTypeEnum.comment
            })
        console.log(result, "result");
        return result[0] ? result[0].status : null

    }

    async makeLikesHiden(userId: string) {
        /*await this.dataSource.query(`
    UPDATE public."APILikeTable"
    SET "isHiden" = $2
    WHERE "userId" = $1;
    `, [userId, true])*/

        await this.likesTypeORMRepository
            .update({user: {id: userId}},
                {isHiden : true})
    }

    async makeLikesVisible(userId: string) {
        /*await this.dataSource.query(`
    UPDATE public."APILikeTable"
    SET "isHiden" = $2
    WHERE "userId" = $1;
    `, [userId, false])*/

        await this.likesTypeORMRepository
            .update({user: {id: userId}},
                {isHiden : false})
    }
}