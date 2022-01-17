import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectID } from 'bson';
import { Model } from 'mongoose';

import { CreateInfoDto } from './file-info.dto';
import { FileInfo, FileInfoDocument } from './file-info.entity';

@Injectable()
export class FileInfoService {
  constructor(
    @InjectModel(FileInfo.name)
    private readonly fileInfoModel: Model<FileInfoDocument>,
  ) {}

  public createInfo(data: CreateInfoDto) {
    return this.fileInfoModel.create({
      ...data,
      watchedTimes: 0,
      isActiveLink: false,
    });
  }

  public getInfo(id: string) {
    return this.fileInfoModel.findById(id);
  }

  public remove(id: string) {
    return this.fileInfoModel.findByIdAndRemove(id, { new: true });
  }

  public findById(id: string) {
    return this.fileInfoModel.findById(id);
  }

  public async addWatchedTimes(id: string) {
    const fileInfo = await this.fileInfoModel.findById(id);

    return this.fileInfoModel.findByIdAndUpdate(id, {
      $set: {
        watchedTimes: fileInfo.watchedTimes + 1,
      },
    });
  }

  public changeActiveLinkStatus(id: string, status: boolean) {
    return this.fileInfoModel.findByIdAndUpdate(id, {
      $set: {
        isActiveLink: status,
      },
    });
  }

  public findManyByIds(ids: ObjectID[]) {
    return this.fileInfoModel.find({ _id: { $in: ids } });
  }
}
