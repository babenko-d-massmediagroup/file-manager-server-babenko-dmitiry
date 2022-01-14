import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileService } from 'src/file/file.service';
import { UserService } from 'src/user/user.service';
import { UtilsService } from 'src/utils/utils.service';
import { v4 as uuidv4 } from 'uuid';
import { TemporaryLink, TemporaryLinkDocument } from './temporary-link.entity';

@Injectable()
export class LinkService {
  constructor(
    private readonly fileService: FileService,
    @InjectModel(TemporaryLink.name)
    private temporaryLinkModel: Model<TemporaryLinkDocument>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
      tokens.push(this.jwtService.sign({ id: uuidv4(), fileId }));
    }

    const tokenModelId: string = await this.fileService.getTokensModelId(
      fileId,
    );

    await this.addTokens(tokenModelId, tokens);

    return tokens;
  }

  addTokens(tokensId: string, tokens: string[]) {
    const params = {
      $push: {
        tokens: {
          $each: tokens,
        },
      },
    };
    return this.temporaryLinkModel.findByIdAndUpdate(tokensId, params);
  }

  createTokensArrayAndReturnId() {
    const tokenMode = new this.temporaryLinkModel({
      tokens: [],
      usedTokens: 0,
    });
    return tokenMode.save();
  }

  async getAllTemporaryTokens(userId: string, fileId: string) {
    const user = await this.userService.findOneById(userId);

    const usersImages = user.images.map((item) => item.toString());

    if (!usersImages.includes(fileId)) {
      throw new Error('Error here 3');
    }

    const tokensId = await this.fileService.getTokensId(fileId);

    const tokensArray = await this.temporaryLinkModel.findById(tokensId);

    return tokensArray.tokens;
  }

  getPhotoIdFromToken(token: string) {
    return this.jwtService.verify(token);
  }

  async isTokenExist(fileId: string, token: string) {
    const tokensId = await this.fileService.getTokensId(fileId);
    const tlModel = await this.temporaryLinkModel.findById(tokensId);

    if (tlModel.tokens.includes(token)) {
      await this.temporaryLinkModel.findByIdAndUpdate(tokensId, {
        $pullAll: {
          tokens: [token],
        },
        $set: {
          usedTokens: tlModel.usedTokens + 1,
        },
      });

      return true;
    }

    return false;
  }

  removeTemporaryLinks(id: string) {
    return this.temporaryLinkModel.findByIdAndRemove(id);
  }
}
