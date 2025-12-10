import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus
} from '@nestjs/common';

@Injectable()
export class RegexValidationPipe implements PipeTransform<string> {
  constructor(private readonly regex: RegExp) {}

  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value.match(this.regex)) {
      throw new HttpException('Validation error', HttpStatus.BAD_REQUEST, {
        cause: [
          {
            field: metadata.data,
            message: `Invalid ${metadata.data} value`
          }
        ]
      });
    }
    return value;
  }
}
