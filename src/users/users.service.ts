import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string, withPassword = false): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: withPassword
        ? {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            passwordHash: true,
            createdAt: true,
            updatedAt: true,
          }
        : undefined,
    });
  }

  create(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  toSafeUser(user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'createdAt' | 'updatedAt'>) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
