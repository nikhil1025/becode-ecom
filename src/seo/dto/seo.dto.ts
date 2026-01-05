import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateSEOConfigDto {
  @IsString()
  siteName: string;

  @IsString()
  siteDescription: string;

  @IsUrl()
  siteUrl: string;

  @IsOptional()
  @IsUrl()
  defaultOgImage?: string;

  @IsOptional()
  @IsString()
  twitterHandle?: string;

  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  googleTagManagerId?: string;

  @IsOptional()
  @IsString()
  facebookPixelId?: string;

  @IsOptional()
  @IsString()
  facebookAppId?: string;

  @IsOptional()
  @IsString()
  twitterCardType?: string;

  @IsOptional()
  @IsString()
  defaultLocale?: string;

  @IsOptional()
  @IsString()
  robotsTxt?: string;

  @IsOptional()
  @IsString()
  customHeadScripts?: string;

  @IsOptional()
  @IsString()
  customBodyScripts?: string;

  @IsOptional()
  @IsBoolean()
  enableSitemap?: boolean;

  @IsOptional()
  @IsString()
  sitemapChangeFreq?: string;

  @IsOptional()
  @IsNumber()
  sitemapPriority?: number;
}

export class UpdateSEOConfigDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsUrl()
  siteUrl?: string;

  @IsOptional()
  @IsUrl()
  defaultOgImage?: string;

  @IsOptional()
  @IsString()
  twitterHandle?: string;

  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  googleTagManagerId?: string;

  @IsOptional()
  @IsString()
  facebookPixelId?: string;

  @IsOptional()
  @IsString()
  facebookAppId?: string;

  @IsOptional()
  @IsString()
  twitterCardType?: string;

  @IsOptional()
  @IsString()
  defaultLocale?: string;

  @IsOptional()
  @IsString()
  robotsTxt?: string;

  @IsOptional()
  @IsString()
  customHeadScripts?: string;

  @IsOptional()
  @IsString()
  customBodyScripts?: string;

  @IsOptional()
  @IsBoolean()
  enableSitemap?: boolean;

  @IsOptional()
  @IsString()
  sitemapChangeFreq?: string;

  @IsOptional()
  @IsNumber()
  sitemapPriority?: number;
}

enum RedirectType {
  PERMANENT_301 = 'PERMANENT_301',
  TEMPORARY_302 = 'TEMPORARY_302',
  SEE_OTHER_303 = 'SEE_OTHER_303',
  TEMPORARY_REDIRECT_307 = 'TEMPORARY_REDIRECT_307',
  PERMANENT_REDIRECT_308 = 'PERMANENT_REDIRECT_308',
}

export class CreateSEORedirectDto {
  @IsString()
  fromPath: string;

  @IsString()
  toPath: string;

  @IsEnum(RedirectType)
  type: RedirectType;

  @IsOptional()
  @IsInt()
  statusCode?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSEORedirectDto {
  @IsOptional()
  @IsString()
  fromPath?: string;

  @IsOptional()
  @IsString()
  toPath?: string;

  @IsOptional()
  @IsEnum(RedirectType)
  type?: RedirectType;

  @IsOptional()
  @IsInt()
  statusCode?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateURLMonitorDto {
  @IsUrl()
  url: string;
}

export class UpdateURLMonitorDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsInt()
  statusCode?: number;

  @IsOptional()
  @IsInt()
  responseTime?: number;

  @IsOptional()
  @IsBoolean()
  isAccessible?: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class CreateSearchAnalyticsDto {
  @IsString()
  query: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsInt()
  clicks?: number;

  @IsOptional()
  @IsInt()
  impressions?: number;

  @IsOptional()
  @IsNumber()
  ctr?: number;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateSEOFieldsDto {
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;

  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @IsOptional()
  @IsBoolean()
  noIndex?: boolean;

  @IsOptional()
  @IsBoolean()
  noFollow?: boolean;
}
