import { RequestMethod } from '@nestjs/common';

export const appRegistrationAuthorizedRoutes = [
  {
    path: '/app/registration/:enquiryId',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/registration/:enquiryId/parent-details',
    method: RequestMethod.PATCH,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/registration/:enquiryId/contact-details',
    method: RequestMethod.PATCH,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/registration/:enquiryId/medical-details',
    method: RequestMethod.PATCH,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/app/registration/:enquiryId/bank-details',
    method: RequestMethod.PATCH,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
];
