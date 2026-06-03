import { ApiClient } from './apiClient';
import { LIBRARY, GLOBALS } from '../globals';

/**
 * Create a configured API client instance
 */
export function createApiClient(config = {}) {
     let baseURL = (config.url || LIBRARY.url || '').replace(/\/+$/, '');
     if (!baseURL.endsWith('/API')) {
          baseURL = `${baseURL}/API`;
     }

     const timeout = config.timeout || GLOBALS.timeoutAverage;
     const language = config.language || 'en';

     return new ApiClient({
          baseURL,
          timeout,
          language,
     });
}

/**
 * Get default client for most API calls
 */
export function getDefaultClient() {
     return createApiClient({
          url: LIBRARY.url,
          timeout: GLOBALS.timeoutAverage,
          language: 'en',
     });
}
