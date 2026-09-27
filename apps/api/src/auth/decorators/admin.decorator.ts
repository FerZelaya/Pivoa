import { SetMetadata } from '@nestjs/common';

export const ADMIN_ROUTE_KEY = 'adminRoute';
export const Admin = () => SetMetadata(ADMIN_ROUTE_KEY, true);
