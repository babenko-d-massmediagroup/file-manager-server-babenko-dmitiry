import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';

import { createHmac } from 'crypto';
import { UserService } from '../user/user.service';
import { UtilsService } from '../utils/utils.service';
import jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly utils: UtilsService,
    private readonly jwtService: JwtService,
  ) {}
  async createUser(registerUserDto: RegisterUserDto) {
    //add check into pipe
    const isUserExist = await this.userService.findOneByUsername(
      registerUserDto.username,
    );
    if (isUserExist) {
      throw new HttpException('User already exist', HttpStatus.FOUND);
    }
    const hashedPassword = this.utils.hashPayload(registerUserDto.password);
    const user = await this.userService.createUser({
      ...registerUserDto,
      password: hashedPassword,
    });
    return user;
  }
  createToken(payload: { id: string; username: string }): string {
    return this.jwtService.sign(payload);
  }

  findOne(loginUserDto: LoginUserDto) {
    return this.userService.findOneByUsername(loginUserDto.username);
  }
}
