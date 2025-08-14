import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './auth/user.module'
import { DebtsModule } from './debts/debts.module'
import { GroupsModule } from './groups/groups.module'
import { NotificationsModule } from './notifications/notifications.module'
import { getDatabaseConfig } from './config/database.config'

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule, 
    UserModule,
    DebtsModule,
    GroupsModule,
    NotificationsModule
  ],
})
export class AppModule {}

