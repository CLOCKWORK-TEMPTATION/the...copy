import { IsString, IsNotEmpty } from 'class-validator';

export class ScanQRDto {
  @IsString()
  @IsNotEmpty()
  qr_token: string;

  @IsString()
  @IsNotEmpty()
  device_hash: string;
}
