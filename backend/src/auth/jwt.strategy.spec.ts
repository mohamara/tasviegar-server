import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: AuthService;
  let configService: ConfigService;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate payload and return user data', async () => {
      const payload = {
        sub: 'user-id',
        mobile: '+98 912 345 6789',
      };

      const mockUser = {
        id: 'user-id',
        mobile: '+98 912 345 6789',
        role: 'user',
        isVerified: true,
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({
        sub: 'user-id',
        mobile: '+98 912 345 6789',
        role: 'user',
        isVerified: true,
      });
    });

    it('should throw error if payload is invalid', async () => {
      const payload = {
        sub: null,
        mobile: '+98 912 345 6789',
      };

      await expect(strategy.validate(payload)).rejects.toThrow('توکن نامعتبر است.');
    });

    it('should throw error if user not found', async () => {
      const payload = {
        sub: 'user-id',
        mobile: '+98 912 345 6789',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow('کاربر یافت نشد یا غیرفعال است.');
    });
  });
});
