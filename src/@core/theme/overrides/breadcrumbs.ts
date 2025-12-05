// ** Type Import
import { display, fontSize, fontWeight, lineHeight } from '@mui/system'
import { OwnerStateThemeType } from './'

const Breadcrumbs = () => {
  return {
    MuiBreadcrumbs: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          fontSize: '12px',
          fontWeight: 400,

          lineHeight: '18px',
          color: theme.palette.customColors.mainText,
          '& .MuiBreadcrumbs-ol': {
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            '& .MuiBreadcrumbs-li': {
              '& a.MuiTypography-root': {
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '18px',
                color: theme.palette.customColors.mainText
              }
            },
            '&.MuiBreadcrumbs-separator': {
              marginTop: 1
            }
          }
        })
      }
    }
  }
}

export default Breadcrumbs
