import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { PipelineStage, Types } from 'mongoose';

import {
  BookedSlotRepository,
  SlotMasterRepository,
  UnavailableSlotsRepository,
} from './repository';
import { TSlotMasterDocument } from './schema';
import { daysOfWeek } from './slot.constant';
import { ESlotType, EUnavailabilityOf } from './slot.type';

@Injectable()
export class SlotService {
  constructor(
    private slotMasterRepository: SlotMasterRepository,
    private bookedSlotRepository: BookedSlotRepository,
    private unavailableSlotRepository: UnavailableSlotsRepository,
  ) {}

  async getAvailableSlots(
    date: string,
    schoolId: number,
    slotFor: ESlotType,
  ): Promise<TSlotMasterDocument[]> {
    const [monthDate, month, year] = date.split('-');
    const day = daysOfWeek[new Date(`${month}-${monthDate}-${year}`).getDay()];
    const masterSlotsOfDay = await this.slotMasterRepository.getMany({
      slot_for: slotFor,
      day: day,
      school_id: schoolId,
      is_active: true,
      is_deleted: false,
    });

    const masterSlotIds = masterSlotsOfDay.map((slot) => slot._id);


    let updatedMasterSlotIds = masterSlotIds;


    const unavailableSlotPipeline: PipelineStage[] = [
      {
        $match: {
          $expr: {
            $eq: [
              {
                $dateToString: { format: '%d-%m-%Y', date: '$date' },
              },
              `${monthDate}-${month}-${year}`,
            ],
          },
          slot_for: slotFor,
          slot_id: { $in: updatedMasterSlotIds },
          unavailability_of: EUnavailabilityOf.PRINCIPAL,
        },
      },
    ];

    const unavailableSlots = await this.unavailableSlotRepository.aggregate(
      unavailableSlotPipeline,
    );

    if (unavailableSlots.length) {
      const unavailableSlotIds = unavailableSlots.map((slot) =>
        slot.slot_id.toString(),
      );
      updatedMasterSlotIds = updatedMasterSlotIds.filter((slot) => {
        return !unavailableSlotIds.includes(slot._id.toString());
      });
    }

    const filteredAvailableSlots = [];
    masterSlotsOfDay.forEach((slot) => {
      if (updatedMasterSlotIds.includes(slot._id)) {
        filteredAvailableSlots.push({
          _id: slot._id,
          slot_for: slot.slot_for,
          slot: slot.slot,
          day: slot.day,
          school_id: slot.school_id,
        });
      }
    });

    const localTime = moment().tz('Asia/Kolkata').format('hh:mm A');
    const currentDate = moment().tz('Asia/Kolkata').format('DD-MM-YYYY');
    if (date !== currentDate) {
      return this.sortSlots(filteredAvailableSlots);
    }
    const futureSlots = this.getFutureTimeSlots(
      localTime,
      filteredAvailableSlots,
    );
    return this.sortSlots(futureSlots);
  }

  async bookSlot(
    enquiryId: string,
    slotId: string,
    inputDate: string,
    slotFor: ESlotType,
  ): Promise<{
    _id: Types.ObjectId;
    slot_id: Types.ObjectId;
    slot_for: string;
    date: string;
    slot: string;
  }> {
    const [day, month, year] = inputDate.split('-');
    let date = new Date(Date.UTC(+year, +month - 1, +day));

    // Adjust to the start of the day (00:00:00) in your local timezone
    const timezoneOffset = date.getTimezoneOffset(); // Get the timezone offset in minutes
    date = new Date(date.getTime() - timezoneOffset * 60 * 1000);

    const bookedSlot = await this.bookedSlotRepository.create({
      slot_id: new Types.ObjectId(slotId),
      slot_for: slotFor,
      date: date,
      enquiry_id: new Types.ObjectId(enquiryId),
    });
    const slotMetadata = await this.slotMasterRepository.getById(
      new Types.ObjectId(slotId),
    );
    return {
      _id: bookedSlot._id,
      slot_id: bookedSlot.slot_id,
      slot_for: bookedSlot.slot_for,
      date: bookedSlot.date.toString(),
      slot: slotMetadata.slot,
    };
  }

