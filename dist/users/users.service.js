"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_entity_1 = require("./entities/user.entity");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
let UsersService = class UsersService {
    constructor(userModel, jwtSvc) {
        this.userModel = userModel;
        this.jwtSvc = jwtSvc;
    }
    async create(createUserDto) {
        try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = new this.userModel({
                ...createUserDto,
                password: hashedPassword
            });
            return await newUser.save();
        }
        catch (error) {
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async loginUser(email, password) {
        try {
            const user = await this.userModel.findOne({ email });
            const isPasswordOk = await bcrypt.compare(password, user.password);
            if (!isPasswordOk) {
                throw new common_1.HttpException('Please check your credentials', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (user && isPasswordOk) {
                const payload = { sub: user._id, email: user.email, name: user.name };
                return {
                    access_token: await this.jwtSvc.signAsync(payload)
                };
            }
        }
        catch (error) {
            throw new common_1.HttpException('Please check your credentials', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model, jwt_1.JwtService])
], UsersService);
//# sourceMappingURL=users.service.js.map