import { Injectable } from "@nestjs/common";
import { InjectModel, Prop } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CommentsDocument, User, UsersDocument } from "../mongo/mongooseSchemas";
import { Common } from "../common";
import { paginationCriteriaType } from "../appTypes";
import add from 'date-fns/add'
import { ObjectId } from "mongodb";
import { addMinutes } from "date-fns";
import { SkipThrottle } from "@nestjs/throttler";
import { BanUserDTO } from "../input.classes";
import {DataSource} from "typeorm";

@SkipThrottle()
@Injectable()
export class UsersRepository {
  constructor(protected readonly dataSource: DataSource,
              protected readonly common: Common) {

  };

  async deleteAllData() {
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
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
    const dateOfCreation = new Date()
    const login = DTO.login
    const password = DTO.password
    const email = DTO.email
    const createdAt = dateOfCreation
    await this.dataSource.query(`
        INSERT INTO public."UserTable"(
         "login", "email", "password", "createdAt", "isConfirmed", "code", "codeDateOfExpiary", "banDate", "banReason", "isBanned")
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      
    `, [login, email, password, createdAt, true, null, null, null, null, false])
    const newlyCreatedUser: User = await this.dataSource.query(`
        SELECT * FROM public."UserTable"
        WHERE "login" = $1 AND "email" = $2 AND "password" = $3;
      
    `, [login, email, password])
        console.log(newlyCreatedUser)

    return {
      id: newlyCreatedUser[0].id.toString(),
      login,
      email,
      createdAt,
      banInfo: {
        banDate: null,
        banReason: null,
        isBanned: false,
      }
    }
  }



  async deleteUserById(id: string) {

    const deletedUser = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE public."UserTable"."id" = $1;
    `, [id])
    return deletedUser.deletedCount === 1
  }

  async findUserByLoginOrEmail(loginOrEmail: string, pass : string) {
    const filter = {$or :[{login : loginOrEmail}, {email : loginOrEmail}]}
    //QUERY
    const queryResult = await this.dataSource.query(`
    SELECT * FROM public."UserTable"
    WHERE public."UserTable".login = $1 OR public."UserTable".email = $1;
    ;`, [loginOrEmail])
    const result = queryResult[0]

    console.log(result , " result in findUserByLoginOrEmail")
    return this.common.SQLUsermapping(result)
  }
  async createUnconfirmedUser(login: string, password: string, email: string) {
    const dateOfCreation = new Date()
    const codeDateOfExpiary = add(dateOfCreation, {minutes: 10})
    const codeToSend = this.common.createEmailSendCode()
    const newUnconfirmedUser: User = {
      createdAt: dateOfCreation,
      email: email,
      login: login,
      password: password,
      isConfirmed: false,
      code: codeToSend,
      codeDateOfExpiary: codeDateOfExpiary,
      banDate: null,
      banReason: null,
      isBanned: false
    }
    const newlyCreatedUser = await await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    return {
      id : newlyCreatedUser._id,
      createdAt: dateOfCreation,
      email: email,
      login: login,
      code: codeToSend,

    }

  }

  async findUserByEmail(email: string) {
    const filter = { email: email }
    return  this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async changeUsersConfirmationCode(_id: ObjectId, confirmationCode: string) {
    const newCodeDateOfExpiary = addMinutes(new Date(), 30)
    await await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async findUserByRegistrationCode(code: string) {
    const foundUser =  await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    return foundUser
  }

  async findUserCodeFreshness(foundUser: User) {
    return new Date() < foundUser.codeDateOfExpiary!
  }

  async makeUserConfirmed(foundUser: User) {
    await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async findUserByLogin(login: string) {
    return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async findUserById(userId: string) {
    console.log(userId, "userId in findUserById");
    const result = await await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
    console.log(result, "result findUserById findUserById");
    return result
  }

  async banUnbanUserDB(userId: string, DTO: BanUserDTO) {
    const isBanned = DTO.isBanned

      const banDate = new Date()
      const banReason = DTO.banReason




  }

  async banUserDB(userId: string, DTO: BanUserDTO) {
    const isBanned = DTO.isBanned
    const banDate = new Date()
    const banReason = DTO.banReason
    return  this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async unbanUserDB(userId: string, DTO: BanUserDTO) {
  const isBanned = DTO.isBanned
  const banDate = new Date()
  const banReason = DTO.banReason
    return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }


  async getAllUsersSA(paginationCriteria: paginationCriteriaType) {
    const banStatus = paginationCriteria.banStatus
    const searchLoginTerm = paginationCriteria.searchLoginTerm ?? '%'
    const searchEmailTerm = paginationCriteria.searchEmailTerm ?? '%'
    const searchBanTerm = banStatus === "banned" ? true : false
            //banStatus === "notBanned"
            //? false : `true OR public."UserTable"."isBanned" = false`




    const pageSize = paginationCriteria.pageSize;
    const totalCountQuery = await this.dataSource.query(`
    SELECT COUNT(*) FROM public."UserTable"
    WHERE 
         public."UserTable"."login" LIKE $1 
    AND
        public."UserTable"."email" LIKE $2 
     AND 
        if $3 = 'banned' then
            public."UserTable"."isBanned" = false;
        elsif $3 = 'notBanned' then
            public."UserTable"."isBanned" = true;
        end if;
    
    ;
    `,[searchLoginTerm, searchEmailTerm,searchBanTerm,])
    const totalCount = parseInt(totalCountQuery[0].count)
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);


    const result = await this.dataSource.query(`
    SELECT * FROM public."UserTable"
    WHERE 
        public."UserTable"."login" LIKE $1 
    AND
        public."UserTable"."email" LIKE $2
    AND 
        if $3 = 'banned' then
            public."UserTable"."isBanned" = false;
        elsif $3 = 'notBanned' then
            public."UserTable"."isBanned" = true;
        end if;
    ORDER BY $4 $5
    LIMIT $6 OFFSET $7
    ;
    `, [searchLoginTerm, searchEmailTerm, searchBanTerm, sortBy, sortDirection, pageSize, ToSkip])
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
}
