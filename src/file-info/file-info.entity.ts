import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileInfoDocument = FileInfo & Document;

@Schema()
export class FileInfo {
  @Prop()
  comment: string;

  @Prop()
  deleteDate: string; //date
}

export const FileInfoSchema = SchemaFactory.createForClass(FileInfo);
