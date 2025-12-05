// ** Type Import
import { borderRadius, letterSpacing } from '@mui/system'
import { OwnerStateThemeType } from './'

const Avatar = () => {
  return {
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          width: '40px',
          height: '40px',
          borderRadius: '100px',
          fontSize: '16px',
          fontWeight: 500,
          letterSpacing: '0.15px',
          lineHeight: '24px',
          '&.MuiAvatar-colorDefault': {
            color: theme.palette.customColors.mainText,
            backgroundColor: theme.palette.customColors.surfaeLighterTwo
          },
          '&.MuiAvatar-colorDefault.primary': {
            color: theme.palette.common.white,
            backgroundColor: theme.palette.primary.main
          },
          '&.MuiAvatar-colorDefault.secondary': {
            color: theme.palette.secondary.dark,
            backgroundColor: theme.palette.secondary.main
          }
        }),
        colorDefault: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.customColors.mainText,
          backgroundColor: theme.palette.customColors.surfaeLighterTwo
        }),
        rounded: {
          borderRadius: 8
        }
      }
    },
    MuiAvatarGroup: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '&.pull-up': {
            '& .MuiAvatar-root': {
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              '&:hover': {
                zIndex: 2,
                boxShadow: theme.shadows[3],
                transform: 'translateY(-4px)'
              }
            }
          },
          justifyContent: 'flex-end',
          '.MuiCard-root & .MuiAvatar-root': {
            borderColor: theme.palette.background.paper
          }
        })
      }
    }
  }
}

export default Avatar
