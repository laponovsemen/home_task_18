import { Injectable, Session } from "@nestjs/common";
import { InjectModel, Prop } from "@nestjs/mongoose";

import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import {DataSource, Not, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../entities/user-entity";
import {APISession} from "../entities/api-session-entity";
import {isUUID} from "class-validator";

@Injectable()
export class SecurityDevicesRepository {
    constructor(protected readonly dataSource: DataSource,
                @InjectRepository(APISession) protected sessionsTypeORMRepository : Repository<APISession>,

                ) {

    }


  async createNewSession(user: any, ip: string, title: string,deviceId : string,  refreshToken : string) {

      const newSession = APISession.create({user, ip, title,deviceId, refreshToken})
      await this.sessionsTypeORMRepository.save(newSession)
      return newSession
  }

  async updateSessionByDeviceId(deviceId: string, lastActiveDate: string, newRefreshToken: string) {
    /*const updatedSession = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)*/

       await this.sessionsTypeORMRepository
          .update({id: deviceId},
              {
                  lastActiveDate: lastActiveDate,
                  refreshToken: newRefreshToken
              })
      return true
  }

  async deleteDeviceById(deviceId: string) {
      const deletedSession = await this.sessionsTypeORMRepository
          .delete({
              id : deviceId
          })
      return true
  }

  async getAllDevicesForCurrentUser(userId: string) {
      /*return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)*/

      return await this.sessionsTypeORMRepository
          .find({
              where: {
                  user : {
                      id : userId
                  }
              },


          })
  }

  async gedDeviceByDeviceId(deviceId: string) {
      /*return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)*/

      return await this.sessionsTypeORMRepository
          .findOneBy({
              id : deviceId
          })

  }

  async deleteAllDevicesExcludeCurrentDB(userIdFromRefreshToken: string, deviceIdFromRefreshToken: string) {
      /*return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)*/

      const deletedSessions = await this.sessionsTypeORMRepository
          .delete({
              id : Not(deviceIdFromRefreshToken),
              user : {
                  id : userIdFromRefreshToken
              }
          })
      return true

  }

  async findDeviceById(deviceId: string) {
    /*return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)*/

      if(!isUUID(deviceId)){
          return null
      }
      return await this.sessionsTypeORMRepository
          .findOneBy({
              id : deviceId
          })
  }

  async deleteAllData() {
      await this.sessionsTypeORMRepository.delete({})
  }

  async deleteAllSessionsForSpecifiedUser(userId: string) {
     await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

    async findDeviceByIdWithUser(deviceId: string) {
        if(!isUUID(deviceId)){
            return null
        }
        return await this.sessionsTypeORMRepository
            .findOne({
                where : {id : deviceId},
                relations : {user : true}
            })
    }
}