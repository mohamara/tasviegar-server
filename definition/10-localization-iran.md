# 🇮🇷 بومی‌سازی برای بازار ایران - Settler App

## نمای کلی
تطبیق اپلیکیشن Settler با **فرهنگ ایرانی**، **زبان فارسی**، و **نیازهای محلی** کاربران ایرانی.

## 🔤 پشتیبانی از زبان فارسی

### 1. **راست به چپ (RTL) Layout**
```typescript
// RTL Configuration
const LayoutConfig = {
  direction: 'rtl',
  textAlign: 'right',
  flexDirection: 'row-reverse'
};

// React Native RTL Setup
import { I18nManager } from 'react-native';

// Enable RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// CSS for Web
.rtl {
  direction: rtl;
  text-align: right;
}

.rtl .flex-row {
  flex-direction: row-reverse;
}
```

### 2. **فونت فارسی**
```typescript
// Font Configuration
const PersianFonts = {
  primary: 'Vazir', // فونت اصلی
  secondary: 'Sahel', // فونت دوم
  numbers: 'Vazir-FD', // اعداد فارسی
};

// StyleSheet
const styles = StyleSheet.create({
  persianText: {
    fontFamily: 'Vazir',
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  persianTitle: {
    fontFamily: 'Vazir-Bold',
    fontSize: 20,
    fontWeight: '700',
  }
});
```

### 3. **ترجمه محتوا**
```typescript
// Translations (fa.json)
export const persianTranslations = {
  // Navigation
  dashboard: 'داشبورد',
  debts: 'بدهی‌ها',
  groups: 'گروه‌ها',
  profile: 'پروفایل',
  settings: 'تنظیمات',

  // Auth
  login: 'ورود',
  register: 'ثبت‌نام',
  email: 'ایمیل',
  password: 'رمز عبور',
  confirmPassword: 'تکرار رمز عبور',
  forgotPassword: 'فراموشی رمز عبور',
  
  // User Info
  firstName: 'نام',
  lastName: 'نام خانوادگی',
  phoneNumber: 'شماره موبایل',
  nationalId: 'کد ملی',
  
  // Debt Management
  createDebt: 'ایجاد بدهی',
  debtAmount: 'مبلغ بدهی',
  description: 'توضیحات',
  dueDate: 'تاریخ سررسید',
  creditor: 'طلبکار',
  debtor: 'بدهکار',
  
  // Status
  pending: 'در انتظار',
  acknowledged: 'تایید شده',
  disputed: 'اختلاف',
  settled: 'تسویه شده',
  overdue: 'عقب‌افتاده',
  
  // Categories
  categories: {
    food: 'غذا و نوشیدنی',
    transport: 'حمل و نقل',
    rent: 'اجاره',
    utilities: 'آب و برق و گاز',
    entertainment: 'تفریح',
    shopping: 'خرید',
    health: 'بهداشت و درمان',
    education: 'آموزش',
    personal: 'شخصی',
    other: 'سایر'
  },

  // Group Types
  groupTypes: {
    household: 'خانوار',
    friends: 'دوستان',
    work: 'محل کار',
    trip: 'مسافرت',
    project: 'پروژه'
  },

  // Messages
  messages: {
    debtCreated: 'بدهی با موفقیت ایجاد شد',
    debtUpdated: 'بدهی به‌روزرسانی شد',
    settlementRequested: 'درخواست تسویه ارسال شد',
    paymentConfirmed: 'پرداخت تایید شد',
    
    // Error Messages
    invalidAmount: 'مبلغ وارد شده معتبر نیست',
    networkError: 'خطا در اتصال به اینترنت',
    serverError: 'خطا در سرور، لطفاً دوباره تلاش کنید',
  },

  // Persian-specific
  currency: 'تومان',
  rial: 'ریال',
  persianCalendar: 'تقویم شمسی',
  solarDate: 'تاریخ شمسی',
};
```

## 📅 تقویم شمسی و تاریخ

