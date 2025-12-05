import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestHeaders } from 'axios';
import * as moment from 'moment';
import { PipelineStage } from 'mongoose';
import { EnquiryTypeRepository } from 'src/feature/enquiryType/enquiryType.repository';

import { EMAIL_TEMPLATE_SLUGS } from '../../../global/global.constant';
import { EmailService } from '../../../global/global.email.service';
import { AxiosService, EHttpCallMethods } from '../../../global/service';
import {
  EMPLOYEE_ACTIVITY_STATUS,
  getCcReHrisCodes,
  LoggerService,
  MDM_API_URLS,
  MdmService,
} from '../../../utils';
import {
  ENQUIRY_TYPE,
  ENQUIRY_TYPE_SLUG,
  GLOBAL_ENQUIRY_GENERATOR_ID,
} from '../../enquiry/enquiry.constant';
import { EnquiryRepository } from '../../enquiry/enquiry.repository';
import { EParentType } from '../../enquiry/enquiry.type';
import { EnquiryHelper } from '../../enquiry/enquiryHelper.service';
import { EnquiryTypeService } from '../../enquiryType/enquiryType.service';
import { MyTaskService } from '../../myTask/myTask.service';
import { ETaskEntityType } from '../../myTask/myTask.type';
import { ExternalEnquiryTypeService } from '../enquiryType/externalEnquiryType.service.';
import {
  KIDS_CLUB_ENQUIRY_TYPE,
  NEW_ADMISSION_ENQUIRY_TYPE,
  PSA_ENQUIRY_TYPE,
} from './externalEnquiry.constant';

@Injectable()
export class ExternalEnquiryService {
  constructor(
    private enquiryHelper: EnquiryHelper,
    private enquiryTypeService: EnquiryTypeService,
    private enquiryTypeRepository: EnquiryTypeRepository,
    private enquiryRepository: EnquiryRepository,
    private mdmService: MdmService,
    private loggerService: LoggerService,
    private emailService: EmailService,
    private myTaskService: MyTaskService,
    private externalEnquiryTypeService: ExternalEnquiryTypeService,
    private axiosService: AxiosService,
    private configService: ConfigService,
  ) {}

