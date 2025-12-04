import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LoggerService } from '../../utils';
import {
  CreateIvtEnquiryRequestDto,
  CreateNewAdmissionEnquiryRequestDto,
  CreatePsaEnquiryRequestDto,
  UpdateBankDetailsDto,
  UpdateContactDetailsRequestDto,
  UpdateEnquiryStudentDetailsRequestDto,
  UpdateIvtEnquiryRequestDto,
  UpdateMedicalDetailsDto,
  UpdateNewAdmissionEnquiryRequestDto,
  UpdateParentDetailsRequestDto,
  UpdatePsaEnquiryRequestDto,
} from './dto';
import { EEnquiryType, ERegistrationForms } from './enquiry.type';

// For create enquiry
export class ValidateCreateEnquiryRequest implements NestInterceptor {
  constructor(private loggerService: LoggerService) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const errors = [];
    if (!request.body.data.enquiry_type) {
      throw new HttpException(
        'Enquiry type not passed',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      ![
        EEnquiryType.NEW_ADMISSION,
        EEnquiryType.PSA,
        EEnquiryType.IVT,
      ].includes(request.body.data.enquiry_type)
    ) {
      throw new HttpException(
        'Incorrect enquiry type passed',
        HttpStatus.BAD_REQUEST,
      );
    }

    switch (request.body.data.enquiry_type) {
      case EEnquiryType.NEW_ADMISSION:
        const createNewAdmissionEnquiryDto = plainToInstance(
          CreateNewAdmissionEnquiryRequestDto,
          request.body,
        );
        const newAdmissionErrors = await validate(createNewAdmissionEnquiryDto);
        if (newAdmissionErrors) errors.push(...newAdmissionErrors);
        break;
      case EEnquiryType.PSA:
        const createPsaEnquiryDto = plainToInstance(
          CreatePsaEnquiryRequestDto,
          request.body,
        );
        const psaErrors = await validate(createPsaEnquiryDto);
        if (psaErrors) errors.push(...psaErrors);
        break;
      case EEnquiryType.IVT:
        const createIvtEnquiryDto = plainToInstance(
          CreateIvtEnquiryRequestDto,
          request.body,
        );
        const ivtErrors = await validate(createIvtEnquiryDto);
        if (ivtErrors) errors.push(...ivtErrors);
        break;
    }

    if (errors.length > 0) {
      const errorPayload = errors
        .map((error) => {
          return error.children.map((validationData) => {
            return {
              property: validationData.property,
              error: Object.values(validationData.constraints),
            };
          });
        })
        .flat();
      // this.loggerService.log(`Validation error in [validateCreateEnquiryPayload] : ${JSON.stringify(errors)}`)
      throw new HttpException('Validation failed', HttpStatus.BAD_REQUEST, {
        cause: errorPayload,
      });
    }
    return next.handle();
  }
}

// For update enquiry
export class ValidateUpdateEnquiryRequest implements NestInterceptor {
  constructor(private loggerService: LoggerService) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const errors = [];
    if (
      !request.body.data.registration_form &&
      !request.body.data.enquiry_type
    ) {
      throw new HttpException(
        'Registration form value or enquiry type not passed',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (request.body.data.enquiry_type) {
      if (
        ![
          EEnquiryType.NEW_ADMISSION,
          EEnquiryType.PSA,
          EEnquiryType.IVT,
        ].includes(request.body.data.enquiry_type)
      ) {
        throw new HttpException(
          'Incorrect enquiry type passed',
          HttpStatus.BAD_REQUEST,
        );
      }

      switch (request.body.data.enquiry_type) {
        case EEnquiryType.NEW_ADMISSION:
          const updateNewAdmissionEnquiryDto = plainToInstance(
            UpdateNewAdmissionEnquiryRequestDto,
            request.body,
          );
          const newAdmissionErrors = await validate(
            updateNewAdmissionEnquiryDto,
          );
          if (newAdmissionErrors) errors.push(...newAdmissionErrors);
          break;
        case EEnquiryType.PSA:
          const updatePsaEnquiryDto = plainToInstance(
            UpdatePsaEnquiryRequestDto,
            request.body,
          );
          const psaErrors = await validate(updatePsaEnquiryDto);
          if (psaErrors) errors.push(...psaErrors);
          break;
        case EEnquiryType.IVT:
          const updateIvtEnquiryDto = plainToInstance(
            UpdateIvtEnquiryRequestDto,
            request.body,
          );
          const ivtErrors = await validate(updateIvtEnquiryDto);
          if (ivtErrors) errors.push(...ivtErrors);
          break;
      }
    } else {
      if (
        ![
          ERegistrationForms.STUDENT_DETAILS,
          ERegistrationForms.PARENT_GUARDIAN_DETAILS,
          ERegistrationForms.CONTACT_DETAILS,
          ERegistrationForms.MEDICAL_DETAILS,
          ERegistrationForms.BANK_DETAILS,
        ].includes(request.body.data.registration_form)
      ) {
        throw new HttpException(
          'Incorrect registration form value passed',
          HttpStatus.BAD_REQUEST,
        );
      }

      switch (request.body.data.registration_form) {
        case ERegistrationForms.STUDENT_DETAILS:
          const updateStudentEnquiryDetailsDto = plainToInstance(
            UpdateEnquiryStudentDetailsRequestDto,
            request.body,
          );
          const updateStudentEnquiryDetailErrors = await validate(
            updateStudentEnquiryDetailsDto,
          );
          if (updateStudentEnquiryDetailErrors)
            errors.push(...updateStudentEnquiryDetailErrors);
          break;
        case ERegistrationForms.PARENT_GUARDIAN_DETAILS:
          const updateParentDetailsDto = plainToInstance(
            UpdateParentDetailsRequestDto,
            request.body,
          );
          const updateParentDetailErrors = await validate(
            updateParentDetailsDto,
          );
          if (updateParentDetailErrors)
            errors.push(...updateParentDetailErrors);
          break;
        case ERegistrationForms.CONTACT_DETAILS:
          const updateContactDetailsDto = plainToInstance(
            UpdateContactDetailsRequestDto,
            request.body,
          );
          const updateContactDetailErrors = await validate(
            updateContactDetailsDto,
          );
          if (updateContactDetailErrors)
            errors.push(...updateContactDetailErrors);
          break;
        case ERegistrationForms.MEDICAL_DETAILS:
          const updateMedicalDetailsDto = plainToInstance(
            UpdateMedicalDetailsDto,
            request.body,
          );
          const updateMedicalDetailErrors = await validate(
            updateMedicalDetailsDto,
          );
          if (updateMedicalDetailErrors)
            errors.push(...updateMedicalDetailErrors);
          break;
        case ERegistrationForms.BANK_DETAILS:
          const updateBankDetailsDto = plainToInstance(
            UpdateBankDetailsDto,
            request.body,
          );
          const updateBankDetailErrors = await validate(updateBankDetailsDto);
          if (updateBankDetailErrors) errors.push(...updateBankDetailErrors);
          break;
      }
    }

    if (errors.length > 0) {
      const errorPayload = errors
        .map((error) => {
          return error.children.map((validationData) => {
            return {
              property: validationData.property,
              error: Object.values(validationData.constraints),
            };
          });
        })
        .flat();
      // this.loggerService.log(`Validation error in [validateCreateEnquiryPayload] : ${JSON.stringify(errors)}`)
      throw new HttpException('Validation failed', HttpStatus.BAD_REQUEST, {
        cause: errorPayload,
      });
    }
    return next.handle();
  }
}
