import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
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
    private readonly statisticModel: Model<StatisticDocument>,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly fileInfoService: FileInfoService,
  ) {}

  createStatistic(data: { deleteFiles: number; usedTemporaryLinks: number }) {
    return this.statisticModel.create(data);
  }

  public async addDeletedFiles(id: string) {
    const statistic = await this.statisticModel.findById(id);

    if (!statistic) {
      throw new HttpException("Can't get statistic", HttpStatus.BAD_REQUEST);
    }

    const updatedStatistic = await this.statisticModel.findByIdAndUpdate(id, {
      $set: { deleteFiles: statistic.deleteFiles + 1 },
    });

    return updatedStatistic;
  }

  public async addUsedTemporaryLinks(id: string) {
    try {
      const statistic = await this.statisticModel.findById(id);

      if (!statistic) {
        throw new HttpException("Can't get statistic", HttpStatus.BAD_REQUEST);
      }

      const updatedStatistic = await this.statisticModel.findByIdAndUpdate(id, {
        $set: { usedTemporaryLinks: statistic.usedTemporaryLinks + 1 },
      });

      if (!updatedStatistic) {
        throw new HttpException("Can't get statistic", HttpStatus.BAD_REQUEST);
      }

      return updatedStatistic;
    } catch (e) {
      //!
    }
  }

  public async getLinkesWatchedTimes(images: Types.ObjectId[]) {
    try {
      const files = await this.fileService.find(images);

      const ids = files.map((file) =>
        Types.ObjectId.createFromHexString(file.metadata['fileInfo']),
      );

      const details = await this.fileInfoService.findManyByIds(ids);

      if (!details) {
        //!
      }

      return details.reduce((prev, current) => prev + current.watchedTimes, 0);
    } catch (e) {
      //!
    }
  }

  public async receiveFullStatistic(userId: string) {
    try {
      const user = await this.userService.findOneById(userId);

      if (!user) {
        //!
      }

      const stat = await this.statisticModel.findById(user.statistic);

      if (!stat) {
        //!
      }
      const fileCount = await this.fileService.count(user.id);
      const linkWatchedTimes = await this.getLinkesWatchedTimes(user.images);
      const tempLinkCount = await this.fileService.getTempLinksCount(
        user.images,
      );

      return {
        deleteFiles: stat.deleteFiles,
        usedTemporaryLinks: stat.usedTemporaryLinks,
        fileCount,
        linkWatchedTimes,
        tempLinkCount,
      };
    } catch (e) {
      //!
    }
  }
}
