import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import path from "node:path";
import { FileSystemAdapter } from "../fs-utils";


export class SaveAvatarToFSCommand{
  constructor(public userId : string,
              public originalName : string,
              public buffer : Buffer,
  ) {
  }
}
@CommandHandler(SaveAvatarToFSCommand)
export class SaveAvatarToFSUseCase implements ICommandHandler<SaveAvatarToFSCommand> {
  constructor(
    protected fileSystemAdapter : FileSystemAdapter
  ) {

  }

  async execute(command: SaveAvatarToFSCommand) {
    const dirPath = path.join('./', 'content','users', command.userId, 'avatars', 'change-page.html')

    this.fileSystemAdapter.ensureDirSync(dirPath)
    console.log('dirPath ensured');
    await this.fileSystemAdapter.saveFileAsync(
      path.join(dirPath, command.originalName),
      command.buffer
    )
  }
}