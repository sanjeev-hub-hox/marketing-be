import { RequestMethod } from '@nestjs/common';

export const competencyTestAuthorizedRoutes = [
  {
    path: '/competency-test/slots',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/competency-test/unavailable/add',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/competency-test/unavailable/available-slot-list',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/competency-test/:enquiryId',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/competency-test/:enquiryId/create',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
  {
    path: '/competency-test/:enquiryId/cancel',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
  {
    path: '/competency-test/:enquiryId/reschedule',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
  {
    path: '/competency-test/:enquiryId/update-test-result',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
];
