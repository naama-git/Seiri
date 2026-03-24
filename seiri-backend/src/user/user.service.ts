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
    try {
      const existingUser = await this.userRepository.findOneBy({ id });
      if (!existingUser) {
        throw new BusinessException(
          'User not found',
          404,
          `User with ID ${id} not found`,
          this.getUserById.name,
          this.constructor.name,
        );
      }
      return existingUser;
    } catch (error) {
      if (error instanceof BusinessException) throw error;
      throw new BusinessException(
        'Database error',
        400,
        (error as Error).message,
        this.getUserById.name,
        this.constructor.name,
      );
    }
  }
  async createUser(user: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOneBy({ email: user.email });
    if (existing) {
      throw new BusinessException(
        'Conflict',
        409,
        'User already exists',
        this.createUser.name,
        this.constructor.name,
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
        500,
        (error as Error).message,
        this.createUser.name,
        this.constructor.name,
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
