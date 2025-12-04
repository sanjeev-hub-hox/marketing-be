export enum EAdmissionDetailsType {
  TRANSPORT = 'Transport',
  CAFETERIA = 'Cafeteria',
  KIDS_CLUB = 'KidsClub',
  PSA = 'Psa',
  SUMMER_CAMP = 'SummerCamp',
}

export type TTransport = {
  bus_type?: number;
  service_type?: number;
  route_type?: number;
  pickup_point?: number;
  drop_point?: number;
};

export type TCafeteria = {
  opt_for?: number;
  period_of_service?: number;
};

export type TKidsClub = {
  type?: number;
  period_of_service?: number;
  month?: number;
  cafeteria_opt_for?: number;
};

export type TPsa = {
  sub_type?: number;
  category?: number;
  sub_category?: number;
  period_of_service?: number;
  batch?: number;
};

export enum EAdmissionApprovalStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum EFeeType {
  ADMISSION = 'admission',
  PSA = 'psa',
  KIDS_CLUB = 'kids_club',
  CAFETERIA = 'cafeteria',
  TRANSPORT = 'transport',
  SUMMER_CAMP = 'summer_camp',
}

export enum EChangeAdmissionRequest {
  IVT =  'ivt_change_request',
  READMISSION = 'readmission_request',
  ADMISSION_10_11 = 'admission_10_11_request'
}