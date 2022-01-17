import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDto } from './user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateResult } from 'mongodb';
import { User, UserDocument } from './entities/user.entity';
import { StatisticService } from '../statistic/statistic.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly statisticService: StatisticService,
  ) {}
  public async createUser(userDto: UserDto): Promise<UserDocument> {
    try {
      const statistic = await this.statisticService.createStatistic({
        deleteFiles: 0,
        usedTemporaryLinks: 0,
      });

      const userSchema = new this.userModel({
        ...userDto,
        statistic: statistic._id,
      });

      const user = await userSchema.save();

      return user ? user : null;
    } catch (e) {
      throw new HttpException("Can't create user", HttpStatus.BAD_REQUEST);
    }
  }

  public async findOneByUsername(username: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findOne({ username });

      return user ? user : null;
    } catch (e) {
      throw new HttpException("Can't find user", HttpStatus.BAD_REQUEST);
    }
  }

  public async addImage(
    userId: string,
    imageId: string,
  ): Promise<UserDocument> {
    try {
      const updUser = await this.userModel.findOneAndUpdate(
        { id: userId },
        { $push: { images: imageId } },
        { new: true },
      );

      return updUser ? updUser : null;
    } catch (e) {
      throw new HttpException(
        "Can't add image to user",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async findOneById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);

    return user ? user : null;
  }

  public async removeImage(
    userId: string,
    fileId: string,
  ): Promise<UpdateResult> {
    try {
      const updUser = await this.userModel.updateOne(
        { id: userId },
        {
          $pullAll: {
            images: [Types.ObjectId.createFromHexString(fileId)],
          },
        },
      );

      return updUser ? updUser : null;
    } catch (e) {
      throw new HttpException("Can't remove image", HttpStatus.BAD_REQUEST);
    }
  }
}
