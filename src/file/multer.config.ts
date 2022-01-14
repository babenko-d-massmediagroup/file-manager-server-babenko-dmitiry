import { Injectable } from '@nestjs/common';
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
      url: configService.get<string>('MONGO_URL'),

      file: async (req, file) => {
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
              userId: req.user.id,
              fileInfo: fileComment.id,
              watchedTimes: 0,
              isActiveLink: false,
              tokens: tokenModel._id,
            },
          };
          resolve(fileInfo);
        });
      },
    });
  }

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: this.gridFsStorage,
    };
  }
}
