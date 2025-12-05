// ** Type Imports

import { OwnerStateThemeType } from './'
import { Skin } from 'src/@core/layouts/types'

const Card = (skin: Skin) => {
  return {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          borderRadius: '12px',

          '&.MuiPaper-outlined': {
            backgroundColor: theme.palette.customColors.surfaeLighter,
            border: `1px solid rgba(73, 69, 79, 0.12)`,
            '& .MuiCardHeader-avatar': {
              '& .MuiAvatar-root': {
                width: '40px',
                height: '40px',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.customColors.chipHoverBackground,
                fontSize: '16px',
                fontWeight: 500,
                letterSpacing: '0.15px',
                textAlign: 'center'
              }
            },
            '& .MuiCardHeader-title': {
              fontSize: '16px !important',
              lineHeight: '24px !important',
              fontWeight: 500,
              letterSpacing: '0.15px !important',
              color: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiCardHeader-subheader': {
              fontSize: '14px !important',
              lineHeight: '20px !important',
              fontWeight: 400,
              letterSpacing: '0.25px !important',
              color: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiTypography-h5': {
              fontSize: '16px !important',
              lineHeight: '24px !important',
              fontWeight: 400,
              letterSpacing: '0.5px !important',
              color: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiTypography-body2': {
              fontSize: '14px !important',
              lineHeight: '21px !important',
              fontWeight: 400,
              color: `${theme.palette.customColors.mainText} !important`
            }
          },

          '&.MuiPaper-elevation': {
            backgroundColor: theme.palette.customColors.primaryLightest,
            boxShadow: theme.shadows[1],
            border: `0px`,
            '& .MuiCardHeader-avatar': {
              '& .MuiAvatar-root': {
                width: '40px',
                height: '40px',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.customColors.chipHoverBackground,
                fontSize: '16px',
                fontWeight: 500,
                letterSpacing: '0.15px',
                textAlign: 'center'
              }
            },
            '& .MuiCardHeader-title': {
              fontSize: '16px !important',
              lineHeight: '24px !important',
              fontWeight: 500,
              letterSpacing: '0.15px !important',
              color: `${theme.palette.customColors.text7} !important`
            },
            '& .MuiCardHeader-subheader': {
              fontSize: '14px !important',
              lineHeight: '20px !important',
              fontWeight: 400,
              letterSpacing: '0.25px !important',
              color: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiTypography-h5': {
              fontSize: '16px !important',
              lineHeight: '24px !important',
              fontWeight: 400,
              letterSpacing: '0.5px !important',
              color: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiTypography-body2': {
              fontSize: '14px !important',
              lineHeight: '21px !important',
              fontWeight: 400,
              color: `${theme.palette.customColors.mainText} !important`
            }
          },
          '&.filled.MuiPaper-elevation': {
            backgroundColor: theme.palette.customColors.surfaeLighterTwo,
            boxShadow: theme.shadows[0],
            border: `0px`,
            '& .MuiCardHeader-avatar': {
              '& .MuiAvatar-root': {
                width: '40px',
                height: '40px',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.customColors.chipHoverBackground,
                fontSize: '16px',
                fontWeight: 500,
                letterSpacing: '0.15px',
                textAlign: 'center'
              }
            },
            '& .MuiCardHeader-title': {
              fontSize: '16px !important',
              lineHeight: '24px !important',
              fontWeight: 500,
              letterSpacing: '0.15px !important',
              color: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiCardHeader-subheader': {
              fontSize: '14px !important',
              lineHeight: '20px !important',
              fontWeight: 400,
              letterSpacing: '0.25px !important',
              color: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiTypography-h5': {
              fontSize: '16px !important',
              lineHeight: '24px !important',
              fontWeight: 400,
              letterSpacing: '0.5px !important',
              color: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiTypography-body2': {
              fontSize: '14px !important',
              lineHeight: '21px !important',
              fontWeight: 400,
              color: `${theme.palette.customColors.mainText} !important`
            }
          }

          // ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` }),
          // '& .card-more-options': {
          //   marginTop: theme.spacing(-1),
          //   marginRight: theme.spacing(-3)
          // },
          // '& .MuiTableContainer-root, & .MuiDataGrid-root, & .MuiDataGrid-columnHeaders': {
          //   borderRadius: 0
          // }
        })
      },
      defaultProps: {
        elevation: skin === 'bordered' ? 0 : 6
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          padding: '12px 4px 12px 16px'

          // '& + .MuiCardContent-root, & + .MuiCardActions-root, & + .MuiCollapse-root .MuiCardContent-root': {
          //   paddingTop: 0
          // }
        }),

        // title: {
        //   lineHeight: 1.6,
        //   fontWeight: 500,
        //   fontSize: '1.125rem',
        //   letterSpacing: '0.15px',
        //   '@media (min-width: 600px)': {
        //     fontSize: '1.25rem'
        //   }
        // },
        action: {
          marginTop: 0,
          marginRight: 0
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          padding: '16px'

          // '& + .MuiCardHeader-root, & + .MuiCardContent-root, & + .MuiCardActions-root': {
          //   paddingTop: 0
          // },
          // '&:last-of-type': {
          //   paddingBottom: theme.spacing(5)
          // }
        })
      }
    },
    MuiCardActions: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          padding: theme.spacing(5),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end'

          // '& .MuiButton-text': {
          //   paddingLeft: theme.spacing(2.5),
          //   paddingRight: theme.spacing(2.5)
          // },
          // '&.card-action-dense': {
          //   padding: theme.spacing(0, 2.5, 2.5),
          //   '.MuiCard-root .MuiCardMedia-root + &': {
          //     paddingTop: theme.spacing(2.5)
          //   }
          // },
          // '.MuiCard-root &:first-of-type': {
          //   paddingTop: theme.spacing(2.5),
          //   '& + .MuiCardHeader-root, & + .MuiCardContent-root, & + .MuiCardActions-root': {
          //     paddingTop: 0
          //   }
          // }
        })
      }
    }
  }
}

export default Card
