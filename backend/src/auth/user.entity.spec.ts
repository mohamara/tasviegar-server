import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = 'user-id';
    user.mobile = '+98 912 345 6789';
    user.firstName = 'Test';
    user.lastName = 'User';
    user.email = 'test@example.com';
    user.password = 'hashed-password';
    user.isActive = true;
    user.isVerified = true;
    user.role = 'user';
  });

  describe('fullName getter', () => {
    it('should return full name when both names exist', () => {
      expect(user.fullName).toBe('Test User');
    });

    it('should return only first name when last name is missing', () => {
      user.lastName = null;
      expect(user.fullName).toBe('Test');
    });

    it('should return only last name when first name is missing', () => {
      user.firstName = null;
      expect(user.fullName).toBe('User');
    });

    it('should return empty string when both names are missing', () => {
      user.firstName = null;
      user.lastName = null;
      expect(user.fullName).toBe('');
    });

    it('should trim whitespace', () => {
      user.firstName = '  Test  ';
      user.lastName = '  User  ';
      expect(user.fullName).toBe('Test User');
    });
  });

  describe('isComplete getter', () => {
    it('should return true when all required fields are present', () => {
      user.nationalId = '1234567890';
      expect(user.isComplete).toBe(true);
    });

    it('should return false when firstName is missing', () => {
      user.firstName = null;
      user.nationalId = '1234567890';
      expect(user.isComplete).toBe(false);
    });

    it('should return false when lastName is missing', () => {
      user.lastName = null;
      user.nationalId = '1234567890';
      expect(user.isComplete).toBe(false);
    });

    it('should return false when nationalId is missing', () => {
      expect(user.isComplete).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate password correctly', async () => {
      const password = 'password123';
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await user.validatePassword(password);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const password = 'wrongpassword';
      mockBcrypt.compare.mockResolvedValue(false);

      const result = await user.validatePassword(password);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toBe(false);
    });
  });

  describe('hashPassword (BeforeInsert/BeforeUpdate)', () => {
    it('should hash password when it is not already hashed', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashed-password-123';
      
      user.password = plainPassword;
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      await user.hashPassword();

      expect(mockBcrypt.hash).toHaveBeenCalledWith(plainPassword, 12);
      expect(user.password).toBe(hashedPassword);
    });

    it('should not hash password when it is already hashed', async () => {
      const alreadyHashedPassword = 'hashed-password-that-is-longer-than-60-characters-to-indicate-it-is-already-hashed';
      user.password = alreadyHashedPassword;

      await user.hashPassword();

      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(user.password).toBe(alreadyHashedPassword);
    });
  });

  describe('Entity decorators', () => {
    it('should have correct entity name', () => {
      expect(User.name).toBe('User');
    });

    it('should have required properties', () => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('mobile');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('password');
      expect(user).toHaveProperty('isActive');
      expect(user).toHaveProperty('isVerified');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });
  });
});
