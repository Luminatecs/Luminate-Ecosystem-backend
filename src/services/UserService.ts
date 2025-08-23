import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { 
  User, 
  CreateUserInput, 
  UpdateUserInput,
  UserRole 
} from '../models/Auth/interfaces';
import { 
  QueryOptions, 
  PaginatedResponse, 
  LoginCredentials,
  AuthToken,
  LoginResponse
} from '../types/database';

export class UserService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private refreshTokenExpiresIn: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserInput): Promise<Omit<User, 'password_hash'>> {
    // Check if user already exists by email
    const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    // Check if user already exists by username
    const existingUserByUsername = await this.userRepository.findByUsername(userData.username);
    if (existingUserByUsername) {
      throw new Error('User with this username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password_hash, 12);
    
    const userToCreate = {
      ...userData,
      password_hash: hashedPassword
    };

    const newUser = await this.userRepository.create(userToCreate);
    
    // Return user without password
    const { password_hash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Authenticate user login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { username, password } = credentials;
    
    console.log('🔐 Login attempt for username:', username);
    const user = await this.userRepository.findByUsername(username);
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found for username:', username);
      throw new Error('Invalid username or password');
    }
    console.log('✅ User found - ID:', user.id, 'Active:', user.is_active);

    // Check if user is active
    if (!user.is_active) {
      console.log('❌ User account is deactivated');
      throw new Error('Account is deactivated');
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('🔓 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      throw new Error('Invalid username or password');
    }

    console.log('✅ Login successful for username:', username);

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate tokens
    const { password_hash, ...userWithoutPassword } = user;
    
    // Transform user object to camelCase for frontend compatibility
    const transformedUser = {
      id: userWithoutPassword.id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      educationLevel: userWithoutPassword.education_level,
      organizationId: userWithoutPassword.organization_id,
      isOrgWard: userWithoutPassword.is_org_ward,
      isActive: userWithoutPassword.is_active,
      emailVerified: userWithoutPassword.email_verified,
      lastLoginAt: userWithoutPassword.last_login_at,
      createdAt: userWithoutPassword.created_at,
      updatedAt: userWithoutPassword.updated_at
    };
    
    const accessToken = this.generateAccessToken(userWithoutPassword);
    const refreshToken = this.generateRefreshToken(userWithoutPassword);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
      tokenType: 'Bearer',
      user: transformedUser
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as any;
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user || !user.is_active) {
        throw new Error('Invalid refresh token');
      }

      const { password_hash, ...userWithoutPassword } = user;
      
      // Transform user object to camelCase for frontend compatibility
      const transformedUser = {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
        educationLevel: userWithoutPassword.education_level,
        organizationId: userWithoutPassword.organization_id,
        isOrgWard: userWithoutPassword.is_org_ward,
        isActive: userWithoutPassword.is_active,
        emailVerified: userWithoutPassword.email_verified,
        lastLoginAt: userWithoutPassword.last_login_at,
        createdAt: userWithoutPassword.created_at,
        updatedAt: userWithoutPassword.updated_at
      };
      
      const newAccessToken = this.generateAccessToken(userWithoutPassword);
      const newRefreshToken = this.generateRefreshToken(userWithoutPassword);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
        tokenType: 'Bearer',
        user: transformedUser
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(options: QueryOptions): Promise<PaginatedResponse<Omit<User, 'password_hash'>>> {
    return await this.userRepository.findMany(options);
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: UpdateUserInput): Promise<Omit<User, 'password_hash'> | null> {
    // If email is being updated, check for duplicates
    if (userData.email) {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('User with this email already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, userData);
    if (!updatedUser) return null;

    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  /**
   * Change user password
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await this.userRepository.update(id, { password_hash: hashedNewPassword });
  }

  /**
   * Activate/deactivate user
   */
  async setUserActiveStatus(id: string, isActive: boolean): Promise<Omit<User, 'password_hash'> | null> {
    const updatedUser = await this.userRepository.setActiveStatus(id, isActive);
    if (!updatedUser) return null;

    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Get users by organization
   */
  async getUsersByOrganization(organizationId: string, options: QueryOptions): Promise<PaginatedResponse<Omit<User, 'password_hash'>>> {
    return await this.userRepository.findByOrganization(organizationId, options);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private generateAccessToken(user: Omit<User, 'password_hash'>): string {
    const payload = { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    };
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    } as jwt.SignOptions);
  }

  private generateRefreshToken(user: Omit<User, 'password_hash'>): string {
    const payload = { 
      userId: user.id,
      type: 'refresh'
    };
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn
    } as jwt.SignOptions);
  }

  private parseExpiresIn(expiresIn: string): number {
    // Parse expiration time to seconds
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match || !match[1]) return 3600; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 3600;
    }
  }

  /**
   * Generate a random password for wards
   */
  private generateWardPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Generate a unique username for wards
   */
  private async generateWardUsername(name: string, organizationId: string): Promise<string> {
    const baseName = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 12);
    
    let counter = 1;
    let username = baseName;
    
    while (await this.userRepository.findByUsername(username)) {
      username = `${baseName}${counter}`;
      counter++;
    }
    
    return username;
  }

