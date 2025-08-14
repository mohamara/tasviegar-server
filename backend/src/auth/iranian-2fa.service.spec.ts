import { Test, TestingModule } from '@nestjs/testing';
import { Iranian2FAService } from './iranian-2fa.service';

describe('Iranian2FAService', () => {
  let service: Iranian2FAService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Iranian2FAService],
    }).compile();

    service = module.get<Iranian2FAService>(Iranian2FAService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSms', () => {
    it('should send SMS successfully', async () => {
      const mobile = '+98 912 345 6789';
      const code = '1234';

      const result = await service.sendSms(mobile, code);

      expect(result).toBe(true);
    });

    it('should handle different mobile numbers', async () => {
      const mobiles = [
        '+98 912 345 6789',
        '+98 913 123 4567',
        '+98 914 987 6543',
      ];

      for (const mobile of mobiles) {
        const result = await service.sendSms(mobile, '1234');
        expect(result).toBe(true);
      }
    });

    it('should handle different codes', async () => {
      const mobile = '+98 912 345 6789';
      const codes = ['1234', '5678', '9999', '0000'];

      for (const code of codes) {
        const result = await service.sendSms(mobile, code);
        expect(result).toBe(true);
      }
    });
  });
});
