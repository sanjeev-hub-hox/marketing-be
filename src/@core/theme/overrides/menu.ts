// ** Type Imports
import { color, fontSize, fontWeight, lineHeight, maxHeight, padding, width } from '@mui/system'
import { OwnerStateThemeType } from './'
import { Skin } from 'src/@core/layouts/types'

const Menu = (skin: Skin) => {
  const boxShadow = (theme: OwnerStateThemeType['theme']) => {
    if (skin === 'bordered') {
      return theme.shadows[0]
    } else if (theme.palette.mode === 'light') {
      return theme.shadows[8]
    } else return theme.shadows[9]
  }

  return {
    MuiMenu: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '& .MuiMenu-paper': {
            borderRadius: 8,
            padding: '8px 0px',
            minWidth: '121px',
            maxHeight: '304px',
            boxShadow: boxShadow(theme),
            ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
          },
          '& .MuiButtonBase-root.MuiMenuItem-root': {
            color: theme.palette.customColors.mainText,
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            '&:hover': {
              color: theme.palette.customColors.mainText,
              backgroundColor: theme.palette.customColors.surfaeLighterTwo
            }
          },
          '& .MuiListItemIcon-root': {
            color: theme.palette.customColors.text5
          },

          '& .MuiTypography-root.MuiListItemText-primary': {
            color: theme.palette.customColors.mainText,
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0.5px'
          },
          '&.MuiMenu-papercolor': {
            '& .MuiMenu-paper': {
              backgroundColor: theme.palette.customColors.text6,
              border: `1px solid #EBEBEB1F`,
              boxShadow: '0px 2px 12px 0px #0000004E'
            },
            '& .MuiButtonBase-root.MuiMenuItem-root': {
              color: theme.palette.customColors.mainText,
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              '&:hover': {
                color: theme.palette.common.white,
                backgroundColor: theme.palette.customColors.text5
              }
            },
            '& .MuiListItemText-primary': {
              color: theme.palette.customColors.menuItemTextColor,
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
              letterSpacing: '0.5px'
            }
          }
        })
      }
    },
    MuiListItemText: {
      styleOverrides: {
        dense: ({ theme }: OwnerStateThemeType) => ({
          '& .MuiListItemText-primary': {
            color: theme.palette.customColors.mainText,
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0.5px'
          }
        })
      }
    }

    // MuiListItemIcon: {
    //   styleOverrides: {
    //     root: ({ theme }: OwnerStateThemeType) => ({
    //       minWidth: '0 !important',
    //       width:'20px',
    //       height:'19px',
    //       marginRight: theme.spacing(3),
    //       // color: theme.palette.customColors.text5,
    //     })
    //   }
    // },
    // MuiSvgIcon:{
    //   styleOverrides: {
    //     root: ({ theme }: OwnerStateThemeType) => ({
    //       // color: theme.palette.customColors.text5,
    //     })
    //   }
    // },
  }
}

export default Menu
