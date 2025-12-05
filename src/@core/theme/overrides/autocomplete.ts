// ** Type Imports

import { color, display, fontSize, fontWeight, height, lineHeight } from '@mui/system'
import { OwnerStateThemeType } from './'
import { Skin } from 'src/@core/layouts/types'

const Autocomplete = (skin: Skin) => {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        paper: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.customColors.mainText,
          fontSize: '16px',
          fontWeight: 400
        }),
        root: ({ theme }: OwnerStateThemeType) => ({
          '& .MuiInputBase-root.MuiOutlinedInput-root': {
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'noWrap',
            '& .MuiAutocomplete-endAdornment': {
              top: '5px'
            },
            '& span': {
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '21px',
              color: theme.palette.customColors.mainText
            }
          }
        })
      }
    }
  }
}

export default Autocomplete
