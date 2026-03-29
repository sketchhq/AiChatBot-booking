import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'The name of the role',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Administrator with full system access',
    description: 'A description of the role and its responsibilities',
    required: false
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: false,
    description: 'Whether this is a default role assigned to new users',
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  is_default: boolean;

  @ApiProperty({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Array of permission IDs to be assigned to this role',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsOptional()
  permission_ids: number[];
}
