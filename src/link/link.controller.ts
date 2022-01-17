import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { LinkService } from './link.service';

@Controller('link')
export class LinkController {
  constructor(
    private readonly linkService: LinkService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/:photoId')
  public async photoByLink(@Param('photoId') photoId: string) {
    return this.linkService.photoByLink(photoId);
  }

  @UseGuards(AuthGuard('jwt')) //check user
  @Post('set-photo-status')
  public async x(@Body() body: { photoId: string; status: boolean }) {
    const { photoId, status } = body;
    await this.linkService.setPhotoLinkStatus(photoId, Boolean(status));

    return {
      url: status
        ? `${this.configService.get<string>(
            'FRONT_END_DOMAIN',
          )}/watch/${photoId}`
        : '',
      status,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('generate-temporary-tokens')
  public async generateTemporaryToken(
    @Body() body: { count: number; fileId: string },
    @Req() req: Request,
  ) {
    return this.linkService.generateTokens({
      ...body,
      userId: req.user.id,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('get-all-temporary-tokens/:fileId')
  public async getAllTemporaryTokens(
    @Req() req,
    @Param('fileId') fileId: string,
  ) {
    return this.linkService.getAllTemporaryTokens(req.user.id, fileId);
  }

  @Get('get-from-token/:token')
  public async getImageFromToken(@Param('token') token: string) {
    return this.linkService.getImageFromToken(token);
  }
}
