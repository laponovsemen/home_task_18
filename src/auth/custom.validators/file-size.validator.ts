// file.validator.ts

import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class FileValidator {
  async validate(file: Express.Multer.File, options: { width?: number; height?: number; type?: string[]; fileSize?: number }) {
    const { width, height, type, fileSize } = options;
    if (!width && !height && !type && !fileSize) {
      return true; // Skip validation if no constraints are provided
    }

    try {
      console.log(22787982749023740);
      const imageInfo = await sharp(file.buffer).metadata();

      console.log("1");
      if (width && imageInfo.width !== width) {
        return { valid: false, error: [`Image width should not exceed ${width}px.`] };
      }
      console.log("2");
      if (height && imageInfo.height !== height) {
        return { valid: false, error: [`Image height should not exceed ${height}px.`] };
      }
      console.log("3");
      if (type && !type.find(item => item == imageInfo.format)) {
        console.log(type, "type");
        console.log(type.find(item => item == imageInfo.format), "type2");
        console.log(imageInfo.format, "imageInfo.format");
        return { valid: false, error: [`Invalid file type. Expected ${type}. recieved ${imageInfo.format}`] };
      }
      console.log("4");
      if (fileSize && file.size > fileSize) {
        return { valid: false, error: [`File size should not exceed ${fileSize} bytes.`] };
      }
      console.log("5");
      return { valid: true };
    } catch (err) {
      return { valid: false, error: ['Invalid image format.'] };
    }
  }

  defaultMessage(options: { width?: number; height?: number; type?: string[]; fileSize?: number }) {
    const { width, height, type, fileSize } = options;

    if (fileSize) {
      return `File size should not exceed ${fileSize} bytes.`;
    }

    const dimensions = [];
    if (width) {
      dimensions.push(`width ${width}px`);
    }

    if (height) {
      dimensions.push(`height ${height}px`);
    }

    if (type) {
      dimensions.push(`type ${type}`);
    }

    return `Image should not exceed ${dimensions.join(' and ')}.`;
  }
}