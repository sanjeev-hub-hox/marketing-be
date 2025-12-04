import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Types } from 'mongoose';

import { buildFilter } from '../../utils';
import { EnquiryStageRepository } from '../enquiryStage/enquiryStage.repository';
import { EnquiryStageService } from '../enquiryStage/enquiryStage.service';
import {
  ENQUIRY_MODE,
  enquiryTypeGlobalSearchFields,
} from './enquiryType.constant';
import {
  AddEnquiryTypeMetadataRequestDto,
  ValidateEnquirySlugRequestDto,
} from './enquiryType.dto';
import { EnquiryTypeRepository } from './enquiryType.repository';

@Injectable()
export class EnquiryTypeService {
  constructor(
    private enquiryTypeRepository: EnquiryTypeRepository,
    private configService: ConfigService,
    private enquiryStageService: EnquiryStageService,
    private enquiryStageRepository: EnquiryStageRepository,
  ) {}

  async addEnquiryTypeMetadata(data: AddEnquiryTypeMetadataRequestDto) {
    const enquiryType = await this.enquiryTypeRepository.create({
      ...data,
      enquiry_forms: data.enquiry_forms.map((form) => {
        return new Types.ObjectId(form);
      }),
      saved_as_draft: true,
    });
    return enquiryType;
  }

  async updateEnquiryTypeMetadata(
    enquiryId: string,
    data: Record<string, any>,
  ) {
    const updatePayload = {
      ...data,
    };

    if (data?.enquiry_forms) {
      updatePayload['enquiry_forms'] = data.enquiry_forms.map((form) => {
        return new Types.ObjectId(form);
      });
    }

    const enquiryType = await this.enquiryTypeRepository.updateById(
      new Types.ObjectId(enquiryId),
      updatePayload,
    );
    return enquiryType;
  }

