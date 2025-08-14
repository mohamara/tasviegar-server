import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { Iranian2FAService } from './iranian-2fa.service';
import { AuthGuard } from './auth.guard';
import { UserModule } from './user.module';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
  });

  it('should provide AuthController', () => {
    const authController = module.get<AuthController>(AuthController);
    expect(authController).toBeDefined();
  });

  it('should provide JwtStrategy', () => {
    const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    expect(jwtStrategy).toBeDefined();
  });

  it('should provide Iranian2FAService', () => {
    const iranian2FAService = module.get<Iranian2FAService>(Iranian2FAService);
    expect(iranian2FAService).toBeDefined();
  });

  it('should provide AuthGuard', () => {
    const authGuard = module.get<AuthGuard>(AuthGuard);
    expect(authGuard).toBeDefined();
  });

  it('should export AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
  });

  it('should export AuthGuard', () => {
    const authGuard = module.get<AuthGuard>(AuthGuard);
    expect(authGuard).toBeDefined();
  });
});
