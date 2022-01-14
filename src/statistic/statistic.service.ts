import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Statistic, StatisticDocument } from './statistic.entity';

@Injectable()
export class StatisticService {
  constructor(
    @InjectModel(Statistic.name)
    private statisticModel: Model<StatisticDocument>,
  ) {}

  createStatistic(data: { deleteFiles: number; usedTemporaryLinks: number }) {
    return this.statisticModel.create(data);
  }

  async addDeletedFiles(id: string) {
    const statistic = await this.statisticModel.findById(id);

    console.log({ statistic });

    return this.statisticModel.findByIdAndUpdate(id, {
      $set: { deleteFiles: statistic.deleteFiles + 1 },
    });
  }

  async addUsedTemporaryLinks(id: string) {
    const statistic = await this.statisticModel.findById(id);

    console.log({ statistic });

    return this.statisticModel.findByIdAndUpdate(id, {
      $set: { usedTemporaryLinks: statistic.usedTemporaryLinks + 1 },
    });
  }
}
