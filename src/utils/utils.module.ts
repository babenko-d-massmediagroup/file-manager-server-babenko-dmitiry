import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { UtilsController } from './utils.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [UtilsController],
  providers: [UtilsService],
  exports: [UtilsService],
  imports: [ConfigModule.forRoot()],
})
export class UtilsModule {}
