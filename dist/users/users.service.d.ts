import { UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
export declare class UsersService {
    private userModel;
    private jwtSvc;
    constructor(userModel: Model<UserDocument>, jwtSvc: JwtService);
    create(createUserDto: CreateUserDto): Promise<User>;
    loginUser(email: string, password: string): Promise<{
        access_token: string;
    }>;
}
