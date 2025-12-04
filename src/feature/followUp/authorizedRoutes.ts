import { RequestMethod } from '@nestjs/common';

export const followUpAuthorizedRoutes = [
  {
    path: '/follow-up/:enquiryId/create',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
];
