import { IsNotEmpty, IsString, Matches, MinLength, MaxLength } from "class-validator"

export class RegisterDto {
  @IsNotEmpty({ message: "شماره موبایل الزامی است." })
  @Matches(/^\+98 9\d{2} \d{3} \d{4}$/, { message: "فرمت شماره موبایل معتبر نیست. مثال: +98 912 345 6789" })
  mobile: string

  @IsNotEmpty({ message: "رمز عبور الزامی است." })
  @MinLength(6, { message: "رمز عبور باید حداقل ۶ کاراکتر باشد." })
  @MaxLength(32, { message: "رمز عبور نباید بیش از ۳۲ کاراکتر باشد." })
  password: string
}

export class LoginDto {
  @IsNotEmpty({ message: "شماره موبایل الزامی است." })
  @Matches(/^\+98 9\d{2} \d{3} \d{4}$/, { message: "فرمت شماره موبایل معتبر نیست." })
  mobile: string

  @IsNotEmpty({ message: "رمز عبور الزامی است." })
  password: string
}

export class VerifySmsDto {
  @IsNotEmpty({ message: "شماره موبایل الزامی است." })
  @Matches(/^\+98 9\d{2} \d{3} \d{4}$/, { message: "فرمت شماره موبایل معتبر نیست." })
  mobile: string

  @IsNotEmpty({ message: "کد تایید الزامی است." })
  @Matches(/^\d{4,6}$/, { message: "کد تایید باید عددی و ۴ تا ۶ رقمی باشد." })
  code: string
}

export class RefreshTokenDto {
  @IsNotEmpty({ message: "توکن الزامی است." })
  @IsString({ message: "توکن باید رشته باشد." })
  refreshToken: string
}

export class ForgotPasswordDto {
  @IsNotEmpty({ message: "شماره موبایل الزامی است." })
  @Matches(/^\+98 9\d{2} \d{3} \d{4}$/, { message: "فرمت شماره موبایل معتبر نیست." })
  mobile: string
}
