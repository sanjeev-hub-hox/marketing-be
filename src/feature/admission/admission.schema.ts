import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

import { EAdmissionApprovalStatus } from './admission.type';

export class Transport {
  @Prop()
  shift_id?: number;

  @Prop()
  stop_id?: number;

  @Prop()
  route_id?: number;
}

export class Cafeteria {
  @Prop({ default: null })
  opt_for: number;

  @Prop({ default: null })
  period_of_service: number;

  @Prop({ default: 0 })
  amount: number;
}

export class VasDetail {
  @Prop({ default: null })
  student_fee_id?: number;

  @Prop({ default: null })
  batch_id?: number;

  @Prop({ default: null })
  fee_type_id?: number;

  @Prop({ default: null })
  fee_sub_type_id?: number;

  @Prop({ default: null })
  ammount?: number;

  @Prop({ default: null })
  fee_category_id?: number;

  @Prop({ default: null })
  fee_subcategory_id?: number;

  @Prop({ default: null })
  period_of_service_id?: number;

  @Prop()
  pickup_point?: string;

  @Prop()
  drop_point?: string;

  @Prop()
  stop_details?: Transport[];
}

export class DefaultFees {
  @Prop({ default: null })
  student_fee_id?: number;

  @Prop({ default: null })
  batch_id?: number;

  @Prop({ default: null })
  fee_type_id?: number;

  @Prop({ default: null })
  fee_sub_type_id?: number;

  @Prop({ default: null })
  ammount?: number;

  @Prop({ default: null })
  fee_category_id?: number;

  @Prop({ default: null })
  fee_subcategory_id?: number;

  @Prop({ default: null })
  period_of_service_id?: number;
}

export class SubjectDetails {
  @Prop({ default: null })
  id: number;

  @Prop({ default: null })
  school_id: number;

  @Prop({ default: null })
  subject_id: number;

  @Prop({ default: null })
  is_compulsary: number;

  @Prop({ default: null })
  is_optional_compulsory: number;

  @Prop({ default: null })
  order_no: number;

  @Prop({ default: null })
  academic_year_id: number;

  @Prop({ default: null })
  status_id: number;

  @Prop({ default: null })
  school_name: string;

  @Prop({ default: null })
  subject_name: string;

  @Prop({ default: null })
  ac_year: string;
}

export class PaymentDetails {
  @Prop({ default: null })
  enrollment_number: string;

  @Prop({ default: null })
  gr_number: string;

  @Prop({ default: null })
  amount: number;

  @Prop({ default: null })
  mode_of_payment: string;

  @Prop({ default: null })
  payment_date_time: string;
}

@Schema({
  collection: Admission.name.toLowerCase(),
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Admission {
  @Prop({ required: true })
  enquiry_id: Types.ObjectId;

  @Prop({ default: null })
  enrolment_number: string;

  @Prop({ default: null })
  gr_number: string;

  @Prop({ default: null })
  student_id: number;

  @Prop({ default: null })
  draft_student_id: number;

  @Prop({ default: [] })
  subject_details: SubjectDetails[];

  @Prop({ default: false })
  opted_for_transport: boolean;

  @Prop({ default: null })
  transport_details: VasDetail;

  @Prop({ default: false })
  opted_for_cafeteria: boolean;

  @Prop({ default: null })
  cafeteria_details: VasDetail;

  @Prop({ default: false })
  opted_for_hostel: boolean;

  @Prop({ default: null })
  hostel_details: mongoose.Schema.Types.Mixed;

  @Prop({ default: false })
  opted_for_kids_club: boolean;

  @Prop({ default: null })
  kids_club_details: VasDetail;

  @Prop({ default: false })
  opted_for_psa: boolean;

  @Prop({ default: null })
  psa_details: VasDetail;

  @Prop({ default: false })
  opted_for_summer_camp: boolean;

  @Prop({ default: null })
  summer_camp_details: VasDetail;

  @Prop({ default: 0 })
  total_amount: number;

  @Prop({
    enum: EAdmissionApprovalStatus,
    default: EAdmissionApprovalStatus.PENDING,
  })
  admission_approval_status: EAdmissionApprovalStatus;

  @Prop({ default: false })
  is_admitted: boolean;

  @Prop({ default: false })
  admission_fees_paid: boolean;

  @Prop({ default: false })
  default_fees: DefaultFees[];

  @Prop({ default: null })
  admitted_at: Date;

  @Prop({
    type: {
      user_id: { type: Number, required: false },
      user_name: { type: String, required: false },
      email: { type: String, required: false },
    },
    _id: false,
    default: {},
  })
  created_by: {
    user_id: number;
    user_name: string;
    email: string;
  };

  @Prop({ default: null })
  payment_details: PaymentDetails;

  @Prop({ default: false })
  admission_fee_request_triggered: boolean;

  @Prop({ default: false })
  is_already_existing_student: boolean
}

export type AdmissionDocument = HydratedDocument<Admission>;
export const admissionSchema = SchemaFactory.createForClass(Admission);
export type AdmissionModel = Model<Admission>;
