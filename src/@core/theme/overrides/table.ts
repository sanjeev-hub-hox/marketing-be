// ** Type Import
import { padding } from '@mui/system'
import { OwnerStateThemeType } from './'

const Table = () => {
  return {
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          boxShadow: theme.shadows[0],
          borderTopColor: theme.palette.divider
        })
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          background: theme.palette.customColors.surfaeLighterTwo,
          textTransform: 'capitalize',
          borderRadius: '0px',

          '& .MuiTableCell-head': {
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            letterSpacing: '0.25px',
            color: theme.palette.customColors.mainText,
            textTransform: 'capitalize',
            textAlign: 'left'
          }
        })
      }
    },
    MuiTableBody: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '& .MuiTableCell-body': {
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '21px',
            color: theme.palette.customColors.mainText,
            textTransform: 'capitalize'
          }
        })
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '&.MuiTableRow-hover:hover': {
            backgroundColor: theme.palette.customColors.surfaeLighterTwo
          },
          '& .MuiTableCell-head:not(.MuiTableCell-paddingCheckbox):first-child, & .MuiTableCell-root:not(.MuiTableCell-paddingCheckbox):first-child ':
            {
              paddingLeft: theme.spacing(5)
            },
          '& .MuiTableCell-head:last-child, & .MuiTableCell-root:last-child': {
            paddingRight: theme.spacing(5)
          }
        })
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          borderBottom: `1px solid ${theme.palette.customColors.text5}`
        }),
        paddingCheckbox: ({ theme }: OwnerStateThemeType) => ({
          paddingLeft: theme.spacing(2)
        }),
        stickyHeader: ({ theme }: OwnerStateThemeType) => ({
          backgroundColor: theme.palette.customColors.tableHeaderBg
        })
      }
    },
    MuiTablePagination: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          '& .MuiIconButton-root.Mui-disabled': {
            color: theme.palette.action.active
          },
          borderTop: `1px solid ${theme.palette.divider}`,

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
            }

            // '& .MuiTablePagination-displayedRows': {
            //   display: 'none'
            // }

            // '& .MuiPagination-root': {
            //   width: 'calc(100% - 22%)',
            //   display: 'flex',
            //   justifyContent: 'end',
            //   '& .MuiPaginationItem-root': {
            //     fontSize: '14px',
            //     fontWeight: 400,
            //     lineHeight: '21px !important',
            //     color: theme.palette.customColors.title
            //   },
            //   '& .MuiPaginationItem-root.Mui-selected': {
            //     borderRadius: '4px',
            //     padding: '0px 8px',
            //     color: theme.palette.common.white,
            //     backgroundColor: theme.palette.primary.dark
            //   }
            // }
          }
        }),
        displayedRows: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary
        })
      }
    }
  }
}

export default Table
