import { Body, Controller, Get, HttpCode, Post, Query } from "@nestjs/common";
import { BlogsService } from "../blogs/blogs.service";
import { Common } from "../common";
import { paginationCriteriaType, PaginatorViewModelType } from "../appTypes";
import axios from "axios";
import * as url from "url";
import { TelegramAdapter } from "../utils/telegram.adapter/telegram.adapter";


@Controller('/telegram')
export class TelegramController {
  constructor(
    private readonly common: Common,
    private readonly telegramAdapter: TelegramAdapter,
  ) {
  }


  @Post('/notifications/hook')
  @HttpCode(200)
  async forTelegram(
    @Body() payload : TelegramUpdateMessage,
  ): Promise<any> {
    console.log(payload, " payload");
    await this.telegramAdapter.sendMessage(`i know you ${payload.message.from.first_name + 
    " " + payload.message.from.last_name} зачем ты мне написал : ${payload.message.text} ?`,
      payload.message.from.id)
    return { status : true }
  }
}


export type TelegramUpdateMessage = {
  message : {
    from : {
      id : number,
      first_name : string,
      last_name : string
    },
    text : string
  }
}