  /**
   * Create a single ward (student) for an organization
   */
  async createWard(wardData: {
    name: string;
    email: string;
    educationLevel: string;
    organizationId: string;
  }): Promise<{
    id: string;
    name: string;
    username: string;
    email: string;
    educationLevel: string;
    password: string;
  }> {
    // Check if ward already exists by email
    const existingWard = await this.userRepository.findByEmail(wardData.email);
    if (existingWard) {
      throw new Error('A ward with this email already exists');
    }

    // Generate unique username and password
    const username = await this.generateWardUsername(wardData.name, wardData.organizationId);
    const password = this.generateWardPassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    const ward = await this.userRepository.create({
      name: wardData.name,
      username,
      email: wardData.email,
      password_hash: hashedPassword,
      role: UserRole.ORG_WARD,
      education_level: wardData.educationLevel as any,
      organization_id: wardData.organizationId,
      is_org_ward: true,
      is_active: true,
      email_verified: false
    });

    return {
      id: ward.id,
      name: ward.name,
      username,
      email: ward.email,
      educationLevel: wardData.educationLevel,
      password // Return plain password for admin to share with student
    };
  }

  /**
   * Create multiple wards from bulk data (CSV import)
   */
  async createWardsBulk(data: {
    wards: Array<{
      name: string;
      email: string;
      educationLevel: string;
    }>;
    organizationId: string;
  }): Promise<Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    educationLevel: string;
    password: string;
  }>> {
    const createdWards = [];

    for (const wardData of data.wards) {
      try {
        const ward = await this.createWard({
          ...wardData,
          organizationId: data.organizationId
        });
        createdWards.push(ward);
      } catch (error) {
        // Log error but continue with other wards
        console.error(`Failed to create ward ${wardData.email}:`, error);
      }
    }

    return createdWards;
  }

  /**
   * Get all wards for an organization
   */
  async getOrganizationWards(organizationId: string): Promise<Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    educationLevel: string;
    isActive: boolean;
    credentialsAssigned: boolean;
    createdAt: Date;
  }>> {
    // Use custom query to get organization wards
    const result = await this.userRepository.query(`
      SELECT id, name, username, email, education_level, is_active, last_login_at, created_at
      FROM users 
      WHERE organization_id = $1 
        AND role = $2 
        AND is_org_ward = true
      ORDER BY created_at DESC
    `, [organizationId, UserRole.ORG_WARD]);

    return result.rows.map((ward: any) => ({
      id: ward.id,
      name: ward.name,
      username: ward.username,
      email: ward.email,
      educationLevel: ward.education_level,
      isActive: ward.is_active,
      credentialsAssigned: ward.last_login_at !== null,
      createdAt: ward.created_at
    }));
  }

  /**
   * Assign credentials to wards (send emails with login info)
   * In a real implementation, this would integrate with an email service
   */
  async assignWardsCredentials(organizationId: string): Promise<{
    totalWards: number;
    emailsSent: number;
    errors: string[];
  }> {
    // Get wards who haven't logged in yet
    const result = await this.userRepository.query(`
      SELECT id, username, email, name
      FROM users 
      WHERE organization_id = $1 
        AND role = $2 
        AND is_org_ward = true
        AND last_login_at IS NULL
      ORDER BY created_at DESC
    `, [organizationId, UserRole.ORG_WARD]);

    const wards = result.rows;
    const response = {
      totalWards: wards.length,
      emailsSent: 0,
      errors: [] as string[]
    };

    for (const ward of wards) {
      try {
        // In a real implementation, you would:
        // 1. Generate a temporary password reset token
        // 2. Send email with login instructions
        // 3. Update ward record to mark credentials as sent
        
        // For now, we'll just log the credentials (in production, never do this!)
        console.log(`Ward Credentials - Username: ${ward.username}, Email: ${ward.email}`);
        
        response.emailsSent++;
      } catch (error) {
        response.errors.push(`Failed to send email to ${ward.email}: ${error}`);
      }
    }

    return response;
  }
}