### 1. **تبدیل تاریخ**
```typescript
// Persian Date Utils
import moment from 'moment-jalaali';

class PersianDateService {
  // Convert Gregorian to Persian
  static toPersian(date: Date): string {
    return moment(date).format('jYYYY/jMM/jDD');
  }

  // Convert Persian to Gregorian
  static toGregorian(persianDate: string): Date {
    return moment(persianDate, 'jYYYY/jMM/jDD').toDate();
  }

  // Format for display
  static formatDisplay(date: Date): string {
    const persian = moment(date);
    return `${persian.format('jDD')} ${this.getMonthName(persian.jMonth())} ${persian.format('jYYYY')}`;
  }

  // Persian month names
  static getMonthName(month: number): string {
    const months = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
      'مرداد', 'شهریور', 'مهر', 'آبان',
      'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    return months[month];
  }

  // Persian day names
  static getDayName(day: number): string {
    const days = [
      'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه',
      'پنج‌شنبه', 'جمعه', 'شنبه'
    ];
    return days[day];
  }
}

// Date Picker Component
const PersianDatePicker = () => {
  return (
    <DatePicker
      mode="calendar"
      calendar="persian"
      locale="fa"
      placeholder="انتخاب تاریخ"
      format="YYYY/MM/DD"
    />
  );
};
```

### 2. **اعداد فارسی**
```typescript
// Persian Number Utils
class PersianNumber {
  static persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  static englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Convert English to Persian
  static toPersian(input: string | number): string {
    const str = input.toString();
    let result = str;
    
    this.englishDigits.forEach((digit, index) => {
      const regex = new RegExp(digit, 'g');
      result = result.replace(regex, this.persianDigits[index]);
    });
    
    return result;
  }

  // Convert Persian to English
  static toEnglish(input: string): string {
    let result = input;
    
    this.persianDigits.forEach((digit, index) => {
      const regex = new RegExp(digit, 'g');
      result = result.replace(regex, this.englishDigits[index]);
    });
    
    return result;
  }

  // Format currency for Iran
  static formatCurrency(amount: number): string {
    const formatted = new Intl.NumberFormat('fa-IR').format(amount);
    return `${this.toPersian(formatted)} تومان`;
  }
}
```

## 💰 واحد پولی ایران

### 1. **ریال و تومان**
```typescript
// Currency Configuration
interface IranCurrency {
  rial: number;    // واحد اصلی (ریال)
  toman: number;   // واحد متداول (تومان = ریال ÷ ۱۰)
}

class IranCurrencyService {
  // Convert Rial to Toman
  static rialToToman(rial: number): number {
    return rial / 10;
  }

  // Convert Toman to Rial
  static tomanToRial(toman: number): number {
    return toman * 10;
  }

  // Format amount with proper separators
  static formatAmount(amount: number, unit: 'rial' | 'toman' = 'toman'): string {
    const value = unit === 'toman' ? amount : this.rialToToman(amount);
    const formatted = new Intl.NumberFormat('fa-IR').format(value);
    const unitText = unit === 'toman' ? 'تومان' : 'ریال';
    
    return `${PersianNumber.toPersian(formatted)} ${unitText}`;
  }

  // Parse user input (handle both ریال and تومان)
  static parseAmount(input: string): { amount: number; unit: 'rial' | 'toman' } {
    const cleanInput = PersianNumber.toEnglish(input.replace(/[^\d۰-۹]/g, ''));
    const amount = parseInt(cleanInput) || 0;
    
    // Detect unit from original input
    const unit = input.includes('ریال') ? 'rial' : 'toman';
    
    return { amount, unit };
  }
}

// Amount Input Component
const AmountInput = ({ value, onChange, placeholder = "مبلغ را وارد کنید" }) => {
  const [displayValue, setDisplayValue] = useState('');
  
  const handleChange = (input: string) => {
    const { amount, unit } = IranCurrencyService.parseAmount(input);
    setDisplayValue(IranCurrencyService.formatAmount(amount, unit));
    onChange(amount);
  };

  return (
    <TextInput
      value={displayValue}
      onChangeText={handleChange}
      placeholder={placeholder}
      keyboardType="numeric"
      textAlign="right"
      style={styles.persianInput}
    />
  );
};
```

## 🏦 پرداخت و بانکداری ایران

