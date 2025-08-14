import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'password'),
  database: configService.get<string>('DB_NAME', 'settler'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get<boolean>('DB_SYNC', false), // false in production
  logging: configService.get<boolean>('DB_LOGGING', false),
  ssl: configService.get<boolean>('DB_SSL', false) ? { rejectUnauthorized: false } : false,
  autoLoadEntities: true,
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: configService.get<boolean>('DB_MIGRATIONS_RUN', false),
})
