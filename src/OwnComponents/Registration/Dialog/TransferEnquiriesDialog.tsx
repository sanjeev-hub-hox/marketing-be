// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  DialogTitle,
  Grid,
  Chip,
  IconButton,
  Typography
} from '@mui/material'
import { Box } from '@mui/material'
import StudentLogo from '../Image/student.png'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import Image from 'next/image'
import { styled } from '@mui/material/styles'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { gridPageCountSelector, GridPagination, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'

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
  handleReassignClose?: () => void
  transferColumns: GridColDef[]
  transferRows?: any
}

//Chips Styled
const StyledChipProps = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorPrimary': {
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: '#4849DA14 !important',
    color: '#4849DA !important'
  },
  '&.MuiChip-colorDefault': {
    border: `1px solid ${theme.palette.grey[300]} !important`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: `${theme.palette.customColors.text6} !important`,
    color: `${theme.palette.customColors.mainText} `
  }
}))

function TransferEnquiriesDialog({
  openModal,
  closeModal,
  header,
  handleReassignClose,
  transferColumns,
  transferRows
}: customModal) {
  // ** Hooks
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  const [location, setLocation] = useState<string>('Vibgyor High - Goregaon West')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [schoolLocation, setSchoolLocation] = useState<string>('Vibgyor High - Goregaon West')

  //Handle Clickable Chips Handler

  const chipsLabel = ['Enquiry Open', 'ENDAS#52487']

  //Handler for CTA Details Button
  const handleSchoolLocation = (event: any) => {
    setSchoolLocation(event.target.value as string)
  }
  const handleLocation = (event: any) => {
    setLocation(event.target.value as string)
  }

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
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>School Location</InputLabel>
                  <Select
                    IconComponent={DownArrow}
                    label='School Location'
                    defaultValue={schoolLocation}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleSchoolLocation}
                  >
                    <MenuItem value=''>Select Option</MenuItem>
                    <MenuItem value='Vibgyor High - Goregaon West'>Vibgyor High - Goregaon West</MenuItem>
                    <MenuItem value='Vibgyor High - Borivali West'>Vibgyor High - Borivali West</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ mt: 5, mb: 5 }}>
            <Typography variant='body2' sx={{ lineHeight: '21px', fontWeight: '500' }}>
              Enquiries From The Same Enquirer(Global ID)
            </Typography>
          </Box>
          <Box sx={{ mt: 3, mb: 3 }}>
            <DataGrid
              autoHeight
              columns={transferColumns}
              rows={transferRows}
              className='dataTable'
              pagination={true}
              checkboxSelection={false}
              pageSizeOptions={[7, 10, 25, 50]}
              paginationModel={paginationModel}
              slots={{ pagination: CustomPagination }}
              onPaginationModelChange={setPaginationModel}
              hideFooterPagination
              sx={{
                boxShadow: 'none',
                width: '100%',
                '& .MuiDataGrid-main': { overflow: 'hidden' }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button onClick={closeModal} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
              Close
            </Button>
            <Button onClick={handleReassignClose} size='large' variant='contained' color='secondary'>
              Transfer
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TransferEnquiriesDialog
