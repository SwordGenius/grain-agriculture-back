import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/auth.guard';

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
    const { email, password } = createUserDto;
    const result = await this.usersService.loginUser(email, password);
    
    if (result.success && result.token) {
      res.cookie('access_token', result.token, {
        httpOnly: true,
        secure: false, // cmodificar esto a true cuando se suba a produccion adrian es @#@$@@
        sameSite: 'lax',  
        maxAge: 1000 * 60 * 60 
      });
      return res.status(200).json({
        success: true,
        message: 'Login successful'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: result.message
    });
  }

  @Post('logout')
  async logout(@Res() res: Response): Promise<Response> {
    res.clearCookie('access_token');
    return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

    @Get('check-auth')
  @UseGuards(JwtAuthGuard)
  async checkAuth(@Res() res: Response): Promise<Response> {
    return res.status(HttpStatus.OK).json({ success: true, message: 'Usuario autenticado' });
  }
 
}
