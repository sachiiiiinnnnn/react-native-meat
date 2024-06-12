import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

import Images from './Images';

export const COLORS = {

  maroon : '#86062D',
  lightGray3: '#B3AEAF',
  lightred: "#D65E7F",

  darkGreen: '#229879',
  darkLime: '#1A8871',
  lightLime: '#BBD6C5',
  lime: '#2AD699',
  lightGreen: '#E7F9EF',
  lightGreen1: '#8EbCA0',

  white: '#fff',
  white2: '#F9F9F9',
  black: '#020202',
  blue: '#4096FE',
  gray: '#777777',
  gray2: '#F8F8F8',
  lightGray: '#F5F6FB',
  lightGray2: '#757575',

  transparentBlack1: 'rgba(2, 2, 2, 0.1)',
  transparentBlack3: 'rgba(2, 2, 2, 0.3)',
  transparentBlack5: 'rgba(2, 2, 2, 0.5)',
  transparentBlack7: 'rgba(2, 2, 2, 0.7)',
  transparentBlack9: 'rgba(2, 2, 2, 0.9)',

  transparentGray: 'rgba(77,77,77, 0.8)',
  transparentDarkGray: 'rgba(20,20,20, 0.9)',

  transparent: 'transparent',
  
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  h6:19,
  h7:13,
  h8:12,
  h9:12,
  h10:10,
  h11:12,
  h12:13,

  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 14,

  width,
  height
};

export const FONTS = {
  largeTitle: { fontFamily: 'Roboto-Black', fontSize: SIZES.largeTitle },
  h1: { fontFamily: 'Roboto-Black', fontSize: SIZES.h1, lineHeight: 36 },
  h2: { fontFamily: 'Roboto-Bold', fontSize: SIZES.h2, lineHeight: 30 },
  h3: { fontFamily: 'Roboto-Bold-italic', fontSize: SIZES.h3, lineHeight: 22 },
  h4: { fontFamily: 'Roboto-Light', fontSize: SIZES.h4, lineHeight: 22 },
  h5: { fontFamily: 'Roboto-Light',fontSize: SIZES.h4, lineHeight: 20 },
  h6: { fontFamily: 'Roboto-Bold', fontSize: SIZES.h6, lineHeight: 36 },
  h7: { fontFamily: 'Roboto-Light',fontSize: SIZES.h7, lineHeight: 15 },
  h8: { fontFamily: 'Roboto-black', fontSize: SIZES.h8, lineHeight: 30 },
  h9: { fontFamily: 'Roboto-black', fontSize: SIZES.h9, lineHeight: 15 },
  h10: { fontFamily: 'Roboto-Light',fontSize: SIZES.h10, lineHeight: 15 },
  h11: { fontFamily: 'Roboto-black', fontSize: SIZES.h11, lineHeight: 18 },
  h12: { fontFamily: 'Roboto-black', fontSize: SIZES.h12, lineHeight: 18 },

  body1: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body1, lineHeight: 36 },
  body2: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body2, lineHeight: 30 },
  body3: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body3, lineHeight: 22 },
  body4: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body4, lineHeight: 22 },
  body5: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body5, lineHeight: 22 },
  body6: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body1, lineHeight: 36 },
  body7: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body2, lineHeight: 30 },
  body8: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body3, lineHeight: 22 },
  body9: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body4, lineHeight: 22 },
  body0: { fontFamily: 'Roboto-Regular', fontSize: SIZES.body5, lineHeight: 16 },
};

const appTheme = { COLORS, SIZES, FONTS, Images };

export default appTheme;
