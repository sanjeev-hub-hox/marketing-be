// ** Type Import
import { fontWeight } from '@mui/system'
import { OwnerStateThemeType } from './'

// ** Util Imports
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const Chip = () => {
  return {
    MuiChip: {
      styleOverrides: {
        root: {
          padding: '6px 0px',
          fontSize: '14px ',
          fontWeight: 400,
          height: '32px',
          textAlign: 'center',
          '& .MuiChip-label': {
            fontSize: '14px ',
            fontWeight: 400,
            lineHeight: '21px'
          },
          '&.MuiChip-rounded': {
            borderRadius: '8px'
          },
          '&.MuiChip-deleteIcon': {
            color: '#333'
          }
        },
        filled: ({ theme }: OwnerStateThemeType) => ({
          // '&.MuiChip-filledDefault.MuiChip-colorDefault': {
          //   borderRadius: '8px',
          //   border: `1px solid ${theme.palette.primary.dark}`,

          //   backgroundColor: theme.palette.customColors.primaryLighter,
          //   color: `${theme.palette.primary.dark}`,

          //   '&.Mui-disabled': {
          //     background: theme.palette.grey[50],
          //     border: `1px solid ${theme.palette.customColors.disableBorder}`,
          //     color: theme.palette.customColors.mainText
          //   },
          //   '&:hover': {
          //     backgroundColor: theme.palette.customColors.chipHoverBackground,
          //     border: `1px solid ${theme.palette.customColors.chipBorder}`,
          //     color: theme.palette.customColors.mainText,
          //     '& .MuiChip-deleteIcon': {
          //       color: theme.palette.customColors.mainText
          //     }
          //   }
          // },
          '&.MuiChip-filledDefault.MuiChip-colorDefault': {
            borderRadius: '8px',
            border: `1px solid ${theme.palette.customColors.text3}`,

            backgroundColor: theme.palette.common.white,
            color: `${theme.palette.customColors.mainText}`,

            '&.MuiChip-clickable': {
              '& .MuiChip-label': {
                fontWeight: 500
              }
            },

            '&.Mui-disabled': {
              background: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text6}`,
              color: theme.palette.customColors.text3
            },
            '& .MuiChip-deleteIcon': {
              color: theme.palette.customColors.mainText,
              marginLeft: '10px'
            },
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text3}`,
              color: theme.palette.customColors.mainText,
              '& .MuiChip-deleteIcon': {
                color: theme.palette.customColors.mainText,
                marginLeft: '10px'
              }
            }
          },
          '&.MuiChip-filledPrimary.MuiChip-colorPrimary': {
            borderRadius: '8px',
            border: `1px solid ${theme.palette.primary.dark}`,

            backgroundColor: theme.palette.customColors.primaryLightest,
            color: `${theme.palette.primary.dark}`,
            '&.MuiChip-clickable': {
              '& .MuiChip-label': {
                fontWeight: 500
              }
            },

            '&.Mui-disabled': {
              background: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text6}`,
              color: theme.palette.customColors.text3
            },
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text3}`,
              color: theme.palette.customColors.mainText,
              '& .MuiChip-deleteIcon': {
                color: theme.palette.customColors.mainText,
                marginLeft: '10px'
              }
            },
            '& .MuiChip-deleteIcon': {
              color: theme.palette.customColors.mainText,
              marginLeft: '10px'
            }
          },
          '&.MuiChip-filledSecondary.MuiChip-colorSecondary': {
            borderRadius: '8px',
            border: `1px solid ${theme.palette.secondary.main}`,

            backgroundColor: theme.palette.secondary.light,
            color: `${theme.palette.secondary.dark}`,
            '&.MuiChip-clickable': {
              '& .MuiChip-label': {
                fontWeight: 500
              }
            },

            '&.Mui-disabled': {
              background: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text6}`,
              color: theme.palette.customColors.text3
            },
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text3}`,
              color: theme.palette.customColors.mainText,
              '& .MuiChip-deleteIcon': {
                color: theme.palette.customColors.mainText,
                marginLeft: '10px'
              }
            },
            '& .MuiChip-deleteIcon': {
              color: theme.palette.customColors.mainText,
              marginLeft: '10px'
            }
          },

          // '&.MuiChip-filledInfo.MuiChip-colorInfo': {
          //   borderRadius: '8px',
          //   border: `1px solid ${theme.palette.customColors.chipTonalBackground}`,

          //   backgroundColor: theme.palette.customColors.chipTonalBackground,
          //   color: `${theme.palette.customColors.mainText}`,

          //   '&.Mui-disabled': {
          //     background: theme.palette.grey[50],
          //     border: `1px solid ${theme.palette.customColors.disableBorder}`,
          //     color: theme.palette.customColors.mainText
          //   },
          //   '&:hover': {
          //     backgroundColor: theme.palette.customColors.chipHoverBackground,
          //     border: `1px solid ${theme.palette.customColors.chipBorder}`,
          //     color: theme.palette.customColors.mainText,
          //     '& .MuiChip-deleteIcon': {
          //       color: theme.palette.customColors.mainText
          //     }
          //   }
          // },
          '&.MuiChip-filledError.MuiChip-colorError': {
            borderRadius: '8px',
            border: `1px solid ${theme.palette.customColors.chipWarningContainer}`,

            backgroundColor: theme.palette.customColors.chipWarningContainer,
            color: `${theme.palette.error.main}`,
            '&.MuiChip-clickable': {
              '& .MuiChip-label': {
                fontWeight: 500
              }
            },

            '&.Mui-disabled': {
              background: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text6}`,
              color: theme.palette.customColors.text3
            },
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text3}`,
              color: theme.palette.customColors.mainText,
              '& .MuiChip-deleteIcon': {
                color: theme.palette.customColors.mainText,
                marginLeft: '10px'
              }
            },
            '& .MuiChip-deleteIcon': {
              color: theme.palette.customColors.mainText,
              marginLeft: '10px'
            }
          },
          '&.MuiChip-filledSuccess.MuiChip-colorSuccess': {
            borderRadius: '8px',
            border: `1px solid ${theme.palette.success.main}`,
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'center',
            backgroundColor: theme.palette.success.light,
            color: `${theme.palette.success.dark}`,
            '&.MuiChip-clickable': {
              '& .MuiChip-label': {
                fontWeight: 500
              }
            },

            '&.Mui-disabled': {
              background: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text6}`,
              color: theme.palette.customColors.text3
            },
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text3}`,
              color: theme.palette.customColors.mainText,
              '& .MuiChip-deleteIcon': {
                color: theme.palette.customColors.mainText,
                marginLeft: '10px'
              }
            },
            '& .MuiChip-deleteIcon': {
              color: theme.palette.customColors.mainText,
              marginLeft: '10px'
            }
          }
        }),
        outlined: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiChip-colorDefault': {
            borderRadius: '8px',
            borderColor: theme.palette.customColors.text3,
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'center',
            color: theme.palette.customColors.mainText,
            '&.MuiChip-clickable': {
              '& .MuiChip-label': {
                fontWeight: 500
              }
            },

            '&.Mui-disabled': {
              background: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text6}`,
              color: theme.palette.customColors.text3
            },
            '&:hover': {
              backgroundColor: theme.palette.customColors.text6,
              border: `1px solid ${theme.palette.customColors.text3}`,
              color: theme.palette.customColors.mainText,
              '& .MuiChip-deleteIcon': {
                color: theme.palette.customColors.mainText,
                marginLeft: '10px'
              }
            },
            '& .MuiChip-deleteIcon': {
              color: theme.palette.customColors.mainText,
              marginLeft: '10px'
            }
          }
        }),
        avatar: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary
        }),
        deleteIcon: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiChip-deleteIconFilledColorPrimary': {
            color: theme.palette.primary.dark,
            '&:hover': {
              color: theme.palette.customColors.mainText
            }
          },

          '&.MuiChip-deleteIconFilledColorSecondary': {
            color: theme.palette.secondary.main,
            '&:hover': {
              color: theme.palette.customColors.mainText
            }
          },
          '&.MuiChip-deleteIconFilledColorInfo': {
            color: theme.palette.customColors.text6,
            '&:hover': {
              color: theme.palette.customColors.mainText
            }
          },
          '&.MuiChip-deleteIconFilledColorError': {
            color: theme.palette.secondary.main,
            '&:hover': {
              color: theme.palette.customColors.mainText
            }
          }
        }),
        deletableColorPrimary: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiChip-deleteIcon': {
            color: theme.palette.primary.dark,
            '&:hover': {
              color: theme.palette.primary.dark
            }
          }
        }),
        deletableColorSecondary: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: `${theme.palette.primary.dark} !important`,
            '&:hover': {
              color: theme.palette.primary.dark
            }
          }
        }),
        deletableColorSuccess: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: `${theme.palette.primary.dark} !important`,
            '&:hover': {
              color: theme.palette.primary.dark
            }
          }
        }),
        deletableColorError: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: hexToRGBA(theme.palette.error.main, 0.7),
            '&:hover': {
              color: theme.palette.primary.dark
            }
          }
        }),
        deletableColorWarning: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: `${theme.palette.primary.dark} !important`,
            '&:hover': {
              color: theme.palette.primary.dark
            }
          }
        }),
        deletableColorInfo: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiChip-light .MuiChip-deleteIcon': {
            color: `${theme.palette.primary.dark} !important`,
            '&:hover': {
              color: theme.palette.primary.dark
            }
          }
        })
      }
    }
  }
}

export default Chip
