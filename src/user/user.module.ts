import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { FileInfoModule } from 'src/file-info/file-info.module';
import { StatisticModule } from 'src/statistic/statistic.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    FileInfoModule,
    StatisticModule,
  ],
})
export class UserModule {}
