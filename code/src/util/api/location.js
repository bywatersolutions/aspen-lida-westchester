import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'apisauce';
import { createAuthTokens, getErrorMessage, getHeaders } from '../apiAuth';
import { GLOBALS } from '../globals';
import { LIBRARY } from '../loadLibrary';
import { popToast } from '../../components/loadError';
import { logDebugMessage, logErrorMessage } from '../logging';

export async function getLocationInfo(url = null, locationId = null) {
     const apiUrl = url ?? LIBRARY.url;

     if (!locationId) {
          try {
               locationId = await AsyncStorage.getItem('@locationId');
          } catch (e) {
               logDebugMessage(e);
          }
     }

     const discovery = create({
          baseURL: apiUrl + '/API',
          timeout: GLOBALS.timeoutFast,
          headers: getHeaders(),
          auth: createAuthTokens(),
          params: {
               id: locationId,
               version: GLOBALS.appVersion,
          },
     });
     return await discovery.get('/SystemAPI?method=getLocationInfo');
}

export async function getSelfCheckSettings(url = null) {
     const apiUrl = url ?? LIBRARY.url;
     let locationId;
     try {
          locationId = await AsyncStorage.getItem('@locationId');
     } catch (e) {
          logDebugMessage(e);
     }

     const discovery = create({
          baseURL: apiUrl + '/API',
          timeout: GLOBALS.timeoutFast,
          headers: getHeaders(),
          auth: createAuthTokens(),
          params: {
               locationId: locationId,
          },
     });
     return await discovery.get('/SystemAPI?method=getSelfCheckSettings');
}

export async function getLocations(url, language = 'en', latitude, longitude) {
     const discovery = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutFast,
          headers: getHeaders(),
          auth: createAuthTokens(),
          params: {
               latitude,
               longitude,
               language,
          },
     });
     return await discovery.get('/SystemAPI?method=getLocations');
}