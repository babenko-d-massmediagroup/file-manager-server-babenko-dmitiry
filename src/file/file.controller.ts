import { FilesInterceptor } from '@nestjs/platform-express';
import {
  Post,
  Get,
  Param,
  Res,
  Controller,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FileService } from './file.service';
import { FileResponse } from './file.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInfo } from 'src/file-info/file-info.entity';

@Controller('image')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('full-info/:fileId')
  public async getCommentsAndDeleteDate(@Param('fileId') fileId: string) {
    return this.fileService.getFullInfo(fileId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('plain-all')
  public async receiveFiles(@Req() req: Request) {
    return this.fileService.receiveFiles(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('count')
  public async count(@Req() req: Request): Promise<number> {
    return this.fileService.count(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  @UseInterceptors(FilesInterceptor('file'))
  public async upload(@Req() req: Request, @UploadedFiles() files: FileInfo[]) {
    return this.fileService.addImage(req.user.id, files);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('info/:id')
  public async getFileInfo(@Param('id') id: string): Promise<FileResponse> {
    return this.fileService.getInfo(id);
  }

  @Get(':id')
  public async getFile(@Param('id') id: string, @Res() res) {
    const file = await this.fileService.findInfo(id);
    const filestream = await this.fileService.readStream(id);

    if (!filestream) {
      throw new HttpException(
        'An error occurred while retrieving file',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    res.header('Content-Type', file.contentType);
    return filestream.pipe(res);
  }

  @Get('download/:id')
  public async downloadFile(@Param('id') id: string, @Res() res) {
    const file = await this.fileService.findInfo(id);
    const filestream = await this.fileService.readStream(id);

    if (!filestream) {
      throw new HttpException(
        'An error occurred while retrieving file',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    res.header('Content-Type', file.contentType);
    res.header('Content-Disposition', 'attachment; filename=' + file.filename);
    return filestream.pipe(res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  public async deleteFile(@Param('id') id: string, @Req() req) {
    return this.fileService.deleteFile(id, req.user.id);
  }
}
