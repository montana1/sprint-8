import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );

    // Разрешение CORS
    app.enableCors({
      origin: 'http://localhost:3000',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true, 
    });

    app.useLogger(['error', 'log', 'warn', 'debug']); 
  
    await app.listen(process.env.APP_PORT || '8000', '0.0.0.0');
  } catch (error) {
    console.error(error);
  } finally {
    console.log("Start app!");
  }
  
}
bootstrap();

