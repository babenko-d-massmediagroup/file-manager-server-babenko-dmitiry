import { Expose } from 'class-transformer';

export class FileInfo {
  @Expose()
  length: number;

  @Expose()
  chunkSize: number;

  @Expose()
  filename: string;

  @Expose()
  md5: string;

  @Expose()
  contentType: string;

  @Expose()
  fileInfo: string;
}

export class FileResponse {
  message: string;

  file: FileInfo;
}
