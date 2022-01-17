import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import * as GridFsStorage from 'multer-gridfs-storage';
import { FileInfoService } from 'src/file-info/file-info.service';
import { LinkService } from 'src/link/link.service';

@Injectable()
export class GridFsMulterConfigService implements MulterOptionsFactory {
  private gridFsStorage;
  constructor(
    private configService: ConfigService,
    private fileInfoService: FileInfoService,
    private linkService: LinkService,
  ) {
    this.gridFsStorage = new GridFsStorage.GridFsStorage({
      url: this.configService.get<string>('MONGO_URL'),

      file: async (req, file) => {
        try {
          if (+req.headers['content-length'] > 5000001) {
            throw new HttpException(
              'File should be less then 5mb',
              HttpStatus.BAD_REQUEST,
            );
          }
          const comment = req.query.comment ? req.query.comment.toString() : '';
          const deleteDate = req.query.deleteDate
            ? req.query.deleteDate.toString()
            : '';

          const fileComment = await this.fileInfoService.createInfo({
            comment,
            deleteDate,
          });

          const tokenModel =
            await this.linkService.createTokensArrayAndReturnId();

          return new Promise((resolve, reject) => {
            const filename = file.originalname.trim();

            const fileInfo = {
              filename: filename,
              metadata: {
                fileInfo: fileComment.id,
                tokens: tokenModel._id,
              },
            };
            resolve(fileInfo);
          });
        } catch (e) {
          throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
      },
    });
  }

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: this.gridFsStorage,
    };
  }
}
