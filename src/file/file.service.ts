import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { Connection } from 'mongoose';
import { GridFSBucketReadStream } from 'mongodb';
import { FileInfo } from './file.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FileService {
  private fileModel: MongoGridFS;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly userService: UserService,
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
    };
  }

  async deleteFile(id: string): Promise<boolean> {
    return await this.fileModel.delete(id);
  }

  async receiveFiles(userId: string) {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }

    const files = await this.fileModel.find({
      _id: {
        $in: user.images,
      },
    });

    console.log({ files });

    return files;
  }

  async count(userId: string) {
    const user = await this.userService.findOneById(userId);

    console.log('suer', user);

    if (!user) {
      throw new HttpException(
        'User does not exist. C01',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.images.length;
  }
}
