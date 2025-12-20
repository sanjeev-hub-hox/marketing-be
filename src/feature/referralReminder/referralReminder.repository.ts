import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SendReminderSchema, SendReminder } from './referralReminder.schema';

@Injectable()
export class ReminderRepository {
  constructor(
    @InjectModel('referralReminder')
    private readonly reminderModel: Model<SendReminder>,
  ) {}

  async create(data: Partial<SendReminder>): Promise<SendReminder> {
    const reminder = new this.reminderModel(data);
    return reminder.save();
  }

  // ✅ Better typed return
  async find(query: any): Promise<(SendReminder & { _id: Types.ObjectId })[]> {
    return this.reminderModel.find(query).exec() as any;
  }

  async findById(id: Types.ObjectId): Promise<SendReminder> {
    return this.reminderModel.findById(id).exec();
  }

  async updateById(id: Types.ObjectId, update: any): Promise<SendReminder> {
    return this.reminderModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
  }

  async deleteById(id: Types.ObjectId): Promise<void> {
    await this.reminderModel.findByIdAndDelete(id).exec();
  }

  
}