import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('validateToken')
  public async validateToken(@Req() req: Request) {
    const isUserExist = await this.authService.isUserExist(req.user.id);

    return { status: isUserExist ? 'valid' : 'invalid' };
  }

  @UsePipes(new ValidationPipe({ skipMissingProperties: false }))
  @Post('register')
  public async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @UsePipes(new ValidationPipe({ skipMissingProperties: false }))
  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }
}
