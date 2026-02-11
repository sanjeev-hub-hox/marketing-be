import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestHeaders } from 'axios';
import { Request } from 'express';
import { Document, Types } from 'mongoose';
import { ADMIN_PANEL_URL } from 'src/global/global.constant';
import { AxiosService, EHttpCallMethods } from 'src/global/service';

import { isAppRequest, MDM_API_URLS, MdmService } from '../../utils';
import { WorkflowActivities } from '../cron/dto/admin.dto';
import { EnquiryRegistrationSchema } from '../enquiry/enquiry.schema';
import { EEnquiryType } from '../enquiry/enquiry.type';
import { EnquiryLogService } from '../enquiryLog/enquiryLog.service';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from '../enquiryLog/enquiryLog.type';
import { EnquiryTypeRepository } from '../enquiryType/enquiryType.repository';
import { OtherParamDto, WorkflowLogsParamDto } from './dto/workflowParam.dto';

@Injectable()
export class WorkflowService {
  constructor(
    private enquiryTypeRepository: EnquiryTypeRepository,
    private axiosService: AxiosService,
    private configService: ConfigService,
    private enquiryLogService: EnquiryLogService,
    private mdmService: MdmService,
  ) {}
  async getWorkflowById(
    id: Types.ObjectId,
    stage: string,
    req: Request,
  ): Promise<WorkflowActivities> {
    const token = req.headers.authorization;
    const isCrossPlatformRequest = isAppRequest(req);
    const workflowDoc = await this.axiosService
      .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
      .setMethod(EHttpCallMethods.GET)
      .setHeaders({ Authorization: token } as AxiosRequestHeaders)
      .setUrl(
        `${ADMIN_PANEL_URL.GET_MASTER_DETAILS}?type=Workflows&subType=Marketing workflows`,
      )
      .isCrossPlatformRequest(isCrossPlatformRequest)
      .sendRequest();
    if (workflowDoc.status !== HttpStatus.OK) {
      throw new NotFoundException();
    }
    const stageWorkflows = workflowDoc.data.data.find(
      (workflow) => workflow.stage.toLowerCase() === stage.toLowerCase(),
    );
    const workflowActivity = stageWorkflows.workflow_activities.find(
      (workflow) => id.equals(workflow._id),
    );

    return workflowActivity;
  }

