import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "./user.entity"
import { CreateUserDto, UpdateUserDto, UpdatePreferencesDto, ChangePasswordDto, SearchUsersDto } from "./user.dto"
import { isValidIranianMobile, isValidIranianNationalId } from "./iranian-validation.util"

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(dto: CreateUserDto) {
    // Validation
    if (!isValidIranianMobile(dto.mobile)) {
      throw new BadRequestException("فرمت شماره موبایل معتبر نیست.")
    }
    if (!isValidIranianNationalId(dto.nationalId)) {
      throw new BadRequestException("کدملی معتبر نیست.")
    }

    // Check for duplicates
    const existingUser = await this.userRepository.findOne({
      where: [
        { mobile: dto.mobile },
        { nationalId: dto.nationalId },
        ...(dto.email ? [{ email: dto.email }] : [])
      ]
    })

    if (existingUser) {
      if (existingUser.mobile === dto.mobile) {
        throw new ConflictException("شماره موبایل قبلاً ثبت شده است.")
      }
      if (existingUser.nationalId === dto.nationalId) {
        throw new ConflictException("کدملی قبلاً ثبت شده است.")
      }
      if (dto.email && existingUser.email === dto.email) {
        throw new ConflictException("ایمیل قبلاً ثبت شده است.")
      }
    }

    // Create user
    const user = this.userRepository.create({
      ...dto,
      isActive: true,
      preferences: {
        language: 'fa',
        theme: 'light',
        notifications: { sms: true, email: true, push: true },
        privacy: { profileVisibility: 'friends', showBalance: false }
      },
      metadata: {
        registrationSource: 'mobile',
        deviceInfo: null
      }
    })

    await this.userRepository.save(user)
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return { 
      message: "کاربر با موفقیت ایجاد شد.", 
      user: userWithoutPassword 
    }
  }

  async findAll(query: SearchUsersDto) {
    const { page = 1, limit = 10, ...filters } = query
    const skip = (page - 1) * limit

    const qb = this.userRepository.createQueryBuilder("user")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName", 
        "user.mobile",
        "user.nationalId",
        "user.email",
        "user.role",
        "user.isVerified",
        "user.isActive",
        "user.createdAt",
        "user.updatedAt"
      ])

    // Apply filters
    if (filters.name) {
      qb.andWhere("(user.firstName ILIKE :name OR user.lastName ILIKE :name OR CONCAT(user.firstName, ' ', user.lastName) ILIKE :name)", 
        { name: `%${filters.name}%` })
    }
    if (filters.mobile) {
      qb.andWhere("user.mobile = :mobile", { mobile: filters.mobile })
    }
    if (filters.nationalId) {
      qb.andWhere("user.nationalId = :nationalId", { nationalId: filters.nationalId })
    }
    if (filters.role) {
      qb.andWhere("user.role = :role", { role: filters.role })
    }

    // Get total count
    const total = await qb.getCount()

    // Get paginated results
    const users = await qb
      .orderBy("user.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany()

    // Format dates
    const formattedUsers = users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }))

    return {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ 
      where: { id },
      select: [
        "id", "firstName", "lastName", "mobile", "nationalId", "email",
        "avatar", "birthDate", "gender", "address", "postalCode", "city", "province",
        "role", "isVerified", "isActive", "isLocked", "lastLoginAt", "lastLoginIp",
        "preferences", "metadata", "createdAt", "updatedAt"
      ]
    })

    if (!user) {
      throw new NotFoundException("کاربر یافت نشد.")
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  }

  async findByMobile(mobile: string) {
    return this.userRepository.findOne({ where: { mobile } })
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException("کاربر یافت نشد.")
    }

    // Validation for unique fields
    if (dto.mobile && dto.mobile !== user.mobile) {
      if (!isValidIranianMobile(dto.mobile)) {
        throw new BadRequestException("فرمت شماره موبایل معتبر نیست.")
      }
      const existingMobile = await this.userRepository.findOne({ where: { mobile: dto.mobile } })
      if (existingMobile) {
        throw new ConflictException("شماره موبایل قبلاً ثبت شده است.")
      }
    }

    if (dto.nationalId && dto.nationalId !== user.nationalId) {
      if (!isValidIranianNationalId(dto.nationalId)) {
        throw new BadRequestException("کدملی معتبر نیست.")
      }
      const existingNationalId = await this.userRepository.findOne({ where: { nationalId: dto.nationalId } })
      if (existingNationalId) {
        throw new ConflictException("کدملی قبلاً ثبت شده است.")
      }
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({ where: { email: dto.email } })
      if (existingEmail) {
        throw new ConflictException("ایمیل قبلاً ثبت شده است.")
      }
    }

    // Update user
    Object.assign(user, dto)
    await this.userRepository.save(user)

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return { 
      message: "کاربر با موفقیت ویرایش شد.", 
      user: userWithoutPassword 
    }
  }

  async updatePreferences(id: string, dto: UpdatePreferencesDto) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException("کاربر یافت نشد.")
    }

    // Merge preferences with default values
    user.preferences = {
      language: dto.language || user.preferences?.language || 'fa',
      theme: dto.theme || user.preferences?.theme || 'light',
      notifications: {
        sms: dto.notifications?.sms ?? user.preferences?.notifications?.sms ?? false,
        email: dto.notifications?.email ?? user.preferences?.notifications?.email ?? false,
        push: dto.notifications?.push ?? user.preferences?.notifications?.push ?? false,
      },
      privacy: {
        profileVisibility: dto.privacy?.profileVisibility || user.preferences?.privacy?.profileVisibility || 'friends',
        showBalance: dto.privacy?.showBalance ?? user.preferences?.privacy?.showBalance ?? false,
      }
    }

    await this.userRepository.save(user)
    return { 
      message: "تنظیمات با موفقیت بروزرسانی شد.", 
      preferences: user.preferences 
    }
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException("کاربر یافت نشد.")
    }

    // Validate current password
    const isValidPassword = await user.validatePassword(dto.currentPassword)
    if (!isValidPassword) {
      throw new BadRequestException("رمز عبور فعلی اشتباه است.")
    }

    // Validate new password confirmation
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException("رمز عبور جدید و تایید آن مطابقت ندارند.")
    }

    // Update password
    user.password = dto.newPassword
    await this.userRepository.save(user)

    return { message: "رمز عبور با موفقیت تغییر یافت." }
  }

  async toggleActive(id: string) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException("کاربر یافت نشد.")
    }

    user.isActive = !user.isActive
    await this.userRepository.save(user)

    return { 
      message: `کاربر ${user.isActive ? 'فعال' : 'غیرفعال'} شد.`,
      isActive: user.isActive 
    }
  }

  async updateLastLogin(id: string, ip: string) {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip
    })
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException("کاربر یافت نشد.")
    }

    // Soft delete
    user.deletedAt = new Date()
    user.isActive = false
    await this.userRepository.save(user)

    return { message: "کاربر حذف شد." }
  }

  // Validation methods
  validateNationalId(nationalId: string) {
    return { valid: isValidIranianNationalId(nationalId) }
  }

  validatePhone(mobile: string) {
    return { valid: isValidIranianMobile(mobile) }
  }

  // Statistics
  async getStats() {
    const totalUsers = await this.userRepository.count()
    const activeUsers = await this.userRepository.count({ where: { isActive: true } })
    const verifiedUsers = await this.userRepository.count({ where: { isVerified: true } })
    const todayUsers = await this.userRepository.count({
      where: {
        createdAt: new Date(new Date().setHours(0, 0, 0, 0))
      }
    })

    return {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      today: todayUsers
    }
  }
}
