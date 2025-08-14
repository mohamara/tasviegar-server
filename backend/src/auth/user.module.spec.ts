import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

describe('UserModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide UserService', () => {
    const userService = module.get<UserService>(UserService);
    expect(userService).toBeDefined();
  });

  it('should provide UserController', () => {
    const userController = module.get<UserController>(UserController);
    expect(userController).toBeDefined();
  });

  it('should export UserService', () => {
    const userService = module.get<UserService>(UserService);
    expect(userService).toBeDefined();
  });
});
