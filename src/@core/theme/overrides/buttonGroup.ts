import { OwnerStateThemeType } from './'

export default {
  MuiButtonGroup: {
    styleOverrides: {
      root: ({ theme }: OwnerStateThemeType) => ({
        borderRadius: 8,
        padding: '10px 12px',
        boxShadow: 'none'
      })
    }
  }

  // MuiStepper: {
  //   styleOverrides: {
  //     root: ({ theme }: OwnerStateThemeType) => ({
  //       padding: '16px 24px',
  //       '& .MuiStep-root': {
  //         '& .MuiStepLabel-root': {
  //           '& .MuiStepLabel-iconContainer.Mui-active .MuiSvgIcon-root': {
  //             color: `${theme.palette.primary.dark} !important`,
  //             '& .MuiStepIcon-text': {
  //               fontSize: '12px',
  //               fontWeight: 400,
  //               lineHeight: '18px',
  //               color: theme.palette.common.white
  //             }
  //           },
  //           '& .MuiStepLabel-iconContainer.Mui-completed .MuiSvgIcon-root': {
  //             color: `${theme.palette.primary.dark} !important`,
  //             '& .MuiStepIcon-text': {
  //               fontSize: '12px',
  //               fontWeight: 400,
  //               lineHeight: '18px',
  //               color: theme.palette.common.white
  //             }
  //           },
  //           '& .MuiStepLabel-iconContainer .MuiSvgIcon-root': {
  //             color: `${theme.palette.customColors.inactive} !important`,
  //             '& .MuiStepIcon-text': {
  //               fontSize: '12px',
  //               fontWeight: 400,
  //               lineHeight: '18px',
  //               color: theme.palette.common.white
  //             }
  //           },
  //           '& .MuiStepLabel-labelContainer': {
  //             '& .MuiStepLabel-label.Mui-active': {
  //               fontSize: '14px',
  //               fontWeight: 500,
  //               lineHeight: '21px !important',
  //               color: `${theme.palette.primary.dark} !important`
  //             },
  //             '& .MuiStepLabel-label.Mui-completed': {
  //               fontSize: '14px',
  //               fontWeight: 500,
  //               lineHeight: '21px !important',
  //               color: `${theme.palette.primary.dark} !important`
  //             },
  //             '& .MuiStepLabel-label': {
  //               fontSize: '14px',
  //               fontWeight: 500,
  //               lineHeight: '21px',
  //               color: theme.palette.customColors.inactive
  //             }
  //           }
  //         }
  //       }
  //     })
  //   }
  // }

  // MuiSlider: {
  //   styleOverrides: {
  //     root: ({ theme }: OwnerStateThemeType) => ({
  //       borderRadius: '16px',
  //       height: '16px',

  //       // color: theme.palette.customColors.sliderMainColor,

  //       // '&.MuiSlider-colorSecondary .MuiSlider-rail': {
  //       //   backgroundColor: `theme.palette.grey[500] !important`
  //       // },
  //       // '&.MuiSlider-colorSecondary .MuiSlider-thumb.MuiSlider-thumbColorPrimary': {
  //       //   width: '4px',
  //       //   height: '44px',
  //       //   borderRadius: '2px',
  //       //   backgroundColor: theme.palette.customColors.text7,
  //       //   '&:hover': {
  //       //     borderRadius: '4px',
  //       //     boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
  //       //   },
  //       //   '&.Mui-focusVisible': {
  //       //     borderRadius: '4px',
  //       //     boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
  //       //   },
  //       //   '& .MuiSlider-valueLabel': {
  //       //     width: '48px',
  //       //     height: '44px',
  //       //     borderRadius: '100px',
  //       //     padding: '12px 16px',
  //       //     backgroundColor: theme.palette.customColors.sliderLabelColor,
  //       //     '&:before': {
  //       //       display: 'none'
  //       //     },
  //       //     '& .MuiSlider-valueLabelLabel': {
  //       //       fontSize: '14px',
  //       //       lineHeight: '20px',
  //       //       letterSpacing: '0.1px',
  //       //       fontWeight: 500,
  //       //       textAlign: 'center',
  //       //       color: theme.palette.customColors.sliderLabelTextColor
  //       //     }
  //       //   }
  //       // },
  //       // '&.MuiSlider-colorSecondary .MuiSlider-mark': {
  //       //   width: '4px',
  //       //   height: '4px',
  //       //   borderRadius: '50px',
  //       //   backgroundColor: theme.palette.grey[500]
  //       // },
  //       '&.MuiSlider-colorPrimary:not(.Mui-disabled)': {
  //         color: `${theme.palette.customColors.sliderMainColor} !important`,
  //         '& .MuiSlider-rail': {
  //           backgroundColor: theme.palette.customColors.sliderSecColor
  //         },
  //         '& .MuiSlider-track': {
  //           backgroundColor: `${theme.palette.customColors.sliderMainColor} !important`
  //         },
  //         '& .MuiSlider-thumb.MuiSlider-thumbColorPrimary': {
  //           width: '4px',
  //           height: '44px',
  //           borderRadius: '2px',
  //           backgroundColor: theme.palette.customColors.sliderMainColor,
  //           '&:hover': {
  //             borderRadius: '4px',
  //             boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
  //           },
  //           '&.Mui-focusVisible': {
  //             borderRadius: '4px',
  //             boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
  //           },
  //           '& .MuiSlider-valueLabel': {
  //             width: '48px',
  //             height: '44px',
  //             borderRadius: '100px',
  //             padding: '12px 16px',
  //             backgroundColor: theme.palette.customColors.sliderLabelColor,
  //             '&:before': {
  //               display: 'none'
  //             },
  //             '& .MuiSlider-valueLabelLabel': {
  //               fontSize: '14px',
  //               lineHeight: '20px',
  //               letterSpacing: '0.1px',
  //               fontWeight: 500,
  //               textAlign: 'center',
  //               color: theme.palette.customColors.sliderLabelTextColor
  //             }
  //           }
  //         },
  //         '& .MuiSlider-mark': {
  //           width: '4px',
  //           height: '4px',
  //           borderRadius: '50px',
  //           backgroundColor: theme.palette.customColors.sliderSecColor
  //         }
  //       },
  //       '&.Mui-disabled': {
  //         color: `${theme.palette.grey[500]} !important`,
  //         '& .MuiSlider-rail': {
  //           backgroundColor: `theme.palette.grey[500] !important`
  //         },
  //         '& .MuiSlider-track': {
  //           opacity: '38%',
  //           backgroundColor: `${theme.palette.grey[700]} !important`
  //         },
  //         '& .MuiSlider-thumb.Mui-disabled': {
  //           width: '4px',
  //           height: '44px',
  //           borderRadius: '2px',
  //           backgroundColor: theme.palette.customColors.text7,
  //           '&:hover': {
  //             borderRadius: '4px !important',
  //             boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
  //           },
  //           '&.Mui-focusVisible': {
  //             borderRadius: '4px !important',
  //             boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
  //           },
  //           '& .MuiSlider-valueLabel': {
  //             width: '48px',
  //             height: '44px',
  //             borderRadius: '100px',
  //             padding: '12px 16px',
  //             backgroundColor: theme.palette.customColors.sliderLabelColor,
  //             '&:before': {
  //               display: 'none'
  //             },
  //             '& .MuiSlider-valueLabelLabel': {
  //               fontSize: '14px',
  //               lineHeight: '20px',
  //               letterSpacing: '0.1px',
  //               fontWeight: 500,
  //               textAlign: 'center',
  //               color: theme.palette.customColors.sliderLabelTextColor
  //             }
  //           }
  //         },
  //         '& .MuiSlider-mark': {
  //           width: '4px',
  //           height: '4px',
  //           borderRadius: '50px',
  //           backgroundColor: `${theme.palette.grey[500]} !important`
  //         }
  //       },
  //       '&.MuiSlider-colorSecondary:not(.Mui-disabled.MuiSlider-colorPrimary)': {
  //         color: `${theme.palette.grey[500]} !important`,
  //         '& .MuiSlider-rail': {
  //           backgroundColor: `${theme.palette.grey[500]} !important`
  //         },
  //         '& .MuiSlider-track': {
  //           opacity: '38%',
  //           backgroundColor: `${theme.palette.grey[700]} !important`
  //         },
  //         '& .MuiSlider-thumb.MuiSlider-thumbColorSecondary': {
  //           width: '4px',
  //           height: '44px',
  //           borderRadius: '2px',
  //           backgroundColor: `${theme.palette.customColors.text7} !important`,
  //           '&:hover': {
  //             borderRadius: '4px !important',
  //             boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
  //           },
  //           '&.Mui-focusVisible': {
  //             borderRadius: '4px !important',
  //             boxShadow: '0px 0px 2px 8px rgba(255, 255, 255, 1.8) !important'
  //           },
  //           '& .MuiSlider-valueLabel': {
  //             width: '48px',
  //             height: '44px',
  //             borderRadius: '100px',
  //             padding: '12px 16px',
  //             backgroundColor: theme.palette.customColors.sliderLabelColor,
  //             '&:before': {
  //               display: 'none'
  //             },
  //             '& .MuiSlider-valueLabelLabel': {
  //               fontSize: '14px',
  //               lineHeight: '20px',
  //               letterSpacing: '0.1px',
  //               fontWeight: 500,
  //               textAlign: 'center',
  //               color: theme.palette.customColors.sliderLabelTextColor
  //             }
  //           }
  //         },
  //         '& .MuiSlider-mark': {
  //           width: '4px',
  //           height: '4px',
  //           borderRadius: '50px',
  //           backgroundColor: `${theme.palette.grey[500]} !important`
  //         }
  //       }
  //     })
  //   }
  // },
  // MuiPickersLayout: {
  //   styleOverrides: {
  //     root: ({ theme }: OwnerStateThemeType) => ({
  //       backgroundColor: theme.palette.common.white,
  //       borderRadius: '28px',

  //       //Date Picker ToolBar

  //       '& .MuiPickersLayout-toolbar': {
  //         justifyContent: 'space-around',
  //         '& .MuiPickersToolbar-root': {
  //           '& span': {
  //             fontSize: '14px',
  //             fontWeight: 500,
  //             lineHeight: '21px',
  //             color: theme.palette.customColors.datepickerText,
  //             textTransform: 'capitalize'
  //           },
  //           '& .MuiPickersToolbar-content': {
  //             '& h4': {
  //               fontSize: '34px',
  //               fontWeight: 400,
  //               lineHeight: '51px !important',
  //               color: theme.palette.customColors.text7,
  //               textTransform: 'capitalize'
  //             }
  //           }
  //         },
  //         '& .MuiSvgIcon-root': {
  //           marginTop: '10px'
  //         }
  //       },

  //       //DatePicker Conent Wrapper

  //       '& .MuiPickersLayout-contentWrapper': {
  //         '& .MuiPickersCalendarHeader-root': {
  //           '& .MuiPickersCalendarHeader-labelContainer': {
  //             '& .MuiPickersCalendarHeader-label': {
  //               fontSize: '14px',
  //               fontWeight: 500,
  //               lineHeight: '20px',
  //               color: theme.palette.customColors.mainText,
  //               textTransform: 'capitalize'
  //             },
  //             '& .MuiIconButton-root': {
  //               color: theme.palette.customColors.mainText
  //             }
  //           },
  //           '& .MuiPickersArrowSwitcher-root': {
  //             '& .MuiIconButton-root': {
  //               color: theme.palette.customColors.mainText
  //             }
  //           }
  //         },
  //         '& .MuiPickersFadeTransitionGroup-root': {
  //           '& .MuiDayCalendar-header': {
  //             '& .MuiDayCalendar-weekDayLabel': {
  //               fontSize: '16px !important',
  //               fontWeight: 400,
  //               lineHeight: '24px',
  //               color: theme.palette.customColors.mainText,
  //               letterSpacing: '0.5px',
  //               textAlign: 'center'
  //             }
  //           },
  //           '& .MuiDayCalendar-monthContainer': {
  //             '& .MuiDayCalendar-weekContainer': {
  //               '& .MuiPickersDay-root': {
  //                 fontSize: '16px !important',
  //                 fontWeight: 400,
  //                 lineHeight: '24px',
  //                 color: theme.palette.customColors.mainText,
  //                 letterSpacing: '0.5px',
  //                 textAlign: 'center',
  //                 '&.MuiPickersDay-today': {
  //                   backgroundColor: `${theme.palette.common.white}`,
  //                   color: theme.palette.primary.dark,
  //                   border: `1px solid ${theme.palette.primary.dark}`,
  //                   '&:hover': {
  //                     backgroundColor: `${theme.palette.customColors.primaryLightest}`
  //                   }
  //                 },
  //                 '&.Mui-disabled.Mui-selected': {
  //                   backgroundColor: `${theme.palette.common.white}`,
  //                   color: theme.palette.customColors.mainText,
  //                   border: `1px solid #0000001A`
  //                 },
  //                 '&.Mui-selected': {
  //                   backgroundColor: `${theme.palette.primary.dark}`,
  //                   color: theme.palette.common.white,

  //                   '&:hover': {
  //                     backgroundColor: `${theme.palette.primary.dark}`,
  //                     color: theme.palette.common.white
  //                   }
  //                 },
  //                 '&.Mui-disabled': {
  //                   color: theme.palette.customColors.mainText
  //                 },
  //                 '&:hover': {
  //                   backgroundColor: `${theme.palette.customColors.disabled}`
  //                 }
  //               }
  //             }
  //           },
  //           '& .MuiYearCalendar-root': {
  //             '& .MuiPickersYear-root': {
  //               '& .MuiPickersYear-yearButton': {
  //                 fontSize: '16px',
  //                 fontWeight: 400,
  //                 lineHeight: '24px',
  //                 color: theme.palette.customColors.mainText,
  //                 '&:hover': {
  //                   backgroundColor: theme.palette.customColors.disabled
  //                 },
  //                 '&.Mui-selected': {
  //                   backgroundColor: theme.palette.customColors.sliderMainColor,
  //                   color: theme.palette.common.white
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       },

  //       //DatePicker Action Wrapper

  //       '& .MuiDialogActions-root': {
  //         '& .MuiButton-textPrimary': {
  //           fontSize: '14px',
  //           fontWeight: 500,
  //           lineHeight: '20px',
  //           letterSpacing: '0.1px',
  //           color: theme.palette.customColors.sliderMainColor,
  //           textTransform: 'capitalize',
  //           textAlign: 'center',
  //           '&:hover': {
  //             backgroundColor: theme.palette.common.white
  //           }
  //         }
  //       }
  //     })
  //   }
  // }
}