  async getCurrentBookedSlot(enquiryId: string, slotFor: ESlotType) {
    const pipeline = [
      {
        $match: {
          enquiry_id: new Types.ObjectId(enquiryId),
          slot_for: slotFor,
          date: {
            $gte: new Date().setHours(0, 0, 0, 0),
          },
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
    ];
    const slots = await this.bookedSlotRepository.aggregate(pipeline);
    return slots.length ? slots[0] : [];
  }

  async reBookSlot(
    enquiryId: string,
    newSlotId: string,
    currentBookedSlotId: string,
    inputDate: string,
    slotFor: ESlotType,
  ) {
    const [day, month, year] = inputDate.split('-');
    let date = new Date(Date.UTC(+year, +month - 1, +day));

    // Adjust to the start of the day (00:00:00) in your local timezone
    const timezoneOffset = date.getTimezoneOffset(); // Get the timezone offset in minutes
    date = new Date(date.getTime() - timezoneOffset * 60 * 1000);

    const deleteResult = await this.bookedSlotRepository.hardDeleteById(
      new Types.ObjectId(currentBookedSlotId),
    );
    const slotMasterDetails = await this.slotMasterRepository.getById(
      new Types.ObjectId(newSlotId),
    );
    const bookedSlot = await this.bookedSlotRepository.create({
      slot_id: new Types.ObjectId(newSlotId),
      slot_for: slotFor,
      date: date,
      enquiry_id: new Types.ObjectId(enquiryId),
    });
    const updatedBookedSlotDetails = bookedSlot.toJSON();
    return { ...updatedBookedSlotDetails, slot: slotMasterDetails.slot };
  }

  async releaseSlot(bookedSlotId: string) {
    await this.bookedSlotRepository.hardDeleteById(
      new Types.ObjectId(bookedSlotId),
    );
  }

  async addSlots() {
    const slotsToBeInserted = [];
    const slots = [
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '12:00 PM',
      '12:30 PM',
      '01:00 PM',
      '01:30 PM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
      '05:00 PM',
      '05:30 PM',
      '06:00 PM',
    ];
    const schoolIds = [
      4, 5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 29, 30, 36, 41, 45, 23, 24,
      25, 26, 27, 28, 31, 32, 33, 34, 35, 38, 39, 40, 42, 43, 44, 46, 48, 50,
      52, 55, 57, 59, 3, 63, 64, 65, 66, 67, 68, 47, 49, 51, 53, 56, 58, 60, 61,
      62, 73, 74, 75, 76, 77, 78, 79, 1, 2, 6, 7, 8, 9, 10, 11, 12, 54, 69, 70,
      71, 72,
    ];
    const weekDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    for (const schoolId of schoolIds) {
      for (const day of weekDays) {
        for (const slot of slots) {
          slotsToBeInserted.push({
            slot_for: ESlotType.SCHOOL_VISIT,
            slot: slot,
            day: day,
            school_id: schoolId,
          });
        }
      }
    }

    await this.slotMasterRepository.createMany(slotsToBeInserted);
  }

  async addUnavailableSlot(
    slotId: string,
    inputDate: string,
    unavailabilityOf: EUnavailabilityOf,
    slotFor: ESlotType,
  ) {
    const [day, month, year] = inputDate.split('-');
    let date = new Date(Date.UTC(+year, +month - 1, +day));

    // Adjust to the start of the day (00:00:00) in your local timezone
    const timezoneOffset = date.getTimezoneOffset(); // Get the timezone offset in minutes
    date = new Date(date.getTime() - timezoneOffset * 60 * 1000);

    const payload = {
      slot_id: new Types.ObjectId(slotId),
      date: date,
      slot_for: slotFor,
      unavailability_of: unavailabilityOf,
    };

    const slot = await this.unavailableSlotRepository.create(payload);
    return slot;
  }

  async getSlotListForMarkingUnavailableSlots(
    schoolId: number,
    date: string,
    slotFor: ESlotType,
    unavailabilityOf: EUnavailabilityOf,
  ) {
    const [monthDate, month, year] = date.split('-');
    const day = daysOfWeek[new Date(`${month}-${monthDate}-${year}`).getDay()];
    const masterSlotsOfDay = await this.slotMasterRepository.getMany({
      slot_for: slotFor,
      day: day,
      school_id: schoolId,
    });

    const masterSlotIds = masterSlotsOfDay.map((slot) => slot._id);
    const pipeline: PipelineStage[] = [
      {
        $match: {
          $expr: {
            $eq: [
              {
                $dateToString: { format: '%d-%m-%Y', date: '$date' },
              },
              date,
            ],
          },
          slot_for: slotFor,
          slot_id: { $in: masterSlotIds },
        },
      },
    ];
    const bookedSlots = await this.bookedSlotRepository.aggregate(pipeline);

    let updatedMasterSlotIds = masterSlotIds;
    if (bookedSlots.length) {
      const bookedSlotIds = bookedSlots.map((slot) => slot.slot_id.toString());
      updatedMasterSlotIds = masterSlotIds.filter((slot) => {
        return !bookedSlotIds.includes(slot._id.toString());
      });
    }

    const unavailableSlotPipeline: PipelineStage[] = [
      {
        $match: {
          $expr: {
            $eq: [
              {
                $dateToString: { format: '%d-%m-%Y', date: '$date' },
              },
              `${monthDate}-${month}-${year}`,
            ],
          },
          slot_for: slotFor,
          slot_id: { $in: updatedMasterSlotIds },
          unavailability_of: EUnavailabilityOf.PRINCIPAL,
        },
      },
    ];

    const unavailableSlots = await this.unavailableSlotRepository.aggregate(
      unavailableSlotPipeline,
    );

    if (unavailableSlots.length) {
      const unavailableSlotIds = unavailableSlots.map((slot) =>
        slot.slot_id.toString(),
      );
      updatedMasterSlotIds = updatedMasterSlotIds.filter((slot) => {
        return !unavailableSlotIds.includes(slot._id.toString());
      });
    }

    const filteredAvailableSlots = [];
    masterSlotsOfDay.forEach((slot) => {
      if (updatedMasterSlotIds.includes(slot._id)) {
        filteredAvailableSlots.push({
          _id: slot._id,
          slot_for: slot.slot_for,
          slot: slot.slot,
          day: slot.day,
          school_id: slot.school_id,
        });
      }
    });
    return filteredAvailableSlots;
  }

  getFutureTimeSlots(localTime: string, wholeDaySlots: any[]) {
    const isCurrentlyNoon = localTime.split(' ')[1] === 'PM';
    const currentHour = +localTime.split(' ')[0].split(':')[0];
    const currentMinute = +localTime.split(' ')[0].split(':')[1];

    const futureSlots = wholeDaySlots.filter((slot) => {
      const isNoonSlot = slot.slot.split(' ')[1] === 'PM';
      const slotHour = +slot.slot.split(' ')[0].split(':')[0];
      const slotMinute = +slot.slot.split(' ')[0].split(':')[1];

      if (!isCurrentlyNoon) {
        if (isNoonSlot) {
          return true;
        }
        if (slotHour === currentHour && slotMinute > currentMinute) {
          return true;
        }
        if (slotHour > currentHour) {
          return true;
        }
      } else {
        if (currentHour === 12 && slotHour < currentHour && isNoonSlot) {
          return true;
        }
        if (
          slotHour === currentHour &&
          slotMinute > currentMinute &&
          isNoonSlot
        ) {
          return true;
        }
        if (slotHour > currentHour && slotHour < 12 && isNoonSlot) {
          return true;
        }
      }
    });
    return futureSlots;
  }

  async getSlotMasterById(slotId: string) {
    return await this.slotMasterRepository.getById(new Types.ObjectId(slotId));
  }

  sortSlots(slots: Record<string, any>[]) {
    if (!slots.length) return slots;

    const slotsMap = [];
    slots.forEach(slot => {
      const isNoonSlot = slot.slot.split(' ')[1] === 'PM' ? true : false;
      let [hours, minutes] = slot.slot.split(' ')[0].split(':');
      if (+hours === 12 && isNoonSlot) hours = 0;
      const timestamp = isNoonSlot ? (+hours * 60 * 60) + (+minutes * 60) + (12 * 60 * 60) : (+hours * 60 * 60) + (+minutes * 60)
      slotsMap.push({ timestamp, ...slot});
    });

    const sortedSlots = slotsMap.sort((a, b) => a.timestamp - b.timestamp)
      .map((sortedSlot) => {
      delete sortedSlot.timestamp;
      return sortedSlot;
    });
    return sortedSlots;
  }
}