  async sendWorkflowRequest(
    other_params: OtherParamDto,
    enquiry: Partial<EnquiryRegistrationSchema & Document>,
    stage_name: string,
    req: Request,
  ) {
    console.log('inside sendWorkflowRequest');
    
    const stages = enquiry.enquiry_stages.find(
      (data) => data.stage_name.toLowerCase() === stage_name.toLowerCase(),
    );

    console.log('stages sendWorkflowRequest-',stages);

    const enquiryType = await this.enquiryTypeRepository.getById(
      enquiry.enquiry_type_id as Types.ObjectId,
    );

    console.log('enquiryType sendWorkflowRequest-',enquiryType);

    if (!enquiryType || !enquiryType?.stages) {
      throw new BadRequestException(
        `Enquiry type not found of id :: ${enquiry.enquiry_type_id}`,
      );
    }

    const isWorkflowTestExist = enquiryType.stages.find((d) =>
      d.stage_id.equals(stages.stage_id),
    );
    console.log('isWorkflowTestExist sendWorkflowRequest-',isWorkflowTestExist);

    if (!isWorkflowTestExist || !isWorkflowTestExist.workflow) {
      throw new BadRequestException(
        `EnquiryType :: Competency test or workflow missing in enquiry type id :: ${enquiry.enquiry_type_id}`,
      );
    }

    const workflow = await this.getWorkflowById(
      isWorkflowTestExist.workflow,
      stage_name,
      req,
    );
    console.log('workflow sendWorkflowRequest-',workflow);

    if (!workflow) {
      throw new NotFoundException(
        `Workflow :: workflow  id not found :: ${isWorkflowTestExist.workflow}`,
      );
    }

    const academicYearDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.ACADEMIC_YEAR}/${enquiry?.academic_year?.id}`,
    );
    console.log('workflow academicYearDetails-',academicYearDetails);

    // Get the LOB segment ids based on school Id and academic year id (short name two digit code)
    const lobResponse = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.SCHOOL_BRAND}`,
      [
        [`filters[school_id]`, enquiry?.school_location?.id],
        [
          `filters[academic_year_id]`,
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
        ],
        ['fields[0]', 'lob_id'],
      ],
    );
    console.log('workflow lobResponse-',lobResponse);

    if (!lobResponse?.data.length) {
      throw new HttpException('LOB Ids not found', HttpStatus.NOT_FOUND);
    }

    const businessSubSubVerticalIdPayload = lobResponse?.data.map(
      (lob, index) => {
        return [
          `filters[Base_Location][Base_Sub_Location][id][$in][${index}]`,
          lob?.attributes?.lob_id,
        ];
      },
    );
    console.log('workflow businessSubSubVerticalIdPayload-',businessSubSubVerticalIdPayload);

    // Get the Business sub vertical Id based on Lob segment ids
    const businessSubVerticalResponse = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.HR_EMPLOYEE_MASTER}`,
      [
        ['populate[0]', 'Base_Location'],
        ['populate[Base_Location][populate]', 'Base_Location'],
        ['fields[0]', 'id'],
        ...businessSubSubVerticalIdPayload,
      ],
    );
    console.log('workflow businessSubVerticalResponse-',businessSubVerticalResponse);

    if (!businessSubVerticalResponse?.data?.length) {
      throw new HttpException(
        'Business sub vertical Ids not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const businessSubVerticalId =
      businessSubVerticalResponse?.data[0]?.attributes?.Base_Location?.data
        ?.attributes?.Base_Location?.data?.id;

    const userId = enquiry.created_by.user_id;

    const param: WorkflowLogsParamDto = {
      ...other_params,
      activity_slug: `${workflow.activity_slug}`,
      module_name: `${workflow.module_name}`,
      module_id: `${enquiry._id}`,
      reference_id: `${enquiry.enquiry_number}`,
      attachment_links: [],
      lob_id: `${businessSubVerticalId}`,
      redirection_link: `${this.configService.get<string>('MARKETING_FRONTEND_URL')}/enquiries/view/${enquiry._id}`,
    };

    console.log('WorkflowLogsParamDto sendWorkflowRequest-',param);

    const isCrossPlatformRequest = isAppRequest(req);
    const workflowResponse = await this.axiosService
      .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
      .setMethod(EHttpCallMethods.POST)
      .isCrossPlatformRequest(isCrossPlatformRequest)
      .setHeaders({
        Authorization: req.headers.authorization,
      } as AxiosRequestHeaders)
      .setUrl(`${ADMIN_PANEL_URL.POST_WORKFLOW_LOGS}/${userId}`)
      .setBody(param)
      .sendRequest();
    console.log('workflow workflowResponse-',workflowResponse);

    await this.enquiryLogService.createLog({
      enquiry_id: new Types.ObjectId(enquiry._id.toString()),
      event_type: EEnquiryEventType.ADMISSION,
      event_sub_type: EEnquiryEventSubType.ADMISSION_ACTION,
      event: EEnquiryEvent.ADMISSION_APPROVAL_PENDING,
      created_by: 'System',
      created_by_id: -1,
    });
    return workflowResponse;
  }

  async triggerWorkflow(
    enquiryDetails: Record<string, any>,
    additionalDetails: Record<string, any> = null,
    req: Request,
  ) {
    const {
      academic_year,
      school_location,
      brand,
      board,
      course,
      stream,
      shift,
      student_details,
      previousEnrolmentDetails,
    } = enquiryDetails;
    switch (enquiryDetails.other_details.enquiry_type) {
      case EEnquiryType.NEW_ADMISSION:
        const param: OtherParamDto = {
          subject_variables: {
            student_name: `${enquiryDetails?.student_details.first_name} ${enquiryDetails?.student_details.first_name}`,
          },
          description_variables: {
            student_name: `${enquiryDetails.student_details.first_name} ${enquiryDetails.student_details.last_name}`,
            enrolment_number: student_details?.enrolment_number,
            enquiry_number: enquiryDetails?.enquiry_number,
            academic_year: academic_year?.value,
            school_location: school_location?.value,
            brand: brand?.value,
            board: board?.value,
            grade: student_details?.grade?.value,
            course: course?.value,
            stream: stream?.value,
            shift: shift?.value,
            result: additionalDetails?.status,
          },
        };
console.log('param1-', JSON.stringify(param));

        await this.sendWorkflowRequest(
          param,
          enquiryDetails,
          EEnquiryEventType.COMPETENCY_TEST,
          req,
        );
        break;
      case EEnquiryType.PSA:
        const psaWorkflowParams: OtherParamDto = {
          subject_variables: {
            enquiryId: `${enquiryDetails._id}`,
          },
          description_variables: {
            enquiryId: `${enquiryDetails._id}`,
            student_name: `${enquiryDetails.student_details.first_name} ${enquiryDetails.student_details.last_name}`,
            sub_type: `${enquiryDetails.psa_sub_type.value}`,
            category: `${enquiryDetails.psa_category.value}`,
            sub_category: `${enquiryDetails.psa_sub_category.value}`,
            period_of_service: `${enquiryDetails?.period_of_service.value}`,
            batch: `${enquiryDetails.psa_batch.value}`,
          },
        };
        await this.sendWorkflowRequest(
          psaWorkflowParams,
          enquiryDetails,
          EEnquiryEventType.ENQUIRY,
          req,
        );
        break;
      case EEnquiryType.KIDS_CLUB:
        const kidsClubParams: OtherParamDto = {
          subject_variables: {
            enquiryId: `${enquiryDetails._id}`,
          },
          description_variables: {
            enquiryId: `${enquiryDetails._id}`,
            student_name: `${enquiryDetails.student_details.first_name} ${enquiryDetails.student_details.last_name}`,
          },
        };
        await this.sendWorkflowRequest(
          kidsClubParams,
          enquiryDetails,
          EEnquiryEventType.ENQUIRY,
          req,
        );
        break;
      case EEnquiryType.ADMISSION_10_11:
      case EEnquiryType.IVT:

        const {
          school_location: earlier_school_location,
          academic_year: earlier_academic_year,
          brand: earlier_brand,
          board: earlier_board,
          student_details: earlier_student_details,
          course: earlier_course,
          stream: earlier_stream,
          shift: earlier_shift,
        } = previousEnrolmentDetails;
        const ivtApprovalParams: OtherParamDto = {
          subject_variables: {
            enquiry_number: `${enquiryDetails.enquiry_number}`,
          },
          description_variables: {
            enquiryId: `${enquiryDetails._id}`,
            student_name: `${enquiryDetails.student_details.first_name} ${enquiryDetails.student_details.last_name}`,
            enrolment_number: student_details?.enrolment_number,
            academic_year: academic_year?.value,
            school_location: school_location?.value,
            brand: brand?.value,
            board: board?.value,
            grade: student_details?.grade?.value,
            course: course?.value,
            stream: stream?.value,
            shift: shift?.value,
            earlier_academic_year: earlier_academic_year?.value,
            earlier_school_location: earlier_school_location?.value,
            earlier_brand: earlier_brand?.value,
            earlier_board: earlier_board?.value,
            earlier_grade: earlier_student_details?.grade?.value,
            earlier_course: earlier_course?.value,
            earlier_stream: earlier_stream?.value,
            earlier_shift: earlier_shift?.value,
          },
        };
        console.log('param2-', JSON.stringify(param));

        await this.sendWorkflowRequest(
          ivtApprovalParams,
          enquiryDetails,
          EEnquiryEventType.REGISTRATION,
          req,
        );
        break;
      case EEnquiryType.READMISSION:
        const {
          academic_year: readmission_academic_year,
          school_location: readmission_school_location,
          brand: readmission_brand,
          board: readmission_board,
          course: readmission_course,
          stream: readmission_stream,
          shift: readmission_shift,
          student_details: readmission_student_details,
          previousEnrolmentDetails: readmission_previousEnrolmentDetails,
        } = enquiryDetails;

        const {
          school_location: previous_school_location,
          academic_year: previous_academic_year,
          brand: previous_brand,
          board: previous_board,
          student_details: previous_student_details,
          course: previous_course,
          stream: previous_stream,
          shift: previous_shift,
        } = readmission_previousEnrolmentDetails;
        const readmissionApprovalParams: OtherParamDto = {
          subject_variables: {
            enquiry_number: `${enquiryDetails.enquiry_number}`,
          },
          description_variables: {
            enquiryId: `${enquiryDetails._id}`,
            student_name: `${enquiryDetails.student_details.first_name} ${enquiryDetails.student_details.last_name}`,
            enrolment_number: readmission_student_details?.enrolment_number,
            academic_year: readmission_academic_year?.value,
            school_location: readmission_school_location?.value,
            brand: readmission_brand?.value,
            board: readmission_board?.value,
            grade: readmission_student_details?.grade?.value,
            course: readmission_course?.value,
            stream: readmission_stream?.value,
            shift: readmission_shift?.value,
            earlier_academic_year: previous_academic_year?.value,
            earlier_school_location: previous_school_location?.value,
            earlier_brand: previous_brand?.value,
            earlier_board: previous_board?.value,
            earlier_grade: previous_student_details?.grade?.value,
            earlier_course: previous_course?.value,
            earlier_stream: previous_stream?.value,
            earlier_shift: previous_shift?.value,
          },
        };
        await this.sendWorkflowRequest(
          readmissionApprovalParams,
          enquiryDetails,
          EEnquiryEventType.REGISTRATION,
          req,
        );
        break;
    }
  }
}
