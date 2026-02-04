import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// Commented out for demo without database
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
// import { UserEntity } from '../user/entities/user.entity';
import { LoginDto, RegisterDto, VerifyEmailDto, ResendVerificationDto } from './dto';
import { AuthResponse, UserRole, RegistrationResponse } from '@riviso/shared-types';
import type { UpdateProfileDto } from '@riviso/shared-types';
import { ResendEmailService } from '../notifications/services/resend-email.service';

// Mock user interface for in-memory storage (exported for use in JWT strategy)
export interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  // Email verification fields
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date | string;
  // Onboarding
  onboardingCompleted?: boolean;
  // Website tracking (for limits)
  websiteIds?: string[];
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
    private resendEmailService: ResendEmailService,
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

    // Ensure admin user exists (even if users.json already has other users)
    this.ensureAdminExists();

    // Pre-populate with demo users if no users exist
    if (this.users.size <= 1) { // Only admin exists
      this.createDemoUser();
    }

    this.saveUsers();
  }

  private ensureAdminExists(): void {
    const adminEmail = 'admin@riviso.com';
    if (!this.users.has(adminEmail)) {
      this.logger.log('Creating super admin user...');
      const superAdmin: MockUser = {
        id: 'super-admin-001',
        email: adminEmail,
        name: 'Super Admin',
        // admin123 - regenerated fresh hash
        password: '$2b$10$OtKbAK6vDWYVX13KmZ//3O/bHE/5WAT1EDTHeMJBlE8u3cYa68t3W',
        role: UserRole.ADMIN,
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(adminEmail, superAdmin);
      this.logger.log('Super admin user created: admin@riviso.com / admin123');
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
          if (user.updatedAt) user.updatedAt = new Date(user.updatedAt as string);
          this.users.set(user.email.toLowerCase(), user);
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
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : (user.updatedAt ?? user.createdAt),
      }));
      
      fs.writeFileSync(this.usersFilePath, JSON.stringify(usersArray, null, 2), 'utf-8');
      this.logger.log(`Saved ${usersArray.length} users to file`);
    } catch (error) {
      this.logger.error(`Error saving users to file: ${error.message}`);
    }
  }

  private createDemoUser() {
    // Note: Admin is created by ensureAdminExists(), so we skip it here

    // Create demo user with known credentials
    // Email: demo@riviso.com, Password: demo123
    const demoUser: MockUser = {
      id: 'demo-user-123',
      email: 'demo@riviso.com',
      name: 'Demo User',
      password: '$2b$10$tlj2WaPl8ziTe9Ettv7GBOl1f049I/S1ifFy17q.6TqNRj6buWWYu', // demo123
      role: UserRole.USER,
      emailVerified: true, // Demo users are pre-verified
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(demoUser.email.toLowerCase(), demoUser);

    // Also create a test user
    // Email: iamakhilesh@gmail.com, Password: Test123!
    const testUser: MockUser = {
      id: 'test-user-456',
      email: 'iamakhilesh@gmail.com',
      name: 'Akhilash Soni',
      password: '$2b$10$5OK1sE58kBI51vtvkW9OpuZHvdbdxs1rfC4OKNaiu5aGCH3WSqvmy', // Test123!
      role: UserRole.USER,
      emailVerified: true, // Demo users are pre-verified
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(testUser.email.toLowerCase(), testUser);
  }

  /** Generate a 6-digit OTP code */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(registerDto: RegisterDto): Promise<RegistrationResponse> {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);

    const email = registerDto.email.toLowerCase().trim();

    // Check if user exists
    const existingUser = this.users.get(email);

    if (existingUser) {
      // If user exists but is not verified, allow re-registration (update password, resend code)
      if (!existingUser.emailVerified) {
        this.logger.log(`Re-registration for unverified user: ${email}`);
        existingUser.password = await bcrypt.hash(registerDto.password, 10);
        existingUser.name = registerDto.name.trim();
        existingUser.verificationCode = this.generateOtp();
        existingUser.verificationCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        existingUser.updatedAt = new Date();
        this.saveUsers();

        await this.resendEmailService.sendVerificationEmail(
          existingUser.email,
          existingUser.verificationCode,
          existingUser.name,
        );

        return {
          message: 'Verification code resent. Please check your email.',
          email: existingUser.email,
        };
      }

      this.logger.warn(`Registration failed: User already exists - ${email}`);
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate verification code
    const verificationCode = this.generateOtp();
    const verificationCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with emailVerified = false
    const user: MockUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name: registerDto.name.trim(),
      password: hashedPassword,
      role: UserRole.USER,
      emailVerified: false,
      verificationCode,
      verificationCodeExpiry,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.email.toLowerCase(), user);
    this.saveUsers(); // Persist to file

    this.logger.log(`User registered successfully: ${user.email} (ID: ${user.id})`);

    // Send verification email
    await this.resendEmailService.sendVerificationEmail(user.email, verificationCode, user.name);

    // Return message instead of tokens
    return {
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email,
    };
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

    // Check if email is verified
    if (!user.emailVerified) {
      this.logger.warn(`Login blocked: Email not verified for ${email}`);

      // Resend verification email automatically
      const verificationCode = this.generateOtp();
      const verificationCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.verificationCode = verificationCode;
      user.verificationCodeExpiry = verificationCodeExpiry;
      user.updatedAt = new Date();
      this.saveUsers();

      await this.resendEmailService.sendVerificationEmail(user.email, verificationCode, user.name);

      // Throw special error with email for frontend redirect
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Please verify your email before logging in. A new verification code has been sent.',
        error: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
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

    // Calculate website count and max allowed
    const websiteCount = user.websiteIds?.length ?? 0;
    const maxWebsites = user.role === UserRole.ADMIN ? -1 : 1; // -1 = unlimited for admin, 1 for regular users

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaces: [],
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted ?? false,
        websiteCount,
        maxWebsites,
      },
    };
  }

  /** Verify email with OTP code */
  async verifyEmail(verifyDto: VerifyEmailDto): Promise<AuthResponse> {
    const email = verifyDto.email.toLowerCase().trim();
    this.logger.log(`Email verification attempt for: ${email}`);

    const user = this.users.get(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.emailVerified) {
      throw new ConflictException('Email already verified');
    }

    if (!user.verificationCode || !user.verificationCodeExpiry) {
      throw new UnauthorizedException('No verification code found. Please request a new one.');
    }

    const expiry = new Date(user.verificationCodeExpiry);
    if (expiry < new Date()) {
      throw new UnauthorizedException('Verification code has expired. Please request a new one.');
    }

    if (user.verificationCode !== verifyDto.code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Mark as verified
    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    user.updatedAt = new Date();
    this.saveUsers();

    this.logger.log(`Email verified successfully for: ${email}`);

    // Return tokens now that email is verified
    return this.generateTokens(user);
  }

  /** Resend verification code */
  async resendVerificationCode(dto: ResendVerificationDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();
    this.logger.log(`Resend verification code request for: ${email}`);

    const user = this.users.get(email);

    if (!user) {
      // Don't reveal if email exists - security best practice
      return { message: 'If an account exists with this email, a verification code has been sent.' };
    }

    if (user.emailVerified) {
      throw new ConflictException('Email already verified');
    }

    // Generate new code
    const verificationCode = this.generateOtp();
    const verificationCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    user.updatedAt = new Date();
    this.saveUsers();

    await this.resendEmailService.sendVerificationEmail(user.email, verificationCode, user.name);

    this.logger.log(`Verification code resent to: ${email}`);

    return { message: 'If an account exists with this email, a verification code has been sent.' };
  }

  async validateUser(userId: string): Promise<MockUser> {
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  /** Find user by id (internal). */
  findById(userId: string): MockUser | null {
    return Array.from(this.users.values()).find(u => u.id === userId) ?? null;
  }

  /** Update profile; persist to file. */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<MockUser> {
    const user = this.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const oldEmail = user.email.toLowerCase();
    if (dto.name != null) user.name = dto.name.trim();
    if (dto.phone != null) user.phone = dto.phone.trim() || undefined;
    if (dto.avatar != null) user.avatar = dto.avatar.trim() || undefined;
    if (dto.email != null) {
      const newEmail = dto.email.toLowerCase().trim();
      if (newEmail !== oldEmail) {
        if (this.users.has(newEmail)) throw new ConflictException('Email already in use');
        this.users.delete(oldEmail);
        user.email = newEmail;
        this.users.set(newEmail, user);
      }
    }
    user.updatedAt = new Date();
    this.saveUsers();
    this.logger.log(`Profile updated for user ${userId}`);
    return user;
  }

  /** Change password; persist to file. */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = this.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    this.saveUsers();
    this.logger.log(`Password changed for user ${userId}`);
  }

  /** Complete onboarding for user */
  async completeOnboarding(userId: string): Promise<void> {
    const user = this.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    user.onboardingCompleted = true;
    user.updatedAt = new Date();
    this.saveUsers();
    this.logger.log(`Onboarding completed for user ${userId}`);
  }

  /** Check if user can add more websites */
  canAddWebsite(userId: string): { canAdd: boolean; reason?: string; currentCount: number; maxAllowed: number } {
    const user = this.findById(userId);
    if (!user) {
      return { canAdd: false, reason: 'User not found', currentCount: 0, maxAllowed: 0 };
    }

    const currentCount = user.websiteIds?.length ?? 0;
    const maxAllowed = user.role === UserRole.ADMIN ? -1 : 1;

    if (maxAllowed === -1) {
      return { canAdd: true, currentCount, maxAllowed };
    }

    if (currentCount >= maxAllowed) {
      return {
        canAdd: false,
        reason: 'You have reached the maximum number of websites for your account. Please upgrade to add more.',
        currentCount,
        maxAllowed,
      };
    }

    return { canAdd: true, currentCount, maxAllowed };
  }

  /** Add website to user's account */
  addWebsiteToUser(userId: string, websiteId: string): void {
    const user = this.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    if (!user.websiteIds) {
      user.websiteIds = [];
    }

    if (!user.websiteIds.includes(websiteId)) {
      user.websiteIds.push(websiteId);
      user.updatedAt = new Date();
      this.saveUsers();
      this.logger.log(`Website ${websiteId} added to user ${userId}`);
    }
  }

  /** Remove website from user's account */
  removeWebsiteFromUser(userId: string, websiteId: string): void {
    const user = this.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    if (user.websiteIds) {
      user.websiteIds = user.websiteIds.filter(id => id !== websiteId);
      user.updatedAt = new Date();
      this.saveUsers();
      this.logger.log(`Website ${websiteId} removed from user ${userId}`);
    }
  }

  // ============= Admin Methods =============

  /** Get all users (admin only) */
  getAllUsers(): Array<Omit<MockUser, 'password' | 'verificationCode'>> {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      websiteIds: user.websiteIds,
    }));
  }

  /** Delete a user (admin only) */
  deleteUser(userId: string): { success: boolean; message: string } {
    const user = this.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Prevent deleting admin users
    if (user.role === UserRole.ADMIN) {
      return { success: false, message: 'Cannot delete admin users' };
    }

    // Remove user from map
    this.users.delete(user.email.toLowerCase());
    this.saveUsers();

    this.logger.log(`User deleted: ${user.email} (ID: ${userId})`);
    return { success: true, message: 'User deleted successfully' };
  }

  /** Get system statistics (admin only) */
  getSystemStats(): {
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    totalWebsites: number;
    usersRegisteredToday: number;
    usersRegisteredThisWeek: number;
    usersRegisteredThisMonth: number;
    adminUsers: number;
    regularUsers: number;
  } {
    const users = Array.from(this.users.values());
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalUsers: users.length,
      verifiedUsers: users.filter(u => u.emailVerified).length,
      unverifiedUsers: users.filter(u => !u.emailVerified).length,
      totalWebsites: users.reduce((acc, u) => acc + (u.websiteIds?.length ?? 0), 0),
      usersRegisteredToday: users.filter(u => new Date(u.createdAt) >= startOfDay).length,
      usersRegisteredThisWeek: users.filter(u => new Date(u.createdAt) >= startOfWeek).length,
      usersRegisteredThisMonth: users.filter(u => new Date(u.createdAt) >= startOfMonth).length,
      adminUsers: users.filter(u => u.role === UserRole.ADMIN).length,
      regularUsers: users.filter(u => u.role === UserRole.USER).length,
    };
  }
}
