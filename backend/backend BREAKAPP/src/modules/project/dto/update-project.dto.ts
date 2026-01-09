import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  budget_config?: object;

  @IsOptional()
  @IsObject()
  active_location?: object;
}
