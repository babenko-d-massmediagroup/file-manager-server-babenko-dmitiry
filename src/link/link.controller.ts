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
    const tokens = await this.linkService.generateTokens(body);

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

    const { id, fileId }: { id: string; fileId: string } = payload;

    const isTokenExist = await this.linkService.isTokenExist(fileId, token);

    if (!isTokenExist) {
      throw new HttpException('Token does not exist', 404);
    }

    const file = await this.fileService.findInfo(fileId);

    return {
      filename: file.filename,
      imageUrl: `http://localhost:4000/image/${fileId}`,
    };
  }
}
