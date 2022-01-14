import { forwardRef, Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { FileModule } from '../file/file.module';
import { UtilsModule } from '../utils/utils.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TemporaryLink, TemporaryLinkSchema } from './temporary-link.entity';

@Module({
  imports: [
    UtilsModule,
    forwardRef(() => FileModule),
    MongooseModule.forFeature([
      { name: TemporaryLink.name, schema: TemporaryLinkSchema },
    ]),
  ],
  controllers: [LinkController],
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule {}
