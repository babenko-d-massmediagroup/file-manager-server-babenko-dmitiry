import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { Statistic, StatisticSchema } from './statistic.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Statistic.name, schema: StatisticSchema },
    ]),
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
