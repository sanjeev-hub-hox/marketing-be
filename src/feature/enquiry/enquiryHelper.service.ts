import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestHeaders } from 'axios';
import { EnquiryRepository } from './enquiry.repository';
import { Types, Document } from 'mongoose';
import {
  EEnquiryAdmissionType,
  EEnquiryStageStatus,
  EFeeType,
  EParentType,
  EWorklflowTriggerEnquiryStages,
  RoundRobinAssignedStatus,
  TEnquirerDetails,
} from './enquiry.type';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from '../enquiryLog/enquiryLog.type';
import { EnquiryLogService } from '../enquiryLog/enquiryLog.service';
import { LoggerService, MDM_API_URLS, MdmService, NOTIFICATION_API_URLS, SERVICE_NAME, isAppRequest } from '../../utils';
import {
  APPLICATION_ID,
  PARENT_USER_TYPE,
  SERVICE_ID,
  DOCUMENT_TYPE,
  STUDENT_USER_TYPE,
} from './enquiry.constant';
import * as moment from 'moment';
import { AxiosService, EHttpCallMethods } from '../../global/service';
import {
  ADMIN_PANEL_URL,
  FINANCE_API_URLS,
} from '../../global/global.constant';
import { OtherParamDto } from '../workflow/dto/workflowParam.dto';
import { WorkflowService } from '../workflow/workflow.service';
import { AuditLogRepository, HTTP_METHODS, RedisService } from 'ampersand-common-module';
import { EnquiryDocument } from './enquiry.schema';
import { EnquiryType } from '../enquiryType/enquiryType.schema';
import { EnquiryDetails } from './dto/mergeEnquiry.dto';
import { CCANDRE } from './defaultValues';

@Injectable()
export class EnquiryHelper {
  constructor(
    private configService: ConfigService,
    private enquiryRepository: EnquiryRepository,
    private enquiryLogService: EnquiryLogService,
    private axiosService: AxiosService,
    private mdmService: MdmService,
    private loggerService: LoggerService,
    private workflowService: WorkflowService,
    private auditLogRepository: AuditLogRepository,
    @Inject('REDIS_INSTANCE') private redisInstance: RedisService
  ) { }

