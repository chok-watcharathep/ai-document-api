import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user: SupabaseUser;
  }
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SupabaseUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
