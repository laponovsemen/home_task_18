import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import path from "node:path";

@Injectable()
export class GoogleStorageService {
  private readonly bucketName = 'laponov_semen_bucket'; // Замените на имя вашего бакета Google Cloud Storage
  private storage;

  constructor() {
    console.log(__dirname , " dirname");
    this.storage = new Storage({
      keyFilename: path.join(__dirname, '..', '..', '..', 'serviceAccountKey.json'), // Путь к вашему служебному ключу
      projectId: 'practical-mason-393920', // Замените на идентификатор вашего проекта Google Cloud
    });
  }

  async uploadFile(fileType : string, file: Buffer, fileName: string): Promise<string> {
    console.log("upload file");
    const bucket = this.storage.bucket(this.bucketName);
    //console.log(bucket, " bucket");
    const blob = bucket.file(fileName);
    //console.log(blob, " blob");

    const stream = blob.createWriteStream({
      metadata: {
        contentType: fileType,
      },
    });
    //console.log(stream, "stream");
    console.log(file, "buffer");
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => reject(error));
      stream.on('finish', () => resolve(fileName));
      stream.end(file);
    });
  }

  async getPublicUrl(fileName: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(fileName);

    const [metadata] = await blob.getMetadata();
    return metadata.mediaLink;
  }
}


