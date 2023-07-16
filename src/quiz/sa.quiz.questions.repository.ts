import {paginationCriteriaType} from '../appTypes';
import {Common} from '../common';
import {Injectable} from "@nestjs/common";
import {BanBlogDTO, BlogDTO, QuizDTO} from "../input.classes";
import {DataSource, ILike, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {APIQuizQuestion} from "../entities/quiz-entity";
import {isUUID} from "class-validator";

@Injectable()
export class QuizQuestionsRepository {
    constructor(
        @InjectRepository(APIQuizQuestion) protected quizQuestionsTypeORMRepository: Repository<APIQuizQuestion>,
        protected readonly dataSource: DataSource,
        protected readonly common: Common,
    ) {
    }

    async getAllQuizQuestionsWithPagination(blogsPagination: paginationCriteriaType) {
        let filter: { body?: any } = {}
        filter.body = blogsPagination.bodySearchTerm ? `%${blogsPagination.bodySearchTerm}%` : '%%'

        const pageSize = blogsPagination.pageSize;

        const totalCount : number = await this.quizQuestionsTypeORMRepository
            .countBy({
                body : ILike(filter.body),
            })
        const pagesCount = Math.ceil(totalCount / pageSize);
        const page = blogsPagination.pageNumber;
        const sortBy = blogsPagination.sortBy;
        const sortDirection: 'asc' | 'desc' = blogsPagination.sortDirection;
        const ToSkip = blogsPagination.pageSize * (blogsPagination.pageNumber - 1);

        const result = await this.quizQuestionsTypeORMRepository
            .find({
                where: {
                    body: ILike(filter.body),
                },
                order: {
                    [sortBy] :  sortDirection.toUpperCase()
                },
                take : pageSize,
                skip : ToSkip
            })


        return {
            pagesCount,
            page,
            pageSize,
            totalCount,
            items : result
        }

    }


    async createNewQuizQuestion(quizQuestion : APIQuizQuestion) {
        return await this.quizQuestionsTypeORMRepository.save(quizQuestion)
    }

    async findQuizQuestionById(quizQuestionId: string) : Promise<APIQuizQuestion>  {

        if (!quizQuestionId || !isUUID(quizQuestionId))  return null;

        const foundQuizQuestion : APIQuizQuestion = await this.quizQuestionsTypeORMRepository.findOneBy({ id: quizQuestionId })

        if (!foundQuizQuestion) {
            return null
        } else {
            return foundQuizQuestion
        }
    }

    async updateQuestionOfQuizById(DTO: QuizDTO, presentQuizQuestion: APIQuizQuestion) {


        if (!presentQuizQuestion || !DTO) {
            return null
        }
        const quizQuestionToUpdate = APIQuizQuestion.createToUpdate(DTO, presentQuizQuestion)

        const updateQuizQuestoinResult: APIQuizQuestion = await this.quizQuestionsTypeORMRepository.save(quizQuestionToUpdate)
        console.log(quizQuestionToUpdate, "quizQuestionToUpdate to return")
        console.log(updateQuizQuestoinResult, " updateQuizQuestoinResult")
        return true
    }

    async deleteQuizQuestionById(quizQuestionId: string) {
        if (!quizQuestionId) {
            return null
        }

        await this.quizQuestionsTypeORMRepository
            .delete({
                id : quizQuestionId
            })

        return true
    }



    async deleteAllData() {
        await this.quizQuestionsTypeORMRepository.delete({})
    }


    async generateFiveRandomQuestions() : Promise<string[]> {
        let array : string[] = []

        const queryResult : APIQuizQuestion[] = await this.dataSource
            .getRepository(APIQuizQuestion)
            .createQueryBuilder("question")
            .orderBy('RANDOM()')
            .take(5)
            .getMany();

        console.log(queryResult, " queryResult");
        queryResult.forEach(item => {array.push(item.id)})
        console.log(array, " resultant array");
        return array
    }

    async findQuizQuestionsListByListOfIds(questions: string[]) {
        const array : APIQuizQuestion[] = []
        if (!questions) return null;
        for (const item of questions) {
            const question : APIQuizQuestion = await this.findQuizQuestionById(item)
            array.push(question)
        }
        return array
    }
}
