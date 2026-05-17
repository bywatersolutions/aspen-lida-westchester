import { createApiClient } from './api/apiFactory';
import { GLOBALS } from './globals';

export async function trackAppLaunches(url = null) {
     try {
          const client = createApiClient({
               url,
               timeout: GLOBALS.timeoutAverage,
          });
          const response = await client.post('/UserAPI?method=trackAppLaunches', {});
          return response.ok;
     } catch (error) {
          console.error('Failed to track app launch: ', error);
          return false;
     }
}

export async function trackAppResume(url = null) {
     try {
          const client = createApiClient({
               url,
               timeout: GLOBALS.timeoutAverage,
          });
          const response = await client.post('/UserAPI?method=trackAppResume', {});
          return response.ok;
     } catch (error) {
          console.error('Failed to track app resume: ', error);
          return false;
     }
}
