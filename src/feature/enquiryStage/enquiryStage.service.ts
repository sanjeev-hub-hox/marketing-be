import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { mongodbPaginationQuery } from 'ampersand-common-module';
import { Types } from 'mongoose';

import { buildFilter } from '../../utils';
import { enquiryStageGlobalSearchFields } from './enquiryStage.constant';
import { EnquiryStageRepository } from './enquiryStage.repository';
import { EnquiryStageDocument } from './enquiryStage.schema';
import { EEnquiryStageStatus } from './enquiryStage.type';

@Injectable()
export class EnquiryStageService {
  constructor(private enquiryStageRepository: EnquiryStageRepository) {}

  async createEnquiryStage(data: any): Promise<EnquiryStageDocument> {
    const enquiryStage = await this.enquiryStageRepository.create(data);
    return enquiryStage;
  }

  async getById(id: string): Promise<EnquiryStageDocument> {
    const enquiryStage = await this.enquiryStageRepository.getById(
      new Types.ObjectId(id),
    );
    return enquiryStage;
  }

  async getByIds(ids: string[]) {
    const enquiryStages = await this.enquiryStageRepository.getMany({
      _id: { $in: ids },
      is_deleted: false,
      saved_as_draft: false,
      status: EEnquiryStageStatus.ACTIVE,
    });
    return enquiryStages;
  }

  async getAll(
    pageNumber: number,
    pageSize: number,
    sort: string,
    sortBy: string,
    search?: string,
    columns?: string,
    operator?: string,
  ): Promise<any> {
    try {
      const tableColumns = [];
      if (columns) {
        columns.split(',').map((column) => tableColumns.push(column));
      }
      const pipeline = [];
      if (search && tableColumns.length && operator) {
        switch (operator) {
          case 'contains':
            pipeline.push({
              $match: {
                $or: [
                  ...tableColumns.map((column) => {
                    return {
                      [column]: { $regex: new RegExp(search, 'i') },
                    };
                  }),
                ],
              },
            });
            break;
          case 'equals':
            pipeline.push({
              $match: {
                $or: [
                  ...tableColumns.map((column) => {
                    return {
                      [column]: { $eq: search },
                    };
                  }),
                ],
              },
            });
            break;
          case 'notequals':
            pipeline.push({
              $match: {
                $or: [
                  ...tableColumns.map((column) => {
                    return {
                      [column]: { $ne: search },
                    };
                  }),
                ],
              },
            });
            break;
          default:
            break;
        }
      } else if (search && tableColumns.length) {
        pipeline.push({
          $match: {
            $or: [
              ...tableColumns.map((column) => {
                return {
                  [column]: { $eq: { $regex: new RegExp(search, 'i') } },
                };
              }),
            ],
          },
        });
      } else if (search) {
        pipeline.push({
          $match: { name: { $regex: new RegExp(search, 'i') } },
        });
      } else {
        pipeline.push({ $match: {} });
      }

      pipeline[0]['$match'].is_deleted = false;

      if (sort) {
        pipeline.push({
          $sort: {
            [sort]: sortBy ? (sortBy === 'asc' ? 1 : -1) : 1,
          },
        });
      } else {
        pipeline.push({
          $sort: {
            created_at: -1,
          },
        });
      }

      pipeline.push({
        $project: {
          _id: 1,
          name: 1,
          color: 1,
          start_date: 1,
          end_date: 1,
          status: 1,
        },
      });

      const results = await this.enquiryStageRepository.aggregate(
        mongodbPaginationQuery(pipeline, { pageNumber, pageSize }),
      );
      let totalPages = 0;
      if (!results[0]?.totalCount) {
      } else if (results[0]?.totalCount > pageSize) {
        const lastPagedataCount = results[0]?.totalCount % pageSize;
        totalPages =
          lastPagedataCount > 0
            ? results[0]?.totalCount / pageSize + 1
            : results[0]?.totalCount / pageSize;
      } else {
        totalPages = 1;
      }

      return {
        columns: ['name', 'color'],
        operators: ['contains', 'equals', 'notequals'],
        content: results[0],
        pagination: {
          totalPages: totalPages,
          pageSize: pageSize,
          totalCount: results[0]?.totalCount ?? 0,
          currentPage: pageNumber,
          isNextPage: results[0]?.isNextPage,
        },
      };
    } catch (err) {
      throw new HttpException(
        { message: `Failed while fetching enquiry stage list`, error: err },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEnquiryStageList(
    page?: number,
    size?: number,
    filtersArray?: {
      column: string;
      operation: string;
      search: string | boolean;
    }[],
    globalSearchText?: string,
  ) {
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
        $addFields: {
          startDate: {
            $dateToString: {
              format: '%d-%m-%Y',
              date: '$start_date',
            },
          },
          endDate: {
            $dateToString: {
              format: '%d-%m-%Y',
              date: '$end_date',
            },
          },
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
                color: 1,
                start_date: '$startDate',
                end_date: '$endDate',
                is_active: 1,
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
          $or: enquiryStageGlobalSearchFields.map((searchField) => {
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

    const results = await this.enquiryStageRepository.aggregate(pipeline);
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

  async updateById(id: string, data: any): Promise<EnquiryStageDocument> {
    const updatedEnquiryStage = await this.enquiryStageRepository.updateById(
      new Types.ObjectId(id),
      { ...data, saved_as_draft: false },
    );
    return updatedEnquiryStage;
  }

  async deleteById(id: string): Promise<any> {
    const deleteResult = await this.enquiryStageRepository.softDeleteById(
      new Types.ObjectId(id),
    );
    return deleteResult;
  }

  async getEnquiryStagesForMapping() {
    const list = await this.enquiryStageRepository.getMany(
      {
        $and: [
          // { name: { $nin: ['Enquiry', 'enquiry'] } },
          { is_active: true },
          { is_deleted: false },
          { saved_as_draft: false },
          // {
          //   start_date: {
          //     $lte: new Date(),
          //   },
          // },
          // {
          //   end_date: {
          //     $gte: new Date(),
          //   },
          // },
        ],
      },
      { _id: 1, name: 1 },
    );

    return list;
  }

  async getEnquiryStagesById(stageIds: string[]) {
    const enquiryStages = await this.enquiryStageRepository.getMany(
      {
        _id: {
          $in: stageIds.map((stageId) => new Types.ObjectId(stageId)),
        },
      },
      {
        _id: 1,
        name: 1,
        color: 1,
        'sub_stage.name': 1,
      },
    );
    return enquiryStages;
  }

  async globalSearchEnquiryStageListing(
    pageNumber: number,
    pageSize: number,
    globalSearchText: string,
  ) {
    const result = await this.getEnquiryStageList(
      pageNumber,
      pageSize,
      null,
      globalSearchText,
    );
    return result;
  }
}
