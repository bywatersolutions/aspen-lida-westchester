import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'apisauce';
import _ from 'lodash';
import { createAuthTokens, getErrorMessage, getHeaders, postData, stripHTML } from '../apiAuth';
import { GLOBALS } from '../globals';
import { LIBRARY } from '../loadLibrary';

import { logDebugMessage, logInfoMessage, logWarnMessage, logErrorMessage } from '../logging.js';
import { popToast } from '../../components/loadError';

export async function getLibraryInfo(url = null, id = null) {
     const apiUrl = url ?? LIBRARY.url;
     let libraryId;

     try {
          libraryId = await AsyncStorage.getItem('@libraryId');
     } catch (e) {
          logErrorMessage("Error loading library info");
          logErrorMessage(e);
     }

     if (id) {
          libraryId = id;
     }
	 if (typeof(libraryId) == "string")
	 {
		//strip quotes from libraryId
		libraryId = libraryId.replace(/['"]+/g, '');
		//then convert it into an int
		libraryId = parseInt(libraryId);
	 }

     const discovery = create({
          baseURL: apiUrl + '/API',
          timeout: GLOBALS.timeoutFast,
          headers: getHeaders(),
          auth: createAuthTokens(),
          params: {
               id: libraryId,
          },
     });
     return await discovery.get('/SystemAPI?method=getLibraryInfo');
}

/**
 * Return list of library menu links
 **/
export async function getLibraryLinks(url = null) {
     const postBody = await postData();
     const apiUrl = url ?? LIBRARY.url;
     const discovery = create({
          baseURL: apiUrl + '/API',
          timeout: GLOBALS.timeoutFast,
          headers: getHeaders(true),
          auth: createAuthTokens(),
     });
     return await discovery.post('/SystemAPI?method=getLibraryLinks', postBody);
}

/**
 * Return list of available languages
 **/
export async function getLibraryLanguages(url = null) {
     const apiUrl = url ?? LIBRARY.url;
     const api = create({
          baseURL: apiUrl + '/API',
          timeout: GLOBALS.timeoutFast,
          headers: getHeaders(true),
          auth: createAuthTokens(),
     });
     return await api.get('/SystemAPI?method=getLanguages');
}

/**
 * Return array of pre-validated system messages
 * @param {int|null} libraryId
 * @param {int|null} locationId
 * @param {string} url
 **/
export async function getSystemMessages(libraryId = null, locationId = null, url) {
     const postBody = await postData();
     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutFast,
          headers: getHeaders(true),
          auth: createAuthTokens(),
          params: {
               libraryId,
               locationId,
          },
     });
     return await api.post('/SystemAPI?method=getSystemMessages', postBody);
}

/**
 * Dismiss given system message from displaying again
 * @param {int} systemMessageId
 * @param {string} url
 **/
export async function dismissSystemMessage(systemMessageId, url) {
     const postBody = await postData();
     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutFast,
          headers: getHeaders(true),
          auth: createAuthTokens(),
          params: {
               systemMessageId,
          },
     });
     const response = await api.post('/SystemAPI?method=dismissSystemMessage', postBody);
     if (response.ok) {
          if (response?.data?.result) {
               return response.data.result;
          }
     } else {
          logErrorMessage("Error dismissing system message");
          getErrorMessage({ statusCode: response.status, problem: response.problem, sendToSentry: true });
          logErrorMessage(response);
          return [];
     }
}

/**
 * Check if Aspen Discovery is in offline mode
 * @param {string} url
 **/
export async function getCatalogStatus(url = null) {
     const apiUrl = url ?? LIBRARY.url;
     const api = create({
          baseURL: apiUrl + '/API',
          timeout: GLOBALS.timeoutAverage,
          headers: getHeaders(),
          auth: createAuthTokens(),
     });
     return await api.get('/SystemAPI?method=getCatalogStatus');
}

/**
 * Returns basic registration form fields
 * @param {string} url
 **/
export async function getSelfRegistrationForm(url = '') {
     const apiUrl = url ?? LIBRARY.url;
     const api = create({
          baseURL: apiUrl + '/API',
          timeout: GLOBALS.timeoutAverage,
          headers: getHeaders(),
          auth: createAuthTokens(),
     });
     return await api.get('/RegistrationAPI?method=getSelfRegistrationForm');
}

export async function submitSelfRegistration(url = '', data = []) {
     const apiUrl = url ?? LIBRARY.url;
     const api = create({
          baseURL: apiUrl + '/API',
          timeout: GLOBALS.timeoutAverage,
          headers: getHeaders(),
          auth: createAuthTokens(),
          params: data,
     });
     return await api.post('/RegistrationAPI?method=processSelfRegistration');
}