  async getEnquiryFormDetails(formId: string, token: string) {
    const response = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: `${this.configService.get<string>('ADMIN_PANEL_URL')}form-builder/form/${formId}/id?interservice=true`,
      headers: {
        accept: '*/*',
        Authorization: token
      },
    });
    if (response.status !== HttpStatus.OK) {
      throw new HttpException('Form details not found', HttpStatus.NOT_FOUND);
    }

    return response.data.data.length ? response.data.data[0] : [];
  }

  extractValidationObjects(formFields: any): { [key: string]: any[] }[] {
    return (
      formFields?.map((input: any) => ({
        [input['input_field_name']]: input.validations,
      })) || []
    );
  }

  validateField(value: string, validations: any): string | null {
    for (const validation of validations) {
      if (validation.validation) {
        switch (validation.type) {
          case 'is_required':
            if (!value.trim()) {
              return validation.errorMessage || 'Field is required';
            }
            break;
          case 'numeric':
            if (typeof value !== 'number') {
              return validation.errorMessage || 'Field must be numeric';
            }
            break;
          case 'alphanumeric':
            if (!/^[a-zA-Z0-9]+$/.test(value)) {
              return validation.errorMessage || 'Field must be alphanumeric';
            }
            break;
          case 'email':
            if (!/\S+@\S+\.\S+/.test(value)) {
              return validation.errorMessage || 'Enter a valid email';
            }
            break;
          case 'mobile_no':
            if (!/^\d{10}$/.test(value)) {
              return validation.errorMessage || 'Enter a valid mobile number';
            }
            break;
          case 'range':
            if (
              validation.min !== undefined &&
              Number(value) < validation.min
            ) {
              return (
                validation.errorMessage ||
                `Field must be greater than ${validation.min}`
              );
            }
            if (
              validation.max !== undefined &&
              Number(value) > validation.max
            ) {
              return (
                validation.errorMessage ||
                `Field must be less than ${validation.max}`
              );
            }
            break;
          case 'is_hidden':
            break;
          case 'regex':
            break;
          case 'readonly':
            break;
          case 'systemDate':
            break;
          default:
            return `Validation type '${validation.type}' not supported`;
        }
      }
    }
    return null; // Field is valid
  }

  validateFormData(
    data: Record<string, any>,
    validationObjects: Record<string, any>[],
  ): Record<string, any> | {} {
    const errors = {};
    validationObjects.forEach((validationObject) => {
      for (const field in validationObject) {
        if (
          validationObject.hasOwnProperty(field) &&
          data.hasOwnProperty(field)
        ) {
          const fieldValue = data[field];
          const fieldValidations = validationObject[field];
          const errorMessage = this.validateField(fieldValue, fieldValidations);
          if (errorMessage) {
            errors[field] = errorMessage;
          }
        }
      }
    });
    return errors;
  }

  isArrayField(fieldName: string) {
    const regex = /(\w+)\.\[(\d+)\]\.(\w+)/;
    const matches = fieldName.match(regex);
    return matches;
  }

  // NOTE: This function handles only single dimension array
  checkArrayFieldAndHandle(createPayload, arrayKey: string[], value: any) {
    const mainKey = arrayKey[1];
    const index = +arrayKey[2];
    const subKey = arrayKey[3];

    if (!createPayload[mainKey]) {
      createPayload[mainKey] = [];
    }

    if (!createPayload[mainKey][index]) {
      while (createPayload[mainKey].length <= index) {
        createPayload[mainKey].push({ id: index + 1 });
      }
    }
    createPayload[mainKey][index][subKey] = value;
  }

  generateEnquirySchema(
    inputData: any,
    schemaPaths: string[],
    otherData: any = {},
  ) {
    const createPayload = {
      other_details: {},
      ...JSON.parse(JSON.stringify(otherData)),
    };
    for (const inputField in inputData) {
      const isArrayField = this.isArrayField(inputField);
      if (isArrayField) {
        this.checkArrayFieldAndHandle(
          createPayload,
          isArrayField,
          inputData[inputField],
        );
        continue;
      }

      const fieldParts = inputField.split('.');
      if (fieldParts.length === 1) {
        if (schemaPaths.includes(fieldParts[0])) {
          createPayload[inputField] = inputData[inputField];
        } else {
          createPayload['other_details'][inputField] = inputData[inputField];
        }
      } else {
        let currentObject = createPayload;
        for (let i = 0; i < fieldParts.length; i++) {
          let key = fieldParts[i];
          if (i === fieldParts.length - 1) {
            currentObject[key] = inputData[inputField];
          } else if (currentObject[key]) {
            currentObject = { ...currentObject };
            currentObject = currentObject[key];
          } else {
            currentObject[key] = {};
            currentObject = currentObject[key];
          }
        }
      }
    }
    return createPayload;
  }

  async getUserListByRoleId(roleId: number) {
    const result = await axios.get(
      `${this.configService.get<string>('MDM_URL')}/api/rbac-roles/${roleId}/user`,
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('MDM_TOKEN')}`,
        },
      },
    );
    return result.data.data;
  }

  getUserLeadCount(
    userList: { id: number }[],
    dbAssignedToCount: { _id: number; count: number }[],
  ): { userId: number; leadCount: number }[] {
    const userLeadCountMap: { userId: number; leadCount: number }[] = [];
    for (const user of userList) {
      let isAlreadyAssigned = false;
      for (const dbCount of dbAssignedToCount) {
        if (user.id === dbCount._id) {
          isAlreadyAssigned = true;
          userLeadCountMap.push({
            userId: user.id,
            leadCount: dbCount.count,
          });
        }
      }
      if (!isAlreadyAssigned) {
        userLeadCountMap.push({
          userId: user.id,
          leadCount: 0,
        });
      }
    }
    return userLeadCountMap;
  }

  async getAssignedToUser(payload: any) {
    let previouslyAssignedFilter = {};
    if (
      payload['parent_details.father_details.mobile'] &&
      payload['parent_details.father_details.email']
    ) {
      previouslyAssignedFilter = {
        'parent_details.father_details.mobile':
          payload['parent_details.father_details.mobile'],
        'parent_details.father_details.email':
          payload['parent_details.father_details.email'],
      };
    } else if (
      payload['parent_details.mother_details.mobile'] &&
      payload['parent_details.mother_details.email']
    ) {
      previouslyAssignedFilter = {
        'parent_details.mother_details.mobile':
          payload['parent_details.mother_details.mobile'],
        'parent_details.mother_details.email':
          payload['parent_details.mother_details.email'],
      };
    } else if (
      payload['parent_details.guardian_details.mobile'] &&
      payload['parent_details.guardian_details.email']
    ) {
      previouslyAssignedFilter = {
        'parent_details.guardian_details.mobile':
          payload['parent_details.guardian_details.mobile'],
        'parent_details.guardian_details.email':
          payload['parent_details.guardian_details.email'],
      };
    }
    const [lastRecentEnquiry, previouslyAssigned, assigneeList] =
      await Promise.all([
        this.enquiryRepository.aggregate([
          {
            $sort: {
              created_at: -1,
            },
          },
          {
            $project: {
              assigned_to_id: 1,
              assigned_to: 1,
            },
          },
        ]),
        this.enquiryRepository.getOne(previouslyAssignedFilter),
        this.getUserListByRoleId(2),
      ]);

    if (previouslyAssigned) {
      // If previously a lead is assigned with a given mobile and email, then assigning this lead to that user
      return {
        assigned_to_id: previouslyAssigned.assigned_to_id,
        assigned_to: previouslyAssigned.assigned_to,
      };
    }
    // Round robin logic to assign assigned_to value
    // Assigning the same assignee to this enquiry as the previous one in case of no assignees found in the assignee list
    if (!assigneeList.length) {
      return {
        assigned_to_id: lastRecentEnquiry[0].assigned_to_id,
        assigned_to: lastRecentEnquiry[0].assigned_to,
      };
    }
    const index = assigneeList
      .map((user) => user.id)
      .indexOf(lastRecentEnquiry[0].assigned_to_id);
    if (index === -1) {
      return {
        assigned_to_id: lastRecentEnquiry[0].assigned_to_id,
        assigned_to: lastRecentEnquiry[0].assigned_to,
      };
    } else if (index === assigneeList.length - 1) {
      return {
        assigned_to_id: assigneeList[0].id,
        assigned_to: assigneeList[0].first_name + assigneeList[index].last_name,
      };
    }
    return {
      assigned_to_id: assigneeList[index + 1].id,
      assigned_to:
        assigneeList[index + 1].first_name + assigneeList[index + 1].last_name,
    };
  }

  async getDocumentListFromMDM() {
    const response = await axios.get(
      `${this.configService.get<string>('MDM_URL')}/api/ad-documents`,
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('MDM_TOKEN')}`,
        },
      },
    );
    return response.data.data.length ? response.data.data : [];
  }

  async getDefaultEnquiryFields(createdByDetails): Promise<any> {
    const defaultFields = {};
    const [enquiryDocuments] = await Promise.all([
      this.getDocumentListFromMDM(),
    ]);
    defaultFields['documents'] = enquiryDocuments.map((document) => ({
      document_id: document.id,
      document_name: document?.attributes?.name,
      file: null,
      is_verified: false,
      is_deleted: false,
      is_mandatory: document?.attributes?.is_mandatory,
      stage: document?.attributes?.stage,
    }));
    return {
      ...defaultFields,
      assigned_to_id: createdByDetails?.user_id ?? -1,
      assigned_to: createdByDetails?.user_name ?? 'N/A',
    };
  }

  async getGlobalId(id: number) {
    const response = await axios.post(
      `${this.configService.get<string>('MDM_URL')}${MDM_API_URLS.GLOBAL_ID_GENERATOR(id)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('MDM_TOKEN')}`,
        },
      },
    );
    return response?.data?.data?.number ?? null;
  }

  async getParentGlobalId(
    mobileNumber: string,
    email: string,
    firstName?: string,
    lastName?: string,
  ) {
    this.loggerService.log(
      `API call to generate parent global Id (URL : ${this.configService.get<string>('MDM_URL')}${MDM_API_URLS.GLOBAL_USER}) called with request body: ${JSON.stringify(
        {
          user_type: PARENT_USER_TYPE,
          mobile_no: mobileNumber,
          email: email,
          application_id: APPLICATION_ID,
          service_id: SERVICE_ID,
          ...(firstName ? { first_name: firstName } : {}),
          ...(lastName ? { last_name: lastName } : {}),
        },
      )}`,
    );

    const response = await axios.post(
      `${this.configService.get<string>('MDM_URL')}${MDM_API_URLS.GLOBAL_USER}`,
      {
        user_type: PARENT_USER_TYPE,
        mobile_no: mobileNumber,
        email: email,
        application_id: APPLICATION_ID,
        service_id: SERVICE_ID,
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName ? { last_name: lastName } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('MDM_TOKEN')}`,
        },
      },
    );

    this.loggerService.log(
      `Response of create parent global Id API is ${JSON.stringify(response?.data)}`,
    );
    return {
      global_no: response?.data?.data[0]?.global_number ?? null,
      sso_email: response?.data?.data[0]?.email ?? null,
      sso_password: response?.data?.data[0]?.sso_password ?? null,
    }
  }

  async getStudentGlobalId(firstName: string, lastName: string, dob: string) {
    this.loggerService.log(
      `API call to generate student global Id (URL : ${this.configService.get<string>('MDM_URL')}${MDM_API_URLS.GLOBAL_USER}) called with request body: ${JSON.stringify(
        {
          user_type: STUDENT_USER_TYPE,
          first_name: firstName,
          last_name: lastName,
          dob: moment(new Date(dob)).format('DD-MM-YYYY'),
          application_id: APPLICATION_ID,
          service_id: SERVICE_ID,
        },
      )}`,
    );

    const response = await axios.post(
      `${this.configService.get<string>('MDM_URL')}${MDM_API_URLS.GLOBAL_USER}`,
      {
        user_type: STUDENT_USER_TYPE,
        first_name: firstName,
        last_name: lastName,
        dob: moment(new Date(dob)).format('DD-MM-YYYY'),
        application_id: APPLICATION_ID,
        service_id: SERVICE_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('MDM_TOKEN')}`,
        },
      },
    );
    this.loggerService.log(
      `Response of create student global Id API is ${JSON.stringify(response?.data)}`,
    );
    return response?.data?.data[0]?.global_number ?? null;
  }

  getEnquiryName(enquiry: any): string {
    const firstName = enquiry.student_details.first_name ?? '';
    const lastName = enquiry.student_details.last_name ?? '';
    const enquiryName =
      Array.isArray(enquiry?.enquiry_type_details) &&
        enquiry?.enquiry_type_details.length
        ? enquiry.enquiry_type_details[0].name
        : '';
    return firstName + ' ' + lastName + '(' + enquiryName + ')';
  }

  getSimilarEnquiryName(enquiry: Partial<EnquiryDetails>): string {
    const firstName = enquiry.student_details.first_name ?? '';
    const lastName = enquiry.student_details.last_name ?? '';
    let enquiryTypeName =
      Array.isArray(enquiry?.enquiry_type_details) &&
        enquiry?.enquiry_type_details.length
        ? enquiry.enquiry_type_details[0].name
        : '';
    if (enquiryTypeName.includes('-')) {
      enquiryTypeName = ` - ${enquiryTypeName.split('-')[1]}`
    }
    const enquiryName = '' + enquiry.enquiry_number
    return firstName + ' ' + lastName + '(' + enquiryName + enquiryTypeName + ')';
  }

  getDummyMobileNo(mobile: number) {
    let id = mobile.toString();
    let paddedId = (id + '0000000000').slice(0, 10);
    return paddedId;
  }

  async getDuplicateEnquiriesCount(enquiryDetails: any) {
    const { _id, enquiry_type_id, student_details, status, school_location } =
      enquiryDetails;
    const { first_name, last_name, dob } = student_details;
    const { id: school_location_id } = school_location;

    const pipeline: any = [
      {
        $match: {
          _id: {
            $ne: _id,
          },
          enquiry_type_id: enquiry_type_id,
          'student_details.first_name': first_name,
          'student_details.last_name': last_name,
          'student_details.dob': dob,
          status: status,
          ...(school_location?.id
            ? { 'school_location.id': school_location.id }
            : {}),
        },
      },
    ];
    if (enquiryDetails?.grade) {
      pipeline[0].$match['grade.id'] = enquiryDetails?.grade.id;
    }
    if (enquiryDetails?.board) {
      pipeline[0].$match['board.id'] = enquiryDetails?.board.id;
    }

    pipeline.push({
      $count: 'duplicate_count',
    });

    const result = await this.enquiryRepository.aggregate(pipeline);
    return result[0]?.duplicate_count ?? 0;
  }

  async getDuplicateEnquiriesCountWhileCreate(enquiryDetails: any) {
    const { enquiry_type_id, student_details, school_location, parent_details, other_details } =
      enquiryDetails;

    // const contactDetails = {};
    // switch (other_details.parent_type) {
    //   case EParentType.FATHER:
    //     contactDetails['mobile'] = parent_details?.father_details?.mobile;
    //     contactDetails['email'] = parent_details?.father_details?.email;
    //     break;
    //   case EParentType.MOTHER:
    //     contactDetails['mobile'] = parent_details?.mother_details?.mobile;
    //     contactDetails['email'] = parent_details?.mother_details?.email;
    //     break;
    //   case EParentType.GUARDIAN:
    //     contactDetails['mobile'] = parent_details?.guardian_details?.mobile;
    //     contactDetails['email'] = parent_details?.guardian_details?.email;
    //     break;
    // }
    
    const pipeline: any = [
      {
        $match: {
          enquiry_type_id:new Types.ObjectId(enquiry_type_id),
          'student_details.first_name': { $regex: student_details?.first_name, $options: "i" },
          ...(student_details?.last_name ? { 'student_details.last_name': { $regex: student_details?.last_name, $options: "i" } }: {}),
          ...(student_details?.dob ? { 'student_details.dob': student_details?.dob } : {}),
          'academic_year.id': enquiryDetails?.academic_year?.id
        },
      },
      {
        $facet: {
          duplicateCount: [{ $count: 'duplicate_count' }],
          projectedResults: [{
            $project: {
              _id: 1,
              enquiry_number: 1,
              school_location: 1,
              assigned_to: 1,
              assigned_to_id: 1
            }
          }],
        },
      },
    ];
    if (enquiryDetails?.grade) {
      pipeline[0].$match['grade.id'] = enquiryDetails?.grade.id;
    }
    if (enquiryDetails?.board) {
      pipeline[0].$match['board.id'] = enquiryDetails?.board.id;
    }

    // pipeline.push({
    //   $count: 'duplicate_count'
    // });

    const result = await this.enquiryRepository.aggregate(pipeline);
    const duplicate = result[0].duplicateCount[0]?.duplicate_count ?? 0;
    return { duplicate, result }
  }

  async getSimilarEnquiriesByEnquirerGlobalId(
    parentDetails: any,
    parentType: string,
    enquiryId: string,
    project?: Record<string, number>,
  ) {
    const similarEnquiriesQuery: any = [
      {
        $match: {
          _id: {
            $ne: new Types.ObjectId(enquiryId),
          },
        },
      },
    ];
    switch (parentType.toLowerCase()) {
      case 'father':
        similarEnquiriesQuery[0].$match[
          'parent_details.father_details.global_id'
        ] = parentDetails.father_details.global_id;
        break;
      case 'mother':
        similarEnquiriesQuery[0].$match[
          'parent_details.mother_details.global_id'
        ] = parentDetails.mother_details.global_id;
        break;
      case 'guardian':
        similarEnquiriesQuery[0].$match[
          'parent_details.guardian_details.global_id'
        ] = parentDetails.guardian_details.global_id;
        break;
    }

    if (project) {
      similarEnquiriesQuery.push(project);
    }

    const enquiries = await this.enquiryRepository.aggregate(
      similarEnquiriesQuery,
    );
    return enquiries;
  }

  async createEnquiry(
    enquiryPayload: Record<string, unknown>,
    enquiryStage: Record<string, unknown>[],
    defaultEnquiryFields: Record<string, unknown>,
  ) {
    const firstChildEnquiry =
      await this.enquiryRepository.create(enquiryPayload);

    const updatedStages = enquiryStage.map((stage) => ({
      stage_id: new Types.ObjectId(stage.stage_id as string),
      stage_name: stage.stage_name,
      status:
        stage?.stage_name === 'Enquiry' || stage?.stage_name === 'enquiry'
          ? EEnquiryStageStatus.INPROGRESS
          : EEnquiryStageStatus.OPEN,
    }));

    await Promise.all([
      this.enquiryRepository.updateById(firstChildEnquiry._id, {
        enquiry_stages: updatedStages,
        ...defaultEnquiryFields,
      }),
      this.enquiryLogService.createLog({
        enquiry_id: firstChildEnquiry._id,
        event_type: EEnquiryEventType.ENQUIRY,
        event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
        event: EEnquiryEvent.ENQUIRY_CREATED,
        created_by: defaultEnquiryFields.assigned_to,
        created_by_id: Number(defaultEnquiryFields.assigned_to_id) ?? 1,
      }),
    ]);

    if (
      (firstChildEnquiry.other_details as any)?.another_child_enquiry === 'yes'
    ) {
      const secondChildEnquiryDetails = JSON.parse(
        JSON.stringify(enquiryPayload),
      );

      // secondChildEnquiryDetails.student_details.first_name =
      //   secondChildEnquiryDetails?.another_student_details.first_name;
      // secondChildEnquiryDetails.student_details.last_name =
      //   secondChildEnquiryDetails?.another_student_details.last_name;
      // secondChildEnquiryDetails.student_details.grade =
      //   secondChildEnquiryDetails?.another_student_details.grade;
      // secondChildEnquiryDetails.student_details.gender =
      //   secondChildEnquiryDetails?.another_student_details.gender;
      // secondChildEnquiryDetails.student_details.eligible_grade =
      //   secondChildEnquiryDetails?.another_student_details.eligible_grade;

      if (
        (firstChildEnquiry.other_details as any)?.another_child_enquiry ===
        'yes'
      ) {
        const secondChildEnquiryDetails = JSON.parse(
          JSON.stringify(enquiryPayload),
        );

        secondChildEnquiryDetails.student_details.first_name = (
          firstChildEnquiry as any
        )?.another_student_details.first_name;
        secondChildEnquiryDetails.student_details.last_name = (
          firstChildEnquiry as any
        )?.another_student_details.last_name;
        secondChildEnquiryDetails.student_details.grade = (
          firstChildEnquiry as any
        )?.another_student_details.grade;
        secondChildEnquiryDetails.student_details.gender = (
          firstChildEnquiry as any
        )?.another_student_details.gender;
        secondChildEnquiryDetails.student_details.eligible_grade = (
          firstChildEnquiry as any
        )?.another_student_details.eligible_grade;

        delete secondChildEnquiryDetails.another_student_details;
        delete secondChildEnquiryDetails.other_details.another_child_enquiry;

        const secondChildEnquiry = await this.enquiryRepository.create(
          secondChildEnquiryDetails,
        );

        const updatedStages = enquiryStage.map((stage) => ({
          stage_id: new Types.ObjectId(stage.stage_id as string),
          stage_name: stage.stage_name,
          status:
            stage?.stage_name === 'Enquiry' || stage?.stage_name === 'enquiry'
              ? EEnquiryStageStatus.INPROGRESS
              : EEnquiryStageStatus.OPEN,
        }));

        await Promise.all([
          this.enquiryRepository.updateById(secondChildEnquiry._id, {
            enquiry_stages: updatedStages,
            ...defaultEnquiryFields,
          }),
          this.enquiryLogService.createLog({
            enquiry_id: secondChildEnquiry._id,
            event_type: EEnquiryEventType.ENQUIRY,
            event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
            event: EEnquiryEvent.ENQUIRY_CREATED,
            created_by: 'User',
            created_by_id: 1,
          }),
          this.enquiryRepository.updateById(firstChildEnquiry._id, {
            'another_student_details.enquiry_id': new Types.ObjectId(
              secondChildEnquiry._id,
            ),
          }),
        ]);
      }
      return firstChildEnquiry;
    }
    return firstChildEnquiry;
  }

  getEnquirerDetails(
    enquiryDetails: any,
    fieldsToExtract?: string | string[],
  ): Partial<TEnquirerDetails> | Record<string, unknown> {
    const { parent_details, other_details } = enquiryDetails;

    if (!other_details.parent_type) {
      return {};
    }

    let enquirer_details: TEnquirerDetails | Record<string, unknown> = {};
    switch (other_details.parent_type) {
      case EParentType.FATHER:
        parent_details.father_details.full_name =
          (parent_details?.father_details?.first_name ?? '') +
          ' ' +
          (parent_details?.father_details?.last_name ?? '');
        enquirer_details = parent_details.father_details;
        break;
      case EParentType.MOTHER:
        parent_details.mother_details.full_name =
          (parent_details?.mother_details?.first_name ?? '') +
          ' ' +
          (parent_details?.mother_details?.last_name ?? '');
        enquirer_details = parent_details.mother_details;
        break;
      case EParentType.GUARDIAN:
        parent_details.guardian_details.full_name =
          (parent_details?.guardian_details?.first_name ?? '') +
          ' ' +
          (parent_details?.guardian_details?.last_name ?? '');
        enquirer_details = parent_details.guardian_details;
        break;
    }

    if (!fieldsToExtract) {
      return enquirer_details;
    } else {
      const response = {};
      const fieldsToBeExtracted = Array.isArray(fieldsToExtract)
        ? fieldsToExtract
        : [fieldsToExtract];
      for (const field in enquirer_details) {
        if (fieldsToBeExtracted.includes(field)) {
          response[field] = enquirer_details[field];
        }
      }
      return response;
    }
  }

  mergeEnquiryDetails(target: any, source: any) {
    // array field - uniqueId map
    const enquiryArrayFieldsIdentifierFieldMap = new Map();
    enquiryArrayFieldsIdentifierFieldMap.set('enquiry_stages', 'stage_name');

    for (const key in source) {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        // Below if condition is to handle the ObjectIds
        if (source[key].toString().match(/^[0-9a-fA-F]{24}$/)) {
          target[key] = source[key];
        } else {
          if (!target[key]) {
            target[key] = {};
          }
          this.mergeEnquiryDetails(target[key], source[key]);
        }
      } else if (Array.isArray(source[key])) {
        if (!Array.isArray(target[key])) {
          target[key] = [];
        }
        target[key] = this.mergeArrayObjects(
          target[key],
          source[key],
          key,
          enquiryArrayFieldsIdentifierFieldMap,
        );
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  mergeArrayObjects(
    targetArray: any,
    sourceArray: any,
    key: string,
    map: Map<string, string>,
  ) {
    const mergedArray = [...targetArray];
    const field = map.get(key);
    sourceArray.forEach((sourceItem) => {
      const targetIndex = mergedArray.findIndex(
        (targetItem) => targetItem[field] === sourceItem[field],
      );
      if (targetIndex > -1) {
        mergedArray[targetIndex] = this.mergeEnquiryDetails(
          mergedArray[targetIndex],
          sourceItem,
        );
      } else {
        mergedArray.push(sourceItem);
      }
    });

    return mergedArray;
  }

  getUpdatedStatusOfEnquiryStage(
    enquiryTypeDetails: Record<string, any>,
    existingEnquiryStages: Record<string, any>,
    currentFormId: string,
  ) {
    const { enquiry_forms, stages: enquiryTypeStages } = enquiryTypeDetails;
    let currentStage = null;
    let isLastFormOfStage = false;

    if (enquiry_forms.length) {
      enquiry_forms.forEach((formId: Types.ObjectId, index: number) => {
        if (formId.toString() === currentFormId) {
          currentStage = 'Enquiry';
          if (index === enquiry_forms.length - 1) {
            isLastFormOfStage = true;
          }
        }
      });
    }

    if (enquiryTypeStages.length) {
      enquiryTypeStages.forEach((stage) => {
        if (stage?.stage_forms?.length) {
          stage.stage_forms.forEach((formId: Types.ObjectId, index: number) => {
            if (formId.toString() === currentFormId) {
              currentStage = stage.stage_name;
              if (index === stage.stage_forms.length - 1) {
                isLastFormOfStage = true;
              }
            }
          });
        }
      });
    }

    let isRegistrationStageCompleted = false;
    const updatedEnquiryStages = existingEnquiryStages.map((stage) => {
      if (stage.stage_name === currentStage) {
        if (stage.status === EEnquiryStageStatus.COMPLETED) {
        } else if (stage.status === EEnquiryStageStatus.INPROGRESS) {
          if (isLastFormOfStage) {
            stage.status = EEnquiryStageStatus.COMPLETED;
          }
        } else {
          if (isLastFormOfStage) {
            stage.status = EEnquiryStageStatus.COMPLETED;
          } else {
            stage.status = EEnquiryStageStatus.INPROGRESS;
          }
        }

        if (
          new RegExp('Registration', 'i').test(currentStage) &&
          stage.status === EEnquiryStageStatus.COMPLETED
        ) {
          isRegistrationStageCompleted = true;
        }
      }
      if (
        (new RegExp('Registration Fees', 'i').test(stage.stage_name) ||
          new RegExp('Academic Kit Selling', 'i').test(stage.stage_name)) &&
        isRegistrationStageCompleted
      ) {
        stage.status = EEnquiryStageStatus.PENDING;
      }
      return stage;
    });
    return { updatedEnquiryStages, isRegistrationStageCompleted };
  }

  calculateAge(dob: string, endDate: string) {
    // Parse the input date
    const birthDate = new Date(dob);
    const tillDate = new Date(endDate);

    // Calculate the year difference
    let years = tillDate.getFullYear() - birthDate.getFullYear();

    // Calculate the month difference
    let months = tillDate.getMonth() - birthDate.getMonth();

    // Calculate the day difference
    let days = tillDate.getDate() - birthDate.getDate();

    // Adjust the year and month if needed
    if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += 12;
    }

    if (days < 0) {
      // Get the last day of the previous month
      const lastMonth = new Date(
        tillDate.getFullYear(),
        tillDate.getMonth(),
        0,
      );
      days += lastMonth.getDate();
      months--;
    }

    return { years, months, days };
  }

  getDetailedEnquiryTimeline(
    timeline: Record<string, any>,
  ): Record<string, any> {
    return timeline.map((event) => {
      if (
        event.event_type === EEnquiryEventType.REGISTRATION &&
        event.event === EEnquiryEvent.REGISTRATION_FEE_RECEIVED
      ) {
        const updatedEvent = {
          ...event,
          //TODO: Get the below data from enquiry logs once the finance APIs returns proper response, currently passing hard code values
          mode_of_payment: 'UPI',
          amount: 1000,
          status: 'Completed',
        };
        return updatedEvent;
      } else if (
        event.event_type === EEnquiryEventType.ADMISSION &&
        event.event === EEnquiryEvent.PAYMENT_RECEIVED
      ) {
        const updatedEvent = {
          ...event,
          //TODO: Get the below data from enquiry logs once the finance APIs returns proper response, currently passing hard code values
          mode_of_payment: 'UPI',
          amount: 1000,
          status: 'Completed',
        };
        return updatedEvent;
      } else if (
        event.event_type === EEnquiryEventType.SCHOOL_TOUR &&
        event.event === EEnquiryEvent.SCHOOL_TOUR_COMPLETED
      ) {
        const updatedEvent = {
          ...event,
          school_visit_activities: event.log_data.activities,
        };
        // delete updatedEvent.log_data;
        return updatedEvent;
      }
      // delete event.log_data;
      return event;
    });
  }

  async checkAndAddNewAdmissionConcessionTags(
    enquiryTypeSlug: string,
    otherDetails: Record<string, any>,
    token: string
  ) {
    if (new RegExp('new.*admission', 'i').test(enquiryTypeSlug)) {
      const response = await this.axiosService
        .setMethod(EHttpCallMethods.GET)
        .setBaseUrl(`${this.configService.get<string>('ADMIN_PANEL_URL')}`)
        .setHeaders({ Authorization : token } as AxiosRequestHeaders)
        .setUrl(ADMIN_PANEL_URL.GET_MASTER_DETAILS)
        .setQueryStringParams([
          ['type', 'Concession'],
          ['subType', 'Tags'],
        ])
        .sendRequest();
      return {
        ...otherDetails,
        ...(response.data?.data
          ? { concession_tags: response?.data?.data }
          : {}),
      };
    }
    return otherDetails;
  }

  async sendCreateRegistrationFeeRequest(enquiry: Record<string, any>, req: Request) {
    const {
      _id,
      enquiry_number,
      school_location,
      student_details,
      academic_year
    } = enquiry;
    const academicYearDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.ACADEMIC_YEAR}/${academic_year?.id}`,
    );

    if (
      _id &&
      enquiry_number &&
      school_location.id &&
      student_details?.grade?.id &&
      academicYearDetails?.data?.attributes?.short_name_two_digit
      // (enquiry as any)?.board?.id &&
      // (enquiry as any)?.course?.id &&
      // (enquiry as any)?.shift?.id
    ) {
      // Post registration fee request to finance service
      const reqBodyFinance: any = {
        enquiry_id: _id.toString(),
        enquiry_no: enquiry_number,
        school_id: school_location.id,
        grade_id: student_details?.grade?.id,
        board_id: (enquiry as any)?.board?.id ?? null,
        course_id: (enquiry as any)?.course?.id ?? null,
        shift_id: (enquiry as any)?.shift?.id ?? null,
        academic_year_id:
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
        stream_id: (enquiry as any)?.stream?.id ?? null,
        brand_id: (enquiry as any)?.brand?.id ?? null,
        fee_type: EFeeType.REGISTRATION,
      };
      if (enquiry?.other_details?.['is_guest_student'] && enquiry?.guest_student_details?.location?.id) {
        reqBodyFinance.host_school_id = enquiry?.guest_student_details?.location?.id;
      }
      try {
        const isCrossPlatformRequest = isAppRequest(req);
        const createFeeResponse = await this.axiosService
          .setBaseUrl(`${this.configService.get<string>('FINANCE_URL')}`)
          .setMethod(EHttpCallMethods.POST)
          .setHeaders({ Authorization: req.headers.authorization } as AxiosRequestHeaders)
          .isCrossPlatformRequest(isCrossPlatformRequest)
          .setUrl(FINANCE_API_URLS.FEE_CREATE)
          .setBody(reqBodyFinance)
          .sendRequest();

        await this.enquiryLogService.createLog({
          enquiry_id: _id,
          event_type: EEnquiryEventType.REGISTRATION,
          event_sub_type: EEnquiryEventSubType.REGISTRATION_ACTION,
          event: EEnquiryEvent.REGISTRATION_FEE_REQUEST_SENT,
          created_by: enquiry.assigned_to,
          created_by_id: enquiry.assigned_to_id,
        });
        await this.auditLogRepository.create({
          table_name: 'enquiry',
          request_body: reqBodyFinance,
          response_body: `${JSON.stringify(createFeeResponse?.data ?? {})}`,
          operation_name: 'fee-registration',
          created_by: 1,
          url: `marketing/enquiry/${_id.toString()}/move-to-next-stage`,
          ip_address: 'NA',
          method: HTTP_METHODS.PATCH,
          source_service: this.configService.get<string>('SERVICE'),
          record_id: _id,
        });
        return createFeeResponse;
      } catch (err) {
        this.loggerService.log(
          `Registration fee request failed for payload :: ${JSON.stringify(reqBodyFinance)} with response ::`,
          err?.response?.data ?? err,
        );
        await this.auditLogRepository.create({
          table_name: 'enquiry',
          request_body: reqBodyFinance,
          response_body: `${JSON.stringify(err)}`,
          operation_name: 'fee-registration',
          created_by: 1,
          url: `marketing/enquiry/${_id.toString()}/move-to-next-stage`,
          ip_address: 'NA',
          method: HTTP_METHODS.PATCH,
          source_service: this.configService.get<string>('SERVICE'),
          record_id: _id,
        });
        throw err?.response?.data?.errorMessage ?? err;
      }
    }
  }

  getAdmissionType(documents: Record<string, any>[]): EEnquiryAdmissionType {
    let areAllRequiredDocumentsUploaded = true;
    for (const document of documents) {
      if (!document.file && document.is_mandatory) {
        areAllRequiredDocumentsUploaded = false;
        break;
      }
    }
    
    return areAllRequiredDocumentsUploaded
      ? EEnquiryAdmissionType.ADMISSION
      : EEnquiryAdmissionType.PROVISIONAL_ADMISSION;
  }

  async sendNotification({
    slug = '',
    employeeId = [],
    globalIds = [],
    toMail = [],
    toMobile = [],
    params = {},
  }) {
    /**
     * Payload options
     * 
     * slug: '',
     * to_mail: [''],
     * to_mobile: [''],
     * employee_ids: [],
     * param = {},
     * global_ids = []
     */
    try {
      const payload = {
        slug: slug,
        ...(toMail && { to_mail: toMail }),
        ...(params && { param: params }),
      }
      this.loggerService.log(`Sent notification payload : ${JSON.stringify(payload)}`);

      const response = await axios.post(
        `${this.configService.get<string>('NOTIFICATION_URL')}${NOTIFICATION_API_URLS.SEND_NOTIFICATION}`,
        payload,
        {},
      );
      this.loggerService.log(`Sent notification response : ${JSON.stringify(response?.data)}`)
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.loggerService.error(`Sent notification error message: ${JSON.stringify(error.message)}`, null);
        if (error.response) {
          this.loggerService.error(`Sent notification error message: ${JSON.stringify(error.response.data)}`, null);
        }
      } else {
        this.loggerService.error(`Sent notification error message: ${error}`, null)
      }
    }
  }

  private constructUserName(user: any, userInfo: any): string | null {
    let firstName: string | null = null;
    let lastName: string | null = null;
 
    // Extract first and last names from available sources
    if (userInfo) {
      // If userInfo.name exists, try to split it
      if (userInfo.name) {
        const nameParts = userInfo.name.trim().split(/\s+/);
        firstName = nameParts[0] || null;
        lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : null;
      }
      // Override with explicit fields if available
      firstName = userInfo.first_name?.trim() || firstName;
      lastName = userInfo.last_name?.trim() || lastName;
    }
 
    if (user) {
      firstName = user.first_name?.trim() || firstName;
      lastName = user.last_name?.trim() || lastName;
    }
 
    // Construct name from first and last only
    const parts = [firstName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : null;
  }

  async roundRobinAssign(
    enquiryData: Partial<EnquiryDocument & Document>[],
    reIndex: number,
    enquiryMaxLength: number,
    response: any,
    transferredSchool: string
  ) {
    // Deduplicate assignees based on Group_Employee_Code or Official_Email_ID
    const uniqueAssigneesMap = new Map();
    response.data.forEach((assignee: any) => {
      const uniqueKey = assignee.attributes.Group_Employee_Code || assignee.attributes.Official_Email_ID || assignee.id;
      if (!uniqueAssigneesMap.has(uniqueKey)) {
        uniqueAssigneesMap.set(uniqueKey, assignee);
      }
    });
    
    const uniqueAssignees = Array.from(uniqueAssigneesMap.values());
    const totalAssignees = uniqueAssignees.length;

    if (totalAssignees === 0) {
      throw new Error(`No assignees available for round-robin assignment., RE:: ${JSON.stringify(CCANDRE.RE)}`);
    }

    for (let index = 0; index < enquiryMaxLength; index++) {
      reIndex = (reIndex % totalAssignees);
      const currentAssignee = uniqueAssignees[reIndex];
      
      const formattedName = this.constructUserName(null, {
         first_name: currentAssignee.attributes.First_Name,
         last_name: currentAssignee.attributes.Last_Name,
         name: currentAssignee.attributes.Full_Name
      });

      const updatePayload: Partial<EnquiryDocument & Document> = {
        assigned_to_id: currentAssignee.id,
        assigned_to: formattedName || currentAssignee.attributes.Full_Name,
        round_robin_assigned:
          index === enquiryMaxLength - 1
            ? RoundRobinAssignedStatus.YES
            : RoundRobinAssignedStatus.NO,
      };
      await this.enquiryRepository.updateById(
        enquiryData[index]._id,
        updatePayload,
      );

      const logData = {
        ...updatePayload,
        previous_assigned_to_id: enquiryData[index].assigned_to,
        previous_assigned_to: Number(enquiryData[index].assigned_to_id) ?? 1,
        transferred_to_school: transferredSchool
      }
      // ENQUIRY_TRANSFERRED
      await this.enquiryLogService.createLog({
        enquiry_id: enquiryData[index]._id,
        event_type: EEnquiryEventType.TRANSFER,
        event_sub_type: EEnquiryEventSubType.ENQUIRY_ACTION,
        event: EEnquiryEvent.ENQUIRY_TRANSFERRED,
        log_data: logData,
        created_by: enquiryData[index].assigned_to,
        created_by_id: Number(enquiryData[index].assigned_to_id) ?? 1,
      });
      this.loggerService.log(`last round Robin Y assigned :: ${enquiryData[index]._id} 
      and update payload ${JSON.stringify(updatePayload)}`);

      // Move to the next assignee
      reIndex++;
    }
  }

  async getCurrentUserRoleCode(req: Request) {
    const token = req.headers.authorization.replace('Bearer ', '');
    if (process.env.NODE_ENV === 'development') {
      const { hrisCodes } = req.session[token];
      if (!hrisCodes) {
        return null;
      }
      return hrisCodes
    } else if (process.env.NODE_ENV === 'uat' || process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'preproduction') {
      const sessionData = this.redisInstance ? await this.redisInstance.getData(token) ?? req.session[token]: req.session[token];
      if (!sessionData) return null;

      const { hrisCodes } = this.redisInstance && sessionData ? sessionData?.[SERVICE_NAME] : sessionData;
      return hrisCodes;
    }
  }

  getCurrentEnquiryStage(enquiryStages: Record<string, any>[]): string {
    const reversedStages = [...enquiryStages].reverse();

    // First priority = Admitted or Provisonal approval 
    const finalStage = reversedStages.find(
      (stage) =>
        stage.status === EEnquiryStageStatus.ADMITTED || 
        stage.status === EEnquiryStageStatus.PROVISIONAL_ADMISSION,
    );

    if (finalStage) return finalStage?.stage_name;

    // Second priority = In Progress 
    const inProgressStage = reversedStages.find(
      (stage) =>
        stage.status === EEnquiryStageStatus.INPROGRESS
    );

    if (inProgressStage) return inProgressStage?.stage_name;


    // Third priority = Pending
    const pendingStage = reversedStages.find(stage => {
      return stage.status === EEnquiryStageStatus.PENDING;
    });

    if (pendingStage) return pendingStage?.stage_name;

    // Fourth priority = Open
    const openStage = enquiryStages.find(stage => stage.status === EEnquiryStageStatus.OPEN)
    
    if (openStage) return openStage?.stage_name
    
    return "NA"
  }

  getHighestStageEnquiry(enquiries: any[], academicYearId: number) {
    if (!enquiries || enquiries.length === 0) {
      return;
    }
    enquiries = enquiries.filter(
      (lead) => lead?.academic_year?.id == academicYearId,
    );
    if (!enquiries || enquiries.length === 0) {
      return;
    }
    // Define stage priority (higher number = more advanced stage)
    const stagePriority: { [key: string]: number } = {
      "Enquiry": 1,
      "School visit": 2,
      "Academic Kit Selling": 3,
      "Registration": 4,
      "Competency test": 5,
      "Admission Status": 6,
      "Payment": 7,
      "Admitted or Provisional Approval": 8
    };
    // Define status priority - only In Progress and Completed mean the stage is reached
    const isStageReached = (status: string): boolean => {
      return ["In Progress", "Completed", "Passed", "Approved", "Provisional Admission"].includes(status);
    };
    // Calculate the highest stage reached for each enquiry
    const enquiriesWithHighestStage = enquiries?.map((enquiry) => {
      let highestStageReached = 0;
      let highestStageStatus = "";
      // Find the highest stage that has been reached (not just "Open")
      enquiry.enquiry_stages?.forEach((stage) => {
        const stagePrio = stagePriority[stage?.stage_name] || 0;
        // Only consider stages that have been actively reached
        if (isStageReached(stage?.status) && stagePrio > highestStageReached) {
          highestStageReached = stagePrio;
          highestStageStatus = stage.status;
        }
      });
      return {
        enquiry,
        highestStageReached,
        highestStageStatus,
        createdAt: new Date(enquiry?.created_at?.$date).getTime()
      };
    });
    // Sort by: highest stage reached → most recent
    const sorted = enquiriesWithHighestStage?.sort((a, b) => {
      // First compare by highest stage reached
      if (a?.highestStageReached !== b?.highestStageReached) {
        return b?.highestStageReached - a?.highestStageReached;
      }
      return b?.createdAt - a?.createdAt;
    });
    return sorted[0]?.enquiry;
  }
  mergeVisibleRows(rows: any[], groupBy: string[] = []): any[] {
    const map: Record<string, any> = {};

    const defaultGroupBy = [
      'cluster',
      'school',
      'course',
      'board',
      'grade',
      'stream',
      'source',
      'subSource',
    ];

    const effectiveGroupBy = Array.isArray(groupBy) && groupBy.length ? groupBy : defaultGroupBy;

    const pickValue = (r: any, field: string) => {
      if (!effectiveGroupBy.includes(field)) {
        return 'NA';
      }
      const v = r[field];
      return typeof v === 'string' ? v.trim() : v ?? 'NA';
    };

    rows.forEach((r) => {
      // Unique key for visible grouping
      const key = effectiveGroupBy
        .map((g) => {
          const v = r[g];
          return typeof v === 'string' ? v.trim() : v ?? 'NA';
        })
        .join('|')
        .toLowerCase();

      // First occurrence → initialize
      if (!map[key]) {
        map[key] = {
          cluster: pickValue(r, 'cluster'),
          school: pickValue(r, 'school'),
          course: pickValue(r, 'course'),
          board: pickValue(r, 'board'),
          grade: pickValue(r, 'grade'),
          stream: pickValue(r, 'stream'),
          source: pickValue(r, 'source'),
          subSource: pickValue(r, 'subSource'),

          totalInquiry: r.totalInquiry ?? 0,
          totalOpenInquiries: r.totalOpenInquiries ?? 0,
          totalClosedInquiries: r.totalClosedInquiries ?? 0,

          open: {
            enquiry: r.open?.enquiry ?? 0,
            walkin: r.open?.walkin ?? 0,
            kit_sold: r.open?.kit_sold ?? 0,
            registration: r.open?.registration ?? 0,
          },

          closed: {
            enquiry: r.closed?.enquiry ?? 0,
            walkin: r.closed?.walkin ?? 0,
            kit_sold: r.closed?.kit_sold ?? 0,
            registration: r.closed?.registration ?? 0,
            admission: r.closed?.admission ?? 0,
          },
        };
      } else {
        // Merge counts
        map[key].totalInquiry += r.totalInquiry ?? 0;
        map[key].totalOpenInquiries += r.totalOpenInquiries ?? 0;
        map[key].totalClosedInquiries += r.totalClosedInquiries ?? 0;

        map[key].open.enquiry += r.open?.enquiry ?? 0;
        map[key].open.walkin += r.open?.walkin ?? 0;
        map[key].open.kit_sold += r.open?.kit_sold ?? 0;
        map[key].open.registration += r.open?.registration ?? 0;

        map[key].closed.enquiry += r.closed?.enquiry ?? 0;
        map[key].closed.walkin += r.closed?.walkin ?? 0;
        map[key].closed.kit_sold += r.closed?.kit_sold ?? 0;
        map[key].closed.registration += r.closed?.registration ?? 0;
        map[key].closed.admission += r.closed?.admission ?? 0;
      }
    });

    // totals for percentage denominator
    const totals = Object.values(map).reduce(
      (acc: any, item: any) => {
        acc.open_enquiry += item.open.enquiry || 0;
        acc.open_walkin += item.open.walkin || 0;
        acc.open_kit_sold += item.open.kit_sold || 0;
        acc.open_registration += item.open.registration || 0;

        acc.closed_enquiry += item.closed.enquiry || 0;
        acc.closed_walkin += item.closed.walkin || 0;
        acc.closed_kit_sold += item.closed.kit_sold || 0;
        acc.closed_registration += item.closed.registration || 0;
        acc.closed_admission += item.closed.admission || 0;

        return acc;
      },
      {
        open_enquiry: 0,
        open_walkin: 0,
        open_kit_sold: 0,
        open_registration: 0,
        closed_enquiry: 0,
        closed_walkin: 0,
        closed_kit_sold: 0,
        closed_registration: 0,
        closed_admission: 0,
      }
    );

    // Recompute percentage using respective totals
    const result = Object.values(map).map((item: any) => {
      const pct = (n: number, d: number) => (!d ? 0 : Math.round((n / d) * 10000) / 100);

      item.open.enquiry_pct = pct(item.open.enquiry, totals.open_enquiry);
      item.open.walkin_pct = pct(item.open.walkin, totals.open_walkin);
      item.open.kit_sold_pct = pct(item.open.kit_sold, totals.open_kit_sold);
      item.open.registration_pct = pct(item.open.registration, totals.open_registration);

      item.closed.enquiry_pct = pct(item.closed.enquiry, totals.closed_enquiry);
      item.closed.walkin_pct = pct(item.closed.walkin, totals.closed_walkin);
      item.closed.kit_sold_pct = pct(item.closed.kit_sold, totals.closed_kit_sold);
      item.closed.registration_pct = pct(item.closed.registration, totals.closed_registration);
      item.closed.admission_pct = pct(item.closed.admission, totals.closed_admission);

      return item;
    });

    return result.sort((a, b) =>
      a.cluster === b.cluster ? a.school.localeCompare(b.school) : a.cluster.localeCompare(b.cluster),
    );
  }
}


// Enquiry: Open, In Progress, Completed
// School visit: Open, In Progress, Completed
// Academic Kit Selling: Open, In Progress, Completed
// Registration: Open, In Progress, Completed
// Competency Test: Open, In Progress, Completed
// Admission Status: Open, Approved, Rejected
// Payment: Open, In Progress, Completed,
// Admitted or Provisional Approval : Open, In progress, Admitted, Provisional approval