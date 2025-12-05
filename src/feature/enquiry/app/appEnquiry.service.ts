import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { mongodbPaginationQuery } from 'ampersand-common-module';
import * as moment from 'moment';
import { PipelineStage, Types } from 'mongoose';

import { MDM_API_URLS, MdmService } from '../../../utils';
import { AdmissionRepository } from '../../admission/admission.repository';
import { EnquiryRepository } from '../enquiry.repository';
import {
  EEnquiryStageStatus,
  EEnquiryStatus,
  EParentType,
} from '../enquiry.type';
import { EEnquiryType, ETimelineType } from './appEnquiry.type';

@Injectable()
export class AppEnquiryService {
  constructor(
    private enquiryRepository: EnquiryRepository,
    private admissionRepository: AdmissionRepository,
    private mdmService: MdmService,
  ) {}

  async getEnquiryList(
    mobile: string,
    pageNumber: number,
    pageSize: number,
    type: string,
    status: EEnquiryStatus,
  ) {
    const matchCondition: any = [{ $match: {} }];
    if (type === EEnquiryType.ENQUIRY && status === EEnquiryStatus.OPEN) {
      matchCondition[0]['$match']['is_registered'] = false;
      matchCondition[0]['$match']['status'] = EEnquiryStatus.OPEN;
      matchCondition[0]['$match']['$or'] = [
        {
          $and: [
            {
              'other_details.enquiry_type': 'NewAdmission',
            },
            {
              enquiry_stages: {
                $elemMatch: {
                  stage_name: 'Registration',
                  $or: [
                    { status: EEnquiryStageStatus.OPEN },
                    { status: EEnquiryStageStatus.INPROGRESS },
                  ],
                },
              },
            },
          ],
        },
        {
          $and: [
            {
              $or: [
                {
                  'other_details.enquiry_type': 'KidsClub',
                },
                {
                  'other_details.enquiry_type': 'PSA',
                },
              ],
            },
            {
              enquiry_stages: {
                $elemMatch: {
                  stage_name: 'Admission Status',
                  status: EEnquiryStageStatus.OPEN,
                },
              },
            },
          ],
        },
      ];
    } else if (
      type === EEnquiryType.ENQUIRY &&
      status === EEnquiryStatus.CLOSED
    ) {
      matchCondition[0]['$match']['is_registered'] = false;
      matchCondition[0]['$match']['status'] = EEnquiryStatus.CLOSED;
    } else if (
      type === EEnquiryType.ADMISSION &&
      status === EEnquiryStatus.OPEN
    ) {
      matchCondition[0]['$match']['is_registered'] = true;
      matchCondition[0]['$match']['status'] = EEnquiryStatus.OPEN;
      matchCondition[0]['$match']['$or'] = [
        {
          $and: [
            {
              'other_details.enquiry_type': 'NewAdmission',
            },
            {
              enquiry_stages: {
                $elemMatch: {
                  stage_name: 'Registration',
                  status: EEnquiryStageStatus.COMPLETED,
                },
              },
            },
          ],
        },
        {
          $and: [
            {
              $or: [
                {
                  'other_details.enquiry_type': 'KidsClub',
                },
                {
                  'other_details.enquiry_type': 'PSA',
                },
              ],
            },
            {
              enquiry_stages: {
                $elemMatch: {
                  stage_name: 'Admission Status',
                  $or: [
                    { status: EEnquiryStageStatus.PENDING },
                    { status: EEnquiryStageStatus.APPROVED },
                    { status: EEnquiryStageStatus.REJECTED },
                  ],
                },
              },
            },
          ],
        },
      ];
    } else if (
      type === EEnquiryType.ADMISSION &&
      status === EEnquiryStatus.CLOSED
    ) {
      matchCondition[0]['$match']['is_registered'] = true;
      matchCondition[0]['$match']['status'] = { $in: [] };
      matchCondition[0]['$match']['status']['$in'].push(
        EEnquiryStatus.CLOSED,
        EEnquiryStatus.ADMITTED,
      );
    }
    const pipeline: PipelineStage[] = [
      {
        $match: {
          $or: [
            {
              'parent_details.father_details.mobile': mobile,
            },
            {
              'parent_details.mother_details.mobile': mobile,
            },
            {
              'parent_details.guardian_details.mobile': mobile,
            },
          ],
        },
      },
      matchCondition[0],
      {
        $lookup: {
          from: 'enquiryType',
          localField: 'enquiry_type_id',
          foreignField: '_id',
          as: 'enquiryTypeDetails',
          pipeline: [
            {
              $project: {
                name: 1,
                stages: 1,
              },
            },
          ],
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
        $lookup: {
          from: 'schoolVisits',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'schoolVisitDetails',
          pipeline: [
            {
              $sort: {
                created_at: -1,
              },
            },
          ],
        },
      },
      { $addFields: { lastSchoolVisit: { $first: '$schoolVisitDetails' } } },
      {
        $lookup: {
          from: 'bookedSlot',
          localField: 'lastSchoolVisit.booked_slot_id',
          foreignField: '_id',
          as: 'bookedSchoolVisitSlotDetails',
          pipeline: [
            {
              $sort: {
                created_at: -1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          lastBookedSchoolVisitSlot: {
            $first: '$bookedSchoolVisitSlotDetails',
          },
        },
      },
      {
        $lookup: {
          from: 'slotMaster',
          localField: 'lastBookedSchoolVisitSlot.slot_id',
          foreignField: '_id',
          as: 'schoolVisitSlotMasterDetails',
          pipeline: [
            {
              $sort: {
                created_at: -1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          schoolVisitSlotDetails: { $first: '$schoolVisitSlotMasterDetails' },
        },
      },
      {
        $lookup: {
          from: 'competencyTests',
          localField: '_id',
          foreignField: 'enquiry_id',
          as: 'competencyTestDetails',
          pipeline: [
            {
              $sort: {
                created_at: -1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          lastCompetencyTest: { $first: '$competencyTestDetails' },
        },
      },
      {
        $lookup: {
          from: 'bookedSlot',
          localField: 'lastCompetencyTest.booked_slot_id',
          foreignField: '_id',
          as: 'bookedCompetencyTestSlotDetails',
          pipeline: [
            {
              $sort: {
                created_at: -1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          lastBookedCompetencyTestSlot: {
            $first: '$bookedCompetencyTestSlotDetails',
          },
        },
      },
      {
        $lookup: {
          from: 'slotMaster',
          localField: 'lastBookedCompetencyTestSlot.slot_id',
          foreignField: '_id',
          as: 'competencyTestSlotMasterDetails',
          pipeline: [
            {
              $sort: {
                created_at: -1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          competencyTestSlotDetails: {
            $first: '$competencyTestSlotMasterDetails',
          },
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
    ];

    const [enquiries] = await this.enquiryRepository.aggregate(
      mongodbPaginationQuery(pipeline, { pageNumber, pageSize }),
    );

    if (!enquiries.data.length) {
      return {
        data: [],
        totalCount: 0,
        isNextPage: false,
      };
    }

    const gradeIds = [];
    const boardIds = [];
    const schoolLocationIds = [];
    const academicYearIds = [];
    const streamIds = [];
    const shiftIds = [];

    enquiries.data.forEach((enquiry) => {
      if (enquiry?.student_details?.grade?.id) {
        gradeIds.push(enquiry?.student_details?.grade?.id);
      }
      if (enquiry?.board?.id) {
        boardIds.push(enquiry?.board?.id);
      }
      if (enquiry?.school_location?.id) {
        schoolLocationIds.push(enquiry?.school_location?.id);
      }
      if (enquiry?.academic_year?.id) {
        academicYearIds.push(enquiry?.academic_year?.id);
      }
      if (enquiry?.stream?.id) {
        streamIds.push(enquiry?.stream?.id);
      }
      if (enquiry?.shift?.id) {
        shiftIds.push(enquiry?.shift?.id);
      }
    });

    // Get current MDM values
    const gradeApiQueryParams = gradeIds.length
      ? gradeIds.map((gradeId, index) => [
          `filters[id][$in][${index}]`,
          gradeId,
        ])
      : [];
    const boardApiQueryParams = boardIds.length
      ? boardIds.map((boardId, index) => [
          `filters[id][$in][${index}]`,
          boardId,
        ])
      : [];
    const schoolLocationApiQueryParams = schoolLocationIds.length
      ? schoolLocationIds.map((schoolLocationId, index) => [
          `filters[id][$in][${index}]`,
          schoolLocationId,
        ])
      : [];
    const academicYearApiQueryParams = academicYearIds.length
      ? academicYearIds.map((academicYearId, index) => [
          `filters[id][$in][${index}]`,
          academicYearId,
        ])
      : [];
    const streamApiQueryParams = streamIds.length
      ? streamIds.map((streamId, index) => [
          `filters[id][$in][${index}]`,
          streamId,
        ])
      : [];
    const shiftApiQueryParams = shiftIds.length
      ? shiftIds.map((shiftId, index) => [
          `filters[id][$in][${index}]`,
          shiftId,
        ])
      : [];

    const mdmResponse = {
      grade: [],
      board: [],
      schoolLocation: [],
      academicYear: [],
      stream: [],
      shift: [],
    };

    if (gradeApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.GRADE,
        gradeApiQueryParams,
      );
      if (response.data.length) {
        mdmResponse.grade.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? 'N/A',
          })),
        );
      }
    }
    if (boardApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.BOARD,
        boardApiQueryParams,
      );
      if (response.data.length) {
        mdmResponse.board.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? 'N/A',
          })),
        );
      }
    }
    if (schoolLocationApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.SCHOOL,
        schoolLocationApiQueryParams,
      );
      if (response.data.length) {
        mdmResponse.schoolLocation.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? 'N/A',
          })),
        );
      }
    }
    if (academicYearApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.ACADEMIC_YEAR,
        academicYearApiQueryParams,
      );
      if (response.data.length) {
        mdmResponse.academicYear.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? 'N/A',
          })),
        );
      }
    }
    if (streamApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.STREAM,
        streamApiQueryParams,
      );
      if (response.data.length) {
        mdmResponse.stream.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? 'N/A',
          })),
        );
      }
    }
    if (shiftApiQueryParams.length) {
      const response = await this.mdmService.fetchDataFromAPI(
        MDM_API_URLS.SHIFT,
        shiftApiQueryParams,
      );
      if (response.data.length) {
        mdmResponse.shift.push(
          ...response.data.map((data) => ({
            id: data.id,
            value: data?.attributes?.name ?? 'N/A',
          })),
        );
      }
    }

    const enquiryList = [];

    enquiries.data.map((enquiry) => {
      const temp = new Object();
      temp['enquiryType'] = enquiry?.enquiryTypeDetails[0]?.name ?? 'N/A';
      temp['enquiryId'] = enquiry._id;
      temp['studentName'] =
        (enquiry?.student_details?.first_name ?? '') +
        ' ' +
        (enquiry?.student_details?.last_name ?? '');
      temp['academicYear'] =
        mdmResponse.academicYear.find(
          (year) => year.id === enquiry?.academic_year?.id,
        )?.value ?? 'N/A';
      temp['school'] =
        mdmResponse.schoolLocation.find(
          (school) => school.id === enquiry?.school_location?.id,
        )?.value ?? 'N/A';
      temp['board'] =
        mdmResponse.board.find((board) => board.id === enquiry?.board?.id)
          ?.value ?? 'N/A';
      temp['grade'] =
        mdmResponse.grade.find(
          (grade) => grade.id === enquiry?.student_details?.grade?.id,
        )?.value ?? 'N/A';
      temp['stream'] =
        mdmResponse.stream.find((stream) => stream.id === enquiry?.stream?.id)
          ?.value ?? 'N/A';
      temp['shift'] =
        mdmResponse.shift.find((shift) => shift.id === enquiry?.shift?.id)
          ?.value ?? 'N/A';
      temp['enquiryNumber'] = enquiry.enquiry_number;
      temp['status'] = enquiry.status;

      const currentStageDetails =
        enquiry.enquiry_stages
          .reverse()
          .find((stage) => stage.status === EEnquiryStageStatus.INPROGRESS) ??
        enquiry.enquiry_stages.find((stage) =>
          [
            EEnquiryStageStatus.COMPLETED,
            EEnquiryStageStatus.APPROVED,
            EEnquiryStageStatus.PASSED,
            EEnquiryStageStatus.ADMITTED,
            EEnquiryStageStatus.PROVISIONAL_ADMISSION,
          ].includes(stage.status),
        );
      temp['currentStage'] = currentStageDetails?.stage_name;

      const isInProgressStage = enquiry.enquiry_stages.find(
        (stage) => stage.status === EEnquiryStageStatus.INPROGRESS,
      )?.stage_name
        ? true
        : false;

      let formCompletedPercentage = 0;
      enquiry.enquiry_stages.forEach((enquiryStage) => {
        if (enquiry.enquiryTypeDetails[0]?.stages.length) {
          enquiry.enquiryTypeDetails[0].stages.forEach((enquiryTypeStage) => {
            if (
              enquiryStage.stage_id.toString() ===
                enquiryTypeStage.stage_id.toString() &&
              (enquiryStage.status === EEnquiryStageStatus.COMPLETED ||
                enquiryStage.status === EEnquiryStageStatus.PASSED ||
                enquiryStage.status === EEnquiryStageStatus.APPROVED ||
                enquiryStage.status === EEnquiryStageStatus.ADMITTED ||
                enquiryStage.status ===
                  EEnquiryStageStatus.PROVISIONAL_ADMISSION)
            ) {
              formCompletedPercentage += enquiryTypeStage.weightage;
            }
          });
        }
      });
      temp['formCompletionPercentage'] = formCompletedPercentage;

      switch (temp['currentStage']) {
        case 'Enquiry':
          temp['comment'] = 'Enquiry completed';
          break;
        case 'School visit':
          temp['currentStage'] = 'School tour';
          if (
            enquiry.lastBookedSchoolVisitSlot &&
            enquiry.schoolVisitSlotDetails
          ) {
            const schoolVisitDate = moment(
              enquiry.lastBookedSchoolVisitSlot?.date,
            ).format('Do MMM');
            temp['comment'] =
              `School tour scheduled on ${schoolVisitDate} ${enquiry.schoolVisitSlotDetails?.slot}`;
          }
          if (!isInProgressStage) {
            temp['comment'] = 'School tour completed';
          }
          break;
        case 'Registration':
          temp['comment'] = isInProgressStage
            ? 'Registration is in progress'
            : 'Registration completed';
          break;
        case 'Academic Kit Selling':
          temp['comment'] = isInProgressStage
            ? 'Payment of registration fees is pending'
            : 'Registration fees paid';
          break;
        case 'Competency test':
          if (
            enquiry.lastBookedCompetencyTestSlot &&
            enquiry.competencyTestSlotDetails
          ) {
            const competencyTestDate = moment(
              enquiry.lastBookedCompetencyTestSlot?.date,
            ).format('Do MMM');
            temp['comment'] = isInProgressStage
              ? `Competency test scheduled on ${competencyTestDate} ${enquiry.competencyTestSlotDetails?.slot}`
              : 'Competency test completed';
          }
          if (!isInProgressStage) {
            temp['comment'] = 'Competency test completed';
          }
          break;
        case 'Admission Status':
          temp['comment'] = isInProgressStage
            ? 'Waiting for admission approval'
            : ['PSA', 'KidsClub'].includes(enquiry?.other_details.enquiry_type)
              ? 'Admission approved, waiting for VAS'
              : 'Admission approved, waiting for subject selection';
          break;
        case 'Payment':
          temp['comment'] = isInProgressStage
            ? 'Payment of admission fees is pending'
            : 'Admission fees paid';
          break;
        case 'Admitted or Provisional Approval':
          temp['currentStage'] = 'Admitted';
          temp['comment'] = isInProgressStage
            ? 'Admission is pending'
            : currentStageDetails.status === EEnquiryStageStatus.ADMITTED
              ? 'Admission granted'
              : currentStageDetails.status ===
                  EEnquiryStageStatus.PROVISIONAL_ADMISSION
                ? 'Provisional admission granted'
                : 'Admission is pending';
          temp['enrolmentNumber'] =
            enquiry?.admissionDetails?.enrolment_number ?? null;
          temp['grNumber'] = enquiry?.admissionDetails?.gr_number ?? null;
          break;
      }
      if (!temp['comment']) {
        temp['comment'] = '';
      }
      enquiryList.push(temp);
    });

    return { ...enquiries, data: enquiryList };
  }

  async getEnquiryDetails(enquiryId: string): Promise<Record<string, any>> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: new Types.ObjectId(enquiryId),
        },
      },
      {
        $lookup: {
          from: 'enquiryType',
          localField: 'enquiry_type_id',
          foreignField: '_id',
          as: 'enquiryType',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: '$enquiryType',
      },
      {
        $addFields: {
          parentDetails: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.FATHER],
                  },
                  then: '$parent_details.father_details',
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.MOTHER],
                  },
                  then: '$parent_details.mother_details',
                },
                {
                  case: {
                    $eq: ['$other_details.parent_type', EParentType.GUARDIAN],
                  },
                  then: '$parent_details.guardian_details',
                },
              ],
              default: null,
            },
          },
        },
      },
    ];
    const enquiryDetails = await this.enquiryRepository.aggregate(pipeline);

    if (!enquiryDetails) {
      throw new HttpException('No enquiries', HttpStatus.NOT_FOUND);
    }

    const [enquiry] = enquiryDetails;
    const mdmApiCalls = [];
    if (enquiry?.school_location?.id) {
      mdmApiCalls.push(
        this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.SCHOOL}/${enquiry?.school_location?.id}`,
        ),
      );
    } else mdmApiCalls.push(null);

    if (enquiry?.student_details?.grade?.id) {
      mdmApiCalls.push(
        this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.GRADE}/${enquiry?.student_details?.grade?.id}`,
        ),
      );
    } else mdmApiCalls.push(null);

    if (enquiry?.student_details?.gender?.id) {
      mdmApiCalls.push(
        this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.GENDER}/${enquiry?.student_details?.gender?.id}`,
        ),
      );
    } else mdmApiCalls.push(null);

    if (enquiry?.board?.id) {
      mdmApiCalls.push(
        this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.BOARD}/${enquiry?.board?.id}`,
        ),
      );
    } else mdmApiCalls.push(null);

    if (enquiry?.existing_school_details?.grade?.id) {
      mdmApiCalls.push(
        this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.GRADE}/${enquiry?.existing_school_details?.grade?.id}`,
        ),
      );
    } else mdmApiCalls.push(null);

    if (enquiry?.existing_school_details?.eligible_grade?.id) {
      mdmApiCalls.push(
        this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.GRADE}/${enquiry?.existing_school_details?.eligible_grade?.id}`,
        ),
      );
    } else mdmApiCalls.push(null);

    if (enquiry?.academic_year?.id) {
      mdmApiCalls.push(
        this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.ACADEMIC_YEAR}/${enquiry?.academic_year?.id}`,
        ),
      );
    } else mdmApiCalls.push(null);

    if (enquiry?.brand?.id) {
      mdmApiCalls.push(
        this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.BRAND}/${enquiry?.brand?.id}`,
        ),
      );
    } else mdmApiCalls.push(null);

    if (enquiry?.stream?.id) {
      mdmApiCalls.push(
        this.mdmService.fetchDataFromAPI(
          `${MDM_API_URLS.STREAM}/${enquiry?.stream?.id}`,
        ),
      );
    } else mdmApiCalls.push(null);
    const [
      schoolLocation,
      grade,
      gender,
      board,
      existingSchoolGrade,
      eligibleGrade,
      academicYear,
      brand,
      stream,
    ] = await Promise.all(mdmApiCalls);

    enquiry['currentStage'] =
      enquiry.enquiry_stages
        .reverse()
        .find((stage) => stage.status === EEnquiryStageStatus.INPROGRESS)
        ?.stage_name ??
      enquiry.enquiry_stages
        .reverse()
        .find((stage) =>
          [
            EEnquiryStageStatus.COMPLETED,
            EEnquiryStageStatus.APPROVED,
            EEnquiryStageStatus.PASSED,
          ].includes(stage.status),
        )?.stage_name;

    return {
      enquiryNumber: enquiry.enquiry_number,
      enquiryDate: moment(enquiry.enquiry_date).format('DD-MM-YYYY'),
      enquiryType: enquiry.enquiryType.name,
      schoolLocation: schoolLocation?.data?.attributes?.name ?? 'N/A',
      schoolId: enquiry?.school_location?.id ?? null,
      studentFirstName: enquiry.student_details?.first_name ?? 'N/A',
      studentLastName: enquiry.student_details?.last_name ?? 'N/A',
      grade: grade?.data?.attributes?.name ?? null,
      gradeId: enquiry?.student_details?.grade?.id ?? 'N/A',
      board: board?.data?.attributes?.name ?? null,
      boardId: enquiry?.board?.id ?? null,
      course: enquiry?.course?.value ?? null,
      courseId: enquiry?.course?.id ?? null,
      shift: enquiry?.shift?.value ?? null,
      shiftId: enquiry?.shift?.id ?? null,
      academicYear: academicYear?.data?.attributes?.name ?? null,
      academicYearId: academicYear?.data?.attributes?.short_name_two_digit
        ? +academicYear?.data?.attributes?.short_name_two_digit
        : null,
      brand: brand?.data?.attributes.name ?? null,
      brandId: brand?.data?.id ?? null,
      stream: stream?.data?.attributes?.value ?? null,
      streamId: stream?.data?.id ?? null,
      dob: enquiry.student_details?.dob ?? 'N/A',
      gender: gender?.data?.attributes?.name ?? 'N/A',
      existingSchoolName: enquiry.existing_school_details?.name ?? 'N/A',
      existingSchoolGrade: existingSchoolGrade?.data?.attributes?.name ?? 'N/A',
      parentType: enquiry.other_details.parent_type,
      globalId: enquiry.parentDetails.global_id,
      parentFirstName: enquiry.parentDetails.first_name ?? '',
      parentLastName: enquiry.parentDetails.last_name ?? '',
      parentEmail: enquiry.parentDetails.email ?? '',
      parentMobile: enquiry.parentDetails.mobile ?? '',
      enquiryDocuments: enquiry.documents,
      eligibleGrade: eligibleGrade?.data?.grade ?? 'N/A',
      studentAadhaarNumber: enquiry?.student_details?.aadhar ?? 'N/A',
      placeOfBirth: enquiry?.student_details?.place_of_birth ?? 'N/A',
      religion: enquiry?.student_details?.religion ?? 'N/A',
      caste: enquiry?.student_details?.caste ?? 'N/A',
      subCaste: enquiry?.student_details?.sub_caste ?? 'N/A',
      nationality: enquiry?.student_details?.nationality ?? 'N/A',
      motherTongue: enquiry?.student_details?.mother_tongue ?? 'N/A',
      enquiry_stages: enquiry?.enquiry_stages,
      currentStage: enquiry?.currentStage ?? 'N/A',
    };
  }

  async getAdmissionJourneyTimeline(enquiryId: string, type: ETimelineType) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const { enquiry_stages } = enquiryDetails;

    const enquiryTimelineStageRegex = [
      new RegExp('Enquiry', 'i'),
      new RegExp('School visit', 'i'),
      new RegExp('^Academic Kit Selling$', 'i'),
      new RegExp('^Registration$', 'i'),
    ];

    const admissionTimelineStageRegex = [
      new RegExp('Enquiry', 'i'),
      new RegExp('School visit', 'i'),
      new RegExp('^Registration$', 'i'),
      new RegExp('^Academic Kit Selling$', 'i'),
      new RegExp('Competency test', 'i'),
      new RegExp('Admission Status', 'i'),
      new RegExp('Payment', 'i'),
      new RegExp('Admitted or Provisional Approval', 'i'),
    ];

    const timelineStages = [];
    if (enquiry_stages.length) {
      enquiry_stages.forEach((stage) => {
        if (type === ETimelineType.ENQUIRY) {
          enquiryTimelineStageRegex.forEach((regex) => {
            if (regex.test(stage.stage_name)) {
              timelineStages.push({
                stage:
                  new RegExp('School visit', 'i').test(stage.stage_name) &&
                  stage.status === EEnquiryStageStatus.OPEN
                    ? 'School tour'
                    : stage.stage_name,
                status: stage.status,
                comment: null,
              });
            }
          });
        } else {
          admissionTimelineStageRegex.forEach((regex) => {
            if (regex.test(stage.stage_name)) {
              timelineStages.push({
                stage:
                  new RegExp('School visit', 'i').test(stage.stage_name) &&
                  stage.status === EEnquiryStageStatus.OPEN
                    ? 'School tour'
                    : stage.stage_name,
                status: stage.status,
                comment: null,
              });
            }
          });
        }
      });
    }

    if (!timelineStages.length) {
      return [];
    }

    const updatedTimelineStages = timelineStages.map(async (stage) => {
      if (
        stage.status === EEnquiryStageStatus.INPROGRESS ||
        stage.status === EEnquiryStageStatus.COMPLETED ||
        stage.status === EEnquiryStageStatus.APPROVED ||
        stage.status === EEnquiryStageStatus.PASSED
      ) {
        switch (stage.stage) {
          case 'Enquiry':
            stage.comment = 'Enquiry completed';
            break;
          case 'School visit':
            stage.stage = 'School tour';
            const schoolVisitResponse = await this.enquiryRepository.aggregate([
              {
                $match: {
                  _id: new Types.ObjectId(enquiryId),
                },
              },
              {
                $lookup: {
                  from: 'schoolVisits',
                  localField: '_id',
                  foreignField: 'enquiry_id',
                  as: 'schoolVisitDetails',
                  pipeline: [
                    {
                      $sort: {
                        created_at: -1,
                      },
                    },
                  ],
                },
              },
              {
                $addFields: {
                  lastSchoolVisit: { $first: '$schoolVisitDetails' },
                },
              },
              {
                $lookup: {
                  from: 'bookedSlot',
                  localField: 'lastSchoolVisit.booked_slot_id',
                  foreignField: '_id',
                  as: 'bookedSlotDetails',
                  pipeline: [
                    {
                      $sort: {
                        created_at: -1,
                      },
                    },
                  ],
                },
              },
              {
                $addFields: {
                  lastBookedSlot: { $first: '$bookedSlotDetails' },
                },
              },
              {
                $lookup: {
                  from: 'slotMaster',
                  localField: 'lastBookedSlot.slot_id',
                  foreignField: '_id',
                  as: 'slotMasterDetails',
                  pipeline: [
                    {
                      $sort: {
                        created_at: -1,
                      },
                    },
                  ],
                },
              },
              { $addFields: { slotDetails: { $first: '$slotMasterDetails' } } },
            ]);

            if (schoolVisitResponse.length) {
              const [schoolVisitDetails] = schoolVisitResponse;
              if (stage.status === EEnquiryStageStatus.INPROGRESS) {
                const { lastBookedSlot, slotDetails } = schoolVisitDetails;
                const bookedDate = moment(lastBookedSlot.date).format('Do MMM');
                stage.comment = `School tour scheduled on ${bookedDate} ${slotDetails?.slot ?? ''}`;
              } else {
                stage.comment = `School tour completed`;
              }
            }
            break;
          case 'Registration':
            stage.comment =
              stage.status === EEnquiryStageStatus.INPROGRESS
                ? 'Registration is in progress'
                : 'Registration completed';
            break;
          case 'Academic Kit Selling':
            stage.comment =
              stage.status === EEnquiryStageStatus.INPROGRESS
                ? 'Payment of registration fees is pending'
                : 'Registration fees paid';
            break;
          case 'Competency test':
            const competencyTestResponse =
              await this.enquiryRepository.aggregate([
                {
                  $match: {
                    _id: new Types.ObjectId(enquiryId),
                  },
                },
                {
                  $lookup: {
                    from: 'competencyTests',
                    localField: '_id',
                    foreignField: 'enquiry_id',
                    as: 'competencyTestDetails',
                    pipeline: [
                      {
                        $sort: {
                          created_at: -1,
                        },
                      },
                    ],
                  },
                },
                {
                  $addFields: {
                    lastCompetencyTest: { $first: '$competencyTestDetails' },
                  },
                },
                {
                  $lookup: {
                    from: 'bookedSlot',
                    localField: 'lastCompetencyTest.booked_slot_id',
                    foreignField: '_id',
                    as: 'bookedSlotDetails',
                    pipeline: [
                      {
                        $sort: {
                          created_at: -1,
                        },
                      },
                    ],
                  },
                },
                {
                  $addFields: {
                    lastBookedSlot: { $first: '$bookedSlotDetails' },
                  },
                },
                {
                  $lookup: {
                    from: 'slotMaster',
                    localField: 'lastBookedSlot.slot_id',
                    foreignField: '_id',
                    as: 'slotMasterDetails',
                    pipeline: [
                      {
                        $sort: {
                          created_at: -1,
                        },
                      },
                    ],
                  },
                },
                {
                  $addFields: { slotDetails: { $first: '$slotMasterDetails' } },
                },
              ]);

            if (competencyTestResponse.length) {
              const [schoolVisitDetails] = competencyTestResponse;

              if (stage.status === EEnquiryStageStatus.INPROGRESS) {
                const { lastBookedSlot, slotDetails } = schoolVisitDetails;
                const bookedDate = moment(lastBookedSlot.date).format('Do MMM');
                stage.comment = `Competency test scheduled on ${bookedDate} ${slotDetails?.slot ?? ''}`;
              } else {
                stage.comment = `Comptency test completed`;
              }
            }
            break;
          case 'Admission Status':
            const isAdmissionRecord = await this.admissionRepository.getOne({
              enquiry_id: new Types.ObjectId(enquiryId),
            });

            stage.comment =
              stage.status === EEnquiryStageStatus.INPROGRESS ||
              stage.status === EEnquiryStageStatus.PENDING
                ? 'Waiting for admission approval'
                : !isAdmissionRecord
                  ? ['PSA', 'KidsClub'].includes(
                      enquiryDetails?.other_details?.enquiry_type,
                    )
                    ? 'Admission approved, waiting for VAS'
                    : 'Admission approved, waiting for subject selection'
                  : 'Admission approved';
            break;
          case 'Payment':
            stage.comment =
              stage.status === EEnquiryStageStatus.INPROGRESS
                ? 'Paymemnt of admission fees is pending'
                : 'Admission fees paid';
            break;
          case 'Admitted or Provisional Approval':
            stage.comment =
              stage.status === EEnquiryStageStatus.INPROGRESS
                ? 'Admission is pending'
                : 'Admission completed';
            break;
        }
      }
      return stage;
    });

    return await Promise.all(updatedTimelineStages);
  }

  async getNewAdmissionEnquiryDetails(enquiryId: string) {
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
      enquiry_date,
      academic_year,
      school_location,
      other_details,
      parent_details,
      existing_school_details,
      student_details,
      residential_details,
      documents,
    } = enquiryDetails;

    if (other_details?.enquiry_type?.toLowerCase() !== 'newadmission') {
      throw new HttpException(
        'Provided enquiry Id does not match any new admission type enquiry',
        HttpStatus.BAD_REQUEST,
      );
    }

    const academicYearDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.ACADEMIC_YEAR}/${enquiryDetails.academic_year.id}`,
    );

    const enquiryInfo = {
      enquiry_date: moment(new Date(enquiry_date)).format('DD-MM-YYYY'),
      academic_year: {
        ...academic_year,
        short_name_two_digit:
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
      },
      school_location,
    };

    enquiryInfo['is_guest_student'] =
      other_details['is_guest_student'] ?? false;

    if (!enquiryDetails['guest_student_details']) {
      enquiryInfo['guest_student_details'] = {
        location: {
          id: -1,
          value: null,
        },
        board: {
          id: -1,
          value: null,
        },
        course: {
          id: -1,
          value: null,
        },
      };
    } else {
      enquiryInfo['guest_student_details'] = new Object();
      enquiryInfo['guest_student_details']['location'] = enquiryDetails[
        'guest_student_details'
      ]['location'] ?? { id: -1, value: null };
      enquiryInfo['guest_student_details']['board'] = enquiryDetails[
        'guest_student_details'
      ]['board'] ?? { id: -1, value: null };
      enquiryInfo['guest_student_details']['course'] = enquiryDetails[
        'guest_student_details'
      ]['course'] ?? { id: -1, value: null };
    }

    const parentDetails = {
      father_details: {
        global_id: parent_details.father_details.global_id,
        first_name: parent_details.father_details.first_name,
        last_name: parent_details.father_details.last_name,
        email: parent_details.father_details.email,
        mobile: parent_details.father_details.mobile,
      },
      mother_details: {
        global_id: parent_details.mother_details.global_id,
        first_name: parent_details.mother_details.first_name,
        last_name: parent_details.mother_details.last_name,
        email: parent_details.mother_details.email,
        mobile: parent_details.mother_details.mobile,
      },
    };
    enquiryInfo['parent_details'] = parentDetails;
    enquiryInfo['enquirer_parent'] = (other_details as any).parent_type;
    if (!existing_school_details) {
      enquiryInfo['existing_school_details'] = {
        name: null,
        board: {
          id: -1,
          value: null,
        },
        grade: {
          id: -1,
          value: null,
        },
        academic_year: {
          id: -1,
          value: null,
        },
      };
    } else {
      enquiryInfo['existing_school_details'] = new Object();
      enquiryInfo['existing_school_details']['name'] =
        existing_school_details.name ?? null;
      enquiryInfo['existing_school_details']['board'] =
        existing_school_details.board ?? { id: -1, value: null };
      enquiryInfo['existing_school_details']['grade'] =
        existing_school_details.grade ?? { id: -1, value: null };
      enquiryInfo['existing_school_details']['academic_year'] =
        existing_school_details?.academic_year ?? { id: -1, value: null };
    }

    const studentDetails = {
      first_name: student_details.first_name,
      last_name: student_details.last_name,
      grade: student_details.grade ?? { id: -1, value: null },
      gender: student_details.gender ?? { id: -1, value: null },
      dob: student_details.dob ?? null,
      eligible_grade: student_details?.eligible_grade
        ? student_details?.eligible_grade
        : null,
      place_of_birth: student_details?.place_of_birth ?? null,
      religion: student_details?.religion ?? null,
      caste: student_details?.caste ?? null,
      sub_caste: student_details?.sub_caste ?? null,
      nationality: student_details?.nationality ?? null,
      aadhar: student_details?.aadhar ?? null,
      mother_tongue: student_details?.mother_tongue ?? null,
    };
    enquiryInfo['student_details'] = studentDetails;
    enquiryInfo['board'] = enquiryDetails['board'] ?? { id: -1, value: null };
    enquiryInfo['course'] = enquiryDetails['course'] ?? { id: -1, value: null };
    enquiryInfo['stream'] = enquiryDetails['stream'] ?? { id: -1, value: null };
    enquiryInfo['shift'] = enquiryDetails['shift'] ?? { id: -1, value: null };

    const residentialInfo = new Object();
    residentialInfo['house'] = residential_details.current_address.house;
    residentialInfo['street'] = residential_details.current_address.street;
    residentialInfo['landmark'] = residential_details.current_address.landmark;
    residentialInfo['country'] = residential_details.current_address
      .country ?? {
      id: -1,
      value: null,
    };
    residentialInfo['pin_code'] = residential_details.current_address.pin_code;
    residentialInfo['state'] = residential_details.current_address.state ?? {
      id: -1,
      value: null,
    };
    residentialInfo['city'] = residential_details.current_address.city ?? {
      id: -1,
      value: null,
    };
    residentialInfo['is_permanent_address'] =
      residential_details.is_permanent_address;

    enquiryInfo['residential_address'] = residentialInfo;
    enquiryInfo['documents'] = documents;
    return enquiryInfo;
  }

  async getPsaEnquiryDetails(enquiryId: string) {
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
      enquiry_date,
      academic_year,
      school_location,
      parent_details,
      student_details,
      documents,
      other_details,
    } = enquiryDetails;

    if (other_details?.enquiry_type?.toLowerCase() !== 'psa') {
      throw new HttpException(
        'Provided enquiry Id does not match any psa type enquiry',
        HttpStatus.BAD_REQUEST,
      );
    }
    const academicYearDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.ACADEMIC_YEAR}/${enquiryDetails.academic_year.id}`,
    );

    const enquiryInfo = {
      enquiry_date: moment(new Date(enquiry_date)).format('DD-MM-YYYY'),
      academic_year: {
        ...academic_year,
        short_name_two_digit:
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
      },
      school_location,
    };

    const parentDetails = {
      father_details: {
        global_id: parent_details.father_details.global_id,
        first_name: parent_details.father_details.first_name,
        last_name: parent_details.father_details.last_name,
        email: parent_details.father_details.email,
        mobile: parent_details.father_details.mobile,
      },
      mother_details: {
        global_id: parent_details.mother_details.global_id,
        first_name: parent_details.mother_details.first_name,
        last_name: parent_details.mother_details.last_name,
        email: parent_details.mother_details.email,
        mobile: parent_details.mother_details.mobile,
      },
    };
    enquiryInfo['parent_details'] = parentDetails;
    enquiryInfo['enquirer_parent'] = (other_details as any).parent_type;

    if (!enquiryDetails['existing_school_details']) {
      enquiryInfo['existing_school_details'] = {
        name: {
          id: -1,
          value: null,
        },
        board: {
          id: -1,
          value: null,
        },
        grade: {
          id: -1,
          value: null,
        },
      };
    } else {
      enquiryInfo['existing_school_details'] = new Object();
      enquiryInfo['existing_school_details']['name'] = enquiryDetails[
        'existing_school_details'
      ]['name'] ?? { id: -1, value: null };
      enquiryInfo['existing_school_details']['board'] = enquiryDetails[
        'existing_school_details'
      ]['board'] ?? { id: -1, value: null };
      enquiryInfo['existing_school_details']['grade'] = enquiryDetails[
        'existing_school_details'
      ]['grade'] ?? { id: -1, value: null };
    }

    const studentDetails = {
      first_name: student_details.first_name,
      last_name: student_details.last_name,
      grade: student_details.grade ?? { id: -1, value: null },
      gender: student_details.gender ?? { id: -1, value: null },
      dob: student_details.dob ?? null,
      eligible_grade: student_details?.eligible_grade
        ? student_details?.eligible_grade
        : null,
      place_of_birth: student_details?.place_of_birth ?? null,
      religion: student_details?.religion ?? null,
      caste: student_details?.caste ?? null,
      sub_caste: student_details?.sub_caste ?? null,
      nationality: student_details?.nationality ?? null,
      aadhar: student_details?.aadhar ?? null,
      mother_tongue: student_details?.mother_tongue ?? null,
    };
    enquiryInfo['student_details'] = studentDetails;
    enquiryInfo['psa_sub_type'] = enquiryDetails['psa_sub_type'] ?? {
      id: -1,
      value: null,
    };
    enquiryInfo['psa_category'] = enquiryDetails['psa_category'] ?? {
      id: -1,
      value: null,
    };
    enquiryInfo['psa_sub_category'] = enquiryDetails['psa_sub_category'] ?? {
      id: -1,
      value: null,
    };
    enquiryInfo['psa_period_of_service'] = enquiryDetails[
      'psa_period_of_service'
    ] ?? { id: -1, value: null };
    enquiryInfo['psa_batch'] = enquiryDetails['psa_batch'] ?? {
      id: -1,
      value: null,
    };
    enquiryInfo['documents'] = documents;
    return enquiryInfo;
  }

  async getKidsClubEnquiryDetails(enquiryId: string) {
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
      enquiry_date,
      academic_year,
      school_location,
      parent_details,
      existing_school_details,
      student_details,
      documents,
      other_details,
    } = enquiryDetails;

    if (other_details?.enquiry_type?.toLowerCase() !== 'kidsclub') {
      throw new HttpException(
        'Provided enquiry Id does not match any kids club type enquiry',
        HttpStatus.BAD_REQUEST,
      );
    }
    const academicYearDetails = await this.mdmService.fetchDataFromAPI(
      `${MDM_API_URLS.ACADEMIC_YEAR}/${enquiryDetails.academic_year.id}`,
    );

    const enquiryInfo = {
      enquiry_date: moment(new Date(enquiry_date)).format('DD-MM-YYYY'),
      academic_year: {
        ...academic_year,
        short_name_two_digit:
          +academicYearDetails?.data?.attributes?.short_name_two_digit,
      },
      school_location,
    };

    const parentDetails = {
      father_details: {
        global_id: parent_details.father_details.global_id,
        first_name: parent_details.father_details.first_name,
        last_name: parent_details.father_details.last_name,
        email: parent_details.father_details.email,
        mobile: parent_details.father_details.mobile,
      },
      mother_details: {
        global_id: parent_details.mother_details.global_id,
        first_name: parent_details.mother_details.first_name,
        last_name: parent_details.mother_details.last_name,
        email: parent_details.mother_details.email,
        mobile: parent_details.mother_details.mobile,
      },
    };
    enquiryInfo['parent_details'] = parentDetails;
    enquiryInfo['enquirer_parent'] = (other_details as any).parent_type;

    if (!existing_school_details) {
      enquiryInfo['existing_school_details'] = {
        name: {
          id: -1,
          value: null,
        },
        board: {
          id: -1,
          value: null,
        },
        grade: {
          id: -1,
          value: null,
        },
      };
    } else {
      enquiryInfo['existing_school_details'] = new Object();
      enquiryInfo['existing_school_details']['name'] =
        existing_school_details.name ?? { id: -1, value: null };
      enquiryInfo['existing_school_details']['board'] =
        existing_school_details.board ?? { id: -1, value: null };
      enquiryInfo['existing_school_details']['grade'] =
        existing_school_details.grade ?? { id: -1, value: null };
    }

    const studentDetails = {
      first_name: student_details.first_name,
      last_name: student_details.last_name,
      grade: student_details.grade ?? { id: -1, value: null },
      gender: student_details.gender ?? { id: -1, value: null },
      dob: student_details.dob ?? null,
      eligible_grade: student_details?.eligible_grade
        ? student_details?.eligible_grade
        : null,
      place_of_birth: student_details?.place_of_birth ?? null,
      religion: student_details?.religion ?? null,
      caste: student_details?.caste ?? null,
      sub_caste: student_details?.sub_caste ?? null,
      nationality: student_details?.nationality ?? null,
      aadhar: student_details?.aadhar ?? null,
      mother_tongue: student_details?.mother_tongue ?? null,
    };
    enquiryInfo['student_details'] = studentDetails;
    enquiryInfo['board'] = enquiryDetails['board'] ?? { id: -1, value: null };
    enquiryInfo['course'] = enquiryDetails['course'] ?? { id: -1, value: null };
    enquiryInfo['stream'] = enquiryDetails['stream'] ?? { id: -1, value: null };
    enquiryInfo['shift'] = enquiryDetails['shift'] ?? { id: -1, value: null };
    enquiryInfo['kids_club_type'] = enquiryDetails['kids_club_type'] ?? {
      id: -1,
      value: null,
    };
    enquiryInfo['kids_club_batch'] = enquiryDetails['kids_club_batch'] ?? {
      id: -1,
      value: null,
    };
    enquiryInfo['kids_club_period_of_service'] = enquiryDetails[
      'kids_club_period_of_service'
    ] ?? {
      id: -1,
      value: null,
    };
    enquiryInfo['kids_club_month'] = enquiryDetails['kids_club_month'] ?? {
      id: -1,
      value: null,
    };
    enquiryInfo['kids_club_from_cafeteria_opt_for'] = enquiryDetails[
      'kids_club_from_cafeteria_opt_for'
    ] ?? {
      id: -1,
      value: null,
    };
    enquiryInfo['documents'] = documents;
    return enquiryInfo;
  }

  async editNewAdmissionEnquiryDetails(
    enquiryId: string,
    updatePayload: Record<string, any>,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (updatePayload?.enquiry_date) delete updatePayload?.enquiry_date;
    if (
      enquiryDetails?.other_details?.enquiry_type.toLowerCase() !==
      'newadmission'
    ) {
      throw new HttpException(
        'Cannot edit enquiry as enquiry is not a new admission enquiry',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatedEnquiryDetails = await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      updatePayload,
    );
    return updatedEnquiryDetails;
  }

  async editPsaEnquiryDetails(
    enquiryId: string,
    updatePayload: Record<string, any>,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (enquiryDetails?.other_details?.enquiry_type.toLowerCase() !== 'psa') {
      throw new HttpException(
        'Cannot edit enquiry as enquiry is not a psa enquiry',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updatePayload?.enquiry_date) delete updatePayload?.enquiry_date;
    const updatedEnquiryDetails = await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      {
        ...updatePayload,
      },
    );
    return updatedEnquiryDetails;
  }

  async editKidsClubEnquiryDetails(
    enquiryId: string,
    updatePayload: Record<string, any>,
  ) {
    const enquiryDetails = await this.enquiryRepository.getById(
      new Types.ObjectId(enquiryId),
    );

    if (!enquiryDetails) {
      throw new HttpException(
        'Enquiry details not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (updatePayload?.enquiry_date) delete updatePayload?.enquiry_date;
    if (
      enquiryDetails?.other_details?.enquiry_type.toLowerCase() !== 'kidsclub'
    ) {
      throw new HttpException(
        'Cannot edit enquiry as enquiry is not a kids club enquiry',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedEnquiryDetails = await this.enquiryRepository.updateById(
      new Types.ObjectId(enquiryId),
      updatePayload,
    );
    return updatedEnquiryDetails;
  }
}
