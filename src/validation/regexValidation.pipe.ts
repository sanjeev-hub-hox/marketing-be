import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RegexValidationPipe implements PipeTransform<string> {
  private configService: ConfigService;
  
  constructor(private readonly regex: RegExp) {
    this.configService = new ConfigService();
  }

  transform(value: string, metadata: ArgumentMetadata): string {
    // Skip validation if DISABLE_VALIDATION is true
    const validationDisabled = this.configService.get<string>('DISABLE_VALIDATION') === 'true';
    
    if (validationDisabled) {
      return value;
    }

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