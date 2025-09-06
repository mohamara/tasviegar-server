import moment from 'moment-jalaali';

// تنظیم زبان فارسی
moment.loadPersian({ usePersianDigits: true });

/**
 * تبدیل تاریخ میلادی به شمسی
 */
export const toJalali = (date: string | Date): string => {
  return moment(date).format('jYYYY/jMM/jDD');
};

/**
 * تبدیل تاریخ میلادی به شمسی با زمان
 */
export const toJalaliWithTime = (date: string | Date): string => {
  return moment(date).format('jYYYY/jMM/jDD - HH:mm');
};

/**
 * تبدیل تاریخ شمسی به میلادی
 */
export const fromJalali = (jalaliDate: string): Date => {
  return moment(jalaliDate, 'jYYYY/jMM/jDD').toDate();
};

/**
 * بررسی معتبر بودن تاریخ شمسی
 */
export const isValidJalaliDate = (jalaliDate: string): boolean => {
  return moment(jalaliDate, 'jYYYY/jMM/jDD', true).isValid();
};

/**
 * گرفتن تاریخ امروز به شمسی
 */
export const getTodayJalali = (): string => {
  return moment().format('jYYYY/jMM/jDD');
};

/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export const toPersianNumber = (num: number | string): string => {
  if (num === null || num === undefined || isNaN(Number(num))) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

/**
 * تبدیل اعداد فارسی به انگلیسی
 */
export const toEnglishNumber = (persianNum: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = persianNum;
  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), englishDigits[index]);
  });
  
  return result;
};

/**
 * فرمت کردن تاریخ برای نمایش
 */
export const formatJalaliDate = (date: string | Date, format: string = 'jYYYY/jMM/jDD'): string => {
  return moment(date).format(format);
};

/**
 * مقایسه دو تاریخ شمسی
 */
export const compareJalaliDates = (date1: string, date2: string): number => {
  const moment1 = moment(date1, 'jYYYY/jMM/jDD');
  const moment2 = moment(date2, 'jYYYY/jMM/jDD');
  
  if (moment1.isBefore(moment2)) return -1;
  if (moment1.isAfter(moment2)) return 1;
  return 0;
};

/**
 * اضافه کردن روز به تاریخ شمسی
 */
export const addDaysToJalali = (jalaliDate: string, days: number): string => {
  return moment(jalaliDate, 'jYYYY/jMM/jDD').add(days, 'days').format('jYYYY/jMM/jDD');
};

/**
 * اضافه کردن ماه به تاریخ شمسی
 */
export const addMonthsToJalali = (jalaliDate: string, months: number): string => {
  return moment(jalaliDate, 'jYYYY/jMM/jDD').add(months, 'jMonth').format('jYYYY/jMM/jDD');
};

/**
 * اضافه کردن سال به تاریخ شمسی
 */
export const addYearsToJalali = (jalaliDate: string, years: number): string => {
  return moment(jalaliDate, 'jYYYY/jMM/jDD').add(years, 'jYear').format('jYYYY/jMM/jDD');
};

/**
 * گرفتن تفاوت بین دو تاریخ (به روز)
 */
export const getDaysDifference = (date1: string, date2: string): number => {
  const moment1 = moment(date1, 'jYYYY/jMM/jDD');
  const moment2 = moment(date2, 'jYYYY/jMM/jDD');
  return moment2.diff(moment1, 'days');
};

/**
 * گرفتن سن از تاریخ تولد شمسی
 */
export const getAgeFromJalaliBirthDate = (birthDate: string): number => {
  const birthMoment = moment(birthDate, 'jYYYY/jMM/jDD');
  const now = moment();
  return now.diff(birthMoment, 'years');
};

/**
 * فرمت کردن زمان نسبی (مثل "2 ساعت پیش")
 */
export const getRelativeTime = (date: string | Date): string => {
  return moment(date).fromNow();
};

/**
 * گرفتن تاریخ شروع و پایان هفته شمسی
 */
export const getJalaliWeekRange = (jalaliDate: string): { start: string; end: string } => {
  const date = moment(jalaliDate, 'jYYYY/jMM/jDD');
  const startOfWeek = date.clone().startOf('week').add(1, 'day'); // شنبه
  const endOfWeek = date.clone().endOf('week').add(1, 'day'); // جمعه
  
  return {
    start: startOfWeek.format('jYYYY/jMM/jDD'),
    end: endOfWeek.format('jYYYY/jMM/jDD')
  };
};

/**
 * گرفتن تاریخ شروع و پایان ماه شمسی
 */
export const getJalaliMonthRange = (jalaliDate: string): { start: string; end: string } => {
  const date = moment(jalaliDate, 'jYYYY/jMM/jDD');
  const startOfMonth = date.clone().startOf('jMonth');
  const endOfMonth = date.clone().endOf('jMonth');
  
  return {
    start: startOfMonth.format('jYYYY/jMM/jDD'),
    end: endOfMonth.format('jYYYY/jMM/jDD')
  };
};

/**
 * گرفتن تاریخ شروع و پایان سال شمسی
 */
export const getJalaliYearRange = (jalaliDate: string): { start: string; end: string } => {
  const date = moment(jalaliDate, 'jYYYY/jMM/jDD');
  const startOfYear = date.clone().startOf('jYear');
  const endOfYear = date.clone().endOf('jYear');
  
  return {
    start: startOfYear.format('jYYYY/jMM/jDD'),
    end: endOfYear.format('jYYYY/jMM/jDD')
  };
};

/**
 * تبدیل تاریخ شمسی به timestamp برای ذخیره در دیتابیس
 */
export const jalaliToTimestamp = (jalaliDate: string): Date => {
  return moment(jalaliDate, 'jYYYY/jMM/jDD').toDate();
};

/**
 * تبدیل timestamp به تاریخ شمسی برای نمایش
 */
export const timestampToJalali = (timestamp: Date): string => {
  return moment(timestamp).format('jYYYY/jMM/jDD');
};

/**
 * تبدیل timestamp به تاریخ شمسی با زمان برای نمایش
 */
export const timestampToJalaliWithTime = (timestamp: Date): string => {
  return moment(timestamp).format('jYYYY/jMM/jDD - HH:mm');
};

/**
 * اعتبارسنجی تاریخ شمسی برای DTO
 */
export const validateJalaliDate = (jalaliDate: string): boolean => {
  if (!jalaliDate || typeof jalaliDate !== 'string') {
    return false;
  }
  
  // بررسی فرمت YYYY/MM/DD
  const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!dateRegex.test(jalaliDate)) {
    return false;
  }
  
  return isValidJalaliDate(jalaliDate);
};

/**
 * تبدیل تاریخ شمسی به فرمت ISO برای API
 */
export const jalaliToISO = (jalaliDate: string): string => {
  return moment(jalaliDate, 'jYYYY/jMM/jDD').toISOString();
};

/**
 * تبدیل تاریخ ISO به شمسی
 */
export const isoToJalali = (isoDate: string): string => {
  return moment(isoDate).format('jYYYY/jMM/jDD');
};
