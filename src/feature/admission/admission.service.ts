import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuditLogRepository,
  HTTP_METHODS,
  RedisService,
} from 'ampersand-common-module';
import { AxiosRequestHeaders } from 'axios';
import { Request } from 'express';
import { Document, Types } from 'mongoose';

import {
  ADMIN_PANEL_URL,
  MDM_API_URLS,
  TRANSPORT_PANEL_URL,
} from '../../global/global.constant';
import { AxiosService, EHttpCallMethods } from '../../global/service';
import {
  ADMIN_API_URLS,
  APPLICATION_ID,
  extractCreatedByDetailsFromBody,
  FINANCE_API_URLS,
  isAppRequest,
  LoggerService,
  MdmService,
} from '../../utils';
import { SERVICE_ID } from '../enquiry/enquiry.constant';
import { EnquiryRepository } from '../enquiry/enquiry.repository';
import {
  ContactDetails,
  EnquiryDocument,
  ParentDetails,
} from '../enquiry/enquiry.schema';
import {
  EEnquiryStageStatus,
  EEnquiryStatus,
  EParentType,
} from '../enquiry/enquiry.type';
import { EnquiryLogService } from '../enquiryLog/enquiryLog.service';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from '../enquiryLog/enquiryLog.type';
import {
  AddVasOptionRequestDto,
  CreateAdmissionDetailsDto,
  DefaultFeesDetailDto,
  FEETYPES,
  VasDetailDto,
} from './admission.dto';
import { AdmissionRepository } from './admission.repository';
import { AdmissionDocument } from './admission.schema';
import {
  EAdmissionApprovalStatus,
  EAdmissionDetailsType,
  EChangeAdmissionRequest,
  EFeeType,
  TCafeteria,
  TKidsClub,
  TTransport,
} from './admission.type';
import { StudentDetailDto } from './dto/student-detail.dto';

@Injectable()
export class AdmissionService {
  constructor(
    private admissionRepository: AdmissionRepository,
    private enquiryRepository: EnquiryRepository,
    private enquiryLogService: EnquiryLogService,
    private mdmService: MdmService,
    private axiosService: AxiosService,
    private configService: ConfigService,
    private loggerService: LoggerService,
    private auditLogRepository: AuditLogRepository,
    @Inject('REDIS_INSTANCE') private redisInstance: RedisService,
  ) {}

  async getTransportPayload(
    enquiryId: string,
    payload: any,
  ): Promise<{ enquiry_id: Types.ObjectId; transport_details: TTransport }> {
    const transportPayload = new Object();
    if (payload.busType) {
      transportPayload['bus_type'] = payload.busType;
    }
    if (payload.serviceType) {
      transportPayload['service_type'] = payload.serviceType;
    }
    if (payload.routeType) {
      transportPayload['route_type'] = payload.routeType;
    }
    if (payload.pickupPointId) {
      transportPayload['pickup_point'] = payload.pickupPointId;
    }
    if (payload.dropPointId) {
      transportPayload['drop_point'] = payload.dropPointId;
    }
    transportPayload['amount'] = payload.transportAmount;

    return {
      enquiry_id: new Types.ObjectId(enquiryId),
      transport_details: transportPayload,
    };
  }

  async getCafeteriaPayload(
    enquiryId: string,
    payload: any,
  ): Promise<{ enquiry_id: Types.ObjectId; cafeteria_details: TCafeteria }> {
    const cafeteriaPayload = new Object();
    if (payload.cafeteriaOptForId) {
      cafeteriaPayload['opt_for'] = payload.cafeteriaOptForId;
    }

    if (payload.cafeteriaPeriodOfServiceId) {
      cafeteriaPayload['period_of_service'] =
        payload.cafeteriaPeriodOfServiceId;
    }
    cafeteriaPayload['amount'] = payload.cafeteriaAmount;
    return {
      enquiry_id: new Types.ObjectId(enquiryId),
      cafeteria_details: cafeteriaPayload,
    };
  }

  async getKidsClubPayload(
    enquiryId: string,
    payload: any,
  ): Promise<{ enquiry_id: Types.ObjectId; kids_club_details: TKidsClub }> {
    const kidsClubPayload = new Object();
    if (payload.kidsClubTypeId) {
      kidsClubPayload['type'] = payload.kidsClubTypeId;
    }
    if (payload.kidsClubPeriodOfServiceId) {
      kidsClubPayload['period_of_service'] = payload.kidsClubPeriodOfServiceId;
    }
    if (payload.kidsClubMonth) {
      kidsClubPayload['month'] = payload.kidsClubMonth;
    }
    if (payload.kidsclubCafeteriaOptForId) {
      kidsClubPayload['cafeteria_opt_for'] = payload.kidsclubCafeteriaOptForId;
    }
    kidsClubPayload['amount'] = payload.kidsClubAmount;
    return {
      enquiry_id: new Types.ObjectId(enquiryId),
      kids_club_details: kidsClubPayload,
    };
  }

  async getPsaPayload(
    enquiryId: string,
    payload: any,
  ): Promise<{ enquiry_id: Types.ObjectId; psa_details: TKidsClub }> {
    const psaPayload = new Object();
    if (payload.psaSubTypeId) {
      psaPayload['sub_type'] = payload.psaSubTypeId;
    }
    if (payload.psaCategoryId) {
      psaPayload['category'] = payload.psaCategoryId;
    }
    if (payload.psaSubCategoryId) {
      psaPayload['sub_category'] = payload.psaSubCategoryId;
    }
    if (payload.psaPeriodOfServiceId) {
      psaPayload['period_of_service'] = payload.psaPeriodOfServiceId;
    }
    if (payload.psaBatchId) {
      psaPayload['batch'] = payload.psaBatchId;
    }
    psaPayload['amount'] = payload.psaAmount;
    return {
      enquiry_id: new Types.ObjectId(enquiryId),
      psa_details: psaPayload,
    };
  }

  async create(
    type: string,
    enquiryId: string,
    payload: CreateAdmissionDetailsDto,
    req: Request,
  ): Promise<AdmissionDocument> {
    let createAdmissionPayload = new Object();

    const createdByDetails = extractCreatedByDetailsFromBody(req);

    switch (type) {
      case EAdmissionDetailsType.TRANSPORT:
        const transportDetails = await this.getTransportPayload(
          enquiryId,
          payload,
        );
        createAdmissionPayload = transportDetails;
        break;
      case EAdmissionDetailsType.CAFETERIA:
        const cafeteriaDetails = await this.getCafeteriaPayload(
          enquiryId,
          payload,
        );
        createAdmissionPayload = cafeteriaDetails;
        break;
      case EAdmissionDetailsType.KIDS_CLUB:
        const kidsClubDetails = await this.getKidsClubPayload(
          enquiryId,
          payload,
        );
        createAdmissionPayload = kidsClubDetails;
        break;
      case EAdmissionDetailsType.PSA:
        const psaDetails = await this.getPsaPayload(enquiryId, payload);
        createAdmissionPayload = psaDetails;
        break;
    }

    const admissionDetails = await this.admissionRepository.create({
      ...createAdmissionPayload,
      created_by: createdByDetails,
    });
    return admissionDetails;
  }

  async update(
    type: string,
    enquiryId: string,
    payload: any,
  ): Promise<AdmissionDocument> {
    let updateAdmissionPayload = new Object();

    switch (type) {
      case EAdmissionDetailsType.TRANSPORT:
        const transportDetails = await this.getTransportPayload(
          enquiryId,
          payload,
        );
        updateAdmissionPayload = transportDetails;
        break;
      case EAdmissionDetailsType.CAFETERIA:
        const cafeteriaDetails = await this.getCafeteriaPayload(
          enquiryId,
          payload,
        );
        updateAdmissionPayload = cafeteriaDetails;
        break;
      case EAdmissionDetailsType.KIDS_CLUB:
        const kidsClubDetails = await this.getKidsClubPayload(
          enquiryId,
          payload,
        );
        updateAdmissionPayload = kidsClubDetails;
        break;
      case EAdmissionDetailsType.PSA:
        const psaDetails = await this.getPsaPayload(enquiryId, payload);
        updateAdmissionPayload = psaDetails;
        break;
    }
    delete updateAdmissionPayload['enquiry_id'];
    const updatedAdmissionDetails =
      await this.admissionRepository.updateByEnquiryId(
        new Types.ObjectId(enquiryId),
        updateAdmissionPayload,
      );
    return updatedAdmissionDetails;
  }

