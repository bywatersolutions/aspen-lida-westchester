import { GLOBALS } from '../globals';
import { getManifestation } from './item';
import { createApiClient } from './apiFactory';

/** *******************************************************************
 * General
 ******************************************************************* **/

/**
 * Fetches grouped work data for a given item ID, including the first format and its manifestation details
 * @param itemId
 * @param language
 * @param url
 * @returns {Promise<{results: *|{}, format: *|string, manifestation}>}
 */
export async function getGroupedWork(itemId, language, url = null) {
     const client = createApiClient({
          url,
          timeout: GLOBALS.timeoutSlow,
          language,
     });

     const response = await client.get('/WorkAPI?method=getGroupedWork', {
          id: itemId,
          language,
     });

     const data = response.data?.result ?? response.data ?? {};
     const formatKeys = data?.formats ? Object.keys(data.formats) : [];
     const firstFormat = formatKeys[0] ?? '';

     const manifestation = await getManifestation(itemId, firstFormat, language, url);

     return {
          results: data,
          format: firstFormat,
          manifestation: manifestation ?? [],
     };
}