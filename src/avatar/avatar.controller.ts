import { Controller, Get, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import path, { dirname } from "node:path";
import { CommandBus } from "@nestjs/cqrs";
import { SaveAvatarToFSCommand } from "../utils/use-cases/save-avatar-to-file-system.use-case";
import { FileSystemAdapter } from "../utils/fs-utils";
import { Express } from "express";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('/avatar')
export class AvatarController {
  constructor(protected commandBus : CommandBus,
              protected fileSystemAdapter : FileSystemAdapter) {}

  @Get('change-avatar-page')
  async changeAvatarPage() {
    console.log(__dirname);
    console.log(process.env.NODE_PATH);
    console.log(dirname(require.main.filename));
    const htmlContent = await this.fileSystemAdapter.readTextFileAsync(
      path.join('views', 'avatars', 'change-page.html')
    )
    return htmlContent
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatarPage(@UploadedFile() avatar: Express.Multer.File & {buffer: any}) {

     const userId = '10'
     await this.commandBus.execute(new SaveAvatarToFSCommand(userId, avatar.originalname, avatar.mimetype, avatar.buffer))

    return 'avatar saved'
  }
}
