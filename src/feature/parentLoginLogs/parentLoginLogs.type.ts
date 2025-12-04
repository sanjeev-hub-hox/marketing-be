import { Types } from 'mongoose';

export type ParentActionLogs = {
  _id?: Types.ObjectId;
  enrolmentNumber?: string;
  studentId?: string;
  event: ParentLoginEvent;
  action: string;
  log_data: any;
  ip:string
};

export enum ParentLoginEvent {
  MAP_SIBLING_API = 'map-correct-sibling',
  MAP_GUARDIAN_API = 'map-correct-guardian', 
  GET_CHILD_PARENT_API = 'validate-child-parent',
  SMS = 'SMS',
}
