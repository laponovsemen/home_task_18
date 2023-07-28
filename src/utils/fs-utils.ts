import fs from "node:fs";
import { dirname } from "node:path";
import * as path from "path";
/*
 *@param relativePath (relative path of working app)
 */

export class FileSystemAdapter {
   readTextFileAsync = async (relativePath: string) : Promise<any> => {
    return new Promise((resolve, reject) => {
      const rootDirPath = dirname(require.main.filename)
      const filePath = path.join(rootDirPath, relativePath)
      fs.readFile(filePath,
        { encoding: 'utf-8' },
        (error, content) => {
          if (error) {
            console.error(error, "error");
            reject(error);
          }
          resolve(content)
        })
    })
  }


  saveFileAsync = async (relativePath: string, data: Buffer) : Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const rootDirPath = dirname(require.main.filename)
      const filePath = path.join(rootDirPath, relativePath)
      fs.writeFile(filePath,
        data,
        (error) => {
          if (error) {
            console.error(error, "error");
            reject(error);
          }
          resolve()
        })
    })
  }

  ensureDirSync = (relativeDirPath: string): void => {

    const rootDirPath = dirname(require.main.filename)
    const dirPath = path.join(rootDirPath, relativeDirPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}

