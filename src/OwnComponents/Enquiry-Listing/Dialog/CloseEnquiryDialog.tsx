// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import {
  Button,
  Card,
  DialogActions,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import PhoneNumberInput from 'src/@core/CustomComponent/PhoneNumberInput/PhoneNumberInput'
import { getRequest, patchRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { getObjectByKeyVal } from 'src/utils/helper'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { useRouter } from 'next/router'

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
  enquiryId: any
  //setCloseEnquirySuccess: any
}

function CloseEnquiryDialog({ openModal, closeModal, header, enquiryId }: customModal) {
  // ** Hooks
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  const [status, setStatus] = useState<any>(null)
  const [reason, setReason] = useState<any>(null)
  const [statusList, setStatusList] = useState<any>([])

  const [reasonList, setReasonList] = useState<any>([])
  const [closeEnquirySuccess, setCloseEnquirySuccess] = useState<boolean>(false)
  const router = useRouter()

  const getResons = async (id: any) => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `/api/co-reasons?filters[parent_id]=${id}`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response = await getRequest(params)
    if (response?.data) {
      setReasonList(response?.data)
      // setReason(response?.data[0]?.attributes?.name)
    }
    setGlobalState({ isLoading: false })
  }
  const getStatus = async () => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `/api/co-reasons?filters[slug]=closed_enquiry`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response = await getRequest(params)
    if (response?.data) {
      setStatusList(response?.data)
      // getResons(response?.data[0]?.attributes?.slug)
      // setStatus(response?.data[0]?.attributes?.slug)
    }
    setGlobalState({ isLoading: false })
  }

  useEffect(() => {
    getStatus()
  }, [])

  const handleStatus = (event: any) => {
    getResons(event.target.value)
    setStatus(event.target.value as string)
  }
  const handleReason = (event: any) => {
    setReason(event.target.value as string)
  }
  const { setGlobalState, setApiResponseType } = useGlobalContext()

  const handleSubmit = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/${enquiryId}/status?status=Closed`,
      data: {
        status: getObjectByKeyVal(statusList, 'id', status)?.attributes?.name,
        message: reason
      }
    }

    const response = await patchRequest(params)
    if (response?.status) {
      setCloseEnquirySuccess(true)
    } else {
      setApiResponseType({ status: true, message: 'Something Went Wrong!' })
    }
    setGlobalState({ isLoading: false })
  }

  console.log('VALL>>', status, reason)

  const handleCloseEnquirySuccess = () => {
    setCloseEnquirySuccess(false)
    router.push('/enquiries')
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
            <Box sx={{ mb: 5 }}>
              <Typography variant='subtitle2' sx={{ lineHeight: '20px', letterSpacing: '0.1px' }}>
                Select reason to close enquiry
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ mr: 4 }}>
                {statusList && statusList?.length ? (
                  <FormControl sx={{ width: '350px', maxWidth: '100%' }}>
                    <InputLabel id='demo-simple-select-outlined-label'>Status</InputLabel>
                    <Select
                      IconComponent={DownArrow}
                      label='Status'
                      value={status}
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                      onChange={handleStatus}
                    >
                      {statusList?.map((val: any, ind: number) => {
                        return (
                          <MenuItem key={ind} value={val?.id}>
                            {val?.attributes?.name}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                ) : null}
              </Box>
              <Box>
                {reasonList && reasonList?.length ? (
                  <FormControl sx={{ width: '350px', maxWidth: '100%' }}>
                    <InputLabel id='demo-simple-select-outlined-label'>Reason</InputLabel>
                    <Select
                      IconComponent={DownArrow}
                      label='Reason'
                      value={reason}
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                      onChange={handleReason}
                    >
                      {reasonList?.map((val: any, ind: number) => {
                        return (
                          <MenuItem key={ind} value={val?.attributes?.name}>
                            {val?.attributes?.name}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl sx={{ width: '350px', maxWidth: '100%' }}>
                    <InputLabel id='demo-simple-select-outlined-label'>Reason</InputLabel>
                    <Select
                      IconComponent={DownArrow}
                      disabled={true}
                      value={reason}
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                      onChange={handleReason}
                    >
                      <MenuItem>Select Reason</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button onClick={closeModal} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button disabled={!status} onClick={handleSubmit} size='large' variant='contained' color='secondary'>
              Ok
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {closeEnquirySuccess && (
        <SuccessDialog
          openDialog={closeEnquirySuccess}
          title={'Enquiry Closed Successfully!'}
          handleClose={handleCloseEnquirySuccess}
        />
      )}
    </>
  )
}

export default CloseEnquiryDialog
