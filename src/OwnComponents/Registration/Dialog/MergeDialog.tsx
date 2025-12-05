// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import { Button, Card, DialogActions, DialogTitle, Grid, IconButton, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import UserIcon from 'src/layouts/components/UserIcon'
import { gridPageCountSelector, GridPagination, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import PhoneNumberInput from 'src/@core/CustomComponent/PhoneNumberInput/PhoneNumberInput'

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
  enquirerColumns: GridColDef[]
  enquirerRows?: any
}

function MergeDialog({ openModal, closeModal, header, enquirerColumns, enquirerRows }: customModal) {
  // ** Hooks

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [enquirerName, setEnquirerName] = useState('Ashok Shah')
  const [emailId, setEmailId] = useState('ashokshah@gmail.com')

  //Handler for CTA Details Button

  //   const handlerDetails = () => {
  //     console.log('Eneter Routes Here')
  //   }

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
          {/* <IconButton disableFocusRipple disableRipple onClick={closeModal}>
          
            <HighlightOffIcon style={{ color: '#666666' }} />
          </IconButton> */}
        </Box>

        <DialogContent>
          <Box sx={{ mb: 5 }}>
            <Grid container spacing={5} xs={12}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label='Enquiry Name'
                  value={enquirerName}
                  placeholder='Enquiry Name Here'
                  onChange={e => setEnquirerName(e.target.value)}
                  defaultValue={enquirerName}
                  disabled
                />
              </Grid>
              <Grid item xs={4}>
                <PhoneNumberInput label='Phone Number' helperText={false} rowData={null} disabled={true} />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label='Email Id'
                  value={emailId}
                  placeholder='Email Id Here'
                  onChange={e => setEmailId(e.target.value)}
                  defaultValue={emailId}
                  disabled
                />
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ mb: 5 }}>
            <Typography variant='subtitle2' sx={{ lineHeight: '20px', letterSpacing: '0.1px' }}>
              Enquiries Coming From Same Enquirer
            </Typography>
          </Box>
          <Box>
            <DataGrid
              autoHeight
              columns={enquirerColumns}
              rows={enquirerRows}
              pagination={true}
              checkboxSelection={true}
              pageSizeOptions={[7, 10, 25, 50]}
              paginationModel={paginationModel}
              slots={{ pagination: CustomPagination }}
              onPaginationModelChange={setPaginationModel}
              className='dataTable'
              sx={{ boxShadow: 'none', '& .MuiDataGrid-main': { overflow: 'hidden' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button onClick={closeModal} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
              Close
            </Button>
            <Button onClick={closeModal} size='large' variant='contained' color='secondary'>
              Merge
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MergeDialog
