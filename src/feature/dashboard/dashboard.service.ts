import { Injectable } from '@nestjs/common';
import { walkinEnquiryMode } from 'src/utils';

import { AdmissionRepository } from '../admission/admission.repository';
import { EnquiryRepository } from '../enquiry/enquiry.repository';
import { EEnquiryStatus } from '../enquiry/enquiry.type';

@Injectable()
export class DashboardService {
  constructor(
    private enquiryRepository: EnquiryRepository,
    private admissionRepository: AdmissionRepository,
  ) {}

  async getEnquiryCount(criteria: any) {
    return await this.enquiryRepository.getCount(criteria);
  }

  async hotEnquiryCount() {
    const hotEnquiriesCountPipeline = [
      {
        $match: {
          status: { $ne: EEnquiryStatus.CLOSED },
          $expr: {
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
        },
      },
      { $count: 'hot' },
    ];

    const [result] = await this.enquiryRepository
      .aggregate(hotEnquiriesCountPipeline)
      .exec();
    return result?.hot ?? 0;
  }
  async coldEnquiryCount() {
    const coldEnquiriesCountPipeline = [
      {
        $match: {
          $or: [
            { status: EEnquiryStatus.CLOSED },
            {
              $expr: {
                $gt: [
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
            },
          ],
        },
      },
      { $count: 'cold' },
    ];

    const [result] = await this.enquiryRepository
      .aggregate(coldEnquiriesCountPipeline)
      .exec();
    return result?.cold ?? 0;
  }
  async warmEnquiryCount() {
    const warmEnquiriesCountPipeline = [
      {
        $match: {
          status: { $ne: EEnquiryStatus.CLOSED },
          $expr: {
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
        },
      },
      { $count: 'warm' },
    ];
    const [result] = await this.enquiryRepository
      .aggregate(warmEnquiriesCountPipeline)
      .exec();
    return result?.warm ?? 0;
  }

  async getAdmissionCount(match: any, academicYearId: any) {
    return await this.admissionRepository.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'enquiry',
          localField: 'enquiry_id',
          foreignField: '_id',
          as: 'enquirydetails',
          pipeline: [{ $match: { 'academic_year.id': academicYearId } }],
        },
      },
      {
        $unwind: { path: '$enquirydetails', preserveNullAndEmptyArrays: false },
      },
      { $project: { _id: 1 } },
      { $count: 'count' },
    ]);
  }

  async getEnquiryManagementSummary(academic_year_ids: any) {
    const [
      currentYearEnqCount,
      nextYearEnqCount,
      walkinCount,
      hotCount,
      warmCount,
      coldCount,
    ] = await Promise.all([
      academic_year_ids?.[0]
        ? this.getEnquiryCount({ 'academic_year.id': academic_year_ids?.[0] })
        : 0,
      academic_year_ids?.[1]
        ? this.getEnquiryCount({ 'academic_year.id': academic_year_ids?.[1] })
        : 0,
      this.getEnquiryCount({ 'enquiry_mode.id': walkinEnquiryMode }),
      this.hotEnquiryCount(),
      this.warmEnquiryCount(),
      this.coldEnquiryCount(),
    ]);

    return {
      currentYearEnqCount,
      nextYearEnqCount,
      walkinCount,
      hotCount,
      warmCount,
      coldCount,
    };
  }
  async getAdmissionManagementSummary(academic_year_ids: any) {
    const [[admissionCount], [admittedCount], [wipCount]] = await Promise.all([
      this.getAdmissionCount({}, academic_year_ids?.[0]),
      this.getAdmissionCount({ is_admitted: true }, academic_year_ids?.[1]),
      this.getAdmissionCount(
        { is_admitted: false, status: EEnquiryStatus.OPEN },
        academic_year_ids?.[0],
      ),
    ]);
    const admissionManagement: any = {
      admissionCount: (admissionCount && admissionCount?.count) ?? 0,
      admittedCount: (admittedCount && admittedCount?.count) ?? 0,
      wipCount: (wipCount && wipCount.count) ?? 0,
      waitListCount: 0,
      lostCount: 0,
    };
    return admissionManagement;
  }

  async getTargetVsAchievementSummary(academic_year_ids: any) {
    const data = await this.getAdmissionManagementSummary(academic_year_ids);
    const fennelManagement: any = {
      enquiryCount: data?.currentYearEnqCount ?? 0,
      walkinCount: data?.walkinCount ?? 0,
      registeredCount:
        (data?.admissionCount && data?.admissionCount?.count) ?? 0,
      admittedCount: data?.admittedCount?.count ?? 0,
    };
    return fennelManagement;
  }
}
