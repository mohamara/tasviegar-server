import { IsNotEmpty, IsString, Matches, Length } from "class-validator"
import { isValidIranianNationalId, isValidIranianMobile } from "./iranian-validation.util"

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
}

export class UpdateUserDto {
  @IsString({ message: "نام باید رشته باشد." })
  @Length(2, 64, { message: "نام باید بین ۲ تا ۶۴ کاراکتر باشد." })
  firstName?: string

  @IsString({ message: "نام خانوادگی باید رشته باشد." })
  @Length(2, 64, { message: "نام خانوادگی باید بین ۲ تا ۶۴ کاراکتر باشد." })
  lastName?: string

  @Matches(/^\+98 9\d{2} \d{3} \d{4}$/, { message: "فرمت شماره موبایل معتبر نیست." })
  mobile?: string

  @Matches(/^\d{10}$/, { message: "کدملی باید ۱۰ رقم باشد." })
  nationalId?: string
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
