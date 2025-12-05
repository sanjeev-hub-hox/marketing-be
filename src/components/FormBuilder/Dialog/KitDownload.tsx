import React, { useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { getRequest, postRequest } from 'src/services/apiService'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import FallbackSpinner from 'src/@core/components/spinner'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

const KitDownload = ({ enquiryId, setRefreshList,kitNumberProp }: any) => {
  const [kitNumber, setKitNumber] = useState<any>('')
  const [successDialog, setSuccessDialog] = useState<any>(false)
  const { setGlobalState } = useGlobalContext()
  const handleSuccessDialogClose = () => {
    setRefreshList((prevState: any) => {
      return !prevState
    })
    setSuccessDialog(false)
  }

  const handleDownload = () => {
    // alert('Download clicked')
  }

  const handleSubmit = async () => {
    setGlobalState({ isLoading: true })
    const parms = {
      url: `marketing/enquiry/${enquiryId}/kit-number/add`,
      data: {
        kitNumber: kitNumber
      }
    }

    const response = await postRequest(parms)
    if (response) {
      setSuccessDialog(true)
    }
    setGlobalState({ isLoading: false })
  }

  const handleDownloadKit = async (data: any) => {
    try {
      const params = {
        url: `marketing/enquiry/file`,
        data: {
          path: 'marketing/1739523783457.pdf',
          isDownloadable: true
        }
      }
      const resp = await postRequest(params)
      if (resp?.status) {
        const fileUrl = resp?.data?.url
        const fileName = data.file

        const link = document.createElement('a')
        link.href = fileUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('There was an error downloading the file:', error)
    }
  }

  return (
    <>
      <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
        {/* Display Kit Number */}
        {/* Input Field */}
        <Box display='flex' alignItems='center' gap={2}>
          <TextField
            label='Kit Number'
            variant='outlined'
            value={kitNumber}
            onChange={e => setKitNumber(e.target.value)}
          />
          <Button disabled={!kitNumber} variant='contained' color='secondary' onClick={handleSubmit}>
            Submit
          </Button>
        </Box>

        {/* <Button
          disabled={!kitNumberProp}
          variant='contained'
          color='secondary'
          sx={{
            mt: 4,
            width: 200,
            height: 50
          }}
          onClick={handleDownloadKit}
        >
          Download
        </Button> */}
        {successDialog && (
          <SuccessDialog
            openDialog={successDialog}
            title={'Kit Number Updated'}
            handleClose={handleSuccessDialogClose}
          />
        )}
      </Box>
    </>
  )
}

export default KitDownload
