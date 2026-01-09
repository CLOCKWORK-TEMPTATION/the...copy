import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ScanQRDto } from './dto/scan-qr.dto.js';
import { VerifyTokenDto } from './dto/verify-token.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Generate QR code for a project (used by director)
   * Protected endpoint - requires JWT
   */
  @UseGuards(JwtAuthGuard)
  @Get('generate-qr/:projectId')
  async generateQR(@Param('projectId') projectId: string) {
    const qrCode = await this.authService.generateQRCode(projectId);
    const token = await this.authService.generateQRToken(projectId);
    
    return {
      qr_code: qrCode,
      token,
      expires_in: '5 minutes',
    };
  }

  /**
   * Scan QR code and get JWT (used by crew members)
   * Public endpoint
   */
  @Post('scan-qr')
  async scanQR(@Body() scanQRDto: ScanQRDto) {
    return this.authService.scanQRAndLogin(
      scanQRDto.qr_token,
      scanQRDto.device_hash,
    );
  }

  /**
   * Verify JWT token validity
   * Public endpoint
   */
  @Post('verify')
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    const payload = await this.authService.verifyJWT(verifyTokenDto.token);
    return {
      valid: true,
      payload,
    };
  }
}
