import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override canActivate to make authentication optional
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try to activate authentication
      const result = await super.canActivate(context);
      console.log('✅ [OptionalJwtAuthGuard] Authentication successful');
      return result as boolean;
    } catch (error) {
      // If authentication fails, just continue without user
      console.log('⚠️  [OptionalJwtAuthGuard] Authentication failed, proceeding without user');
      return true;
    }
  }

  // Override handleRequest to not throw an error if no token is provided
  handleRequest(err: any, user: any, info: any) {
    console.log('🔍 [OptionalJwtAuthGuard] handleRequest:', { 
      hasError: !!err, 
      hasUser: !!user, 
      user: user,
      info: info 
    });
    
    // If there's an error or no user, just return null (don't throw)
    // This allows the request to proceed without authentication
    if (err || !user) {
      console.log('❌ [OptionalJwtAuthGuard] Returning null (no auth)');
      return null;
    }
    
    console.log('✅ [OptionalJwtAuthGuard] Returning user:', user);
    return user;
  }
}
