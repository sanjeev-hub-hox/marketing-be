import { Types } from "mongoose"

export enum EEnquiryStageStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum EEnquiryStageSubStageStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
} 

export type TEnquiryStageSubStage = {
    id: Types.ObjectId,
    name: string,
    status: EEnquiryStageSubStageStatus
}

export type TEnquiryStage = {
    _id?: Types.ObjectId,
    name: string,
    color: string,
    is_active: boolean,
    start_date: Date,
    end_date: Date,
    sub_stage: TEnquiryStageSubStage[],
    created_at?: Date,
    updated_at?: Date
}