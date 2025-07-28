import { SetMetadata } from '@nestjs/common';
import { AppPermission } from '@/common/enums/permissions.enum';

export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';

export const HasPermissions = (...permissions: AppPermission[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
