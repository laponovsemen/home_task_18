import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { SecurityDevicesRepository } from "./security.devices.repository";
import {APISession} from "../entities/api-session-entity";

@Injectable()
export class SecurityDevicesService{
  constructor(protected readonly authService : AuthService,
              protected readonly securityDevicesRepository : SecurityDevicesRepository,

              ) {
  }

  async getAllDevicesForCurrentUser(refreshToken: string) {
    const refreshTokenVerification = await this.authService.verifyRefreshToken(refreshToken)
    if (!refreshTokenVerification) {
      return null
    }
    const userId : string = refreshTokenVerification.userId
    const result = await this.securityDevicesRepository.getAllDevicesForCurrentUser(userId)
    const listOfDevices = result.map(device => {return APISession.getViewModel(device)})
    return listOfDevices
  }
}