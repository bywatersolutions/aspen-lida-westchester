import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import _ from 'lodash';
import React from 'react';
import {
    Box,
    Button,
    ButtonText,
    ButtonGroup,
    Center,
    FormControl,
    HStack,
    Icon,
    Input,
    InputField,
    InputIcon,
    InputSlot,
    Pressable,
    ScrollView,
    Text,
    View,
    VStack,
    ChevronRightIcon
} from '@gluestack-ui/themed';
import { LoadingSpinner } from '../../components/loadingSpinner';

import { LanguageContext, LibraryBranchContext, LibrarySystemContext, SearchContext, ThemeContext, UserContext } from '../../context/initialContext';
import { navigateStack } from '../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../translations/TranslationService';

// custom components and helper files
import { buildParamsForUrl, SEARCH } from '../../util/search';
import { UnsavedChangesExit } from './UnsavedChanges';

export const FiltersScreen = () => {
     const [isLoading, setIsLoading] = React.useState(false);
     const navigation = useNavigation();
     const [loading, setLoading] = React.useState(false);
     const { user } = React.useContext(UserContext);
     const { library } = React.useContext(LibrarySystemContext);
     const { location } = React.useContext(LibraryBranchContext);
     const { language } = React.useContext(LanguageContext);
     const { currentIndex, currentSource, indexes, sources, updateCurrentIndex, updateCurrentSource, updateIndexes } = React.useContext(SearchContext);
     const {theme, textColor, colorMode } = React.useContext(ThemeContext);
     const pendingFiltersFromParams = useNavigationState((state) => state.routes[0]['params']['pendingFilters']);
     const [searchTerm, setSearchTerm] = React.useState(SEARCH.term ?? '');
     const [searchSourceLabel, setSearchSourceLabel] = React.useState('Library Catalog');

     let facets = SEARCH.availableFacets ? Object.keys(SEARCH.availableFacets) : [];
     let pendingFilters = SEARCH.pendingFilters ?? [];

     if (pendingFilters !== pendingFiltersFromParams) {
          navigation.setOptions({
               headerRight: () => <UnsavedChangesExit language={language} updateSearch={updateSearch} discardChanges={discardChanges} prevRoute="SearchScreen" />,
          });
     }

     const locationGroupedWorkDisplaySettings = location.groupedWorkDisplaySettings ?? [];
     const libraryGroupedWorkDisplaySettings = library.groupedWorkDisplaySettings ?? [];

     const renderFilter = (label, index) => {
          return (
               <Pressable key={index} borderBottomWidth={1} borderColor={colorMode === 'light' ? theme['colors']['coolGray']['200'] : theme['colors']['gray']['600']} py="$5" onPress={() => openCluster(label)}>
                    <VStack alignContent="center">
                         <HStack justifyContent="space-between" alignItems="center" alignContent="center">
                              <VStack>
                                   <Text bold color={textColor}>{label}</Text>
                                   {appliedFacet(label)}
                              </VStack>
                              <ChevronRightIcon color={textColor} />
                         </HStack>
                    </VStack>
               </Pressable>
          );
     };

     const appliedFacet = (cluster) => {
          const facetData = _.filter(SEARCH.availableFacets, ['label', cluster]);
          const pendingFacets = _.filter(pendingFilters, ['field', facetData[0]['field']]);
          let text = '';
          if (_.isObjectLike(SEARCH.appliedFilters) && !_.isUndefined(SEARCH.appliedFilters[cluster])) {
               const facet = SEARCH.appliedFilters[cluster];
               _.forEach(facet, function (item, key) {
                    if (text.length === 0) {
                         text = text.concat(_.toString(item['display']));
                    } else {
                         text = text.concat(', ', _.toString(item['display']));
                    }
               });
          }

          let pendingText = '';
          if (!_.isUndefined(pendingFacets[0])) {
               const obj = pendingFacets[0]['facets'];
               _.forEach(obj, function (value, key) {
                    if (value === 'year desc,title asc') {
                         value = getTermFromDictionary(language, 'year_desc_title_asc');
                    } else if (value === 'relevance') {
                         value = getTermFromDictionary(language, 'relevance');
                    } else if (value === 'author asc,title asc') {
                         value = getTermFromDictionary(language, 'author');
                    } else if (value === 'title') {
                         value = getTermFromDictionary(language, 'title');
                    } else if (value === 'days_since_added asc') {
                         value = getTermFromDictionary(language, 'date_purchased_desc');
                    } else if (value === 'callnumber_sort') {
                         value = getTermFromDictionary(language, 'callnumber_sort');
                    } else if (value === 'popularity desc') {
                         value = getTermFromDictionary(language, 'total_checkouts');
                    } else if (value === 'rating desc') {
                         value = getTermFromDictionary(language, 'rating_desc');
                    } else if (value === 'total_holds desc') {
                         value = getTermFromDictionary(language, 'total_holds_desc');
                    } else if (value === 'global') {
                         if (locationGroupedWorkDisplaySettings.superScopeLabel || _.isEmpty(locationGroupedWorkDisplaySettings.superScopeLabel)) {
                              value = locationGroupedWorkDisplaySettings.superScopeLabel;
                         } else if (libraryGroupedWorkDisplaySettings.superScopeLabel || _.isEmpty(libraryGroupedWorkDisplaySettings.superScopeLabel)) {
                              value = libraryGroupedWorkDisplaySettings.superScopeLabel;
                         }
                    } else if (value === 'local') {
                         if (locationGroupedWorkDisplaySettings.localLabel || _.isEmpty(locationGroupedWorkDisplaySettings.localLabel)) {
                              value = locationGroupedWorkDisplaySettings.localLabel;
                         } else if (libraryGroupedWorkDisplaySettings.localLabel || _.isEmpty(libraryGroupedWorkDisplaySettings.localLabel)) {
                              value = libraryGroupedWorkDisplaySettings.localLabel;
                         }
                    } else if (value === 'available') {
                         if (locationGroupedWorkDisplaySettings.availableLabel || _.isEmpty(locationGroupedWorkDisplaySettings.availableLabel)) {
                              value = locationGroupedWorkDisplaySettings.availableLabel;
                         } else if (libraryGroupedWorkDisplaySettings.availableLabel || _.isEmpty(libraryGroupedWorkDisplaySettings.availableLabel)) {
                              value = libraryGroupedWorkDisplaySettings.availableLabel;
                         }
                    } else if (value === 'available_online') {
                         if (locationGroupedWorkDisplaySettings.availableOnlineLabel || _.isEmpty(locationGroupedWorkDisplaySettings.availableOnlineLabel)) {
                              value = locationGroupedWorkDisplaySettings.availableOnlineLabel;
                         } else if (libraryGroupedWorkDisplaySettings.availableOnlineLabel || _.isEmpty(libraryGroupedWorkDisplaySettings.availableOnlineLabel)) {
                              value = libraryGroupedWorkDisplaySettings.availableOnlineLabel;
                         }
                    } else {
                         // do nothing
                    }
                    if (pendingText.length === 0) {
                         pendingText = pendingText.concat(_.toString(value));
                    } else {
                         pendingText = pendingText.concat(', ', _.toString(value));
                    }
               });
          }

          if (!_.isEmpty(text) || !_.isEmpty(pendingText)) {
               if (!_.isEmpty(pendingText) && _.isEmpty(text)) {
                    return <Text italic color={textColor}>{pendingText}</Text>;
               } else if (!_.isEmpty(pendingText) && !_.isEmpty(text)) {
                    return <Text italic color={textColor}>{pendingText}</Text>;
               } else {
                    return <Text color={textColor}>{text}</Text>;
               }
          } else {
               return null;
          }
     };

     const actionButtons = () => {
          return (
               <Box p="$3" bgColor={colorMode === 'light' ? theme['colors']['coolGray']['50'] : theme['colors']['coolGray']['700']}  shadowOpacity={0.2} shadowRadius={1}>
                    <Center>
                         <ButtonGroup size="lg">
                              <Button variant="link" onPress={() => clearSelections()}>
                                   <ButtonText color={theme['colors']['primary']['500']}>{getTermFromDictionary(language, 'reset_all')}</ButtonText>
                              </Button>
                              <Button
                                   bgColor={theme['colors']['primary']['500']}
                                   isDisabled={loading}
                                   onPress={() => {
                                        setLoading(true);
                                        updateSearch();
                                   }}>
                                   <ButtonText color={theme['colors']['primary']['500-text']}>{loading ? getTermFromDictionary(language, 'updating', true) : getTermFromDictionary(language, 'update')}</ButtonText>
                              </Button>
                         </ButtonGroup>
                    </Center>
               </Box>
          );
     };

     const openCluster = (cluster) => {
          const obj = SEARCH.availableFacets[cluster];
          navigation.navigate('Facet', {
               data: cluster,
               defaultValues: [],
               title: obj['label'],
               key: obj['value'],
               term: '',
               facets: obj.facets,
               pendingUpdates: [],
               extra: obj,
          });
     };

     const openSearchSources = () => {
          navigation.navigate('SearchSource');
     };

     const openSearchIndexes = () => {
          navigation.navigate('SearchIndex');
     };

     const updateSearch = () => {
          const params = buildParamsForUrl();
          SEARCH.hasPendingChanges = false;
          navigation.navigate('BrowseTab', {
               screen: 'SearchResults',
               params: {
                    term: SEARCH.term,
                    pendingParams: params,
               },
          });
     };

     const discardChanges = () => {
          SEARCH.hasPendingChanges = false;
          SEARCH.appliedFilters = [];
          SEARCH.sortMethod = 'relevance';
          SEARCH.availableFacets = [];
          SEARCH.pendingFilters = [];
          SEARCH.appendedParams = '';

          navigation.navigate('BrowseTab', {
               screen: 'SearchResults',
               params: {
                    term: SEARCH.term,
                    pendingParams: '',
               },
          });
     };

     const clearSelections = () => {
          SEARCH.hasPendingChanges = false;
          SEARCH.appliedFilters = [];
          SEARCH.sortMethod = 'relevance';
          SEARCH.availableFacets = [];
          SEARCH.pendingFilters = [];
          SEARCH.appendedParams = '';

          navigation.navigate('BrowseTab', {
               screen: 'SearchResults',
               params: {
                    term: SEARCH.term,
                    pendingParams: '',
               },
          });
     };

     const clearSearch = () => {
          setSearchTerm('');
     };

     const openScanner = async () => {
          navigateStack('BrowseTab', 'Scanner');
     };

     const search = async () => {
          navigateStack('BrowseTab', 'SearchResults', {
               term: searchTerm,
               type: 'catalog',
               prevRoute: 'DiscoveryScreen',
               scannerSearch: false,
          });
     };

     const getSearchIndexLabel = () => {
          if (currentIndex === 'Title') {
               return getTermFromDictionary(language, 'title');
          } else if (currentIndex === 'StartOfTitle') {
               return getTermFromDictionary(language, 'start_of_title');
          } else if (currentIndex === 'Series') {
               return getTermFromDictionary(language, 'series');
          } else if (currentIndex === 'Author') {
               return getTermFromDictionary(language, 'author');
          } else if (currentIndex === 'Subject') {
               return getTermFromDictionary(language, 'subject');
          } else if (currentIndex === 'LocalCallNumber') {
               return getTermFromDictionary(language, 'local_call_number');
          } else {
               return getTermFromDictionary(language, 'keyword');
          }
     };

     const getSearchSourceLabel = () => {
          if (currentSource === 'events') {
               return getTermFromDictionary(language, 'events');
          } else {
               return getTermFromDictionary(language, 'library_catalog');
          }
     };

     return (
          <View style={{ flex: 1 }}>
               <ScrollView>
                    <Box p="$5">
                         <VStack space="md">
                              <FormControl>
                                   <Input
                                        borderColor={colorMode === 'light' ? theme['colors']['coolGray']['500'] : theme['colors']['gray']['300']}
                                        color={textColor}
                                        variant="outline"
                                   >
                                        <InputSlot pl="$2">
                                             <InputIcon as={Ionicons} name="search" size="md" color={colorMode === 'light' ? theme['colors']['muted']['800'] : theme['colors']['muted']['50']} />
                                        </InputSlot>
                                        <InputField
                                             returnKeyType="search"
                                             autoCapitalize="none"
                                             onChangeText={(term) => setSearchTerm(term)}
                                             placeholder={getTermFromDictionary(language, 'search')}
                                             onSubmitEditing={search}
                                             value={searchTerm}
                                             color={textColor}
                                        />
                                        <InputSlot pr="$2">
                                             {searchTerm ? (
                                                  <Pressable onPress={() => clearSearch()}>
                                                       <Icon as={MaterialCommunityIcons} name="close-circle" size="xl" color={colorMode === 'light' ? theme['colors']['muted']['800'] : theme['colors']['muted']['50']}  />
                                                  </Pressable>
                                             ) : null}
                                             <Pressable onPress={() => openScanner()} ml="$2">
                                                  <Icon as={Ionicons} name="barcode-outline" size="xl" color={colorMode === 'light' ? theme['colors']['muted']['800'] : theme['colors']['muted']['50']}  />
                                             </Pressable>
                                        </InputSlot>
                                   </Input>
                              </FormControl>
                         </VStack>

                         {!isLoading ? (
                              <>
                                   <Pressable key={0} borderBottomWidth={1} borderColor={colorMode === 'light' ? theme['colors']['coolGray']['200'] : theme['colors']['gray']['600']} py="$5" onPress={() => openSearchIndexes()}>
                                        <VStack alignContent="center">
                                             <HStack justifyContent="space-between" alignItems="center" alignContent="center">
                                                  <VStack>
                                                       <Text bold color={textColor}>{getTermFromDictionary(language, 'search_by')}</Text>
                                                       <Text italic color={textColor}>{getSearchIndexLabel()}</Text>
                                                  </VStack>
                                                  <ChevronRightIcon color={textColor} />
                                             </HStack>
                                        </VStack>
                                   </Pressable>
                                   <Pressable key={1} borderBottomWidth={1}  borderColor={colorMode === 'light' ? theme['colors']['coolGray']['200'] : theme['colors']['gray']['600']} py="$5" onPress={() => openSearchSources()}>
                                        <VStack alignContent="center">
                                             <HStack justifyContent="space-between" alignItems="center" alignContent="center">
                                                  <VStack>
                                                       <Text bold color={textColor}>{getTermFromDictionary(language, 'search_in')}</Text>
                                                       <Text italic color={textColor}>{getSearchSourceLabel()}</Text>
                                                  </VStack>
                                                  <ChevronRightIcon color={textColor} />
                                             </HStack>
                                        </VStack>
                                   </Pressable>
                              </>
                         ) : null}
                         {!isLoading ? facets.map((item, index, array) => renderFilter(item, index)) : <Box mt="$5"><LoadingSpinner /></Box>}
                    </Box>
               </ScrollView>
               {actionButtons()}
          </View>
     );
};
