import { RequestMethod } from '@nestjs/common';

export const enquiryStageAuthorizedRoutes = [
  {
    path: '/enquiry-stage/create',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
  {
    path: '/enquiry-stage/list',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/enquiry-stage/:stageId',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/enquiry-stage/:stageId',
    method: RequestMethod.PATCH,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/enquiry-stage/:stageId',
    method: RequestMethod.DELETE,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/enquiry-stage/mapping/list',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/enquiry-stage/list/global-search',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
];
