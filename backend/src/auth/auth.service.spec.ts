import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Iranian2FAService } from './iranian-2fa.service';
import { UserService } from './user.service';
import { User } from './user.entity';
import { RegisterDto, LoginDto, VerifySmsDto } from './auth.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let iranian2FAService: Iranian2FAService;
  let userService: UserService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockIranian2FAService = {
    sendSms: jest.fn(),
  };

  const mockUserService = {
    updateLastLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: Iranian2FAService,
          useValue: mockIranian2FAService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    iranian2FAService = module.get<Iranian2FAService>(Iranian2FAService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        mobile: '+98 912 345 6789',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        mobile: registerDto.mobile,
        password: 'hashed-password',
        isActive: true,
        isVerified: false,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockIranian2FAService.sendSms.mockResolvedValue(true);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        message: 'کد تایید به شماره شما ارسال شد.',
        userId: mockUser.id,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { mobile: registerDto.mobile },
      });
      expect(mockIranian2FAService.sendSms).toHaveBeenCalledWith(
        registerDto.mobile,
        expect.any(String),
      );
    });

    it('should throw error if user already exists', async () => {
      const registerDto: RegisterDto = {
        mobile: '+98 912 345 6789',
        password: 'password123',
      };

      const existingUser = { id: 'existing-user-id', mobile: registerDto.mobile };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        'این شماره قبلاً ثبت شده است.',
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        mobile: '+98 912 345 6789',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        mobile: loginDto.mobile,
        password: 'hashed-password',
        isActive: true,
        isVerified: true,
        isLocked: false,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user',
        preferences: { language: 'fa' },
        validatePassword: jest.fn().mockResolvedValue(true),
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');
      mockUserService.updateLastLogin.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
    });

    it('should throw error if user not found', async () => {
      const loginDto: LoginDto = {
        mobile: '+98 912 345 6789',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow('کاربر یافت نشد.');
    });

    it('should throw error if account is locked', async () => {
      const loginDto: LoginDto = {
        mobile: '+98 912 345 6789',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        mobile: loginDto.mobile,
        isLocked: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        'حساب شما به دلیل تلاش ناموفق قفل شده است.',
      );
    });
  });

  describe('verifySms', () => {
    it('should verify SMS code successfully', async () => {
      const verifyDto: VerifySmsDto = {
        mobile: '+98 912 345 6789',
        code: '1234',
      };

      const mockUser = {
        id: 'user-id',
        mobile: verifyDto.mobile,
        isVerified: false,
      };

      // Mock SMS code storage (in real implementation this would be in memory or Redis)
      const smsCodes = new Map();
      smsCodes.set(verifyDto.mobile, {
        code: verifyDto.code,
        expires: Date.now() + 5 * 60 * 1000,
      });

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.verifySms(verifyDto);

      expect(result).toEqual({
        message: 'حساب شما با موفقیت تایید شد.',
        userId: mockUser.id,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isVerified: true }),
      );
    });

    it('should throw error if SMS code is invalid', async () => {
      const verifyDto: VerifySmsDto = {
        mobile: '+98 912 345 6789',
        code: '1234',
      };

      await expect(service.verifySms(verifyDto)).rejects.toThrow(
        'کد منقضی شده است.',
      );
    });
  });

  describe('getPersianDate', () => {
    it('should return Persian date', () => {
      const persianDate = service.getPersianDate();
      expect(persianDate).toBeDefined();
      expect(typeof persianDate).toBe('string');
    });
  });
});
