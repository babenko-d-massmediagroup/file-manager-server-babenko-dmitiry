import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UtilsService } from '../utils/utils.service';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { JwtStrategy } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly utils: UtilsService,
    private jwtStrategy: JwtStrategy,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('validateToken')
  async validateToken() {
    return { status: 'valid' };
  }

  @UsePipes(new ValidationPipe({ skipMissingProperties: false }))
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.authService.createUser(registerUserDto);

    const token = this.authService.createToken({
      id: user.id,
      username: user.username,
    });

    return { token };
  }

  @UsePipes(new ValidationPipe({ skipMissingProperties: false }))
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const { password } = loginUserDto;

    const user = await this.authService.findOne(loginUserDto);

    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }

    const isPasswordMatch = this.utils.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new HttpException('Incorrect data passed', HttpStatus.BAD_REQUEST);
    }

    const token = this.authService.createToken({
      id: user.id,
      username: user.username,
    });

    return { token };
  }
}
