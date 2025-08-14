import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    validateNationalId: jest.fn(),
    validatePhone: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users list', async () => {
      const mockResult = {
        users: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      };
      mockUserService.findAll.mockResolvedValue(mockResult);

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.findAll({}, response as any);

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(200);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 'user-id', firstName: 'Test' };
      mockUserService.findOne.mockResolvedValue(mockUser);

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.findOne('user-id', response as any);

      expect(mockUserService.findOne).toHaveBeenCalledWith('user-id');
      expect(response.status).toHaveBeenCalledWith(200);
    });
  });
});
