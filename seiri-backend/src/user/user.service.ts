import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, ReadUserDTO, UpdateUserDto } from './dto/User.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
    where: { email },
    select: ['id', 'email', 'password', 'name', 'role'], 
    });
    return user;
  }

  async findUserById(id: number): Promise<ReadUserDTO | null> {
    const existingUser = await this.userRepository.findOneBy({ id });
    return new ReadUserDTO(existingUser);
  }

  async createUser(user: CreateUserDto): Promise<void> {
    const email = user.email;
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new UnauthorizedException('user already exist');
    }

    const savedUser = this.userRepository.create({ ...user, role: 'User' });
    await this.userRepository.save(savedUser);
  }

  async updateUser(id: number, userDto: UpdateUserDto): Promise<void> {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException('User not found');
    }
    this.userRepository.merge(existUser, userDto);

    await this.userRepository.save(existUser);
  }

  async deleteUser(id: number): Promise<void> {
    const existUser = await this.userRepository.findOneBy({ id });
    if (!existUser) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.save(existUser);
  }
}
