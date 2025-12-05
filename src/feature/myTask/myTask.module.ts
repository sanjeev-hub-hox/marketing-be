import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GlobalModule } from '../../global/global.module';
import { EnquiryModule } from '../enquiry/enquiry.module';
import { MyTaskController } from './myTask.controller';
import { MyTaskRepository } from './myTask.repository';
import { myTaskSchema } from './myTask.schema';
import { MyTaskService } from './myTask.service';
import { MyTaskCron } from './myTask.cron';

@Module({
  imports: [
    GlobalModule,
    MongooseModule.forFeature([{ name: 'myTask', schema: myTaskSchema }]),
    forwardRef(() => EnquiryModule),
  ],
  controllers: [MyTaskController],
  providers: [MyTaskService, MyTaskRepository, MyTaskCron],
  exports: [MyTaskService, MyTaskRepository, MyTaskCron],
})
export class MyTaskModule {}
