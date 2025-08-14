import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';

describe('Database Config', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as any;
  });

  describe('getDatabaseConfig', () => {
    it('should return default configuration when no env vars are set', () => {
      (configService.get as jest.Mock).mockImplementation((key: string, defaultValue: any) => defaultValue);

      const config = getDatabaseConfig(configService);

      expect(config).toEqual({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'settler',
        entities: [expect.stringContaining('*.entity{.ts,.js}')],
        synchronize: false,
        logging: false,
        ssl: false,
        autoLoadEntities: true,
        migrations: [expect.stringContaining('migrations/*{.ts,.js}')],
        migrationsRun: false,
      });
    });

    it('should use environment variables when provided', () => {
      const mockEnvVars = {
        DB_HOST: 'custom-host',
        DB_PORT: 5433,
        DB_USERNAME: 'custom-user',
        DB_PASSWORD: 'custom-password',
        DB_NAME: 'custom-database',
        DB_SYNC: true,
        DB_LOGGING: true,
        DB_SSL: true,
        DB_MIGRATIONS_RUN: true,
      };

      (configService.get as jest.Mock).mockImplementation((key: string, defaultValue: any) => {
        return mockEnvVars[key] !== undefined ? mockEnvVars[key] : defaultValue;
      });

      const config = getDatabaseConfig(configService);

      expect(config).toEqual({
        type: 'postgres',
        host: 'custom-host',
        port: 5433,
        username: 'custom-user',
        password: 'custom-password',
        database: 'custom-database',
        entities: [expect.stringContaining('*.entity{.ts,.js}')],
        synchronize: true,
        logging: true,
        ssl: { rejectUnauthorized: false },
        autoLoadEntities: true,
        migrations: [expect.stringContaining('migrations/*{.ts,.js}')],
        migrationsRun: true,
      });
    });

    it('should handle SSL configuration correctly', () => {
      (configService.get as jest.Mock).mockImplementation((key: string, defaultValue: any) => {
        if (key === 'DB_SSL') return true;
        return defaultValue;
      });

      const config = getDatabaseConfig(configService);

      expect(config.ssl).toEqual({ rejectUnauthorized: false });
    });

    it('should handle SSL configuration when disabled', () => {
      (configService.get as jest.Mock).mockImplementation((key: string, defaultValue: any) => {
        if (key === 'DB_SSL') return false;
        return defaultValue;
      });

      const config = getDatabaseConfig(configService);

      expect(config.ssl).toBe(false);
    });

    it('should include correct entity paths', () => {
      (configService.get as jest.Mock).mockImplementation((key: string, defaultValue: any) => defaultValue);

      const config = getDatabaseConfig(configService);

      expect(config.entities).toEqual([expect.stringContaining('*.entity{.ts,.js}')]);
      expect(config.entities[0]).toContain('**');
    });

    it('should include correct migration paths', () => {
      (configService.get as jest.Mock).mockImplementation((key: string, defaultValue: any) => defaultValue);

      const config = getDatabaseConfig(configService);

      expect(config.migrations).toEqual([expect.stringContaining('migrations/*{.ts,.js}')]);
      expect(config.migrations[0]).toContain('migrations');
    });

    it('should enable autoLoadEntities', () => {
      (configService.get as jest.Mock).mockImplementation((key: string, defaultValue: any) => defaultValue);

      const config = getDatabaseConfig(configService);

      expect(config.autoLoadEntities).toBe(true);
    });
  });
});
