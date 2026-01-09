import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../database/prisma.service.js';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';

// Configuration constants
const QR_TOKEN_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate a QR token for a project
   * QR token format: projectId:timestamp:signature
   */
  async generateQRToken(projectId: string): Promise<string> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new UnauthorizedException('Project not found');
    }

    const timestamp = Date.now();
    const data = `${projectId}:${timestamp}`;
    
    // Create HMAC signature using project's access token secret
    const signature = crypto
      .createHmac('sha256', project.access_token_secret)
      .update(data)
      .digest('hex');

    return `${data}:${signature}`;
  }

  /**
   * Generate QR code image from token
   */
  async generateQRCode(projectId: string): Promise<string> {
    const token = await this.generateQRToken(projectId);
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
    });

    return qrCodeDataUrl;
  }

  /**
   * Verify QR token validity
   */
  async verifyQRToken(token: string): Promise<{ projectId: string; valid: boolean }> {
    try {
      const parts = token.split(':');
      if (parts.length !== 3) {
        return { projectId: '', valid: false };
      }

      const [projectId, timestamp, signature] = parts;

      // Check if token is not too old (5 minutes)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > QR_TOKEN_EXPIRATION_MS) {
        return { projectId, valid: false };
      }

      // Get project and verify signature
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return { projectId, valid: false };
      }

      const data = `${projectId}:${timestamp}`;
      const expectedSignature = crypto
        .createHmac('sha256', project.access_token_secret)
        .update(data)
        .digest('hex');

      const valid = signature === expectedSignature;
      return { projectId, valid };
    } catch (error) {
      return { projectId: '', valid: false };
    }
  }

  /**
   * Issue a session JWT for a user
   */
  async issueSessionJWT(userId: string, projectId: string, role: Role): Promise<string> {
    const payload = {
      sub: userId,
      projectId,
      role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Scan QR and create/get user, then issue JWT
   */
  async scanQRAndLogin(qrToken: string, deviceHash: string): Promise<{ access_token: string; user: any }> {
    // Verify QR token
    const { projectId, valid } = await this.verifyQRToken(qrToken);
    
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired QR code');
    }

    // Generate user hash from device hash and project
    const userHash = crypto
      .createHash('sha256')
      .update(`${deviceHash}:${projectId}`)
      .digest('hex');

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { user_hash: userHash },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          project_id: projectId,
          user_hash: userHash,
          role: Role.CREW, // Default role
        },
      });
    }

    // Issue JWT
    const access_token = await this.issueSessionJWT(user.id, projectId, user.role);

    return {
      access_token,
      user: {
        id: user.id,
        role: user.role,
        projectId: user.project_id,
      },
    };
  }

  /**
   * Verify JWT token
   */
  async verifyJWT(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
