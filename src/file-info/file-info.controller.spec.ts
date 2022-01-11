import { Test, TestingModule } from '@nestjs/testing';
import { FileInfoController } from './file-info.controller';
import { FileInfoService } from './file-info.service';

describe('FileInfoController', () => {
  let controller: FileInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileInfoController],
      providers: [FileInfoService],
    }).compile();

    controller = module.get<FileInfoController>(FileInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
