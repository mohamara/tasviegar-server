import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpStatus, Res, UseGuards, Req, Ip } from "@nestjs/common"
import { Response, Request } from "express"
import { UserService } from "./user.service"
import { CreateUserDto, UpdateUserDto, UpdatePreferencesDto, ChangePasswordDto, SearchUsersDto, ValidateNationalIdDto, ValidatePhoneDto } from "./user.dto"
import { AuthGuard } from "./auth.guard"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"

@ApiTags('Users')
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'mobile', required: false, type: String })
  @ApiQuery({ name: 'nationalId', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: ['user', 'premium', 'admin'] })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() query: SearchUsersDto, @Res() res: Response) {
    try {
      const result = await this.userService.findAll(query)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "خطا در دریافت لیست کاربران." 
      })
    }
  }

  @Get("stats")
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Res() res: Response) {
    try {
      const stats = await this.userService.getStats()
      return res.status(HttpStatus.OK).json(stats)
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "خطا در دریافت آمار کاربران." 
      })
    }
  }

  @Get(":id")
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param("id") id: string, @Res() res: Response) {
    try {
      const user = await this.userService.findOne(id)
      return res.status(HttpStatus.OK).json(user)
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در دریافت اطلاعات کاربر." 
      })
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(@Body() dto: CreateUserDto, @Res() res: Response) {
    try {
      const result = await this.userService.create(dto)
      return res.status(HttpStatus.CREATED).json(result)
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در ایجاد کاربر." 
      })
    }
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Duplicate data' })
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto, @Res() res: Response) {
    try {
      const result = await this.userService.update(id, dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در ویرایش کاربر." 
      })
    }
  }

  @Put(":id/preferences")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePreferences(@Param("id") id: string, @Body() dto: UpdatePreferencesDto, @Res() res: Response) {
    try {
      const result = await this.userService.updatePreferences(id, dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در بروزرسانی تنظیمات." 
      })
    }
  }

  @Put(":id/password")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(@Param("id") id: string, @Body() dto: ChangePasswordDto, @Res() res: Response) {
    try {
      const result = await this.userService.changePassword(id, dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در تغییر رمز عبور." 
      })
    }
  }

  @Put(":id/toggle-active")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async toggleActive(@Param("id") id: string, @Res() res: Response) {
    try {
      const result = await this.userService.toggleActive(id)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در تغییر وضعیت کاربر." 
      })
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param("id") id: string, @Res() res: Response) {
    try {
      const result = await this.userService.remove(id)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در حذف کاربر." 
      })
    }
  }

  @Post("validate-national-id")
  @ApiOperation({ summary: 'Validate Iranian national ID' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateNationalId(@Body() dto: ValidateNationalIdDto, @Res() res: Response) {
    try {
      const result = this.userService.validateNationalId(dto.nationalId)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        message: "خطا در اعتبارسنجی کدملی." 
      })
    }
  }

  @Post("validate-phone")
  @ApiOperation({ summary: 'Validate Iranian mobile number' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validatePhone(@Body() dto: ValidatePhoneDto, @Res() res: Response) {
    try {
      const result = this.userService.validatePhone(dto.mobile)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ 
        message: "خطا در اعتبارسنجی شماره موبایل." 
      })
    }
  }

  @Get("profile/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = (req as any).user.sub
      const user = await this.userService.findOne(userId)
      return res.status(HttpStatus.OK).json(user)
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در دریافت پروفایل." 
      })
    }
  }

  @Put("profile/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto, @Res() res: Response) {
    try {
      const userId = (req as any).user.sub
      const result = await this.userService.update(userId, dto)
      return res.status(HttpStatus.OK).json(result)
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
      return res.status(status).json({ 
        message: error.message || "خطا در بروزرسانی پروفایل." 
      })
    }
  }
}
