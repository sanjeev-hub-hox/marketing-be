import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ResponseService } from '../../utils';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSchema } from './auth.schema';
import { ZodValidationPipe } from '../../validation/zodValidation.pipe';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'auth', schema: AuthSchema }])],
  providers: [AuthService, ResponseService, ZodValidationPipe],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
