import { forwardRef, Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { Statistic, StatisticSchema } from './statistic.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { FileModule } from 'src/file/file.module';
import { UserModule } from 'src/user/user.module';
import { FileInfoModule } from 'src/file-info/file-info.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => FileModule),
    FileInfoModule,
    MongooseModule.forFeature([
      { name: Statistic.name, schema: StatisticSchema },
    ]),
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
