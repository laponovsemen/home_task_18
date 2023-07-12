import { Injectable } from "@nestjs/common";
import { InjectModel, Prop } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Common } from "../common";
import { paginationCriteriaType } from "../appTypes";
import add from 'date-fns/add'
import { ObjectId } from "mongodb";
import { addMinutes } from "date-fns";
import { SkipThrottle } from "@nestjs/throttler";
import { BanUserDTO } from "../input.classes";
import {DataSource, ILike, Repository} from "typeorm";
import {User} from "../entities/user-entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Blog} from "../entities/blog-entity";

@SkipThrottle()
@Injectable()
export class UsersRepository {
  constructor(protected readonly dataSource: DataSource,
              protected readonly common: Common,
              @InjectRepository(User) protected usersTypeORMRepository : Repository<User>,
  ) {

  };

  async deleteAllData() {
    await this.usersTypeORMRepository.delete({})
  }

  async getAllUsers(paginationCriteria: paginationCriteriaType) {

    const searchLoginTerm = paginationCriteria.searchLoginTerm
    const searchEmailTerm = paginationCriteria.searchEmailTerm
    let searchParams: any[] = []
    if (searchEmailTerm) searchParams.push({email: {$regex: searchEmailTerm, $options: "i"}})
    if (searchLoginTerm) searchParams.push({login: {$regex: searchLoginTerm, $options: "i"}})

    let filter: { $or?: any[] } = {$or: searchParams}
    if (searchParams.length === 0) filter = {}


    const pageSize = paginationCriteria.pageSize;
    // row SQL query to count docs
    const totalCount = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."UserTable"
    WHERE "email" LIKE $1 OR "login" LIKE $2;
    `, [searchEmailTerm, searchLoginTerm])

    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);


    const result = await this.dataSource.query(`
    SELECT * FROM public."UserTable"
    WHERE "email" LIKE $1 OR "login" LIKE $2
    ORDER BY $3 $4 
    LIMIT $6 OFFSET $5;
    `, [searchEmailTerm, searchLoginTerm, sortBy, sortDirection, ToSkip, pageSize])

    console.log(result)
    const items = result.map((item) => {
      return this.common.SQLUsermapping(item)
    })


    console.log(
        {
          pageSize: pageSize,
          totalCount: totalCount,
          pagesCount: pagesCount,
          page: page,
          items: items,
        },
        'its fucking result',
    );
    return {
      pageSize: pageSize,
      totalCount: totalCount,
      pagesCount: pagesCount,
      page: page,
      items: items,
    };
  }

  async createUser(DTO: any) {

    const userToCreate = User.createAsAdmin(DTO)

    const result = await this.usersTypeORMRepository.save(userToCreate)

    return {
      id: result.id,
      login : userToCreate.login,
      email : userToCreate.email,
      createdAt: userToCreate.createdAt,
      banInfo: {
        banDate: null,
        banReason: null,
        isBanned: false,
      }
    }
  }



  async deleteUserById(id: string) {

    const foundUserQuery = await this.usersTypeORMRepository
        .findOneBy({
          id
        })

    if(!foundUserQuery){
      return null
    }

    const deletedUser = await this.usersTypeORMRepository
        .delete({
          id
        })
    return true

  }

  async findUserByLoginOrEmail(loginOrEmail: string, pass : string) {
    //const filter = {$or :[{login : loginOrEmail}, {email : loginOrEmail}]}
    //QUERY
      console.log(loginOrEmail, " loginOrEmail")
    const result = await this.dataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .where("login = :loginOrEmail", { loginOrEmail: loginOrEmail })
        .orWhere('email = :loginOrEmail', { loginOrEmail: loginOrEmail })
        .getOne()
    const allUser = await this.dataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .getMany()
    console.log(result , " result in findUserByLoginOrEmail")
    console.log(allUser , " allUser in findUserByLoginOrEmail")
    if (!result) {
      return null
    }
    return this.common.SQLUserWithPasswordMapping(result)
  }
  async createUnconfirmedUser(login: string, password: string, email: string) {

    const code = this.common.createEmailSendCode()
    const newUnconfirmedUser = User.createUnconfirmedUser(login, password, email, code)

    const newlyCreatedUserQuery = await this.usersTypeORMRepository.save(newUnconfirmedUser)
    return  newlyCreatedUserQuery

  }

  async findUserByEmail(email: string) {
    /*const filter = { email: email }
    return  this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)*/

    console.log(email, "email in findUserByEmail");
    if(!email){
      return null
    }
    const result = await this.usersTypeORMRepository.findOneBy({email})
    return  result
  }

  async changeUsersConfirmationCode(id: string, confirmationCode: string) {
    const newCodeDateOfExpiary = addMinutes(new Date(), 30).getDate().toString()
    /*await  this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)*/

    await this.usersTypeORMRepository
        .update({id},
            {code : confirmationCode,
                        codeDateOfExpiary : newCodeDateOfExpiary
            })
  }

    async findUserByRegistrationCode(code: string) {
        console.log(code, " code in findUserByRegistrationCode")
        if (!code) {
            return null
        }
        const foundUser = await this.usersTypeORMRepository
            .findOneBy({code})
        return foundUser
    }

  async findUserCodeFreshness(foundUser: User) {
    return new Date().toISOString() < foundUser.codeDateOfExpiary!
  }

  async makeUserConfirmed(foundUser: User) {
      await this.usersTypeORMRepository
          .update({id: foundUser.id},
              {
                  code: null,
                  codeDateOfExpiary: null,
                  isConfirmed: true
              })
  }

  async findUserByLogin(login: string) {
    console.log(login, "login in findUserById");
    if(!login){
      return null
    }
    /*const [result] = await this.dataSource.query(`
    SELECT *  FROM public."UserTable"
    WHERE "login" = $1
    `, [login] )
    console.log(result, "result findUserById findUserById");*/

    const result = await this.usersTypeORMRepository.findOneBy({
      login
    })
    return result
  }

  async findUserById(userId: string) {

    /*const [result] = await this.dataSource.query(`
    SELECT *  FROM public."UserTable"
    WHERE "id" = $1
    `, [userId] )*/

    const result = await this.usersTypeORMRepository.findOneBy({
      id : userId
    })

    return result
  }

  async banUnbanUserDB(userId: string, DTO: BanUserDTO) {
    const isBanned = DTO.isBanned

      const banDate = new Date()
      const banReason = DTO.banReason




  }

  async banUserDB(userId: string, DTO: BanUserDTO) {
    const isBanned = DTO.isBanned
    const banDate = new Date().toISOString()
    const banReason = DTO.banReason
   /* return this.dataSource.query(`UPDATE public."UserTable"
    SET  "banDate"=$2, "banReason"=$3, "isBanned"=$4
        WHERE id = $1;
    `, [userId, banDate, banReason, true])*/

    return await this.usersTypeORMRepository
        .update({id : userId},
            {
              banDate : banDate,
              banReason : banReason,
              isBanned : isBanned
            })
  }

  async unbanUserDB(userId: string, DTO: BanUserDTO) {
  const isBanned = DTO.isBanned
  const banDate = new Date().toISOString()
  const banReason = DTO.banReason
    /*return await this.dataSource.query(`UPDATE public."UserTable"
    SET  "banDate"=$2, "banReason"=$3, "isBanned"=$4
        WHERE id = $1;
    `,[userId, null, null,false])*/

    return await this.usersTypeORMRepository
        .update({id : userId},
            {
              banDate : null,
              banReason : null,
              isBanned : false
            })
  }


  async getAllUsersSA(paginationCriteria: paginationCriteriaType) {
    const searchBanTerm = paginationCriteria.banStatus
    const searchLoginTerm = paginationCriteria.searchLoginTerm ? `%${paginationCriteria.searchLoginTerm}%` : '%%'
    const searchEmailTerm = paginationCriteria.searchEmailTerm ? `%${paginationCriteria.searchEmailTerm}%` : '%%'
    console.log(searchBanTerm, "searchBanTerm in getAllUsersSA")
    console.log(searchLoginTerm, "searchLoginTerm in getAllUsersSA")
    console.log(searchEmailTerm, "searchEmailTerm in getAllUsersSA")


    /*let banQuery = ``
    if(searchBanTerm === 'banned'){
      banQuery = `AND "isBanned" = TRUE`
    }else if(searchBanTerm === 'notBanned'){
      banQuery = `AND "isBanned" = FALSE`
    }*/
    /*const query = `
    SELECT CAST(COUNT(*) AS INTEGER) FROM public."UserTable"
    WHERE 
         ("login" ILIKE $1 
    OR
        "email" ILIKE $2)
    `*/
    const where: any = [ //ask question about and && or
          { login: ILike(searchLoginTerm)},
          { email: ILike(searchEmailTerm)}
        ]


    if(searchBanTerm === 'banned'){
      where[0].isBanned = true
      where[1].isBanned = true
    }else if(searchBanTerm === 'notBanned'){

      where[0].isBanned = false
      where[1].isBanned = false
    }

  const resultCountQuery = await this.usersTypeORMRepository
      .count({
        where : where
      })
const sqlcount = this.usersTypeORMRepository
    .count({
      where : where
    })
    console.log(resultCountQuery, 'resultQuery')
    const pageSize = paginationCriteria.pageSize;
    const totalCount = resultCountQuery
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;

    const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);



    console.log(sortBy, ' sortBy')
    console.log([sortBy, searchLoginTerm, searchEmailTerm,  pageSize, ToSkip ])
    const resultFoundQuery = await this.usersTypeORMRepository
        .find({
          where : where,
          skip: ToSkip,
          take: pageSize,
          order : {
            [sortBy] : sortDirection.toUpperCase()
          }
        })

       console.log(resultFoundQuery, " SQL_RESULT")
       const items = resultFoundQuery.map((item) => {
         return this.common.SQLUsermapping(item)
       })


    console.log(
      {
        pageSize: pageSize,
        totalCount: totalCount,
        pagesCount: pagesCount,
        page: page,
        items: items,
      },
      'its fucking result',
    );
    return {
      pageSize: pageSize,
      totalCount: totalCount,
      pagesCount: pagesCount,
      page: page,
      items: items,
    };

  }

    async getAllUsersFromDBWithoutPagination() {
        return await this.usersTypeORMRepository.find()
    }
}