  async mapEnquiryTypeStages(enquiryTypeId: string, data: any) {
    const { stages } = data;

    const enquiryDetails = await this.enquiryTypeRepository.getById(
      new Types.ObjectId(enquiryTypeId),
    );
    if (!enquiryDetails) {
      throw new HttpException('Enquiry type not found', HttpStatus.NOT_FOUND);
    }

    const { enquiry_forms } = enquiryDetails;

    const sortedStages = stages
      ? stages.sort((stage, nextStage) => stage.order - nextStage.order)
      : [];

    const enquiryStage = await this.enquiryStageRepository.aggregate([
      {
        $match: {
          $or: [{ name: 'Enquiry' }, { name: 'enquiry' }],
          start_date: { $lte: new Date() },
          end_date: { $gte: new Date() },
          is_active: true,
          is_deleted: false,
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
    ]);

    let enquiryStageId = null;
    if (enquiryStage.length) {
      enquiryStageId = enquiryStage[0]._id;
    } else {
      // This block should never be executed technically
      // const enquiryStage = await this.enquiryStageRepository.create({
      //   name: 'Enquiry',
      //   color: "#12345",
      //   is_active: true,
      //   start_date: new Date(),
      //   end_date: new Date('31-12-2024'),
      //   sub_stage: [],
      // });
      // enquiryStageId = enquiryStage._id;
    }
    sortedStages.unshift({
      stage_id: enquiryStageId,
      order: 1,
      weightage: 20,
      tat: {
        unit: 'hour',
        value: 1,
      },
      is_mandatory: true,
      stage_forms: enquiry_forms,
      workflow: new Types.ObjectId('66b700da98807c20f3339d5e'),
    });
    const updatePayload = {
      ...(data?.saved_as_draft ? { saved_as_draft: data?.saved_as_draft } : {}),
      stages: sortedStages.length
        ? sortedStages.map((stage: any) => ({
            ...stage,
            stage_id: new Types.ObjectId(stage.stage_id as string),
            workflow: stage?.workflow
              ? new Types.ObjectId(stage.workflow as string)
              : null,
            stage_forms: stage?.stage_forms?.length
              ? stage?.stage_forms.map(
                  (form) => new Types.ObjectId(form as string),
                )
              : [],
          }))
        : [],
    };
    const updateResponse = await this.enquiryTypeRepository.updateById(
      new Types.ObjectId(enquiryTypeId),
      updatePayload,
    );
    return updateResponse;
  }

  async getEnquiryTypeList(
    page?: number,
    size?: number,
    filtersArray?: {
      column: string;
      operation: string;
      search: string | boolean;
    }[],
    globalSearchText?: string,
  ): Promise<any> {
    const pageNumber = page || 1;
    const pageSize = size ? parseInt(size as any, 10) : 10;

    const skip = (pageNumber - 1) * pageSize;

    let customFilter = {};

    filtersArray &&
      filtersArray.forEach((filter) => {
        const { column, operation, search } = filter;
        const filterClause = buildFilter(column, operation, search);
        customFilter = { ...customFilter, ...filterClause };
      });

    const pipeline: any = [
      {
        $lookup: {
          from: 'enquiryStage',
          localField: 'stages.stage_id',
          foreignField: '_id',
          as: 'enquiryStage',
          pipeline: [
            {
              $project: {
                _id: 1,
                stage_name: '$name',
              },
            },
          ],
        },
      },
      {
        $addFields: {
          stageIds: '$stages.stage_id',
        },
      },
      {
        $addFields: {
          stagesWithSortIndex: {
            $map: {
              input: '$enquiryStage',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    sortOrder: {
                      $indexOfArray: ['$stageIds', '$$item._id'],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          sortedStages: {
            $sortArray: {
              input: '$stagesWithSortIndex',
              sortBy: { sortOrder: 1 },
            },
          },
        },
      },
      {
        $unwind: {
          path: '$stages',
          includeArrayIndex: 'stageIndex',
        },
      },
      {
        $addFields: {
          'stages.stage_name': {
            $arrayElemAt: ['$sortedStages', '$stageIndex'],
          },
        },
      },
      {
        $addFields: {
          'stages.stage_name': '$stages.stage_name.stage_name',
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          slug: { $first: '$slug' },
          mode: { $first: '$mode' },
          user_type: { $first: '$user_type' },
          order: { $first: '$order' },
          enquiry_forms: { $first: '$enquiry_forms' },
          description: { $first: '$description' },
          is_active: { $first: '$is_active' },
          stages: { $push: '$stages' },
          is_deleted: { $first: '$is_deleted' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          __v: { $first: '$__v' },
          enquiryStage: { $first: '$enquiryStage' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          mode: 1,
          user_type: 1,
          order: 1,
          enquiry_forms: 1,
          description: 1,
          is_active: 1,
          stages: 1,
          is_deleted: 1,
          created_at: 1,
          updated_at: 1,
          saved_as_draft: 1,
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
      {
        $facet: {
          data: [
            {
              $sort: { created_at: -1 },
            },
            {
              $skip: skip,
            },
            {
              $limit: pageSize,
            },
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
                mode: 1,
                user_type: 1,
                order: 1,
                enquiry_forms: 1,
                description: 1,
                is_active: 1,
                stages_mapped: { $size: '$stages' },
                stages: 1,
                is_deleted: 1,
                created_at: 1,
                updated_at: 1,
              },
            },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ];

    if (Object.keys(customFilter).length) {
      pipeline.splice(0, 0, {
        $match: {
          ...customFilter,
          is_deleted: false,
        },
      });
    } else if (globalSearchText) {
      pipeline.splice(0, 0, {
        $match: {
          is_deleted: false,
          $or: enquiryTypeGlobalSearchFields.map((searchField) => {
            return {
              [searchField]: { $regex: globalSearchText, $options: 'i' },
            };
          }),
        },
      });
    } else {
      pipeline.splice(0, 0, {
        $match: {
          is_deleted: false,
        },
      });
    }

    const results = await this.enquiryTypeRepository.aggregate(pipeline);
    const [result] = results;
    const paginatedData = result.data;
    const totalCount =
      result.totalCount.length > 0 ? result.totalCount[0].count : 0;

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      content: paginatedData,
      pagination: {
        totalPages: totalPages,
        pageSize: pageSize,
        totalCount: results[0]?.totalCount[0]?.count ?? 0,
        currentPage: pageNumber,
        isNextPage: results[0]?.isNextPage,
      },
    };
  }

  async update(enquiryTypeId: string, data: any) {
    const enquiryType = await this.enquiryTypeRepository.getById(
      new Types.ObjectId(enquiryTypeId),
    );

    if (!enquiryType) {
      throw new HttpException('Enquiry type not found', HttpStatus.NOT_FOUND);
    }
    const enquiryStage = enquiryType.stages.find((stage) => stage.order === 0);
    const updatePayload = {
      ...data,
    };
    if (data?.enquiry_forms) {
      updatePayload.enquiry_forms = data.enquiry_forms.map(
        (formId: string) => new Types.ObjectId(formId),
      );
    }
    if (data?.stages) {
      const sortedStages = data.stages.sort(
        (stage, nextStage) => stage.order - nextStage.order,
      );
      if (enquiryStage) {
        sortedStages.unshift(enquiryStage);
      }
      updatePayload.stages = sortedStages.map((stage: any) => ({
        ...stage,
        stage_id: new Types.ObjectId(stage.stage_id as string),
        workflow: stage?.workflow
          ? new Types.ObjectId(stage.workflow as string)
          : null,
        stage_forms: stage?.stage_forms?.length
          ? stage?.stage_forms.map((form) => new Types.ObjectId(form as string))
          : [],
      }));
    }

    return this.enquiryTypeRepository.updateById(
      new Types.ObjectId(enquiryTypeId),
      updatePayload,
    );
  }

  async deleteEnquiryType(enquiryTypeId: string) {
    const deleteResult = await this.enquiryTypeRepository.softDeleteById(
      new Types.ObjectId(enquiryTypeId),
    );
    return deleteResult;
  }

  async changeEnquiryTypeStatus(enquiryTypeId: string, status: string) {
    const updateResult = await this.enquiryTypeRepository.updateById(
      new Types.ObjectId(enquiryTypeId),
      { is_active: status === 'active' ? true : false },
    );
    return updateResult;
  }

  async isEnquiryTypeSlugUnique(
    data: ValidateEnquirySlugRequestDto,
  ): Promise<boolean> {
    const { slug } = data;
    const searchText = new RegExp(slug, 'i');
    const record = await this.enquiryTypeRepository.getOne({
      slug: searchText,
    });
    if (record) {
      return false;
    }
    return true;
  }

  async getEnquiryTypeDetails(enquiryTypeId: string) {
    const enquiryType = await this.enquiryTypeRepository.getOne(
      { _id: new Types.ObjectId(enquiryTypeId) },
      { __v: 0 },
    );
    const response = {
      ...enquiryType,
      stages: enquiryType.stages.filter((stage) => {
        return stage.order !== 0;
      }),
    };
    return response;
  }

  async getEnquiryTypeAndFormData(token: string) {
    const enquiryTypes: any = await this.enquiryTypeRepository.getMany(
      {
        is_active: true,
        is_deleted: false,
        saved_as_draft: false,
        mode: { $ne: ENQUIRY_MODE.EXTERNAL },
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
      const response = await axios.post(
        `${this.configService.get<string>('ADMIN_PANEL_URL')}form-builder/form-metadata?interservice=true`,
        {
          formIds: forms,
        },
        {
          headers: {
            Authorization: token,
          },
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

  async getEnquiryTypeByIdAndFormData(enquiryTypeId: string, token: string) {
    const enquiryType: any = await this.enquiryTypeRepository.getOne(
      {
        _id: new Types.ObjectId(enquiryTypeId),
        is_active: true,
        is_deleted: false,
      },
      {
        _id: 1,
        name: 1,
        slug: 1,
        enquiry_forms: 1,
        stages: 1,
      },
    );

    if (!enquiryType) {
      return null;
    }

    const stageIds = [];
    const { enquiry_forms, stages } = enquiryType;
    stages.map((stage) => {
      if (stageIds.indexOf(stage.stage_id) === -1) {
        stageIds.push(stage.stage_id);
      }
    });

    const enquiryStages =
      await this.enquiryStageService.getEnquiryStagesById(stageIds);
    const enquiryStageIds = enquiryStages.map((stage) => stage._id.toString());

    const forms = [];

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
        stage.stage_forms.forEach((stageForm) => {
          if (forms.indexOf(stageForm) === -1) {
            forms.push(stageForm);
          }
        });
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

    const dynamicForms = [];
    if (forms.length) {
      const response = await axios.post(
        `${this.configService.get<string>('ADMIN_PANEL_URL')}form-builder/form-metadata?interservice=true`,
        {
          formIds: forms,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      dynamicForms.push(...response.data.data);
    }

    const dynamicFormIds = dynamicForms.map((form) => form._id.toString());

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

    if (enquiryType['stages'].length) {
      const updatedStages = enquiryType['stages'].map((stage) => {
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
        return stage;
      });
      enquiryType.stages = updatedStages;
    }
    return enquiryType;
  }

  async globalSearchEnquiryTypeListing(
    pageNumber: number,
    pageSize: number,
    globalSearchText: string,
  ) {
    const result = await this.getEnquiryTypeList(
      pageNumber,
      pageSize,
      null,
      globalSearchText,
    );
    return result;
  }

  async getEnquiryTypeDetailsWithStageName(enquiryTypeId: string) {
    const pipeline: any = [
      {
        $match: {
          _id: new Types.ObjectId(enquiryTypeId),
        },
      },
      {
        $lookup: {
          from: 'enquiryStage',
          localField: 'stages.stage_id',
          foreignField: '_id',
          as: 'enquiryStage',
          pipeline: [
            {
              $project: {
                _id: 1,
                stage_name: '$name',
              },
            },
          ],
        },
      },
      {
        $addFields: {
          stageIds: '$stages.stage_id',
        },
      },
      {
        $addFields: {
          stagesWithSortIndex: {
            $map: {
              input: '$enquiryStage',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    sortOrder: {
                      $indexOfArray: ['$stageIds', '$$item._id'],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          sortedStages: {
            $sortArray: {
              input: '$stagesWithSortIndex',
              sortBy: { sortOrder: 1 },
            },
          },
        },
      },
      {
        $unwind: {
          path: '$stages',
          includeArrayIndex: 'stageIndex',
        },
      },
      {
        $addFields: {
          'stages.stage_name': {
            $arrayElemAt: ['$sortedStages', '$stageIndex'],
          },
        },
      },
      {
        $addFields: {
          'stages.stage_name': '$stages.stage_name.stage_name',
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          slug: { $first: '$slug' },
          mode: { $first: '$mode' },
          user_type: { $first: '$user_type' },
          order: { $first: '$order' },
          enquiry_forms: { $first: '$enquiry_forms' },
          description: { $first: '$description' },
          is_active: { $first: '$is_active' },
          stages: { $push: '$stages' },
          is_deleted: { $first: '$is_deleted' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          __v: { $first: '$__v' },
          enquiryStage: { $first: '$enquiryStage' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          mode: 1,
          user_type: 1,
          order: 1,
          enquiry_forms: 1,
          description: 1,
          is_active: 1,
          stages: 1,
          is_deleted: 1,
          created_at: 1,
          updated_at: 1,
        },
      },
    ];

    const enquiryType = await this.enquiryTypeRepository.aggregate(pipeline);
    return enquiryType[0] ?? null;
  }

  async getActiveEnquiryTypeList() {
    const enquiryTypes = await this.enquiryTypeRepository.getMany({
      is_active: true,
      is_deleted: false,
      saved_as_draft: false,
    });

    return enquiryTypes.map((enquiryType) => ({
      _id: enquiryType._id,
      name: enquiryType.name,
    }));
  }
}
