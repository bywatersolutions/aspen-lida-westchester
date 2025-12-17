import { Button, ButtonGroup, ButtonIcon, ButtonText, FlatList, View, HStack, Pressable, Text, SafeAreaView, Box, Badge, BadgeText } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import _ from 'lodash';
import React from 'react';

import { LanguageContext, LibrarySystemContext, ThemeContext } from '../../context/initialContext';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

const DisplayBrowseCategory = (props) => {
     const { theme } = React.useContext(ThemeContext);
     const { language } = React.useContext(LanguageContext);

     const category = props.category;
     const subCategories = category.subCategories ?? [];
     const records = category.records ?? [];

     const [selectedSubCategoryIndex, setSelectedSubCategoryIndex] = React.useState(0);

     const handleSelectSubCategory = (index) => setSelectedSubCategoryIndex(index);

     const showSubCategoryRecords =
          subCategories.length > 0 && subCategories[selectedSubCategoryIndex]?.records?.length > 0;

     const maxItems = 7;

     const hasMore = records.length > maxItems;
     const displayedData = hasMore ? records.slice(0, maxItems) : records;

     let subCategoryRecords = [];
     let subCategoryHasMore = false;
     if (showSubCategoryRecords) {
          const allRecords = subCategories[selectedSubCategoryIndex].records;
          subCategoryHasMore = allRecords.length > maxItems;
          subCategoryRecords = subCategoryHasMore ? allRecords.slice(0, maxItems) : allRecords;
     }

     return (
          <SafeAreaView>
               <View pb="$3">
                    <HStack space="$3" alignItems="center" justifyContent="space-between" pb="$2">
                         <DisplayBrowseCategoryTitle category={category.label} id={category.textId} />
                         {subCategories.length > 0 ? (
                              <Button variant="outline" size="xs" borderColor={theme['colors']['primary']['500']} sx={{ paddingHorizontal: 6, paddingVertical: 0, height: 24 }}>
                                   <ButtonIcon as={MaterialIcons} name="close" color={theme['colors']['primary']['500']} mr="$1" />
                                   <ButtonText color={theme['colors']['primary']['500']}>{getTermFromDictionary(language, 'hide_all')}</ButtonText>
                              </Button>
                         ) : (
                              <Button variant="outline" size="xs" borderColor={theme['colors']['primary']['500']} sx={{ paddingHorizontal: 6, paddingVertical: 0, height: 24 }}>
                                   <ButtonIcon as={MaterialIcons} name="close" color={theme['colors']['primary']['500']} mr="$1" />
                                   <ButtonText color={theme['colors']['primary']['500']}>{getTermFromDictionary(language, 'hide')}</ButtonText>
                              </Button>
                         )}
                    </HStack>
                    {subCategories.length > 0 ? (
                         <>
                              <ScrollView horizontal>
                                   <DisplaySubCategoryBar subCategories={subCategories} selectedIndex={selectedSubCategoryIndex} onSelect={handleSelectSubCategory} />
                              </ScrollView>
                              {showSubCategoryRecords && <FlatList pb="$8" data={subCategoryRecords} keyExtractor={(item, index) => item.key?.toString() ?? index.toString()} horizontal renderItem={({ item }) => <DisplayBrowseCategoryRecord record={item} />} ListFooterComponent={subCategoryHasMore ? <DisplayMoreResultsButton /> : null} />}
                         </>
                    ) : records.length > 0 ? (
                         <FlatList pb="$8" data={displayedData} keyExtractor={(item, index) => item.id?.toString() ?? index.toString()} horizontal renderItem={({ item }) => <DisplayBrowseCategoryRecord record={item} />} ListFooterComponent={hasMore ? <DisplayMoreResultsButton /> : null} />
                    ) : null}
               </View>
          </SafeAreaView>
     );
};

const DisplayBrowseCategoryTitle = ({category, id}) => {
     const { colorMode, theme } = React.useContext(ThemeContext);
     return (
          <Text
               color={colorMode === 'light' ? theme['colors']['gray']['800'] : theme['colors']['coolGray']['200']}
               bold
               maxWidth="80%"
               mb="$1"
               sx={{
               '@base': {
                    fontSize: 20,
               },
               '@lg': {
                    fontSize: 26,
               },
          }}>
               {category}
          </Text>
     );
}

