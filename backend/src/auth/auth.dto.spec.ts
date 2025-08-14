import { validate } from 'class-validator';
import { RegisterDto, LoginDto, VerifySmsDto, RefreshTokenDto, ForgotPasswordDto } from './auth.dto';

describe('Auth DTOs', () => {
  describe('RegisterDto', () => {
    it('should validate correct register data', async () => {
      const dto = new RegisterDto();
      dto.mobile = '+98 912 345 6789';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid mobile format', async () => {
      const dto = new RegisterDto();
      dto.mobile = '09123456789'; // Wrong format
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail with short password', async () => {
      const dto = new RegisterDto();
      dto.mobile = '+98 912 345 6789';
      dto.password = '123'; // Too short

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail with long password', async () => {
      const dto = new RegisterDto();
      dto.mobile = '+98 912 345 6789';
      dto.password = 'a'.repeat(33); // Too long

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail with empty mobile', async () => {
      const dto = new RegisterDto();
      dto.mobile = '';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with empty password', async () => {
      const dto = new RegisterDto();
      dto.mobile = '+98 912 345 6789';
      dto.password = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('LoginDto', () => {
    it('should validate correct login data', async () => {
      const dto = new LoginDto();
      dto.mobile = '+98 912 345 6789';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid mobile format', async () => {
      const dto = new LoginDto();
      dto.mobile = '09123456789'; // Wrong format
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('VerifySmsDto', () => {
    it('should validate correct SMS verification data', async () => {
      const dto = new VerifySmsDto();
      dto.mobile = '+98 912 345 6789';
      dto.code = '1234';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate 6-digit code', async () => {
      const dto = new VerifySmsDto();
      dto.mobile = '+98 912 345 6789';
      dto.code = '123456';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid code format', async () => {
      const dto = new VerifySmsDto();
      dto.mobile = '+98 912 345 6789';
      dto.code = '123'; // Too short

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail with non-numeric code', async () => {
      const dto = new VerifySmsDto();
      dto.mobile = '+98 912 345 6789';
      dto.code = '12ab'; // Contains letters

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });

  describe('RefreshTokenDto', () => {
    it('should validate correct refresh token data', async () => {
      const dto = new RefreshTokenDto();
      dto.refreshToken = 'valid-refresh-token';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with empty refresh token', async () => {
      const dto = new RefreshTokenDto();
      dto.refreshToken = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with non-string refresh token', async () => {
      const dto = new RefreshTokenDto();
      (dto as any).refreshToken = 123; // Number instead of string

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('ForgotPasswordDto', () => {
    it('should validate correct forgot password data', async () => {
      const dto = new ForgotPasswordDto();
      dto.mobile = '+98 912 345 6789';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid mobile format', async () => {
      const dto = new ForgotPasswordDto();
      dto.mobile = '09123456789'; // Wrong format

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail with empty mobile', async () => {
      const dto = new ForgotPasswordDto();
      dto.mobile = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
