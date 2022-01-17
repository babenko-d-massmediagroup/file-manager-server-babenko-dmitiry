import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateTokenPayload,
  LoginUserDto,
  RegisterUserDto,
} from './dto/auth.dto';
import { UserService } from '../user/user.service';
import { UtilsService } from '../utils/utils.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly utils: UtilsService,
    private readonly jwtService: JwtService,
  ) {}
  public async registerUser(registerUserDto: RegisterUserDto) {
    if (!registerUserDto.password)
      throw new HttpException(
        'Password is required field',
        HttpStatus.BAD_REQUEST,
      );

    if (!registerUserDto.username) {
      throw new HttpException(
        'Username is required field',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isUserExist = await this.userService.findOneByUsername(
      registerUserDto.username,
    );

    if (isUserExist) {
      throw new HttpException('User already exist', HttpStatus.BAD_REQUEST);
    }

    const user = await this.createUser(registerUserDto);

    const token = this.createToken({
      id: user.id,
      username: user.username,
    });

    return { token };
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const { password, username } = loginUserDto;

    if (!password) {
      throw new HttpException(
        'Password is required field',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!username) {
      throw new HttpException(
        'Username is required field',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.findOneByUsername(loginUserDto.username);

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

    const token = this.createToken({
      id: user.id,
      username: user.username,
    });

    return { token };
  }

  public async createUser(registerUserDto: RegisterUserDto) {
    const hashedPassword = this.utils.hashPayload(registerUserDto.password);
    const user = await this.userService.createUser({
      ...registerUserDto,
      password: hashedPassword,
    });

    return user;
  }

  public createToken(payload: CreateTokenPayload): string {
    return this.jwtService.sign(payload);
  }

  public findOneByUsername(username: string) {
    return this.userService.findOneByUsername(username);
  }

  public async isUserExist(id: string) {
    const user = await this.userService.findOneById(id);

    return !!user;
  }
}
