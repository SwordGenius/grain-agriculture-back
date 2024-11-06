import { UserDocument } from './entities/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwtSvc : JwtService){}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try{
      const hashedPassword = await bcrypt.hash(createUserDto.password,10);

      const newUser = new this.userModel({
        ... createUserDto,
        password : hashedPassword
      });
      return await newUser.save();

    }catch(error){
      
        throw new HttpException('Internal server error', HttpStatus.UNAUTHORIZED)
      
    }
  }

  async loginUser(email: string, password: string): Promise<string> {
    try{
      const user = await this.userModel.findOne({email});  
      const isPasswordOk = await bcrypt.compare(password, user.password);

      if (!isPasswordOk){
        throw new HttpException('Please check your credentials', HttpStatus.UNAUTHORIZED)
      }

      if(user && isPasswordOk){
        const payload = { sub: user._id, email: user.email, name: user.name };

        return await this.jwtSvc.signAsync(payload);
      }
    } catch (error: any) {
      
        throw new HttpException('Please check your credentials', HttpStatus.UNAUTHORIZED)
      
    }
  

  }
}
