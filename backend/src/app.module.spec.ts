import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have ConfigModule configured', () => {
    const configModule = module.get('ConfigModule');
    expect(configModule).toBeDefined();
  });

  it('should have TypeOrmModule configured', () => {
    const typeOrmModule = module.get('TypeOrmModule');
    expect(typeOrmModule).toBeDefined();
  });

  it('should have AuthModule imported', () => {
    const authModule = module.get('AuthModule');
    expect(authModule).toBeDefined();
  });

  it('should have UserModule imported', () => {
    const userModule = module.get('UserModule');
    expect(userModule).toBeDefined();
  });
});
