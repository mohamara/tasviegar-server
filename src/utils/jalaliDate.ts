import moment from 'moment-jalaali';

// تنظیم زبان فارسی
moment.loadPersian({ usePersianDigits: true });

// تبدیل تاریخ میلادی به شمسی
export const toJalali = (date: string | Date) => {
  return moment(date).format('jYYYY/jMM/jDD');
};

// تبدیل تاریخ میلادی به شمسی با فرمت کامل
export const toJalaliWithTime = (date: string | Date) => {
  return moment(date).format('jYYYY/jMM/jDD - HH:mm');
};

// گرفتن تاریخ امروز به شمسی
export const getTodayJalali = () => {
  return moment().format('jYYYY/jMM/jDD');
};

// تبدیل تاریخ شمسی به میلادی
export const fromJalali = (jalaliDate: string) => {
  return moment(jalaliDate, 'jYYYY/jMM/jDD').toDate();
};

// فرمت نمایش تاریخ شمسی با نام ماه
export const toJalaliWithMonthName = (date: string | Date) => {
  return moment(date).format('jDD jMMMM jYYYY');
};

// ماه‌های شمسی
export const jalaliMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// تبدیل اعداد انگلیسی به فارسی
export const toPersianNumber = (num: number | string) => {
  if (num === null || num === undefined || isNaN(Number(num))) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

// تبدیل اعداد فارسی به انگلیسی
export const toEnglishNumber = (persianNum: string) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = persianNum;
  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), englishDigits[index]);
  });
  
  return result;
};
