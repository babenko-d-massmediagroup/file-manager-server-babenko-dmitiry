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
import { FileService } from './file.service';
import { FileResponse } from './file.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { FileInfoService } from 'src/file-info/file-info.service';

@Controller('/image')
export class FileController {
  constructor(
    private fileService: FileService,
    private userService: UserService,
    private fileInfoService: FileInfoService,
  ) {}
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  @UseInterceptors(FilesInterceptor('file'))
  async upload(@Req() req, @UploadedFiles() files) {
    const response = [];
    files.forEach(async (file) => {
      const img = await this.userService.addImage(req.user.id, file.id);

      const fileReponse = {
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        id: file.id,
        filename: file.filename,
        metadata: file.metadata,
        bucketName: file.bucketName,
        chunkSize: file.chunkSize,
        size: file.size,
        md5: file.md5,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
      };
      response.push(fileReponse);
    });
    return response;
  }

  @Get('info/:id')
  async getFileInfo(@Param('id') id: string): Promise<FileResponse> {
    const file = await this.fileService.findInfo(id);
    const filestream = await this.fileService.readStream(id);

    if (!filestream) {
      throw new HttpException(
        'An error occurred while retrieving file info',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    return {
      message: 'File has been detected',
      file: file,
    };
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res) {
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
  async downloadFile(@Param('id') id: string, @Res() res) {
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

  @Delete('delete/:id')
  async deleteFile(@Param('id') id: string) {
    const file = await this.fileService.findInfo(id);
    const filestream = await this.fileService.deleteFile(id);

    if (!filestream) {
      throw new HttpException(
        'An error occurred during file deletion',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    return {
      message: 'File has been deleted',
      file: file,
    };
  }
}
