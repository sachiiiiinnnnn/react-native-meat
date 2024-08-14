import * as Font from 'expo-font';

const loadFonts = async () => {
  await Font.loadAsync({
    'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
    'Roboto-BlackItalic': require('../assets/fonts/Roboto-BlackItalic.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-BoldItalic': require('../assets/fonts/Roboto-BoldItalic.ttf'),
    'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
    'Roboto-LightItalic': require('../assets/fonts/Roboto-LightItalic.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-MediumItalic': require('../assets/fonts/Roboto-MediumItalic.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Thin': require('../assets/fonts/Roboto-Thin.ttf'),
    'Roboto-ThinItalic': require('../assets/fonts/Roboto-ThinItalic.ttf'),
    'RobotoCondensed-Bold': require('../assets/fonts/RobotoCondensed-Bold.ttf'),
    'RobotoCondensed-Light': require('../assets/fonts/RobotoCondensed-Light.ttf'),
    'RobotoCondensed-Regular': require('../assets/fonts/RobotoCondensed-Regular.ttf'),
    'RobotoCondensed-LightItalic': require('../assets/fonts/RobotoCondensed-LightItalic.ttf'),
  });
};

export default loadFonts;
