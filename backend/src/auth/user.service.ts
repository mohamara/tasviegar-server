import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "./user.entity"
import { CreateUserDto, UpdateUserDto } from "./user.dto"
import { isValidIranianMobile, isValidIranianNationalId } from "./iranian-validation.util"
import * as moment from "moment-jalaali"

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(dto: CreateUserDto) {
    if (!isValidIranianMobile(dto.mobile)) throw new BadRequestException("فرمت شماره موبایل معتبر نیست.")
    if (!isValidIranianNationalId(dto.nationalId)) throw new BadRequestException("کدملی معتبر نیست.")
    const exists = await this.userRepository.findOne({ where: [{ mobile: dto.mobile }, { nationalId: dto.nationalId }] })
    if (exists) throw new BadRequestException("شماره موبایل یا کدملی تکراری است.")
    const user = this.userRepository.create(dto)
    await this.userRepository.save(user)
    return { message: "کاربر با موفقیت ایجاد شد.", user }
  }

  async findAll(query: { mobile?: string; nationalId?: string; name?: string }) {
    const qb = this.userRepository.createQueryBuilder("user")
    if (query.mobile) qb.andWhere("user.mobile = :mobile", { mobile: query.mobile })
    if (query.nationalId) qb.andWhere("user.nationalId = :nationalId", { nationalId: query.nationalId })
    if (query.name) qb.andWhere("(user.firstName LIKE :name OR user.lastName LIKE :name)", { name: `%${query.name}%` })
    const users = await qb.getMany()
    return users.map((u) => ({ ...u, createdAt: moment(u.createdAt).format("jYYYY/jMM/jDD HH:mm:ss"), updatedAt: moment(u.updatedAt).format("jYYYY/jMM/jDD HH:mm:ss") }))
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException("کاربر یافت نشد.")
    return { ...user, createdAt: moment(user.createdAt).format("jYYYY/jMM/jDD HH:mm:ss"), updatedAt: moment(user.updatedAt).format("jYYYY/jMM/jDD HH:mm:ss") }
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException("کاربر یافت نشد.")
    if (dto.mobile && !isValidIranianMobile(dto.mobile)) throw new BadRequestException("فرمت شماره موبایل معتبر نیست.")
    if (dto.nationalId && !isValidIranianNationalId(dto.nationalId)) throw new BadRequestException("کدملی معتبر نیست.")
    if (dto.mobile && dto.mobile !== user.mobile) {
      const exists = await this.userRepository.findOne({ where: { mobile: dto.mobile } })
      if (exists) throw new BadRequestException("شماره موبایل تکراری است.")
    }
    if (dto.nationalId && dto.nationalId !== user.nationalId) {
      const exists = await this.userRepository.findOne({ where: { nationalId: dto.nationalId } })
      if (exists) throw new BadRequestException("کدملی تکراری است.")
    }
    Object.assign(user, dto)
    await this.userRepository.save(user)
    return { message: "کاربر با موفقیت ویرایش شد.", user }
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException("کاربر یافت نشد.")
    await this.userRepository.remove(user)
    return { message: "کاربر حذف شد." }
  }

  validateNationalId(nationalId: string) {
    return { valid: isValidIranianNationalId(nationalId) }
  }

  validatePhone(mobile: string) {
    return { valid: isValidIranianMobile(mobile) }
  }
}
