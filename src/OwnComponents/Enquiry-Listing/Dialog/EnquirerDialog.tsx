import { Fragment, useEffect, useState } from 'react'

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
import { useRouter } from 'next/navigation'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { getRequest } from 'src/services/apiService'

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
  rowData?: any
}

function EnquirerDialog({ openModal, rowData, closeModal, header, enquirerColumns }: customModal) {
  // ** Hooks
  const router = useRouter()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const { setGlobalState } = useGlobalContext()
  const [data, setData] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [enquirerDetails, setEnquirerDetails] = useState<any>({ name: null, mobile: null, email: null })

  const fetchData = async (page: number, pageSize: number) => {
    setGlobalState({ isLoading: true })

    try {
      const params = {
        url: `marketing/enquiry/${rowData?.row.id}/enquirer-details/`,
        params: {
          pageNumber: page + 1, // 1-based index
          pageSize
        }
      }
      const response = await getRequest(params)
      if (response.status) {
        const { data } = response.data.similarEnquiries
        setData(data)
        setRowCount(response.data.similarEnquiries.totalCount)
        setEnquirerDetails({ ...response?.data?.enquirerDetails })
      }
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  useEffect(() => {
    fetchData(paginationModel.page, paginationModel.pageSize)
  }, [paginationModel.page, paginationModel.pageSize])

  const handlerDetails = () => {
    console.log('Enter Routes Here')
    router.push(`/enquiries/view/${rowData?.row?.id}`)
  }
  console.log('data00', rowData)

  return (
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
          <HighlightOffIcon style={{ color: '#666666' }} />
        </IconButton>
      </Box>

      <DialogContent>
        <Box sx={{ mb: 5 }}>
          {enquirerDetails?.name ? (
            <Grid container spacing={5} xs={12}>
              <Grid item xs={4}>
                {enquirerDetails?.name ? (
                  <TextField
                    fullWidth
                    label='Enquiry Name'
                    value={enquirerDetails?.name}
                    placeholder='Enquiry Name Here'
                    defaultValue={enquirerDetails?.name}
                    disabled
                  />
                ) : null}
              </Grid>
              <Grid item xs={4}>
                {enquirerDetails?.mobile ? (
                  <TextField
                    fullWidth
                    label='Phone Number'
                    value={enquirerDetails?.mobile}
                    defaultValue={enquirerDetails?.mobile}
                    disabled
                  />
                ) : null}
              </Grid>
              <Grid item xs={4}>
                {enquirerDetails?.email ? (
                  <TextField
                    fullWidth
                    label='Email Id'
                    value={enquirerDetails?.email}
                    placeholder='Email Id Here'
                    defaultValue={enquirerDetails?.email}
                    disabled
                  />
                ) : null}
              </Grid>
            </Grid>
          ) : null}
        </Box>
        <Box sx={{ mb: 5 }}>
          <Typography variant='subtitle2' sx={{ lineHeight: '20px', letterSpacing: '0.1px' }}>
            Enquiries With Same Phone Number & Email Id
          </Typography>
        </Box>
        <Box>
          <DataGrid
            autoHeight
            columns={enquirerColumns}
            rows={data}
            pagination={true}
            checkboxSelection={false}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            slots={{ pagination: CustomPagination }}
            onPaginationModelChange={setPaginationModel}
            className='dataTable'
            sx={{ boxShadow: 'none' }}
            loading={loading}
            getRowId={row => row.enquiry_id}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={closeModal} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button onClick={handlerDetails} size='large' variant='contained' color='secondary'>
            View Details
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default EnquirerDialog
