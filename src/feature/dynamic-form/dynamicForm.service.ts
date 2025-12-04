import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { mongodbPaginationQuery } from 'ampersand-common-module';

import { DynamicFormRepository } from './dynamicForm.repository';

@Injectable()
export class DynamicFormService {
  constructor(private dynamicFormFieldRepository: DynamicFormRepository) {}

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
      }

      pipeline.push({
        $project: {
          id: 1,
          name: 1,
          slug: 1,
          description: 1,
          created_at: 1,
          is_active: 1,
        },
      });

      const results = await this.dynamicFormFieldRepository.aggregate(
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
}
