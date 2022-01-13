import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileInfo } from '../file/file.dto';
import { CreateInfoDto } from './file-info.dto';
import { FileInfoDocument } from './file-info.entity';

@Injectable()
export class FileInfoService {
  constructor(
    @InjectModel(FileInfo.name) private fileInfoModel: Model<FileInfoDocument>,
  ) {}

  async createInfo(data: CreateInfoDto) {
    return this.fileInfoModel.create(data);
  }

  async getInfo(fileInfoId: string) {
    return this.fileInfoModel.findById(fileInfoId);
  }

  async remove(id: string) {
    return this.fileInfoModel.findByIdAndRemove(id, { new: true });
  }
}
