import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import helmet from 'helmet'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(helmet())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.enableCors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:8082", "http://127.0.0.1:8082"],
    credentials: true,
  })
  app.setGlobalPrefix('api')

  const config = new DocumentBuilder()
    .setTitle('Settler API')
    .setDescription('Social fintech API for debts and settlements')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const doc = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, doc)
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000)
}

bootstrap()

