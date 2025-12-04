import { RequestMethod } from '@nestjs/common';

export const schoolVisitAuthorizedRoutes = [
  {
    path: '/school-visit/slots',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/school-visit/unavailable/add',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/school-visit/unavailable/available-slot-list',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/school-visit/:enquiryId',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/school-visit/:enquiryId/schedule',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
  {
    path: '/school-visit/:enquiryId/cancel',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
  {
    path: '/school-visit/:enquiryId/complete',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
  {
    path: '/school-visit/:enquiryId/reschedule',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
];
