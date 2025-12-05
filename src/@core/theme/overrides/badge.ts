// ** Type Import
import { letterSpacing } from '@mui/system'
import { OwnerStateThemeType } from './'

const badge = () => {
  return {
    MuiBadge: {
      styleOverrides: {
        badge: ({ theme }: OwnerStateThemeType) => ({
          fontSize: '11px',
          lineHeight: '16px',
          fontWeight: 500,
          letterSpacing: '0.5px',
          boxShadow: '0px !important',
          backgroundColor: 'transperent',
          '&.MuiBadge-dot': {
            width: '6px',
            height: '6px',
            minWidth: '6px',
            borderRadius: '50px',
            backgroundColor: theme.palette.customColors.badgeColorDefault,
            color: theme.palette.common.white,
            '&.MuiBadge-colorPrimary': {
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.common.white
            },
            '&.MuiBadge-colorSecondary': {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.dark
            },
            '&.MuiBadge-colorInfo': {
              backgroundColor: theme.palette.info.main,
              color: theme.palette.common.white
            },
            '&.MuiBadge-colorSuccess': {
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.dark
            },
            '&.MuiBadge-colorError': {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.customColors.title
            }
          },
          '&.MuiBadge-standard': {
            fontSize: '11px',
            lineHeight: '16px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            width: '16px',
            height: '16px',
            minWidth: '16px',
            borderRadius: '50px',
            padding: '0px 4px',
            backgroundColor: theme.palette.customColors.badgeColorDefault,
            color: theme.palette.common.white,
            '&.MuiBadge-colorPrimary': {
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.common.white
            },
            '&.MuiBadge-colorSecondary': {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.dark
            },
            '&.MuiBadge-colorInfo': {
              backgroundColor: theme.palette.info.main,
              color: theme.palette.common.white
            },
            '&.MuiBadge-colorSuccess': {
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.dark
            },
            '&.MuiBadge-colorError': {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.dark
            }
          }
        })
      }
    }
  }
}

export default badge
