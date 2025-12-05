import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { MDM_API_URLS, MdmService } from '../../../utils';
import { EnquiryStageService } from '../../enquiryStage/enquiryStage.service';
import { ENQUIRY_MODE } from '../../enquiryType/enquiryType.constant';
import { EnquiryTypeRepository } from '../../enquiryType/enquiryType.repository';

@Injectable()
export class ExternalEnquiryTypeService {
  constructor(
    private enquiryTypeRepository: EnquiryTypeRepository,
    private enquiryStageService: EnquiryStageService,
    private configService: ConfigService,
    private mdmService: MdmService,
  ) {}

  async getEnquiryTypeAndFormData(mode?: string) {
    const enquiryModes = await this.mdmService.fetchDataFromAPI(
      MDM_API_URLS.ENQUIRY_MODE,
      [
        ['fields', 'mode'],
        ['short', 'order'],
      ],
    );
    if (!enquiryModes?.data?.length) {
      throw new HttpException(
        'Enquiry modes not found from MDM',
        HttpStatus.NOT_FOUND,
      );
    }

    const isModePresent = enquiryModes?.data?.find(
      (enquiryMode) =>
        enquiryMode?.attributes?.mode?.toLowerCase() === mode.toLowerCase(),
    );

    if (!isModePresent) {
      throw new HttpException('Incorrect enquiry mode', HttpStatus.BAD_REQUEST);
    }

    const enquiryTypes: any = await this.enquiryTypeRepository.getMany(
      {
        is_active: true,
        is_deleted: false,
        saved_as_draft: false,
        mode: ENQUIRY_MODE.EXTERNAL,
      },
      {
        _id: 1,
        name: 1,
        slug: 1,
        enquiry_forms: 1,
        stages: 1,
        order: 1,
      },
    );

    if (!enquiryTypes.length) {
      return [];
    }

    const stageIds = [];
    for (const enquiryType of enquiryTypes) {
      const { stages } = enquiryType;
      stages.map((stage) => {
        if (stageIds.indexOf(stage.stage_id) === -1) {
          stageIds.push(stage.stage_id);
        }
      });
    }

    const enquiryStages =
      await this.enquiryStageService.getEnquiryStagesById(stageIds);
    const enquiryStageIds = enquiryStages.map((stage) => stage._id.toString());

    const forms = [];
    for (const enquiryType of enquiryTypes) {
      const { enquiry_forms, stages } = enquiryType;

      const stageData = [];
      stages.map((stage) => {
        const index = enquiryStageIds.indexOf(stage.stage_id.toString());
        if (index !== -1) {
          stageData.push({
            _id: stage.stage_id,
            name: enquiryStages[index].name,
            is_mandatory: stage.is_mandatory,
            stage_forms: stage?.stage_forms ?? [],
          });
          if (stage?.stage_forms) {
            stage.stage_forms.forEach((stageForm) => {
              if (forms.indexOf(stageForm) === -1) {
                forms.push(stageForm);
              }
            });
          }
        }
      });

      enquiryType['stages'] = stageData;

      if (enquiry_forms && enquiry_forms?.length) {
        enquiry_forms.map((form) => {
          if (forms.indexOf(form) === -1) {
            forms.push(form);
          }
        });
      }
    }

    const dynamicForms = [];
    if (forms.length) {
      // Make this API Auth disable
      const response = await axios.post(
        `${this.configService.get<string>('ADMIN_PANEL_URL')}form-builder/form-metadata`,
        {
          formIds: forms,
        },
      );
      dynamicForms.push(...response.data.data);
    }

    const dynamicFormIds = dynamicForms.map((form) => form._id.toString());

    for (const enquiryType of enquiryTypes) {
      const { _id, enquiry_forms, stages } = enquiryType;
      if (enquiry_forms && enquiry_forms.length) {
        const formDetails = [];
        enquiry_forms.map((form) => {
          const index = dynamicFormIds.indexOf(form.toString());
          if (index !== -1) {
            formDetails.push({
              _id: form,
              slug: dynamicForms[index].slug,
              name: dynamicForms[index].name,
            });
          }
        });
        enquiryType.enquiry_forms = formDetails;
      }

      if (stages.length) {
        stages.map((stage) => {
          if (stage?.stage_forms && stage?.stage_forms?.length) {
            const formDetails = [];
            stage.stage_forms.map((form) => {
              const index = dynamicFormIds.indexOf(form.toString());
              if (index !== -1) {
                formDetails.push({
                  _id: form,
                  slug: dynamicForms[index].slug,
                  name: dynamicForms[index].name,
                });
              }
            });
            stage.stage_forms = formDetails;
          }
        });
      }
    }

    return enquiryTypes.sort(
      (firstEnquiryType, secondEnquiryType) =>
        firstEnquiryType.order - secondEnquiryType.order,
    );
  }
}
