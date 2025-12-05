// ** Type Import
import { color, margin } from '@mui/system'
import { OwnerStateThemeType } from './'

const List = () => {
  return {
    MuiList: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '& .MuiListItem-root': {
            '& .MuiButtonBase-root.MuiListItemButton-root': {
              '&:hover': {
                backgroundColor: theme.palette.common.white
              },
              '& .MuiListItemText-root': {
                '& .MuiListItemText-primary': {
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  letterSpacing: '0.5px',
                  textAlign: 'left',
                  color: theme.palette.customColors.mainText
                },
                '& .MuiListItemText-secondary': {
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  letterSpacing: '0.25px',

                  color: theme.palette.customColors.mainText
                }
              },
              '& .MuiListItemAvatar-root': {
                minWidth: 0,
                marginRight: theme.spacing(4),
                '& .MuiAvatar-circular': {
                  backgroundColor: theme.palette.primary.dark,
                  color: theme.palette.common.white,
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: '24px',
                  letterSpacing: '0.15px'
                }
              }
            }
          }
        })
      }
    }
  }
}

export default List
