import * as moment from 'moment';
import { Moment } from 'moment';


export function now(offset: number = 0) {
  return moment.utc().utcOffset(offset);
}

export function toDateString(date: Moment) {
  return date.format('Y-MM-DD');
}

export function toDatetimeString(date: Moment) {
  return date.format('Y-MM-DD HH:mm:ss');
}
