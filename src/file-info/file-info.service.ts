import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateInfoDto } from './file-info.dto';
import { FileInfo, FileInfoDocument } from './file-info.entity';

@Injectable()
export class FileInfoService {
  constructor(
    @InjectModel(FileInfo.name) private fileInfoModel: Model<FileInfoDocument>,
  ) {}

  createInfo(data: CreateInfoDto) {
    return this.fileInfoModel.create({
      ...data,
      watchedTimes: 0,
      isActiveLink: false,
    });
  }

  getInfo(id: string) {
    return this.fileInfoModel.findById(id);
  }

  remove(id: string) {
    return this.fileInfoModel.findByIdAndRemove(id, { new: true });
  }

  findById(id: string) {
    return this.fileInfoModel.findById(id);
  }

  async addWatchedTimes(id: string) {
    const fileInfo = await this.fileInfoModel.findById(id);

    return this.fileInfoModel.findByIdAndUpdate(id, {
      $set: {
        watchedTimes: fileInfo.watchedTimes + 1,
      },
    });
  }

  changeActiveLinkStatus(id: string, status: boolean) {
    return this.fileInfoModel.findByIdAndUpdate(id, {
      $set: {
        isActiveLink: status,
      },
    });
  }

  find(ids) {
    return this.fileInfoModel.find(ids);
  }
}
