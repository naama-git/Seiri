import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, Role } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './User.dto';
import { BusinessException } from 'src/core/exception.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // --- CRUD ---
  async getUserById(id: string): Promise<User | null> {
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
    return existingUser;
  }

  async createUser(user: CreateUserDto): Promise<void> {
    const email = user.email;
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new UnauthorizedException('user already exists');
    }

    const savedUser = this.userRepository.create({
      ...user,
      role: Role.USER,
    });

    if (!savedUser) {
      throw new BusinessException(
        'Error saving user data',
        500,
        '',
        this.createUser.name,
        'UserService',
      );
    }

    await this.userRepository.save(savedUser);
  }

  async updateUser(id: string, userDto: UpdateUserDto): Promise<void> {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = this.userRepository.merge(existUser, userDto);

    if (!updatedUser) {
      throw new BusinessException(
        'Error saving user data',
        500,
        '',
        this.updateUser.name,
        'UserService',
      );
    }

    await this.userRepository.save(existUser);
  }

  //Inner functions
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
}
