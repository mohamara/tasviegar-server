import { IsNotEmpty, IsString, Matches, Length, IsOptional, IsEmail, IsDateString, IsEnum, IsBoolean, IsObject } from "class-validator"
import { isValidIranianNationalId, isValidIranianMobile } from "./iranian-validation.util"
import { Transform, Type } from "class-transformer"

export class CreateUserDto {
  @IsNotEmpty({ message: "نام الزامی است." })
  @IsString({ message: "نام باید رشته باشد." })
  @Length(2, 64, { message: "نام باید بین ۲ تا ۶۴ کاراکتر باشد." })
  firstName: string

  @IsNotEmpty({ message: "نام خانوادگی الزامی است." })
  @IsString({ message: "نام خانوادگی باید رشته باشد." })
  @Length(2, 64, { message: "نام خانوادگی باید بین ۲ تا ۶۴ کاراکتر باشد." })
  lastName: string

  @IsNotEmpty({ message: "شماره موبایل الزامی است." })
  @Matches(/^\+98 9\d{2} \d{3} \d{4}$/, { message: "فرمت شماره موبایل معتبر نیست." })
  mobile: string

  @IsNotEmpty({ message: "کدملی الزامی است." })
  @Matches(/^\d{10}$/, { message: "کدملی باید ۱۰ رقم باشد." })
  nationalId: string

  @IsOptional()
  @IsEmail({}, { message: "فرمت ایمیل معتبر نیست." })
  email?: string

  @IsOptional()
  @IsString({ message: "رمز عبور باید رشته باشد." })
  @Length(6, 32, { message: "رمز عبور باید بین ۶ تا ۳۲ کاراکتر باشد." })
  password?: string

  @IsOptional()
  @IsDateString({}, { message: "فرمت تاریخ تولد معتبر نیست." })
  birthDate?: string

  @IsOptional()
  @IsEnum(['male', 'female', 'other'], { message: "جنسیت باید male، female یا other باشد." })
  gender?: 'male' | 'female' | 'other'

  @IsOptional()
  @IsString({ message: "آدرس باید رشته باشد." })
  @Length(10, 500, { message: "آدرس باید بین ۱۰ تا ۵۰۰ کاراکتر باشد." })
  address?: string

  @IsOptional()
  @Matches(/^\d{10}$/, { message: "کد پستی باید ۱۰ رقم باشد." })
  postalCode?: string

  @IsOptional()
  @IsString({ message: "شهر باید رشته باشد." })
  @Length(2, 50, { message: "شهر باید بین ۲ تا ۵۰ کاراکتر باشد." })
  city?: string

  @IsOptional()
  @IsString({ message: "استان باید رشته باشد." })
  @Length(2, 50, { message: "استان باید بین ۲ تا ۵۰ کاراکتر باشد." })
  province?: string
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "نام باید رشته باشد." })
  @Length(2, 64, { message: "نام باید بین ۲ تا ۶۴ کاراکتر باشد." })
  firstName?: string

  @IsOptional()
  @IsString({ message: "نام خانوادگی باید رشته باشد." })
  @Length(2, 64, { message: "نام خانوادگی باید بین ۲ تا ۶۴ کاراکتر باشد." })
  lastName?: string

  @IsOptional()
  @Matches(/^\+98 9\d{2} \d{3} \d{4}$/, { message: "فرمت شماره موبایل معتبر نیست." })
  mobile?: string

  @IsOptional()
  @Matches(/^\d{10}$/, { message: "کدملی باید ۱۰ رقم باشد." })
  nationalId?: string

  @IsOptional()
  @IsEmail({}, { message: "فرمت ایمیل معتبر نیست." })
  email?: string

  @IsOptional()
  @IsString({ message: "رمز عبور باید رشته باشد." })
  @Length(6, 32, { message: "رمز عبور باید بین ۶ تا ۳۲ کاراکتر باشد." })
  password?: string

  @IsOptional()
  @IsDateString({}, { message: "فرمت تاریخ تولد معتبر نیست." })
  birthDate?: string

  @IsOptional()
  @IsEnum(['male', 'female', 'other'], { message: "جنسیت باید male، female یا other باشد." })
  gender?: 'male' | 'female' | 'other'

  @IsOptional()
  @IsString({ message: "آدرس باید رشته باشد." })
  @Length(10, 500, { message: "آدرس باید بین ۱۰ تا ۵۰۰ کاراکتر باشد." })
  address?: string

  @IsOptional()
  @Matches(/^\d{10}$/, { message: "کد پستی باید ۱۰ رقم باشد." })
  postalCode?: string

  @IsOptional()
  @IsString({ message: "شهر باید رشته باشد." })
  @Length(2, 50, { message: "شهر باید بین ۲ تا ۵۰ کاراکتر باشد." })
  city?: string

  @IsOptional()
  @IsString({ message: "استان باید رشته باشد." })
  @Length(2, 50, { message: "استان باید بین ۲ تا ۵۰ کاراکتر باشد." })
  province?: string

  @IsOptional()
  @IsString({ message: "آواتار باید رشته باشد." })
  avatar?: string
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(['fa', 'en'], { message: "زبان باید fa یا en باشد." })
  language?: 'fa' | 'en'

  @IsOptional()
  @IsEnum(['light', 'dark'], { message: "تم باید light یا dark باشد." })
  theme?: 'light' | 'dark'

  @IsOptional()
  @IsObject({ message: "تنظیمات اعلان‌ها باید آبجکت باشد." })
  notifications?: {
    sms?: boolean
    email?: boolean
    push?: boolean
  }

  @IsOptional()
  @IsObject({ message: "تنظیمات حریم خصوصی باید آبجکت باشد." })
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends'
    showBalance?: boolean
  }
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: "رمز عبور فعلی الزامی است." })
  @IsString({ message: "رمز عبور فعلی باید رشته باشد." })
  currentPassword: string

  @IsNotEmpty({ message: "رمز عبور جدید الزامی است." })
  @IsString({ message: "رمز عبور جدید باید رشته باشد." })
  @Length(6, 32, { message: "رمز عبور جدید باید بین ۶ تا ۳۲ کاراکتر باشد." })
  newPassword: string

  @IsNotEmpty({ message: "تایید رمز عبور جدید الزامی است." })
  @IsString({ message: "تایید رمز عبور جدید باید رشته باشد." })
  confirmPassword: string
}

export class ValidateNationalIdDto {
  @IsNotEmpty({ message: "کدملی الزامی است." })
  @Matches(/^\d{10}$/, { message: "کدملی باید ۱۰ رقم باشد." })
  nationalId: string
}

export class ValidatePhoneDto {
  @IsNotEmpty({ message: "شماره موبایل الزامی است." })
  @Matches(/^\+98 9\d{2} \d{3} \d{4}$/, { message: "فرمت شماره موبایل معتبر نیست." })
  mobile: string
}

export class SearchUsersDto {
  @IsOptional()
  @IsString({ message: "نام باید رشته باشد." })
  name?: string

  @IsOptional()
  @Matches(/^\+98 9\d{2} \d{3} \d{4}$/, { message: "فرمت شماره موبایل معتبر نیست." })
  mobile?: string

  @IsOptional()
  @Matches(/^\d{10}$/, { message: "کدملی باید ۱۰ رقم باشد." })
  nationalId?: string

  @IsOptional()
  @IsEnum(['user', 'premium', 'admin'], { message: "نقش باید user، premium یا admin باشد." })
  role?: 'user' | 'premium' | 'admin'

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10
}
