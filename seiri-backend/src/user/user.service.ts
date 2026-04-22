import { HttpStatus, Injectable } from '@nestjs/common';
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
    try {
      const existingUser = await this.userRepository.findOneBy({ id });
      if (!existingUser) {
        throw new BusinessException(
          'User not found',
          HttpStatus.NOT_FOUND,
          `User with ID ${id} not found`,
        );
      }
      return existingUser;
    } catch (error) {
      if (error instanceof BusinessException) throw error;
      throw new BusinessException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
      );
    }
  }
  async createUser(user: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOneBy({ email: user.email });
    if (existing) {
      throw new BusinessException(
        'Error in user data',
        HttpStatus.CONFLICT,
        'User already exists',
      );
    }

    const newUser = this.userRepository.create({
      ...user,
      role: Role.USER,
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new BusinessException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
      );
    }
  }

  async updateUser(id: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);
    this.userRepository.merge(user, updateDto);

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new BusinessException(
        'Update failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
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
