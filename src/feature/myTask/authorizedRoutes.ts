import { RequestMethod } from '@nestjs/common';

export const myTaskAuthorizedRoutes = [
  {
    path: '/my-task/create',
    method: RequestMethod.POST,
    permissions: '*',
    authenticate: true,
    authorize: false,
  },
  {
    path: '/my-task/list',
    method: RequestMethod.GET,
    permissions: '*',
    authenticate: true,
    authorize: true,
  },
];
