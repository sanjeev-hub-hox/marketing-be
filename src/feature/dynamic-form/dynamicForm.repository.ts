import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { DynamicFormModel } from './dynamicForm.schema';

@Injectable()
export class DynamicFormRepository {
  constructor(
    @InjectModel('dynamicFormField')
    private dynamicFormFieldModel: DynamicFormModel,
  ) {}

  aggregate(pipeline: any[]) {
    return this.dynamicFormFieldModel.aggregate(pipeline);
  }
}
