import { Injectable, NotFoundException } from '@nestjs/common';
// Commented out for demo without database
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UserEntity } from './entities/user.entity';
import { User, UserRole } from '@riviso/shared-types';

@Injectable()
export class UserService {
  // In-memory mock users
  private mockUsers: Map<string, User> = new Map();

  constructor(
    // @InjectRepository(UserEntity)
    // private userRepository: Repository<UserEntity>,
  ) {
    // Initialize with demo user
    this.mockUsers.set('demo-user-123', {
      id: 'demo-user-123',
      email: 'demo@riviso.com',
      name: 'Demo User',
      role: UserRole.USER,
      avatar: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async findById(id: string): Promise<User> {
    const user = this.mockUsers.get(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = Array.from(this.mockUsers.values()).find(u => u.email === email);
    return user || null;
  }
}
