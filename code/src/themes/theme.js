import { MaterialIcons } from '@expo/vector-icons';
import { useToken } from '@gluestack-style/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeftIcon, Box, extendTheme, HStack, Icon, IconButton, Text, useColorMode, useColorModeValue } from 'native-base';
import React from 'react';
import { ThemeContext } from '../context/initialContext';

import { logDebugMessage, logErrorMessage } from '../util/logging.js';
import { getThemeInfo } from '../util/api/system';

export const BackIcon = (props) => {
     const { theme } = React.useContext(ThemeContext);
     return <ChevronLeftIcon size="md" ml={1} {...props} color={theme['colors']['primary']['baseContrast']} />;
};

export async function createTheme(colorMode) {
     const response = await getThemeInfo();
     const theme = extendTheme({
          colors: {
               primary: response[0],
               secondary: response[1],
               tertiary: response[2],
          },
          config: {
               useAccessibleColors: true,
               useSystemColorMode: false,
               initialColorMode: colorMode,
               dependencies: {
                    'linear-gradient': LinearGradient,
               },
          },
     });
     logDebugMessage('Theme created and saved.');
     return theme;
}

export async function createGlueTheme(url) {
     const response = await getThemeInfo(url);
     const theme = extendTheme({
          colors: {
               primary: response[0],
               secondary: response[1],
               tertiary: response[2],
          },
     });
     return theme;
}

export async function saveTheme(response) {
     if (response) {
          const primaryColors = ['primaryColors', JSON.stringify(response.colors.primary)];
          const secondaryColors = ['secondaryColors', JSON.stringify(response.colors.secondary)];
          const tertiaryColors = ['tertiaryColors', JSON.stringify(response.colors.tertiary)];

          try {
               await AsyncStorage.multiSet([primaryColors, secondaryColors, tertiaryColors]).then((r) => {
                    logDebugMessage('Essential colors stored in async storage in theme.js');
               });
          } catch (e) {
               //save error
               logErrorMessage('Unable to save essential colors to async storage in theme.js');
               logErrorMessage(e);
          }
     }else{
          logErrorMessage("No response provided for saving theme");
     }
}

export async function fetchTheme() {
     let colors;
     try {
          colors = await AsyncStorage.multiGet(['primaryColors', 'secondaryColors', 'tertiaryColors']);
          const jsonValue = await AsyncStorage.getItem('primaryColors');
          const parsedJson = JSON.parse(jsonValue);
          logDebugMessage('Essential colors fetched from async storage.');
          return colors;
     } catch (e) {
          logErrorMessage('Unable to fetch essential colors from async storage.');
          logErrorMessage(e);
     }
}

export function UseColorMode(props) {
     const { showText } = props;
     const { toggleColorMode } = useColorMode();
     const currentMode = useColorModeValue('nightlight-round', 'wb-sunny');
     const colorMode = useColorModeValue('dark', 'light');
     const currentColorMode = useColorModeValue('Light', 'Dark');
     const currentModeB = useColorModeValue('wb-sunny', 'nightlight-round');
     const darkText = useToken('colors', 'textLight950');
     const lightText = useToken('colors', 'textLight50');
     const { updateColorMode, updateTextColor } = React.useContext(ThemeContext);

     const switchColorMode = async () => {
          toggleColorMode();
          logDebugMessage('Set colorMode to: ' + colorMode);

          if (colorMode === 'light') {
               updateTextColor(darkText);
          }

          if (colorMode === 'dark') {
               updateTextColor(lightText);
          }

          updateColorMode(colorMode);
          await AsyncStorage.setItem('@colorMode', colorMode);
     };

     if (showText) {
          return (
               <HStack alignItems="center">
                    <IconButton onPress={switchColorMode} icon={<Icon as={MaterialIcons} name={currentModeB} />} borderRadius="full" _icon={{ size: 'sm' }} />
                    <Text fontSize="xs">{currentColorMode}</Text>
               </HStack>
          );
     }

     return (
          <Box alignItems="center">
               <IconButton onPress={switchColorMode} icon={<Icon as={MaterialIcons} name={currentMode} />} borderRadius="full" _icon={{ size: 'sm' }} />
          </Box>
     );
}
