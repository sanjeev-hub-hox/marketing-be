// ** Type Import
import { OwnerStateThemeType } from './'

const Tabs = () => {
  return {
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          minWidth: '360px',
          minHeight: '46px',
          '&.primary': {
            '& .MuiTabs-scroller': {
              overflowX: 'initial',
              '& .MuiTabs-flexContainer': {
                justifyContent: 'space-around'
              },
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                '& > span': {
                  maxWidth: 24,
                  width: '100%',
                  height: '3px',
                  borderRadius: '100px 100px 0px 0px',
                  backgroundColor: theme.palette.primary.dark
                }
              }
            }
          },
          '&.secondary': {
            '& .MuiTabs-scroller': {
              overflowX: 'initial',
              '& .MuiTabs-flexContainer': {
                justifyContent: 'space-around'
              },
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                '& > span': {
                  maxWidth: 24,
                  width: '100%',
                  height: '3px',
                  borderRadius: '100px 100px 0px 0px',
                  backgroundColor: theme.palette.secondary.main
                }
              }
            }
          },
          '&.inherit': {
            '& .MuiTabs-scroller': {
              overflowX: 'initial',
              '& .MuiTabs-flexContainer': {
                justifyContent: 'space-around'
              },
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                '& > span': {
                  maxWidth: 24,
                  width: '100%',
                  height: '3px',
                  borderRadius: '100px 100px 0px 0px',
                  backgroundColor: theme.palette.customColors.mainText
                }
              }
            }
          },

          //Fullwidth class name primary

          '&.fullwidth.primary': {
            '& .MuiTabs-scroller': {
              marginBottom: '-7px !important',
              '& .MuiTabs-flexContainer': {
                justifyContent: 'space-around'
              },
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                '& > span': {
                  maxWidth: '100%',
                  width: '100%',
                  height: '3px',
                  borderRadius: '100px 100px 0px 0px',
                  backgroundColor: theme.palette.primary.dark
                }
              }
            }
          },
          '&.fullwidth.secondary': {
            '& .MuiTabs-scroller': {
              marginBottom: '-7px !important',
              '& .MuiTabs-flexContainer': {
                justifyContent: 'space-around'
              },
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                '& > span': {
                  maxWidth: '100%',
                  width: '100%',
                  height: '3px',
                  borderRadius: '100px 100px 0px 0px',
                  backgroundColor: theme.palette.secondary.main
                }
              }
            }
          },
          '&.fullwidth.inherit': {
            '& .MuiTabs-scroller': {
              marginBottom: '-7px !important',
              '& .MuiTabs-flexContainer': {
                justifyContent: 'space-around'
              },
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                '& > span': {
                  maxWidth: '100%',
                  width: '100%',
                  height: '3px',
                  borderRadius: '100px 100px 0px 0px',
                  backgroundColor: theme.palette.customColors.mainText
                }
              }
            }
          },
          '&.scrollable.primary': {
            '& .MuiTabs-scroller': {
              marginBottom: '-7px !important',
              '& .MuiTabs-flexContainer': {},
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                '& > span': {
                  maxWidth: '100%',
                  width: '100%',
                  height: '3px',
                  borderRadius: '100px 100px 0px 0px',
                  backgroundColor: theme.palette.primary.dark
                }
              }
            }
          },
          '&.scrollable.secondary': {
            '& .MuiTabs-scroller': {
              marginBottom: '-7px !important',
              '& .MuiTabs-flexContainer': {},
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                '& > span': {
                  maxWidth: '100%',
                  width: '100%',
                  height: '3px',
                  borderRadius: '100px 100px 0px 0px',
                  backgroundColor: theme.palette.secondary.main
                }
              }
            }
          },
          '&.scrollable.inherit': {
            '& .MuiTabs-scroller': {
              marginBottom: '-7px !important',
              '& .MuiTabs-flexContainer': {},
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                '& > span': {
                  maxWidth: '100%',
                  width: '100%',
                  height: '3px',
                  borderRadius: '100px 100px 0px 0px',
                  backgroundColor: theme.palette.customColors.mainText
                }
              }
            }
          }
        }),
        vertical: ({ theme }: OwnerStateThemeType) => ({
          minWidth: '360px',
          width: '360px',
          minHeight: '46px',
          marginRight: theme.spacing(4),

          // borderRight: `1px solid ${theme.palette.divider}`,
          borderRight: '0px',
          '& .MuiTab-root': {
            minWidth: '360px'
          }
        })
      }
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '20px',
          letterSpacing: '0.1px',
          color: theme.palette.customColors.mainText,
          textTransform: 'capitalize',

          '&:hover': {
            boxShadow: theme.shadows[1],
            borderRadius: '8px 8px 0px 0px',
            backgroundColor: '#fff'
          }
        }),
        textColorSecondary: ({ theme }: OwnerStateThemeType) => ({
          '&.Mui-selected': {
            color: theme.palette.secondary.main
          },
          '&.Mui-selected.MuiTab-fullWidth': {
            color: theme.palette.secondary.main,
            backgroundColor: theme.palette.customColors.chipHoverBackground,
            '&:hover': {
              boxShadow: theme.shadows[1],
              borderRadius: '8px 8px 0px 0px',
              backgroundColor: theme.palette.customColors.chipHoverBackground
            }
          }
        }),
        textColorPrimary: ({ theme }: OwnerStateThemeType) => ({
          '&.Mui-selected': {
            color: theme.palette.primary.dark
          },
          '&.Mui-selected.MuiTab-fullWidth': {
            color: theme.palette.primary.dark,
            backgroundColor: theme.palette.customColors.chipHoverBackground,
            '&:hover': {
              boxShadow: theme.shadows[1],
              borderRadius: '8px 8px 0px 0px',
              backgroundColor: theme.palette.customColors.chipHoverBackground
            }
          }
        }),
        textColorInherit: ({ theme }: OwnerStateThemeType) => ({
          '&.Mui-selected': {
            color: theme.palette.customColors.text7
          },
          '&.Mui-selected.MuiTab-fullWidth': {
            color: theme.palette.customColors.text7,
            backgroundColor: theme.palette.customColors.chipHoverBackground,
            '&:hover': {
              boxShadow: theme.shadows[1],
              borderRadius: '8px 8px 0px 0px',
              backgroundColor: theme.palette.customColors.chipHoverBackground
            }
          }
        })
      }
    }
  }
}

export default Tabs
