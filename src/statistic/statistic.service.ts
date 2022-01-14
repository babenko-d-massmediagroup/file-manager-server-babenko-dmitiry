import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { FileInfoService } from 'src/file-info/file-info.service';
import { FileService } from 'src/file/file.service';
import { UserService } from 'src/user/user.service';
import { Statistic, StatisticDocument } from './statistic.entity';

@Injectable()
export class StatisticService {
  constructor(
    @InjectModel(Statistic.name)
    private statisticModel: Model<StatisticDocument>,
    @Inject(forwardRef(() => FileService))
    private fileService: FileService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private fileInfoService: FileInfoService,
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

  async getLinkesWatchedTimes(images: Types.ObjectId[]) {
    const files = await this.fileService.find(images);
    const ids = files.map((file) => file.metadata['fileInfo']);
    const details = await this.fileInfoService.find(ids);
    return details.reduce((prev, current) => prev + current.watchedTimes, 0);
  }

  async receiveFullStatistic(userId: string) {
    const user = await this.userService.findOneById(userId);
    const stat = await this.statisticModel.findById(user.static);
    const fileCount = await this.fileService.count(user.id);
    const linkWatchedTimes = this.getLinkesWatchedTimes(user.images);
  }
}
