import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import path from "node:path";
import { FileSystemAdapter } from "../fs-utils";
import { GoogleStorageService } from "../google-storage-adapter/google.storage.service";


export class SaveAvatarToFSCommand{
  constructor(public userId : string,
              public originalName : string,
              public fileType : string,
              public buffer : Buffer,
  ) {
  }
}
@CommandHandler(SaveAvatarToFSCommand)
export class SaveAvatarToFSUseCase implements ICommandHandler<SaveAvatarToFSCommand> {
  constructor(
    protected storage : GoogleStorageService
  ) {

  }

  async execute(command: SaveAvatarToFSCommand) {
    const dirPath = path.join("images")

    console.log('dirPath ensured');
    await this.storage.uploadFile(
      command.fileType,
      command.buffer,
      [dirPath, command.originalName.split(".")[0]].join("/")
    )
  }
}