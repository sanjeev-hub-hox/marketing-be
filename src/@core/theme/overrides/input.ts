// ** Type Import
import { color, display, padding } from '@mui/system'
import { OwnerStateThemeType } from './'

const input = () => {
  return {
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiFormLabel-root': {
            color: theme.palette.customColors.mainText,
            transformOrigin: 'top left',
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0.5px',
            fontWeight: 400,
            '& .MuiSvgIcon-root': {
              width: '20px',
              height: '20px',
              marginTop: '2px',
              display: 'none'
            },
            '& .MuiBox-root': {
              marginLeft: '0px'
            }
          },

          '&.Mui-focused.MuiInputLabel-animated': {
            fontSize: '12px',
            letterSpacing: '0.4px',
            lineHeight: '16px',
            fontWeight: 400,
            color: theme.palette.customColors.mainText,
            marginLeft: '0px',

            '& .MuiSvgIcon-root': {
              marginTop: '0px',
              marginLeft: '6px',
              display: 'block',
              color: theme.palette.primary.dark

              // display: 'flex',
              // justifyContnt: 'flrx-end',
              // alignItems: 'center'
            },

            '&.Mui-disabled': {
              color: theme.palette.customColors.textLabel
            }
          },
          '&.MuiInputLabel-shrink.MuiInputLabel-animated': {
            fontSize: '12px',
            letterSpacing: '0.4px',
            lineHeight: '16px',
            fontWeight: 400,
            color: theme.palette.customColors.mainText,
            transform: 'translate(14px, -9px) scale(0.95) ',

            '& .MuiSvgIcon-root': {
              marginTop: '0px',
              marginLeft: '6px',
              display: 'block',
              color: theme.palette.primary.dark
            },
            '&.Mui-disabled': {
              color: theme.palette.customColors.text3
            },
            '&.Mui-error': {
              color: theme.palette.error.main
            }
          },
          '&.Mui-error.Mui-focused': {
            color: theme.palette.error.main
          },
          '&.Mui-error': {
            color: theme.palette.error.main
          },
          '&.Mui-focused': {
            color: theme.palette.primary.dark
          },
          '&.Mui-disabled': {
            color: theme.palette.customColors.text3
          }
        })
      }
    },
    MuiInput: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          lineHeight: '1.5rem',
          '&:before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.main}, 0.22)`
          },
          '&:hover:not(.Mui-disabled):before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.main}, 0.32)`
          },
          '&.Mui-disabled:before': {
            borderBottomStyle: 'solid'
          }
        })
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          backgroundColor: `rgba(${theme.palette.customColors.main}, 0.05)`,
          '&:hover:not(.Mui-disabled)': {
            backgroundColor: `rgba(${theme.palette.customColors.main}, 0.08)`
          },
          '&:before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.main}, 0.22)`
          },
          '&:hover:not(.Mui-disabled):before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.main}, 0.32)`
          },
          '&.Mui-disabled': {
            backgroundColor: `rgba(${theme.palette.customColors.main}, 0.05)`,
            '&:before': {
              borderBottomStyle: 'solid'
            }
          }
        })
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          borderRadius: 4,
          borderColor: '#767586',
          height: '56px',
          padding: '4px 16px',
          color: theme.palette.customColors.mainText,

          '& .MuiInputBase-input': {
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: 400,
            color: theme.palette.customColors.mainText
          },

          '&:hover:not(.Mui-focused):not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.customColors.title
          },
          '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.error.main,
            color: theme.palette.error.main,
            borderWidth: '2px'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.customColors.text3
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.customColors.text3
          },
          '&.Mui-focused': {
            borderColor: `${theme.palette.primary.dark}`,
            borderWidth: '2px'
          }
        })
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          fontSize: '12px',
          lineHeight: '16px',
          letterSpacing: '0.4px',
          fontWeight: 400,
          marginTop: '5px',
          color: theme.palette.customColors.mainText,

          '&.Mui-error.Mui-focused': {
            color: theme.palette.error.main
          },

          '&.Mui-disabled': {
            color: theme.palette.customColors.text3
          },
          '&.Mui-focused': {
            color: theme.palette.customColors.mainText
          }
        })
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '&.readOnly': {
            '& .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl.MuiInputLabel-animated': {
              color: theme.palette.customColors.text3
            },
            '& .Mui-readOnly': {
              '& .MuiOutlinedInput-notchedOutline': {
                border: '0px'
              },
              '& .MuiInputBase-input.MuiOutlinedInput-input.Mui-readOnly': {
                color: theme.palette.customColors.text3
              }
            }
          },
          '&.readOnlyWithBorder': {
            '& .MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl.MuiInputLabel-animated': {
              color: theme.palette.customColors.text3
            },
            '& .Mui-readOnly': {
              '& .MuiOutlinedInput-notchedOutline': {
                border: `1px solid ${theme.palette.customColors.text3}`
              },
              '& .MuiInputBase-input.MuiOutlinedInput-input.Mui-readOnly': {
                color: theme.palette.customColors.text3
              }
            }
          },
          '&.textArea': {
            '& .MuiOutlinedInput-root': {
              height: 'auto'
            }
          },
          '&.custom-search': {
            '& .MuiOutlinedInput-root': {
              maxWidth: '360px',
              height: '48px',
              borderRadius: '28px',
              color: theme.palette.customColors.inactive,
              border: `1px solid ${theme.palette.customColors.text3}`,
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',

              '&.Mui-focused': {
                fontWeight: 400,

                color: theme.palette.customColors.mainText,
                borderColor: `${theme.palette.customColors.mainText}`,
                '& .MuiInputBase-input': {
                  fontWeight: 400
                },
                '& .MuiInputAdornment-positionStart': {
                  color: theme.palette.customColors.mainText
                }
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: `1px solid ${theme.palette.customColors.mainText}`
              },
              '& .MuiInputAdornment-positionStart': {
                color: theme.palette.customColors.text3
              },
              '& .MuiInputAdornment-positionEnd': {
                color: theme.palette.customColors.text3
              },
              '&.Mui-focused .MuiInputAdornment-positionStart': {
                color: theme.palette.customColors.mainText
              },
              '&.Mui-focused .MuiInputAdornment-positionEnd': {
                color: theme.palette.customColors.mainText
              },
              '& .MuiInputBase-input': {
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '24px',
                letterSpacing: '0.5px',
                color: theme.palette.customColors.mainText
              }
            }
          }
        })
      }
    },
    MuiFormGroup: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '& .MuiFormControlLabel-root': {
            '& .MuiTypography-root': {
              fontSize: '16px',
              lineHeight: '24px',
              fontWeight: 400,
              color: theme.palette.customColors.mainText
            }
          }
        })
      }
    },
    MuiFormControl: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '& .radio.MuiFormLabel-root': {
            fontSize: '14px',
            lineHeight: '21px',
            fontWeight: 400,
            color: theme.palette.customColors.mainText
          },
          '& .MuiFormLabel-asterisk': {
            color: theme.palette.error.main
          },
          '& .MuiFormLabel-root': {
            display: 'flex'
          }
        })
      }
    }

    // MuiRadio: {
    //   styleOverrides: {
    //     root: ({ theme }: OwnerStateThemeType) => ({
    //       color: theme.palette.customColors.mainText,
    //       '&:hover': {
    //         backgroundColor: theme.palette.customColors.disabled
    //       },
    //       '&.Mui-disabled': {
    //         color: theme.palette.customColors.disable
    //       },
    //       '&.MuiRadio-colorPrimary': {
    //         color: theme.palette.primary.main,
    //         '&:hover': {
    //           backgroundColor: theme.palette.customColors.primaryLightest
    //         },
    //         '&.Mui-disabled': {
    //           color: theme.palette.customColors.disable
    //         }
    //       },
    //       '&.MuiRadio-colorSecondary': {
    //         color: theme.palette.secondary.main,
    //         '&:hover': {
    //           backgroundColor: theme.palette.customColors.disabled
    //         },
    //         '&.Mui-disabled': {
    //           color: theme.palette.customColors.disable
    //         }
    //       }
    //     })
    //   }
    // },
    // MuiCheckbox: {
    //   styleOverrides: {
    //     root: ({ theme }: OwnerStateThemeType) => ({
    //       borderRadius: '2px',
    //       color: theme.palette.customColors.chipBorder,
    //       '&:hover': {
    //         backgroundColor: theme.palette.customColors.disabled,
    //         borderRadius: '100%'
    //       },
    //       '&.Mui-disabled': {
    //         color: theme.palette.customColors.chipBorder
    //       },
    //       '&.Mui-disabled.Mui-checked': {
    //         color: theme.palette.customColors.chipBorder
    //       },
    //       '&.MuiCheckbox-indeterminate': {
    //         color: theme.palette.customColors.chipBorder
    //       },
    //       '&.MuiCheckbox-colorDefault': {
    //         color: theme.palette.customColors.chipBorder,
    //         '&:hover': {
    //           backgroundColor: theme.palette.customColors.disabled,
    //           borderRadius: '100%'
    //         },
    //         '&.Mui-checked': {
    //           color: theme.palette.customColors.chipBorder
    //         },
    //         '&.Mui-disabled': {
    //           color: theme.palette.customColors.chipBorder
    //         },
    //         '&.Mui-disabled.Mui-checked': {
    //           color: theme.palette.customColors.chipBorder
    //         },
    //         '&.MuiCheckbox-indeterminate.Mui-checked': {
    //           color: theme.palette.customColors.chipBorder
    //         }
    //       },
    //       '&.MuiCheckbox-colorPrimary': {
    //         color: theme.palette.primary.main,
    //         '&:hover': {
    //           backgroundColor: theme.palette.customColors.primaryLightest,
    //           borderRadius: '100%'
    //         },
    //         '&.Mui-checked': {
    //           color: theme.palette.primary.main
    //         },
    //         '&.Mui-disabled': {
    //           color: theme.palette.customColors.chipBorder
    //         },
    //         '&.Mui-disabled.Mui-checked': {
    //           color: theme.palette.customColors.chipBorder
    //         },
    //         '&.MuiCheckbox-indeterminate.Mui-checked': {
    //           color: theme.palette.customColors.chipBorder
    //         },
    //         '&.MuiCheckbox-indeterminate': {
    //           color: theme.palette.customColors.chipBorder
    //         }
    //       },
    //       '&.MuiCheckbox-colorSecondary': {
    //         color: theme.palette.secondary.main,
    //         '&:hover': {
    //           backgroundColor: theme.palette.customColors.primaryLightest,
    //           borderRadius: '100%'
    //         },
    //         '&.Mui-checked': {
    //           color: theme.palette.secondary.main
    //         },
    //         '&.Mui-disabled': {
    //           color: theme.palette.customColors.chipBorder
    //         },
    //         '&.Mui-disabled.Mui-checked': {
    //           color: theme.palette.customColors.chipBorder
    //         },
    //         '&.MuiCheckbox-indeterminate.Mui-checked': {
    //           color: theme.palette.customColors.chipBorder
    //         },
    //         '&.MuiCheckbox-indeterminate': {
    //           color: theme.palette.customColors.chipBorder
    //         }
    //       }
    //     })
    //   }
    // },
    // MuiBadge: {
    //   styleOverrides: {
    //     badge: ({ theme }: OwnerStateThemeType) => ({
    //       fontSize: '11px',
    //       lineHeight: '16px',
    //       fontWeight: 500,
    //       boxShadow: '0px !important',
    //       backgroundColor: 'transperent',
    //       '&.MuiBadge-dot': {
    //         width: '6px',
    //         height: '6px',
    //         minWidth: '6px',
    //         borderRadius: '50px',
    //         backgroundColor: theme.palette.customColors.badgeColorDefault,
    //         color: theme.palette.common.white,
    //         '&.MuiBadge-colorPrimary': {
    //           backgroundColor: theme.palette.primary.dark,
    //           color: theme.palette.common.white
    //         },
    //         '&.MuiBadge-colorSecondary': {
    //           backgroundColor: theme.palette.secondary.main,
    //           color: theme.palette.common.white
    //         },
    //         '&.MuiBadge-colorInfo': {
    //           backgroundColor: theme.palette.info.main,
    //           color: theme.palette.common.white
    //         },
    //         '&.MuiBadge-colorSuccess': {
    //           backgroundColor: theme.palette.success.main,
    //           color: theme.palette.success.dark
    //         },
    //         '&.MuiBadge-colorError': {
    //           backgroundColor: theme.palette.secondary.main,
    //           color: theme.palette.common.white
    //         }
    //       },
    //       '&.MuiBadge-standard': {
    //         width: '18px',
    //         height: '18px',
    //         minWidth: '18px',
    //         borderRadius: '50px',
    //         padding: '0px 4px',
    //         backgroundColor: theme.palette.customColors.badgeColorDefault,
    //         color: theme.palette.common.white,
    //         '&.MuiBadge-colorPrimary': {
    //           backgroundColor: theme.palette.primary.dark,
    //           color: theme.palette.common.white
    //         },
    //         '&.MuiBadge-colorSecondary': {
    //           backgroundColor: theme.palette.secondary.main,
    //           color: theme.palette.common.white
    //         },
    //         '&.MuiBadge-colorInfo': {
    //           backgroundColor: theme.palette.info.main,
    //           color: theme.palette.common.white
    //         },
    //         '&.MuiBadge-colorSuccess': {
    //           backgroundColor: theme.palette.success.main,
    //           color: theme.palette.success.dark
    //         },
    //         '&.MuiBadge-colorError': {
    //           backgroundColor: theme.palette.secondary.main,
    //           color: theme.palette.common.white
    //         }
    //       }
    //     })
    //   }
    // }
  }
}

export default input
