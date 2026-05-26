import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /** 查询所有用户 */
  findAll() {
    return this.userRepo.find();
  }

  /** 根据 ID 查询用户 */
  findOne(id: number) {
    return this.userRepo.findOneBy({ id });
  }

  /** 创建用户 */
  create(name: string, email: string) {
    const user = this.userRepo.create({ name, email });
    return this.userRepo.save(user);
  }

  /** 更新用户 */
  async update(id: number, name: string, email: string) {
    await this.userRepo.update(id, { name, email });
    return this.userRepo.findOneBy({ id });
  }

  /** 删除用户 */
  remove(id: number) {
    return this.userRepo.delete(id);
  }
}
