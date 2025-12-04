import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Types } from 'mongoose';

import { AxiosService, EHttpCallMethods } from '../../../global/service';
import { FINANCE_API_URLS, MDM_API_URLS, MdmService } from '../../../utils';
import { EnquiryRepository } from '../../enquiry/enquiry.repository';
import {
  BankDetails,
  ContactDetails,
  MedicalDetails,
  ParentDetails,
  ResidentialAddress,
} from '../../enquiry/enquiry.schema';
import { EnquiryService } from '../../enquiry/enquiry.service';
import { EEnquiryStageStatus, EFeeType } from '../../enquiry/enquiry.type';
import { EnquiryHelper } from '../../enquiry/enquiryHelper.service';
import { EnquiryLogService } from '../../enquiryLog/enquiryLog.service';
import {
  EEnquiryEvent,
  EEnquiryEventSubType,
  EEnquiryEventType,
} from '../../enquiryLog/enquiryLog.type';
import { ERegistrationDetailsType } from './appRegistration.type';

@Injectable()
export class AppRegistrationService {
  constructor(
    private enquiryService: EnquiryService,
    private enquiryHelper: EnquiryHelper,
    private enquiryRepository: EnquiryRepository,
    private enquiryLogService: EnquiryLogService,
    private mdmService: MdmService,
    private axiosService: AxiosService,
    private configService: ConfigService,
  ) {}

