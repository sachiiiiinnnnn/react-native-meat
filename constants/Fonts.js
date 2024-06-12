import * as Font from 'expo-font';

const loadFonts = async () => {
  await Font.loadAsync({
    'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
    'Roboto-Black':require('../assets/fonts/Roboto-BlackItalic.ttf'),
    "Roboto-Bold" :require('../assets/fonts/Roboto-Bold.ttf'),
    "Roboto-Bold-italic" :require('../assets/fonts/Roboto-BoldItalic.ttf'),
    "Roboto-Light" :require('../assets/fonts/Roboto-Light.ttf'),
    "Roboto-Regular" :require('../assets/fonts/Roboto-LightItalic.ttf'),
    "Roboto-Regular" :require('../assets/fonts/Roboto-Medium.ttf'),
    "Roboto-Regular" :require('../assets/fonts/Roboto-MediumItalic.ttf'),
    "Roboto-Regular" :require('../assets/fonts/Roboto-Regular.ttf'),
    "Roboto-Regular" :require('../assets/fonts/Roboto-Thin.ttf'),
    "Roboto-Regular" :require('../assets/fonts/Roboto-ThinItalic.ttf'),
    "Roboto-Regular" :require('../assets/fonts/RobotoCondensed-Bold.ttf'),
    "Roboto-Regular" :require('../assets/fonts/RobotoCondensed-Light.ttf'),
    "Roboto-Regular" :require('../assets/fonts/RobotoCondensed-Regular.ttf'),
    "Roboto-Regular" :require('../assets/fonts/RobotoCondensed-LightItalic.ttf'),
  });
};

export default loadFonts;
