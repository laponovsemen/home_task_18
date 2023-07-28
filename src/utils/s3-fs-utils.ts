/*
import { Readable } from 'stream';

import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SETTINGS } from '../../utils/settings';
import { GetFileDto } from './dto/get.file.dto';
import { UploadFileDto } from './dto/upload.file.dto';

const { POST_MAIN_IMAGES_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_KEY } = SETTINGS;

@Injectable()
export class AwsS3BucketService implements OnModuleInit {
  private bucketName: string;
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get(POST_MAIN_IMAGES_BUCKET);
    this.s3Client = new S3Client({
      region: 'eu-north-1',
      credentials: {
        accessKeyId: this.configService.get(AWS_ACCESS_KEY_ID),
        secretAccessKey: this.configService.get(AWS_SECRET_KEY),
      },
    });
  }

  async getFiles(Bucket: string, Prefix: string): Promise<GetFileDto[]> {
    const command = new ListObjectsCommand({ Bucket, Prefix });

    try {
      const response = await this.s3Client.send(command);

      if (!response.Contents) return [];

      return Promise.all(
        response.Contents.map(async f => {
          const Key = f.Key;
          console.log(1);

          const getObjectCommand = new GetObjectCommand({ Bucket, Key });
          console.log(2);

          const signedUrl = await getSignedUrl(this.s3Client, getObjectCommand);
          console.log(3);

          const fileData = await this.s3Client.send(getObjectCommand);
          console.log(4);

          const fileBuffer = await this._getFileBuffer(fileData.Body);
          console.log(5);

          return {
            path: signedUrl.split('?')[0],
            size: f.Size,
            buffer: fileBuffer,
          };
        }),
      );
    } catch (err) {
      console.error('ERROR READ FILE', err);
    }
  }

  async uploadFile(dto: UploadFileDto) {
    const { Bucket, Key, Body } = dto;

    const command = new PutObjectCommand({ Bucket, Key, Body });

    try {
      await this.s3Client.send(command);
    } catch (err) {
      console.error('ERROR UPLOAD FILE', err);
    }
  }

  async onModuleInit() {
    try {
      // Check if the bucket already exists
      const headBucketCommand = new HeadBucketCommand({
        Bucket: this.bucketName,
      });

      await this.s3Client.send(headBucketCommand);

      console.log('Bucket already exists:', this.bucketName);
    } catch (err) {
      console.log('ERROR Bucket', err);

      // If HEAD request fails, it means the bucket does not exist
      if (err.$metadata.httpStatusCode === 404) {
        // Create a new bucket
        const createBucketCommand = new CreateBucketCommand({
          Bucket: this.bucketName,
        });
        await this.s3Client.send(createBucketCommand);

        console.log('Bucket created successfully:', this.bucketName);
      }
    }
  }

  private async _getFileBuffer(
    response: Readable | ReadableStream<any> | Blob,
  ): Promise<Buffer> {
    if (response instanceof Readable) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of response) {
        chunks.push(chunk);
      }

      const fileBuffer = Buffer.concat(chunks);
      return fileBuffer;
    } else {
      throw new Error('Response body is not a readable stream');
    }
  }
}*/
