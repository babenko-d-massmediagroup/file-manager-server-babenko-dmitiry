import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { Connection, Types } from 'mongoose';
import { GridFSBucketReadStream } from 'mongodb';
import { FileInfo } from './file.dto';
import { UserService } from '../user/user.service';
import { FileInfoService } from '../file-info/file-info.service';

@Injectable()
export class FileService {
  private fileModel: MongoGridFS;
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly userService: UserService,
    private readonly fileInfoService: FileInfoService,
  ) {
    this.fileModel = new MongoGridFS(this.connection.db, 'fs');
  }

  async readStream(id: string): Promise<GridFSBucketReadStream> {
    return await this.fileModel.readFileStream(id);
  }

  async findInfo(id: string): Promise<FileInfo> {
    const result = await this.fileModel
      .findById(id)
      .catch((err) => {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      })
      .then((result) => result);
    return {
      filename: result.filename,
      length: result.length,
      chunkSize: result.chunkSize,
      md5: result.md5,
      contentType: result.contentType,
      fileInfo: result.metadata['fileInfo'],
      watchedTimes: result.metadata['watchedTimes'],
      isActiveLink: result.metadata['isActiveLink'],
    };
  }

  async deleteFile(id: string) {
    try {
      await this.connection.db
        .collection('fs.files')
        .findOneAndDelete({ _id: Types.ObjectId.createFromHexString(id) });
      await this.connection.db
        .collection('fs.chunks')
        .findOneAndDelete({ files_id: Types.ObjectId.createFromHexString(id) });
    } catch (e) {
      throw new HttpException(
        'An error occurred during file deletion',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async receiveFiles(userId: string) {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }

    const files = await this.connection.db
      .collection('fs.files')
      .find({ _id: { $in: user.images } }, { sort: { uploadDate: -1 } })
      .toArray();

    return files;
  }

  async count(userId: string) {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new HttpException(
        'User does not exist. C01',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.images.length;
  }

  async getCommentAndDeleteDateInfo(fileId: string) {
    const file = await this.fileModel.findById(fileId);

    if (!file) {
      throw new HttpException(
        'File does not exist. C02',
        HttpStatus.BAD_REQUEST,
      );
    }

    const additionalInfo = await this.fileInfoService.getInfo(
      file.metadata['fileInfo'] as string,
    );

    if (!additionalInfo) {
      throw new HttpException(
        'File info does not exist. C03',
        HttpStatus.BAD_REQUEST,
      );
    }

    return additionalInfo;
  }

  async isActiveLink(id: string): Promise<boolean> {
    try {
      const file = await this.fileModel.findById(id);

      return file.metadata['isActiveLink'];
    } catch (e) {
      throw new HttpException(
        'File does not exist C04',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async addWatchedTimes(id: string) {
    const file = await this.fileModel.findById(id);

    const updatedFile = await this.connection.db
      .collection('fs.files')
      .findOneAndUpdate(
        { _id: file._id },
        {
          $set: {
            'metadata.watchedTimes': file.metadata['watchedTimes'] + 1,
          },
        },
      );
  }

  setPhotoLinkStatus(id: string, status: boolean) {
    return this.connection.db.collection('fs.files').findOneAndUpdate(
      { _id: Types.ObjectId.createFromHexString(id) },
      {
        $set: {
          'metadata.isActiveLink': status,
        },
      },
    );
  }

  async getTokensModelId(fileId: string) {
    try {
      const file = await this.fileModel.findById(fileId);

      if (!file) {
        throw new Error('Error here 2');
      }

      return file.metadata['tokens'];
    } catch (e) {
      throw new Error('Error here');
    }
  }
}
