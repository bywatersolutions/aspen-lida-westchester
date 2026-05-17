import { SearchGlobal } from '../globals';
import { logDebugMessage } from '../logging';
import { toArray, uniquePrimitiveArray } from '../../helpers/helpers';

/**
 * Build URL parameters based on pending filters in SearchGlobal, encoding values as needed
 * @returns {string}
 */
export function buildParamsForUrl() {
     const filters = SearchGlobal.pendingFilters ?? [];
     const params = [];

     filters.forEach((filter) => {
          const field = filter.field;
          const facets = filter.facets ?? [];

          if (facets.length > 0) {
               facets.forEach((rawFacet) => {
                    let facet = rawFacet;

                    if (field === 'sort_by') {
                         if (String(facet).includes(',')) {
                              params.push(`&sort=${encodeURIComponent(facet)}`);
                         } else {
                              params.push(`&sort=${facet}`);
                         }
                    } else if (field === 'publishDateSort' || field === 'birthYear' || field === 'deathYear' || field === 'publishDate' || field === 'lexile_score' || field === 'accelerated_reader_point_value' || field === 'accelerated_reader_reading_level' || field === 'start_date') {
                         facet = String(facet).replaceAll(' ', '+');
                         params.push(`&filter[]=${field}:${facet}`);
                    } else {
                         params.push(`&filter[]=${field}:${facet}`);
                    }
               });
          }
     });

     const joined = params.join('');
     SearchGlobal.appendedParams = joined;
     logDebugMessage(`buildParamsForUrl: ${joined}`);
     return joined;
}

/**
 * Set default facets for search results, excluding 'sort_by' and limiting to 5 items
 * @param options
 * @returns {*[]}
 */
export function setDefaultFacets(options) {
     const optionList = options && typeof options === 'object' && !Array.isArray(options) ? Object.values(options) : Array.isArray(options) ? options : [];

     const defaults = optionList.filter((facetGroup) => {
          if (!facetGroup || typeof facetGroup !== 'object') return false;

          const field = facetGroup.field ?? '';
          const label = facetGroup.label ?? '';

          return field === 'availability_toggle' || label === 'Search Within';
     });

     SearchGlobal.defaultFacets = defaults;
     return defaults;
}

/**
 * Extract formats from facet data, handling both array and object structures
 * @param data
 * @returns {*|unknown[]}
 */
export function getFormats(data) {
     if (Array.isArray(data) || (data && typeof data === 'object')) {
          const values = Array.isArray(data) ? data : Object.values(data);

          const formats = values.map((item) => {
               if (typeof item === 'string' && item.includes('#')) {
                    const parts = item.split('#');
                    return parts[parts.length - 1];
               }
               return item;
          });

          return [...new Set(formats)];
     }

     return data;
}

/**
 * Add applied filter values to a given group in SearchGlobal.pendingFilters,
 * handling both multi-select and single-select scenarios, and ensuring values are unique.
 * Also logs the action and rebuilds URL parameters after updating filters.
 * @param group
 * @param values
 * @param multiSelect
 * @returns {boolean}
 */
export function addAppliedFilter(group, values, multiSelect = false) {
     if (!group) return false;

     const index = (SearchGlobal.pendingFilters ?? []).findIndex((f) => f.field === group);
     if (index === -1) return false;

     const incomingValues = toArray(values);
     const existing = SearchGlobal.pendingFilters[index].facets ?? [];

     if (multiSelect) {
          SearchGlobal.pendingFilters[index].facets = uniquePrimitiveArray([...existing, ...incomingValues]);
     } else {
          SearchGlobal.pendingFilters[index].facets = uniquePrimitiveArray([...incomingValues]);
     }

     logDebugMessage(`Added ${JSON.stringify(incomingValues)} to ${group} (multiSelect: ${multiSelect})`);
     buildParamsForUrl();
     return true;
}

/**
 * Remove applied filter values from a given group in SearchGlobal.pendingFilters,
 * handling both multi-select and single-select scenarios.
 * Also logs the action and rebuilds URL parameters after updating filters.
 * @param group
 * @param values
 * @returns {boolean}
 */
export function removeAppliedFilter(group, values) {
     if (!group) return false;

     const index = (SearchGlobal.pendingFilters ?? []).findIndex((f) => f.field === group);
     if (index === -1) return false;

     const removeValues = new Set(toArray(values));
     const existing = SearchGlobal.pendingFilters[index].facets ?? [];

     SearchGlobal.pendingFilters[index].facets = existing.filter((v) => !removeValues.has(v));

     logDebugMessage(`Removed ${JSON.stringify(values)} from ${group}`);
     buildParamsForUrl();
     return true;
}