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

  @Expose()
  watchedTimes: number;

  @Expose()
  isActiveLink: boolean;
}

export class FileResponse {
  message: string;

  file: FileInfo;
}
