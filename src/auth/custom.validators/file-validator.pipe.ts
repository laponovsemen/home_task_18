// file-validator.pipe.ts


import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { FileValidator } from "./file-size.validator";

@Injectable()
export class FileValidatorPipe implements PipeTransform {
  constructor(private readonly options: { width?: number; height?: number; type?: string[]; fileSize?: number }) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<boolean> {
    if (!value) {
      throw new BadRequestException('File is missing.');
    }

    if (value instanceof Array) {
      // If the uploaded file field allows multiple files,
      // you may need to modify the validation logic accordingly.
      throw new BadRequestException('Only single file is allowed.');
    }

    const validator = new FileValidator();
    const result = await validator.validate(value, this.options);

    if (typeof result !== 'boolean' && !result.valid) {
      throw new BadRequestException(result.error || validator.defaultMessage(this.options));
    }

    return value;
  }
}