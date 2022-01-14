import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { StatisticService } from 'src/statistic/statistic.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly statisticService: StatisticService,
  ) {}
  async createUser(userDto: UserDto) {
    const statistic = await this.statisticService.createStatistic({
      deleteFiles: 0,
      usedTemporaryLinks: 0,
    });

    const userSchema = new this.userModel({
      ...userDto,
      static: statistic._id,
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
    return this.userModel.findOneAndUpdate(
      { id: userId },
      { $push: { images: imageId } },
      { new: true },
    );
  }

  findOneById(id: string) {
    return this.userModel.findById(id);
  }

  remove(id: string, fileId: string) {
    return this.userModel.updateOne(
      { id },
      {
        $pullAll: {
          images: [Types.ObjectId.createFromHexString(fileId)],
        },
      },
    );
  }
}
