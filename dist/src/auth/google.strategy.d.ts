import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../prisma.service';
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void>;
}
export {};
