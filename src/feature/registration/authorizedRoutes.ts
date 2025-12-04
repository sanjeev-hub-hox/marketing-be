import { RequestMethod } from '@nestjs/common';

export const registrationAuthorizedRoutes = [
  {
    path: '/enquiry-registration/list',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
  {
    path: '/enquiry-registration/list/global-search',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
];
