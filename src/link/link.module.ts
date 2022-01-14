import { forwardRef, Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { FileModule } from '../file/file.module';
import { UtilsModule } from '../utils/utils.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TemporaryLink, TemporaryLinkSchema } from './temporary-link.entity';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatisticModule } from 'src/statistic/statistic.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    UtilsModule,
    forwardRef(() => StatisticModule),
    forwardRef(() => FileModule),
    MongooseModule.forFeature([
      { name: TemporaryLink.name, schema: TemporaryLinkSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('EXPIRES_IN_TOKEN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [LinkController],
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule {}
