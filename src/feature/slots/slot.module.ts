import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  BookedSlotRepository,
  SlotMasterRepository,
  UnavailableSlotsRepository,
} from './repository';
import {
  BookedSlot,
  bookedSlotSchema,
  SlotMaster,
  SlotMasterSchema,
  UnavailableSlot,
  unavailableSlotsSchema,
} from './schema';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SlotMaster.name, schema: SlotMasterSchema },
      { name: BookedSlot.name, schema: bookedSlotSchema },
      { name: UnavailableSlot.name, schema: unavailableSlotsSchema },
    ]),
  ],
  controllers: [SlotController],
  providers: [
    SlotMasterRepository,
    BookedSlotRepository,
    UnavailableSlotsRepository,
    SlotService,
  ],
  exports: [SlotService],
})
export class SlotModule {}
