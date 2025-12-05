// ** Type Import
import { OwnerStateThemeType } from './'

const checkbox = () => {
  return {
    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          borderRadius: '0px',
          color: theme.palette.customColors.mainText,
          '&:hover': {
            backgroundColor: theme.palette.customColors.text6,
            borderRadius: '100%'
          },
          '&.Mui-disabled': {
            color: theme.palette.customColors.text3
          },
          '&.Mui-disabled.Mui-checked': {
            color: theme.palette.customColors.text3
          },
          '&.MuiCheckbox-indeterminate': {
            color: theme.palette.customColors.text3
          },
          '&.MuiCheckbox-colorDefault': {
            color: theme.palette.customColors.mainText,
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6,
              borderRadius: '100%'
            },
            '&.Mui-checked': {
              color: theme.palette.customColors.text3
            },
            '&.Mui-disabled': {
              color: theme.palette.customColors.text3
            },
            '&.Mui-disabled.Mui-checked': {
              color: theme.palette.customColors.text3
            },
            '&.MuiCheckbox-indeterminate.Mui-checked': {
              color: theme.palette.customColors.text3
            }
          },
          '&.MuiCheckbox-colorPrimary': {
            color: theme.palette.customColors.mainText,
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6,
              borderRadius: '100%'
            },
            '&.Mui-checked': {
              color: theme.palette.primary.dark
            },
            '&.Mui-disabled': {
              color: theme.palette.customColors.text3
            },
            '&.Mui-disabled.Mui-checked': {
              color: theme.palette.customColors.text3
            },
            '&.MuiCheckbox-indeterminate.Mui-checked': {
              color: theme.palette.customColors.text3
            },
            '&.MuiCheckbox-indeterminate': {
              color: theme.palette.customColors.text3
            }
          },
          '&.MuiCheckbox-colorSecondary': {
            color: theme.palette.customColors.mainText,
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6,
              borderRadius: '100%'
            },
            '&.Mui-checked': {
              color: theme.palette.secondary.main
            },
            '&.Mui-disabled': {
              color: theme.palette.customColors.text3
            },
            '&.Mui-disabled.Mui-checked': {
              color: theme.palette.customColors.text3
            },
            '&.MuiCheckbox-indeterminate.Mui-checked': {
              color: theme.palette.customColors.text3
            },
            '&.MuiCheckbox-indeterminate': {
              color: theme.palette.customColors.text3
            }
          }
        })
      }
    }
  }
}

export default checkbox
