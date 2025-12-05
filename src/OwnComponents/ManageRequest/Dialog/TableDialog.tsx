// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import { Card, DialogTitle, IconButton } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import UserIcon from 'src/layouts/components/UserIcon'
import { gridPageCountSelector, GridPagination, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

function Pagination({
  page,
  onPageChange,
  className
}: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) {
  const apiRef = useGridApiContext()
  const pageCount = useGridSelector(apiRef, gridPageCountSelector)

  return (
    <MuiPagination
      color='primary'
      className={className}
      count={pageCount}
      page={page + 1}
      shape='rounded'
      onChange={(event, newPage) => {
        onPageChange(event as any, newPage - 1)
      }}
    />
  )
}

function CustomPagination(props: any) {
  return <GridPagination ActionsComponent={Pagination} {...props} />
}

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
  columnsRolCode: GridColDef[]
  rowsRoleCode?: any
}

function TableDialog({ openModal, closeModal, header, columnsRolCode, rowsRoleCode }: customModal) {
  // ** Hooks
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        open={openModal}
        onClose={closeModal}
        maxWidth={maxWidths}
        aria-labelledby='responsive-dialog-title'
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle id='responsive-dialog-title'>{header}</DialogTitle>
          <IconButton disableFocusRipple disableRipple onClick={closeModal}>
            {/* <UserIcon icon='mdi:close-circle-outline' /> */}
            <HighlightOffIcon style={{ color: '#666666' }} />
          </IconButton>
        </Box>
        <DialogContent>
          <Box>
            <DataGrid
              autoHeight
              columns={columnsRolCode}
              rows={rowsRoleCode}
              pagination={true}
              checkboxSelection={false}
              pageSizeOptions={[7, 10, 25, 50]}
              paginationModel={paginationModel}
              slots={{ pagination: CustomPagination }}
              onPaginationModelChange={setPaginationModel}
              className='dataTable'
              sx={{ boxShadow: 'none' }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TableDialog
