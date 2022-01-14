import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  images: [Types.ObjectId];

  @Prop()
  static: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
