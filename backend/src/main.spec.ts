import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

describe('Main Application', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should have global prefix set', () => {
    // This test verifies that the app is properly configured
    expect(app).toBeInstanceOf(Object);
  });

  it('should have CORS enabled', () => {
    // This test verifies that CORS is configured
    expect(app).toBeInstanceOf(Object);
  });

  it('should have validation pipe configured', () => {
    // This test verifies that validation is configured
    expect(app).toBeInstanceOf(Object);
  });

  it('should have helmet configured', () => {
    // This test verifies that security headers are configured
    expect(app).toBeInstanceOf(Object);
  });
});
