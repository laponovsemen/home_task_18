import { Controller, Get, Post, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import  fs from 'node:fs'
import  path, {dirname} from 'node:path'
import { FileInterceptor } from "@nestjs/platform-express";
import { fileExistsSync } from "tsconfig-paths/lib/filesystem";
import { CommandBus } from "@nestjs/cqrs";
import { SaveAvatarToFSCommand } from "../utils/use-cases/save-avatar-to-file-system.use-case";
import { FileSystemAdapter } from "../utils/fs-utils";

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
  async updateAvatarPage(@UploadedFile() avatar : Express.Multer.File) {
    console.log(avatar);
    const userId = '10'
    await this.commandBus.execute(new SaveAvatarToFSCommand(userId, avatar.originalname, avatar.buffer))

    return 'avatar saved'
  }
}
