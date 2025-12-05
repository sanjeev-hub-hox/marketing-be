// ** Type Import
import { OwnerStateThemeType } from './'

const radio = () => {
  return {
    MuiRadio: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.customColors.mainText,
          '&:hover': {
            backgroundColor: theme.palette.customColors.text6
          },
          '&.Mui-disabled': {
            color: theme.palette.customColors.text5
          },
          '&.Mui-checked': {
            color: theme.palette.customColors.mainText
          },
          '&.MuiRadio-colorPrimary': {
            color: theme.palette.customColors.mainText,
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6
            },
            '&.Mui-disabled': {
              color: theme.palette.customColors.text5
            },
            '&.Mui-checked': {
              color: theme.palette.primary.dark
            }
          },
          '&.MuiRadio-colorSecondary': {
            color: theme.palette.customColors.mainText,
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6
            },
            '&.Mui-disabled': {
              color: theme.palette.customColors.text5
            },
            '&.Mui-checked': {
              color: theme.palette.secondary.main
            }
          }
        })
      }
    }
  }
}

export default radio