### 1. **سیستم‌های پرداخت محلی**
```typescript
// Iranian Payment Methods
const iranianPaymentMethods = {
  // کیف پول‌های دیجیتال
  digitalWallets: [
    { id: 'sadad', name: 'سداد', icon: '💳' },
    { id: 'shaparak', name: 'شاپرک', icon: '🏦' },
    { id: 'payping', name: 'پی‌پینگ', icon: '📱' },
    { id: 'zarinpal', name: 'زرین‌پال', icon: '💰' },
    { id: 'parspal', name: 'پارس‌پال', icon: '💎' },
  ],

  // بانک‌های اصلی
  banks: [
    { id: 'melli', name: 'بانک ملی', code: '017' },
    { id: 'tejarat', name: 'بانک تجارت', code: '018' },
    { id: 'saderat', name: 'بانک صادرات', code: '019' },
    { id: 'mellat', name: 'بانک ملت', code: '012' },
    { id: 'pasargad', name: 'بانک پاسارگاد', code: '057' },
  ],

  // روش‌های نقدی
  cash: [
    { id: 'cash', name: 'نقدی', icon: '💵' },
    { id: 'pos', name: 'کارت‌خوان', icon: '💳' },
  ]
};

// IBAN Validation for Iran
class IranBankingService {
  static validateIban(iban: string): boolean {
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    
    // Iran IBAN format: IR + 2 digits + 22 digits
    const iranIbanPattern = /^IR\d{24}$/;
    
    if (!iranIbanPattern.test(cleanIban)) return false;
    
    // IBAN checksum validation
    return this.validateIbanChecksum(cleanIban);
  }

  static validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and validate Iranian bank card formats
    const clean = cardNumber.replace(/\s/g, '');
    
    // Iranian card numbers are 16 digits
    if (!/^\d{16}$/.test(clean)) return false;
    
    // Check Iranian bank prefixes
    const iranianBankPrefixes = [
      '627353', '627381', '627412', '627488', '627648',
      '627760', '627884', '627412', '622106', '627593'
    ];
    
    return iranianBankPrefixes.some(prefix => 
      clean.startsWith(prefix)
    );
  }
}
```

### 2. **درگاه‌های پرداخت**
```typescript
// Payment Gateway Integration
interface PaymentGateway {
  id: string;
  name: string;
  arabicName: string;
  commission: number;
  maxAmount: number;
  supportedMethods: string[];
}

const iranianPaymentGateways: PaymentGateway[] = [
  {
    id: 'zarinpal',
    name: 'ZarinPal',
    arabicName: 'زرین‌پال',
    commission: 0.015, // 1.5%
    maxAmount: 500000000, // 50 million toman
    supportedMethods: ['card', 'wallet', 'direct']
  },
  {
    id: 'sadad',
    name: 'Sadad',
    arabicName: 'سداد',
    commission: 0.02, // 2%
    maxAmount: 1000000000, // 100 million toman
    supportedMethods: ['card', 'internet_banking']
  }
];

// Payment Service
class IranPaymentService {
  async initiatePayment(amount: number, gateway: string): Promise<PaymentResponse> {
    const selectedGateway = iranianPaymentGateways.find(g => g.id === gateway);
    
    if (!selectedGateway) {
      throw new Error('درگاه پرداخت انتخاب شده معتبر نیست');
    }

    if (amount > selectedGateway.maxAmount) {
      throw new Error(`حداکثر مبلغ قابل پرداخت ${IranCurrencyService.formatAmount(selectedGateway.maxAmount)} است`);
    }

    return await this.callPaymentGateway(selectedGateway, amount);
  }
}
```

## 📱 تجربه کاربری ایرانی

### 1. **پیام‌ها و اعلان‌ها**
```typescript
// Persian Notification Templates
const persianNotifications = {
  debtCreated: {
    title: 'بدهی جدید',
    body: '{creditor} می‌گوید شما {amount} بدهکار هستید برای {description}',
    action: 'مشاهده'
  },
  
  settlementRequest: {
    title: 'درخواست تسویه',
    body: '{debtor} می‌خواهد {amount} را برای {description} تسویه کند',
    action: 'تایید'
  },
  
  paymentReminder: {
    title: 'یادآوری پرداخت',
    body: 'پرداخت {amount} به {creditor} دیروز سررسید شده',
    action: 'پرداخت'
  },

  ramadanGreeting: {
    title: 'ماه مبارک رمضان',
    body: 'در این ماه مبارک، تسویه بدهی‌ها ثواب دارد 🌙',
    action: 'تسویه'
  },

  nowruzGreeting: {
    title: 'سال نو مبارک',
    body: 'با تسویه بدهی‌ها، سال نو را پاک شروع کنید 🌱',
    action: 'تسویه همه'
  }
};

// Cultural Event Integration
class PersianCultureService {
  static getPersianHolidays(): Array<{date: string, name: string, message?: string}> {
    return [
      { 
        date: '1403/01/01', 
        name: 'نوروز', 
        message: 'سال نو مبارک! زمان مناسبی برای تسویه بدهی‌ها'
      },
      { 
        date: '1403/01/13', 
        name: 'سیزده بدر', 
        message: 'روز طبیعت مبارک'
      },
      // ماه رمضان
      { 
        date: '1403/01/15', 
        name: 'شروع ماه رمضان', 
        message: 'ماه مبارک رمضان - تسویه بدهی‌ها ثواب دارد'
      }
    ];
  }

  static isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    // In Iran: Friday is weekend, Thursday is half-day
    return dayOfWeek !== 5; // Friday is not working day
  }
}
```

