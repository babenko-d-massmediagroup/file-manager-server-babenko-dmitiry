import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemporaryLinkDocument = TemporaryLink & Document;

@Schema()
export class TemporaryLink {
  @Prop()
  tokens: [string];
}

export const TemporaryLinkSchema = SchemaFactory.createForClass(TemporaryLink);
