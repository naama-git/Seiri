import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, ReadUserDTO, UpdateUserDto } from './User.dto';
import { BusinessException } from 'src/core/exception.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findRawUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role'],
    });
    return user;
  }

  async findRawUserById(id: string): Promise<User | null> {
    const existingUser = await this.userRepository.findOneBy({ id });
    return existingUser;
  }

  async getUserById(id: string): Promise<ReadUserDTO | null> {
    const existingUser = await this.userRepository.findOneBy({ id });
    if (!existingUser) {
      throw new BusinessException(
        'User not found',
        404,
        'User with ID' + id + 'not found',
        'getUserById',
        'UserService',
      );
    }
    return new ReadUserDTO(existingUser);
  }

  async createUser(user: CreateUserDto): Promise<void> {
    const email = user.email;
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new UnauthorizedException('user already exists');
    }

    const savedUser = this.userRepository.create({ ...user, role: 'User' });
    await this.userRepository.save(savedUser);
  }

  async updateUser(id: string, userDto: UpdateUserDto): Promise<void> {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException('User not found');
    }
    this.userRepository.merge(existUser, userDto);

    await this.userRepository.save(existUser);
  }

  async deleteUser(id: string): Promise<void> {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.save(existUser);
  }
}
