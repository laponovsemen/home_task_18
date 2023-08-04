import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";

@Injectable()
export class TelegramAdapter{
  private axiosInstance : AxiosInstance
  constructor() {
    const telegramPassword = `6684563535:AAG4lGlxNyyIWnrc3sLTMs4xDXoUmyGqrvA`;
    this.axiosInstance = axios.create({baseURL: `https://api.telegram.org/bot${telegramPassword}/`})
  }
   async  sendMessage(text: string, recipientId: number) {
    const queryMethod = "sendMessage";
    console.log(text, " text");
    console.log(recipientId, " recipientId");
    try {
      await this.axiosInstance.post(queryMethod, {
        chat_id : recipientId,
        text
      });
    } catch (e) {
      console.log(e, " error");
    }

  }

  async sendOurHookToTelegram(url: string) {
    const queryMethod = "setWebhook";
    await this.axiosInstance.post(queryMethod, {
      url: url
    });
  }
}