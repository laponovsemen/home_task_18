import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { Request, Response } from "express";
import { SecurityDevicesRepository } from "./security.devices.repository";
import { SecurityDevicesService } from "./security.devices.service";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard, RefreshTokenAuthGuard } from "../auth/auth.guard";
import { ObjectId } from "mongodb";
import { AuthService } from "../auth/auth.service";
import { SkipThrottle } from "@nestjs/throttler";
import {APISession} from "../entities/api-session-entity";
import {User} from "../entities/user-entity";

@Controller("security/devices")
export class SecurityDevicesController{
  constructor(protected readonly securityDevicesService : SecurityDevicesService,
              protected readonly securityDevicesRepository : SecurityDevicesRepository,
              protected readonly authService : AuthService,
              protected readonly jwtService : JwtService) {
  }
  @SkipThrottle()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllDevicesForCurrentUser(@Req() req: Request,
                                    @Res({ passthrough: true }) res: Response,
                                    @Query() QueryParams,) {
    const refreshToken = req.cookies.refreshToken

    const result = await this.securityDevicesService.getAllDevicesForCurrentUser(refreshToken)
    if (!result) {
      throw new UnauthorizedException()
    }
    return result
  }

  @SkipThrottle()
  @UseGuards(RefreshTokenAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllOtherDevices (@Req() req: Request,
                          @Res({ passthrough: true }) res: Response){

    const refreshToken : string = req.cookies.refreshToken
    console.log(refreshToken, " refreshToken in deleteAllOtherDevices")
    const refreshTokenPayload: any = this.jwtService.decode(refreshToken)
    console.log(refreshTokenPayload, "  refreshTokenPayload in deleteAllOtherDevices")
    const deviceIdFromRefreshToken : string = refreshTokenPayload!.deviceId
    console.log(deviceIdFromRefreshToken, " deviceIdFromRefreshToken in deleteAllOtherDevices")
    const userIdFromRefreshToken : string = refreshTokenPayload!.userId
    await this.securityDevicesRepository.deleteAllDevicesExcludeCurrentDB(userIdFromRefreshToken, deviceIdFromRefreshToken)
    return
  }
  @SkipThrottle()
  @Delete(":deviceId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById (@Req() req: Request,
                          @Res({ passthrough: true }) res: Response,
                          @Param("deviceId") deviceId : string){
    console.log(" start deleteDeviceById procedure")
    if (!deviceId){
      console.log("device not found from param")
      throw new NotFoundException()
    }
    const foundDevice : APISession = await this.securityDevicesRepository.findDeviceByIdWithUser(deviceId)
    if (!foundDevice) {
      console.log(foundDevice, " found device not found")
      throw new NotFoundException();
    }
    console.log("device found")
    const userFromToken : User  = await this.authService.getUserByRefreshToken(req.cookies.refreshToken)
    if (!userFromToken) {
      console.log(userFromToken, " userFromToken is not found in db")
      throw new UnauthorizedException()
    }

    if (!foundDevice.user || foundDevice.user.id.toString() !== userFromToken!.id.toString()) {
      console.log(foundDevice, " foundDevice")
      console.log(foundDevice.user, " foundDevice.user" )
      console.log(foundDevice.user.id.toString(), " foundDevice.user.id.toString()" )
      console.log(userFromToken!.id.toString(), " userFromToken!.id.toString()" )


      throw new ForbiddenException();
    }

    //const userIdFromDb =
    return await this.securityDevicesRepository.deleteDeviceById(deviceId)
  }
}