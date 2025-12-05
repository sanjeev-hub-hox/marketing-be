// ** React Imports
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
import { getRequest, patchRequest, postRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { getLocalStorageVal, getUserInfo } from 'src/utils/helper'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { useRouter } from 'next/router'

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
  enquirerColumns: any
  enquirerRows?: any
  enquiryId?: any
  handleMergeSuccess: any
}

function MergeDialog({
  openModal,
  closeModal,
  header,
  enquirerColumns,
  enquirerRows,
  enquiryId,
  handleMergeSuccess
}: customModal) {
  // ** Hooks

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [enquirerName, setEnquirerName] = useState('Ashok Shah')
  const [emailId, setEmailId] = useState('ashokshah@gmail.com')
  const [mergeData, setMergeData] = useState<any>([])
  const [enquirerData, setEnquirerData] = useState<any>({ name: '', email: '', mobile: '' })
  const [selectedIds, setSelectedIds] = useState([])
  const { setGlobalState, setApiResponseType } = useGlobalContext()
  const [mergeSuccess, setMergeSuccess] = useState<boolean>(false)
  const router = useRouter()
  const geMergeList = async () => {
    setGlobalState({ isLoading: true })
    const userInfo = getUserInfo()
    const params = {
      url: `marketing/enquiry/${enquiryId}/merge-enquiry-details`,
      data: {
        user_id: userInfo?.userInfo?.id
      }
    }
    const response = await postRequest(params)
    console.log(response?.data?.similarEnquiries, 'response11')
    if (response.status) {
      setMergeData(response?.data?.similarEnquiries)
      setEnquirerData(response?.data?.enquirerDetails)
    }
    setGlobalState({ isLoading: false })
  }

  useEffect(() => {
    geMergeList()
  }, [])

  const handleMergeSuccessDialogClose = () => {
    setMergeSuccess(false)
    router.push('/enquiries')
  }

  const mergeEnquiry = async () => {
    setGlobalState({ isLoading: true })
    const userInfo = getUserInfo()

    const params = {
      url: `marketing/enquiry/merge/${enquiryId}`,
      data: {
        enquiryIds: selectedIds,
        user_id: userInfo?.userInfo?.id
      }
    }
    const response = await patchRequest(params)
    if (response.status) {
      // if (closeModal) {
      //   closeModal()

      // }
      setMergeSuccess(true)
    } else if (response?.error && response?.error?.errorMessage) {
      setApiResponseType({ status: true, message: response?.error?.errorMessage })
    }
    setGlobalState({ isLoading: false })
  }

  const handleSelectionChange = (selection: any) => {
    setSelectedIds(selection)
    console.log('Selected IDs:', selection)
  }

  //Handler for CTA Details Button

  //   const handlerDetails = () => {
  //     console.log('Eneter Routes Here')
  //   }

  const handleMerge = () => {
    if (selectedIds && selectedIds.length) {
      mergeEnquiry()
    }
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
          <IconButton disableFocusRipple disableRipple onClick={closeModal}>
            <HighlightOffIcon style={{ color: '#666666' }} />
          </IconButton>
        </Box>

        <DialogContent>
          <Box sx={{ mb: 5 }}>
            <Grid container spacing={5} xs={12}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label='Enquiry Name'
                  value={enquirerData?.name}
                  placeholder='Enquiry Name Here'
                  onChange={e => setEnquirerName(e.target.value)}
                  defaultValue={enquirerName}
                  disabled
                />
              </Grid>
              <Grid item xs={4}>
                {/* <PhoneNumberInput
                  label='Phone Number'
                  helperText={false}
                  rowData={enquirerData?.mobile}
                  disabled={true}
                /> */}
                <TextField
                  fullWidth
                  label='Phone Number'
                  value={enquirerData?.mobile}
                  placeholder='Phone Number Here'
                  disabled
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label='Email Id'
                  value={enquirerData?.email}
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
              rows={mergeData}
              pagination={true}
              checkboxSelection={true}
              pageSizeOptions={[7, 10, 25, 50]}
              paginationModel={paginationModel}
              slots={{ pagination: CustomPagination }}
              onPaginationModelChange={setPaginationModel}
              className='dataTable'
              sx={{ boxShadow: 'none', '& .MuiDataGrid-main': { overflow: 'hidden' } }}
              getRowId={row => row.enquiry_id}
              onRowSelectionModelChange={handleSelectionChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button onClick={closeModal} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
              Close
            </Button>
            <Button onClick={handleMerge} size='large' variant='contained' color='secondary'>
              Merge
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {mergeSuccess && (
        <SuccessDialog
          openDialog={mergeSuccess}
          title='Enquiry Merged Successfully!'
          handleClose={handleMergeSuccessDialogClose}
        />
      )}
    </>
  )
}

export default MergeDialog
