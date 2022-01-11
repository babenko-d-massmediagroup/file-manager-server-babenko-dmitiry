import { Module } from '@nestjs/common';
import { FileInfoService } from './file-info.service';
import { FileInfoController } from './file-info.controller';
import { FileInfo } from 'src/file/file.dto';
import { FileInfoSchema } from './file-info.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [FileInfoController],
  providers: [FileInfoService],
  imports: [
    MongooseModule.forFeature([
      { name: FileInfo.name, schema: FileInfoSchema },
    ]),
  ],
  exports: [FileInfoService],
})
export class FileInfoModule {}
