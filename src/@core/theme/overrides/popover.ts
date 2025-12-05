// ** Type Imports

import { fontSize, fontWeight, letterSpacing, lineHeight, textAlign } from '@mui/system'
import { OwnerStateThemeType } from './'
import { Skin } from 'src/@core/layouts/types'

const Popover = (skin: Skin) => {
  return {
    MuiPopover: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '& .MuiPopover-paper': {
            borderRadius: '8px',
            padding: '16px',
            textDecoration: 'none',
            boxShadow: theme.shadows[skin === 'bordered' ? 0 : 6],
            ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` }),

            '& .MuiTypography-root': {
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              '& a': {
                textDecoration: 'none',
                color: theme.palette.primary.main
              }
            }
          },

          '&.dropDown': {
            '& .MuiPopover-paper': {
              '& .MuiTypography-root': {
                fontSize: '16px ',
                fontWeight: 400,
                lineHeight: '24px',
                letterSpacing: '0.5px',
                textAlign: 'center',
                '& a': {
                  textDecoration: 'none',
                  color: theme.palette.text.primary
                }
              }
            }
          }
        })
      }
    }
  }
}

export default Popover
