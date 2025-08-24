import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppSimpleModule } from './app-simple.module'

async function bootstrap() {
  const app = await NestFactory.create(AppSimpleModule)
  
  app.enableCors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:8082", "http://127.0.0.1:8082"],
    credentials: true,
  })
  
  app.setGlobalPrefix('api')
  
  console.log('🚀 Simple Backend Server starting...')
  console.log('📡 Port: 3000')
  console.log('🌐 CORS enabled for frontend ports')
  
  await app.listen(3000)
  console.log('✅ Simple Backend Server is running on http://localhost:3000')
}

bootstrap().catch(err => {
  console.error('❌ Failed to start server:', err)
  process.exit(1)
})
