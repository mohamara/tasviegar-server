import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifySmsDto, RefreshTokenDto, ForgotPasswordDto } from './auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    verifySms: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    validateUser: jest.fn(),
    getPersianDate: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerDto: RegisterDto = {
        mobile: '+98 912 345 6789',
        password: 'password123',
      };

      const mockResult = {
        message: 'کد تایید به شماره شما ارسال شد.',
        userId: 'user-id',
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      await controller.register(registerDto, '127.0.0.1', mockResponse as any);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle registration error', async () => {
      const registerDto: RegisterDto = {
        mobile: '+98 912 345 6789',
        password: 'password123',
      };

      const error = new Error('User already exists');
      error['status'] = 409;
      mockAuthService.register.mockRejectedValue(error);

      await controller.register(registerDto, '127.0.0.1', mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User already exists',
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        mobile: '+98 912 345 6789',
        password: 'password123',
      };

      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          mobile: loginDto.mobile,
          firstName: 'Test',
          lastName: 'User',
        },
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      await controller.login(loginDto, '127.0.0.1', mockResponse as any);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto, '127.0.0.1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle login error', async () => {
      const loginDto: LoginDto = {
        mobile: '+98 912 345 6789',
        password: 'wrong-password',
      };

      const error = new Error('Invalid credentials');
      error['status'] = 401;
      mockAuthService.login.mockRejectedValue(error);

      await controller.login(loginDto, '127.0.0.1', mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });
  });

  describe('verifySms', () => {
    it('should verify SMS successfully', async () => {
      const verifyDto: VerifySmsDto = {
        mobile: '+98 912 345 6789',
        code: '1234',
      };

      const mockResult = {
        message: 'حساب شما با موفقیت تایید شد.',
        userId: 'user-id',
      };

      mockAuthService.verifySms.mockResolvedValue(mockResult);

      await controller.verifySms(verifyDto, '127.0.0.1', mockResponse as any);

      expect(mockAuthService.verifySms).toHaveBeenCalledWith(verifyDto);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle SMS verification error', async () => {
      const verifyDto: VerifySmsDto = {
        mobile: '+98 912 345 6789',
        code: '0000',
      };

      const error = new Error('Invalid code');
      error['status'] = 400;
      mockAuthService.verifySms.mockRejectedValue(error);

      await controller.verifySms(verifyDto, '127.0.0.1', mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid code',
      });
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };

      const mockResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResult);

      await controller.refresh(refreshDto, '127.0.0.1', mockResponse as any);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshDto);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const refreshToken = 'refresh-token';
      const mockResult = {
        message: 'خروج با موفقیت انجام شد.',
      };

      mockAuthService.logout.mockResolvedValue(mockResult);

      await controller.logout(refreshToken, '127.0.0.1', mockResponse as any);

      expect(mockAuthService.logout).toHaveBeenCalledWith(refreshToken);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password SMS successfully', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        mobile: '+98 912 345 6789',
      };

      const mockResult = {
        message: 'کد بازیابی رمز عبور ارسال شد.',
      };

      mockAuthService.forgotPassword.mockResolvedValue(mockResult);

      await controller.forgotPassword(forgotPasswordDto, '127.0.0.1', mockResponse as any);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetBody = {
        mobile: '+98 912 345 6789',
        code: '1234',
        newPassword: 'newpassword123',
      };

      const mockResult = {
        message: 'رمز عبور با موفقیت تغییر یافت.',
      };

      mockAuthService.resetPassword.mockResolvedValue(mockResult);

      await controller.resetPassword(resetBody, mockResponse as any);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetBody.mobile,
        resetBody.code,
        resetBody.newPassword,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('me', () => {
    it('should return current user info', async () => {
      const mockRequest = {
        user: {
          sub: 'user-id',
        },
      };

      const mockUser = {
        id: 'user-id',
        mobile: '+98 912 345 6789',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      await controller.me(mockRequest as any, mockResponse as any);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUser,
      });
    });

    it('should handle user not found', async () => {
      const mockRequest = {
        user: {
          sub: 'non-existent-user-id',
        },
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await controller.me(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'کاربر یافت نشد.',
      });
    });
  });

  describe('getPersianDate', () => {
    it('should return Persian date', async () => {
      const mockPersianDate = '۱۴۰۳/۰۱/۱۵ ۱۲:۳۴:۵۶';
      mockAuthService.getPersianDate.mockReturnValue(mockPersianDate);

      await controller.getPersianDate(mockResponse as any);

      expect(mockAuthService.getPersianDate).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        persianDate: mockPersianDate,
        timestamp: expect.any(String),
      });
    });
  });
});
