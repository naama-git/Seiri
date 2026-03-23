import { Injectable } from '@nestjs/common';
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
  async getUserById(id: string): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ id });
    if (!existingUser) {
      throw new BusinessException(
        'User not found',
        404,
        'User with ID' + id + 'not found',
        'getUserById',
        this.constructor.name,
      );
    }
    return existingUser;
  }

  async createUser(user: CreateUserDto): Promise<User> {
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
        this.constructor.name,
      );
    }

    return await this.userRepository.save(savedUser);
  }

  async updateUser(id: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);
    this.userRepository.merge(user, updateDto);

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new BusinessException(
        'Update failed',
        500,
        (error as Error).message,
        this.updateUser.name,
        this.constructor.name,
      );
    }
  }

  // --- Inner functions ---
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
