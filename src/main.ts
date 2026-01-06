import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorHandler } from './middleware';
import { RequestHandler } from './middleware';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

declare global {
  namespace Express {
    interface Request {
      session: any; // Adjust the type according to your session implementation
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
  app.enableCors({})
  // app.enableCors({
  //   origin: (origin, callback) => {
  //     if (!origin || origin.includes('localhost')) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error('CORS blocked'));
  //     }
  //   },
  //   credentials: true,
  // });
  app.use(helmet());
  app.setGlobalPrefix('marketing');
  const config = new DocumentBuilder()
    .setTitle('Rest Api Authentication')
    .setDescription('Rest Api Documentation for Marketing')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  app.use(
    session({
      secret: 'yyk5LZwjEjQuJjrzAMW4ApROWJ72leKv',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 }, // 1 hour
    })
  );
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new RequestHandler());
  app.useGlobalFilters(new ErrorHandler());
  await app.listen(3001);
}
bootstrap();
