import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileService } from 'src/file/file.service';
import { StatisticService } from 'src/statistic/statistic.service';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { TemporaryLink, TemporaryLinkDocument } from './temporary-link.entity';

@Injectable()
export class LinkService {
  constructor(
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @InjectModel(TemporaryLink.name)
    private readonly temporaryLinkModel: Model<TemporaryLinkDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => StatisticService))
    private readonly statisticService: StatisticService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public findManyByIds(ids: string[]) {
    return this.temporaryLinkModel.find({ _id: { $in: ids } });
  }

  public setPhotoLinkStatus(id: string, status: boolean) {
    return this.fileService.setPhotoLinkStatus(id, status);
  }

  public async photoByLink(id: string) {
    const isActive = await this.fileService.isActiveLink(id);

    if (!isActive) {
      throw new HttpException(
        'This link is not active',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.fileService.addWatchedTimes(id);

    const file = await this.fileService.findInfo(id);

    return {
      filename: file.filename,
      imageUrl: `${this.configService.get<string>(
        'BACKEND_END_DOMAIN',
      )}/image/${id}`,
    };
  }

  public async generateTokens({
    count,
    fileId,
    userId,
  }: {
    count: number;
    fileId: string;
    userId: string;
  }) {
    const tokens: string[] = [];

    for (let i = 0; i < count; i++) {
      tokens.push(this.jwtService.sign({ id: uuidv4(), fileId, userId }));
    }

    const tokenModelId: string = await this.fileService.getTokensModelId(
      fileId,
    );

    await this.addTokens(tokenModelId, tokens);

    return tokens;
  }

  public addTokens(tokensId: string, tokens: string[]) {
    const params = {
      $push: {
        tokens: {
          $each: tokens,
        },
      },
    };
    return this.temporaryLinkModel.findByIdAndUpdate(tokensId, params);
  }

  public createTokensArrayAndReturnId() {
    const tokenMode = new this.temporaryLinkModel({
      tokens: [],
      usedTokens: 0,
    });
    return tokenMode.save();
  }

  public async getAllTemporaryTokens(userId: string, fileId: string) {
    const user = await this.userService.findOneById(userId);

    const usersImages = user.images.map((item) => item.toString());

    if (!usersImages.includes(fileId)) {
      throw new HttpException("File doesn't exist", HttpStatus.BAD_REQUEST);
    }

    const tokensId = await this.fileService.getTokensId(fileId);

    const tokensArray = await this.temporaryLinkModel.findById(tokensId);

    return tokensArray.tokens;
  }

  public getPhotoIdFromToken(token: string) {
    return this.jwtService.verify(token);
  }

  public async isTokenExist(fileId: string, token: string) {
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

  public removeTemporaryLinks(id: string) {
    return this.temporaryLinkModel.findByIdAndRemove(id);
  }

  public async getImageFromToken(token: string) {
    const payload = this.getPhotoIdFromToken(token);

    const {
      id,
      fileId,
      userId,
    }: { id: string; fileId: string; userId: string } = payload;

    const isTokenExist = await this.isTokenExist(fileId, token);

    if (!isTokenExist) {
      throw new HttpException('Token does not exist', 404);
    }
    const user = await this.userService.findOneById(userId);

    await this.statisticService.addUsedTemporaryLinks(
      user.statistic.toString(),
    );

    const file = await this.fileService.findInfo(fileId);

    return {
      filename: file.filename,
      imageUrl: `${this.configService.get<string>(
        'BACKEND_END_DOMAIN',
      )}/image/${fileId}`,
    };
  }
}
