// src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: { module: string; action: 'view' | 'create' | 'edit' | 'delete' }[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

