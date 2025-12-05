'use client'
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material'

import { Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { GET_ENQUIRY_TYPE_FORM } from 'src/utils'
import { getRequest } from 'src/services/apiService'
import StepperForms from 'src/components/EnquiryForms/StepperForms'

const CreateEnquiry = () => {
  const router = useRouter()
  const requestSet = {
    key: 'Dummy'
  }

  const [enquiryType, setEnquiryType] = useState<any>({})
  const { setPagePaths, setGlobalState } = useGlobalContext()
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [successDialog, setSuccessDialog] = useState<boolean>(false)
  const [enquiryTypeList, setEnquiryTypeList] = useState<any>([])
  const [regDisabled, setRegDisabled] = useState<boolean>(false)
  const getDropDownData = async () => {
    setGlobalState({
      isLoading: true
    })
    const params = {
      url: GET_ENQUIRY_TYPE_FORM
    }

    const response = await getRequest(params)
    if (response.status) {
      setEnquiryTypeList(response.data)
      setEnquiryType(response.data[0])
    }
    setGlobalState({
      isLoading: false
    })
  }
  useEffect(() => {
    getDropDownData()
  }, [])

  //Handler for screen width
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  //Handler For Inputs
  const handleEnquiryType = (event: any) => {
    setEnquiryType(event.target.value as string)
  }

  const handleSuccessDialogClose = () => {
    setSuccessDialog(false)
    router.push('/enquiry-listing')
  }

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Enquiry Listing',
        path: '/enquiries'
      },
      {
        title: 'Create Enquiry',
        path: '/enquiries/create'
      }
    ])
  }, [])

  const handleTypeDropDown = (val: boolean) => {
    setRegDisabled(val)
  }
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  return (
    <Fragment>
      {/* <Card sx={{ mt: 4, width: '100%' }}> */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <Box
          sx={{
            background: '#fff',
            padding: '24px 24px 20px 24px',
            borderRadius: '0px',
            width: '100%',
            height: '100%'
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControl required sx={{ width: '300px' }}>
                  <InputLabel id='demo-simple-select-outlined-label'>Enquiry Type</InputLabel>
                  <Select
                    label='Enquiry Type'
                    value={enquiryType}
                    disabled={regDisabled}
                    IconComponent={DownArrow}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleEnquiryType}
                  >
                    <MenuItem value=''>Select Option</MenuItem>
                    {enquiryTypeList.map((val: any, index: number) => (
                      <MenuItem key={index} value={val}>
                        {val.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* {enquiryType?.enquiry_forms && enquiryType?.enquiry_forms.length ? (
                  <Button
                    sx={{ '&.MuiButton-containedSecondary:hover': { boxShadow: 'none' } }}
                    size='large'
                    variant='contained'
                    color='secondary'
                  >
                    Schedule School Visit
                  </Button>
                ) : null} */}
                {/* <IconButton
                  disableFocusRipple
                  disableRipple
                  sx={{ mr: 2, background: "#F4F0EF'" }}
                  onClick={() => router.push(`/enquiries/student-onboarding/student`)}
                >
                  <span className='icon-studentInfo'></span>
                </IconButton> */}
              </Box>
            </Grid>
            {/* Add Component Here */}

            <StepperForms enquiryTypeData={enquiryType} handleTypeDropDown={handleTypeDropDown} />
          </Grid>
        </Box>
        {/* <Box
          sx={{
            background: '#fff',
            borderRadius: '10px',
            width: '4%',
            ml: 3,
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            marginRight: '-19px'
          }}
        >
          <Box sx={{ mt: 5, cursor: 'pointer' }}>
            <span className='icon-calendar-1'></span>
          </Box>
          <Box sx={{ mt: 5, cursor: 'pointer' }}>
            <span className='icon-task-square'></span>
          </Box>
          <Box sx={{ mt: 5, cursor: 'pointer' }}>
            <span className='icon-notification'></span>
          </Box>
          <Box sx={{ mt: 5, cursor: 'pointer' }}>
            <span className='icon-messages'></span>
          </Box>
        </Box> */}
      </Box>
    </Fragment>
  )
}

export default CreateEnquiry
