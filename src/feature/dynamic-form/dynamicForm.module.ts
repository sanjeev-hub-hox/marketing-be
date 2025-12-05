import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DynamicFormController } from './dynamicForm.controller';
import { DynamicFormRepository } from './dynamicForm.repository';
import { dynamicFormSchema } from './dynamicForm.schema';
import { DynamicFormService } from './dynamicForm.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'dynamicFormField', schema: dynamicFormSchema },
    ]),
  ],
  controllers: [DynamicFormController],
  providers: [DynamicFormService, DynamicFormRepository],
  exports: [DynamicFormService, DynamicFormRepository],
})
export class DynamicFormModule {}
