require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AirportsService, PositionsService } from 'src/services';
import { PositionsController, AirportsController } from 'src/controllers';

@Module({
  imports: [],
  controllers: [PositionsController, AirportsController],
  providers: [AirportsService, PositionsService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
