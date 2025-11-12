import { create } from 'apisauce';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Box, FlatList } from 'native-base';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadError } from '../../components/loadError';

// custom components and helper files
import { LoadingSpinner } from '../../components/loadingSpinner';
import { LanguageContext, LibrarySystemContext } from '../../context/initialContext';
import { createAuthTokens, getHeaders } from '../../util/apiAuth';
import { GLOBALS } from '../../util/globals';
import { DisplayResult } from './DisplayResult';
import { logDebugMessage, logErrorMessage } from '../../util/logging';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

export const SearchResultsForList = () => {
     const id = useRoute().params?.id;

     const navigation = useNavigation();
     const prevRoute = useRoute().params?.prevRoute ?? 'HomeScreen';
     const screenTitle = useRoute().params?.title ?? '';
     const [page, setPage] = React.useState(1);
     const { library } = React.useContext(LibrarySystemContext);
     const { language } = React.useContext(LanguageContext);
     const url = library.baseUrl;

     let isUserList = false;
     if (screenTitle.includes('Your List')) {
          isUserList = true;
     }

     const { status, data, error, isFetching, isPreviousData } = useQuery({
          queryKey: ['searchResultsForList', url, page, id, language],
          queryFn: () => fetchSearchResults(id, page, url, language),
          keepPreviousData: true,
          staleTime: 1000,
          onError: (error) => {
               logDebugMessage("Error searching by list");
               logErrorMessage(error);
          }
     });

     const NoResults = () => {
          return null;
     };

     return (
          <SafeAreaView style={{ flex: 1 }}>
               {status === 'loading' || isFetching ? (
                    LoadingSpinner()
               ) : status === 'error' ? (
                    loadError('Error', '')
               ) : (
                    <Box flex={1}>
                         <FlatList data={data.items} ListEmptyComponent={NoResults} renderItem={({ item }) => <DisplayResult data={item} />} keyExtractor={(item, index) => index.toString()} />
                    </Box>
               )}
          </SafeAreaView>
     );
};

async function fetchSearchResults(id, page, url, language) {
     let listId = id;
     if (_.isString(listId)) {
          if (listId.includes('system_user_list')) {
               const myArray = id.split('_');
               listId = myArray[myArray.length - 1];
          }
     }

     const api = create({
          baseURL: url + '/API',
          timeout: GLOBALS.timeoutAverage,
          headers: getHeaders(true),
          auth: createAuthTokens(),
     });

     const response = await api.get('/SearchAPI?method=getListResults', {
          id: listId,
          limit: 25,
          page: page,
          language,
     });

     if (!response.ok || !response.data) {
          logErrorMessage(response);
     }

     return {
          id: response.data.result?.id ?? listId,
          items: Object.values(response.data.result?.items),
     };
}
