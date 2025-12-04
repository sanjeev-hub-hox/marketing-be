import { Types } from "mongoose"

export enum EEnquiryTypeMode {
    DIGITAL = 'digital',
    OFFLINE = 'offline',
    REFERRAL = 'referral',
}

export enum EEnquiryTypeStageTatUnit {
    HOURS = 'hour',
    DAY = 'day'
}

export type TEnquiryTypeStageTat = {
    unit: EEnquiryTypeStageTatUnit,
    value: number
}

export type TEnquiryTypeStage = {
    stage_id: Types.ObjectId,
    order: number,
    weightage: number,
    tat: TEnquiryTypeStageTat,
    is_mandatory: boolean,
    stage_forms: Types.ObjectId[]
    workflow: Types.ObjectId
}

export type TEnquiryTypeSources = {
    source_type: string,
    form_id: Types.ObjectId,
    url: string
}

export type TEnquiryTypeActions = {
    action_id: string;
    action_status: string;
}

export type TEnquiryType = {
    _id?: Types.ObjectId,
    name: string,
    slug: string,
    mode: EEnquiryTypeMode,
    order: number,
    enquiry_forms: Types.ObjectId[],
    description: string,
    is_active: boolean,
    stages?: TEnquiryTypeStage,
    saved_as_draft?: boolean,
    is_deleted?: boolean,
    created_at?: Date,
    updated_at?: Date
}