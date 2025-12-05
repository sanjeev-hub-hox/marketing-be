// ** Type Import

import { color, display, height, letterSpacing } from '@mui/system'
import { OwnerStateThemeType } from './'

const DataGrid = () => {
  return {
    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          border: 0,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[2],
          position: 'relative',

          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none'
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: theme.palette.customColors.surfaeLighterTwo,

            '& .MuiDataGrid-columnHeaderDraggableContainer': {
              borderRadius: '0px',
              '& .MuiDataGrid-columnHeaderTitleContainer': {
                '& .MuiDataGrid-columnHeaderTitleContainerContent': {
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    letterSpacing: '0.25px',
                    color: theme.palette.customColors.mainText,
                    textTransform: 'capitalize',
                    textAlign: 'center'
                  },
                  '& .MuiCheckbox-root': {
                    borderRadius: '2px',
                    //color: theme.palette.grey[100],
                    '&:hover': {
                      backgroundColor: theme.palette.customColors.disabled,
                      borderRadius: '100%'
                    },
                    '&.Mui-disabled': {
                      color: theme.palette.customColors.chipBorder
                    },
                    '&.Mui-disabled.Mui-checked': {
                      color: theme.palette.grey[100]
                    },
                    '&.Mui-disabled.MuiCheckbox-indeterminate.Mui-checked': {
                      color: theme.palette.grey[100]
                    },
                    '&.MuiCheckbox-indeterminate.Mui-checked': {
                      color: theme.palette.primary.dark
                    }
                  }
                }
              }
            },

            '& .MuiDataGrid-iconButtonContainer': {
              '& .MuiIconButton-root': {
                color: theme.palette.customColors.text3,
                '&:hover': {
                  // backgroundColor: theme.palette.customColors.dividerColor
                }
              }
            },
            '&:not(.MuiDataGrid-columnHeader--sorted):hover .MuiDataGrid-sortIcon': {
              opacity: 1
            },
            '&:not(.MuiDataGrid-columnHeader--sorted) .MuiDataGrid-sortIcon': {
              opacity: `${1} !important`,
              visibility: 'visible !important'
            }
          },

          // '& .MuiDataGrid-columnHeaders': {
          //   overflow: 'inherit !important'
          // },

          // '& .MuiDataGrid-virtualScroller': {
          //   overflow: 'inherit !important'
          // },
          '& .MuiDataGrid-main': {
            overflow: 'auto'
          },
          '& .MuiDataGrid-menuIcon': {
            // opacity: `${1} !important`,
            // visibility: 'visible !important',
          },
          '& .weekend-cell.MuiDataGrid-cell': {
            backgroundColor: theme.palette.customColors.surfaeLighterTwo
          },
          '& .MuiDataGrid-cell': {
            '& div': {
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '21px',
              color: theme.palette.customColors.mainText,
              textTransform: 'capitalize'
            },
            '& .MuiButtonBase-root.MuiIconButton-root': {
              color: theme.palette.customColors.mainText
            },
            '& .MuiDataGrid-cellContent': {
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '21px',
              color: theme.palette.customColors.mainText,
              textTransform: 'capitalize'
            },
            '& .MuiCheckbox-root': {
              borderRadius: '2px',
              color: theme.palette.grey[100],
              '&:hover': {
                backgroundColor: theme.palette.customColors.disabled,
                borderRadius: '100%'
              },
              '&.Mui-disabled': {
                color: theme.palette.customColors.chipBorder
              },
              '&.Mui-disabled.Mui-checked': {
                color: theme.palette.grey[100]
              }
            }
          },
          '& .MuiDataGrid-virtualScroller': {
            '& .MuiDataGrid-virtualScrollerContent': {
              '& .MuiChip-root': {
                height: '34px',
                borderRadius: '100px',
                padding: '10px 16px',
                border: '0px',

                '& .MuiChip-label': {
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontWeight: 500,
                  textAlign: 'center',
                  letterSpacing: '0.5px'
                },
                '&.MuiChip-colorSuccess': {
                  color: theme.palette.success.main,
                  backgroundColor: theme.palette.success.light,
                  borderColor: theme.palette.success.light
                },
                '&.MuiChip-colorError': {
                  color: theme.palette.error.main,
                  backgroundColor: theme.palette.customColors.chipWarningContainer,
                  borderColor: theme.palette.success.light
                },
                '&.MuiChip-colorWarning': {
                  color: theme.palette.customColors.chipPendingText,
                  backgroundColor: theme.palette.customColors.chipPendingContainer,
                  borderColor: theme.palette.success.light
                },
                '&:hover': {
                  border: '0px'
                }
              }
            }
          },

          //Fixed Column
          '&.dataGridList .MuiDataGrid-virtualScroller': {
            overflowY: 'auto !important',
            height: 'calc(100vh - 447px)'
          },
          '.MuiDataGrid-virtualScroller': {
            height: 'auto',
            // overflowY: 'auto !important',
            // height: 'calc(100vh - 447px)',

            // overflow: 'inherit !important',

            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: '#f0f2f4',
                '& .MuiDataGrid-cell:first-child': {
                  backgroundColor: '#f0f2f4'
                },
                '& .Custom-Column-Sticky.MuiDataGrid-cell': {
                  backgroundColor: '#f0f2f4'
                },
                '& .MuiDataGrid-cell:last-child': {
                  backgroundColor: '#f0f2f4'
                }
              },
              '&.Mui-selected': {
                backgroundColor: '#f0f2f4',
                '& .MuiDataGrid-cell:first-child': {
                  backgroundColor: '#f0f2f4'
                },
                '& .Custom-Column-Sticky.MuiDataGrid-cell': {
                  backgroundColor: '#f0f2f4'
                },
                '& .MuiDataGrid-cell:last-child': {
                  backgroundColor: '#f0f2f4'
                }
              },
              '&.Mui-selected:hover': {
                backgroundColor: '#f0f2f4',
                '& .MuiDataGrid-cell:first-child': {
                  backgroundColor: '#f0f2f4'
                },
                '& .Custom-Column-Sticky.MuiDataGrid-cell': {
                  backgroundColor: '#f0f2f4'
                },
                '& .MuiDataGrid-cell:last-child': {
                  backgroundColor: '#f0f2f4'
                }
              }
            },
            '& .MuiDataGrid-cell': {
              '& .MuiButtonBase-root.Mui-disabled.MuiIconButton-root': {
                '& span': {
                  color: theme.palette.customColors.text5
                }
              }
            }

            // '& .MuiDataGrid-cell.Custom-Column-Sticky': {
            //   position: 'sticky',
            //   zIndex: 999,
            //   backgroundColor: theme.palette.common.white,
            //   boxShadow: '4px 0px 5px 0px #F4F0EF'
            // },
            // '& .Custom-Column-Sticky.MuiDataGrid-cell:first-child': {
            //   position: 'sticky',
            //   top: 'auto',
            //   left: 'auto',
            //   zIndex: 999,
            //   backgroundColor: theme.palette.common.white,
            //   boxShadow: '4px 0px 5px 0px #F4F0EF'
            // },
            // '& .MuiDataGrid-cell:first-child': {
            //   position: 'sticky',
            //   top: '0',
            //   left: '0',

            //   zIndex: 999,
            //   backgroundColor: theme.palette.common.white,
            //   boxShadow: '4px 0px 5px 0px #F4F0EF'
            // },

            // '& .Custom-Column-Sticky.MuiDataGrid-cell:last-child': {
            //   position: 'sticky',
            //   top: 'auto',
            //   right: 'auto',
            //   zIndex: 999,
            //   backgroundColor: theme.palette.common.white,
            //   overflow: 'hidden',
            //   boxShadow: '4px 0px 5px 0px #F4F0EF'
            // },
            // '& .MuiDataGrid-cell:last-child': {
            //   position: 'sticky',
            //   top: '0',
            //   right: '0',
            //   zIndex: 999,
            //   backgroundColor: theme.palette.common.white,
            //   overflow: 'hidden',
            //   boxShadow: '-4px 0px 5px 0px #F4F0EF'
            // }
          },

          // '& .MuiDataGrid-columnHeaders': {
          //   // overflow: 'initial',

          //   '& .MuiDataGrid-columnHeadersInner.MuiDataGrid-columnHeadersInner--scrollable': {
          //     transform: 'none !important',

          //     '& div': {
          //       '&.Custom-Column-Sticky': {
          //         position: 'sticky',
          //         zIndex: 999,
          //         backgroundColor: theme.palette.customColors.surfaeLighterTwo,
          //         boxShadow: '4px 0px 5px 0px #F4F0EF'
          //       },
          //       '& .Custom-Column-Sticky.MuiDataGrid-columnHeader:first-child': {
          //         backgroundColor: theme.palette.customColors.surfaeLighterTwo,
          //         position: 'sticky',
          //         zIndex: 999,
          //         top: 'auto',
          //         left: 'auto',
          //         boxShadow: '4px 0px 5px 0px #F4F0EF'
          //       },
          //       '& .MuiDataGrid-columnHeader:first-child': {
          //         backgroundColor: theme.palette.customColors.surfaeLighterTwo,
          //         position: 'sticky',
          //         top: 0,
          //         left: 0,
          //         zIndex: 999,
          //         boxShadow: '4px 0px 5px 0px #F4F0EF'
          //       }
          //     }
          //   }
          // },

          // '& .MuiDataGrid-columnHeader:last-of-type': {
          //   backgroundColor: theme.palette.customColors.surfaeLighterTwo,
          //   zIndex: 999,
          //   position: 'sticky',
          //   top: '0',
          //   right: '0',
          //   overflow: 'hidden',
          //   boxShadow: '-4px 0px 5px 0px #F4F0EF'
          // },
          // '& .Custom-Column-Sticky.MuiDataGrid-columnHeader:last-of-type': {
          //   backgroundColor: theme.palette.customColors.surfaeLighterTwo,
          //   zIndex: 999,
          //   position: 'sticky',
          //   top: 'auto',
          //   right: 'auto',
          //   overflow: 'hidden',
          //   boxShadow: '4px 0px 5px 0px #F4F0EF'
          // },

          '&.dataTable': {
            '.MuiDataGrid-virtualScroller': {
              height: 'auto',
              // overflowY: 'auto !important',
              // height: 'calc(100vh - 447px)',

              // overflow: 'inherit !important',

              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: '#f0f2f4',
                  '& .MuiDataGrid-cell:first-child': {
                    backgroundColor: '#f0f2f4'
                  },
                  '& .MuiDataGrid-cell:last-child': {
                    backgroundColor: '#f0f2f4'
                  }
                },
                '&.Mui-selected': {
                  backgroundColor: '#f0f2f4',
                  '& .MuiDataGrid-cell:first-child': {
                    backgroundColor: '#f0f2f4'
                  },
                  '& .MuiDataGrid-cell:last-child': {
                    backgroundColor: '#f0f2f4'
                  }
                },
                '&.Mui-selected:hover': {
                  backgroundColor: '#f0f2f4',
                  '& .MuiDataGrid-cell:first-child': {
                    backgroundColor: '#f0f2f4'
                  },
                  '& .MuiDataGrid-cell:last-child': {
                    backgroundColor: '#f0f2f4'
                  }
                }
              }

              // '& .MuiDataGrid-cell:first-child': {
              //   position: 'sticky',
              //   top: '0',
              //   left: '0',

              //   zIndex: 999,
              //   backgroundColor: theme.palette.common.white,
              //   boxShadow: 'none'
              // },

              // '& .MuiDataGrid-cell:last-child': {
              //   position: 'sticky',
              //   top: '0',
              //   right: '0',
              //   paddingRight: '0',
              //   zIndex: 999,
              //   backgroundColor: theme.palette.common.white,
              //   overflow: 'hidden',
              //   boxShadow: 'none'
              // }
            }

            // '& .MuiDataGrid-columnHeaders': {
            //   // overflow: 'initial',

            //   '& .MuiDataGrid-columnHeadersInner.MuiDataGrid-columnHeadersInner--scrollable': {
            //     transform: 'none !important',
            //     '& div': {
            //       '& .MuiDataGrid-columnHeader:first-child': {
            //         backgroundColor: theme.palette.customColors.surfaeLighterTwo,
            //         position: 'sticky',
            //         top: 0,
            //         left: 0,
            //         zIndex: 2,
            //         boxShadow: 'none'
            //       }
            //     }
            //   }
            // },

            // '& .MuiDataGrid-columnHeader:last-of-type': {
            //   backgroundColor: theme.palette.customColors.surfaeLighterTwo,
            //   zIndex: 2,
            //   position: 'sticky',
            //   top: '0',
            //   right: '0',
            //   overflow: 'hidden',
            //   boxShadow: 'none'
            // }
          }

          //ScrollBar Style

          // '& .MuiDataGrid-cell:first-of-type, & .MuiDataGrid-columnHeader:first-of-type': {
          //   position: 'sticky',
          //   left: 0,
          //   zIndex: 1
          // },
          // '& .MuiDataGrid-cell:last-of-type, & .MuiDataGrid-columnHeader:last-of-type': {
          //   position: 'sticky',
          //   right: 0,
          //   zIndex: 1
          // }

          // '& .MuiDataGrid-footerContainer': {
          //   '& .MuiTablePagination-root': {
          //     width: '100%',
          //     '& .MuiToolbar-root': {
          //       display: 'flex',
          //       justifyContent: 'space-between',
          //       '& .MuiTablePagination-spacer': {
          //         display: 'none'
          //       },
          //       '& .MuiTablePagination-selectLabel': {
          //         fontSize: '14px',
          //         fontWeight: 400,
          //         lineHeight: '20px',
          //         letterSpacing: '0.25px',
          //         color: theme.palette.customColors.title
          //       },
          //       '& .MuiInputBase-root': {
          //         '& .MuiSelect-select': {
          //           fontSize: '14px',
          //           fontWeight: 400,
          //           lineHeight: '20px',
          //           letterSpacing: '0.25px',
          //           color: theme.palette.customColors.title

          //           // marginRight: '62% !important'
          //         },
          //         '& .MuiSvgIcon-root': {
          //           color: theme.palette.customColors.title
          //         }
          //       },
          //       '& .MuiTablePagination-displayedRows': {
          //         display: 'none'
          //       }
          //     }
          //   }
          // }
        }),

        // toolbarContainer: ({ theme }: OwnerStateThemeType) => ({
        //   paddingRight: `${theme.spacing(5)} !important`,
        //   paddingLeft: `${theme.spacing(3.25)} !important`
        // }),

        columnHeaders: ({ theme }: OwnerStateThemeType) => ({
          backgroundColor: theme.palette.customColors.surfaeLighterTwo,
          borderRadius: '0px'
        }),
        columnHeader: ({ theme }: OwnerStateThemeType) => ({
          backgroundColor: theme.palette.customColors.surfaeLighterTwo,
          '&:not(.MuiDataGrid-columnHeaderCheckbox)': {
            paddingLeft: theme.spacing(4),
            paddingRight: theme.spacing(4),
            '&:first-of-type': {
              paddingLeft: theme.spacing(5)
            }
          }

          // '&:last-of-type': {
          //   paddingRight: theme.spacing(5)
          // }
        }),
        columnHeaderCheckbox: {
          maxWidth: '58px !important',
          minWidth: '58px !important'
        },
        columnHeaderTitleContainer: {
          padding: 0
        },
        columnHeaderTitle: {
          fontSize: '0.75rem',
          letterSpacing: '0.17px',
          textTransform: 'uppercase'
        },
        columnSeparator: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.divider
        }),
        row: {
          '&:last-child': {
            '& .MuiDataGrid-cell': {
              borderBottom: 0
            }
          },
          '&:hover': {
            backgroundColor: '#f0f2f4',
            '& .MuiDataGrid-cell:first-child': {
              backgroundColor: '#f0f2f4'
            },
            '& .MuiDataGrid-cell:last-child': {
              backgroundColor: '#f0f2f4'
            }
          },
          '&.Mui-selected': {
            backgroundColor: '#f0f2f4',
            '& .MuiDataGrid-cell:first-child': {
              backgroundColor: '#f0f2f4'
            },
            '& .MuiDataGrid-cell:last-child': {
              backgroundColor: '#f0f2f4'
            }
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#f0f2f4',
            '& .MuiDataGrid-cell:first-child': {
              backgroundColor: '#f0f2f4'
            },
            '& .MuiDataGrid-cell:last-child': {
              backgroundColor: '#f0f2f4'
            }
          }
        },
        cell: ({ theme }: OwnerStateThemeType) => ({
          border: 0,
          '&:not(.MuiDataGrid-cellCheckbox)': {
            paddingLeft: theme.spacing(4),

            // paddingRight: theme.spacing(4),
            '&:first-of-type': {
              paddingLeft: theme.spacing(5)
            }
          },

          '&:last-of-type': {
            paddingRight: theme.spacing(5)
          },
          '&:focus, &:focus-within': {
            outline: 'none'
          }
        }),
        cellCheckbox: {
          maxWidth: '58px !important',
          minWidth: '58px !important'
        },
        editInputCell: ({ theme }: OwnerStateThemeType) => ({
          padding: 0,
          color: theme.palette.customColors.mainText,
          '& .MuiInputBase-input': {
            padding: 0
          }
        }),
        footerContainer: ({ theme }: OwnerStateThemeType) => ({
          borderTop: `1px solid ${theme.palette.divider}`,
          '& .MuiDataGrid-selectedRowCount': {
            display: 'none'
          },
          '& .MuiTablePagination-root': {
            width: '100%',
            '& .MuiToolbar-root': {
              display: 'flex',
              justifyContent: 'flex-start',
              width: '100%',
              '& .MuiTablePagination-spacer': {
                display: 'none'
              },
              '& .MuiTablePagination-selectLabel': {
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                letterSpacing: '0.25px',
                color: theme.palette.customColors.title
              },
              '& .MuiInputBase-root': {
                '& .MuiTablePagination-select': {
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  letterSpacing: '0.25px',
                  color: theme.palette.customColors.title,
                  marginRight: '62% !important'
                },
                '& .MuiSvgIcon-root': {
                  color: theme.palette.customColors.mainText
                }
              },
              '& .MuiTablePagination-displayedRows': {
                display: 'none'
              },
              '& .MuiPagination-root': {
                width: 'calc(100% - 226px)',
                display: 'flex',
                justifyContent: 'end',
                '& .MuiPaginationItem-root': {
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '21px !important',
                  color: theme.palette.customColors.title
                },
                '& .MuiPaginationItem-root.Mui-selected': {
                  borderRadius: '4px',
                  padding: '0px 8px',
                  color: theme.palette.common.white,
                  backgroundColor: theme.palette.primary.dark
                }
              }
            }
          }
        }),
        selectedRowCount: ({ theme }: OwnerStateThemeType) => ({
          margin: 0,
          paddingLeft: theme.spacing(4)

          // paddingRight: theme.spacing(4)
        })
      }
    }
  }
}

export default DataGrid
