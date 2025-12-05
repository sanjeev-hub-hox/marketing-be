// ** Type Import
import { OwnerStateThemeType } from './'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const Progress = () => {
  return {
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          height: 8,
          borderRadius: '64px',

          '&.MuiLinearProgress-colorPrimary': {
            backgroundColor: theme.palette.primary.main
          },
          '&.MuiLinearProgress-colorSecondary': {
            backgroundColor: theme.palette.secondary.main
          },
          '&.MuiLinearProgress-colorSuccess': {
            backgroundColor: theme.palette.success.main
          },
          '&.MuiLinearProgress-colorError': {
            backgroundColor: theme.palette.secondary.main
          },
          '&.MuiLinearProgress-colorWarning': {
            backgroundColor: theme.palette.warning.main
          },
          '&.MuiLinearProgress-colorInfo': {
            backgroundColor: theme.palette.info.main
          }
        }),
        bar: ({ theme }: OwnerStateThemeType) => ({
          borderRadius: '64px',
          backgroundColor: theme.palette.customColors.disable
        })
      }
    }
  }
}

export default Progress
