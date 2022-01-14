import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { count } from 'rxjs';
import { FileService } from 'src/file/file.service';
import { LinkService } from './link.service';

@Controller('link')
export class LinkController {
  constructor(
    private readonly linkService: LinkService,
    private readonly fileService: FileService,
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
  ) {
    const tokens = this.linkService.generateTokens(body);
  }
}
