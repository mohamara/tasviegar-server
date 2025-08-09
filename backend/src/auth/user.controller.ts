import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpStatus, Res } from "@nestjs/common"
import { UserService } from "./user.service"
import { CreateUserDto, UpdateUserDto, ValidateNationalIdDto, ValidatePhoneDto } from "./user.dto"

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() query, @Res() res) {
    const users = await this.userService.findAll(query)
    return res.status(HttpStatus.OK).json(users)
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Res() res) {
    try {
      const user = await this.userService.findOne(id)
      return res.status(HttpStatus.OK).json(user)
    } catch (e) {
      return res.status(e.status || 404).json({ message: e.message || "کاربر یافت نشد." })
    }
  }

  @Post()
  async create(@Body() dto: CreateUserDto, @Res() res) {
    try {
      const result = await this.userService.create(dto)
      return res.status(HttpStatus.CREATED).json(result)
    } catch (e) {
      return res.status(e.status || 400).json({ message: e.message || "خطا در ایجاد کاربر." })
    }
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto, @Res() res) {
    try {
      const result = await this.userService.update(id, dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (e) {
      return res.status(e.status || 400).json({ message: e.message || "خطا در ویرایش کاربر." })
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Res() res) {
    try {
      const result = await this.userService.remove(id)
      return res.status(HttpStatus.OK).json(result)
    } catch (e) {
      return res.status(e.status || 404).json({ message: e.message || "خطا در حذف کاربر." })
    }
  }

  @Post("validate-national-id")
  async validateNationalId(@Body() dto: ValidateNationalIdDto, @Res() res) {
    const result = this.userService.validateNationalId(dto.nationalId)
    return res.status(HttpStatus.OK).json(result)
  }

  @Post("validate-phone")
  async validatePhone(@Body() dto: ValidatePhoneDto, @Res() res) {
    const result = this.userService.validatePhone(dto.mobile)
    return res.status(HttpStatus.OK).json(result)
  }
}
