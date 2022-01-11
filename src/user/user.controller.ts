import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUser(@Body() userDto: UserDto) {
    return await this.userService.createUser(userDto);
  }
}