### 2. **صفحه‌بندی و طراحی**
```typescript
// Persian UI Components
const PersianUI = {
  // Button styles
  button: {
    primary: {
      backgroundColor: '#1976d2',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    text: {
      color: '#ffffff',
      fontFamily: 'Vazir-Bold',
      fontSize: 16,
      textAlign: 'center',
    }
  },

  // Input styles
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Vazir',
    textAlign: 'right',
    fontSize: 16,
  },

  // Card styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
};

// Main Navigation with Persian labels
const PersianNavigation = () => {
  return (
    <BottomNavigation>
      <BottomNavigationTab 
        title="داشبورد" 
        icon="home"
      />
      <BottomNavigationTab 
        title="بدهی‌ها" 
        icon="account-balance-wallet"
      />
      <BottomNavigationTab 
        title="گروه‌ها" 
        icon="group"
      />
      <BottomNavigationTab 
        title="پروفایل" 
        icon="person"
      />
    </BottomNavigation>
  );
};
```

## 🎭 جنبه‌های فرهنگی

### 1. **آداب و رسوم ایرانی**
```typescript
// Cultural Considerations
const iranianCulturalFeatures = {
  // Politeness levels in debt requests
  politenessLevels: {
    formal: {
      debtRequest: 'محترماً عرض می‌شود که مبلغ {amount} بابت {description} در تاریخ {date} پرداخت گردد.',
      reminder: 'با احترام، یادآوری می‌شود که سررسید پرداخت فرا رسیده است.'
    },
    friendly: {
      debtRequest: 'سلام! یادت هست {amount} تومان بابت {description}؟',
      reminder: 'سلام دوست عزیز، وقت پرداخت {amount} تومان رسیده.'
    },
    family: {
      debtRequest: '{amount} تومان بابت {description} رو یادت هست؟',
      reminder: 'عزیزم، {amount} تومان رو فراموش نکرده باشی!'
    }
  },

  // Traditional payment occasions
  traditionalOccasions: [
    { name: 'عیدی نوروز', description: 'پرداخت‌های سال نو' },
    { name: 'مهریه', description: 'مسائل مالی خانوادگی' },
    { name: 'شیرینی', description: 'جشن‌های خوشحالی' },
  ],

  // Social relationships
  relationshipTypes: [
    { id: 'family', name: 'خانواده', formality: 'low' },
    { id: 'friends', name: 'دوستان', formality: 'medium' },
    { id: 'colleagues', name: 'همکاران', formality: 'high' },
    { id: 'neighbors', name: 'همسایه‌ها', formality: 'medium' },
    { id: 'business', name: 'کسب‌وکار', formality: 'high' },
  ]
};

// Relationship-based messaging
class PersianMessagingService {
  static getAppropriateMessage(
    type: 'request' | 'reminder' | 'thanks',
    relationship: string,
    amount: number,
    description: string
  ): string {
    const formality = this.getFormalityLevel(relationship);
    const templates = iranianCulturalFeatures.politenessLevels[formality];
    
    return templates[type]
      .replace('{amount}', IranCurrencyService.formatAmount(amount))
      .replace('{description}', description);
  }

  private static getFormalityLevel(relationship: string): 'formal' | 'friendly' | 'family' {
    const rel = iranianCulturalFeatures.relationshipTypes.find(r => r.id === relationship);
    
    if (rel?.formality === 'high') return 'formal';
    if (rel?.formality === 'low') return 'family';
    return 'friendly';
  }
}
```

## 📞 پشتیبانی و راهنمایی

### 1. **راهنمای فارسی**
```typescript
// Persian Help Content
const persianHelp = {
  gettingStarted: {
    title: 'شروع کار با ستلر',
    steps: [
      'ابتدا حساب کاربری خود را بسازید',
      'اطلاعات پروفایل خود را تکمیل کنید',
      'اولین بدهی خود را ثبت کنید',
      'با دوستان و خانواده خود به اشتراک بگذارید'
    ]
  },

  commonQuestions: [
    {
      question: 'چگونه بدهی ایجاد کنم؟',
      answer: 'روی دکمه "+" کلیک کنید و اطلاعات بدهی را وارد کنید.'
    },
    {
      question: 'آیا اطلاعات من امن است؟',
      answer: 'بله، تمام اطلاعات شما با بالاترین استانداردهای امنیتی محافظت می‌شود.'
    },
    {
      question: 'چگونه گروه بسازم؟',
      answer: 'به قسمت گروه‌ها بروید و روی "ایجاد گروه جدید" کلیک کنید.'
    }
  ],

  tutorials: [
    {
      title: 'مدیریت بدهی‌های خانوادگی',
      description: 'راهنمای گام به گام برای مدیریت هزینه‌های مشترک خانواده',
      videoUrl: '/tutorials/family-debts-fa.mp4'
    },
    {
      title: 'تسویه گروهی در مسافرت',
      description: 'نحوه تقسیم هزینه‌های مسافرت بین دوستان',
      videoUrl: '/tutorials/travel-expenses-fa.mp4'
    }
  ]
};

// Support Contact (Persian)
const persianSupport = {
  phone: '۰۲۱-۱234۵۶۷۸',
  email: 'support@settler.ir',
  telegram: '@SettlerSupport',
  workingHours: 'شنبه تا چهارشنبه، ۹ صبح تا ۶ عصر',
  responseTime: 'پاسخ در کمتر از ۲۴ ساعت'
};
```

