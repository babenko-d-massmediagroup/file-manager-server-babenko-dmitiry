import { Controller } from '@nestjs/common';
import { FileInfoService } from './file-info.service';

@Controller('file-info')
export class FileInfoController {
  constructor(private readonly fileInfoService: FileInfoService) {}
}
