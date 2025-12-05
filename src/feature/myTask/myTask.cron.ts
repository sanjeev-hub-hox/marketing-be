import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { LoggerService } from '../../utils';
import { MyTaskRepository } from './myTask.repository';

@Injectable()
export class MyTaskCron {
  constructor(
    private myTaskRepository: MyTaskRepository,
    private loggerService: LoggerService,
  ) {}

  // NOTE : Run this cron every day at EOD 11:50 PM
  @Cron('50 23 * * *', {
    name: 'createNewTaskOnTatExceededCron',
    timeZone: 'Asia/Kolkata',
  })
  async createNewTaskOnTatExceeded() {
    this.loggerService.log(
      `[CRON] Executing createNewTaskOnTatExceeded cron at ${new Date()}`,
    );
    const todayStartOfDay = new Date().setHours(0, 0, 0, 1);
    const todayEndOfDay = new Date().setHours(23, 59, 59, 999);
    const tatExceededTasks = await this.myTaskRepository.aggregate([
      {
        $match: {
          valid_till: {
            $gte: new Date(todayStartOfDay),
            $lte: new Date(todayEndOfDay),
          },
          task_creation_count: { $lte: 3 },
          is_closed: false,
        },
      },
    ]);

    if (!tatExceededTasks.length) {
      this.loggerService.log(
        `[CRON] Terminating createNewTaskOnTatExceeded execution as no TAT exceeded tasks found for today`,
      );
      return;
    }

    const updateTatExceededTaskPromises = [];

    const tPlusFiveDate = new Date();
    tPlusFiveDate.setDate(new Date().getDate() + 5);
    tPlusFiveDate.setHours(23, 59, 59, 999);

    for (const task of tatExceededTasks) {
      //TODO: for every TAT exceeded tasks trigger a workflow to escalate
      if (task.task_creation_count === 3) {
        updateTatExceededTaskPromises.push(
          this.myTaskRepository.updateById(task._id, {
            is_closed: true,
          }),
        );
      } else {
        updateTatExceededTaskPromises.push(
          this.myTaskRepository.updateById(task._id, {
            valid_from: new Date(),
            valid_till: tPlusFiveDate,
            task_creation_count: task.task_creation_count + 1,
          }),
        );
      }
    }

    try {
      await Promise.all(updateTatExceededTaskPromises);
    } catch (err) {
      // Rollback logic
      return;
    }
    this.loggerService.log(
      `[CRON] Terminating createNewTaskOnTatExceeded execution as TAT exceeded tasks processed successfully`,
    );
  }
}