  async create(payload: Record<string, any>) {
    // const payload = req.body as any;

    const { metadata, data } = payload;

    let anotherStudentDetail;
    const isAnotherChild = payload?.data?.['is_another_child_enquiry'];
    if (payload?.data?.['is_another_child_enquiry'] === 'yes') {
      anotherStudentDetail = {
        first_name: payload?.data?.['another_student_details.first_name'],
        last_name: payload?.data?.['another_student_details.last_name'],
        dob: payload?.data?.['another_student_details.dob'],
      };
      delete payload?.data['another_student_details.type'];
      delete payload.data['another_student_details.first_name'];
      delete payload.data['another_student_details.last_name'];
      delete payload.data['another_student_details.dob'];
    }
    const { form_id, enquiry_type_id } = metadata;
    const enquiryFormDetails = await this.enquiryHelper.getEnquiryFormDetails(
      form_id,
      '',
    );
    const { inputs: formFields } = enquiryFormDetails;
    const validationObjects =
      this.enquiryHelper.extractValidationObjects(formFields);
    const errors = this.enquiryHelper.validateFormData(data, validationObjects);
    if (Object.keys(errors).length) {
      throw new HttpException('Invalid field value', HttpStatus.BAD_REQUEST, {
        cause: errors,
      });
    }

    const enquiryTypeDetails =
      await this.enquiryTypeService.getEnquiryTypeDetailsWithStageName(
        enquiry_type_id,
      );

    if (!enquiryTypeDetails) {
      throw new HttpException(
        'Invalid enquiry type sent',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { stages, slug } = enquiryTypeDetails;

    const paths = this.enquiryRepository.getSchemaPaths();

    if(data?.school_location?.id && data?.academic_year?.value) {
      const yearId = data.academic_year.value.split('-')[1].trim();
      const getSchoolDetails = await this.mdmService.postDataToAPI(`${MDM_API_URLS.SEARCH_SCHOOL}`, {
         operator: `school_parent_id = ${data.school_location.id} AND academic_year_id = ${yearId} AND grade_id = ${data.student_details.grade.id}`,
      })
      if(getSchoolDetails?.data?.schools[0]?.school_id) {
        data.school_location.id = getSchoolDetails?.data?.schools[0]?.school_id;
      }else{
        throw new HttpException(
          'School location not found',
          HttpStatus.BAD_REQUEST,
        );
      }
    }else{
      throw new HttpException(
        'Invalid school location or year id sent',
        HttpStatus.BAD_REQUEST,
      );
    }

    const asigneeDetails = await this.getAsigneeDetails(
      data['school_location.id'],
    );

    const defaultEnquiryFields =
      await this.enquiryHelper.getDefaultEnquiryFields({
        user_id: asigneeDetails.assigned_to_id,
        user_name: asigneeDetails.assigned_to,
      });
    const createPayload = this.enquiryHelper.generateEnquirySchema(data, paths);

    createPayload.created_by = {
      user_id: asigneeDetails.assigned_to_id,
      user_name: asigneeDetails.assigned_to,
      email: asigneeDetails.assigned_to_email,
    };
    const other_details_ =
      await this.enquiryHelper.checkAndAddNewAdmissionConcessionTags(
        slug,
        createPayload.other_details,
        '',
      );
    createPayload.other_details = other_details_;
    createPayload.other_details['terms_and_conditions_email_sent'] = false; //Setting the flag as false by default
    createPayload.other_details['are_terms_and_condition_accepted'] = false; //Setting the flag as false by default
    createPayload.other_details['external_parent_enquiry'] = true;
    createPayload.enquiry_number = await this.enquiryHelper.getGlobalId(
      GLOBAL_ENQUIRY_GENERATOR_ID,
    );
    let fatherGlobalId = null;
    let motherGlobalId = null;
    let guardianGlobalId = null;
    let parentSsoUsername = null;
    let parentSsoPassword = null;
    switch (data.parent_type) {
      case EParentType.FATHER:
        if (
          createPayload?.parent_details?.father_details?.mobile &&
          createPayload?.parent_details?.father_details?.email
        ) {
          const response = await this.enquiryHelper.getParentGlobalId(
            createPayload.parent_details.father_details.mobile,
            createPayload.parent_details.father_details.email,
            createPayload.parent_details?.father_details?.first_name,
            createPayload.parent_details?.father_details?.last_name,
          );
          fatherGlobalId = response.global_no;
          parentSsoUsername = response.sso_email;
          parentSsoPassword = response.sso_password;
        }
        createPayload.parent_details.father_details.global_id = fatherGlobalId;
        createPayload.parent_details.father_details.sso_username =
          parentSsoUsername;
        createPayload.parent_details.father_details.sso_password =
          parentSsoPassword;
        break;
      case EParentType.MOTHER:
        if (
          createPayload?.parent_details?.mother_details?.mobile &&
          createPayload?.parent_details?.mother_details?.email
        ) {
          const response = await this.enquiryHelper.getParentGlobalId(
            createPayload.parent_details.mother_details.mobile,
            createPayload.parent_details.mother_details.email,
            createPayload.parent_details?.mother_details?.first_name,
            createPayload.parent_details?.mother_details?.last_name,
          );
          motherGlobalId = response.global_no;
          parentSsoUsername = response.sso_email;
          parentSsoPassword = response.sso_password;
        }
        createPayload.parent_details.mother_details.global_id = motherGlobalId;
        createPayload.parent_details.mother_details.sso_username =
          parentSsoUsername;
        createPayload.parent_details.mother_details.sso_password =
          parentSsoPassword;
        break;
      case EParentType.GUARDIAN:
        if (
          createPayload?.parent_details?.guardian_details?.mobile &&
          createPayload?.parent_details?.guardian_details?.email
        ) {
          const response = await this.enquiryHelper.getParentGlobalId(
            createPayload.parent_details.guardian_details.mobile,
            createPayload.parent_details.guardian_details.email,
            createPayload.parent_details?.guardian_details?.first_name,
            createPayload.parent_details?.guardian_details?.last_name,
          );
          guardianGlobalId = response.global_no;
          parentSsoUsername = response.sso_email;
          parentSsoPassword = response.sso_password;
        }
        createPayload.parent_details.guardian_details.global_id =
          guardianGlobalId;
        createPayload.parent_details.guardian_details.sso_username =
          parentSsoUsername;
        createPayload.parent_details.guardian_details.sso_password =
          parentSsoPassword;
        break;
    }

    if (
      createPayload?.student_details?.first_name &&
      createPayload?.student_details?.last_name &&
      createPayload?.student_details?.dob
    ) {
      const studentGlobalId = await this.enquiryHelper.getStudentGlobalId(
        createPayload.student_details.first_name,
        createPayload.student_details.last_name,
        createPayload.student_details.dob,
      );
      createPayload.student_details.global_id = studentGlobalId;
    }

    const response =
      await this.enquiryHelper.getDuplicateEnquiriesCountWhileCreate({
        ...createPayload,
        ...stages,
        ...defaultEnquiryFields,
      });

    if (response.duplicate > 0) {
      return {
        flag: 'duplicate',
        enquiry_id: response.result[0].projectedResults[0]._id.toString(),
        message: `This lead is been already created by ${response.result[0].projectedResults[0].assigned_to}
            with Enquiry No ${response.result[0].projectedResults[0].enquiry_number} for
            ${response.result[0].projectedResults[0].school_location.value}.
            if you click on continue, the owner of the existing lead will be replaced by yours.`,
      };
    }

    let student_slug: string;
    if (
      createPayload?.other_details?.['enquiry_type'] ===
      ENQUIRY_TYPE.NEW_ADMISSION
    ) {
      student_slug = ENQUIRY_TYPE_SLUG.NEW_ADMISSION;
      const newAdmissionEnquiryType = await this.enquiryTypeRepository.getOne({
        slug: NEW_ADMISSION_ENQUIRY_TYPE,
      });
      createPayload.enquiry_type_id = newAdmissionEnquiryType._id;
      createPayload.enquiry_form_id = newAdmissionEnquiryType.enquiry_forms[0];
    } else if (
      createPayload?.other_details?.['enquiry_type'] === ENQUIRY_TYPE.KIDS_CLUB
    ) {
      student_slug = ENQUIRY_TYPE_SLUG.KIDS_CLUB;
      const kidsClubEnquiryType = await this.enquiryTypeRepository.getOne({
        slug: KIDS_CLUB_ENQUIRY_TYPE,
      });
      createPayload.enquiry_type_id = kidsClubEnquiryType._id;
      createPayload.enquiry_form_id = kidsClubEnquiryType.enquiry_forms[0];
    } else if (
      createPayload?.other_details?.['enquiry_type'] === ENQUIRY_TYPE.PSA
    ) {
      student_slug = ENQUIRY_TYPE_SLUG.PSA;
      const psaEnquiryType = await this.enquiryTypeRepository.getOne({
        slug: PSA_ENQUIRY_TYPE,
      });
      createPayload.enquiry_type_id = psaEnquiryType._id;
      createPayload.enquiry_form_id = psaEnquiryType.enquiry_forms[0];
    }

    const responseStudentSlug = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.STUDENT_TAGS}?filters[slug]=${student_slug}`,
    );
    if (responseStudentSlug?.data?.length) {
      createPayload.other_details = {
        ...other_details_,
        student_slug: [...responseStudentSlug.data],
      };
    }
    if (
      createPayload?.academic_year?.value &&
      /^\d{4}-\d{4}$/.test(createPayload?.academic_year?.value)
    ) {
      const [start, end] = createPayload?.academic_year?.value?.split('-');
      createPayload.academic_year.value = `${start} - ${end.slice(-2)}`;
    }

      if (
        (createPayload?.academic_year?.value == '2025 - 26' &&   // quick patch 
          createPayload?.academic_year?.id != 3) ||
        (createPayload?.academic_year?.value == '2026 - 27' &&
          createPayload?.academic_year?.id != 4) ||
        (createPayload?.academic_year?.value == '2027 - 28' &&
          createPayload?.academic_year?.id != 5)
      ) {
        return {};
      }

    const enquiry = await this.enquiryHelper.createEnquiry(
      createPayload,
      stages,
      defaultEnquiryFields,
    );
    if (enquiry.other_details?.['student_slug']?.length) {
      await this.mdmService.postDataToAPI(`${MDM_API_URLS.POST_STUDENT_TAGS}`, {
        data: {
          student_id: null,
          tag_id: enquiry.other_details?.['student_slug'][0]['id'],
          added_on: `${moment(enquiry['created_at']).format('YYYY-MM-DD')}`,
          removed_on: `${moment(enquiry['created_at']).add(1, 'y').format('YYYY-MM-DD')}`,
          is_verified: 1,
          enquiry_id: `${enquiry._id.toString()}`,
        },
      });
    }

    this.loggerService.log(
      `notification sent to ${JSON.stringify(createPayload)}, data:: ${JSON.stringify(data)}`,
    );

    const globalIds = [];
    if (data?.parent_type === 'guardian') {
      globalIds.push(guardianGlobalId);
    } else if (data?.parent_type === 'father') {
      globalIds.push(fatherGlobalId);
    } else {
      globalIds.push(motherGlobalId);
    }

    // below function sends notification
    this.emailService.setEnquiryDetails(enquiry).sendNotification(
      EMAIL_TEMPLATE_SLUGS.ENQUIRY_CREATED,
      {
        enq_no: enquiry.enquiry_number,
        e_signature: '+91 6003000700',
        link: 'https://www.vibgyorhigh.com/',
        username: parentSsoUsername,
        password: parentSsoPassword,
      },
      [
        this.enquiryHelper.getEnquirerDetails(enquiry, 'email')
          ?.email as string,
      ],
    );

    // Create a new task
    const tPlusFiveDate = new Date();
    tPlusFiveDate.setDate(new Date().getDate() + 5);
    tPlusFiveDate.setHours(23, 59, 59, 999);

    await this.myTaskService.createMyTask({
      enquiry_id: enquiry._id.toString(),
      created_for_stage: ETaskEntityType.ENQUIRY,
      valid_from: new Date(),
      valid_till: tPlusFiveDate,
      task_creation_count: 1,
      assigned_to_id: enquiry.assigned_to_id,
    });
    if (isAnotherChild === 'yes') {
      const enquiryNumberAnotherChild = await this.enquiryHelper.getGlobalId(
        GLOBAL_ENQUIRY_GENERATOR_ID,
      );
      const anotherStudentPayload = {
        ...createPayload,
        enquiry_number: enquiryNumberAnotherChild,
        student_details: {
          first_name: anotherStudentDetail.first_name,
          last_name: anotherStudentDetail.last_name,
          dob: anotherStudentDetail.dob,
        },
      };
      if (
        anotherStudentPayload?.academic_year?.value &&
        /^\d{4}-\d{4}$/.test(anotherStudentPayload?.academic_year?.value)
      ) {
        const [start, end] =
          anotherStudentPayload?.academic_year?.value?.split('-');
        anotherStudentPayload.academic_year.value = `${start} - ${end.slice(-2)}`;
      }
      await this.enquiryHelper.createEnquiry(
        anotherStudentPayload,
        stages,
        defaultEnquiryFields,
      );
    }
    return {};
  }

  async getAsigneeDetails(schoolId: number): Promise<{
    assigned_to: string;
    assigned_to_id: number;
    assigned_to_email: string;
  }> {
    const schoolDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.SCHOOL}/${schoolId}`,
    );

    const schoolCode = schoolDetails?.data?.attributes?.code;
    const CCHrisCodes = getCcReHrisCodes().CC;
    const queryParams: (string | number)[][] = CCHrisCodes.map((role) => {
      return [
        'filters[$and][1][hr_hris_unique_role][HRIS_Unique_Role_Code][$in]',
        role,
      ];
    });

    [
      EMPLOYEE_ACTIVITY_STATUS.ACTIVE,
      EMPLOYEE_ACTIVITY_STATUS.SERVING_NOTICE_PERIOD,
    ].forEach((status, index) => {
      queryParams.push([
        `filters[Employment_Status][id][$in][${index}]`,
        status,
      ]);
    });

    // Get list of CC employees
    const response = await this.axiosService
      .setBaseUrl(`${this.configService.get('MDM_URL')}`)
      .setUrl(MDM_API_URLS.HR_EMPLOYEE_MASTER)
      .setMethod(EHttpCallMethods.GET)
      .setQueryStringParams(queryParams)
      .setHeaders({
        Authorization: `Bearer ${this.configService.get('MDM_TOKEN')}`,
      } as AxiosRequestHeaders)
      .sendRequest();

    if (!response?.data?.data?.length) {
      throw new HttpException(
        'Employee list not found against the given role',
        HttpStatus.NOT_FOUND,
      );
    }

    let ccEmployees = null;
    let noOfCcEmployees = 0;

    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NODE_ENV === 'development'
    ) {
      ccEmployees = response?.data?.data;
      // Get total number of CC employees
      noOfCcEmployees = response?.data?.data.length;
    } else {
      ccEmployees = [
        {
          id: 10334,
          attributes: {
            Full_Name: 'Fatima Kunjalavi',
            Official_Email_ID: 'Ps10@vgos.org',
          },
        },
        {
          id: 10338,
          attributes: {
            Full_Name: 'Ravi Agarwal',
            Official_Email_ID: 'Ps14@vgos.org',
          },
        },
        {
          id: 10339,
          attributes: {
            Full_Name: 'Mehek Khetwani',
            Official_Email_ID: 'Ps15@vgos.org',
          },
        },
      ];
      noOfCcEmployees = 3;
    }
    const employeeIds = ccEmployees.map((employeeData) => employeeData.id);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          assigned_to_id: {
            $in: employeeIds,
          },
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
      {
        $limit: 1,
      },
    ];

    // Get the last created enquiry to get which CC employee was assigned to this enquiry
    const lastEnquiriesAssignedToCcEmployees =
      await this.enquiryRepository.aggregate(pipeline);
    const lastEnquiryAssignedToCcEmployees =
      lastEnquiriesAssignedToCcEmployees.length
        ? lastEnquiriesAssignedToCcEmployees[0]
        : null;

    if (!lastEnquiryAssignedToCcEmployees) {
      // Assigned the zeroth index employee of employee array to enquiry
      return {
        assigned_to:
          (ccEmployees[0].attributes?.First_Name ?? '') +
          ' ' +
          (ccEmployees[0].attributes?.Last_Name ?? ''),
        assigned_to_id: ccEmployees[0].id,
        assigned_to_email: ccEmployees[0].attributes.Official_Email_ID,
      };
    }

    // Get the next
    const nextEmployeeIndex =
      ccEmployees.findIndex(
        (employee) =>
          employee.id === lastEnquiryAssignedToCcEmployees.assigned_to_id,
      ) + 1;

    // hash function to get a random index
    const employeeToBeAssignedIndex = nextEmployeeIndex % noOfCcEmployees;
    return {
      assigned_to:
        (ccEmployees[employeeToBeAssignedIndex].attributes.First_Name ?? '') +
        ' ' +
        (ccEmployees[employeeToBeAssignedIndex].attributes.Last_Name ?? ''),
      assigned_to_id: ccEmployees[employeeToBeAssignedIndex].id,
      assigned_to_email:
        ccEmployees[employeeToBeAssignedIndex].attributes.Official_Email_ID,
    };
  }

  async getEnquiryTypesByEnquiryMode(enquiryMode: string) {
    const enquiryTypeData =
      await this.externalEnquiryTypeService.getEnquiryTypeAndFormData(
        enquiryMode,
      );
    return enquiryTypeData;
  }
}
