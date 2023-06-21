import { Injectable, Session } from "@nestjs/common";
import { InjectModel, Prop } from "@nestjs/mongoose";
import {
  APIComment,
  APIDeviceModel,
  APISession,
  CommentsDocument,
  DeviceModelSchema,
  SessionDocument
} from "../mongo/mongooseSchemas";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import {DataSource} from "typeorm";

@Injectable()
export class SecurityDevicesRepository {
    constructor(protected readonly dataSource: DataSource,

                ) {

    }


  async createNewSession(userId: string, ip: string, title: string, lastActiveDate: Date, deviceId : ObjectId, refreshToken : string) {
      const device = {
        ip:	ip, // IP address of device during signing in
        title:	title, // Device name: for example Chrome 105 (received by parsing http header "user-agent")
        lastActiveDate:	lastActiveDate.toISOString(), // Date of the last generating of refresh/access tokens
        deviceId:	deviceId, //  Id of connected device session
      }
    return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async updateSessionByDeviceId(deviceId: string, lastActiveDate: Date, newRefreshToken: string) {
    const updatedSession = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)

    return
  }

  async deleteDeviceById(deviceId: string) {
      const deletedSession = await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
      return deletedSession.deletedCount === 1
  }

  async getAllDevicesForCurrentUser(userId: string) {
      return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async gedDeviceByDeviceId(deviceId: string) {
      return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)

  }

  async deleteAllDevicesExcludeCurrentDB(userIdFromRefreshToken: ObjectId, deviceIdFromRefreshToken: string) {
      return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)

  }

  async findDeviceById(deviceId: string) {
    return await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }

  async deleteAllData() {
      await this.dataSource.query(`
    DELETE FROM public."APIDeviceModelTable"
    WHERE 1 = 1;
    `)
  }

  async deleteAllSessionsForSpecifiedUser(userId: string) {
     await this.dataSource.query(`
    DELETE FROM public."UserTable"
    WHERE 1 = 1;
    `)
  }
}