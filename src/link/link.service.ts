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
    private tokensModel: Model<TemporaryLinkDocument>,
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
    console.log({ tokens });
    const params = {
      $push: {
        tokens: {
          $each: tokens,
        },
      },
    };
    return this.tokensModel.findByIdAndUpdate(tokensId, params);
  }

  createTokensArrayAndReturnId() {
    const tokenMode = new this.tokensModel({ tokens: [] });
    return tokenMode.save();
  }

  async getAllTemporaryTokens(userId: string, fileId: string) {
    const user = await this.userService.findOneById(userId);

    // const objectId = Types.ObjectId.createFromHexString(fileId)

    const usersImages = user.images.map((item) => item.toString());

    console.log({ usersImages, fileId });

    if (!usersImages.includes(fileId)) {
      throw new Error('Error here 3');
    }

    const tokensId = await this.fileService.getTokensId(fileId);

    const tokensArray = await this.tokensModel.findById(tokensId);

    return tokensArray.tokens;
  }

  getPhotoIdFromToken(token: string) {
    return this.jwtService.verify(token);
  }

  async isTokenExist(fileId: string, token: string) {
    const tokensId = await this.fileService.getTokensId(fileId);
    const tokensArray = await this.tokensModel.findById(tokensId);

    console.log({ tokenArrayValue: tokensArray.tokens[0], token, tokensId });

    if (tokensArray.tokens.includes(token)) {
      await this.tokensModel.findByIdAndUpdate(tokensId, {
        $pullAll: {
          tokens: [token],
        },
      });

      return true;
    }

    return false;
  }
}
