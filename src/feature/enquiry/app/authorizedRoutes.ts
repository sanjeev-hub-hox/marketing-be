import { RequestMethod } from '@nestjs/common';

export const appEnquiryAuthorizedRoutes = [
  {
    path: '/app/enquiry/enquiry-list',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/enquiry/admission-list',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/enquiry/:enquiryId/admission-journey',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/enquiry/:enquiryId/new-admission',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/enquiry/:enquiryId/psa',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/enquiry/:enquiryId/kids-club',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  // {
  //   path: '/app/enquiry/:enquiryId',
  //   method: RequestMethod.GET,
  //   permissions: '*',
  //   authenticate: true,
  //   authorize: false,
  // },
  {
    path: '/app/enquiry/:enquiryId/new-admission',
    method: RequestMethod.PATCH,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/enquiry/:enquiryId/psa',
    method: RequestMethod.PATCH,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/enquiry/:enquiryId/kids-club',
    method: RequestMethod.PATCH,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
];
