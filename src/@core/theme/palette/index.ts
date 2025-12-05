// ** Type Imports
import { Palette } from '@mui/material'
import { grey } from '@mui/material/colors'
import { Skin } from 'src/@core/layouts/types'

const DefaultPalette = (mode: Palette['mode'], skin: Skin): Palette => {
  // ** Vars
  const whiteColor = '#FFF'
  const lightColor = '76, 78, 100'
  const darkColor = '234, 234, 255'
  const mainColor = mode === 'light' ? lightColor : darkColor

  const defaultBgColor = () => {
    if (skin === 'bordered' && mode === 'light') {
      return whiteColor
    } else if (skin === 'bordered' && mode === 'dark') {
      return '#30334E'
    } else if (mode === 'light') {
      return '#F7F7F9'
    } else return '#282A42'
  }

  return {
    customColors: {
      dark: darkColor,
      main: mainColor,
      light: lightColor,
      darkBg: '#282A42',
      lightBg: '#F0f2f4',

      // bodyBg: mode === 'light' ? '#F5F5F7' : '#F5F5F7', // Same as palette.background.default but doesn't consider bordered skin
      bodyBg: mode === 'light' ? '#F0F2F4' : '#F0F2F4', // Same as palette.background.default but doesn't consider bordered skin
      trackBg: mode === 'light' ? '#F2F2F4' : '#41435C',
      avatarBg: mode === 'light' ? '#F1F1F3' : '#3F425C',
      tooltipBg: mode === 'light' ? '#262732' : '#464A65',
      tableHeaderBg: '#eaeaf1',
      primaryLighter: '#CFD5F1',
      primaryLightest: '#EBEBFA',
      secondaryLighter: '#EBDEE5',
      title: '#212121',
      mainText: '#666666',
      inactive: '#929090',
      disable: '#C9C6C5',
      label: '#535252',
      text1: '#212121',
      text2: '#666666',
      text3: '#A3A3A3',
      text4: '#BDBDBD',
      text5: '#E0E0E0',
      text6: '#EBEBEB',
      text7: '#1B1B23',
      surfaeLighter: '#F7F7F7',
      surfaeLighterTwo: '#F0F2F4',
      chipWarningText: '#881115',
      textLabel: '#626477',
      chipBorder: '#767586',
      disabled: '#F3F0F0',
      disableBorder: '#49454F1F',
      chipHoverBackground: '#FCF8FF',
      chipTonalBackground: '#F4F0EF',
      dividerColor: '#C7C4D7',
      badgeColorDefault: '#B3234B',
      sliderMainColor: '#3635C9',
      sliderSecColor: '#5D5FEF',
      sliderLabelColor: '#302F39',
      sliderLabelTextColor: '#F2EFFB',
      datepickerText: '#464555',
      primarySuperLight: '#3F41D114',
      menuItemTextColor: '#434343',
      chipPendingContainer: '#FF950033',
      chipPendingText: '#FF9500',
      chipWarningContainer: '#E6393E33',
      surface1: '#F7F7FF',
      customChipColor: '#4849DA',
      customChipBackgroundColor: '#4849DA14',
      customChipSuccessBgColor: '#82BA3D1A',
      approvalPrimaryChipBG: '#4E9EE333',
      approvalPrimaryChipText: '#237ECD'
    },
    mode: mode,
    common: {
      black: '#000',
      white: whiteColor
    },
    primary: {
      light: '#7B7FDE',
      main: '#4B4DD4',
      dark: '#3F41D1',
      contrastText: whiteColor
    },
    secondary: {
      light: '#E8ADBE',
      main: '#E697AB',
      dark: '#310000',
      contrastText: whiteColor
    },
    error: {
      main: '#E6393E',
      dark: '#881115',
      contrastText: whiteColor
    },
    warning: {
      light: '#FDBE42',
      main: '#FDB528',
      dark: '#DF9F23',
      contrastText: whiteColor
    },
    info: {
      light: '#40CDFA',
      main: '#26C6F9',
      dark: '#21AEDB',
      contrastText: whiteColor
    },
    success: {
      light: '#06C27033',
      main: '#06C270',
      dark: '#507326',
      contrastText: whiteColor
    },
    grey: {
      50: '#F3F0F0',
      100: '#767586',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#1D1B201F',
      600: '#757575',
      700: '#1D1B20',
      800: '#424242',
      900: '#212121',
      A100: '#F5F5F5',
      A200: '#EEEEEE',
      A400: '#BDBDBD',
      A700: '#616161'
    },
    text: {
      primary: '#212121',
      secondary: `rgba(${mainColor}, 0.6)`,
      disabled: `rgba(${mainColor}, 0.38)`
    },
    divider: '#C7C4D7',
    background: {
      paper: mode === 'light' ? whiteColor : '#30334E',
      default: defaultBgColor()
    },
    action: {
      active: `rgba(${mainColor}, 0.54)`,
      hover: `rgba(${mainColor}, 0.05)`,
      hoverOpacity: 0.05,
      selected: `rgba(${grey[50]}, 0.08)`,
      disabled: `rgba(${mainColor}, 0.26)`,
      disabledBackground: `rgba(${mainColor}, 0.12)`,
      focus: `rgba(${grey[50]}, 0.12)`
    }
  } as Palette
}

export default DefaultPalette
