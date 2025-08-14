import { isValidIranianMobile, isValidIranianNationalId } from './iranian-validation.util';

describe('Iranian Validation Utils', () => {
  describe('isValidIranianMobile', () => {
    it('should validate correct Iranian mobile numbers', () => {
      const validMobiles = [
        '+98 912 345 6789',
        '+98 913 123 4567',
        '+98 914 987 6543',
        '+98 915 555 1234',
        '+98 916 777 8888',
        '+98 917 999 0000',
        '+98 918 111 2222',
        '+98 919 333 4444',
      ];

      validMobiles.forEach(mobile => {
        expect(isValidIranianMobile(mobile)).toBe(true);
      });
    });

    it('should reject invalid Iranian mobile numbers', () => {
      const invalidMobiles = [
        '09123456789', // Wrong format
        '+98 912 345 678', // Too short
        '+98 912 345 67890', // Too long
        '+98 911 345 6789', // Invalid prefix
        '+98 920 345 6789', // Invalid prefix
        '+98 912 345 678a', // Contains letter
        '912 345 6789', // Missing country code
        '+98 9123456789', // No spaces
        '+98 912 3456789', // Wrong spacing
        '+98 912345 6789', // Wrong spacing
      ];

      invalidMobiles.forEach(mobile => {
        expect(isValidIranianMobile(mobile)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidIranianMobile('')).toBe(false);
      expect(isValidIranianMobile(null as any)).toBe(false);
      expect(isValidIranianMobile(undefined as any)).toBe(false);
      expect(isValidIranianMobile('   +98 912 345 6789   ')).toBe(false); // Extra spaces
    });
  });

  describe('isValidIranianNationalId', () => {
    it('should validate correct Iranian national IDs', () => {
      const validNationalIds = [
        '1234567890', // Example valid ID
        '1111111111', // All ones (valid checksum)
        '2222222222', // All twos (valid checksum)
        '3333333333', // All threes (valid checksum)
        '4444444444', // All fours (valid checksum)
        '5555555555', // All fives (valid checksum)
        '6666666666', // All sixes (valid checksum)
        '7777777777', // All sevens (valid checksum)
        '8888888888', // All eights (valid checksum)
        '9999999999', // All nines (valid checksum)
        '0000000000', // All zeros (valid checksum)
      ];

      validNationalIds.forEach(nationalId => {
        expect(isValidIranianNationalId(nationalId)).toBe(true);
      });
    });

    it('should reject invalid Iranian national IDs', () => {
      const invalidNationalIds = [
        '123456789', // Too short (9 digits)
        '12345678901', // Too long (11 digits)
        '123456789a', // Contains letter
        '123456789 ', // Contains space
        '123456789.', // Contains dot
        '123456789-', // Contains dash
        '0000000001', // Invalid checksum
        '1111111112', // Invalid checksum
        '2222222223', // Invalid checksum
        '3333333334', // Invalid checksum
        '4444444445', // Invalid checksum
        '5555555556', // Invalid checksum
        '6666666667', // Invalid checksum
        '7777777778', // Invalid checksum
        '8888888889', // Invalid checksum
        '9999999990', // Invalid checksum
      ];

      invalidNationalIds.forEach(nationalId => {
        expect(isValidIranianNationalId(nationalId)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidIranianNationalId('')).toBe(false);
      expect(isValidIranianNationalId(null as any)).toBe(false);
      expect(isValidIranianNationalId(undefined as any)).toBe(false);
      expect(isValidIranianNationalId('  1234567890  ')).toBe(false); // Extra spaces
    });

    it('should validate specific known valid national IDs', () => {
      // These are examples of valid national IDs with correct checksums
      const knownValidIds = [
        '1234567890', // Example with checksum calculation
        '1111111111', // All ones: (1*10 + 1*9 + 1*8 + 1*7 + 1*6 + 1*5 + 1*4 + 1*3 + 1*2) % 11 = 55 % 11 = 0, check = 1
        '2222222222', // All twos: (2*10 + 2*9 + 2*8 + 2*7 + 2*6 + 2*5 + 2*4 + 2*3 + 2*2) % 11 = 110 % 11 = 0, check = 2
        '3333333333', // All threes: (3*10 + 3*9 + 3*8 + 3*7 + 3*6 + 3*5 + 3*4 + 3*3 + 3*2) % 11 = 165 % 11 = 0, check = 3
        '4444444444', // All fours: (4*10 + 4*9 + 4*8 + 4*7 + 4*6 + 4*5 + 4*4 + 4*3 + 4*2) % 11 = 220 % 11 = 0, check = 4
        '5555555555', // All fives: (5*10 + 5*9 + 5*8 + 5*7 + 5*6 + 5*5 + 5*4 + 5*3 + 5*2) % 11 = 275 % 11 = 0, check = 5
        '6666666666', // All sixes: (6*10 + 6*9 + 6*8 + 6*7 + 6*6 + 6*5 + 6*4 + 6*3 + 6*2) % 11 = 330 % 11 = 0, check = 6
        '7777777777', // All sevens: (7*10 + 7*9 + 7*8 + 7*7 + 7*6 + 7*5 + 7*4 + 7*3 + 7*2) % 11 = 385 % 11 = 0, check = 7
        '8888888888', // All eights: (8*10 + 8*9 + 8*8 + 8*7 + 8*6 + 8*5 + 8*4 + 8*3 + 8*2) % 11 = 440 % 11 = 0, check = 8
        '9999999999', // All nines: (9*10 + 9*9 + 9*8 + 9*7 + 9*6 + 9*5 + 9*4 + 9*3 + 9*2) % 11 = 495 % 11 = 0, check = 9
        '0000000000', // All zeros: (0*10 + 0*9 + 0*8 + 0*7 + 0*6 + 0*5 + 0*4 + 0*3 + 0*2) % 11 = 0 % 11 = 0, check = 0
      ];

      knownValidIds.forEach(nationalId => {
        expect(isValidIranianNationalId(nationalId)).toBe(true);
      });
    });

    it('should reject specific known invalid national IDs', () => {
      // These are examples of invalid national IDs with incorrect checksums
      const knownInvalidIds = [
        '0000000001', // Should be 0000000000
        '1111111112', // Should be 1111111111
        '2222222223', // Should be 2222222222
        '3333333334', // Should be 3333333333
        '4444444445', // Should be 4444444444
        '5555555556', // Should be 5555555555
        '6666666667', // Should be 6666666666
        '7777777778', // Should be 7777777777
        '8888888889', // Should be 8888888888
        '9999999990', // Should be 9999999999
      ];

      knownInvalidIds.forEach(nationalId => {
        expect(isValidIranianNationalId(nationalId)).toBe(false);
      });
    });
  });
});
