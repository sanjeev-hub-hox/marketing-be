// ** Type Import
import {
  borderRadius,
  color,
  display,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  margin,
  minHeight,
  padding
} from '@mui/system'
import { OwnerStateThemeType } from './'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

const Accordion = () => {
  // Hook & Var
  const { settings } = useSettings()
  const { skin } = settings

  return {
    MuiAccordion: {
      styleOverrides: {
        root: ({ ownerState, theme }: OwnerStateThemeType) => ({
          padding: '0px 24px',
          backgroundColor: theme.palette.common.white,
          borderBottom: `1px solid ${theme.palette.customColors.text5}`,
          boxShadow: theme.shadows[0],

          '&.tree-vcard': {
            padding: '0px 0px',
            border: '1px solid #e0e0e0',
            '&:first-of-type': {
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8
            },

            '&:last-of-type': {
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8
            },
            '& .MuiCollapse-root': {
              '& .MuiCollapse-wrapper': {
                padding: '0px 0px'
              }
            }
          },

          '&:first-of-type': {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0
          },

          '&:last-of-type': {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          },
          '& .MuiCollapse-root': {
            '& .MuiCollapse-wrapper': {
              padding: '16px 0px'
            }
          },
          '& .MuiButtonBase-root ': {
            '&.MuiAccordionSummary-root.Mui-expanded': {
              marginTop: '-10px',
              marginBottom: '-10px'
            }
          }

          // ...(skin === 'bordered' && {
          //   '&:before': { display: 'none' },
          //   borderLeft: `1px solid ${theme.palette.divider}`,
          //   borderRight: `1px solid ${theme.palette.divider}`,
          //   borderBottom: `1px solid ${theme.palette.divider}`,
          //   '&:first-of-type': { borderTop: `1px solid ${theme.palette.divider}` }
          // }),
          // ...(ownerState.disabled === true && {
          //   backgroundColor: `rgba(${theme.palette.customColors.main}, 0.12)`
          // }),
          // ...(ownerState.expanded === true && {
          //   boxShadow: theme.shadows[skin === 'bordered' ? 0 : 3],
          //   '&:not(:first-of-type)': { borderTop: `1px solid ${theme.palette.divider}` },
          //   ...(skin === 'bordered' && {
          //     '& + .MuiAccordion-root': { borderTop: `1px solid ${theme.palette.divider}` }
          //   })
          // })
        })
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: ({ ownerState, theme }: OwnerStateThemeType) => ({
          minHeight: 50,
          borderRadius: 'inherit',

          ...(ownerState.expanded === true && {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          }),
          '& .MuiAccordionSummary-content': {
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '24px',
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.customColors.mainText,
            '& .title': {
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '24px',
              color: theme.palette.customColors.title
            },
            '& .subTitle': {
              marginLeft: '15px',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
              color: theme.palette.customColors.mainText
            },
            '& .MuiSimpleTreeView-root': {
              '& .MuiTreeItem-root ': {
                '& .MuiTreeItem-content': {
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.common.white
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.common.white
                  }
                }
              }
            }
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            '& .MuiSvgIcon-root': {
              color: theme.palette.customColors.mainText
            }
          },

          '& + .MuiCollapse-root': {
            '& .MuiAccordionDetails-root:first-child': {
              paddingTop: 0
            }
          }
        })

        // content: ({ theme }: OwnerStateThemeType) => ({
        //   margin: `${theme.spacing(2.5)} 0`
        // })
      }
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          fontSize: '10px',
          fontWeight: 400,
          lineHeight: '15px',
          letterSpacing: '0.25px',
          color: theme.palette.customColors.mainText,
          '& .title': {
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '21px',
            color: theme.palette.text.primary,
            marginBottom: '10px'
          },
          '& .caption': {
            fontSize: '10px',
            fontWeight: 400,
            lineHeight: '15px',
            letterSpacing: '0.25px',
            color: theme.palette.customColors.mainText
          }
        })
      }
    }
  }
}

export default Accordion
