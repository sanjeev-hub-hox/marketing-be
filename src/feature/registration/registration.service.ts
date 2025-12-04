import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from 'ampersand-common-module';
import { Request } from 'express';

import {
  ALL_LEADS_PERMISSION,
  buildFilter,
  extractCreatedByDetailsFromBody,
  getSessionData,
} from '../../utils';
import { FilterItemDto } from '../enquiry/dto/apiResponse.dto';
import { ENQUIRY_PRIORITY, ENQUIRY_STAGES } from '../enquiry/enquiry.constant';
import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { EEnquiryStageStatus, EEnquiryStatus, EParentType } from '../enquiry/enquiry.type';
import { EnquiryStageRepository } from '../enquiryStage/enquiryStage.repository';
import { globalSearchFields } from './registration.constant';

@Injectable()
export class RegistrationService {
  constructor(
    private enquiryRepository: EnquiryRepository,
    private enquiryStageRepository: EnquiryStageRepository,
    @Inject('REDIS_INSTANCE') private redisInstance: RedisService,
  ) {}

  async getRegisteredEnquiryList(
    req: Request,
    page?: number,
    size?: number,
    filtersArray?: FilterItemDto[],
    globalSearchText?: string,
  ) {
    const pageNumber = page || 1;
    const pageSize = size ? parseInt(size as any, 10) : 10;
    const skip = (pageNumber - 1) * pageSize;

    const createdByDetails = extractCreatedByDetailsFromBody(req);
    const { permissions } = await getSessionData(req, this.redisInstance);
    const isSuperAdmissionPermission = !!permissions.find(
      (permission) =>
        permission.toLowerCase() === ALL_LEADS_PERMISSION.toLowerCase(),
    );

    const { user_id } = createdByDetails;

    let customFilter = {};
    let isStatusFilterApplied = false;
    let hasAnyFilter = false;

    // Check if any filters are provided
    if (filtersArray && filtersArray.length > 0) {
      hasAnyFilter = true;

    filtersArray &&
      filtersArray.forEach((filter) => {
        const { column, operation, search } = filter;
        if (column === 'status') {
          isStatusFilterApplied = true;
        }
        const filterClause = buildFilter(column, operation, search);
        customFilter = { ...customFilter, ...filterClause };
      });
    }

    // Check if global search is provided
    if (globalSearchText && globalSearchText.trim()) {
      hasAnyFilter = true;
    }
    const stages = await this.enquiryStageRepository.getMany(
      {
        name: {
          $in: ENQUIRY_STAGES,
        },
      },
      { name: 1 },
    );

    const pipeline: any[] = [
      {
        $match: {
          ...(!isSuperAdmissionPermission ? { assigned_to_id: user_id } : {}),
          is_registered: true,
          ...(!hasAnyFilter ? { status: EEnquiryStatus.OPEN } : {}),
        },
      },
      { $sort: { updated_at: -1 } },
      {
        $lookup: {
          from: 'enquiryType',
          localField: 'enquiry_type_id',
          foreignField: '_id',
          as: 'enquiryType',
        },
      },
      {
        $addFields: {
          enquiry_type: {
            $arrayElemAt: ['$enquiryType', 0],
          },
        },
      },
      {
        $addFields: {
          stages: stages,
        },
      },
      {
        $lookup: {
          from: 'admission',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'admissionDetails',
        },
      },
      {
        $unwind: {
          path: '$admissionDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          completedStages: {
            $filter: {
              input: '$enquiry_stages',
              as: 'stage',
              cond: {
                $or: [
                  {
                    $and: [
                      { $eq: ['$$stage.stage_name', 'Enquiry'] },
                      {
                        $eq: ['$$stage.status', EEnquiryStageStatus.INPROGRESS],
                      },
                    ],
                  },
                  { $eq: ['$$stage.status', EEnquiryStageStatus.COMPLETED] },
                  { $eq: ['$$stage.status', EEnquiryStageStatus.PASSED] },
                  { $eq: ['$$stage.status', EEnquiryStageStatus.APPROVED] },
                  { $eq: ['$$stage.status', EEnquiryStageStatus.ADMITTED] },
                  {
                    $eq: [
                      '$$stage.status',
                      EEnquiryStageStatus.PROVISIONAL_ADMISSION,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          lastCompletedStage: {
            $arrayElemAt: [
              '$completedStages',
              { $subtract: [{ $size: '$completedStages' }, 1] },
            ],
          },
        },
      },
      {
        $addFields: {
          lastCompletedStageIndex: {
            $indexOfArray: [
              '$enquiry_stages.stage_name',
              '$lastCompletedStage.stage_name',
            ],
          },
        },
      },
      {
        $addFields: {
          nextStage: {
            $arrayElemAt: [
              '$enquiry_stages',
              { $add: ['$lastCompletedStageIndex', 1] },
            ],
          },
        },
      },
      {
        $addFields: {
          registrationDate: {
            $ifNull: ['$registered_at', null],
          },
          enquiryFor: {
            $ifNull: ['$enquiry_type.name', null],
          },
          lastCompletedStage: { $arrayElemAt: ['$completedStages', -1] },
          studentName: {
            $concat: [
              { $ifNull: ['$student_details.first_name', ''] },
              ' ',
              { $ifNull: ['$student_details.last_name', ''] },
            ],
          },
          mobileNumber: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.FATHER],
                  },
                  then: '$parent_details.father_details.mobile',
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.MOTHER],
                  },
                  then: '$parent_details.mother_details.mobile',
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.GUARDIAN],
                  },
                  then: '$parent_details.guardian_details.mobile',
                },
              ],
              default: null,
            },
          },
          grade: {
            $ifNull: ['$student_details.grade.value', null],
          },
          board: {
            $ifNull: ['$board.value', null],
          },
          nextFollowUpDate: {
            $cond: {
              if: { $eq: [{ $type: '$next_follow_up_at' }, 'date'] },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: '$next_follow_up_at',
                },
              },
              else: null,
            },
          },
          enquiryDate: {
            $dateToString: {
              format: '%d-%m-%Y',
              date: '$created_at',
            },
          },
          enquirer: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.FATHER],
                  },
                  then: {
                    $concat: [
                      {
                        $ifNull: [
                          '$parent_details.father_details.first_name',
                          '',
                        ],
                      },
                      ' ',
                      {
                        $ifNull: [
                          '$parent_details.father_details.last_name',
                          '',
                        ],
                      },
                    ],
                  },
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.MOTHER],
                  },
                  then: {
                    $concat: [
                      {
                        $ifNull: [
                          '$parent_details.mother_details.first_name',
                          '',
                        ],
                      },
                      ' ',
                      {
                        $ifNull: [
                          '$parent_details.mother_details.last_name',
                          '',
                        ],
                      },
                    ],
                  },
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.GUARDIAN],
                  },
                  then: {
                    $concat: [
                      {
                        $ifNull: [
                          '$parent_details.guardian_details.first_name',
                          '',
                        ],
                      },
                      ' ',
                      {
                        $ifNull: [
                          '$parent_details.guardian_details.last_name',
                          '',
                        ],
                      },
                    ],
                  },
                },
              ],
              default: null,
            },
          },
          priority: {
            $cond: [
              {
                $lte: [
                  {
                    $dateDiff: {
                      startDate: '$created_at',
                      endDate: '$$NOW',
                      unit: 'day',
                    },
                  },
                  15,
                ],
              },
              `${ENQUIRY_PRIORITY.HOT}`,
              {
                $cond: [
                  {
                    $and: [
                      {
                        $gt: [
                          {
                            $dateDiff: {
                              startDate: '$created_at',
                              endDate: '$$NOW',
                              unit: 'day',
                            },
                          },
                          15,
                        ],
                      },
                      {
                        $lte: [
                          {
                            $dateDiff: {
                              startDate: '$created_at',
                              endDate: '$$NOW',
                              unit: 'day',
                            },
                          },
                          30,
                        ],
                      },
                    ],
                  },
                  `${ENQUIRY_PRIORITY.WARM}`,
                  `${ENQUIRY_PRIORITY.COLD}`,
                ],
              },
            ],
          },
          school: {
            $ifNull: ['$school_location.value', null],
          },
          academicYear: {
            $ifNull: ['$academic_year.value', null],
          },
          nextAction: 'NA', // This is a temporarily hard coded
        },
      },
      {
        $addFields: {
          formattedRegistrationDate: {
            $cond: {
              if: { $ne: ['$registrationDate', null] },
              then: {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: '$registrationDate',
                },
              },
              else: null,
            },
          },
        },
      },
      { $sort: { updated_at: -1 } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          registrationDate: '$formattedRegistrationDate',
          applicationFor: '$enquiryFor',
          studentName: 1,
          mobileNumber: 1,
          grade: 1,
          board: 1,
          stage: '$lastCompletedStage.stage_name',
          nextAction: '$nextStage.stage_name',
          nextFollowUpDate: '$nextFollowUpDate',
          next_follow_up_at: 1,
          enquiryDate: 1,
          enquirer: 1,
          status: 1,
          priority: 1,
          school: 1,
          registered_at: 1,
          created_at: 1,
          academicYear: 1,
          enquiry_number: 1,
          leadOwner: '$assigned_to',
          enquirySource: '$enquiry_source.value',
          student_details_pushed: {
            $cond: {
              if: {
                $and: [
                  {
                    $or: [
                      {
                        $eq: [
                          '$lastCompletedStage.status',
                          EEnquiryStageStatus.ADMITTED,
                        ],
                      },
                      {
                        $eq: [
                          '$lastCompletedStage.status',
                          EEnquiryStageStatus.PROVISIONAL_ADMISSION,
                        ],
                      },
                    ],
                  },
                  { $ne: ['$admissionDetails.enrolment_number', null] },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $facet: {
          data: [
            {
              $skip: skip,
            },
            {
              $limit: pageSize,
            },
            {
              $project: {
                created_at: 0,
                next_follow_up_at: 0,
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

    // if (!isStatusFilterApplied) {
    //   pipeline.unshift({
    //     $match: {
    //       status: { $ne: EEnquiryStatus.CLOSED }, // Add at the start
    //     },
    //   });
    // }

    if (Object.keys(customFilter).length) {
      pipeline.splice(pipeline.length - 1, 0, {
        $match: {
          ...customFilter,
        },
      });
    } else if (globalSearchText) {
      // Remove the default status filter from the first $match if global search is applied
      const firstMatchStage = pipeline[0] as { $match: any };
      firstMatchStage.$match = {
        ...(!isSuperAdmissionPermission ? { assigned_to_id: user_id } : {}),
      };


      pipeline.splice(pipeline.length - 1, 0, {
        $match: {
          $or: globalSearchFields.map((searchField) => {
            return {
              [searchField]: { $regex: globalSearchText, $options: 'i' },
            };
          }),
        },
      });
    }
    const populatedEnquiries = await this.enquiryRepository
      .aggregate(pipeline)
      .exec();

    const [result] = populatedEnquiries;
    const paginatedData = result.data;
    const totalCount =
      result.totalCount.length > 0 ? result.totalCount[0].count : 0;

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      content: paginatedData,
      pagination: {
        total_pages: totalPages,
        page_size: pageSize,
        total_count: totalCount,
      },
    };
  }

  async globalSearchRegisteredEnquiryListing(
    req: Request,
    pageNumber: number,
    pageSize: number,
    globalSearchText: string,
  ) {
    const result = await this.getRegisteredEnquiryList(
      req,
      pageNumber,
      pageSize,
      null,
      globalSearchText,
    );
    return result;
  }
}
