import { RequestMethod } from '@nestjs/common';

import { admissionAuthorizedRoutes } from '../../feature/admission/authorizedRoutes';
import { competencyTestAuthorizedRoutes } from '../../feature/competencyTest/authorizedRoutes';
import { appEnquiryAuthorizedRoutes } from '../../feature/enquiry/app/authorizedRoutes';
import { enquiryAuthorizedRoutes } from '../../feature/enquiry/authorizedRoutes';
import { enquiryStageAuthorizedRoutes } from '../../feature/enquiryStage/authorizedRoutes';
import { enquiryTypeAuthorizedRoutes } from '../../feature/enquiryType/authorizedRoutes';
import { followUpAuthorizedRoutes } from '../../feature/followUp/authorizedRoutes';
import { myTaskAuthorizedRoutes } from '../../feature/myTask/authorizedRoutes';
import { appRegistrationAuthorizedRoutes } from '../../feature/registration/app/authorizedRoutes';
import { registrationAuthorizedRoutes } from '../../feature/registration/authorizedRoutes';
import { schoolVisitAuthorizedRoutes } from '../../feature/schoolVisit/authorizedRoutes';
import { slotAuthorizedRoutes } from '../../feature/slots/authorizedRoutes';

export const routes = [
  ...enquiryAuthorizedRoutes,
  ...admissionAuthorizedRoutes,
  ...followUpAuthorizedRoutes,
  ...registrationAuthorizedRoutes,
  ...enquiryStageAuthorizedRoutes,
  ...enquiryTypeAuthorizedRoutes,
  ...schoolVisitAuthorizedRoutes,
  ...competencyTestAuthorizedRoutes,
  ...myTaskAuthorizedRoutes,
  ...appEnquiryAuthorizedRoutes,
  ...appRegistrationAuthorizedRoutes,
  ...slotAuthorizedRoutes,
];

// Auth is excluded for these routes as these routes are mainly used for interservice communication
// TODO: Remove these routes once other services pass token in the API call
export const excludedRoutes = [
  {
    path: '/enquiry/eligible-grade',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/finance/enquiry-details',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/finance/enquiry-list/search',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/finance/payment-status',
    method: RequestMethod.POST,
  },
  {
    path: '/app/enquiry/:enquiryId',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/:enquiryId/:schoolId/generate-terms-and-conditions-pdf',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/:enquiryId/accept-terms-and-condition',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/eligible-grade',
    method: RequestMethod.GET,
  },
  {
    path: '/admission/:enrolmentNumber/student-details',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/:enquiryId/ivt-status',
    method: RequestMethod.PATCH,
  },
  {
    path: '/enquiry/referrals/:id',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/referrals/:id',
    method: RequestMethod.POST,
  },
  {
    path: '/enquiry/getDublicateEnquiry',
    method: RequestMethod.POST,
  },
  {
    path: '/enquiry/getDublicateEnquiry/enr',
    method: RequestMethod.PATCH,
  },
  {
    path: '/enquiry/ivt-status/getEnquiry',
    method: RequestMethod.POST,
  },
  {
    path: '/enquiry/get/report/:jobId',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/request-report/:reportType',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/ay/admission-enquiry-report',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/:id/move-to-next-stage',
    method: RequestMethod.PATCH,
  },
  {
    path: 'enquiry/handleReopn',
    method: RequestMethod.POST,
  },
  {
    path: 'referral-view/:id',
    method: RequestMethod.GET,
  },
  {
    path: '/referral-view?error=:error',
    method: RequestMethod.GET,
  },
  //! Temporary excluded routes for vgos integration
  {
    path: 'enquiry/pre.vgos.org/:id',
    method: RequestMethod.GET,
  },
  {
    path: '/enquiry/getshortUrl/:id',
    method: RequestMethod.GET,
  },
];
