import { Injectable } from '@nestjs/common';
import { mongodbPaginationQuery } from 'ampersand-common-module';
import { PipelineStage, Types } from 'mongoose';

import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { EEnquiryStageStatus } from '../enquiry/enquiry.type';
import { CreateMyTaskRequestDto } from './myTask.dto';
import { MyTaskRepository } from './myTask.repository';
import { ETaskEntityType, ETaskType } from './myTask.type';

@Injectable()
export class MyTaskService {
  constructor(
    private myTaskRepository: MyTaskRepository,
    private enquiryRepository: EnquiryRepository,
  ) {}

  async createMyTask(payload: CreateMyTaskRequestDto) {
    const enquiry = await this.enquiryRepository.getById(
      new Types.ObjectId(payload.enquiry_id),
    );
    const { assigned_to_id } = enquiry;
    const [_, task] = await Promise.all([
      this.enquiryRepository.updateById(
        new Types.ObjectId(payload.enquiry_id),
        {
          next_follow_up_at: new Date(payload?.valid_till),
        },
      ),
      this.myTaskRepository.create({
        ...payload,
        assigned_to_id: assigned_to_id,
        enquiry_id: new Types.ObjectId(payload.enquiry_id),
      }),
    ]);
    return task;
  }

  async getTaskList(
    page: number,
    size: number,
    type: ETaskType,
    userId: number,
  ) {
    const pipeline: PipelineStage[] = [];
    const pageNumber = page || 1;
    const pageSize = size ? parseInt(size as any, 10) : 10;

    pipeline.push({
      $match: {
        assigned_to_id: userId,
        is_closed: false,
      },
    });
    switch (type) {
      case ETaskType.TODAY:
        const today = new Date();
        pipeline.push({
          $match: {
            $expr: {
              $and: [
                { $gte: [today, '$valid_from'] },
                {
                  $eq: [
                    {
                      $dateToString: {
                        format: '%d-%m-%Y',
                        date: '$valid_till',
                      },
                    },
                    `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`,
                  ],
                },
              ],
            },
          },
        });
        break;
      case ETaskType.OVERDUE:
        pipeline.push({
          $match: {
            valid_till: { $lt: new Date() },
          },
        });
        break;
      case ETaskType.UPCOMING:
        pipeline.push({
          $match: {
            valid_till: { $gt: new Date() },
          },
        });
        break;
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'enquiry',
            localField: 'enquiry_id',
            foreignField: '_id',
            as: 'enquiryDetails',
          },
        },
        {
          $lookup: {
            from: 'schoolVisits',
            localField: 'enquiryDetails.enquiry_id',
            foreignField: 'enquiry_id',
            as: 'schoolVisitDetails',
          },
        },
        {
          $lookup: {
            from: 'competencyTests',
            localField: 'enquiry_id',
            foreignField: 'enquiry_id',
            as: 'competencyTestDetails',
          },
        },
        {
          $unwind: {
            path: '$enquiryDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'enquiryType',
            localField: 'enquiryDetails.enquiry_type_id',
            foreignField: '_id',
            as: 'enquiryType',
          },
        },
        {
          $unwind: {
            path: '$enquiryType',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'enquiryStage',
            localField: 'enquiryDetails.enquiry_stages.stage_id',
            foreignField: '_id',
            as: 'stages',
          },
        },
        {
          $addFields: {
            completedStages: {
              $filter: {
                input: '$enquiryDetails.enquiry_stages',
                as: 'stage',
                cond: {
                  $or: [
                    {
                      $and: [
                        {
                          $eq: ['$$stage.stage_name', 'Enquiry'],
                        },
                        {
                          $eq: [
                            '$$stage.status',
                            EEnquiryStageStatus.INPROGRESS,
                          ],
                        },
                      ],
                    },
                    {
                      $eq: ['$$stage.status', EEnquiryStageStatus.COMPLETED],
                    },
                    {
                      $eq: ['$$stage.status', EEnquiryStageStatus.PASSED],
                    },
                    {
                      $eq: ['$$stage.status', EEnquiryStageStatus.APPROVED],
                    },
                    {
                      $eq: ['$$stage.status', EEnquiryStageStatus.ADMITTED],
                    },
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
                {
                  $subtract: [
                    {
                      $size: '$completedStages',
                    },
                    1,
                  ],
                },
              ],
            },
          },
        },
        {
          $addFields: {
            lastCompletedStageIndex: {
              $indexOfArray: [
                '$enquiryDetails.enquiry_stages.stage_name',
                '$lastCompletedStage.stage_name',
              ],
            },
          },
        },
        {
          $addFields: {
            nextStage: {
              $arrayElemAt: [
                '$enquiryDetails.enquiry_stages',
                {
                  $add: ['$lastCompletedStageIndex', 1],
                },
              ],
            },
            enquirer: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        '$enquiryDetails.other_details.parent_type',
                        'Father',
                      ],
                    },
                    then: {
                      mobile: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.father_details.mobile',
                          '',
                        ],
                      },
                      email: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.father_details.email',
                          '',
                        ],
                      },
                      global_id: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.father_details.global_id',
                          '',
                        ],
                      },
                      first_name: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.father_details.first_name',
                          '',
                        ],
                      },
                      last_name: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.father_details.last_name',
                          '',
                        ],
                      },
                    },
                  },
                  {
                    case: {
                      $eq: [
                        '$enquiryDetails.other_details.parent_type',
                        'Mother',
                      ],
                    },
                    then: {
                      mobile: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.mother_details.mobile',
                          '',
                        ],
                      },
                      email: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.mother_details.email',
                          '',
                        ],
                      },
                      global_id: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.mother_details.global_id',
                          '',
                        ],
                      },
                      first_name: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.mother_details.first_name',
                          '',
                        ],
                      },
                      last_name: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.mother_details.last_name',
                          '',
                        ],
                      },
                    },
                  },
                  {
                    case: {
                      $eq: [
                        '$enquiryDetails.other_details.parent_type',
                        'Guardian',
                      ],
                    },
                    then: {
                      mobile: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.guardian_details.mobile',
                          '',
                        ],
                      },
                      email: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.guardian_details.email',
                          '',
                        ],
                      },
                      global_id: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.guardian_details.global_id',
                          '',
                        ],
                      },
                      first_name: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.guardian_details.first_name',
                          '',
                        ],
                      },
                      last_name: {
                        $ifNull: [
                          '$enquiryDetails.parent_details.guardian_details.last_name',
                          '',
                        ],
                      },
                    },
                  },
                ],
                default: null,
              },
            },
          },
        },
        {
          $project: {
            enquiry_id: 1,
            enquiry_number: '$enquiryDetails.enquiry_number',
            enquiry_type: '$enquiryType.name',
            school: '$enquiryDetails.school_location.value',
            student_first_name: '$enquiryDetails.student_details.first_name',
            student_last_name: '$enquiryDetails.student_details.last_name',
            enquirer_mobile: '$enquirer.mobile',
            enquirer_email: '$enquirer.email',
            enquirer_global_id: '$enquirer.global_id',
            enquiry_date: '$enquiryDetails.enquiry_date',
            stage: '$nextStage.stage_name',
            status: '$nextStage.status',
            enquirer_name: {
              $concat: ['$enquirer.first_name', ' ', '$enquirer.last_name'],
            },
            follow_up_date: {
              $dateToString: {
                format: '%d-%m-%Y',
                date: '$valid_till',
                timezone: 'Asia/Kolkata',
              },
            },
            remarks: {
              $cond: {
                if: {
                  $and: [
                    {
                      $ne: [
                        {
                          $type: '$schoolVisitDetails',
                        },
                        'missing',
                      ],
                    }, // Check if schoolVisitDetails exists
                    {
                      $eq: ['$entity_type', 'School visit'],
                    }, // Check if entity_type is 'School tour'
                  ],
                },
                then: '$schoolVisitDetails.comment',
                else: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $ne: [
                            {
                              $type: '$competencyTestDetails',
                            },
                            'missing',
                          ],
                        }, // Check if competencyTestDetails exists
                        {
                          $eq: ['$entity_type', 'Competency Test'],
                        }, // Check if entity_type is 'Competency Test'
                      ],
                    },
                    then: '$competencyTestDetails.comment',
                    else: null, // Set remarks to null if neither condition is met
                  },
                },
              },
            },
          },
        },
      ],
    );

    const result = await this.myTaskRepository.aggregate(
      mongodbPaginationQuery(pipeline, { pageNumber, pageSize }),
    );
    return result;
  }

  async closePastStagesTasks(enquiryId: string, currentStage: string) {
    const pastStages = [];
    switch (currentStage) {
      case ETaskEntityType.ENQUIRY:
        break;
      case ETaskEntityType.REGISTRATION:
        pastStages.push(ETaskEntityType.ENQUIRY);
        break;
      case ETaskEntityType.COMPETENCY_TEST:
        pastStages.push(ETaskEntityType.ENQUIRY, ETaskEntityType.REGISTRATION);
        break;
      case ETaskEntityType.ADMITTED_OR_PROVISIONAL_APPROVAL:
        pastStages.push(
          ETaskEntityType.ENQUIRY,
          ETaskEntityType.REGISTRATION,
          ETaskEntityType.COMPETENCY_TEST,
        );
        break;
    }
    if (pastStages.length) {
      await this.myTaskRepository.updateMany(
        {
          enquiryId: new Types.ObjectId(enquiryId),
          created_for_stage: { $in: pastStages },
          is_closed: false,
        },
        {
          is_closed: true,
        },
      );
    }
    return;
  }
}
