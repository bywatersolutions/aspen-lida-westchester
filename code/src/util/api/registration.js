import { GLOBALS } from '../globals';
import { createApiClient } from './apiFactory';

/**
 * Fetch the self registration form configuration from the API
 * @param url
 * @returns {Promise<*|{ok: boolean, status, problem: string, data, config: {}}|undefined>}
 */
export async function getSelfRegistrationForm(url = null) {
     const client = createApiClient({ url, timeout: GLOBALS.timeoutAverage });
     return await client.get('/RegistrationAPI?method=getSelfRegistrationForm');
}

/**
 * Submit the self registration form data to the API
 * @param url
 * @param data
 * @returns {Promise<*|{ok: boolean, status, problem: string, data, config: {}}|undefined>}
 */
export async function submitSelfRegistration(url = null, data = {}) {
     const client = createApiClient({ url, timeout: GLOBALS.timeoutAverage });
     return await client.post('/RegistrationAPI?method=processSelfRegistration', {}, { params: data });
}
