import React from 'react';
import { Keyboard } from 'react-native';

/**
 * Custom hook to track keyboard visibility updating state based on keyboard show/hide events and cleaning up listeners on unmount.
 * @returns {boolean}
 */
export function useKeyboard() {
     const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

     React.useEffect(() => {
          const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
               setKeyboardVisible(true);
          });

          const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
               setKeyboardVisible(false);
          });

          return () => {
               keyboardDidHideListener.remove();
               keyboardDidShowListener.remove();
          };
     }, []);

     return isKeyboardVisible;
}
