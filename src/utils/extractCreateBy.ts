import { Request } from 'express';

import { CreatedByDetailsDto } from '../middleware/auth/auth.dto';

export const extractCreatedByDetailsFromBody = (
  req: Request,
): CreatedByDetailsDto | null => {
  if (req?.body?.created_by) {
    return req.body.created_by;
  }
  return null;
};
