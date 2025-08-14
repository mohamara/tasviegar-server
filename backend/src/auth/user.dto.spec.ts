import { validate } from 'class-validator';
import { CreateUserDto, UpdateUserDto, UpdatePreferencesDto, ChangePasswordDto, SearchUsersDto } from './user.dto';

describe('User DTOs', () => {
  describe('CreateUserDto', () => {
    it('should validate correct create user data', async () => {
      const dto = new CreateUserDto();
      dto.firstName = 'Test';
      dto.lastName = 'User';
      dto.mobile = '+98 912 345 6789';
      dto.nationalId = '1234567890';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with optional fields', async () => {
      const dto = new CreateUserDto();
      dto.firstName = 'Test';
      dto.lastName = 'User';
      dto.mobile = '+98 912 345 6789';
      dto.nationalId = '1234567890';
      dto.email = 'test@example.com';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      dto.gender = 'male';
      dto.address = 'Test Address';
      dto.postalCode = '1234567890';
      dto.city = 'Tehran';
      dto.province = 'Tehran';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with short firstName', async () => {
      const dto = new CreateUserDto();
      dto.firstName = 'T'; // Too short
      dto.lastName = 'User';
      dto.mobile = '+98 912 345 6789';
      dto.nationalId = '1234567890';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('length');
    });

    it('should fail with invalid email format', async () => {
      const dto = new CreateUserDto();
      dto.firstName = 'Test';
      dto.lastName = 'User';
      dto.mobile = '+98 912 345 6789';
      dto.nationalId = '1234567890';
      dto.email = 'invalid-email'; // Invalid format

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail with invalid gender', async () => {
      const dto = new CreateUserDto();
      dto.firstName = 'Test';
      dto.lastName = 'User';
      dto.mobile = '+98 912 345 6789';
      dto.nationalId = '1234567890';
      dto.gender = 'invalid' as any; // Invalid gender

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('UpdateUserDto', () => {
    it('should validate correct update user data', async () => {
      const dto = new UpdateUserDto();
      dto.firstName = 'Updated';
      dto.lastName = 'Name';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with all optional fields', async () => {
      const dto = new UpdateUserDto();
      dto.firstName = 'Updated';
      dto.lastName = 'Name';
      dto.mobile = '+98 912 345 6789';
      dto.nationalId = '1234567890';
      dto.email = 'updated@example.com';
      dto.password = 'newpassword123';
      dto.birthDate = '1990-01-01';
      dto.gender = 'female';
      dto.address = 'Updated Address';
      dto.postalCode = '1234567890';
      dto.city = 'Isfahan';
      dto.province = 'Isfahan';
      dto.avatar = 'avatar.jpg';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdatePreferencesDto', () => {
    it('should validate correct preferences data', async () => {
      const dto = new UpdatePreferencesDto();
      dto.language = 'en';
      dto.theme = 'dark';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with notifications and privacy', async () => {
      const dto = new UpdatePreferencesDto();
      dto.language = 'fa';
      dto.theme = 'light';
      dto.notifications = {
        sms: true,
        email: false,
        push: true,
      };
      dto.privacy = {
        profileVisibility: 'private',
        showBalance: false,
      };

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid language', async () => {
      const dto = new UpdatePreferencesDto();
      dto.language = 'invalid' as any; // Invalid language

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail with invalid theme', async () => {
      const dto = new UpdatePreferencesDto();
      dto.theme = 'invalid' as any; // Invalid theme

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('ChangePasswordDto', () => {
    it('should validate correct change password data', async () => {
      const dto = new ChangePasswordDto();
      dto.currentPassword = 'oldpassword';
      dto.newPassword = 'newpassword123';
      dto.confirmPassword = 'newpassword123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with short new password', async () => {
      const dto = new ChangePasswordDto();
      dto.currentPassword = 'oldpassword';
      dto.newPassword = '123'; // Too short
      dto.confirmPassword = '123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('length');
    });

    it('should fail with long new password', async () => {
      const dto = new ChangePasswordDto();
      dto.currentPassword = 'oldpassword';
      dto.newPassword = 'a'.repeat(33); // Too long
      dto.confirmPassword = 'a'.repeat(33);

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('length');
    });

    it('should fail with empty current password', async () => {
      const dto = new ChangePasswordDto();
      dto.currentPassword = '';
      dto.newPassword = 'newpassword123';
      dto.confirmPassword = 'newpassword123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('SearchUsersDto', () => {
    it('should validate correct search data', async () => {
      const dto = new SearchUsersDto();
      dto.name = 'Test';
      dto.mobile = '+98 912 345 6789';
      dto.nationalId = '1234567890';
      dto.role = 'user';
      dto.page = 1;
      dto.limit = 10;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with only name', async () => {
      const dto = new SearchUsersDto();
      dto.name = 'Test';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid role', async () => {
      const dto = new SearchUsersDto();
      dto.role = 'invalid' as any; // Invalid role

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail with invalid mobile format', async () => {
      const dto = new SearchUsersDto();
      dto.mobile = '09123456789'; // Wrong format

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail with invalid national ID format', async () => {
      const dto = new SearchUsersDto();
      dto.nationalId = '123456789'; // Too short

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });
});
