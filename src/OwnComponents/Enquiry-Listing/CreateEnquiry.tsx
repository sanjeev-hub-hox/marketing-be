// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
  IconButton,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio
} from '@mui/material'

import { Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Dayjs } from 'dayjs'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import PhoneNumberInput from 'src/@core/CustomComponent/PhoneNumberInput/PhoneNumberInput'
import { DataGrid, GridColDef, GridCellParams, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import Step from 'src/@core/CustomComponent/TriangleStepper/Step'
import { getRequest, postRequest, putRequest } from 'src/services/apiService'

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

type CreateEnquiryDetails = {
  handleRoleDialog: (a: boolean) => void
  edit: boolean
  setEdit: React.Dispatch<React.SetStateAction<boolean>>
  view: boolean
  setView: React.Dispatch<React.SetStateAction<boolean>>
  selectedRowId: any
}

const CreateEnquiry = ({ handleRoleDialog, edit, setEdit, view, setView, selectedRowId }: CreateEnquiryDetails) => {
  const router = useRouter()
  const CalendarIcon = () => <span className='icon-calendar-1'></span>

  // ** States
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const [activeStep, setActiveStep] = useState<number>(0)
  const [selectedOptions, setSelectedOptions] = useState<string>('Enquiry & Student Details')
  const [enquiryDate, setEnquiryDate] = useState<string>('01 May 2024')
  const [enquiryType, setEnquiryType] = useState<string>('IVT')
  const [eligibleGrade, setEligibleGrade] = useState<string>('IV')
  const [schoolLocation, setSchoolLocation] = useState<string>('Vibgyor High - Goregaon West')
  const [guestSchoolLocation, setGuestSchoolLocation] = useState<string>('Vibgyor High - Goregaon West')
  const [grade, setGrade] = useState<string>('Nursery')
  const [existingGrade, setExistingGrade] = useState<string>('Nursery')
  const [gender, setGender] = useState<string>('Female')
  const [board, setBoard] = useState<string>('CBSE')
  const [existingBoard, setExistingBoard] = useState<string>('CBSE')
  const [course, setCourse] = useState<string>('Integrated')
  const [stream, setStream] = useState<string>('Science')
  const [shift, setShift] = useState<string>('Shift 1')
  const [parentType, setParentType] = useState<string>('Father')
  const [guest, setGuest] = useState<boolean>(false)
  const [existingSchoolName, setExistingSchoolName] = useState<string>('Name')
  const [studentFirstName, setStudentFirstName] = useState<string>('Khevna')
  const [studentLastName, setStudentLastName] = useState<string>('Shah')
  const [parentFirstName, setParentFirstName] = useState<string>('Ashok')
  const [parentLastName, setParentLastName] = useState<string>('Shah')
  const [parentEmailId, setParentEmailId] = useState<string>('Enter Email Id')
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [parentTextField, setParentTextField] = useState(0)
  const [enquiryMode, setEnquiryMode] = useState<string>('Digital (Website, Portal)')
  const [enquirySoureType, setEnquirySourceType] = useState<string>('Digital')
  const [enquirySoure, setEnquirySource] = useState<string>('Web/ Internet')
  const [enquirySubSoure, setEnquirySubSource] = useState<string>('Facebook')
  // Nikhil
  const [enquiryEmployeeSource, setEnquiryEmployeeSource] = useState<string>('Employee Referral')
  const [houseNo, setHouseNo] = useState<string>('Enter Here')
  const [landmark, setLandmark] = useState<string>('Enter Here')
  const [streetName, setStreetName] = useState<string>('Name')
  const [country, setCountry] = useState<string>('India')
  const [state, setState] = useState<string>('Maharashtra')
  const [city, setCity] = useState<string>('Mumbai')
  const [pinCode, setPinCode] = useState<string>('400025')
  const { setPagePaths } = useGlobalContext()
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [successDialog, setSuccessDialog] = useState<boolean>(false)

  useEffect(() => {
    if ((edit || view) && selectedRowId) {
      console.log('selectedRowId')
      console.log(selectedRowId)
      const fetchRoleDetails = async () => {
        // incrementLoading();
        try {
          const url = { url: `marketing/enquiry/${selectedRowId}`, serviceURL: 'marketing' }
          const data = await getRequest(url)
          console.log('data')
          console.log(data)

          // const roleIDFromApi = data?.data?.id;
          // setRoleIdApi(roleIDFromApi);
        } catch (error) {
          console.error('Error fetching role details:', error)
        } finally {
          // decrementLoading();
        }
      }

      fetchRoleDetails()
    }
  }, [edit, view, selectedRowId])

  //Handler for file upload
  const handleFileUpload = () => {
    console.log('file')
  }

  //Row and Column for datagrid
  const columns: GridColDef[] = [
    {
      flex: 1,
      field: 'documents',
      headerName: 'Documents'
    },

    {
      flex: 0.275,
      minWidth: 90,
      field: 'action',
      headerName: 'Action',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        return (
          <>
            <Tooltip title='Upload'>
              <IconButton disableFocusRipple disableRipple onClick={handleFileUpload}>
                {/* <EditIcon /> */}
                <span className='icon-export-1'></span>
              </IconButton>
            </Tooltip>
            <Tooltip title='Download'>
              <IconButton disabled disableFocusRipple disableRipple>
                {/* <EditIcon /> */}
                <span className='icon-import-1'></span>
              </IconButton>
            </Tooltip>
            <Tooltip title='View'>
              <IconButton disabled disableFocusRipple disableRipple>
                {/* <EditIcon /> */}
                <span className='icon-eye'></span>
              </IconButton>
            </Tooltip>
          </>
        )
      }
    }
  ]

  const rows: any[] = [
    {
      id: 1,
      documents: 'Aadhaar Card Of Student'
    },
    {
      id: 2,
      documents: 'Birth Certificate Of Student'
    },
    {
      id: 3,
      documents: 'Report Card (Previous Year)'
    },
    {
      id: 4,
      documents: 'Report Card [Previous Year (-) 1]'
    },
    {
      id: 5,
      documents: 'Report Card [Previous Year (-) 2]'
    },
    {
      id: 6,
      documents: 'Aadhaar Card Of Father'
    },
    {
      id: 7,
      documents: 'PAN Card Of Father'
    },
    {
      id: 8,
      documents: 'Gazetted Copy Of Name Change'
    },
    {
      id: 9,
      documents: 'Student Passport And Visa'
    },
    {
      id: 10,
      documents: 'Aadhaar Card Of Student'
    }
  ]

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

  //Handle Clickable Chips Handler

  const chipsLabel = ['Enquiry & Student Details', 'Upload Documents']

  const handleToggle = (option: string) => {
    // setFilter(option)
    setSelectedOptions(option)
  }

  //Handler For Inputs
  const handleEnquiryType = (event: any) => {
    setEnquiryType(event.target.value as string)
  }
  const handleSchoolLocation = (event: any) => {
    setSchoolLocation(event.target.value as string)
  }
  const handleGuestSchoolLocation = (event: any) => {
    setGuestSchoolLocation(event.target.value as string)
  }
  const handleGuest = (event: any) => {
    setGuest(event.target.checked as boolean)
  }
  const handleGrade = (event: any) => {
    setGrade(event.target.value as string)
  }
  const handleExistingGrade = (event: any) => {
    setExistingGrade(event.target.value as string)
  }
  const handleGender = (event: any) => {
    setGender(event.target.value as string)
  }
  const handleBoard = (event: any) => {
    setBoard(event.target.value as string)
  }
  const handleExistingBoard = (event: any) => {
    setExistingBoard(event.target.value as string)
  }
  const handleCourse = (event: any) => {
    setCourse(event.target.value as string)
  }
  const handleStream = (event: any) => {
    setStream(event.target.value as string)
  }
  const handleShift = (event: any) => {
    setShift(event.target.value as string)
  }
  const handleParentType = (event: any) => {
    setParentType(event.target.value as string)
  }
  const handleEnquiryMode = (event: any) => {
    setEnquiryMode(event.target.value as string)
  }
  const handleEnquirySourceType = (event: any) => {
    setEnquirySourceType(event.target.value as string)
  }
  const handleEnquirySource = (event: any) => {
    setEnquirySource(event.target.value as string)
  }
  const handleEnquirySubSource = (event: any) => {
    setEnquirySubSource(event.target.value as string)
  }
  // Nikhil
  const handleEnquiryEmployeeSource = (event: any) => {
    setEnquiryEmployeeSource(event.target.value as string)
  }
  const handleCountry = (event: any) => {
    setCountry(event.target.value as string)
  }
  const handleCity = (event: any) => {
    setCity(event.target.value as string)
  }
  const handleState = (event: any) => {
    setState(event.target.value as string)
  }
  const handlerTextField = () => {
    if (parentTextField === 3) {
      return
    } else {
      setParentTextField(parentTextField + 1)
    }
  }

  console.log(parentTextField, 'Parent TextField')

  // Handle Stepper

  const handleCancel = () => {
    // handleRoleDialog(false)
    router.push('/enquiry-listing')
  }
  const handleNewChild = () => {
    router.push('/enquiry-listing/create-enquiry')
    setSelectedOptions('Enquiry & Student Details')
  }
  const handleNext = () => {
    setSelectedOptions('Upload Documents')
  }

  const handleSubmit = () => {
    console.log('submit')
    setSuccessDialog(true)
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
        path: '/enquiry-listing'
      },
      {
        title: 'Create Enquiry',
        path: '/enquiry-listing/create-enquiry'
      }
    ])
  }, [])

  return (
    <Fragment>
      {/* <Card sx={{ mt: 4, width: '100%' }}> */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <Box
          sx={{ background: '#fff', padding: '24px 24px 20px 24px', borderRadius: '0px', width: '96%', height: '100%' }}
        >
          <Grid container>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControl required sx={{ width: '300px' }}>
                  <InputLabel id='demo-simple-select-outlined-label'>Enquiry Type</InputLabel>
                  <Select
                    IconComponent={DownArrow}
                    label='Enquiry Type'
                    defaultValue={enquiryType}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleEnquiryType}
                  >
                    <MenuItem value=''>Select Option</MenuItem>
                    <MenuItem value='New Admission'>New Admission</MenuItem>
                    <MenuItem value='PSA'>PSA</MenuItem>
                    <MenuItem value='IVT'>IVT</MenuItem>
                    <MenuItem value='ReAdmission'>Re Admission</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  sx={{ '&.MuiButton-containedSecondary:hover': { boxShadow: 'none' }, height: '56px' }}
                  size='large'
                  variant='contained'
                  color='secondary'
                >
                  Schedule School Visit
                </Button>
              </Box>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexWrap: 'wrap',
                mt: 3,
                mb: 7
              }}
            >
              {/* Step without sub-steps */}
              <Step active={true} label='Step with no sub-steps' stepNumber={1} />

              {/* Step with sub-steps */}
              <Step
                active={false}
                label='Step with sub-steps'
                stepNumber={2}
                subSteps={['Sub-step 1', 'Sub-step 2', 'Sub-step 3']}
              />

              {/* Another Step without sub-steps */}
              <Step active={false} label='Another step with no sub-steps' stepNumber={3} />
              <Step active={false} label='Another step with no sub-steps' stepNumber={4} />
              <Step active={false} label='Another step with no sub-steps' stepNumber={5} />
              <Step active={false} label='Another step with no sub-steps' stepNumber={6} />
              <Step active={false} label='Another step with no sub-steps' stepNumber={7} />
            </Box>

            <Grid item xs={12}>
              {chipsLabel.map((label, index) => (
                <StyledChipProps
                  key={index}
                  label={label}
                  onClick={() => handleToggle(label)}
                  color={selectedOptions?.includes(label) ? 'primary' : 'default'}
                  variant='filled'
                  sx={{ mr: 4 }}
                />
              ))}
            </Grid>
            {selectedOptions === 'Enquiry & Student Details' && (
              <>
                <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12} md={12}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Enquiry Date'
                      value={enquiryDate}
                      placeholder='Enquiry Date Here'
                      onChange={e => setEnquiryDate(e.target.value)}
                      defaultValue={enquiryDate}
                      disabled
                    />
                  </Grid>
                  {/* <Grid item xs={12} md={4}>
                    <FormControl required fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Enquiry Type</InputLabel>
                      <Select
                      IconComponent={DownArrow}
                        label='Enquiry Type'
                        defaultValue={enquiryType}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleEnquiryType}
                      >
                        <MenuItem value=''>Select Option</MenuItem>
                        <MenuItem value='New Admission'>New Admission</MenuItem>
                        <MenuItem value='PSA'>PSA</MenuItem>
                        <MenuItem value='IVT'>IVT</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid> */}

                  <Grid item xs={12} md={4}>
                    <FormControl required fullWidth>
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
                <Grid item container xs={12}>
                  <Grid item xs={12} sx={{ mt: 4, mb: 4 }}>
                    <FormControlLabel control={<Checkbox onChange={e => handleGuest(e)} />} label='Guest Student' />
                  </Grid>
                  {guest && (
                    <Grid item xs={12} md={4} sx={{ mt: 2, mb: 6 }}>
                      <FormControl required fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Guest School Location</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Guest School Location'
                          defaultValue={guestSchoolLocation}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleGuestSchoolLocation}
                        >
                          <MenuItem value=''>Select Option</MenuItem>
                          <MenuItem value='Vibgyor High - Goregaon West'>Vibgyor High - Goregaon West</MenuItem>
                          <MenuItem value='Vibgyor High - Borivali West'>Vibgyor High - Borivali West</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                </Grid>
                <Grid item container xs={12} spacing={7} style={{ marginTop: '5px' }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Student First Name'
                      value={studentFirstName}
                      placeholder='Student First Name'
                      onChange={e => setStudentFirstName(e.target.value)}
                      defaultValue={studentFirstName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Student Last Name'
                      value={studentLastName}
                      placeholder='Student Last Name'
                      onChange={e => setStudentLastName(e.target.value)}
                      defaultValue={studentLastName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl required fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Grade</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Grade'
                        defaultValue={grade}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleGrade}
                      >
                        <MenuItem value=''>Select Grade</MenuItem>
                        <MenuItem value='Nursery'>Nursery</MenuItem>
                        <MenuItem value='Junior KG'>Junior KG</MenuItem>
                        <MenuItem value='Senior KG'>Senior KG</MenuItem>
                        <MenuItem value='I'>I</MenuItem>
                        <MenuItem value='II'>II</MenuItem>
                        <MenuItem value='III'>III</MenuItem>
                        <MenuItem value='IV'>IV</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Gender</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Gender'
                        defaultValue={gender}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleGender}
                      >
                        <MenuItem value=''>Select Gender</MenuItem>
                        <MenuItem value='Male'>Male</MenuItem>
                        <MenuItem value='Female'>Female</MenuItem>
                        <MenuItem value='Others'>Others</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={selectedDate}
                  onChange={(newValue: Dayjs  | null) => setSelectedDate(newValue)}
                  renderInput={(params:any) => <TextField {...params} required />}
                  label='Date Of Birth'
                  inputFormat='DD/MM/YYYY'
                  components={{
                    OpenPickerIcon: CalendarIcon
                  }}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider> */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        sx={{ width: '100%' }}
                        slots={{
                          openPickerIcon: CalendarIcon
                        }}
                        format='DD/MM/YYYY'
                        label='Date Of Birth'
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Eligible Grade'
                      value={eligibleGrade}
                      placeholder='Eligible Grade Here'
                      onChange={e => setEligibleGrade(e.target.value)}
                      defaultValue={eligibleGrade}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Board</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Board'
                        defaultValue={board}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleBoard}
                      >
                        <MenuItem value=''>Select Board</MenuItem>
                        <MenuItem value='CBSE'>CBSE</MenuItem>
                        <MenuItem value='CIE'>CIE</MenuItem>
                        <MenuItem value='CISCE'>CISCE</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Course</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Course'
                        defaultValue={course}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleCourse}
                      >
                        <MenuItem value=''>Select Course</MenuItem>
                        <MenuItem value='Integrated'>Integrated</MenuItem>
                        <MenuItem value='Regular'>Regular</MenuItem>
                        <MenuItem value='Regular Vibgyor'>Regular Vibgyor</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Stream</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Stream'
                        defaultValue={stream}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleStream}
                      >
                        <MenuItem value=''>Select Stream</MenuItem>
                        <MenuItem value='Science'>Science</MenuItem>
                        <MenuItem value='Commerce'>Commerce</MenuItem>
                        <MenuItem value='Humanities'>Humanities</MenuItem>
                        <MenuItem value='NA'>NA</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Shift</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Shift'
                        defaultValue={shift}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleShift}
                      >
                        <MenuItem value=''>Select Shift</MenuItem>
                        <MenuItem value='Shift 1'>Shift 1</MenuItem>
                        <MenuItem value='Shift 2'>Shift 2</MenuItem>
                        <MenuItem value='Shift 3'>Shift 3</MenuItem>
                        <MenuItem value='Shift 4'>Shift 4</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid item container xs={12} style={{ marginTop: '25px', marginBottom: '0px' }}>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                </Grid>
                <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12}>
                  <Grid item xs={12} md={4}>
                    <FormControl required fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Select Parent Type</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Select Parent Type'
                        defaultValue={parentType}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleParentType}
                      >
                        <MenuItem value=''>Select Parent Type</MenuItem>
                        <MenuItem value='Father'>Father</MenuItem>
                        <MenuItem value='Mother'>Mother</MenuItem>
                        <MenuItem value='Guardian'>Guardian</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Parent First Name'
                      value={parentFirstName}
                      placeholder='Parent First Name'
                      onChange={e => setParentFirstName(e.target.value)}
                      defaultValue={parentFirstName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Parent Last Name'
                      value={parentLastName}
                      placeholder='Parent Last Name'
                      onChange={e => setParentLastName(e.target.value)}
                      defaultValue={parentLastName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PhoneNumberInput label="Parent's Mobile No" helperText={false} required={true} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Parent Email ID'
                      value={parentEmailId}
                      placeholder='Parent Email ID'
                      onChange={e => setParentEmailId(e.target.value)}
                      defaultValue={parentEmailId}
                      required
                    />
                  </Grid>
                </Grid>
                {parentTextField === 1 && (
                  <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12}>
                    <Grid item xs={12} md={4}>
                      <FormControl required fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Select Parent Type</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Select Parent Type'
                          defaultValue={parentType}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleParentType}
                        >
                          <MenuItem value=''>Select Parent Type</MenuItem>
                          <MenuItem value='Father'>Father</MenuItem>
                          <MenuItem value='Mother'>Mother</MenuItem>
                          <MenuItem value='Guardian'>Guardian</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Parent First Name'
                        value={parentFirstName}
                        placeholder='Parent First Name'
                        onChange={e => setParentFirstName(e.target.value)}
                        defaultValue={parentFirstName}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Parent Last Name'
                        value={parentLastName}
                        placeholder='Parent Last Name'
                        onChange={e => setParentLastName(e.target.value)}
                        defaultValue={parentLastName}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PhoneNumberInput label="Parent's Mobile No" helperText={false} required={true} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Parent Email ID'
                        value={parentEmailId}
                        placeholder='Parent Email ID'
                        onChange={e => setParentEmailId(e.target.value)}
                        defaultValue={parentEmailId}
                        required
                      />
                    </Grid>
                  </Grid>
                )}
                {parentTextField === 2 && (
                  <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12}>
                    <Grid item xs={12} md={4}>
                      <FormControl required fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Select Parent Type</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Select Parent Type'
                          defaultValue={parentType}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleParentType}
                        >
                          <MenuItem value=''>Select Parent Type</MenuItem>
                          <MenuItem value='Father'>Father</MenuItem>
                          <MenuItem value='Mother'>Mother</MenuItem>
                          <MenuItem value='Guardian'>Guardian</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Parent First Name'
                        value={parentFirstName}
                        placeholder='Parent First Name'
                        onChange={e => setParentFirstName(e.target.value)}
                        defaultValue={parentFirstName}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Parent Last Name'
                        value={parentLastName}
                        placeholder='Parent Last Name'
                        onChange={e => setParentLastName(e.target.value)}
                        defaultValue={parentLastName}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PhoneNumberInput label="Parent's Mobile No" helperText={false} required={true} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Parent Email ID'
                        value={parentEmailId}
                        placeholder='Parent Email ID'
                        onChange={e => setParentEmailId(e.target.value)}
                        defaultValue={parentEmailId}
                        required
                      />
                    </Grid>
                  </Grid>
                )}
                {parentTextField !== 3 && (
                  <Grid item container xs={12} style={{ marginTop: '25px', marginBottom: '0px' }}>
                    <Button
                      sx={{ ml: -5, '&:hover': { backgroundColor: 'transparent' } }}
                      disableRipple
                      disableFocusRipple
                      disableTouchRipple
                      variant='text'
                      onClick={handlerTextField}
                    >
                      Add Another Parent
                    </Button>
                  </Grid>
                )}

                <Grid item container spacing={7} style={{ marginTop: '0px' }} xs={12}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Existing School Name'
                      value={existingSchoolName}
                      placeholder='Existing School Name'
                      onChange={e => setExistingSchoolName(e.target.value)}
                      defaultValue={existingSchoolName}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Existing School Board</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Existing School Board'
                        defaultValue={existingBoard}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleExistingBoard}
                      >
                        <MenuItem value=''>Select Board</MenuItem>
                        <MenuItem value='CBSE'>CBSE</MenuItem>
                        <MenuItem value='CIE'>CIE</MenuItem>
                        <MenuItem value='CISCE'>CISCE</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Existing School Grade</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Existing School Grade'
                        defaultValue={existingGrade}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleExistingGrade}
                      >
                        <MenuItem value=''>Select Grade</MenuItem>
                        <MenuItem value='Nursery'>Nursery</MenuItem>
                        <MenuItem value='Junior KG'>Junior KG</MenuItem>
                        <MenuItem value='Senior KG'>Senior KG</MenuItem>
                        <MenuItem value='I'>I</MenuItem>
                        <MenuItem value='II'>II</MenuItem>
                        <MenuItem value='III'>III</MenuItem>
                        <MenuItem value='IV'>IV</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid item container xs={12} style={{ marginTop: '20px', marginBottom: '5px' }}>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                </Grid>
                <Grid item container spacing={7} style={{ marginTop: '0px' }} xs={12}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Enquiry Mode</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Enquiry Mode'
                        defaultValue={enquiryMode}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleEnquiryMode}
                      >
                        <MenuItem value=''>Select Enquiry Mode</MenuItem>
                        <MenuItem value='Digital (Website, Portal)'>Digital (Website, Portal)</MenuItem>
                        <MenuItem value='Email'>Email</MenuItem>
                        <MenuItem value='Employee Portal'>Employee Portal</MenuItem>
                        <MenuItem value='Phone Call (IVR)'>Phone Call (IVR)</MenuItem>
                        <MenuItem value='Phone Call (Toll Free/ Landline/ Boardline)'>
                          Phone Call (Toll Free/ Landline/ Boardline)
                        </MenuItem>
                        <MenuItem value='Service Request'>Service Request</MenuItem>
                        <MenuItem value='Social Media'>Social Media</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Enquiry Source type</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Enquiry Source type'
                        defaultValue={enquirySoureType}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleEnquirySourceType}
                      >
                        <MenuItem value=''>Select Enquiry Source Type</MenuItem>
                        <MenuItem value='Digital'>Digital</MenuItem>
                        <MenuItem value='Offline'>Offline</MenuItem>
                        <MenuItem value='Referral'>Referral</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Enquiry Source</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Enquiry Source'
                        defaultValue={enquirySoure}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleEnquirySource}
                      >
                        <MenuItem value=''>Select Enquiry Source</MenuItem>
                        <MenuItem value='Web/ Internet'>Web/ Internet</MenuItem>
                        <MenuItem value='Social Media'>Social Media</MenuItem>
                        <MenuItem value='Referral'>Referral</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Enquiry Sub Source</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Enquiry Sub Source'
                        defaultValue={enquirySubSoure}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleEnquirySubSource}
                      >
                        <MenuItem value=''>Select Sub Source</MenuItem>
                        <MenuItem value='Facebook'>Facebook</MenuItem>
                        <MenuItem value='Instagram'>Instagram</MenuItem>
                        <MenuItem value='Just Dial'>Just Dial</MenuItem>
                        <MenuItem value='Cable TV Ad'>Cable TV Ad</MenuItem>
                        <MenuItem value='Parent Reference'>Parent Reference</MenuItem>
                        <MenuItem value='Corporate Tie'>Corporate Tie</MenuItem>
                        <MenuItem value='Pre School Tie Up'>Pre School Tie Up</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* Nikhil */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Referrer Employee</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Referrer Employee'
                        defaultValue={enquiryEmployeeSource}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleEnquiryEmployeeSource}
                      >
                        <MenuItem value=''>Select Sub Source</MenuItem>
                        <MenuItem value='Facebook'>Facebook</MenuItem>
                        <MenuItem value='Instagram'>Instagram</MenuItem>
                        <MenuItem value='Just Dial'>Just Dial</MenuItem>
                        <MenuItem value='Cable TV Ad'>Cable TV Ad</MenuItem>
                        <MenuItem value='Parent Reference'>Parent Reference</MenuItem>
                        <MenuItem value='Corporate Tie'>Corporate Tie</MenuItem>
                        <MenuItem value='Pre School Tie Up'>Pre School Tie Up</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid item container xs={12} style={{ marginTop: '20px' }}>
                  <Grid item xs={12}>
                    <Typography variant='h6' sx={{ lineHeight: '30px' }}>
                      Residential Information
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12} md={12}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='House No./Building'
                      value={houseNo}
                      placeholder='House No./Building'
                      onChange={e => setHouseNo(e.target.value)}
                      defaultValue={houseNo}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Street Name'
                      value={streetName}
                      placeholder='Street Name'
                      onChange={e => setStreetName(e.target.value)}
                      defaultValue={streetName}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Landmark'
                      value={landmark}
                      placeholder='Landmark'
                      onChange={e => setLandmark(e.target.value)}
                      defaultValue={landmark}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Country</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Country'
                        defaultValue={country}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleCountry}
                      >
                        <MenuItem value=''>Select Country</MenuItem>
                        <MenuItem value='India'>India</MenuItem>
                        <MenuItem value='America'>America</MenuItem>
                        <MenuItem value='Iran'>Iran</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Pin Code'
                      value={pinCode}
                      placeholder='Pin Code'
                      onChange={e => setPinCode(e.target.value)}
                      defaultValue={pinCode}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>State</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='State'
                        defaultValue={state}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleState}
                      >
                        <MenuItem value=''>Select State</MenuItem>
                        <MenuItem value='Maharashtra'>Maharashtra</MenuItem>
                        <MenuItem value='Utter Pradesh'>Utter Pradesh</MenuItem>
                        <MenuItem value='Telagana'>Telagana</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>City</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='City'
                        defaultValue={city}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleCity}
                      >
                        <MenuItem value=''>Select City</MenuItem>
                        <MenuItem value='Mumbai'>Mumbai</MenuItem>
                        <MenuItem value='Pune'>Pune</MenuItem>
                        <MenuItem value='Delhi'>Delhi</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid item container xs={12} style={{ marginTop: '20px' }}>
                  <Grid item xs={12}>
                    <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                      Is Permanent Address Same As Present
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ mt: 2 }}>
                    <RadioGroup row aria-labelledby='demo-row-radio-buttons-group-label' name='row-radio-buttons-group'>
                      <FormControlLabel className='radio' value='yes' control={<Radio />} label='Yes' />
                      <FormControlLabel className='radio' sx={{ ml: 20 }} value='no' control={<Radio />} label='No' />
                    </RadioGroup>
                  </Grid>
                </Grid>
              </>
            )}

            {selectedOptions === 'Upload Documents' && (
              <>
                <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12} md={12}>
                  <Grid item xs={12} md={12}>
                    <DataGrid
                      autoHeight
                      columns={columns}
                      rows={rows}
                      className={screenWidth < 1520 ? 'datatabaleWShadow' : 'dataTable'}
                      sx={{ boxShadow: 0 }}
                      hideFooter
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <Grid item xs={12} sx={{ mt: 9, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
                Cancel
              </Button>
              {selectedOptions !== 'Enquiry & Student Details' && (
                <Button onClick={handleSubmit} size='large' variant='contained' color='inherit' sx={{ mr: 2 }}>
                  Submit Enquiry
                </Button>
              )}
              {selectedOptions !== 'Enquiry & Student Details' && (
                <Button onClick={handleNewChild} size='large' variant='contained' color='inherit' sx={{ mr: 2 }}>
                  Submit & Add New Child
                </Button>
              )}
              <Button
                startIcon={selectedOptions === 'Enquiry & Student Details' ? <span className='icon-next'></span> : null}
                onClick={handleNext}
                size='large'
                variant='contained'
                color='secondary'
              >
                {selectedOptions === 'Enquiry & Student Details' ? 'Next' : 'Continue Registration'}
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box
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
        </Box>
      </Box>
      {successDialog && (
        <SuccessDialog
          openDialog={successDialog}
          title='Enquiry Submitted Successfully!'
          handleClose={handleSuccessDialogClose}
        />
      )}
    </Fragment>
  )
}

export default CreateEnquiry
