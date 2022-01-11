import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { GridFsMulterConfigService } from './multer.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { FileInfoModule } from 'src/file-info/file-info.module';
import { FileInfoService } from 'src/file-info/file-info.service';

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule, FileInfoModule],
      useClass: GridFsMulterConfigService,
      inject: [ConfigService, FileInfoService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    FileInfoModule,
  ],
  controllers: [FileController],
  providers: [FileService, GridFsMulterConfigService, JwtStrategy],
})
export class FileModule {}
