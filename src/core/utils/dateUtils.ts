import moment, { Duration } from 'moment';
import { logger } from './logger';
import { DateTime } from 'luxon';

export class DateUtils {
  static userTimeZone: string = 'Asia/Kolkata'; // Default, can be set dynamically

  static formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = String(date.getFullYear()).slice(2);

    return `${day}-${month}-${year}`;
  }

  static convertTo24HourFormat(time) {
    const [hour, minute] = time.split(':');
    const isPM = time.slice(-2) === 'PM' || time.slice(-2) === 'pm';
    let hour24 = parseInt(hour, 10);
    if (isPM && hour24 < 12) {
      hour24 += 12;
    } else if (!isPM && hour24 === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  }

  static isBetweenSlotTimes(start_time: string, end_time: string, current_time: Date) {
    const options = {
      hour12: false,
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    } as const;
    if (!start_time && !end_time) return false;
    let appointmentTime = current_time.toLocaleString('en-IN', options);
    // let current_time_mom = moment(current_time);
    // let appointmentTime = current_time_mom.tz('Asia/Kolkata').format('HH:mm');
    const startTime24 = this.convertTo24HourFormat(start_time);
    let endTime24 = this.convertTo24HourFormat(end_time);
    if (startTime24?.split(' ')[0] == '23:00' && endTime24?.split(' ')[0] == '00:00') {
      console.log(endTime24);
      endTime24 = '24:00 PM';
    }
    const isBetweenSlotTimes =
      startTime24?.split(' ')[0] <= appointmentTime && appointmentTime < endTime24?.split(' ')[0];
    return isBetweenSlotTimes;
  }

  static findDiffInHrs(start_date: Date, end_date: Date): number {
    let mom_start_time = moment(start_date, 'HH:mm a');
    let mom_end_time = moment(end_date, 'HH:mm a');
    let diff: Duration = moment.duration(mom_start_time.diff(mom_end_time));

    return diff.asHours();
  }
  static findDiffInWeek(start_date: Date, end_date: Date): number {
    let mom_start_time = moment(start_date, 'HH:mm a');
    let mom_end_time = moment(end_date, 'HH:mm a');
    let diff: Duration = moment.duration(mom_start_time.diff(mom_end_time));

    return diff.asWeeks();
  }

  static addHours(date: Date, hours: number): Date {
    let m_date = moment(date);
    let final_date = moment(m_date).add(hours, 'hours');
    return new Date(final_date.toISOString());
  }

  async isTimestampInThePast(givenTimestamp: Date) {
    const givenDate = new Date(givenTimestamp);
    const currentDate = new Date();
    logger.info('check_appointment_time_is_past: ' + JSON.stringify(givenDate < currentDate));
    return givenDate < currentDate;
  }

  static convertToGMT(inputDateString: string): string {
    // Convert input date string to Date object
    const inputDate = new Date(inputDateString);

    // Get individual components of the date
    const year = inputDate.getUTCFullYear();
    const month = `0${inputDate.getUTCMonth() + 1}`.slice(-2);
    const day = `0${inputDate.getUTCDate()}`.slice(-2);
    const hours = `0${inputDate.getUTCHours()}`.slice(-2);
    const minutes = `0${inputDate.getUTCMinutes()}`.slice(-2);
    const seconds = `0${inputDate.getUTCSeconds()}`.slice(-2);

    // Create GMT date string
    const gmtDateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;

    return gmtDateString;
  }

  static convertToUTC(timeString: string) {
    return DateTime.fromFormat(timeString, 'HH:mm', { zone: this.userTimeZone }).setZone('UTC').toFormat('HH:mm');
  }

  static convertFromUTC(timeString: string) {
    return DateTime.fromFormat(timeString, 'HH:mm:ss', { zone: 'UTC' }).setZone(this.userTimeZone).toFormat('HH:mm:ss');
  }
}