const DisplayBrowseCategoryRecord = ({record}) => {
     const { library } = React.useContext(LibrarySystemContext);
     const { theme } = React.useContext(ThemeContext);
     const { language } = React.useContext(LanguageContext);

     let type = 'grouped_work';
     if (!_.isUndefined(record.source)) {
          if (record.source === 'library_calendar' || record.source === 'springshare_libcal' || record.source === 'communico' || record.source === 'assabet') {
               type = 'Event';
          } else {
               type = record.source;
          }
     }

     if (!_.isUndefined(record.recordtype)) {
          type = record.recordtype;
     }

     let id = record.key ?? record.id;
     if (type === 'Event') {
          if (_.includes(id, 'lc_')) {
               type = 'library_calendar_event';
          }
          if (_.includes(id, 'libcal_')) {
               type = 'springshare_libcal_event';
          }
          if (_.includes(id, 'communico_')) {
               type = 'communico_event';
          }
          if (_.includes(id, 'assabet_')) {
               type = 'assabet_event';
          }
          if (_.includes(id, 'aspenEvent_')) {
               type = 'aspenEvent_event';
          }
     }

     if(type !== 'aspenEvent_event') {
          type = type.toLowerCase();
     }

     const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';
     const imageUrl = library.baseUrl + '/bookcover.php?id=' + id + '&size=medium&type=' + type;

     let isNew = false;
     if (typeof record.isNew !== 'undefined') {
          isNew = record.isNew;
     }

     return (
          <Pressable
               ml="$1"
               mr="$3"
               sx={{
                    '@base': {
                         width: 100,
                         height: 150,
                    },
                    '@lg': {
                         width: 180,
                         height: 250,
                    },
               }}>
               <Image
                    alt={record.title_display ?? record.title}
                    source={imageUrl}
                    style={{
                         width: '100%',
                         height: '100%',
                         borderRadius: 4,
                    }}
                    placeholder={blurhash}
                    transition={1000}
                    contentFit="cover"
               />
               {isNew ? (
                    <Box zIndex={1} alignItems="center">
                         <Badge bgColor={theme['colors']['warning']['500']} mx={5} mt={-8}>
                              <BadgeText bold color={theme['colors']['white']} textTransform="none">
                                   {getTermFromDictionary(language, 'flag_new')}
                              </BadgeText>
                         </Badge>
                    </Box>
               ) : null}
          </Pressable>
     )
}

const DisplaySubCategoryBar = ({ subCategories, selectedIndex, onSelect }) => {
     const { theme, textColor, colorMode } = React.useContext(ThemeContext);

     return (
         <ButtonGroup vertical space="sm" pb="$2">
                {subCategories.map((subCategory, index) => (
                     <Button key={index}
                             bgColor={selectedIndex === index ? theme['colors']['primary']['500'] : theme['colors']['primary']['200'] }
                             variant="solid"
                             sx={{ paddingHorizontal: 12, height: 34 }}
                             onPress={() => onSelect(index)}>
                          <ButtonText fontWeight="$medium" color={theme['colors']['primary']['500-text']} >
                               {subCategory.label}
                          </ButtonText>
                          <ButtonIcon as={MaterialIcons} name="close" size="sm" color={theme['colors']['primary']['500-text']} ml="$4" />
                     </Button>
                ))}
         </ButtonGroup>
     )
}

const DisplayMoreResultsButton = ({ onPress }) => {
     const { theme, textColor, colorMode } = React.useContext(ThemeContext);
     const { language } = React.useContext(LanguageContext);

     return (
          <Pressable
               ml="$1"
               alignItems="center"
               justifyContent="center"
               mr="$3"
               bgColor={theme['colors']['primary']['500']}
               style={{
                    borderRadius: 4,
               }}
               sx={{
                    '@base': {
                         width: 100,
                         height: 150,
                    },
                    '@lg': {
                         width: 180,
                         height: 250,
                    },
               }}>
               <Text bold color={theme['colors']['primary']['500-text']}>{getTermFromDictionary(language, 'view_more')}</Text>
          </Pressable>
     )
}

export default DisplayBrowseCategory;