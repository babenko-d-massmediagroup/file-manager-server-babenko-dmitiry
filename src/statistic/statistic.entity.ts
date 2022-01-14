import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StatisticDocument = Statistic & Document;

@Schema()
export class Statistic {
  @Prop()
  deleteFiles: number;

  @Prop()
  usedTemporaryLinks: number;
}

export const StatisticSchema = SchemaFactory.createForClass(Statistic);
