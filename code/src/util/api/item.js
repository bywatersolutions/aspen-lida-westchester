import { GLOBALS } from '../globals';
import { createAuthTokens, getHeaders } from '../apiAuth';
import { create } from 'apisauce';
import _ from 'lodash';
import { logDebugMessage, logInfoMessage, logWarnMessage, logErrorMessage } from '../logging.js';

/** *******************************************************************
 * General
 ******************************************************************* **/
/**
 * Returns manifestation data for the given grouped work id and format
 * @param {string} itemId
 * @param {string} format
 * @param {string} language
 * @param {string} url
 **/
export async function getManifestation(itemId, format, language, url) {
     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutSlow,
          headers: getHeaders(),
          auth: createAuthTokens(),
     });

     const response = await api.get('/ItemAPI?method=getManifestation', {
          id: itemId,
          format: format,
          language,
     });

     if(!response.ok) {
          logErrorMessage(`Error fetching manifestation for itemId ${itemId} format ${format} language ${language}: ${response.problem}`);
          logDebugMessage(response);
     }

     return {
          id: response.data?.id ?? itemId,
          format: response.data?.format ?? format,
          manifestation: response.data?.manifestation ?? [],
     };
}

/**
 * Returns variation data for the given grouped work id and format
 * @param {string} itemId
 * @param {string} format
 * @param {string} language
 * @param {string} url
 * @param {array} variation
 **/
export async function getVariations(itemId, format, language, url, variation) {
     let recordId = null;
     if (variation.recordId) {
          recordId = variation.recordId;
     }

     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutSlow,
          headers: getHeaders(),
          auth: createAuthTokens(),
     });

     const response = await api.get('/ItemAPI?method=getVariations', {
          id: itemId,
          format: format,
          language,
          recordId,
     });

     if(!response.ok) {
          logErrorMessage(`Error fetching variations for itemId ${itemId} format ${format} language ${language}: ${response.problem}`);
          logDebugMessage(response);
     }

     return {
          id: response.data?.id ?? itemId,
          format: response.data?.format ?? format,
          variations: response.data?.variations ?? [],
          volumeInfo: {
               numItemsWithVolumes: response.data?.numItemsWithVolumes ?? 0,
               numItemsWithoutVolumes: response.data?.numItemsWithoutVolumes ?? 0,
               hasItemsWithoutVolumes: response.data?.hasItemsWithoutVolumes ?? 0,
               majorityOfItemsHaveVolumes: response.data?.majorityOfItemsHaveVolumes ?? false,
               alwaysPlaceVolumeHoldWhenVolumesArePresent: response.data?.alwaysPlaceVolumeHoldWhenVolumesArePresent ?? false,
          },
     };
}

/**
 * Returns record data for the given grouped work id and format
 * @param {string} itemId
 * @param {string} format
 * @param {string} source
 * @param {string} language
 * @param {string} url
 **/
export async function getRecords(itemId, format, source, language, url) {
     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutSlow,
          headers: getHeaders(),
          auth: createAuthTokens(),
     });

     const response = await api.get('/ItemAPI?method=getRecords', {
          id: itemId,
          format: format,
          source: source,
          language,
     });

     if(!response.ok) {
          logErrorMessage(`Error fetching records for itemId ${itemId} format ${format} source ${source} language ${language}: ${response.problem}`);
          logDebugMessage(response);
     }

     return {
          id: response.data?.id ?? itemId,
          format: response.data?.format ?? format,
          records: response.data?.records ?? [],
     };
}

export async function getFirstRecord(itemId, format, language, url) {
     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutSlow,
          headers: getHeaders(),
          auth: createAuthTokens(),
     });

     const response = await api.get('/ItemAPI?method=getRecords', {
          id: itemId,
          format: format,
          language,
     });

     let id = null;
     let source = 'ils';
     let record = null;

     if(response.ok) {
          if (response.data?.records) {
               const records = response.data.records;
               const keys = Object.keys(records);
               let firstKey = keys[0];
               id = records[firstKey].id;
               record = id;
               const recordId = id.split(':');
               id = recordId[1]?.toString();
               source = recordId[0]?.toString();
          } else {
               logWarnMessage(`No records found for itemId ${itemId} format ${format} language ${language}`);

          }
     } else {
          logErrorMessage(`Error fetching records for itemId ${itemId} format ${format} language ${language}: ${response.problem}`);
          logDebugMessage(response);
     }

     return {
          id: id,
          source: source,
          record: record,
     };
}

export async function getVolumes(id, url) {
     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutAverage,
          headers: getHeaders(),
          auth: createAuthTokens(),
          params: {
               id: id,
          },
     });
     const response = await api.get('/ItemAPI?method=getVolumes', {
          id,
     });
     let volumes = [];
     if (response.ok) {
          if (response.data?.volumes) {
               volumes = _.sortBy(response.data.volumes, 'key');
          } else {
               logWarnMessage(`No volumes found for id ${id}`);
          }
     } else {
          logErrorMessage(`Error fetching volumes for id ${id}: ${response.problem}`);
          logDebugMessage(response);
     }

     return volumes;
}

export async function getRelatedRecord(id, recordId, format, url) {
     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutSlow,
          headers: getHeaders(),
          auth: createAuthTokens(),
     });

     const response = await api.get('/ItemAPI?method=getRelatedRecord', {
          id: id,
          record: recordId,
          format: format,
     });

     if(!response.ok) {
          logErrorMessage(`Error fetching related record for id ${id} recordId ${recordId} format ${format}: ${response.problem}`);
          logDebugMessage(response);
     }

     return {
          id: response.data?.id ?? id,
          recordId: response.data?.record ?? recordId,
          format: response.data?.format ?? format,
          manifestation: response.data?.record ?? [],
     };
}

/**
 * Returns copies data for given record id
 * @param {string} recordId
 * @param {string} language
 * @param {string} variationId
 * @param {string} url
 **/
export async function getCopies(recordId, language = 'en', variationId, url) {
     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutSlow,
          headers: getHeaders(),
          auth: createAuthTokens(),
     });

     const response = await api.get('/ItemAPI?method=getCopies', {
          recordId,
          language,
          variationId,
     });

     if(!response.ok) {
          logErrorMessage(`Error fetching copies for recordId ${recordId} language ${language} variationId ${variationId}: ${response.problem}`);
          logDebugMessage(response);
     }

     return {
          recordId: recordId,
          copies: response.data?.copies ?? [],
     };
}
