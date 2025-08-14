import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      const user = { id: 'user-id', mobile: '+98 912 345 6789' };
      const result = guard.handleRequest(null, user, null);
      expect(result).toEqual(user);
    });

    it('should throw error when user is null', () => {
      expect(() => guard.handleRequest(null, null, { message: 'No token' })).toThrow('دسترسی غیرمجاز. لطفاً وارد شوید.');
    });

    it('should throw error when there is an error', () => {
      const error = new Error('JWT expired');
      expect(() => guard.handleRequest(error, null, null)).toThrow('خطا در اعتبارسنجی توکن.');
    });
  });
});
