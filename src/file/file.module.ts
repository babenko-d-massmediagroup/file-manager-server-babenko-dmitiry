import { forwardRef, Module } from '@nestjs/common';
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
import { LinkModule } from 'src/link/link.module';
import { LinkService } from 'src/link/link.service';
import { StatisticModule } from 'src/statistic/statistic.module';

@Module({
  imports: [
    forwardRef(() => StatisticModule),
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule, FileInfoModule, LinkModule],
      useClass: GridFsMulterConfigService,
      inject: [ConfigService, FileInfoService, LinkService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule),
    FileInfoModule,
    forwardRef(() => LinkModule),
  ],
  controllers: [FileController],
  providers: [FileService, GridFsMulterConfigService, JwtStrategy],
  exports: [FileService],
})
export class FileModule {}
