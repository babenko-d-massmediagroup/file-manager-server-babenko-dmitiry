import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async createUser(userDto: UserDto) {
    const userSchema = new this.userModel({
      ...userDto,
    });

    const user = await userSchema.save();

    if (!user) {
      return null;
    }

    return user;
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async addImage(userId: string, imageId: string) {
    // const user = await this.userModel.findById(userId)
    return this.userModel.findOneAndUpdate(
      // { id: userId },
      // { images: [imageId] },
      // { new: true },
      { id: userId },
      { $push: { images: imageId } },
      { new: true },
    );
  }
}
