import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export class CreatePermissionDto {
  @ApiProperty({
    example: 'manage_users',
    description: 'The name of the permission',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Allows managing user accounts',
    description: 'A description of what this permission allows',
    required: false
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 'CREATE',
    description: 'The type of action this permission grants',
    enum: PermissionAction,
    required: true
  })
  @IsEnum(PermissionAction)
  @IsNotEmpty()
  action: PermissionAction;

  @ApiProperty({
    example: 'users',
    description: 'The resource this permission applies to',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  resource: string;
}
