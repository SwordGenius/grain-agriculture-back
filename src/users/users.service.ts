import { UserDocument } from './entities/user.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtSvc: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ success: boolean, user?: User, message?: string }> {
    try {
      const existingUser = await this.userModel.findOne({ email: createUserDto.email });
      if (existingUser) {
        this.logger.warn(`Registration attempt with existing email: ${createUserDto.email}`);
        return { success: false, message: 'Email already in use' };
      }
  
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
  
      const savedUser = await newUser.save();
      return { success: true, user: savedUser };
    } catch (error) {
      this.logger.error('Error during user registration:', error);
      return { success: false, message: 'An unexpected error occurred during registration. Please try again later.' };
    }
  }
  

  
  async loginUser(email: string, password: string): Promise<{ success: boolean, token?: string, message?: string }> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        this.logger.warn(`Login attempt with invalid email: ${email}`);
        return { success: false, message: 'Invalid credentials' };
      }
  
      const isPasswordOk = await bcrypt.compare(password, user.password);
      if (!isPasswordOk) {
        this.logger.warn(`Invalid password for email: ${email}`);
        return { success: false, message: 'Invalid credentials' };
      }
  
      
      this.logger.log(`User logged in: ${user.email}, Name: ${user.name}`);
  
      const payload = { sub: user._id, email: user.email, name: user.name };
      const token = await this.jwtSvc.signAsync(payload);
      return { success: true, token };
    } catch (error) {
      this.logger.error('Error during user login:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }
  }
  
  
}
