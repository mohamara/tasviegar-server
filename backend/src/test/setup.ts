import 'reflect-metadata';

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  // Mock external services
});

afterAll(async () => {
  // Cleanup test database
  // Close connections
});

// Global test utilities
export const createMockUser = () => ({
  id: 'test-user-id',
  mobile: '+98 912 345 6789',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  isVerified: true,
  isActive: true,
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createMockJwtPayload = () => ({
  sub: 'test-user-id',
  mobile: '+98 912 345 6789',
  role: 'user',
  isVerified: true,
});
