import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { SimpleController } from './simple.controller'
import { AuthSimpleController } from './auth-simple.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
  ],
  controllers: [AppController, SimpleController, AuthSimpleController],
})
export class AppSimpleModule {}
