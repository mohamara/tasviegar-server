import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, SearchUsersDto } from './user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Test',
        lastName: 'User',
        mobile: '+98 912 345 6789',
        nationalId: '1234567890',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        ...createUserDto,
        isActive: true,
        preferences: {
          language: 'fa',
          theme: 'light',
          notifications: { sms: true, email: true, push: true },
          privacy: { profileVisibility: 'friends', showBalance: false },
        },
        metadata: {
          registrationSource: 'mobile',
          deviceInfo: null,
        },
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result.message).toBe('کاربر با موفقیت ایجاد شد.');
      expect(result.user).toBeDefined();
      expect(result.user.password).toBeUndefined(); // Password should be excluded
    });

    it('should throw error if mobile already exists', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Test',
        lastName: 'User',
        mobile: '+98 912 345 6789',
        nationalId: '1234567890',
      };

      const existingUser = { mobile: createUserDto.mobile };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'شماره موبایل قبلاً ثبت شده است.',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const searchDto: SearchUsersDto = {
        page: 1,
        limit: 10,
        name: 'Test',
      };

      const mockUsers = [
        {
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User',
          mobile: '+98 912 345 6789',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
        getCount: jest.fn().mockResolvedValue(1),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(searchDto);

      expect(result.users).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        firstName: 'Test',
        lastName: 'User',
        mobile: '+98 912 345 6789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.createdAt).toMatch(/^\d{4}\/\d{2}\/\d{2}/); // Persian date format
    });

    it('should throw error if user not found', async () => {
      const userId = 'non-existent-id';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow('کاربر یافت نشد.');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = 'user-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const existingUser = {
        id: userId,
        firstName: 'Test',
        lastName: 'User',
        mobile: '+98 912 345 6789',
        password: 'hashed-password',
      };

      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result.message).toBe('کاربر با موفقیت ویرایش شد.');
      expect(result.user.firstName).toBe('Updated');
      expect(result.user.password).toBeUndefined(); // Password should be excluded
    });

    it('should throw error if user not found', async () => {
      const userId = 'non-existent-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        'کاربر یافت نشد.',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
        isActive: false,
      });

      const result = await service.remove(userId);

      expect(result.message).toBe('کاربر حذف شد.');
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedAt: expect.any(Date),
          isActive: false,
        }),
      );
    });
  });

  describe('validateNationalId', () => {
    it('should validate correct national ID', () => {
      const validNationalId = '1234567890';
      const result = service.validateNationalId(validNationalId);
      expect(result).toHaveProperty('valid');
    });

    it('should reject invalid national ID', () => {
      const invalidNationalId = '123456789'; // 9 digits instead of 10
      const result = service.validateNationalId(invalidNationalId);
      expect(result.valid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct mobile number', () => {
      const validMobile = '+98 912 345 6789';
      const result = service.validatePhone(validMobile);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid mobile number', () => {
      const invalidMobile = '09123456789'; // Wrong format
      const result = service.validatePhone(invalidMobile);
      expect(result.valid).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      mockUserRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // active
        .mockResolvedValueOnce(70) // verified
        .mockResolvedValueOnce(5); // today

      const result = await service.getStats();

      expect(result).toEqual({
        total: 100,
        active: 80,
        verified: 70,
        today: 5,
      });
    });
  });
});
