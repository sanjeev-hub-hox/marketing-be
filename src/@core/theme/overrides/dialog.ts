// ** Type Imports
import {
  borderRadius,
  color,
  display,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  padding,
  textAlign
} from '@mui/system'
import { OwnerStateThemeType } from './'
import { Skin } from 'src/@core/layouts/types'

const Dialog = (skin: Skin) => {
  return {
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }: OwnerStateThemeType) => ({
          borderRadius: '28px',
          padding: '10px',
          boxShadow: theme.shadows[skin === 'bordered' ? 0 : 10],
          ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` }),
          '&:not(.MuiDialog-paperFullScreen)': {
            [theme.breakpoints.down('sm')]: {
              margin: theme.spacing(4),
              width: `calc(100% - ${theme.spacing(8)})`,
              maxWidth: `calc(100% - ${theme.spacing(8)}) !important`
            }
          },
          '& > .MuiList-root': {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1)
          },
          '& .dialogIcon.MuiBox-root': {
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '25px',
            '& .MuiSvgIcon-root': {
              color: theme.palette.customColors.title,
              fontSize: '24px'
            }
          }
        })
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          fontSize: '24px !important',
          fontWeight: 500,
          lineHeight: '36px',
          color: `${theme.palette.text.primary} !important`,
          padding: theme.spacing(5),
          '& span': {
            fontSize: '12px ',
            fontWeight: 400,
            lineHeight: '18px',
            color: theme.palette.customColors.text3
          }
        })
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          padding: theme.spacing(5),
          '& .MuiDialogContentText-root': {
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            letterSpacing: '0.25px',
            color: theme.palette.customColors.mainText
          },
          '& + .MuiDialogContent-root': {
            paddingTop: 0,
            '&.MuiDialogContentText-root .MuiTypography-root': {
              // fontSize: '14px',
              // fontWeight: 400,
              // lineHeight: '20px',
              // letterSpacing: '0.25px',
              // color: theme.palette.customColors.mainText
              backgroundColor: theme.palette.secondary.dark
            }
          },

          '& + .MuiDialogActions-root': {
            paddingTop: 0
          }
        })
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '21px',
          textAlign: 'center',
          padding: '10px 12px',
          '&.dialog-actions-dense': {
            padding: theme.spacing(2.5),
            paddingTop: 0
          }
        })
      }
    }
  }
}

export default Dialog
