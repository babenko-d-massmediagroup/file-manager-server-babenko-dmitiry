import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from './utils/utils.module';
import { FileModule } from './file/file.module';
import { FileInfoModule } from './file-info/file-info.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL as string),
    UserModule,
    AuthModule,
    UtilsModule,
    FileModule,
    FileInfoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
