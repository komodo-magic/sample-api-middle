import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createOne(user: UserEntity): Promise<UserEntity> {
    return await this.userRepository.save(user);
  }

  async selectOne(user: UserEntity): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: {
        login: user.login,
      },
    });
  }

  async updateOne(user: UserEntity, newUser: UserEntity): Promise<UserEntity> {
    await this.userRepository.merge(user, newUser);
    return await this.userRepository.save(user);
  }

  async deleteOne(user: UserEntity): Promise<DeleteResult> {
    return await this.userRepository.delete(user.login);
  }
}
