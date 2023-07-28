/*
import { Injectable, OnModuleInit } from "@nestjs/common";
import { googleCloudKeys } from "./google-cloud-keys-file";
import { Storage } from "@google-cloud/storage";


@Injectable()
export class S3GoogleCloudUtils {

  constructor(
    protected storage : Storage
  ) {}



    async saveFileAsync(destFileName : string) {

      // Creates a client
      const storage = new Storage({

      });
      const filePath = './local/path/to'
      const generationMatchPrecondition = 0
      const options = {
        destination: destFileName,
        // Optional:
        // Set a generation-match precondition to avoid potential race conditions
        // and data corruptions. The request to upload is aborted if the object's
        // generation number does not match your precondition. For a destination
        // object that does not yet exist, set the ifGenerationMatch precondition to 0
        // If the destination object already exists in your bucket, set instead a
        // generation-match precondition using its generation number.
        preconditionOpts: { ifGenerationMatch: generationMatchPrecondition },
      };
      const bucketName = googleCloudKeys.bucketName
      await storage.bucket(bucketName).upload(filePath, options);
      console.log(`${filePath} uploaded to ${bucketName}`);
    }

  readTextFileAsync
}*/
