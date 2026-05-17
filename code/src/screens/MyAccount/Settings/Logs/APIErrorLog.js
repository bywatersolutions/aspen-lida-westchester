import React from 'react';
import { Box, Button, ButtonText, FlatList, Heading, HStack, Spinner, Text, VStack } from '@gluestack-ui/themed';
import { clearApiErrorLogs, getApiErrorLogsPage } from '../../../../util/db';

/* move this to the helpers.js */
function formatDate(ms) {
     try {
          return new Date(ms).toLocaleString();
     } catch {
          return String(ms);
     }
}

export const APIErrorLog = () => {
     const [loading, setLoading] = React.useState(false);
     const [page, setPage] = React.useState(1);
     const [rows, setRows] = React.useState([]);
     const [meta, setMeta] = React.useState({
          total: 0,
          totalPages: 1,
          hasMore: false,
          hasPrevious: false,
     });

     const loadPage = React.useCallback(async (nextPage = 1) => {
          setLoading(true);
          try {
               const result = await getApiErrorLogsPage({
                    page: nextPage,
                    pageSize: 25,
                    last24HoursOnly: true,
               });

               setRows(result.items);
               setPage(result.page);
               setMeta({
                    total: result.total,
                    totalPages: result.totalPages,
                    hasMore: result.hasMore,
                    hasPrevious: result.hasPrevious,
               });
          } finally {
               setLoading(false);
          }
     }, []);

     React.useEffect(() => {
          loadPage(1);
     }, [loadPage]);

     const onClear = async () => {
          setLoading(true);
          try {
               await clearApiErrorLogs();
               await loadPage(1);
          } finally {
               setLoading(false);
          }
     };

     const renderEntry = ({ item }) => (
          <Box borderBottomWidth={1} borderColor="$borderLight200" px="$3" py="$3">
               <VStack space="xs">
                    <Text size="xs" color="$textLight500">
                         {formatDate(item.created_at)}
                    </Text>
                    <Text bold size="sm">
                         {(item.method ?? 'UNKNOWN') + ' ' + (item.endpoint ?? '-')}
                    </Text>
                    <Text size="xs">{'status=' + (item.status ?? 'n/a') + '  problem=' + (item.problem ?? 'n/a')}</Text>
                    <Text size="xs">{item.message ?? ''}</Text>
                    {item.response_body ? (
                         <Text size="2xs" color="$textLight500">
                              {preview(item.response_body)}
                         </Text>
                    ) : null}
               </VStack>
          </Box>
     );

     return (
          <Box flex={1}>
               <Box px="$3" py="$3" borderBottomWidth={1} borderColor="$borderLight200">
                    <Heading size="sm">API Error Logs (Last 24 Hours)</Heading>
                    <Text size="xs" color="$textLight500">
                         {'Total: ' + meta.total}
                    </Text>
               </Box>

               {loading && rows.length === 0 ? (
                    <Box flex={1} alignItems="center" justifyContent="center">
                         <Spinner />
                    </Box>
               ) : (
                    <FlatList
                         data={rows}
                         keyExtractor={(item) => String(item.id)}
                         renderItem={renderItem}
                         ListEmptyComponent={
                              <Box px="$3" py="$6" alignItems="center">
                                   <Text>No API errors in the past 24 hours.</Text>
                              </Box>
                         }
                    />
               )}

               <HStack px="$3" py="$3" justifyContent="space-between" alignItems="center" borderTopWidth={1} borderColor="$borderLight200">
                    <Button variant="outline" onPress={() => loadPage(page - 1)} isDisabled={loading || !meta.hasPrevious}>
                         <ButtonText>Previous</ButtonText>
                    </Button>

                    <Text size="xs">{`Page ${page} / ${meta.totalPages}`}</Text>

                    <Button onPress={() => loadPage(page + 1)} isDisabled={loading || !meta.hasMore}>
                         <ButtonText>Next</ButtonText>
                    </Button>
               </HStack>

               <Box px="$3" pb="$3">
                    <Button variant="outline" onPress={onClear} isDisabled={loading}>
                         <ButtonText>Clear Logs</ButtonText>
                    </Button>
               </Box>
          </Box>
     );
};

/**
 * Generate a preview string for a value, truncating if it exceeds the specified max length.
 * @param value
 * @param max
 * @returns {string|string|string}
 */
function preview(value, max = 200) {
     if (value == null) return '';
     const s = typeof value === 'string' ? value : JSON.stringify(value);
     return s.length > max ? `${s.slice(0, max)}...` : s;
}