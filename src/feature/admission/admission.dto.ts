import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

import {
  EAdmissionApprovalStatus,
  EAdmissionDetailsType,
} from './admission.type';

export class CreateAdmissionDetailsDto {
  @ApiProperty({ required: true, enum: EAdmissionDetailsType })
  @IsString()
  type: EAdmissionDetailsType;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  optedForTransportation: boolean;

  @ValidateIf((o) => o.optedForTransportation === true)
  @IsOptional()
  @IsString()
  busType: string;

  @ApiProperty()
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsOptional()
  @IsString()
  serviceType: string;

  @ApiProperty()
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsOptional()
  @IsString()
  routeType: string;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsOptional()
  @IsNumber()
  pickupPointId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsOptional()
  @IsNumber()
  dropPointId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsNumber()
  transportAmount: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  optedForCafeteria: boolean;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForCafeteria === true)
  @IsNumber()
  @IsOptional()
  cafeteriaOptForId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForCafeteria === true)
  @IsNumber()
  @IsOptional()
  cafeteriaPeriodOfServiceId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForCafeteria === true)
  @IsNumber()
  cafeteriaAmount: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  optedForKidsClub: boolean;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsOptional()
  @IsNumber()
  kidsClubTypeId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsOptional()
  @IsNumber()
  kidsClubPeriodOfServiceId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsNumber()
  @IsOptional()
  kidsClubMonth: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsOptional()
  @IsNumber()
  kidsclubCafeteriaOptForId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsNumber()
  kidsClubAmount: number;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  optedForPsa: boolean;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsOptional()
  @IsNumber()
  psaSubTypeId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsOptional()
  @IsNumber()
  psaCategoryId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsOptional()
  @IsNumber()
  psaSubCategoryId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsOptional()
  @IsNumber()
  psaPeriodOfServiceId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsOptional()
  @IsNumber()
  psaBatchId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsNumber()
  psaAmount: number;
}

export class UpdateAdmissionDetailsDto {
  @ApiProperty({ required: true, enum: EAdmissionDetailsType })
  @IsString()
  type: EAdmissionDetailsType;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  optedForTransportation: boolean;

  @ApiProperty()
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsString()
  @IsOptional()
  busType: string;

  @ApiProperty()
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsString()
  @IsOptional()
  serviceType: string;

  @ApiProperty()
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsString()
  @IsOptional()
  routeType: string;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsNumber()
  @IsOptional()
  pickupPointId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsNumber()
  @IsOptional()
  dropPointId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForTransportation === true)
  @IsNumber()
  transportAmount: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  optedForCafeteria: boolean;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForCafeteria === true)
  @IsNumber()
  @IsOptional()
  cafeteriaOptForId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForCafeteria === true)
  @IsNumber()
  @IsOptional()
  cafeteriaPeriodOfServiceId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForCafeteria === true)
  @IsNumber()
  cafeteriaAmount: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  optedForKidsClub: boolean;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsNumber()
  @IsOptional()
  kidsClubTypeId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsNumber()
  @IsOptional()
  kidsClubPeriodOfServiceId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsNumber()
  @IsOptional()
  kidsClubMonth: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsNumber()
  @IsOptional()
  kidsclubCafeteriaOptForId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForKidsClub === true)
  @IsNumber()
  kidsClubAmount: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  optedForPsa: boolean;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsNumber()
  @IsOptional()
  psaSubTypeId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsNumber()
  @IsOptional()
  psaCategoryId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsNumber()
  @IsOptional()
  psaSubCategoryId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsNumber()
  @IsOptional()
  psaPeriodOfServiceId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsNumber()
  @IsOptional()
  psaBatchId: number;

  @ApiProperty({ type: Number })
  @ValidateIf((o) => o.optedForPsa === true)
  @IsNumber()
  psaAmount: number;
}

export class UpdateAdmissionApprovalStatusRequestDto {
  @ApiProperty({ type: String, description: 'Enquiry Id' })
  @IsString()
  @IsMongoId()
  enquiry_id: string;

  @ApiProperty({
    enum: [
      EAdmissionApprovalStatus.APPROVED,
      EAdmissionApprovalStatus.REJECTED,
    ],
  })
  @IsEnum(EAdmissionApprovalStatus, { message: 'Approval status' })
  status: EAdmissionApprovalStatus;
}

export class AddSubjectDetailsRequestDto {
  @ApiProperty({ required: true })
  @IsNumber()
  id: number;

  @ApiProperty({ required: true })
  @IsNumber()
  school_id: number;

  @ApiProperty({ required: true })
  @IsNumber()
  subject_id: number;

  @ApiProperty({ required: true })
  @IsNumber()
  is_compulsary: number;

  @ApiProperty({ required: true })
  @IsNumber()
  is_optional_compulsory: number;

  @ApiProperty({ required: true })
  @IsNumber()
  order_no: number;

  @ApiProperty({ required: true })
  @IsNumber()
  academic_year_id: number;

  @ApiProperty({ required: true })
  @IsNumber()
  status_id: number;

  @ApiProperty({ required: true })
  @IsString()
  school_name: string;

  @ApiProperty({ required: true })
  @IsString()
  subject_name: string;

  @ApiProperty({ required: true })
  @IsString()
  ac_year: string;
}

export class TransportDto {
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  shift_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  stop_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  route_id: number | null;
}

export class VasDetailDto {
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  batch_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee_type_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee_sub_type_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee_category_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee_subcategory_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  period_of_service_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ammount: number | null;

  @Transform(({ value }) => (value === null ? null : String(value)))
  @ApiProperty()
  @IsString()
  @IsOptional()
  pickup_point?: string | null;

  @Transform(({ value }) => (value === null ? null : value))
  @Type(() => TransportDto)
  @ApiProperty()
  @IsArray()
  @IsOptional()
  stop_details?: TransportDto[] | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fee_subcategory_start: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fee_subcategory_end: string;
}
export class AddVasOptionRequestDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => VasDetailDto)
  psa?: VasDetailDto;

  @ApiProperty()
  @IsOptional()
  @Type(() => VasDetailDto)
  summer_camp?: VasDetailDto;

  @ApiProperty()
  @IsOptional()
  @Type(() => VasDetailDto)
  kids_club?: VasDetailDto;

  @ApiProperty()
  @IsOptional()
  @Type(() => VasDetailDto)
  cafeteria?: VasDetailDto;

  @ApiProperty()
  @IsOptional()
  @Type(() => VasDetailDto)
  transport?: VasDetailDto;
}

export class DefaultFeesDetailDto {
  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  batch_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee_type_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee_sub_type_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee_category_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fee_subcategory_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  period_of_service_id: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  amount: number | null;

  @Transform(({ value }) => (value === null ? null : Number(value)))
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  student_fee_id: number | null;
}

export class DefaultFeesDto {
  @ApiProperty({ type: [DefaultFeesDetailDto] })
  @IsArray()
  @Type(() => DefaultFeesDetailDto)
  default_fees: DefaultFeesDetailDto[];
}

export const FEETYPES = {
  admission_fees: 1,
  cafeteria_fees: 2,
  kids_club_fees: 8,
  psa_fees: 11,
  registration_fees: 12,
  summer_camp_fees: 13,
  transport_fees: 15,
};
