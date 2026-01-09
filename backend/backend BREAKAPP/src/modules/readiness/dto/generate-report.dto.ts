import { IsString, IsOptional } from 'class-validator';

export class GenerateReportDto {
  @IsString()
  @IsOptional()
  owner?: string;

  @IsString()
  @IsOptional()
  repo?: string;

  @IsString()
  @IsOptional()
  repositoryPath?: string;
}
