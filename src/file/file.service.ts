import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { Connection, Types } from 'mongoose';
import { GridFSBucketReadStream } from 'mongodb';
import { FileInfo, FullInfo } from './file.dto';
import { UserService } from '../user/user.service';
import { FileInfoService } from '../file-info/file-info.service';
import { LinkService } from 'src/link/link.service';
import { StatisticService } from 'src/statistic/statistic.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  private fileModel: MongoGridFS;
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => StatisticService))
    private readonly statisticService: StatisticService,
    private readonly fileInfoService: FileInfoService,
    private readonly linkService: LinkService,
    private readonly configService: ConfigService,
  ) {
    this.fileModel = new MongoGridFS(this.connection.db, 'fs');
  }
  public async findById(id: string) {
    try {
      const file = await this.fileModel.findById(id);

      return file;
    } catch (e) {
      throw new HttpException("Can't find the file", HttpStatus.BAD_REQUEST);
    }
  }

  public async find(ids: Types.ObjectId[]) {
    try {
      const file = await this.fileModel.find({ _id: { $in: ids } });

      return file;
    } catch (e) {
      throw new HttpException("Can't find the file", HttpStatus.BAD_REQUEST);
    }
  }

  public async getTempLinksCount(images: Types.ObjectId[]) {
    try {
      const files = await this.find(images);
      const ids = files.map((file) => file.metadata['tokens']);

      const tokensModel = await this.linkService.findManyByIds(ids);

      return tokensModel.reduce((prev, cur) => prev + cur.tokens.length, 0);
    } catch (e) {
      throw new HttpException(
        "Can't get temporary links",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async readStream(id: string): Promise<GridFSBucketReadStream> {
    return await this.fileModel.readFileStream(id);
  }

  public async findInfo(id: string): Promise<FileInfo> {
    try {
      const result = await this.fileModel
        .findById(id)
        .catch((err) => {
          throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        })
        .then((result) => result);

      if (!result.metadata['fileInfo']) {
        throw new HttpException("Can't get file info", HttpStatus.BAD_REQUEST);
      }

      const fileInfo = await this.fileInfoService.findById(
        result.metadata['fileInfo'] as string,
      );

      return {
        filename: result.filename,
        length: result.length,
        chunkSize: result.chunkSize,
        md5: result.md5,
        contentType: result.contentType,
        fileInfo: result.metadata['fileInfo'],
        watchedTimes: fileInfo.watchedTimes,
        isActiveLink: fileInfo.isActiveLink,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  public async deleteFile(id: string, userId: string) {
    try {
      const file = await this.findById(id);

      if (!file.metadata['fileInfo'])
        throw new HttpException("Can't get file Info", HttpStatus.BAD_REQUEST);
      if (!file.metadata['tokens'])
        throw new HttpException("Can't get token", HttpStatus.BAD_REQUEST);

      await this.userService.removeImage(userId, id);

      const user = await this.userService.findOneById(userId);

      await this.statisticService.addDeletedFiles(user.statistic.toString());
      await this.fileInfoService.remove(file.metadata['fileInfo']);
      await this.linkService.removeTemporaryLinks(file.metadata['tokens']);
      await this.delete(id);

      return {
        message: 'File has been deleted',
        file: file,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(id: string) {
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

  public async receiveFiles(userId: string) {
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

    if (!file.metadata['fileInfo']) {
      throw new HttpException("Can't get file info", HttpStatus.BAD_REQUEST);
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

      const fileInfo = await this.fileInfoService.findById(
        file.metadata['fileInfo'],
      );
      return fileInfo.isActiveLink;
    } catch (e) {
      throw new HttpException(
        'File does not exist C04',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async addWatchedTimes(id: string) {
    const file = await this.fileModel.findById(id);

    return this.fileInfoService.addWatchedTimes(
      file.metadata['fileInfo'] as string,
    );
  }

  async setPhotoLinkStatus(id: string, status: boolean) {
    const file = await this.fileModel.findById(id);
    return this.fileInfoService.changeActiveLinkStatus(
      file.metadata['fileInfo'],
      status,
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

  async getTokensId(fileId: string) {
    try {
      const file = await this.fileModel.findById(fileId);

      return file.metadata['tokens']
        ? (file.metadata['tokens'] as string)
        : null;
    } catch (e) {
      throw new Error('handle error here');
    }
  }

  public async getFullInfo(fileId: string): Promise<FullInfo> {
    try {
      const commentDeleteInfo = await this.getCommentAndDeleteDateInfo(fileId);
      const file = await this.findInfo(fileId);
      const fileInfo = await this.fileInfoService.findById(file.fileInfo);

      const fullInfo: FullInfo = {
        comment: commentDeleteInfo.comment,
        deleteDate: commentDeleteInfo.deleteDate,
        filename: file.filename,
        watchedTimes: fileInfo.watchedTimes,
        isActiveLink: fileInfo.isActiveLink,
        link: `${this.configService.get<string>(
          'FRONT_END_DOMAIN',
        )}/watch/${fileId}`,
      };

      return fullInfo;
    } catch (e) {
      throw new HttpException(
        "Can't retrieve full info",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getInfo(id: string) {
    const file = await this.findInfo(id);
    const filestream = await this.readStream(id);

    if (!filestream) {
      throw new HttpException(
        'An error occurred while retrieving file info',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    return {
      message: 'File has been detected',
      file: file,
    };
  }

  public async addImage(userId: string, files: any[]) {
    if (!files.length) {
      //!x
    }

    const img = await this.userService.addImage(userId, files[0].id);

    return files[0];
  }
}
