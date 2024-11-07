import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { email, password } = createUserDto
    const token = await this.usersService.loginUser(email, password);
    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    return res.status(201).json(token);
  }
  @Post('logout')
  async logout(@Res() res: Response): Promise<Response> {
    res.clearCookie('access_token');
    return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }
 
}