  async getAdmissionDetails(enquiryId: string): Promise<
    {
      opted_for_transport?: boolean;
      opted_for_cafeteria?: boolean;
      opted_for_kids_club?: boolean;
      opted_for_psa?: boolean;
    } & AdmissionDocument
  > {
    const admissionDetails = await this.admissionRepository.getOne(
      { enquiry_id: new Types.ObjectId(enquiryId) },
      {
        _id: 0,
        created_at: 0,
        updated_at: 0,
        __v: 0,
      },
    );
    if (!admissionDetails) {
      throw new HttpException(
        'Admission details not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const response = JSON.parse(JSON.stringify(admissionDetails));
    const {
      transport_details,
      cafeteria_details,
      kids_club_details,
      psa_details,
    } = response;

    response['opted_for_transport'] = false;
    response['opted_for_cafeteria'] = false;
    response['opted_for_kids_club'] = false;
    response['opted_for_psa'] = false;

    if (transport_details) {
      response['opted_for_transport'] = true;
    }
    if (cafeteria_details) {
      response['opted_for_cafeteria'] = true;
    }
    if (kids_club_details) {
      response['opted_for_kids_club'] = true;
    }
    if (psa_details) {
      response['opted_for_psa'] = true;
    }
    return response;
  }

  async updateAdmissionPaymentStatus(
    enquiryId: string,
    paymentData: Record<string, any>,
  ): Promise<void> {
    await Promise.all([
      this.admissionRepository.updateByEnquiryId(
        new Types.ObjectId(enquiryId),
        {
          is_admitted: true,
          admission_fees_paid: true,
          admitted_at: new Date(),
          payment_details: paymentData,
        },
      ),
      this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
        status: EEnquiryStatus.CLOSED,
      }),
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.ADMISSION,
        event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
        event: EEnquiryEvent.ADMISSION_COMPLETED,
        log_data: {
          enquiry_id: new Types.ObjectId(enquiryId),
          is_admitted: true,
          admission_fees_paid: true,
          admitted_at: new Date(),
        },
        created_by: 'System',
        created_by_id: -1,
      }),
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.ENQUIRY,
        event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
        event: EEnquiryEvent.ENQUIRY_CLOSED,
        log_data: {
          status: 'Admission Granted',
          message: '',
        },
          created_by: 'System',
          created_by_id: -1,
      })
    ]);

    const admissionDoc = await this.admissionRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });
    if (admissionDoc?.is_admitted && !admissionDoc?.draft_student_id) {
      await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
        status: EEnquiryStatus.ADMITTED,
      });
    }
    return;
  }

  async updateEnquiryStage(
    enquiryId: string,
    enquiryStages: any[],
    stageName: string,
    status: EEnquiryStageStatus,
  ) {
    const competencyRegex = new RegExp(stageName, 'i');
    const updatedEnquiryStages = enquiryStages.map((stage) => {
      if (competencyRegex.test(stage.stage_name)) {
        stage.status = status;
      }
      return stage;
    });
    await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
      enquiry_stages: updatedEnquiryStages,
    });
  }

  async updateAdmissionFeeRequst(enquiryId: string) {
    if (!enquiryId) {
      throw new HttpException('Enquiry id not found', HttpStatus.NOT_FOUND);
    }

    const enquiryAdmissionRecord = await this.admissionRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });

    if (enquiryAdmissionRecord) {
      await this.admissionRepository.updateByEnquiryId(
        new Types.ObjectId(enquiryId),
        {
          $set: {
            'default_fees.0': false,
            admission_fee_request_triggered: false,
          },
        },
      );
    }
  }

  async updateAdmissionApprovalStatus(
    enquiryId: string,
    status: EAdmissionApprovalStatus,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException('Enquiry not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_stages } = enquiryDetails;
    const enquiryAdmissionRecord = await this.admissionRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });

    if (enquiryAdmissionRecord) {
      await this.admissionRepository.updateByEnquiryId(
        new Types.ObjectId(enquiryId),
        {
          admission_approval_status: status,
        },
      );
    } else {
      await this.admissionRepository.create({
        enquiry_id: new Types.ObjectId(enquiryId),
        status: status,
      });
    }
    await Promise.all([
      this.updateEnquiryStage(
        enquiryId,
        enquiry_stages,
        'Admission status',
        status === EAdmissionApprovalStatus.APPROVED
          ? EEnquiryStageStatus.APPROVED
          : EEnquiryStageStatus.REJECTED,
      ),
      this.enquiryLogService.createLog({
        enquiry_id: enquiryDetails._id,
        event_type: EEnquiryEventType.ADMISSION,
        event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
        event:
          status === EAdmissionApprovalStatus.APPROVED
            ? EEnquiryEvent.ADMISSION_APPROVED
            : EEnquiryEvent.ADMISSION_REJECTED,
        log_data: enquiryAdmissionRecord
          ? {
              enquiry_id: new Types.ObjectId(enquiryId),
              admission_approval_status: status,
            }
          : {
              enquiry_id: new Types.ObjectId(enquiryId),
              status: status,
            },
        created_by: 'User',
        created_by_id: 1,
      }),
    ]);
  }

  async addAdmissionSubjects(
    req: Request,
    enquiryId: string,
    subjectDetails: Record<string, any>,
  ): Promise<AdmissionDocument> {
    const token = req.headers.authorization.split(' ')[1];
    const sessionData =
      (await this.redisInstance?.getData(token)) ?? req.session[token];
    const enquiryAdmissionDetails = await this.admissionRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });

    if (!enquiryAdmissionDetails) {
      throw new HttpException(
        'Admission details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (subjectDetails?.created_by) delete subjectDetails?.created_by;
    const [updatedEnquiryDetails, _] = await Promise.all([
      this.admissionRepository.updateByEnquiryId(
        new Types.ObjectId(enquiryId),
        { subject_details: Object.values(subjectDetails) },
      ),
      this.enquiryLogService.createLog({
        enquiry_id: new Types.ObjectId(enquiryId),
        event_type: EEnquiryEventType.ADMISSION,
        event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
        event: EEnquiryEvent.SUBJECTS_SELECTED,
        log_data: { subject_details: subjectDetails },
        created_by: sessionData?.userInfo?.name ?? 'User',
        created_by_id: sessionData?.userInfo?.id ?? -1,
      }),
    ]);
    return updatedEnquiryDetails;
  }

  hasOwnPropertyAndCheckValue(
    obj: Record<string, any>,
    key: string,
    value: any,
  ): boolean {
    return obj.hasOwnProperty(key) && obj[key] === value;
  }
  createVasFeeArray(admissionDetails: Partial<AdmissionDocument & Document>) {
    const fee_array: EFeeType[] = [];
    if (
      this.hasOwnPropertyAndCheckValue(
        admissionDetails,
        'opted_for_transport',
        true,
      )
    ) {
      fee_array.push(EFeeType.TRANSPORT);
    }
    if (
      this.hasOwnPropertyAndCheckValue(
        admissionDetails,
        'opted_for_cafeteria',
        true,
      )
    ) {
      fee_array.push(EFeeType.CAFETERIA);
    }
    if (
      this.hasOwnPropertyAndCheckValue(
        admissionDetails,
        'opted_for_kids_club',
        true,
      )
    ) {
      fee_array.push(EFeeType.KIDS_CLUB);
    }
    if (
      this.hasOwnPropertyAndCheckValue(admissionDetails, 'opted_for_psa', true)
    ) {
      fee_array.push(EFeeType.PSA);
    }
    if (
      this.hasOwnPropertyAndCheckValue(
        admissionDetails,
        'opted_for_summer_camp',
        true,
      )
    ) {
      fee_array.push(EFeeType.SUMMER_CAMP);
    }
    return fee_array;
  }

  async updateAdmissionRecordVasId(
    data: any[],
    admissionDetails: Partial<AdmissionDocument>,
    _id: Types.ObjectId,
  ): Promise<void> {
    await Promise.all(
      data.map(async (d) => {
        if (d.fee_type_id === FEETYPES.psa_fees) {
          await this.admissionRepository.updateByEnquiryId(_id, {
            psa_details: {
              ...admissionDetails.psa_details,
              student_fee_id: d.id,
            },
          });
        }
        if (d.fee_type_id === FEETYPES.cafeteria_fees) {
          await this.admissionRepository.updateByEnquiryId(_id, {
            cafeteria_details: {
              ...admissionDetails.cafeteria_details,
              student_fee_id: d.id,
            },
          });
        }
        if (d.fee_type_id === FEETYPES.kids_club_fees) {
          await this.admissionRepository.updateByEnquiryId(_id, {
            kids_club_details: {
              ...admissionDetails.kids_club_details,
              student_fee_id: d.id,
            },
          });
        }
        if (d.fee_type_id === FEETYPES.summer_camp_fees) {
          await this.admissionRepository.updateByEnquiryId(_id, {
            summer_camp_details: {
              ...admissionDetails.summer_camp_details,
              student_fee_id: d.id,
            },
          });
        }
        if (d.fee_type_id === FEETYPES.transport_fees) {
          await this.admissionRepository.updateByEnquiryId(_id, {
            transport_details: {
              ...admissionDetails.transport_details,
              student_fee_id: d.id,
            },
          });
        }
      }),
    );
  }

  async sendCreateAdmissionPaymentRequest(
    enquiryDetails: Partial<EnquiryDocument & Document> | any,
    authorization?: string,
  ) {
    const {
      _id,
      enquiry_number,
      school_location,
      student_details,
      academic_year,
      enquiry_stages,
      other_details,
    } = enquiryDetails;

    const [academicYearDetails, admissionDetails]: [
      any,
      Partial<AdmissionDocument & Document>,
    ] = await Promise.all([
      this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.ACADEMIC_YEAR}/${academic_year?.id}`,
      ),
      this.admissionRepository.getOne({ enquiry_id: _id }),
    ]);

    if (admissionDetails?.admission_fee_request_triggered) {
      this.loggerService.log(
        `Cannot sent another request as admission request was already sent earlier`,
      );
      return;
    }

    const paymentRegex = new RegExp('Payment', 'i');
    const updatedEnquiryStages = enquiry_stages.map((stage) => {
      if (paymentRegex.test(stage.stage_name)) {
        stage.status = EEnquiryStageStatus.INPROGRESS;
      }
      return stage;
    });
    const fee_array: EFeeType[] = this.createVasFeeArray(admissionDetails);

    // NOTE: Think of a better way to identify the enquiry type. This method enforces the user to hard code the enquiry type against the enquiry form
    switch (other_details?.enquiry_type) {
      case 'NewAdmission':
      case 'Readmission':
      case 'readmission_10_11':
      case 'IVT':
        if (
          _id &&
          enquiry_number &&
          school_location.id &&
          student_details?.grade?.id &&
          academicYearDetails?.data?.attributes?.short_name_two_digit &&
          (enquiryDetails as any)?.board?.id &&
          (enquiryDetails as any)?.course?.id &&
          (enquiryDetails as any)?.shift?.id
        ) {
          let bodyParam: any = {
            enquiry_id: _id.toString(),
            enquiry_no: enquiry_number,
            school_id: school_location.id,
            grade_id: student_details?.grade?.id,
            board_id: (enquiryDetails as any)?.board?.id,
            course_id: (enquiryDetails as any)?.course?.id,
            shift_id: (enquiryDetails as any)?.shift?.id,
            stream_id: (enquiryDetails as any)?.stream?.id,
            academic_year_id:
              +academicYearDetails?.data?.attributes?.short_name_two_digit,
            // ...(enquiryDetails?.guest_student_details?.location?.id ? { host_school_id: enquiryDetails?.guest_student_details?.location?.id }: {})
          };
          if (!other_details?.['is_guest_student']) {
            bodyParam = {
              ...bodyParam,
              brand_id: (enquiryDetails as any)?.brand?.id,
            };
          }

          if (
            other_details?.enquiry_type === 'IVT' ||
            other_details?.enquiry_type === 'Readmission'
          ) {
            const studentDetails =
              await this.getStudentDetailsByEnrolmentNumber(
                student_details?.enrolment_number,
              );
            if (studentDetails?.student_details?.id) {
              bodyParam['student_id'] = studentDetails?.student_details?.id;
            }
          }

          if (
            other_details?.['is_guest_student'] &&
            enquiryDetails?.guest_student_details?.location?.id
          ) {
            bodyParam.host_school_id =
              enquiryDetails?.guest_student_details?.location?.id;
          }
          const body = [
            // {
            //   ...bodyParam,
            //   fee_sub_type_id: 3,
            //   fee_type: EFeeType.ADMISSION,
            // },
          ];
          fee_array.forEach((data) => {
            const extraVasParams: Partial<VasDetailDto> = {};
            if (data === EFeeType.CAFETERIA) {
              extraVasParams.fee_sub_type_id = 25;
            }
            if (admissionDetails?.[`${data}_details`]?.fee_sub_type_id) {
              extraVasParams.fee_sub_type_id =
                admissionDetails?.[`${data}_details`]?.fee_sub_type_id;
            }
            if (admissionDetails?.[`${data}_details`]?.fee_category_id) {
              extraVasParams.fee_category_id =
                admissionDetails?.[`${data}_details`]?.fee_category_id;
            }
            if (admissionDetails?.[`${data}_details`]?.period_of_service_id) {
              extraVasParams.period_of_service_id =
                admissionDetails?.[`${data}_details`]?.period_of_service_id;
            }
            if (admissionDetails?.[`${data}_details`]?.batch_id) {
              extraVasParams.batch_id =
                admissionDetails?.[`${data}_details`]?.batch_id;
            }
            if (admissionDetails?.[`${data}_details`]?.fee_subcategory_id) {
              extraVasParams.fee_subcategory_id =
                admissionDetails?.[`${data}_details`]?.fee_subcategory_id;
            }
            if (
              data === EFeeType.TRANSPORT &&
              admissionDetails?.[`${data}_details`]?.pickup_point
            ) {
              extraVasParams.fee_subcategory_start =
                admissionDetails?.[`${data}_details`]?.pickup_point;
            }
            if (
              data === EFeeType.TRANSPORT &&
              admissionDetails?.[`${data}_details`]?.drop_point
            ) {
              extraVasParams.fee_subcategory_end =
                admissionDetails?.[`${data}_details`]?.drop_point;
            }
            body.push({
              ...bodyParam,
              fee_type: data,
              ...extraVasParams,
            });
          });

          if (admissionDetails?.default_fees?.length) {
            admissionDetails?.default_fees.forEach((defaultFee) => {
              body.push({
                ...bodyParam,
                fee_type: (defaultFee as any)?.fee_type_slug,
                ...((defaultFee as any)?.fee_sub_type_id
                  ? { fee_sub_type_id: (defaultFee as any)?.fee_sub_type_id }
                  : {}),
                ...((defaultFee as any)?.fee_category_id
                  ? { fee_category_id: (defaultFee as any)?.fee_category_id }
                  : {}),
                ...((defaultFee as any)?.period_of_service_id
                  ? {
                      period_of_service_id: (defaultFee as any)
                        ?.period_of_service_id,
                    }
                  : {}),
                ...((defaultFee as any)?.batch_id
                  ? { batch_id: (defaultFee as any)?.batch_id }
                  : {}),
                ...((defaultFee as any)?.fee_subcategory_id
                  ? {
                      fee_subcategory_id: (defaultFee as any)
                        ?.fee_subcategory_id,
                    }
                  : {}),
              });
            });
          }
          if (!body.length) {
            this.loggerService.error(
              `Request to finance not sent as fee request body is empty`,
              '',
            );
            throw new HttpException(
              'Cannot send empty fee data',
              HttpStatus.BAD_REQUEST,
            );
          }

          const response = await this.axiosService
            .setBaseUrl(`${this.configService.get<string>('FINANCE_URL')}`)
            .setMethod(EHttpCallMethods.POST)
            .setUrl(FINANCE_API_URLS.FEE_BULK_CREATE)
            .setBody({ studentFees: body })
            .sendRequest();

          this.loggerService.log('New admission fee request sent successfully');

          await this.auditLogRepository.create({
            table_name: 'enquiry',
            request_body: `${JSON.stringify({ studentFees: body })}`,
            response_body: `${
              response
                ? JSON.stringify({
                    status: response?.status,
                    statusText: response?.statusText,
                    headers: response?.headers,
                    data: response?.data,
                  })
                : null
            }`,
            operation_name: `feesCreation - ${EFeeType.ADMISSION}`,
            created_by: 1,
            url: `${bodyParam.enquiry_id}/payment-request`,
            ip_address: 'NA',
            method: HTTP_METHODS.POST,
            source_service: this.configService.get<string>('SERVICE'),
            record_id: _id,
          });

          if (admissionDetails?.opted_for_transport && authorization) {
            if (!response?.data?.data?.data?.length) {
              this.loggerService.log(
                `Fees data not found in response of finance fees request API`,
              );
            } else {
              this.loggerService.log(`Pushing transport details to transport`);
              admissionDetails?.transport_details?.stop_details?.map(
                async (d) => {
                  const requestBody = {
                    enquiry_no: enquiry_number,
                    shift_id: (enquiryDetails as any)?.shift?.id,
                    stop_id: d.stop_id,
                    route_id: null,
                    fees_id: response?.data?.data?.data?.find(
                      (f) => f.fee_type_id === FEETYPES.transport_fees,
                    )?.id,
                  };

                  const transportApiResponse = await this.axiosService
                    .setBaseUrl(this.configService.get('TRANSPORT_PANEL_URL'))
                    .setUrl(TRANSPORT_PANEL_URL.TRANSPORT_CREATE)
                    .setMethod(EHttpCallMethods.POST)
                    .setHeaders({
                      Authorization: authorization,
                    } as AxiosRequestHeaders)
                    .setBody(requestBody)
                    .sendRequest();

                  await this.auditLogRepository.create({
                    table_name: 'enquiry',
                    request_body: `${JSON.stringify(requestBody)}`,
                    response_body: `${
                      transportApiResponse
                        ? JSON.stringify({
                            status: transportApiResponse?.status,
                            statusText: transportApiResponse?.statusText,
                            headers: transportApiResponse?.headers,
                            data: transportApiResponse?.data,
                          })
                        : null
                    }`,
                    operation_name: `transportCreate - ${EFeeType.ADMISSION}`,
                    created_by: 1,
                    url: `${this.configService.get('TRANSPORT_PANEL_URL')}${TRANSPORT_PANEL_URL.TRANSPORT_CREATE}`,
                    ip_address: 'NA',
                    method: HTTP_METHODS.POST,
                    source_service: this.configService.get<string>('SERVICE'),
                    record_id: _id,
                  });
                },
              );
            }
          }

          if (response?.data?.data?.data?.length) {
            this.loggerService.log(`Updating fees data in admission`);
            await this.updateAdmissionRecordVasId(
              response.data.data.data,
              admissionDetails,
              _id,
            );
          }
        } else {
          this.loggerService.log(
            'Some of the data is missing for sending the New Admission fee create request',
          );
          throw new HttpException(
            'Fee payment failed as some admission data is missing for sending payment request',
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
      case 'PSA':
        if (
          _id &&
          enquiry_number &&
          school_location.id &&
          student_details?.grade?.id &&
          academicYearDetails?.data?.attributes?.short_name_two_digit &&
          (enquiryDetails as any)?.board?.id &&
          enquiryDetails?.psa_sub_type?.id &&
          enquiryDetails?.psa_category?.id &&
          enquiryDetails?.period_of_service?.id &&
          enquiryDetails?.psa_batch?.id
        ) {
          const bodyParam: any = {
            enquiry_id: _id.toString(),
            enquiry_no: enquiry_number,
            school_id: school_location.id,
            grade_id: student_details?.grade?.id,
            board_id: (enquiryDetails as any)?.board?.id,
            academic_year_id:
              +academicYearDetails?.data?.attributes?.short_name_two_digit,
            fee_sub_type_id: enquiryDetails?.psa_sub_type?.id,
            fee_category_id: enquiryDetails?.psa_category?.id,
            period_of_service_id: enquiryDetails?.period_of_service?.id,
            batch_id: enquiryDetails?.psa_batch?.id,
            // ...(enquiryDetails?.guest_student_details?.location?.id ? { host_school_id: enquiryDetails?.guest_student_details?.location?.id }: {})
          };
          if (other_details?.['is_guest_student']) {
            bodyParam.host_school_id = enquiryDetails?.guest_student_details.id;
          }
          const body = [
            {
              ...bodyParam,
              fee_type: EFeeType.PSA,
            },
          ];
          fee_array.forEach((data) => {
            const extraVasParams: Partial<VasDetailDto> = {};
            if (data === EFeeType.CAFETERIA) {
              extraVasParams.fee_sub_type_id = 25;
            }
            if (admissionDetails?.[`${data}_details`]?.fee_sub_type_id) {
              extraVasParams.fee_sub_type_id =
                admissionDetails?.[`${data}_details`]?.fee_sub_type_id;
            }
            if (admissionDetails?.[`${data}_details`]?.fee_category_id) {
              extraVasParams.fee_category_id =
                admissionDetails?.[`${data}_details`]?.fee_category_id;
            }
            if (admissionDetails?.[`${data}_details`]?.period_of_service_id) {
              extraVasParams.period_of_service_id =
                admissionDetails?.[`${data}_details`]?.period_of_service_id;
            }
            if (admissionDetails?.[`${data}_details`]?.batch_id) {
              extraVasParams.batch_id =
                admissionDetails?.[`${data}_details`]?.batch_id;
            }
            if (admissionDetails?.[`${data}_details`]?.fee_subcategory_id) {
              extraVasParams.fee_subcategory_id =
                admissionDetails?.[`${data}_details`]?.fee_subcategory_id;
            }
            body.push({
              ...bodyParam,
              fee_type: data,
              ...extraVasParams,
            });
          });

          const response = await this.axiosService
            .setBaseUrl(`${this.configService.get<string>('FINANCE_URL')}`)
            .setMethod(EHttpCallMethods.POST)
            .setUrl(FINANCE_API_URLS.FEE_BULK_CREATE)
            .setBody({ studentFees: body })
            .sendRequest();

          this.loggerService.log('PSA fee request sent successfully');

          await this.auditLogRepository.create({
            table_name: 'enquiry',
            request_body: `${JSON.stringify({ studentFees: body })}`,
            response_body: `${
              response
                ? JSON.stringify({
                    status: response?.status,
                    statusText: response?.statusText,
                    headers: response?.headers,
                    data: response?.data,
                  })
                : null
            }`,
            operation_name: `feesCreation - ${EFeeType.PSA}`,
            created_by: 1,
            url: `${bodyParam.enquiry_id}/payment-request`,
            ip_address: 'NA',
            method: HTTP_METHODS.POST,
            source_service: this.configService.get<string>('SERVICE'),
            record_id: _id,
          });

          if (admissionDetails?.opted_for_transport && authorization) {
            if (!response?.data?.data?.data?.length) {
              this.loggerService.error(
                `Fees data not found in response of fees request API`,
                '',
              );
            } else {
              this.loggerService.log(`Pushing transport details to transport`);
              await Promise.all(
                admissionDetails?.transport_details?.stop_details?.map(
                  async (d) => {
                    const param = {
                      shift_id: d.shift_id,
                      stop_id: d.stop_id,
                      route_id: d.route_id,
                      fees_id: response.data.data.data.find(
                        (f) => f.fee_type_id === FEETYPES.transport_fees,
                      )?.id,
                    };

                    const transportApiResponse = await this.axiosService
                      .setBaseUrl(this.configService.get('TRANSPORT_PANEL_URL'))
                      .setUrl(TRANSPORT_PANEL_URL.TRANSPORT_CREATE)
                      .setMethod(EHttpCallMethods.POST)
                      .setHeaders({
                        Authorization: authorization,
                      } as AxiosRequestHeaders)
                      .setBody(param)
                      .sendRequest();

                    await this.auditLogRepository.create({
                      table_name: 'enquiry',
                      request_body: `${JSON.stringify(param)}`,
                      response_body: `${
                        transportApiResponse
                          ? JSON.stringify({
                              status: transportApiResponse?.status,
                              statusText: transportApiResponse?.statusText,
                              headers: transportApiResponse?.headers,
                              data: transportApiResponse?.data,
                            })
                          : null
                      }`,
                      operation_name: `transportCreate - ${EFeeType.ADMISSION}`,
                      created_by: 1,
                      url: `${this.configService.get('TRANSPORT_PANEL_URL')}${TRANSPORT_PANEL_URL.TRANSPORT_CREATE}`,
                      ip_address: 'NA',
                      method: HTTP_METHODS.POST,
                      source_service: this.configService.get<string>('SERVICE'),
                      record_id: _id,
                    });
                  },
                ),
              );
            }
          }

          if (response?.data?.data?.data?.length) {
            this.loggerService.log(`Updating fees data in admission`);
            await this.updateAdmissionRecordVasId(
              response.data.data.data,
              admissionDetails,
              _id,
            );
          }
        } else {
          this.loggerService.log(
            'Some of the data is missing for sending the PSA fee create request',
          );
          throw new HttpException(
            'Fee payment failed as some PSA data is missing for sending payment request',
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
      case 'KidsClub':
        if (
          _id &&
          enquiry_number &&
          school_location.id &&
          student_details?.grade?.id &&
          academicYearDetails?.data?.attributes?.short_name_two_digit &&
          enquiryDetails?.kids_club_month?.id &&
          enquiryDetails?.kids_club_type?.id &&
          enquiryDetails?.kids_club_period_of_service?.id &&
          enquiryDetails?.kids_club_batch?.id
        ) {
          const bodyParam: any = {
            enquiry_id: _id.toString(),
            enquiry_no: enquiry_number,
            school_id: school_location.id,
            grade_id: student_details?.grade?.id,
            academic_year_id:
              +academicYearDetails?.data?.attributes?.short_name_two_digit,
            fee_sub_type_id: enquiryDetails?.kids_club_type?.id,
            fee_category_id: enquiryDetails?.kids_club_month?.id,
            period_of_service_id:
              enquiryDetails?.kids_club_period_of_service?.id,
            batch_id: enquiryDetails?.kids_club_batch?.id,
          };
          if (other_details?.['is_guest_student']) {
            bodyParam.host_school_id = enquiryDetails?.guest_student_details.id;
          }
          const body = [
            {
              ...bodyParam,
              fee_type: EFeeType.KIDS_CLUB,
            },
          ];
          fee_array.forEach((data) => {
            const extraVasParams: Partial<VasDetailDto> = {};
            if (data === EFeeType.CAFETERIA) {
              extraVasParams.fee_sub_type_id = 25;
            }
            if (admissionDetails?.[`${data}_details`]?.fee_sub_type_id) {
              extraVasParams.fee_sub_type_id =
                admissionDetails?.[`${data}_details`]?.fee_sub_type_id;
            }
            if (admissionDetails?.[`${data}_details`]?.fee_category_id) {
              extraVasParams.fee_category_id =
                admissionDetails?.[`${data}_details`]?.fee_category_id;
            }
            if (admissionDetails?.[`${data}_details`]?.period_of_service_id) {
              extraVasParams.period_of_service_id =
                admissionDetails?.[`${data}_details`]?.period_of_service_id;
            }
            if (admissionDetails?.[`${data}_details`]?.batch_id) {
              extraVasParams.batch_id =
                admissionDetails?.[`${data}_details`]?.batch_id;
            }
            if (admissionDetails?.[`${data}_details`]?.fee_subcategory_id) {
              extraVasParams.fee_subcategory_id =
                admissionDetails?.[`${data}_details`]?.fee_subcategory_id;
            }
            if (
              data === EFeeType.TRANSPORT &&
              admissionDetails?.[`${data}_details`]?.pickup_point
            ) {
              extraVasParams.fee_subcategory_start =
                admissionDetails?.[`${data}_details`]?.pickup_point;
            }
            if (
              data === EFeeType.TRANSPORT &&
              admissionDetails?.[`${data}_details`]?.drop_point
            ) {
              extraVasParams.fee_subcategory_end =
                admissionDetails?.[`${data}_details`]?.drop_point;
            }
            body.push({
              ...bodyParam,
              fee_type: data,
              ...extraVasParams,
            });
          });
          const response = await this.axiosService
            .setBaseUrl(`${this.configService.get<string>('FINANCE_URL')}`)
            .setMethod(EHttpCallMethods.POST)
            .setUrl(FINANCE_API_URLS.FEE_BULK_CREATE)
            .setBody({ studentFees: body })
            .sendRequest();

          this.loggerService.log('Kids club fee request sent successfully');

          await this.auditLogRepository.create({
            table_name: 'enquiry',
            request_body: `${JSON.stringify({ studentFees: body })}`,
            response_body: `${
              response
                ? JSON.stringify({
                    status: response?.status,
                    statusText: response?.statusText,
                    headers: response?.headers,
                    data: response?.data,
                  })
                : null
            }`,
            operation_name: `feesCreation - ${EFeeType.KIDS_CLUB}`,
            created_by: 1,
            url: `${bodyParam.enquiry_id}/payment-request`,
            ip_address: 'NA',
            method: HTTP_METHODS.POST,
            source_service: this.configService.get<string>('SERVICE'),
            record_id: _id,
          });

          if (admissionDetails?.opted_for_transport && authorization) {
            if (!response?.data?.data?.data?.length) {
              this.loggerService.error(
                `Fees data not found in response of fees request API`,
                '',
              );
            } else {
              this.loggerService.log(`Pushing transport details to transport`);
              await Promise.all(
                admissionDetails?.transport_details?.stop_details?.map(
                  async (d) => {
                    const param = {
                      shift_id: d.shift_id,
                      stop_id: d.stop_id,
                      route_id: d.route_id,
                      fees_id: response.data.data.data.find(
                        (f) => f.fee_type_id === FEETYPES.transport_fees,
                      )?.id,
                    };

                    const transportApiResponse = await this.axiosService
                      .setBaseUrl(this.configService.get('TRANSPORT_PANEL_URL'))
                      .setUrl(TRANSPORT_PANEL_URL.TRANSPORT_CREATE)
                      .setMethod(EHttpCallMethods.POST)
                      .setHeaders({
                        Authorization: authorization,
                      } as AxiosRequestHeaders)
                      .setBody(param)
                      .sendRequest();

                    await this.auditLogRepository.create({
                      table_name: 'enquiry',
                      request_body: `${JSON.stringify(param)}`,
                      response_body: `${
                        transportApiResponse
                          ? JSON.stringify({
                              status: transportApiResponse?.status,
                              statusText: transportApiResponse?.statusText,
                              headers: transportApiResponse?.headers,
                              data: transportApiResponse?.data,
                            })
                          : null
                      }`,
                      operation_name: `transportCreate - ${EFeeType.ADMISSION}`,
                      created_by: 1,
                      url: `${this.configService.get('TRANSPORT_PANEL_URL')}${TRANSPORT_PANEL_URL.TRANSPORT_CREATE}`,
                      ip_address: 'NA',
                      method: HTTP_METHODS.POST,
                      source_service: this.configService.get<string>('SERVICE'),
                      record_id: _id,
                    });
                  },
                ),
              );
            }
          }

          await this.updateAdmissionRecordVasId(
            response.data.data.data,
            admissionDetails,
            _id,
          );
        } else {
          this.loggerService.log(
            'Some of the data is missing for sending the Kids club fee create request',
          );
          throw new HttpException(
            'Fee payment failed as some kids club data is missing for sending payment request',
            HttpStatus.BAD_REQUEST,
          );
        }
        break;
      default:
        break;
    }
    await Promise.all([
      this.enquiryRepository.updateById(_id, {
        enquiry_stages: updatedEnquiryStages,
      }),
      this.admissionRepository.updateByEnquiryId(_id, {
        admission_fee_request_triggered: true,
      }),
      this.enquiryLogService.createLog({
        enquiry_id: _id,
        event_type: EEnquiryEventType.ADMISSION,
        event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
        event: EEnquiryEvent.ADMISSION_FEE_REQUEST_SENT,
        created_by: 'System',
        created_by_id: -1,
      }),
    ]);
    return;
  }

  async removeVasOption(
    enquiryId: string,
    vasType: EAdmissionDetailsType,
  ): Promise<void> {
    const [admissionDetails, enquiryLogs] = await Promise.all([
      this.admissionRepository.getOne({
        enquiry_id: new Types.ObjectId(enquiryId),
      }),
      this.enquiryLogService.getEnquiryLogsByEnquiryId(enquiryId, 'desc', {
        eventType: EEnquiryEventType.ADMISSION,
      }),
    ]);
    if (!admissionDetails) {
      throw new HttpException(
        'Admission details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const updatePayload = new Object();

    switch (vasType) {
      case EAdmissionDetailsType.CAFETERIA:
        updatePayload['opted_for_cafeteria'] = false;
        updatePayload['cafeteria_details'] = null;
        break;
      case EAdmissionDetailsType.KIDS_CLUB:
        updatePayload['opted_for_kids_club'] = false;
        updatePayload['kids_club_details'] = null;
        break;
      case EAdmissionDetailsType.TRANSPORT:
        updatePayload['opted_for_transport'] = false;
        updatePayload['transport_details'] = null;
        break;
      case EAdmissionDetailsType.PSA:
        updatePayload['opted_for_psa'] = false;
        updatePayload['psa_details'] = null;
        break;
    }

    const promises = [
      this.admissionRepository.updateByEnquiryId(
        new Types.ObjectId(enquiryId),
        updatePayload,
      ),
    ];
    const vasLog = enquiryLogs.find(
      (log) => log.event === EEnquiryEvent.VAS_ADDED,
    );
    if (vasLog) {
      const removedVasIndex = (vasLog?.log_data as any).VAS_services.findIndex(
        (service) => service === vasType,
      );
      if (removedVasIndex !== -1) {
        if (((vasLog?.log_data as any).VAS_services as any[]).length === 1) {
          promises.push(
            this.enquiryLogService.deleteLog(vasLog._id.toString()),
          );
        } else {
          ((vasLog?.log_data as any).VAS_services as any[]).splice(
            removedVasIndex,
            1,
          );
          promises.push(
            this.enquiryLogService.updateLog(vasLog._id.toString(), {
              log_data: {
                VAS_services: (vasLog.log_data as any).VAS_services,
              },
            } as any),
          );
        }
      }
    }
    await Promise.all(promises);
    return;
  }

  async addVasOption(
    enquiryId: string,
    vasType: EAdmissionDetailsType,
    vasDetails: AddVasOptionRequestDto,
  ): Promise<void> {
    const admissionDetails = await this.admissionRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });

    if (!admissionDetails) {
      await this.admissionRepository.create({
        enquiry_id: new Types.ObjectId(enquiryId),
      });
    }

    switch (vasType) {
      case EAdmissionDetailsType.CAFETERIA:
        await this.admissionRepository.updateByEnquiryId(
          new Types.ObjectId(enquiryId),
          {
            opted_for_cafeteria: true,
            cafeteria_details: { ...vasDetails.cafeteria },
          },
        );
        break;
      case EAdmissionDetailsType.KIDS_CLUB:
        await this.admissionRepository.updateByEnquiryId(
          new Types.ObjectId(enquiryId),
          {
            opted_for_kids_club: true,
            kids_club_details: { ...vasDetails.kids_club },
          },
        );
        break;
      case EAdmissionDetailsType.TRANSPORT:
        await this.admissionRepository.updateByEnquiryId(
          new Types.ObjectId(enquiryId),
          {
            opted_for_transport: true,
            transport_details: {
              ...vasDetails.transport,
              // bus_type: vasDetails?.transportBusType ?? null,
              // service_type: vasDetails?.transportServiceType ?? null,
              // route_type: vasDetails?.transportRouteType ?? null,
              // pickup_point: vasDetails?.transportPickupPoint ?? null,
              // drop_point: vasDetails?.transportDropPoint ?? null,
              // amount: vasDetails?.transportAmount ?? null,
            },
          },
        );
        break;
      case EAdmissionDetailsType.PSA:
        await this.admissionRepository.updateByEnquiryId(
          new Types.ObjectId(enquiryId),
          {
            opted_for_psa: true,
            psa_details: { ...vasDetails.psa },
          },
        );
        break;
      case EAdmissionDetailsType.SUMMER_CAMP:
        await this.admissionRepository.updateByEnquiryId(
          new Types.ObjectId(enquiryId),
          {
            opted_for_summer_camp: true,
            summer_camp_details: { ...vasDetails.summer_camp },
          },
        );
        break;
    }
    const enquiryLogs =
      await this.enquiryLogService.getEnquiryLogsByEnquiryId(enquiryId);

    if (enquiryLogs.length) {
      const vasLog = enquiryLogs.find(
        (log) => log.event === EEnquiryEvent.VAS_ADDED,
      );
      if (!vasLog) {
        await this.enquiryLogService.createLog({
          enquiry_id: new Types.ObjectId(enquiryId),
          event_type: EEnquiryEventType.ADMISSION,
          event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
          event: EEnquiryEvent.VAS_ADDED,
          log_data: {
            VAS_services: [vasType],
          },
          created_by: 'User',
          created_by_id: -1,
        });
      } else {
        await this.enquiryLogService.updateLog(vasLog._id.toString(), {
          log_data: {
            VAS_services: [vasType],
          },
        } as any);
      }
    }
    return;
  }

  async sendPaymentRequest(enquiryId: string, req?: Request): Promise<void> {
    const authorization = req.headers.authorization;
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );
    const enquiryAdmissionRecordExists = await this.admissionRepository.getOne({
      enquiry_id: new Types.ObjectId(enquiryId),
    });
    if (!enquiryAdmissionRecordExists) {
      await this.admissionRepository.create({
        enquiry_id: new Types.ObjectId(enquiryId),
      });
    }
    await this.sendCreateAdmissionPaymentRequest(enquiryDetails, authorization);
    return;
  }

  getUserType(first_name?: string, last_name?: string) {
    if (first_name && last_name) return 2;
    else return 0;
  }

  getIsPreferredEmailOrContact(
    contactDetails?: ContactDetails,
    parentType?: EParentType,
    contactMedium?: 'Mobile' | 'Email',
  ) {
    let is_preferred_email_or_mobile = 0;
    const obj = Object.values(contactDetails);
    for (const elem of obj) {
      if (contactMedium === 'Email') {
        if (elem?.email_of_parent === parentType) {
          is_preferred_email_or_mobile = 1;
          break;
        }
      } else {
        if (elem?.mobile_of_parent === parentType) {
          is_preferred_email_or_mobile = 1;
          break;
        }
      }
    }
    return is_preferred_email_or_mobile;
  }

  getEmergencyContact(parent?: string, parent_details?: ParentDetails) {
    let contact_no;
    switch (parent) {
      case 'Father':
        contact_no = parent_details?.father_details?.mobile ? 1 : 0;
        break;

      case 'Mother':
        contact_no = parent_details?.mother_details?.mobile ? 1 : 0;
        break;

      case 'Guardian':
        contact_no = parent_details?.guardian_details?.mobile ? 1 : 0;
        break;
    }
    return contact_no;
  }

  async globalUserMdmApi(global_no: string) {
    const globalUser = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.GLOABL_USER_SEARCH}`,
      [[`filters[$and][0][global_number][$eq]`, global_no]],
    );
    if (!globalUser?.data) {
      this.loggerService.log(
        ` Failed url ::: ${MDM_API_URLS.GLOABL_USER_SEARCH} ? filters[global_number] = ${global_no}`,
      );
    }
    const { data } = globalUser;
    const payload = {
      data: {
        status_id: 1,
      },
    };
    const updateStus = await this.mdmService.putDataToAPI(
      `${MDM_API_URLS.GLOBAL_USER_STATUS}/${data?.[0]?.id}`,
      payload,
    );
    if (!updateStus) {
      this.loggerService.log(
        ` Failed url ::: ${MDM_API_URLS.GLOBAL_USER_STATUS} / ${data?.[0]?.id}, payload:: ${JSON.stringify(payload)}`,
      );
    }
  }

  async addStudentDetail(enquiryId: string, req: Request) {
    const enquiryDoc: Partial<EnquiryDocument & Document> =
      await this.enquiryRepository.getById(new Types.ObjectId(enquiryId));

    const admissionDetail:any = await this.admissionRepository.getByEnquiryId(new Types.ObjectId(enquiryId));
    
    if (!enquiryDoc) {
      throw new BadRequestException('No enquiry found');
    }
    if (!admissionDetail) {
      throw new BadRequestException('No admsission found');
    }

    this.loggerService.log(
      `school_id = ${enquiryDoc?.school_location?.id ?? null} and board_id = ${(enquiryDoc as any)?.board.id ?? null} and course_id = ${(enquiryDoc as any)?.course?.id}`,
    );

    console.log({
      operator: `school_id = ${enquiryDoc?.school_location?.id ?? null} and brand_id = ${(enquiryDoc as any)?.brand.id ?? null} and board_id = ${(enquiryDoc as any)?.board.id ?? null} and course_id = ${(enquiryDoc as any)?.course?.id}`,
    });
    const [
      schoolSearchResponse,
      academicYearDetails,
      schoolDetailsResponse,
      guardianRelationships,
    ] = await Promise.all([
      this.mdmService.postDataToAPI(`${MDM_API_URLS.SCHOOL_SEARCH}`, {
        operator: `school_id = ${enquiryDoc?.school_location?.id ?? null} and brand_id = ${(enquiryDoc as any)?.brand.id ?? null} and board_id = ${(enquiryDoc as any)?.board.id ?? null} and course_id = ${(enquiryDoc as any)?.course?.id}`,
      }),
      this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.ACADEMIC_YEAR}/${enquiryDoc?.academic_year?.id}`,
      ),
      this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.SCHOOL}/${enquiryDoc?.school_location?.id}`,
      ),
      this.mdmService.fetchDataFromAPI(MDM_API_URLS.CO_GUARDIAN_RELATIONSHIPS),
    ]);

    if (
      !schoolSearchResponse?.success ||
      !schoolSearchResponse?.data?.schools?.length
    ) {
      throw new HttpException('School details not found', HttpStatus.NOT_FOUND);
    }

    const {
      _id,
      enquiry_number,
      student_details,
      medical_details,
      contact_details,
      parent_details,
      residential_details,
      other_details,
      guest_student_details,
    } = enquiryDoc;
    const { father_details, mother_details, guardian_details } = parent_details;
    const { current_address, permanent_address, is_permanent_address } =
      residential_details;
    const { first_preference } = contact_details;

    const studentInfo: Partial<StudentDetailDto> = {
      student_profile: {
        enquiry_id: _id.toString(),
        enquiry_number: enquiry_number,
        first_name: student_details?.first_name,
        last_name: student_details?.last_name,
        gender_id: student_details?.gender?.id,
        dob: student_details?.dob.split('-').reverse().join('-'),
        birth_place: student_details?.place_of_birth,
        medical_info: {
          has_physical_disability:
            medical_details.has_physical_disability === 'yes' ? true : false,
          has_allergy: medical_details?.has_allergy === 'yes' ? true : false,
          past_hospitalization:
            medical_details?.was_hopitalised === 'yes' ? true : false,
          reason_for_hospitalization:
            medical_details?.reason_of_hospitalisation,
          is_phsically_disabled:
            medical_details?.has_physical_disability === 'yes' ? true : false,
          disablility_details: medical_details?.physical_disability_description,
          has_medical_history:
            medical_details?.has_medical_history === 'yes' ? true : false,
          medical_history_details: medical_details?.medical_history_description,
          has_personalized_learning_needs:
            medical_details?.has_learning_needs === 'yes' ? true : false,
          last_hospitalization_year: medical_details?.year_of_hospitalisation
            ? +medical_details?.year_of_hospitalisation
            : 0,
          personalized_learning_needs_details:
            medical_details?.personalised_learning_needs?.value,
          blood_group_id: medical_details?.blood_group?.id,
        },
        natinality_id: student_details?.nationality?.id,
        religion_id: student_details?.religion?.id,
        caste_id: student_details?.caste?.id,
        sub_caste_id: student_details?.sub_caste?.id,
        mother_tongue_id: student_details?.mother_tongue?.id,
        emergency_contact_no:
          this.getEmergencyContact(
            other_details?.['parent_type'],
            parent_details,
          ) ?? 0,
        is_parents_seperated:
          other_details?.['are_parents_separated'] === true ||
          other_details?.['are_parents_separated'] === 'yes'
            ? 1
            : 0,
        profile_image: null,
        crt_board_id: (enquiryDoc as any)?.board?.id,
        crt_grade_id: student_details?.grade?.id,
        crt_div_id: 0, //pass 0
        crt_shift_id: (enquiryDoc as any)?.shift?.id,
        crt_school_id: enquiryDoc?.school_location?.id ?? 0,
        crt_house_id: 0, //pass 0
        crt_brand_id: (enquiryDoc as any)?.brand?.id,
        crt_stream_id: (enquiryDoc as any)?.stream?.id,
        crt_course_id: (enquiryDoc as any)?.course?.id,
        crt_lob_id: schoolSearchResponse?.data?.schools[0]?.lob_id ?? 0,
        host_school_id: other_details?.['is_guest_student']
          ? guest_student_details?.location?.id
          : null,
        academic_year_id:
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
        school_parent_id: schoolDetailsResponse?.data?.attributes
          ?.school_parent_id
          ? schoolDetailsResponse?.data?.attributes?.school_parent_id
          : null,
      },
      subject_selection: admissionDetail?.subject_details || [],
      ...(father_details?.first_name &&
      father_details?.last_name &&
      father_details?.email &&
      father_details?.mobile
        ? {
            father_details: {
              guardian_id: 0,
              city_id: father_details?.city?.id,
              state_id: father_details?.state?.id,
              country_id: father_details?.country?.id,
              address_tag: 'work',
              address_type: 'guardian',
              global_no: father_details?.global_id ?? null,
              first_name: father_details?.first_name,
              middle_name: null,
              last_name: father_details?.last_name,
              dob: null,
              adhar_no: father_details?.aadhar,
              pan_no: father_details?.pan,
              qualification_id: father_details?.qualification?.id,
              occupation_id: father_details?.occupation?.id,
              organization_id: father_details?.designation?.id,
              designation_id: father_details?.designation?.id,
              address: father_details?.office_address,
              area: father_details?.area,
              pincode: father_details?.pin_code,
              mobile_no: father_details?.mobile,
              email: father_details?.email,
              is_preferred_email: this.getIsPreferredEmailOrContact(
                enquiryDoc?.contact_details,
                EParentType.FATHER,
                'Email',
              ),
              is_preferred_mobile_no: this.getIsPreferredEmailOrContact(
                enquiryDoc?.contact_details,
                EParentType.FATHER,
                'Mobile',
              ),
              set_as_emergency_contact:
                enquiryDoc?.contact_details?.emergency_contact === 'Father'
                  ? 1
                  : 0,
              user_type: father_details?.mobile
                ? 1
                : this.getUserType(
                    father_details?.first_name,
                    father_details?.last_name,
                  ),
              application_id: APPLICATION_ID,
              service_id: SERVICE_ID,
              guardian_relationship_id: guardianRelationships?.data?.length
                ? guardianRelationships?.data?.find(
                    (relationships) =>
                      relationships?.attributes?.name?.toLowerCase() ===
                      'father',
                  )?.id
                : 0,
            },
          }
        : {}),
      ...(mother_details?.first_name &&
      mother_details?.last_name &&
      mother_details?.email &&
      mother_details?.mobile
        ? {
            mother_details: {
              guardian_id: 0,
              city_id: mother_details?.city?.id,
              state_id: mother_details?.state?.id,
              country_id: mother_details?.country?.id,
              address_tag: 'work',
              address_type: 'guardian',
              global_no: mother_details?.global_id ?? null,
              first_name: mother_details?.first_name,
              middle_name: null,
              last_name: mother_details?.last_name,
              dob: null,
              adhar_no: mother_details?.aadhar,
              pan_no: mother_details?.pan,
              qualification_id: mother_details?.qualification?.id,
              occupation_id: mother_details?.occupation?.id,
              organization_id: 2,
              designation_id: mother_details?.designation?.id,
              address: mother_details?.office_address,
              area: mother_details?.area,
              pincode: mother_details?.pin_code,
              mobile_no: mother_details?.mobile,
              email: mother_details?.email,
              is_preferred_email: this.getIsPreferredEmailOrContact(
                contact_details,
                EParentType.MOTHER,
                'Email',
              ),
              is_preferred_mobile_no: this.getIsPreferredEmailOrContact(
                contact_details,
                EParentType.MOTHER,
                'Mobile',
              ),
              set_as_emergency_contact:
                contact_details?.emergency_contact === 'Mother' ? 1 : 0,
              user_type: mother_details?.mobile
                ? 1
                : this.getUserType(
                    mother_details?.first_name,
                    mother_details?.last_name,
                  ),
              application_id: APPLICATION_ID,
              service_id: SERVICE_ID,
              guardian_relationship_id: guardianRelationships?.data?.length
                ? guardianRelationships?.data?.find(
                    (relationships) =>
                      relationships?.attributes?.name?.toLowerCase() ===
                      'mother',
                  )?.id
                : 0,
            },
          }
        : {}),
      ...(guardian_details?.first_name &&
      guardian_details?.last_name &&
      guardian_details?.email &&
      guardian_details?.mobile
        ? {
            guardian_details: {
              guardian_id: 0,
              city_id: guardian_details?.city?.id,
              state_id: guardian_details?.state?.id,
              country_id: guardian_details?.country?.id,
              address_tag: 'work',
              address_type: 'guardian',
              global_no: guardian_details?.global_id ?? null,
              first_name: guardian_details?.first_name,
              middle_name: null,
              last_name: guardian_details?.last_name,
              dob: null,
              adhar_no: guardian_details?.aadhar,
              pan_no: guardian_details?.pan,
              qualification_id: 0,
              occupation_id: 0,
              organization_id: 0,
              designation_id: 0,
              address: null,
              area: null,
              pincode: guardian_details?.pin_code,
              mobile_no: guardian_details?.mobile,
              email: guardian_details?.email,
              is_preferred_email: this.getIsPreferredEmailOrContact(
                enquiryDoc?.contact_details,
                EParentType.GUARDIAN,
                'Email',
              ),
              is_preferred_mobile_no: this.getIsPreferredEmailOrContact(
                enquiryDoc?.contact_details,
                EParentType.GUARDIAN,
                'Mobile',
              ),
              set_as_emergency_contact:
                enquiryDoc?.contact_details?.emergency_contact === 'Guardian'
                  ? 1
                  : 0,
              user_type: guardian_details?.mobile
                ? 1
                : this.getUserType(
                    guardian_details?.first_name,
                    guardian_details?.last_name,
                  ),
              application_id: APPLICATION_ID,
              service_id: SERVICE_ID,
              guardian_relationship_id: Number(
                guardian_details?.relationship_with_child?.id,
              ),
            },
          }
        : {}),
      residential_info: [
        {
          type: 'student',
          user_id: 0,
          house_building_no:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.house ?? null)
              : (permanent_address?.house ?? null),
          street_name:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.street ?? null)
              : (permanent_address?.street ?? null),
          landmark:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.landmark ?? null)
              : (permanent_address?.landmark ?? null),
          city_id:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.city?.id ?? null)
              : (permanent_address?.city?.id ?? null),
          state_id:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.state?.id ?? null)
              : (permanent_address?.state?.id ?? null),
          country_id:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.country?.id ?? null)
              : (permanent_address?.country?.id ?? null),
          pincode:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? current_address?.pin_code
                ? +current_address?.pin_code
                : null
              : permanent_address?.pin_code
                ? +permanent_address?.pin_code
                : null,
        },
      ],
      contact_detail: [
        {
          guardian_id: 0,
          guardian_relationship_id: 1,
          preferred_mobile_no:
            first_preference?.mobile_of_parent === EParentType.FATHER
              ? (father_details?.mobile ?? null)
              : first_preference?.mobile_of_parent === EParentType.MOTHER
                ? (mother_details?.mobile ?? null)
                : first_preference?.mobile_of_parent === EParentType.GUARDIAN
                  ? (guardian_details?.mobile ?? null)
                  : null,
          preferred_email_no:
            first_preference?.email_of_parent === EParentType.FATHER
              ? (father_details?.email ?? null)
              : first_preference?.email_of_parent === EParentType.MOTHER
                ? (mother_details?.email ?? null)
                : first_preference?.email_of_parent === EParentType.GUARDIAN
                  ? (guardian_details?.email ?? null)
                  : null,
        },
      ],
    };

    const siblingDetails = [];
    if (enquiryDoc?.sibling_details?.length) {
      enquiryDoc.sibling_details.forEach((data) => {
        const dobDate = data?.dob
          ? data?.dob?.split('T')?.length > 0
            ? data?.dob?.split('T')[0]?.split('-')?.reverse()?.join('-')
            : data?.dob?.split('-')?.reverse()?.join('-')
          : null;
        if (data?.first_name && data?.last_name && data?.dob) {
          siblingDetails.push({
            sibling_global_user_id: 0,
            first_name: data?.first_name,
            last_name: data?.last_name,
            dob: dobDate,
            school_name: data?.school,
            gender_id: data?.gender?.id,
            user_type: 2,
            application_id: APPLICATION_ID,
            service_id: SERVICE_ID,
          });
        }
      });
    }

    if (siblingDetails.length) studentInfo.sibling_info = siblingDetails;
    this.loggerService.log(
      `Student profile create API called against enquiryId: ${enquiryId} and endpoint ${ADMIN_API_URLS.STUDENT_PROFILE_CREATE} :: with payload: ${JSON.stringify(studentInfo)}`,
    );
    const isCrossPlatformRequest = isAppRequest(req);
    const response = await this.axiosService
      .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
      .setHeaders({
        Authorization: req.headers.authorization,
      } as AxiosRequestHeaders)
      .setMethod(EHttpCallMethods.POST)
      .setUrl(ADMIN_API_URLS.STUDENT_PROFILE_CREATE)
      .setBody(studentInfo)
      .isCrossPlatformRequest(isCrossPlatformRequest)
      .sendRequest();

    this.loggerService.log(
      `Student profile create API response which was called against enquiryId: ${enquiryId} is : ${JSON.stringify(response.data)}`,
    );

    if (
      response?.data?.data?.student_profile?.crt_enr_on ||
      response?.data?.data?.student_profile?.gr_number
    ) {
      await this.admissionRepository.updateByEnquiryId(
        new Types.ObjectId(enquiryId),
        {
          enrolment_number: response?.data?.data?.student_profile?.crt_enr_on,
          gr_number: response?.data?.data?.student_profile?.gr_number,
          student_id: response?.data?.data?.student_profile?.id,
        },
      );
      await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
        status: EEnquiryStatus.CLOSED,
      });
    } else if (response?.data?.data?.is_student_exist) {
      await this.admissionRepository.updateByEnquiryId(
        new Types.ObjectId(enquiryId),
        {
          enrolment_number: response?.data?.data?.crt_enr_on ?? null,
          gr_number: response?.data?.data?.gr_number ?? null,
          student_id: response?.data?.data?.id ?? null,
          is_already_existing_student: true,
        },
      );
      const admissionDoc = await this.admissionRepository.getOne({
        enquiry_id: new Types.ObjectId(enquiryId),
      });
      if (admissionDoc?.is_admitted || admissionDoc?.draft_student_id) {
        await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
          status: EEnquiryStatus.CLOSED,
        });
      }
    }
    if (father_details?.global_id) {
      await this.globalUserMdmApi(father_details.global_id);
    }
    if (mother_details?.global_id) {
      await this.globalUserMdmApi(mother_details.global_id);
    }
    if (guardian_details?.global_id) {
      await this.globalUserMdmApi(guardian_details.global_id);
    }
    return response?.data?.data;
  }

  async updateStudentDetail(enquiryId: string, req: Request) {
    console.log('inside updateStudentDetail');

    const enquiryDoc: Partial<EnquiryDocument & Document> =
      await this.enquiryRepository.getById(new Types.ObjectId(enquiryId));
    if (!enquiryDoc) {
      throw new BadRequestException('No enquiry found');
    }

    const [
      schoolSearchResponse,
      academicYearDetails,
      schoolDetailsResponse,
      guardianRelationships,
      admissionDoc,
    ] = await Promise.all([
      this.mdmService.postDataToAPI(`${MDM_API_URLS.SCHOOL_SEARCH}`, {
        operator: `school_id = ${enquiryDoc?.school_location?.id ?? null} and brand_id = ${(enquiryDoc as any)?.brand.id ?? null} and board_id = ${(enquiryDoc as any)?.board.id ?? null} and course_id = ${(enquiryDoc as any)?.course?.id}`,
      }),
      this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.ACADEMIC_YEAR}/${enquiryDoc?.academic_year?.id}`,
      ),
      this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.SCHOOL}/${enquiryDoc?.school_location?.id}`,
      ),
      this.mdmService.fetchDataFromAPI(MDM_API_URLS.CO_GUARDIAN_RELATIONSHIPS),
      this.admissionRepository.getOne({
        enquiry_id: new Types.ObjectId(enquiryId),
      }),
    ]);

    if (
      !schoolSearchResponse?.success ||
      !schoolSearchResponse?.data?.schools?.length
    ) {
      throw new HttpException('School details not found', HttpStatus.NOT_FOUND);
    }
    let studetn_Id;
    if (!admissionDoc?.draft_student_id) {
      const studetnData = await this.getStudentDetailsByEnrolmentNumber(
        enquiryDoc?.student_details?.enrolment_number,
      );
      if (!studetnData?.student_details?.id) {
        throw new BadRequestException('Student ID not found for this enquiry');
      } else {
        studetn_Id = studetnData?.student_details?.id;
      }
    } else {
      studetn_Id = admissionDoc?.draft_student_id;
    }

    const {
      _id,
      enquiry_number,
      student_details,
      medical_details,
      contact_details,
      parent_details,
      residential_details,
      other_details,
      guest_student_details,
    } = enquiryDoc;

    const { father_details, mother_details, guardian_details } = parent_details;
    const { current_address, permanent_address, is_permanent_address } =
      residential_details;
    const { first_preference } = contact_details;

    // Build parent array for UpdateStudentProfileDto
    const parentArray = [];

    if (
      father_details?.first_name &&
      father_details?.last_name &&
      father_details?.email &&
      father_details?.mobile
    ) {
      parentArray.push({
        guardian_id: 0,
        city_id: father_details?.city?.id,
        state_id: father_details?.state?.id,
        country_id: father_details?.country?.id,
        address_tag: 'work',
        address_type: 'guardian',
        global_no: father_details?.global_id ?? null,
        first_name: father_details?.first_name,
        middle_name: null,
        last_name: father_details?.last_name,
        dob: null,
        adhar_no: father_details?.aadhar,
        pan_no: father_details?.pan,
        qualification_id: father_details?.qualification?.id,
        occupation_id: father_details?.occupation?.id,
        organization_id: father_details?.designation?.id,
        designation_id: father_details?.designation?.id,
        address: father_details?.office_address,
        area: father_details?.area,
        pincode: father_details?.pin_code,
        mobile_no: father_details?.mobile,
        email: father_details?.email,
        is_preferred_email: this.getIsPreferredEmailOrContact(
          enquiryDoc?.contact_details,
          EParentType.FATHER,
          'Email',
        ),
        is_preferred_mobile_no: this.getIsPreferredEmailOrContact(
          enquiryDoc?.contact_details,
          EParentType.FATHER,
          'Mobile',
        ),
        set_as_emergency_contact:
          enquiryDoc?.contact_details?.emergency_contact === 'Father' ? 1 : 0,
        user_type: father_details?.mobile
          ? 1
          : this.getUserType(
              father_details?.first_name,
              father_details?.last_name,
            ),
        application_id: APPLICATION_ID,
        service_id: SERVICE_ID,
        guardian_relationship_id: guardianRelationships?.data?.length
          ? guardianRelationships?.data?.find(
              (relationships) =>
                relationships?.attributes?.name?.toLowerCase() === 'father',
            )?.id
          : 0,
        occupation: null,
        organization: null,
        designation: null,
        qualification: null,
      });
    }

    if (
      mother_details?.first_name &&
      mother_details?.last_name &&
      mother_details?.email &&
      mother_details?.mobile
    ) {
      parentArray.push({
        guardian_id: 0,
        city_id: mother_details?.city?.id,
        state_id: mother_details?.state?.id,
        country_id: mother_details?.country?.id,
        address_tag: 'work',
        address_type: 'guardian',
        global_no: mother_details?.global_id ?? null,
        first_name: mother_details?.first_name,
        middle_name: null,
        last_name: mother_details?.last_name,
        dob: null,
        adhar_no: mother_details?.aadhar,
        pan_no: mother_details?.pan,
        qualification_id: mother_details?.qualification?.id,
        occupation_id: mother_details?.occupation?.id,
        organization_id: 2,
        designation_id: mother_details?.designation?.id,
        address: mother_details?.office_address,
        area: mother_details?.area,
        pincode: mother_details?.pin_code,
        mobile_no: mother_details?.mobile,
        email: mother_details?.email,
        is_preferred_email: this.getIsPreferredEmailOrContact(
          contact_details,
          EParentType.MOTHER,
          'Email',
        ),
        is_preferred_mobile_no: this.getIsPreferredEmailOrContact(
          contact_details,
          EParentType.MOTHER,
          'Mobile',
        ),
        set_as_emergency_contact:
          contact_details?.emergency_contact === 'Mother' ? 1 : 0,
        user_type: mother_details?.mobile
          ? 1
          : this.getUserType(
              mother_details?.first_name,
              mother_details?.last_name,
            ),
        application_id: APPLICATION_ID,
        service_id: SERVICE_ID,
        guardian_relationship_id: guardianRelationships?.data?.length
          ? guardianRelationships?.data?.find(
              (relationships) =>
                relationships?.attributes?.name?.toLowerCase() === 'mother',
            )?.id
          : 0,
        occupation: null,
        organization: null,
        designation: null,
        qualification: null,
      });
    }

    if (
      guardian_details?.first_name &&
      guardian_details?.last_name &&
      guardian_details?.email &&
      guardian_details?.mobile
    ) {
      parentArray.push({
        guardian_id: 0,
        city_id: guardian_details?.city?.id,
        state_id: guardian_details?.state?.id,
        country_id: guardian_details?.country?.id,
        address_tag: 'work',
        address_type: 'guardian',
        global_no: guardian_details?.global_id ?? null,
        first_name: guardian_details?.first_name,
        middle_name: null,
        last_name: guardian_details?.last_name,
        dob: null,
        adhar_no: guardian_details?.aadhar,
        pan_no: guardian_details?.pan,
        qualification_id: 0,
        occupation_id: 0,
        organization_id: 0,
        designation_id: 0,
        address: null,
        area: null,
        pincode: guardian_details?.pin_code,
        mobile_no: guardian_details?.mobile,
        email: guardian_details?.email,
        is_preferred_email: this.getIsPreferredEmailOrContact(
          enquiryDoc?.contact_details,
          EParentType.GUARDIAN,
          'Email',
        ),
        is_preferred_mobile_no: this.getIsPreferredEmailOrContact(
          enquiryDoc?.contact_details,
          EParentType.GUARDIAN,
          'Mobile',
        ),
        set_as_emergency_contact:
          enquiryDoc?.contact_details?.emergency_contact === 'Guardian' ? 1 : 0,
        user_type: guardian_details?.mobile
          ? 1
          : this.getUserType(
              guardian_details?.first_name,
              guardian_details?.last_name,
            ),
        application_id: APPLICATION_ID,
        service_id: SERVICE_ID,
        guardian_relationship_id: Number(
          guardian_details?.relationship_with_child?.id,
        ),
        occupation: null,
        organization: null,
        designation: null,
        qualification: null,
      });
    }

    const studentInfo: any = {
      id: studetn_Id,
      student_profile: {
        student_id: studetn_Id,
        enquiry_id: _id.toString(),
        enquiry_no: enquiry_number,
        first_name: student_details?.first_name,
        middle_name: null,
        last_name: student_details?.last_name,
        gender_id: student_details?.gender?.id,
        dob: student_details?.dob.split('-').reverse().join('-'),
        birth_place: student_details?.place_of_birth,
        adhar_no: null,
        medical_info: {
          has_physical_disability:
            medical_details.has_physical_disability === 'yes' ? true : false,
          has_allergy: medical_details?.has_allergy === 'yes' ? true : false,
          past_hospitalization:
            medical_details?.was_hopitalised === 'yes' ? true : false,
          reason_for_hospitalization:
            medical_details?.reason_of_hospitalisation,
          is_phsically_disabled:
            medical_details?.has_physical_disability === 'yes' ? true : false,
          disablility_details: medical_details?.physical_disability_description,
          has_medical_history:
            medical_details?.has_medical_history === 'yes' ? true : false,
          medical_history_details: medical_details?.medical_history_description,
          has_personalized_learning_needs:
            medical_details?.has_learning_needs === 'yes' ? true : false,
          last_hospitalization_year: medical_details?.year_of_hospitalisation
            ? +medical_details?.year_of_hospitalisation
            : 0,
          personalized_learning_needs_details:
            medical_details?.personalised_learning_needs?.value,
          blood_group_id: medical_details?.blood_group?.id,
          allergy_details: null,
        },
        natinality_id: student_details?.nationality?.id,
        religion_id: student_details?.religion?.id,
        caste_id: student_details?.caste?.id,
        sub_caste_id: student_details?.sub_caste?.id,
        mother_tongue_id: student_details?.mother_tongue?.id,
        emergency_contact_no:
          this.getEmergencyContact(
            other_details?.['parent_type'],
            parent_details,
          ) ?? 0,
        is_parents_seperated:
          other_details?.['are_parents_separated'] === true ||
          other_details?.['are_parents_separated'] === 'yes'
            ? 1
            : 0,
        custodian_id: null,
        subject_selection: null,
        profile_image: null,
        crt_board_id: (enquiryDoc as any)?.board?.id,
        crt_grade_id: student_details?.grade?.id,
        crt_div_id: 0,
        crt_shift_id: (enquiryDoc as any)?.shift?.id,
        crt_school_id: enquiryDoc?.school_location?.id ?? 0,
        crt_house_id: 0,
        crt_brand_id: (enquiryDoc as any)?.brand?.id,
        crt_stream_id: (enquiryDoc as any)?.stream?.id,
        school_parent_id: schoolDetailsResponse?.data?.attributes
          ?.school_parent_id
          ? schoolDetailsResponse?.data?.attributes?.school_parent_id
          : null,
        crt_course_id: (enquiryDoc as any)?.course?.id,
        academic_year_id:
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
        crt_lob_id: schoolSearchResponse?.data?.schools[0]?.lob_id ?? 0,
        competency_test_attended: null,
        competency_test_mode: null,
        competency_test_result: null,
        competency_test_status: null,
        reconsideration_cycle_date: null,
        admission_offered_date: null,
      },
      ...(parentArray.length > 0 && { parent: parentArray }),
      residential_info: [
        {
          address_tag: [],
          type: 'student',
          user_id: 0,
          house_building_no:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.house ?? null)
              : (permanent_address?.house ?? null),
          street_name:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.street ?? null)
              : (permanent_address?.street ?? null),
          landmark:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.landmark ?? null)
              : (permanent_address?.landmark ?? null),
          city_id:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.city?.id ?? null)
              : (permanent_address?.city?.id ?? null),
          state_id:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.state?.id ?? null)
              : (permanent_address?.state?.id ?? null),
          country_id:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? (current_address?.country?.id ?? null)
              : (permanent_address?.country?.id ?? null),
          pincode:
            is_permanent_address === 'yes' || is_permanent_address === true
              ? current_address?.pin_code
                ? +current_address?.pin_code
                : null
              : permanent_address?.pin_code
                ? +permanent_address?.pin_code
                : null,
        },
      ],
      contact_info: [
        {
          guardian_id: 0,
          guardian_relationship_id: 1,
          preferred_mobile_no: first_preference?.mobile_of_parent === EParentType.FATHER
              ? 1 : first_preference?.mobile_of_parent === EParentType.MOTHER
                ? 2 : first_preference?.mobile_of_parent === EParentType.GUARDIAN
                  ? 0 : null,
          preferred_email_no:
            first_preference?.email_of_parent === EParentType.FATHER
              ? 1 : first_preference?.email_of_parent === EParentType.MOTHER
                ? 2 : first_preference?.email_of_parent === EParentType.GUARDIAN
                  ? 0 : null,
        },
      ],
    };

    const siblingDetails = [];
    if (enquiryDoc?.sibling_details?.length) {
      enquiryDoc.sibling_details.forEach((data) => {
        const dobDate = data?.dob
          ? data?.dob?.split('T')?.length > 0
            ? data?.dob?.split('T')[0]?.split('-')?.reverse()?.join('-')
            : data?.dob?.split('-')?.reverse()?.join('-')
          : null;
        if (data?.first_name && data?.last_name && data?.dob) {
          siblingDetails.push({
            sibling_global_user_id: 0,
            first_name: data?.first_name,
            last_name: data?.last_name,
            dob: dobDate,
            school_name: data?.school,
            gender_id: data?.gender?.id,
            is_vibgyor_student: false,
            grade_id: null,
            user_type: 2,
            application_id: APPLICATION_ID,
            service_id: SERVICE_ID,
          });
        }
      });
    }

    if (siblingDetails.length) studentInfo.sibling_info = siblingDetails;

    this.loggerService.log(
      `Student profile update API called against enquiryId: ${enquiryId} and endpoint ${ADMIN_API_URLS.STUDENT_PROFILE_UPDATE} :: with payload: ${JSON.stringify(studentInfo)}`,
    );

    const isCrossPlatformRequest = isAppRequest(req);
    // const profileUpdateResponse = await this.axiosService
    //   .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
    //   .setHeaders({
    //     Authorization: req.headers.authorization,
    //   } as AxiosRequestHeaders)
    //   .setMethod(EHttpCallMethods.PUT)
    //   .setUrl(ADMIN_API_URLS.STUDENT_PROFILE_UPDATE)
    //   .setBody(studentInfo)
    //   .isCrossPlatformRequest(isCrossPlatformRequest)
    //   .sendRequest();

    const profileUpdateResponse = await fetch(
      `${this.configService.get<string>('ADMIN_PANEL_URL')}${ADMIN_API_URLS.STUDENT_PROFILE_UPDATE}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: req.headers.authorization,
        },
        body: JSON.stringify(studentInfo),
      },
    );

    const profileUpdateResponseData = await profileUpdateResponse.json();
    this.loggerService.log(
      `Student profile update API profileUpdateResponse logtest which was called against enquiryId: ${enquiryId} is : ${JSON.stringify(profileUpdateResponseData)}`,
    );

    return profileUpdateResponseData.data;
  }

  async upsertAdmissionRecord(enquiryId: Types.ObjectId, status: string) {
    const enquiryAdmissionRecord = await this.admissionRepository.getOne({
      enquiry_id: enquiryId,
    });

    if (enquiryAdmissionRecord) {
      await this.admissionRepository.updateByEnquiryId(enquiryId, {
        admission_approval_status: status,
      });
    } else {
      await this.admissionRepository.create({
        enquiry_id: enquiryId,
        admission_approval_status: status,
      });
    }
  }

  async getStudentDetailsByEnrolmentNumber(enrolmentNumber: string) {
    const studentDetailsResponse = await this.axiosService
      .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
      .setUrl(ADMIN_API_URLS.STUDENT_DETAILS)
      .setMethod(EHttpCallMethods.POST)
      .setBody({ crt_enr_on: enrolmentNumber })
      .sendRequest();

    if (studentDetailsResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        'Student Details not found',
        HttpStatus.NOT_FOUND,
      );
    }
    console.log('student deatil-', studentDetailsResponse);

    const response: Record<string, any> = {};
    const { studentProfile, parent, address } =
      studentDetailsResponse.data.data;

    if (studentProfile && Object.keys(studentProfile).length) {
      response['school_location'] = {};
      response['school_location']['id'] = studentProfile?.crt_school_id ?? null;
      response['school_location']['value'] = studentProfile?.crt_school ?? null;

      response['academic_year'] = {};
      response['academic_year']['id'] =
        studentProfile?.academic_year_id ?? null;
      response['academic_year']['value'] =
        studentProfile?.academic_year_name ?? null;

      response['board'] = {};
      response['board']['id'] = studentProfile?.crt_board_id ?? null;
      response['board']['value'] = studentProfile?.crt_board ?? null;

      response['course'] = {};
      response['course']['id'] = studentProfile?.crt_course_id ?? null;
      response['course']['value'] = studentProfile?.course_name ?? null;

      response['stream'] = {};
      response['stream']['id'] = studentProfile?.crt_stream_id ?? null;
      response['stream']['value'] = studentProfile?.stream_name ?? null;

      response['shift'] = {};
      response['shift']['id'] = studentProfile?.crt_shift_id ?? null;
      response['shift']['value'] = studentProfile?.crt_shift ?? null;

      response['brand'] = {};
      response['brand']['id'] = studentProfile?.crt_brand_id ?? null;
      response['brand']['value'] = studentProfile?.brand_name ?? null;

      response['student_details'] = {};
      response['student_details']['id'] = studentProfile?.id;
      response['student_details']['first_name'] = studentProfile?.first_name;
      response['student_details']['last_name'] = studentProfile?.last_name;

      response['student_details']['grade'] = {};
      response['student_details']['grade']['id'] =
        studentProfile?.crt_grade_id ?? null;
      response['student_details']['grade']['value'] =
        studentProfile?.crt_grade ?? null;

      response['student_details']['gender'] = {};
      response['student_details']['gender']['id'] =
        studentProfile?.gender_id ?? null;
      response['student_details']['gender']['value'] =
        studentProfile?.gender ?? null;

      response['student_details']['dob'] = studentProfile?.dob ?? null;
    }

    if (parent && Array.isArray(parent)) {
      const parentDetails = parent.filter((parentDetails) =>
        ['Father', 'Mother'].includes(parentDetails.relation),
      );

      if (parentDetails.length) {
        const fatherDetails = parentDetails?.find(
          (details) => details.relation === 'Father',
        );
        const motherDetails = parentDetails?.find(
          (details) => details.relation === 'Mother',
        );

        const parent_details = {};
        parent_details['father_details'] = fatherDetails ? {} : null;
        parent_details['mother_details'] = motherDetails ? {} : null;

        if (fatherDetails) {
          parent_details['father_details'] = {};
          parent_details['father_details']['first_name'] =
            fatherDetails.first_name;
          parent_details['father_details']['last_name'] =
            fatherDetails.last_name;
          parent_details['father_details']['mobile'] = fatherDetails.mobile_no;
          parent_details['father_details']['email'] = fatherDetails.email;
          response['parent_type'] = 'Father';
        }

        if (motherDetails) {
          parent_details['mother_details'] = {};
          parent_details['mother_details']['first_name'] =
            motherDetails.first_name;
          parent_details['mother_details']['last_name'] =
            motherDetails.last_name;
          parent_details['mother_details']['mobile'] = motherDetails.mobile_no;
          parent_details['mother_details']['email'] = motherDetails.email;
          response['parent_type'] = 'Mother';
        }

        response['parent_details'] = parent_details;
      }
    }

    if (address && Object.keys(address).length) {
      const residentialDetails = {};
      residentialDetails['current_address'] = {};
      residentialDetails['current_address']['street'] =
        address.street_name ?? null;
      residentialDetails['current_address']['house'] =
        address.house_building_no ?? null;
      residentialDetails['current_address']['landmark'] =
        address.landmark ?? null;
      residentialDetails['current_address']['landmark'] =
        address.landmark ?? null;

      residentialDetails['current_address']['country'] = {};
      residentialDetails['current_address']['country']['id'] =
        address?.country_id ?? null;
      residentialDetails['current_address']['country']['value'] =
        address?.country ?? null;

      residentialDetails['current_address']['state'] = {};
      residentialDetails['current_address']['state']['id'] =
        address?.state_id ?? null;
      residentialDetails['current_address']['state']['value'] =
        address?.state ?? null;

      residentialDetails['current_address']['city'] = {};
      residentialDetails['current_address']['city']['id'] =
        address?.city_id ?? null;
      residentialDetails['current_address']['city']['value'] =
        address?.city ?? null;
      residentialDetails['current_address']['pin_code'] =
        address?.pincode ?? null;

      response['residential_details'] = residentialDetails;
    }

    return response;
  }

  async addDefaultFees(
    req: Request,
    enquiryId: string,
    defaultFees: DefaultFeesDetailDto[],
  ): Promise<void> {
    const enquiryDoc = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDoc) {
      throw new NotFoundException('Enquiry not found');
    }

    const token = req.headers.authorization.split(' ')[1];
    const sessionData =
      (await this.redisInstance?.getData(token)) ?? req.session[token];
    console.log('sessionData-', JSON.stringify(sessionData));

    await Promise.all([
      this.admissionRepository.updateByEnquiryId(enquiryDoc._id, {
        default_fees: [...defaultFees],
      }),
    ]);
    return;
  }

  async sendUpdateAdmissionRequest(
    enquiryId: string,
    enquiryNumber: string,
    req: Request,
    enquiryStages: Record<string, any>[],
    requestType: EChangeAdmissionRequest,
  ) {
    const enquiryDetails = await this.enquiryRepository.getOne({
      _id: new Types.ObjectId(enquiryId),
    });

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const {
      academic_year,
      student_details,
      ivt_date,
      school_location,
      brand,
      board,
      course,
      stream,
      shift,
      ivt_reason,
      guest_student_details,
      other_details,
    } = enquiryDetails;

    const studentDetails = await this.getStudentDetailsByEnrolmentNumber(
      student_details?.enrolment_number,
    );

    if (!studentDetails) {
      throw new HttpException(
        'Student details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const academicYearDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.ACADEMIC_YEAR}/${academic_year?.id}`,
    );

    const searchSchoolResponse = await this.axiosService
      .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
      .setUrl(ADMIN_PANEL_URL.SEARCH_SCHOOL_LIST)
      .setMethod(EHttpCallMethods.POST)
      .setHeaders({
        Authorization: req.headers.authorization,
      } as AxiosRequestHeaders)
      .setBody({
        academic_year_id: [
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
        ],
        school_id: [school_location?.id],
        brand_id: [brand?.id],
        board_id: [board?.id],
        grade_id: [student_details?.grade?.id],
        pageSize: 1,
        page: 1,
      })
      .sendRequest();

    const businessSubVerticalId =
      searchSchoolResponse?.data?.data?.data[0]?.lob_id;

    const payload = {
      academic_year_id:
        +academicYearDetails?.data?.attributes?.short_name_two_digit,
      student_id: studentDetails?.student_details?.id,
      request_type: requestType,
      reason_id: ivt_reason?.id,
      next_lob_id: businessSubVerticalId,
      ...(other_details?.query ? { comment: other_details.query } : {}),
      next_school_id: school_location?.id,
      next_board_id: board?.id,
      next_course_id: course?.id,
      next_shift_id: shift?.id,
      next_stream_id: stream?.id,
      next_grade_id: student_details?.grade?.id,
      ...(other_details?.is_guest_student
        ? { next_host_id: guest_student_details?.location?.id }
        : {}),
      enquiry_id: enquiryId,
      enquiry_number: enquiryNumber,
      applied_on: (ivt_date as Date).toISOString(),
    };

    switch (requestType) {
      case 'admission_10_11_request':
        const ivtDate = new Date(ivt_date);
        ivtDate.setFullYear(ivtDate.getFullYear() + 1);
        payload.applied_on = ivtDate.toISOString();
        break;
      default:
        payload.applied_on = (ivt_date as Date).toISOString();
        break;
    }
    console.log(
      `[update enquiry status][Request type : ${requestType}][stage - ${enquiryStages[enquiryStages.length - 1].status}]`,
    );
    enquiryStages[enquiryStages.length - 1].status =
      EEnquiryStageStatus.INPROGRESS;
    console.log(
      `[update enquiry status][satge : ${enquiryStages}][Enquiry Id - ${enquiryId}]`,
    );

    await this.enquiryRepository.updateById(new Types.ObjectId(enquiryId), {
      enquiry_stages: enquiryStages,
      status: EEnquiryStatus.CLOSED,
    });

    this.loggerService.log(
      `[Change Admission Request][Request type : ${requestType}][Enquiry Id - ${enquiryId}][Payload - ${JSON.stringify(payload)}]`,
    );

    await this.axiosService
      .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
      .setUrl(ADMIN_PANEL_URL.STUDENT_PROCESS_REQUEST)
      .setMethod(EHttpCallMethods.POST)
      .setHeaders({
        Authorization: req.headers.authorization,
      } as AxiosRequestHeaders)
      .setBody(payload)
      .sendRequest();

    console.log(
      `[update student profile : ${enquiryStages}][Enquiry Id - ${enquiryId}]`,
    );
    await this.updateStudentDetail(enquiryId, req);

    console.log(
      `[update student document : ${enquiryDetails?.documents}][Enquiry Id - ${enquiryId}]`,
    );
    await this.axiosService
      .setBaseUrl(this.configService.get<string>('ADMIN_PANEL_URL'))
      .setUrl(ADMIN_API_URLS.MAP_STUDENT_DOCUMENTS)
      .setMethod(EHttpCallMethods.POST)
      .setHeaders({
        Authorization: req.headers.authorization,
      } as AxiosRequestHeaders)
      .setBody({
        student_id: studentDetails?.student_details?.id,
        documents: enquiryDetails?.documents,
      })
      .sendRequest();
    return;
  }
}
