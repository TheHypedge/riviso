import { SetMetadata } from '@nestjs/common';

export const API_VERSION_KEY = 'apiVersion';

/**
 * Decorator to set API version for a controller or route
 */
export const ApiVersion = (version: string) =>
  SetMetadata(API_VERSION_KEY, version);
