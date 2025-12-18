import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
declare const AdminJwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class AdminJwtStrategy extends AdminJwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: any): Promise<{
        userId: string;
        email: string;
        role: "ADMIN" | "SUPERADMIN";
    } | null>;
}
export {};