  private async getParentDetails(
    parentSiblingDetails: ParentDetails & {
      sibling_details: Record<string, any>[];
    } & { other_details: Record<string, any> },
  ): Promise<{
    fatherDetails: Record<string, any>;
    motherDetails: Record<string, any>;
    guardianDetails: Record<string, any>;
    siblingDetails: Record<string, any>[];
    otherDetails: Record<string, any>;
  }> {
    const {
      father_details,
      mother_details,
      guardian_details,
      sibling_details,
      other_details,
    } = parentSiblingDetails;
    const {
      occupation: fatherOccupation,
      country: fatherCountry,
      state: fatherState,
      city: fatherCity,
    } = father_details;
    const {
      occupation: motherOccupation,
      country: motherCountry,
      state: motherState,
      city: motherCity,
    } = mother_details;
    const {
      country: guardianCountry,
      state: guardianState,
      city: guardianCity,
    } = guardian_details;

    const occupationIds = [];
    fatherOccupation?.id ? occupationIds.push(fatherOccupation?.id) : '';
    motherOccupation?.id ? occupationIds.push(motherOccupation?.id) : '';

    const countryIds = [];
    fatherCountry?.id ? countryIds.push(fatherCountry?.id) : '';
    motherCountry?.id ? countryIds.push(motherCountry?.id) : '';
    guardianCountry?.id ? countryIds.push(guardianCountry?.id) : '';

    const stateIds = [];
    fatherState?.id ? stateIds.push(fatherState?.id) : '';
    motherState?.id ? stateIds.push(motherState?.id) : '';
    guardianState?.id ? stateIds.push(guardianState?.id) : '';

    const cityIds = [];
    fatherCity?.id ? cityIds.push(fatherCity?.id) : '';
    motherCity?.id ? cityIds.push(motherCity?.id) : '';
    guardianCity?.id ? cityIds.push(guardianCity?.id) : '';

    const occupationApiQueryParams = [];
    const countryApiQueryParams = [];
    const stateApiQueryParams = [];
    const cityApiQueryParams = [];

    if (occupationIds.length) {
      occupationIds.forEach((occupationId, index) => {
        occupationApiQueryParams.push([
          `filters[id][$in][${index}]`,
          occupationId,
        ]);
      });
    }
    if (countryIds.length) {
      countryIds.forEach((countryId, index) => {
        countryApiQueryParams.push([`filters[id][$in][${index}]`, countryId]);
      });
    }
    if (stateIds.length) {
      stateIds.forEach((stateId, index) => {
        stateApiQueryParams.push([`filters[id][$in][${index}]`, stateId]);
      });
    }
    if (cityIds.length) {
      cityIds.forEach((cityId, index) => {
        cityApiQueryParams.push([`filters[id][$in][${index}]`, cityId]);
      });
    }

    const mdmResponse = { occupation: [], country: [], state: [], city: [] };

    if (occupationApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.OCCUPATION,
        occupationApiQueryParams,
      );
      if (response?.data?.length) {
        mdmResponse.occupation.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? '',
          })),
        );
      }
    }
    if (countryApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.COUNTRY,
        countryApiQueryParams,
      );
      if (response?.data?.length) {
        mdmResponse.country.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? '',
          })),
        );
      }
    }
    if (stateApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.STATE,
        stateApiQueryParams,
      );
      if (response?.data?.length) {
        mdmResponse.state.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? '',
          })),
        );
      }
    }
    if (cityApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.CITY,
        cityApiQueryParams,
      );
      if (response?.data?.length) {
        mdmResponse.city.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? '',
          })),
        );
      }
    }

    return {
      fatherDetails: {
        global_id: father_details.global_id ?? '',
        firstName: father_details.first_name ?? '',
        lastName: father_details.last_name ?? '',
        aadharNumber: father_details.aadhar ?? '',
        panNumber: father_details.pan ?? '',
        qualification: father_details.qualification ?? '',
        occupation: father_details.occupation ?? '',
        organisationName: father_details.organization_name ?? '',
        designationName: father_details.designation ?? '',
        officeAddress: father_details.office_address ?? '',
        area: father_details.area ?? '',
        country: father_details?.country?.id
          ? (mdmResponse.country.find(
              (country) => country.id === father_details.country.id,
            )?.value ?? '')
          : '',
        state: father_details?.state?.id
          ? (mdmResponse.state.find(
              (state) => state.id === father_details.state.id,
            )?.value ?? '')
          : '',
        city: father_details?.city?.id
          ? (mdmResponse.city.find((city) => city.id === father_details.city.id)
              ?.value ?? '')
          : '',
        emailId: father_details.email ?? '',
        mobileNumber: father_details.mobile ?? '',
        pincode: father_details.pin_code ?? '',
      },
      motherDetails: {
        global_id: mother_details.global_id ?? '',
        firstName: mother_details.first_name ?? '',
        lastName: mother_details.last_name ?? '',
        aadharNumber: mother_details.aadhar ?? '',
        panNumber: mother_details.pan ?? '',
        qualification: mother_details.qualification ?? '',
        occupation: mother_details.occupation ?? '',
        organisationName: mother_details.organization_name ?? '',
        designationName: mother_details.designation ?? '',
        officeAddress: mother_details.office_address ?? '',
        area: mother_details.area ?? '',
        country: mother_details?.country?.id
          ? (mdmResponse.country.find(
              (country) => country.id === mother_details.country.id,
            )?.value ?? '')
          : '',
        state: mother_details?.state?.id
          ? (mdmResponse.state.find(
              (state) => state.id === mother_details.state.id,
            )?.value ?? '')
          : '',
        city: mother_details?.city?.id
          ? (mdmResponse.city.find((city) => city.id === mother_details.city.id)
              ?.value ?? '')
          : '',
        emailId: mother_details.email ?? '',
        mobileNumber: mother_details.mobile ?? '',
        pincode: mother_details.pin_code ?? '',
      },
      guardianDetails: {
        global_id: guardian_details.global_id ?? '',
        firstName: guardian_details.first_name ?? '',
        lastName: guardian_details.last_name ?? '',
        aadharNumber: guardian_details.aadhar ?? '',
        panNumber: guardian_details.pan ?? '',
        relationWithChild: guardian_details.relationship_with_child ?? '',
        houseNumber: guardian_details.house ?? '',
        street: guardian_details.street ?? '',
        landmark: guardian_details.landmark ?? '',
        country: guardian_details?.country?.id
          ? (mdmResponse.country.find(
              (country) => country.id === guardian_details.country.id,
            )?.value ?? '')
          : '',
        pincode: guardian_details.pin_code ?? '',
        state: guardian_details?.state?.id
          ? (mdmResponse.state.find(
              (state) => state.id === guardian_details.state.id,
            )?.value ?? '')
          : '',
        city: guardian_details?.city?.id
          ? (mdmResponse.city.find(
              (city) => city.id === guardian_details.city.id,
            )?.value ?? '')
          : '',
        emailId: guardian_details.email ?? '',
        mobileNumber: guardian_details.mobile ?? '',
        guardianType: guardian_details.guardian_type ?? '',
      },
      siblingDetails: sibling_details.map((siblingData) => {
        siblingData.gender = siblingData?.gender?.value ?? '';
        siblingData.grade = siblingData?.grade?.value ?? '';
        return siblingData;
      }),
      otherDetails: {
        are_parents_separated: other_details?.are_parents_separated ?? null,
      },
    };
  }

  private async getContactAndResidentialDetails(
    contactDetails: ContactDetails,
    residentialAddress: ResidentialAddress,
  ): Promise<{
    emergencyContact: string;
    pointOfContact: Record<string, any>;
    residentialAddress: Record<string, any>;
  }> {
    const { current_address } = residentialAddress;
    const { country, state, city } = current_address;

    const mdmResponse = { country: null, state: null, city: null };

    if (country?.id) {
      const response = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.COUNTRY}/${country.id}`,
      );
      if (response?.data)
        mdmResponse.country = response?.data?.attributes?.name;
    }
    if (state?.id) {
      const response = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.STATE}/${state.id}`,
      );
      if (response?.data) mdmResponse.state = response?.data?.attributes?.name;
    }
    if (city?.id) {
      const response = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.CITY}/${city.id}`,
      );
      if (response?.data) mdmResponse.city = response?.data?.attributes?.name;
    }

    return {
      emergencyContact: contactDetails.emergency_contact,
      pointOfContact: {
        first_preference: contactDetails.first_preference,
        second_preference: contactDetails.second_preference,
        third_preference: contactDetails.third_preference,
      },
      residentialAddress: {
        currentAddress: {
          house: residentialAddress.current_address?.house ?? '',
          street: residentialAddress.current_address?.street ?? '',
          landmark: residentialAddress.current_address?.landmark ?? '',
          country: mdmResponse.country,
          state: mdmResponse.state,
          city: mdmResponse.city,
          pincode: residentialAddress.current_address?.pin_code ?? '',
        },
        permanentAddress: {
          house: residentialAddress.permanent_address?.house ?? '',
          street: residentialAddress.permanent_address?.street ?? '',
          landmark: residentialAddress.permanent_address?.landmark ?? '',
          country: mdmResponse.country,
          state: mdmResponse.state,
          city: mdmResponse.city,
          pincode: residentialAddress.permanent_address?.pin_code ?? '',
        },
        isPermanentAddress: ['yes', true].includes(
          residentialAddress.is_permanent_address as any,
        )
          ? true
          : false,
      },
    };
  }

  private async getMedicalDetails(
    medicalDetails: MedicalDetails,
  ): Promise<Record<string, any>> {
    const { blood_group } = medicalDetails;

    let bloodGroup = null;
    if (blood_group?.id) {
      const response = await this.mdmService.fetchDataFromAPI(
        `${MDM_API_URLS.BLOOD_GROUP}/${blood_group.id}`,
      );
      if (response?.data) bloodGroup = response.data.attributes.group;
    }

    return {
      isChildHospitalised: medicalDetails.was_hopitalised
        ? medicalDetails.was_hopitalised === 'yes'
          ? true
          : false
        : false,
      yearOfHospitalization: medicalDetails.year_of_hospitalisation ?? '',
      reasonOfHopitalization: medicalDetails.reason_of_hospitalisation ?? '',
      hasPhysicalDisability: medicalDetails.has_physical_disability
        ? medicalDetails.has_physical_disability === 'yes'
          ? true
          : false
        : false,
      physicalDisabilityDescription:
        medicalDetails.physical_disability_description ?? '',
      hasMedicalHistory: medicalDetails.has_medical_history
        ? medicalDetails.has_medical_history === 'yes'
          ? true
          : false
        : false,
      medicalHistoryDescription:
        medicalDetails.medical_history_description ?? '',
      hasAllergy: medicalDetails.has_allergy
        ? medicalDetails.has_allergy === 'yes'
          ? true
          : false
        : false,
      allergyDescription: medicalDetails.allergy_description ?? '',
      bloodGroup: bloodGroup,
      hasPersonalisedLearningNeeds: medicalDetails.has_learning_needs
        ? medicalDetails.has_learning_needs === 'yes'
          ? true
          : false
        : false,
      personalisedLearningNeedsDescription:
        medicalDetails.personalised_learning_needs ?? '',
    };
  }

  private getBankDetails(bankDetails: BankDetails): Record<string, any> {
    //TODO: these details must be saved in encrypted format and then before sending the response, these details must be decrypted or Mobile APP will descrypt it at its end
    return {
      ifscCode: bankDetails.ifsc ?? '',
      bankName: bankDetails.bank_name ?? '',
      branchName: bankDetails.branch_name ?? '',
      accountHolderName: bankDetails.account_holder_name ?? '',
      accountType: bankDetails.account_type ?? '',
      accountNumber: bankDetails.account_number ?? '',
      upi: bankDetails.upi ?? '',
    };
  }

  async viewRegistrationDetails(
    enquiryId: string,
    infoType: ERegistrationDetailsType,
  ): Promise<Record<string, any>> {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const {
      parent_details,
      contact_details,
      residential_details,
      medical_details,
      bank_details,
      sibling_details,
      other_details,
    } = enquiryDetails;
    switch (infoType) {
      case ERegistrationDetailsType.PARENT:
        const parentDetails = await this.getParentDetails({
          ...parent_details,
          sibling_details,
          other_details,
        });
        return parentDetails;
      case ERegistrationDetailsType.CONTACT:
        const contactDetails = await this.getContactAndResidentialDetails(
          contact_details,
          residential_details,
        );
        return { ...contactDetails, residential_details: residential_details };
      case ERegistrationDetailsType.MEDICAL:
        const medicalDetails = await this.getMedicalDetails(medical_details);
        return medicalDetails;
      case ERegistrationDetailsType.BANK:
        return this.getBankDetails(bank_details);
    }
  }

  async editParentDetails(
    enquiryId: string,
    updatePayload: Record<string, any>,
  ): Promise<Record<string, any>> {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const {
      enquiry_stages,
      parent_details: existingParentDetails,
      other_details,
    } = enquiryDetails;
    const updatedParentDetails = JSON.parse(
      JSON.stringify(existingParentDetails),
    );

    const updatedSiblingDetails = [];

    const { father_details, mother_details, guardian_details } =
      updatedParentDetails;

    if (updatePayload?.parent_details?.father_details) {
      const response = await this.enquiryHelper.getParentGlobalId(
        updatePayload.parent_details.father_details.mobile,
        updatePayload.parent_details.father_details.email,
        updatePayload.parent_details?.father_details?.first_name,
        updatePayload.parent_details?.father_details?.last_name,
      );
      father_details.global_id = response.global_no;
      father_details.sso_username = response.sso_email;
      father_details.sso_password = response.sso_password;
      if (Object.keys(updatePayload?.parent_details?.father_details).length) {
        for (const field in updatePayload?.parent_details?.father_details) {
          father_details[field] =
            updatePayload?.parent_details?.father_details[field];
        }
      }
    }
    if (updatePayload?.parent_details?.mother_details) {
      const response = await this.enquiryHelper.getParentGlobalId(
        updatePayload.parent_details.mother_details.mobile,
        updatePayload.parent_details.mother_details.email,
        updatePayload.parent_details?.mother_details?.first_name,
        updatePayload.parent_details?.mother_details?.last_name,
      );
      mother_details.global_id = response.global_no;
      mother_details.sso_username = response.sso_email;
      mother_details.sso_password = response.sso_password;
      if (Object.keys(updatePayload?.parent_details?.mother_details).length) {
        for (const field in updatePayload?.parent_details?.mother_details) {
          mother_details[field] =
            updatePayload?.parent_details?.mother_details[field];
        }
      }
    }
    if (updatePayload?.parent_details?.guardian_details) {
      const response = await this.enquiryHelper.getParentGlobalId(
        updatePayload.parent_details.guardian_details.mobile,
        updatePayload.parent_details.guardian_details.email,
        updatePayload.parent_details?.guardian_details?.first_name,
        updatePayload.parent_details?.guardian_details?.last_name,
      );
      guardian_details.global_id = response.global_no;
      guardian_details.sso_username = response.sso_email;
      guardian_details.sso_password = response.sso_password;
      if (Object.keys(updatePayload?.parent_details?.guardian_details).length) {
        for (const field in updatePayload?.parent_details?.guardian_details) {
          guardian_details[field] =
            updatePayload?.parent_details?.guardian_details[field];
        }
      }
    }
    if (
      updatePayload?.sibling_details &&
      Array.isArray(updatePayload?.sibling_details)
    ) {
      if (updatePayload?.sibling_details.length) {
        updatePayload?.sibling_details.forEach((siblingData, index) => {
          updatedSiblingDetails.push({
            id: index + 1,
            ...siblingData,
          });
        });
      }
    }

    const updatedParentPayload = {
      ...updatedParentDetails,
    };

    const updatedOtherDetails = JSON.parse(JSON.stringify(other_details));

    if (updatePayload.are_parents_separated) {
      updatedOtherDetails['are_parents_separated'] =
        updatePayload.are_parents_separated;
    }
    if (updatePayload.child_custody) {
      updatedOtherDetails['child_custody'] = updatePayload.child_custody;
    }

    const registrationStageRegex = new RegExp('^Registration$', 'i');
    const existingRegistrationStageStatus = enquiry_stages.find((stage) =>
      registrationStageRegex.test(stage.stage_name),
    ).status;

    const updatedStages = enquiry_stages.map((stage) => {
      if (
        registrationStageRegex.test(stage.stage_name) &&
        existingRegistrationStageStatus === EEnquiryStageStatus.OPEN
      ) {
        stage.status = EEnquiryStageStatus.INPROGRESS;
      }
      return stage;
    });

    const updatedData = await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      {
        enquiry_stages: updatedStages,
        parent_details: { ...updatedParentPayload },
        sibling_details: updatedSiblingDetails,
        other_details: updatedOtherDetails,
      },
    );
    return updatedData;
  }

  async editContactDetails(
    enquiryId: string,
    updatePayload: Record<string, any>,
  ): Promise<Record<string, any>> {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const {
      enquiry_stages,
      residential_details: existingResidentialDetails,
      contact_details: existingContactDetails,
    } = enquiryDetails;
    const residentialDetails = existingResidentialDetails
      ? JSON.parse(JSON.stringify(existingResidentialDetails))
      : new Object();

    const updateContactResidentialDetails = new Object();

    if (updatePayload.residential_details) {
      for (const key in updatePayload.residential_details) {
        residentialDetails[key] = updatePayload.residential_details[key];
      }
      updateContactResidentialDetails['residential_details'] =
        residentialDetails;
    }

    if (updatePayload.contact_details) {
      updateContactResidentialDetails['contact_details'] = new Object();
      const {
        first_preference: existingFirstPreference,
        second_preference: existingSecondPreference,
        third_preference: existingThirdPreference,
        emergency_contact: existingEmergencyContact,
      } = existingContactDetails;

      let updatedFirstPreference = new Object();
      let updatedSecondPreference = new Object();
      let updatedThirdPreference = new Object();

      if (existingFirstPreference) {
        updateContactResidentialDetails['contact_details']['first_preference'] =
          new Object();
        updatedFirstPreference = JSON.parse(
          JSON.stringify(existingFirstPreference),
        );
        updateContactResidentialDetails['contact_details']['first_preference'] =
          updatedFirstPreference;
      }

      if (existingSecondPreference) {
        updateContactResidentialDetails['contact_details'][
          'second_preference'
        ] = new Object();
        updatedSecondPreference = JSON.parse(
          JSON.stringify(existingSecondPreference),
        );
        updateContactResidentialDetails['contact_details'][
          'second_preference'
        ] = updatedSecondPreference;
      }

      if (existingThirdPreference) {
        updateContactResidentialDetails['contact_details']['third_preference'] =
          new Object();
        updatedThirdPreference = JSON.parse(
          JSON.stringify(existingThirdPreference),
        );
        updateContactResidentialDetails['contact_details']['third_preference'] =
          updatedThirdPreference;
      }

      if (updatePayload.contact_details?.first_preference) {
        const incomingFirstPreference =
          updatePayload.contact_details.first_preference;
        for (const field in existingFirstPreference) {
          updatedFirstPreference[field] =
            incomingFirstPreference[field] ?? existingFirstPreference[field];
        }
        updateContactResidentialDetails['contact_details']['first_preference'] =
          updatedFirstPreference;
      }
      if (updatePayload.contact_details?.second_preference) {
        const incomingPreference =
          updatePayload.contact_details.second_preference;
        for (const field in existingSecondPreference) {
          updatedSecondPreference[field] =
            incomingPreference[field] ?? existingSecondPreference[field];
        }
        updateContactResidentialDetails['contact_details'][
          'second_preference'
        ] = updatedSecondPreference;
      }
      if (updatePayload.contact_details?.third_preference) {
        const incomingThirdPreference =
          updatePayload.contact_details.third_preference;
        for (const field in existingThirdPreference) {
          updatedThirdPreference[field] =
            incomingThirdPreference[field] ?? existingThirdPreference[field];
        }
        updateContactResidentialDetails['contact_details']['third_preference'] =
          updatedThirdPreference;
      }
      updateContactResidentialDetails['contact_details']['emergency_contact'] =
        updatePayload?.contact_details?.emergency_contact ??
        existingEmergencyContact;
    }

    const registrationStageRegex = new RegExp('^Registration$', 'i');
    const existingRegistrationStageStatus = enquiry_stages.find((stage) =>
      registrationStageRegex.test(stage.stage_name),
    ).status;

    const updatedStages = enquiry_stages.map((stage) => {
      if (
        registrationStageRegex.test(stage.stage_name) &&
        existingRegistrationStageStatus === EEnquiryStageStatus.OPEN
      ) {
        stage.status = EEnquiryStageStatus.INPROGRESS;
      }
      return stage;
    });

    const updatedResponse = await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      {
        ...updateContactResidentialDetails,
        enquiry_stages: updatedStages,
      },
    );
    return updatedResponse;
  }

  async editMedicalDetails(
    enquiryId: string,
    updatePayload: Record<string, any>,
  ): Promise<Record<string, any>> {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const { medical_details, enquiry_stages } = enquiryDetails;

    const updatedMedicalDetails = JSON.parse(JSON.stringify(medical_details));

    for (const field in updatePayload) {
      updatedMedicalDetails[field] =
        updatePayload[field] === true ? 'yes' : 'no';
    }

    const registrationStageRegex = new RegExp('^Registration$', 'i');
    const existingRegistrationStageStatus = enquiry_stages.find((stage) =>
      registrationStageRegex.test(stage.stage_name),
    ).status;

    const updatedStages = enquiry_stages.map((stage) => {
      if (
        registrationStageRegex.test(stage.stage_name) &&
        existingRegistrationStageStatus === EEnquiryStageStatus.OPEN
      ) {
        stage.status = EEnquiryStageStatus.INPROGRESS;
      }
      return stage;
    });

    const updateResponse = await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      {
        medical_details: updatedMedicalDetails,
        enquiry_stages: updatedStages,
      },
    );
    return updateResponse;
  }

  async editBankDetails(
    enquiryId: string,
    updatePayload: Record<string, any>,
    req: Request,
  ): Promise<Record<string, any>> {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const { bank_details } = enquiryDetails;

    const updatedBankDetails = JSON.parse(JSON.stringify(bank_details));
    for (const field in updatePayload) {
      updatedBankDetails[field] = updatePayload[field];
    }

    const updateResponse = await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      {
        bank_details: updatedBankDetails,
        is_registered: true,
        registered_at: new Date(),
      },
    );
    await this.enquiryService.moveToNextStageWrapper(
      enquiryId,
      'Registration',
      req,
    );

    return updateResponse;
  }

  async sendCreateRegistrationFeeRequest(enquiryDetails: Record<string, any>) {
    const {
      _id,
      enquiry_number,
      enquiry_stages,
      school_location,
      student_details,
      academic_year,
    } = enquiryDetails;

    const academicYearDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.ACADEMIC_YEAR}/${academic_year?.id}`,
    );

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
      const regsitrationFeeRegex = new RegExp('Registration Fees', 'i');
      const academicKitSellingFeeRegex = new RegExp(
        'Academic Kit Selling',
        'i',
      );
      const updatedEnquiryStages = enquiry_stages.map((stage) => {
        if (
          regsitrationFeeRegex.test(stage.stage_name) ||
          academicKitSellingFeeRegex.test(stage.stage_name)
        ) {
          stage.status = EEnquiryStageStatus.INPROGRESS;
        }
        return stage;
      });

      const reqBodyFinance: any = {
        enquiry_id: _id.toString(),
        enquiry_no: enquiry_number,
        lob_id: school_location.id,
        grade_id: student_details?.grade?.id,
        board_id: (enquiryDetails as any)?.board?.id,
        course_id: (enquiryDetails as any)?.course?.id,
        shift_id: (enquiryDetails as any)?.shift?.id,
        brand_id: (enquiryDetails as any)?.brand?.id ?? null,
        stream_id: (enquiryDetails as any)?.stream?.id ?? null,
        academic_year_id:
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
        fee_type: EFeeType.REGISTRATION,
      };

      if (enquiryDetails?.other_details?.['is_guest_student']) {
        reqBodyFinance.host_school_id =
          enquiryDetails?.guest_student_details.id;
      }

      // Post registration fee request to finance service
      await Promise.all([
        this.axiosService
          .setBaseUrl(`${this.configService.get<string>('FINANCE_URL')}`)
          .setMethod(EHttpCallMethods.POST)
          .setUrl(FINANCE_API_URLS.FEE_CREATE)
          .setBody(reqBodyFinance)
          .sendRequest(),
        this.enquiryRepository.updateById(_id, {
          enquiry_stages: updatedEnquiryStages,
        }),
        this.enquiryLogService.createLog({
          enquiry_id: _id,
          event_type: EEnquiryEventType.REGISTRATION,
          event_sub_type: EEnquiryEventSubType.REGISTRATION_ACTION,
          event: EEnquiryEvent.REGISTRATION_DETAILS_RECIEVED,
          created_by: 'User',
          created_by_id: 1,
        }),
      ]);
    }
  }
}
