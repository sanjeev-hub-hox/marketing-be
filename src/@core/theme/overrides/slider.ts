// ** Type Import
import { OwnerStateThemeType } from './'

const slider = () => {
  return {
    MuiSlider: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          borderRadius: '16px',
          height: '16px',

          // color: theme.palette.customColors.sliderMainColor,

          // '&.MuiSlider-colorSecondary .MuiSlider-rail': {
          //   backgroundColor: `theme.palette.grey[500] !important`
          // },
          // '&.MuiSlider-colorSecondary .MuiSlider-thumb.MuiSlider-thumbColorPrimary': {
          //   width: '4px',
          //   height: '44px',
          //   borderRadius: '2px',
          //   backgroundColor: theme.palette.customColors.text7,
          //   '&:hover': {
          //     borderRadius: '4px',
          //     boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
          //   },
          //   '&.Mui-focusVisible': {
          //     borderRadius: '4px',
          //     boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
          //   },
          //   '& .MuiSlider-valueLabel': {
          //     width: '48px',
          //     height: '44px',
          //     borderRadius: '100px',
          //     padding: '12px 16px',
          //     backgroundColor: theme.palette.customColors.sliderLabelColor,
          //     '&:before': {
          //       display: 'none'
          //     },
          //     '& .MuiSlider-valueLabelLabel': {
          //       fontSize: '14px',
          //       lineHeight: '20px',
          //       letterSpacing: '0.1px',
          //       fontWeight: 500,
          //       textAlign: 'center',
          //       color: theme.palette.customColors.sliderLabelTextColor
          //     }
          //   }
          // },
          // '&.MuiSlider-colorSecondary .MuiSlider-mark': {
          //   width: '4px',
          //   height: '4px',
          //   borderRadius: '50px',
          //   backgroundColor: theme.palette.grey[500]
          // },
          '&.MuiSlider-colorPrimary:not(.Mui-disabled)': {
            color: `${theme.palette.customColors.sliderMainColor} !important`,
            '& .MuiSlider-rail': {
              backgroundColor: theme.palette.primary.main
            },
            '& .MuiSlider-track': {
              backgroundColor: `${theme.palette.primary.main} !important`
            },
            '& .MuiSlider-thumb.MuiSlider-thumbColorPrimary': {
              width: '4px',
              height: '44px',
              borderRadius: '2px',
              backgroundColor: theme.palette.primary.dark,
              '&:hover': {
                borderRadius: '4px',
                boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
              },
              '&.Mui-focusVisible': {
                borderRadius: '4px',
                boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
              },
              '& .MuiSlider-valueLabel': {
                width: '48px',
                height: '44px',
                borderRadius: '100px',
                padding: '12px 16px',
                backgroundColor: theme.palette.customColors.mainText,
                '&:before': {
                  display: 'none'
                },
                '& .MuiSlider-valueLabelLabel': {
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0.1px',
                  fontWeight: 500,
                  textAlign: 'center',
                  color: theme.palette.common.white
                }
              }
            },
            '& .MuiSlider-mark': {
              width: '4px',
              height: '4px',
              borderRadius: '50px',
              backgroundColor: theme.palette.primary.dark
            },
            '& .MuiSlider-mark.MuiSlider-markActive': {
              width: '4px',
              height: '4px',
              borderRadius: '50px',
              backgroundColor: `${theme.palette.primary.main} !important`
            }
          },
          '&.Mui-disabled': {
            color: `${theme.palette.grey[500]} !important`,
            '& .MuiSlider-rail': {
              backgroundColor: `${theme.palette.grey[300]} !important`
            },
            '& .MuiSlider-track': {
              opacity: '38%',
              backgroundColor: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiSlider-thumb.Mui-disabled': {
              width: '4px',
              height: '44px',
              borderRadius: '2px',
              backgroundColor: theme.palette.customColors.mainText,
              '&:hover': {
                borderRadius: '4px !important',
                boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
              },
              '&.Mui-focusVisible': {
                borderRadius: '4px !important',
                boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
              },
              '& .MuiSlider-valueLabel': {
                width: '48px',
                height: '44px',
                borderRadius: '100px',
                padding: '12px 16px',
                backgroundColor: theme.palette.customColors.sliderLabelColor,
                '&:before': {
                  display: 'none'
                },
                '& .MuiSlider-valueLabelLabel': {
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0.1px',
                  fontWeight: 500,
                  textAlign: 'center',
                  color: theme.palette.customColors.sliderLabelTextColor
                }
              }
            },
            '& .MuiSlider-mark': {
              width: '4px',
              height: '4px',
              borderRadius: '50px',
              backgroundColor: `${theme.palette.customColors.mainText} !important`
            },
            '& .MuiSlider-mark.MuiSlider-markActive': {
              width: '4px',
              height: '4px',
              borderRadius: '50px',
              backgroundColor: `${theme.palette.common.white} !important`
            }
          },
          '&.MuiSlider-colorSecondary:not(.Mui-disabled.MuiSlider-colorPrimary)': {
            color: `${theme.palette.grey[500]} !important`,
            '& .MuiSlider-rail': {
              backgroundColor: `${theme.palette.grey[500]} !important`
            },
            '& .MuiSlider-track': {
              opacity: '38%',
              backgroundColor: `${theme.palette.grey[700]} !important`
            },
            '& .MuiSlider-thumb.MuiSlider-thumbColorSecondary': {
              width: '4px',
              height: '44px',
              borderRadius: '2px',
              backgroundColor: `${theme.palette.customColors.text7} !important`,
              '&:hover': {
                borderRadius: '4px !important',
                boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
              },
              '&.Mui-focusVisible': {
                borderRadius: '4px !important',
                boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
              },
              '& .MuiSlider-valueLabel': {
                width: '48px',
                height: '44px',
                borderRadius: '100px',
                padding: '12px 16px',
                backgroundColor: theme.palette.customColors.sliderLabelColor,
                '&:before': {
                  display: 'none'
                },
                '& .MuiSlider-valueLabelLabel': {
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0.1px',
                  fontWeight: 500,
                  textAlign: 'center',
                  color: theme.palette.customColors.sliderLabelTextColor
                }
              }
            },
            '& .MuiSlider-mark': {
              width: '4px',
              height: '4px',
              borderRadius: '50px',
              backgroundColor: `${theme.palette.grey[500]} !important`
            }
          }
        })
      }
    }
  }
}

export default slider
