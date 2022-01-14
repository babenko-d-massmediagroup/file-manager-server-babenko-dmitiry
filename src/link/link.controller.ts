import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { count } from 'rxjs';
import { FileService } from 'src/file/file.service';
import { StatisticService } from 'src/statistic/statistic.service';
import { UserService } from 'src/user/user.service';
import { LinkService } from './link.service';

@Controller('link')
export class LinkController {
  constructor(
    private readonly linkService: LinkService,
    private readonly fileService: FileService,
    private readonly userSerive: UserService,
    private readonly statisticService: StatisticService,
  ) {}

  @Get('/:photoId')
  async photoByLink(@Param('photoId') photoId: string) {
    await this.linkService.photoByLink(photoId);

    const file = await this.fileService.findInfo(photoId);

    return {
      filename: file.filename,
      imageUrl: `http://localhost:4000/image/${photoId}`,
    };
  }

  @Post('set-photo-status')
  async x(@Body() body: { photoId: string; status: boolean }) {
    const { photoId, status } = body;
    await this.linkService.setPhotoLinkStatus(photoId, Boolean(status));

    return {
      url: status ? `http://localhost:3000/watch/${photoId}` : '',
      status,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('generate-temporary-tokens')
  async generateTemporaryToken(
    @Body() body: { count: number; fileId: string },
    @Req() req,
  ) {
    const tokens = await this.linkService.generateTokens({
      ...body,
      userId: req.user.id,
    });

    return tokens;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('get-all-temporary-tokens/:fileId')
  async getAllTemporaryTokens(@Req() req, @Param('fileId') fileId: string) {
    const tokens = await this.linkService.getAllTemporaryTokens(
      req.user.id,
      fileId,
    );

    return tokens;
  }

  @Get('get-from-token/:token')
  async getImageFromToken(@Param('token') token: string) {
    const payload = this.linkService.getPhotoIdFromToken(token);

    const {
      id,
      fileId,
      userId,
    }: { id: string; fileId: string; userId: string } = payload;

    const isTokenExist = await this.linkService.isTokenExist(fileId, token);

    if (!isTokenExist) {
      throw new HttpException('Token does not exist', 404);
    }
    const user = await this.userSerive.findOneById(userId);

    const statisticUsedLinks =
      await this.statisticService.addUsedTemporaryLinks(user.static.toString());

    const file = await this.fileService.findInfo(fileId);

    return {
      filename: file.filename,
      imageUrl: `http://localhost:4000/image/${fileId}`,
    };
  }
}
