import { useNavigation } from '@react-navigation/native';
import { AlertDialog, AlertDialogBackdrop,
     AlertDialogContent,
     AlertDialogHeader,
     AlertDialogBody,
     AlertDialogFooter, Button, ButtonText, ButtonGroup, Text, Heading, Center, CloseIcon, Pressable } from '@gluestack-ui/themed';
import React from 'react';

import { SearchGlobal } from '../../util/globals';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { ThemeContext } from '../../context/initialContext';

export const UnsavedChangesExit = (props) => {
     const { updateSearch, discardChanges, prevRoute, language } = props;
     const { theme, colorMode, textColor } = React.useContext(ThemeContext);
     const navigation = useNavigation();
     const [isOpen, setIsOpen] = React.useState(false);
     const onClose = () => setIsOpen(false);
     const cancelRef = React.useRef(null);

     function getStatus() {
          const hasPendingChanges = SearchGlobal.hasPendingChanges;
          if (hasPendingChanges) {
               // if pending changes found, pop alert to confirm close
               setIsOpen(true);
          } else {
               // if no pending changes, just close it
               navigation.getParent().pop();
          }
     }

     // update parameters, then go to search results screen
     const updateClose = () => {
          updateSearch(false);
          SearchGlobal.hasPendingChanges = false;
     };

     // remove pending parameters, then go back to original search results screen
     const forceClose = () => {
          discardChanges();
          setIsOpen(false);
          SearchGlobal.hasPendingChanges = false;
          if (prevRoute === 'SearchScreen') {
               navigation.navigate('BrowseTab', {
                    screen: 'SearchResults',
                    params: {
                         term: SearchGlobal.term,
                    },
               });
          } else {
               navigation.getParent().pop();
          }
     };

     return (
          <Center>
               <Pressable onPress={() => getStatus()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} ml="$3">
                    <CloseIcon size="md" color="primary.baseContrast" />
               </Pressable>
               <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                    <AlertDialogBackdrop/>
                    <AlertDialogContent bgColor={colorMode === 'light' ? theme['colors']['warmGray']['50'] : theme['colors']['coolGray']['700']}>
                         <AlertDialogHeader>
                              <Heading color={textColor}>{getTermFromDictionary(language, 'discard_changes')}</Heading>
                         </AlertDialogHeader>
                         <AlertDialogBody>
                              <Text color={textColor}>{getTermFromDictionary(language, 'unsaved_changes_warning')}</Text>
                         </AlertDialogBody>
                         <AlertDialogFooter>
                              <ButtonGroup space="sm">
                                   <Button bgColor={theme['colors']['primary']['500']} onPress={updateClose} ref={cancelRef}>
                                        <ButtonText color={theme['colors']['primary']['500-text']}>{getTermFromDictionary(language, 'save')}</ButtonText>
                                   </Button>
                                   <Button variant="link" onPress={forceClose}>
                                        <ButtonText color={theme['colors']['danger']['500']}>{getTermFromDictionary(language, 'discard')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </AlertDialogFooter>
                    </AlertDialogContent>
               </AlertDialog>
          </Center>
     );
};