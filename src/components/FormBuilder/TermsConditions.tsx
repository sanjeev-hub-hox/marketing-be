import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { getRequest, patchRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { a } from '@react-spring/web'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'

const TermsAndConditionsPopup = ({ open, handleClose, enquiryId, schoolId }: any) => {
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);
  const { setGlobalState, setApiResponseType } = useGlobalContext()
  const [successDialog, setsuccessDialog] = useState<any>()
  const [pdfURL, setPDFUrl] = useState<any>('')
  const [isChecked, setIsChecked] = useState(false)

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked)
  }

  const getPDFURL = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/${enquiryId}/${schoolId}/generate-terms-and-conditions-pdf`
    }

    const response = await getRequest(params)
    if (response?.status) {
      setPDFUrl(response?.data?.url)
    } else {
      setApiResponseType({ status: true, message: 'Terms & Conditions Not Found!' })
    }
    setGlobalState({ isLoading: false })
  }

  useEffect(() => {
    if (enquiryId && schoolId) {
      getPDFURL()
    }
  }, [enquiryId, schoolId])

  const handleAccept = async () => {
    setGlobalState({ isLoading: true })
    console.log('Terms and Conditions accepted!')
    const params = {
      url: `marketing/enquiry/${enquiryId}/accept-terms-and-condition`
    }
    const response = await getRequest(params)
    if (response?.status) {
      // handleClose()
      setsuccessDialog(true)
    } else {
    }
    setGlobalState({ isLoading: false })
  }

  const handleSuccessDialogClose = () => {
    setsuccessDialog(false)
    //handleClose()
  }

  return (
    <div>
      {/* <Button variant="outlined" onClick={handleOpen}>
                Show Terms and Conditions
            </Button> */}
      <Dialog open={open} onClose={handleClose} maxWidth='xl' fullWidth>
        {/* <DialogTitle>Terms and Conditions</DialogTitle> */}
        <DialogContent>
          <iframe src={pdfURL} title='PDF Viewer' width='100%' height='600px' style={{ border: 'none' }}></iframe>
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'left', // Centers content horizontally
            mt: '10px'
          }}
        >
          <FormControlLabel
            control={
              <Checkbox disabled={!pdfURL} checked={isChecked} onChange={handleCheckboxChange} color='primary' />
            }
            label='I accept the terms and conditions'
          />
        </DialogActions>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'left' // Centers content horizontally
          }}
        >
          <Button disabled={!isChecked} variant='contained' onClick={handleAccept} color='secondary'>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {successDialog && (
        <SuccessDialog
          openDialog={successDialog}
          title={'Terms & Conditions Accepted Successfully'}
          handleClose={handleSuccessDialogClose}
        />
      )}{' '}
    </div>
  )
}

export default TermsAndConditionsPopup
