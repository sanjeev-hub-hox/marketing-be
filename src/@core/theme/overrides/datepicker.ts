// ** Type Import
import { display } from '@mui/system'
import { OwnerStateThemeType } from '.'

const datepicker = () => {
  return {
    MuiPickersLayout: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          backgroundColor: theme.palette.common.white,
          borderRadius: '28px',

          //Date Picker ToolBar

          '& .MuiPickersLayout-toolbar': {
            justifyContent: 'space-around',
            '& .MuiPickersToolbar-root': {
              '& span': {
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '21px',
                color: theme.palette.customColors.datepickerText,
                textTransform: 'capitalize'
              },
              '& .MuiPickersToolbar-content': {
                '& h4': {
                  fontSize: '34px',
                  fontWeight: 400,
                  lineHeight: '51px !important',
                  color: theme.palette.customColors.text7,
                  textTransform: 'capitalize'
                }
              }
            },
            '& .MuiSvgIcon-root': {
              marginTop: '10px'
            }
          },

          //DatePicker Conent Wrapper

          '& .MuiPickersLayout-contentWrapper': {
            '& .MuiPickersCalendarHeader-root': {
              '& .MuiPickersCalendarHeader-labelContainer': {
                '& .MuiPickersCalendarHeader-label': {
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: theme.palette.customColors.mainText,
                  textTransform: 'capitalize'
                },
                '& .MuiIconButton-root': {
                  color: theme.palette.customColors.mainText
                }
              },
              '& .MuiPickersArrowSwitcher-root': {
                '& .MuiIconButton-root': {
                  color: theme.palette.customColors.mainText
                }
              }
            },
            '& .MuiPickersFadeTransitionGroup-root': {
              '& .MuiDayCalendar-header': {
                '& .MuiDayCalendar-weekDayLabel': {
                  fontSize: '16px !important',
                  fontWeight: 400,
                  lineHeight: '24px',
                  color: theme.palette.customColors.mainText,
                  letterSpacing: '0.5px',
                  textAlign: 'center'
                }
              },
              '& .MuiDayCalendar-monthContainer': {
                '& .MuiDayCalendar-weekContainer': {
                  '& .MuiPickersDay-root': {
                    fontSize: '16px !important',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: theme.palette.customColors.mainText,
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    '&.MuiPickersDay-today': {
                      backgroundColor: `${theme.palette.common.white}`,
                      color: theme.palette.primary.dark,
                      border: `1px solid ${theme.palette.primary.dark}`,
                      '&:hover': {
                        backgroundColor: `${theme.palette.customColors.primaryLightest}`
                      }
                    },
                    '&.Mui-disabled.Mui-selected': {
                      backgroundColor: `${theme.palette.common.white}`,
                      color: theme.palette.customColors.mainText,
                      border: `1px solid #0000001A`
                    },
                    '&.Mui-selected': {
                      backgroundColor: `${theme.palette.primary.dark}`,
                      color: theme.palette.common.white,

                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.dark}`,
                        color: theme.palette.common.white
                      }
                    },
                    '&.Mui-disabled': {
                      color: theme.palette.customColors.mainText
                    },
                    '&:hover': {
                      backgroundColor: `${theme.palette.customColors.disabled}`
                    }
                  }
                }
              },
              '& .MuiYearCalendar-root': {
                '& .MuiPickersYear-root': {
                  '& .MuiPickersYear-yearButton': {
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: theme.palette.customColors.mainText,
                    '&:hover': {
                      backgroundColor: theme.palette.customColors.disabled
                    },
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.customColors.sliderMainColor,
                      color: theme.palette.common.white
                    }
                  }
                }
              }
            }
          },

          //DatePicker Action Wrapper

          '& .MuiDialogActions-root': {
            display: 'none'
            // '& .MuiButton-textPrimary': {
            //   fontSize: '14px',
            //   fontWeight: 500,
            //   lineHeight: '20px',
            //   letterSpacing: '0.1px',
            //   color: theme.palette.customColors.sliderMainColor,
            //   textTransform: 'capitalize',
            //   textAlign: 'center',
            //   '&:hover': {
            //     backgroundColor: theme.palette.common.white
            //   }
            // }
          },
          '&.desktopDate': {
            boxShadow: '0px 2px 10px 0px #4C4E6438',
            '& .MuiPickersToolbar-root ': {
              '& .MuiTypography-root': {
                display: 'none'
              },
              '& .MuiPickersToolbar-content': {
                display: 'none'
              }
            },
            '& .MuiPickersLayout-contentWrapper': {
              '& .MuiDateCalendar-root': {
                margin: '0px',
                width: '350px'
              }
            },

            '& .MuiDialogActions-root': {
              '& button': {
                marginLeft: '-22px'
              }
            }
          }
        })
      }
    }
  }
}

export default datepicker