## 🔧 تنظیمات فنی

### 1. **کانفیگ i18n**
```typescript
// i18n Configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fa: {
        translation: persianTranslations
      },
      en: {
        translation: englishTranslations
      }
    },
    lng: 'fa', // Default language
    fallbackLng: 'fa',
    
    interpolation: {
      escapeValue: false,
    },

    // RTL Configuration
    react: {
      useSuspense: false,
    }
  });

// Language Storage
class LanguageService {
  static async setLanguage(lang: 'fa' | 'en') {
    await AsyncStorage.setItem('app_language', lang);
    i18n.changeLanguage(lang);
    
    // Update layout direction
    I18nManager.forceRTL(lang === 'fa');
  }

  static async getStoredLanguage(): Promise<string> {
    return await AsyncStorage.getItem('app_language') || 'fa';
  }
}
```

### 2. **کانفیگ سرور**
```typescript
// Server Localization
export const iranLocalization = {
  timezone: 'Asia/Tehran',
  locale: 'fa-IR',
  currency: 'IRR',
  
  // Database settings
  collation: 'utf8mb4_persian_ci',
  
  // Date format
  dateFormat: 'YYYY/MM/DD',
  timeFormat: 'HH:mm',
  
  // Number format
  numberFormat: {
    thousandSeparator: '٬',
    decimalSeparator: '٫'
  }
};

// API Response Localization
class LocalizedResponse {
  static success(message: string, data?: any) {
    return {
      success: true,
      message: i18n.t(message),
      data,
      timestamp: moment().tz('Asia/Tehran').format()
    };
  }

  static error(messageKey: string, details?: any) {
    return {
      success: false,
      message: i18n.t(messageKey),
      details,
      timestamp: moment().tz('Asia/Tehran').format()
    };
  }
}
```

## 🤖 AI Prompt برای بومی‌سازی

```
شما مسئول بومی‌سازی اپلیکیشن Settler برای بازار ایران هستید. از این راهنماها استفاده کنید:

1. **پشتیبانی از زبان فارسی:**
   - تمام متن‌ها و رابط کاربری به فارسی
   - پشتیبانی کامل از RTL (راست به چپ)
   - استفاده از فونت‌های فارسی مناسب (وزیر، ساحل)
   - تبدیل خودکار اعداد انگلیسی به فارسی
   - پشتیبانی از تقویم شمسی

2. **فرهنگ و آداب ایرانی:**
   - استفاده از سطوح مختلف ادب در پیام‌ها
   - در نظر گیری روابط خانوادگی و اجتماعی ایران
   - یکپارچگی با مناسبت‌های ایرانی (نوروز، رمضان)
   - استفاده از عبارات محترمانه و مناسب

3. **سیستم مالی ایران:**
   - پشتیبانی از ریال و تومان
   - یکپارچگی با درگاه‌های پرداخت ایرانی
   - اعتبارسنجی شماره کارت و شبای ایرانی
   - در نظر گیری روش‌های پرداخت محلی

4. **تجربه کاربری محلی:**
   - طراحی مناسب با ذائقه ایرانی
   - پیام‌های خطا و راهنمایی به فارسی
   - پشتیبانی ۲۴ ساعته به فارسی
   - آموزش‌های ویدیویی به زبان فارسی

5. **تنظیمات فنی:**
   - پیکربندی i18n برای فارسی
   - تنظیم منطقه زمانی تهران
   - کدگذاری UTF-8 برای متن‌های فارسی
   - بهینه‌سازی برای کیبورد فارسی موبایل

کد تولید شده باید کاملاً با فرهنگ ایرانی سازگار و برای کاربران ایرانی بهینه باشد.
``` 