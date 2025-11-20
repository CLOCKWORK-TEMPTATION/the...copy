import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { users, type User, type NewUser } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '@/config/env';

// Use validated JWT_SECRET from env configuration
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

export interface AuthTokens {
  accessToken: string;
  user: Omit<User, 'passwordHash'>;
}

export class AuthService {
  async signup(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      throw new Error('المستخدم موجود بالفعل');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      firstName,
      lastName,
    }).returning();

    if (!newUser) {
      throw new Error('فشل إنشاء المستخدم');
    }

    // Generate JWT token
    const accessToken = this.generateToken(newUser.id);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    
    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Generate JWT token
    const accessToken = this.generateToken(user.id);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  verifyToken(token: string): { userId: string } {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      return payload;
    } catch (error) {
      throw new Error('رمز التحقق غير صالح');
    }
  }

  async generateSecureSessionToken(userId: string): Promise<string> {
    // Generate a secure session token
    return this.generateToken(userId);
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}

export const authService = new AuthService();
