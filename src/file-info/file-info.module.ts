import { Module } from '@nestjs/common';
import { FileInfoService } from './file-info.service';
import { FileInfoController } from './file-info.controller';
import { FileInfo } from '../file/file.dto';
import { FileInfoSchema } from './file-info.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { FileModule } from 'src/file/file.module';

@Module({
  controllers: [FileInfoController],
  providers: [FileInfoService],
  imports: [
    // FileModule,
    MongooseModule.forFeature([
      { name: FileInfo.name, schema: FileInfoSchema },
    ]),
  ],
  exports: [FileInfoService],
})
export class FileInfoModule {}
