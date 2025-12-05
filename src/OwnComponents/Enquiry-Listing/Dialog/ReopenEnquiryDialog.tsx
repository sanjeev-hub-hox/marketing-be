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
import { getRequest, patchRequest, postRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { getObjectByKeyVal } from 'src/utils/helper'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { useRouter } from 'next/router'

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
  enquiryId: any
  authToken: any
  getEnquiryDetails: any
}

function ReopenEnquiryDialog({ 
  openModal, 
  closeModal, 
  header, 
  enquiryId, 
  authToken, 
  getEnquiryDetails 
}: customModal) {
  // ** Hooks
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  
  // ** Status options configuration
  const statusOptions = [
    { id: 1, value: 'Parent Reconnected' },
    { id: 2, value: 'Lead Nurturing - Parent Interested' }, 
    { id: 3, value: 'Others' }
  ]
  
  // ** State management
  const [status, setStatus] = useState<{id: number, value: string} | null>(null)
  const [reopenEnquirySuccess, setReopenEnquirySuccess] = useState<boolean>(false)
  
  const router = useRouter()
  const { setGlobalState, setApiResponseType } = useGlobalContext()

  const handleSelectReason = (event: any) => {
    const selectedId = event.target.value
    const selectedOption = statusOptions.find(option => option.id === selectedId)
    setStatus(selectedOption || null)
  }

  const handleSubmit = async () => {
    if (!status) {
      console.error('No status selected')

      return
    }

    setGlobalState({ isLoading: true })
    
    try {
      const params = {
        url: `marketing/enquiry/enquiryReopen/${enquiryId?.toString()}`,
        data: { 
          validate: false, 
          reopenReason: {
            id: status.id,
            value: status.value
          }
        },
        serviceURL: 'marketing',
        authToken: authToken
      }
      
      const response = await postRequest(params)
      
      if (response?.status === 200) {
        setReopenEnquirySuccess(true)
        getEnquiryDetails()
        if (closeModal) {
          closeModal()
        }
      } else {
        console.error('Enquiry Re-Open Failed')
      }
    } catch (error) {
      console.error('Error reopening enquiry:', error)
      // You can add error toast notification here
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  const handleReopenEnquirySuccess = () => {
    setReopenEnquirySuccess(false)
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
                Select reason to re-open enquiry
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ mr: 4 }}>
                <FormControl sx={{ width: '350px', maxWidth: '100%' }}>
                  <InputLabel id='demo-simple-select-outlined-label'>Reason</InputLabel>
                  <Select
                    IconComponent={DownArrow}
                    label='Status'
                    value={status?.id || ''} // Fixed: Use status.id for the value
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleSelectReason}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button onClick={closeModal} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button 
              disabled={!status}
              onClick={handleSubmit} 
              size='large' 
              variant='contained' 
              color='secondary'
            >
              Ok
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      
      {reopenEnquirySuccess && (
        <SuccessDialog
          openDialog={reopenEnquirySuccess}
          title={'Enquiry Reopened Successfully!'}
          handleClose={handleReopenEnquirySuccess}
        />
      )}
    </>
  )
}

export default ReopenEnquiryDialog