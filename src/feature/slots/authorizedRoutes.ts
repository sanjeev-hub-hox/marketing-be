import { RequestMethod } from '@nestjs/common';

export const slotAuthorizedRoutes = [
  {
    path: '/slots/add-master-slots',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
];
