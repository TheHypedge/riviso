import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// Commented out for demo without database
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
// import { UserEntity } from '../user/entities/user.entity';
import { LoginDto, RegisterDto } from './dto';
import { AuthResponse, UserRole } from '@riviso/shared-types';

// Mock user interface for in-memory storage (exported for use in JWT strategy)
export interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  createdAt: Date | string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // In-memory user storage for demo
  private users: Map<string, MockUser> = new Map();
  private readonly usersFilePath: string;
  
  constructor(
    // @InjectRepository(UserEntity)
    // private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {
    // Set up file path for persistence
    const dataDir = path.join(process.cwd(), 'data');
    this.usersFilePath = path.join(dataDir, 'users.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Load users from file
    this.loadUsers();
    
    // Pre-populate with demo users if no users exist
    if (this.users.size === 0) {
      this.createDemoUser();
      this.saveUsers();
    }
  }
  
  private loadUsers(): void {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const fileContent = fs.readFileSync(this.usersFilePath, 'utf-8');
        const usersArray: MockUser[] = JSON.parse(fileContent);
        
        // Convert date strings back to Date objects
        usersArray.forEach(user => {
          user.createdAt = new Date(user.createdAt);
          this.users.set(user.email, user);
        });
        
        this.logger.log(`Loaded ${usersArray.length} users from file`);
      }
    } catch (error) {
      this.logger.error(`Error loading users from file: ${error.message}`);
    }
  }
  
  private saveUsers(): void {
    try {
      const usersArray = Array.from(this.users.values()).map(user => ({
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      }));
      
      fs.writeFileSync(this.usersFilePath, JSON.stringify(usersArray, null, 2), 'utf-8');
      this.logger.log(`Saved ${usersArray.length} users to file`);
    } catch (error) {
      this.logger.error(`Error saving users to file: ${error.message}`);
    }
  }

  private createDemoUser() {
    // Create demo user with known credentials
    // Email: demo@riviso.com, Password: demo123
    const demoUser: MockUser = {
      id: 'demo-user-123',
      email: 'demo@riviso.com',
      name: 'Demo User',
      password: '$2b$10$tlj2WaPl8ziTe9Ettv7GBOl1f049I/S1ifFy17q.6TqNRj6buWWYu', // demo123
      role: UserRole.USER,
      createdAt: new Date(),
    };
    this.users.set(demoUser.email, demoUser);
    
    // Also create a test user
    // Email: iamakhilesh@gmail.com, Password: Test123!
    const testUser: MockUser = {
      id: 'test-user-456',
      email: 'iamakhilesh@gmail.com',
      name: 'Akhilash Soni',
      password: '$2b$10$5OK1sE58kBI51vtvkW9OpuZHvdbdxs1rfC4OKNaiu5aGCH3WSqvmy', // Test123!
      role: UserRole.USER,
      createdAt: new Date(),
    };
    this.users.set(testUser.email, testUser);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    
    // Check if user exists
    const existingUser = this.users.get(registerDto.email.toLowerCase().trim());

    if (existingUser) {
      this.logger.warn(`Registration failed: User already exists - ${registerDto.email}`);
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user: MockUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: registerDto.email.toLowerCase().trim(),
      name: registerDto.name.trim(),
      password: hashedPassword,
      role: UserRole.USER,
      createdAt: new Date(),
    };

    this.users.set(user.email, user);
    this.saveUsers(); // Persist to file
    
    this.logger.log(`User registered successfully: ${user.email} (ID: ${user.id})`);

    // Generate tokens
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const email = loginDto.email.toLowerCase().trim();
    this.logger.log(`Login attempt for email: ${email}`);
    
    // Find user
    const user = this.users.get(email);

    if (!user) {
      this.logger.warn(`Login failed: User not found for email: ${email}`);
      this.logger.debug(`Available users: ${Array.from(this.users.keys()).join(', ')}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`Login successful for: ${email} (ID: ${user.id})`);
    // Generate tokens
    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      // Find user by ID in memory
      const user = Array.from(this.users.values()).find(u => u.id === payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: MockUser): AuthResponse {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaces: [],
      },
    };
  }

  async validateUser(userId: string): Promise<MockUser> {
    // Find user by ID in memory
    const user = Array.from(this.users.values()).find(u => u.id === userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
