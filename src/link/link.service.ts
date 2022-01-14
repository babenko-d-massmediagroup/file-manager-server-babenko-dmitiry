import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileService } from 'src/file/file.service';
import { UtilsService } from 'src/utils/utils.service';
import { v4 as uuidv4 } from 'uuid';
import { TemporaryLink, TemporaryLinkDocument } from './temporary-link.entity';

@Injectable()
export class LinkService {
  constructor(
    private readonly fileService: FileService,
    @InjectModel(TemporaryLink.name)
    private tokensModel: Model<TemporaryLinkDocument>,
  ) {}

  setPhotoLinkStatus(id: string, status: boolean) {
    return this.fileService.setPhotoLinkStatus(id, status);
  }

  async photoByLink(id: string) {
    const isActive = await this.fileService.isActiveLink(id);

    if (!isActive) {
      throw new HttpException(
        'This link is not active',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.fileService.addWatchedTimes(id);
  }

  async generateTokens({ count, fileId }: { count: number; fileId: string }) {
    const tokens: string[] = [];

    for (let i = 0; i < count; i++) {
      tokens.push(uuidv4());
    }

    const getTokensModelId = this.fileService.getTokensModelId(fileId);

    await this.addTokens(fileId, tokens);
  }

  addTokens(tokensId: string, tokens: string[]) {
    return this.tokensModel.findByIdAndUpdate(tokensId, {
      tokens: { $push: { $each: tokens } },
    });
  }
}
