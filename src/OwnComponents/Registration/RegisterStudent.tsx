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
  Radio,
  Collapse,
  List,
  ListItemText,
  Popover
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
import Image from 'next/image'
import StudentBlue from './Image/studentBlue.png'
import CustomChip from 'src/@core/components/mui/chip'
import { ThemeColor } from 'src/@core/layouts/types'
import MergeDialog from './Dialog/MergeDialog'
import ReassignEnquiriesDialog from './Dialog/ReassignEnquiriesDialog'
import TransferEnquiriesDialog from './Dialog/TransferEnquiriesDialog'
import SchoolTourDialog from './Dialog/SchoolTourDialog'
import FollowUpDialog from './Dialog/FollowUpDialog'
import CompetencyTest from './Dialog/CompetencyTest'

//Styled for custom box
const CustomList = styled(List)(({ theme }) => ({
  padding: '8px 0px',
  backgroundColor: theme.palette.common.white,

  '& .MuiListItemText-primary': {
    '& .MuiTypography-root ': {
      color: theme.palette.customColors.mainText,
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px'
    }
  }
}))
const CustomPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPaper-root': {
    padding: '0px'
  },
  '& .MuiPopover-paper .MuiTypography-root': {
    color: theme.palette.customColors.mainText,
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px'
  }
}))

//Styled for custom two box

const CustomListOne = styled(List)(({ theme }) => ({
  padding: '8px 0px',
  backgroundColor: theme.palette.common.white,

  '& .MuiListItemText-primary': {
    '& .MuiTypography-root ': {
      color: theme.palette.customColors.mainText,
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '24px'
    }
  }
}))
const CustomPopoverOne = styled(Popover)(({ theme }) => ({
  '& .MuiPaper-root': {
    padding: '0px'
  },
  '& .MuiPopover-paper .MuiTypography-root': {
    color: theme.palette.text.primary,
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '24px'
  }
}))

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

interface StatusObj {
  [key: number]: {
    title: string
    color: ThemeColor
  }
}

const RegisterStudent = () => {
  const router = useRouter()
  const CalendarIcon = () => <span className='icon-calendar-1'></span>

  // ** States
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const [activeStep, setActiveStep] = useState<number>(0)
  const [selectedOptions, setSelectedOptions] = useState<string>('Enquiry & Student Details')

  const [enquiryDate, setEnquiryDate] = useState<string>('01 May 2024')
  const [enquiryTypes, setEnquiryTypes] = useState<string>('new admission')
  const [socialenquirySoure, setSocialenquirySoure] = useState<string>('Social Media')

  const [location, setLocation] = useState<string>('Vibgyor High - Goregaon West')
  const [eligibleGrade, setEligibleGrade] = useState<string>('IV')
  const [schoolLocation, setSchoolLocation] = useState<string>('Vibgyor High - Goregaon West')
  const [guestSchoolLocation, setGuestSchoolLocation] = useState<string>('Vibgyor High - Goregaon West')
  const [grade, setGrade] = useState<string>('Nursery')
  const [existingGrade, setExistingGrade] = useState<string>('Nursery')

  const [occupation, setOccupation] = useState<string>('Select Occupation')
  const [gender, setGender] = useState<string>('Female')
  const [board, setBoard] = useState<string>('CBSE')
  const [existingBoard, setExistingBoard] = useState<string>('CBSE')
  const [course, setCourse] = useState<string>('Integrated')
  const [stream, setStream] = useState<string>('Science')
  const [shift, setShift] = useState<string>('Shift 1')
  const [parentType, setParentType] = useState<string>('Father')
  const [guest, setGuest] = useState<boolean>(false)
  const [existingSchoolName, setExistingSchoolName] = useState<string>('Vibgyor Kids Goregaon west')
  const [placeOfBirth, setPlaceOfBirth] = useState<string>('Mumbai')
  const [studentFirstName, setStudentFirstName] = useState<string>('Khevna')
  const [studentLastName, setStudentLastName] = useState<string>('Shah')

  const [parentFirstName, setParentFirstName] = useState<string>('Ashok')
  const [parentLastName, setParentLastName] = useState<string>('Shah')
  const [relationshipchild, setRelationshipchild] = useState<string>('AshokShah32@gmail.com')
  const [parentradharCard, setParentradharCard] = useState<string>('Enter Here')
  const [presentResidentAddress, setPresentResidentAddress] = useState<string>('Enter Here')

  const [parentpanNO, setParentpanNO] = useState<string>('Enter Here')
  const [qualification, setQualification] = useState<string>('Enter Here')
  const [OrganisationName, setOrganisationName] = useState<string>('Enter Here')
  const [siblingFirstName, setSiblingFirstName] = useState<string>('Enter Here')

  const [designing, setDesigning] = useState<string>('Enter Here')
  const [OfficeAddress, setOfficeAddress] = useState<string>('Enter Here')
  const [area, setArea] = useState<string>('Enter Here')

  const [parentEmailId, setParentEmailId] = useState<string>('Enter Email Id')
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [parentTextField, setParentTextField] = useState(0)
  const [enquiryMode, setEnquiryMode] = useState<string>('Digital (Website, Portal)')
  const [enquirySoureType, setEnquirySourceType] = useState<string>('Digital')
  const [enquirySoure, setEnquirySource] = useState<string>('Web/ Internet')
  const [enquirySubSoure, setEnquirySubSource] = useState<string>('Instagram')
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [anchorElOne, setAnchorElOne] = useState<HTMLElement | null>(null)
  const [mergeDialog, setMergeDialog] = useState<boolean>(false)
  const [reassignDialog, setReassignDialog] = useState<boolean>(false)
  const [reassignCompleteDialog, setReassignCompleteDialog] = useState<boolean>(false)
  const [transferDialog, setTransferDialog] = useState<boolean>(false)
  const [transferCompleteDialog, setTransferCompleteDialog] = useState<boolean>(false)
  const [schoolTourDialog, setSchoolTourDialog] = useState<boolean>(false)

  const [competencyTest, setCompetencyTest] = useState<boolean>(false)
  const [followUpDialog, setFollowUpDialog] = useState<boolean>(false)
  const [minimized, setMinimized] = useState(false)
  const [minimizedFollow, setMinimizedFollow] = useState(false)
  const [year, setYear] = useState('AY 2024-2025')
  const [events, setEvents] = useState('Followup')
  const [eventSubType, setEventSubType] = useState('Followup')

  // table for Enquirer Dialog box Table
  //Rows and column of data grid with status obj and click event
  const enquirerStatusObj: StatusObj = {
    1: { title: 'Open', color: 'success' },
    2: { title: 'Close', color: 'error' }
  }

  // Function to format date to dd-MM-yyyy

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth is zero-based
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
  }
  const enquirerColumns: GridColDef[] = [
    {
      field: 'enqDate',
      headerName: 'Enquiry Date',
      align: 'center',
      headerAlign: 'center',
      minWidth: 200,
      valueFormatter: params => formatDate(params.value as string),
      flex: 1
    },
    {
      field: 'enqNumber',
      headerName: 'Enquiry Number',
      align: 'center',
      headerAlign: 'center',
      minWidth: 190,
      flex: 1
    },
    {
      field: 'enqFor',
      headerName: 'Enquiry For',
      align: 'center',
      headerAlign: 'center',
      minWidth: 190,
      flex: 1
    },
    {
      field: 'studentName',
      headerName: 'Student Name',
      align: 'center',
      headerAlign: 'center',
      minWidth: 200,
      flex: 1
    },

    {
      field: 'stage',
      headerName: 'Stage',
      align: 'center',
      headerAlign: 'center',
      minWidth: 200,
      flex: 1
    },
    {
      flex: 1,
      minWidth: 120,
      field: 'status',
      headerName: 'Status',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const status = enquirerStatusObj[params.row.status]

        return (
          <CustomChip
            size='small'
            skin='light'
            color={status?.color}
            label={status?.title}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    }
  ]
  const enquirerRows = [
    {
      id: 1,
      enqDate: '01/05/2024',
      enqNumber: '123456',
      enqFor: 'Admission',
      studentName: 'Khevna Shah',
      stage: 'Hot/ New',
      status: 1
    },
    {
      id: 2,
      enqDate: '04/30/2024',
      enqNumber: '123456',
      enqFor: 'Swimming',
      studentName: 'Maulika Shah',
      stage: 'Cold',
      status: 2
    },
    {
      id: 3,
      enqDate: '04/20/2024',
      enqNumber: '123456',
      enqFor: 'Badminton',
      studentName: 'Martin Mathew',
      stage: 'Warm',
      status: 1
    }
  ]

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

  const chipsLabel = [
    'Enquiry & Student Details',
    'Parent & Guardian Inform...',
    'Contact Infor...',
    'Medical Details',
    'Bank Details',
    'Upload Documents'
  ]

  const chipsLabel2 = ['25% Form Completed', 'Open']

  const handleToggle = (option: string) => {
    // setFilter(option)
    setSelectedOptions(option)
  }

  //Handler For Inputs
  const handleEnquiryType = (event: any) => {
    setLocation(event.target.value as string)
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
  const handleOccupation = (event: any) => {
    setOccupation(event.target.value as string)
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
  const handleCountry = (event: any) => {
    setCountry(event.target.value as string)
  }
  const handleCity = (event: any) => {
    setCity(event.target.value as string)
  }
  const handleState = (event: any) => {
    setState(event.target.value as string)
  }
  const handleYearChange = (event: any) => {
    setYear(event.target.value as string)
  }
  const handleEvent = (event: any) => {
    setEvents(event.target.value as string)
  }
  const handleEventSubType = (event: any) => {
    setEventSubType(event.target.value as string)
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
    setSelectedOptions('Parent & Guardian Inform...')
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
        title: 'Registered Student Listing',
        path: '/registered-student-listing'
      },
      {
        title: 'Register-Student',
        path: '/registered-student-listing/register-student'
      }
    ])
  }, [])

  //Handler for chip delete
  const handleChipDelete = (label: string) => {
    console.log(`Deleted ${label}`)
  }

  //Handler For Collapse One
  const handleCollapseToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }
  const collapseOpen = Boolean(anchorEl)
  const id = collapseOpen ? 'simple-popover' : undefined

  //Handler For Collapse Two

  const handleCollapseTwoToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElOne(anchorElOne ? null : event.currentTarget)
  }
  const collapseTwoOpen = Boolean(anchorElOne)
  const id2 = collapseTwoOpen ? 'simple-popover' : undefined

  //Handler for Merge Dialog
  const handleMergeDialogClose = () => {
    setMergeDialog(false)
    setAnchorElOne(null)
  }

  //Handler For Reaasign Dialog

  const handleReassignDialogClose = () => {
    setReassignDialog(false)
    setAnchorElOne(null)
  }
  const handlerReassign = () => {
    setReassignDialog(false)
    setReassignCompleteDialog(true)
  }
  const handleReasignCompleteClose = () => {
    setReassignCompleteDialog(false)
    setAnchorElOne(null)
  }

  //Handler for transfer Dialog

  const handleTransferDialogClose = () => {
    setTransferDialog(false)
    setAnchorElOne(null)
  }
  const handlerTransfer = () => {
    setTransferDialog(false)
    setTransferCompleteDialog(true)
  }
  const handleTransferSuccessClose = () => {
    setTransferCompleteDialog(false)
    setAnchorElOne(null)
  }

  //Handler for schoolTour Dialog
  const handleSchoolTourDialogClose = () => {
    setSchoolTourDialog(false)
  }
  const handleFollowUpDialogClose = () => {
    setFollowUpDialog(false)
  }

  //Handler for Competency Test
  const handleCompetencyTestDialogClose = () => {
    setSchoolTourDialog(false)
  }

  return (
    <Fragment>
      {/* <Card sx={{ mt: 4, width: '100%' }}> */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <Box sx={{ width: '96%' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              height: '150px',
              backgroundImage: 'url(/images/Banner.png)',
              backgroundSize: '100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              mb: 6,
              padding: '0px 45px'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 2 }}>
              <Box>
                <Image src={StudentBlue} alt='Studen Image' width={100} height={100} />
              </Box>
              <Box sx={{ ml: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flex: 1 }}>
                  <Box>
                    <Button
                      sx={{
                        color: '#212121',
                        ml: -6,
                        '&:hover': { backgroundColor: 'transparent' },
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontWeight: 400
                      }}
                      disableRipple
                      disableFocusRipple
                      disableTouchRipple
                      variant='text'
                      onClick={handleCollapseToggle}
                      endIcon={<span className='icon-arrow-down-1'></span>}
                    >
                      Khevna_New Admission
                    </Button>
                    <CustomPopover
                      id={id}
                      open={collapseOpen}
                      anchorEl={anchorEl}
                      onClose={handleCollapseToggle}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                      }}
                    >
                      <CustomList>
                        <MenuItem>
                          <ListItemText primary='Khevna_New Admission' />
                        </MenuItem>
                        <MenuItem>
                          <ListItemText primary='Khevna_PSA_Dance' />
                        </MenuItem>
                        <MenuItem>
                          <ListItemText primary='Maulika_New Admission' />
                        </MenuItem>
                      </CustomList>
                    </CustomPopover>
                  </Box>
                  {chipsLabel2.map((label, index) => (
                    <StyledChipProps
                      key={index}
                      label={label}
                      color={'primary'}
                      variant='filled'
                      sx={{ mr: 4 }}
                      onDelete={label == 'Open' ? () => handleChipDelete(label) : undefined}
                      deleteIcon={
                        label == 'Open' ? (
                          <span className='icon-trailing-icon' style={{ color: '#3F41D1' }}></span>
                        ) : undefined
                      }
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                  <Box>
                    <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '21px' }}>
                      New Admission{' '}
                      <Box
                        component='span'
                        sx={{
                          position: 'relative',
                          display: 'inline-block',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            left: 10,
                            right: 0,
                            width: '90%',
                            bottom: '-2px',
                            height: '3px',
                            backgroundColor: '#F99D1C',
                            opacity: '85%',
                            zIndex: 1
                          }
                        }}
                      >
                        ( 1 Duplicate / 1 Merged )
                      </Box>
                    </Typography>
                    <Typography variant='caption' sx={{ lineHeight: '18px' }} color={'text.primary'}>
                      01/05/2024-02:45 am
                    </Typography>
                  </Box>

                  <Divider orientation='vertical' flexItem sx={{ borderWidth: '2px' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <Box sx={{ mt: 1 }}>
                      <span className='icon-user'></span>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '21px' }}>
                        John Grey (Father)
                      </Typography>
                      <Typography variant='caption' sx={{ lineHeight: '18px' }} color={'text.primary'}>
                        +91 9090877665 | abcd@gmail.com
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box>
              <Button
                disableRipple
                disableFocusRipple
                disableTouchRipple
                variant='contained'
                color='primary'
                onClick={handleCollapseTwoToggle}
                startIcon={<span className='icon-add'></span>}
              >
                Apply Action
              </Button>
              <CustomPopoverOne
                id={id2}
                open={collapseTwoOpen}
                anchorEl={anchorElOne}
                onClose={handleCollapseTwoToggle}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center'
                }}
              >
                <CustomListOne>
                  <MenuItem>
                    <ListItemText primary='Apply Exception' />
                  </MenuItem>
                  <MenuItem>
                    <ListItemText primary='Merge' onClick={() => setMergeDialog(true)} />
                  </MenuItem>
                  <MenuItem>
                    <ListItemText primary='Reassign' onClick={() => setReassignDialog(true)} />
                  </MenuItem>
                  <MenuItem>
                    <ListItemText primary='Transfer' onClick={() => setTransferDialog(true)} />
                  </MenuItem>
                  <MenuItem>
                    <ListItemText
                      primary='School Tour'
                      onClick={() => {
                        if (!minimized) {
                          setSchoolTourDialog(true)
                          setAnchorElOne(null)
                        } else {
                          setMinimized(false)
                          setAnchorElOne(null)
                        }
                      }}
                    />
                  </MenuItem>

                  <MenuItem>
                    <ListItemText
                      primary='Competency Test'
                      onClick={() => {
                        if (!minimized) {
                          setCompetencyTest(true)
                          setAnchorElOne(null)
                        } else {
                          setMinimized(false)
                          setAnchorElOne(null)
                        }
                      }}
                    />
                  </MenuItem>

                  <MenuItem>
                    <ListItemText
                      primary='Follow Up'
                      onClick={() => {
                        if (!minimizedFollow) {
                          setFollowUpDialog(true)
                          setAnchorElOne(null)
                        } else {
                          setMinimizedFollow(false)
                          setAnchorElOne(null)
                        }
                      }}
                    />
                  </MenuItem>
                  <MenuItem>
                    <ListItemText primary='Registration' />
                  </MenuItem>
                </CustomListOne>
              </CustomPopoverOne>
            </Box>
          </Box>
          <Box
            sx={{
              background: '#fff',
              padding: '24px 24px 20px 24px',
              borderRadius: '10px',
              width: '100%',
              height: 'auto'
            }}
          >
            <Grid container>
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
                <Step active={true} label='New Enquiry' stepNumber={1} />
                {/* Step with sub-steps */}
                <Step
                  active={false}
                  label='School visit'
                  stepNumber={2}
                  subSteps={['Sub-step 1', 'Sub-step 2', 'Sub-step 3']}
                />
                {/* Another Step without sub-steps */}
                <Step active={false} label='Registration' stepNumber={3} />
                <Step active={false} label='Registratio...' stepNumber={4} />
                <Step active={false} label='Aptitude tes...' stepNumber={5} />
                <Step active={false} label='Admission...' stepNumber={6} />
                <Step active={false} label='Payment' stepNumber={7} />
                <Step active={false} label='Admitted/p...' stepNumber={8} />
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
                        label='Enquiry Number'
                        value={'IN10370171740'}
                        placeholder='Enquiry Number'
                        defaultValue={'IN10370171740'}
                        disabled
                      />
                    </Grid>
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
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='enquiry type'
                        value={enquiryTypes}
                        placeholder='new admission'
                        onChange={e => setEnquiryTypes(e.target.value)}
                        defaultValue={enquiryTypes}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='school location'
                        value={location}
                        placeholder='vibgyor high_Goregaon west'
                        onChange={e => setLocation(e.target.value)}
                        defaultValue={location}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Enquiry mode'
                        value={enquiryMode}
                        placeholder='Digital (Website, Portal)'
                        onChange={e => setEnquiryMode(e.target.value)}
                        defaultValue={enquiryMode}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='enquiry Source type'
                        value={enquirySoureType}
                        placeholder='Digital'
                        onChange={e => setEnquirySourceType(e.target.value)}
                        defaultValue={enquirySoureType}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='enquiry Source'
                        value={socialenquirySoure}
                        placeholder='Social Media'
                        onChange={e => setSocialenquirySoure(e.target.value)}
                        defaultValue={socialenquirySoure}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Enquiry Sub Source'
                        value={enquirySubSoure}
                        placeholder='Instagram'
                        onChange={e => setEnquirySubSource(e.target.value)}
                        defaultValue={enquirySubSoure}
                        disabled
                      />
                    </Grid>
                  </Grid>
                  <Grid item container xs={12}>
                    <Grid item xs={12} sx={{ mt: 6 }}>
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
                        disabled
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
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl required fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Grade
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Grade'
                          defaultValue={grade}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleGrade}
                          disabled
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
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Gender
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Gender'
                          defaultValue={gender}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleGender}
                          disabled
                        >
                          <MenuItem value=''>Select Gender</MenuItem>
                          <MenuItem value='Male'>Male</MenuItem>
                          <MenuItem value='Female'>Female</MenuItem>
                          <MenuItem value='Others'>Others</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          sx={{ width: '100%' }}
                          slots={{
                            openPickerIcon: CalendarIcon
                          }}
                          format='DD/MM/YYYY'
                          label='Date Of Birth'
                          disabled
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
                      <TextField
                        fullWidth
                        label='Global Id'
                        value={'GID12574194'}
                        placeholder='Global Id'
                        defaultValue={'GID12574194'}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Father First Name'
                        value={parentFirstName}
                        placeholder='Father First Name'
                        onChange={e => setParentFirstName(e.target.value)}
                        defaultValue={parentFirstName}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Father Last Name'
                        value={parentLastName}
                        placeholder='Father Last Name'
                        onChange={e => setParentLastName(e.target.value)}
                        defaultValue={parentLastName}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <PhoneNumberInput disabled={true} label="Father's Mobile No" helperText={false} required={true} />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Existing School Name'
                        value={existingSchoolName}
                        placeholder='Existing School Name'
                        onChange={e => setExistingSchoolName(e.target.value)}
                        defaultValue={existingSchoolName}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Existing School Board
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Existing School Board'
                          defaultValue={existingBoard}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleExistingBoard}
                          disabled
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
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Existing School Grade
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Existing School Grade'
                          defaultValue={existingGrade}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleExistingGrade}
                          disabled
                        >
                          <MenuItem value=''>Select Grade</MenuItem>
                          <MenuItem value='IV'>IV</MenuItem>
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
                      <TextField
                        fullWidth
                        label='Place Of Birth'
                        value={placeOfBirth}
                        placeholder='Place Of Birth'
                        onChange={e => setPlaceOfBirth(e.target.value)}
                        defaultValue={placeOfBirth}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Religion
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Religion'
                          defaultValue={gender}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleGender}
                          disabled
                        >
                          <MenuItem value=''>Select Religion</MenuItem>
                          <MenuItem value='Christian'>Christian</MenuItem>
                          <MenuItem value='Hindu'>Hindu</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Cast
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Cast'
                          defaultValue={gender}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleGender}
                          disabled
                        >
                          <MenuItem value=''>Select Religion</MenuItem>
                          <MenuItem value='Christian'>Christian</MenuItem>
                          <MenuItem value='Hindu'>Hindu</MenuItem>
                          <MenuItem value='Others'>Others</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Sub Cast
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Sub Cast'
                          defaultValue={gender}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleGender}
                          disabled
                        >
                          <MenuItem value=''>Select Sub Cast</MenuItem>
                          <MenuItem value='Select Sub Cast'>Select Sub Cast</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Nationality
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Nationality'
                          defaultValue={gender}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleGender}
                          disabled
                        >
                          <MenuItem value=''>Select Nationality</MenuItem>
                          <MenuItem value='Christian'>India</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Mother Tougue
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Mother Tougue'
                          defaultValue={existingGrade}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleExistingGrade}
                          disabled
                        >
                          <MenuItem value=''>Select Mother Tougue</MenuItem>
                          <MenuItem value='Christian'>Select Mother Tougue</MenuItem>
                          <MenuItem value='Hindu'>English</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </>
              )}

              {selectedOptions === 'Parent & Guardian Inform...' && (
                <>
                  <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12} md={12}>
                    <Grid item container xs={12} style={{ marginTop: '10px' }}>
                      <Grid item xs={12}>
                        <Typography variant='h6' sx={{ lineHeight: '30px' }}>
                          Father Details
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Father's Global Id"
                        value={'GID12574194'}
                        placeholder='Global Id'
                        defaultValue={'GID12574194'}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Father First Name'
                        value={parentFirstName}
                        placeholder='Father First Name'
                        onChange={e => setParentFirstName(e.target.value)}
                        defaultValue={parentFirstName}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Father Last Name'
                        value={parentLastName}
                        placeholder='Father Last Name'
                        onChange={e => setParentLastName(e.target.value)}
                        defaultValue={parentLastName}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Father Adhar Card'
                        value={parentradharCard}
                        placeholder='Enter Here'
                        onChange={e => setParentradharCard(e.target.value)}
                        defaultValue={parentradharCard}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Father Pan No'
                        value={parentpanNO}
                        placeholder='Enter Here'
                        onChange={e => setParentpanNO(e.target.value)}
                        defaultValue={parentpanNO}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Qualification'
                        value={qualification}
                        placeholder='Enter Here'
                        onChange={e => setQualification(e.target.value)}
                        defaultValue={qualification}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Occupation
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Occupation'
                          defaultValue={occupation}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleOccupation}
                          disabled
                        >
                          <MenuItem value=''>Select Occupation</MenuItem>
                          <MenuItem value='Nursery'>Select Occupation</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Organisation name'
                        value={OrganisationName}
                        placeholder='Enter Here'
                        onChange={e => setOrganisationName(e.target.value)}
                        defaultValue={OrganisationName}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Designing'
                        value={designing}
                        placeholder='Enter Here'
                        onChange={e => setDesigning(e.target.value)}
                        defaultValue={designing}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Office Address'
                        value={OfficeAddress}
                        placeholder='Enter Here'
                        onChange={e => setOfficeAddress(e.target.value)}
                        defaultValue={OfficeAddress}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Area'
                        value={area}
                        placeholder='Enter Here'
                        onChange={e => setArea(e.target.value)}
                        defaultValue={area}
                        required
                        disabled
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

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Father's Email ID"
                        value={parentEmailId}
                        placeholder="Father's Email ID"
                        onChange={e => setParentEmailId(e.target.value)}
                        defaultValue={parentEmailId}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PhoneNumberInput disabled={true} label="Father's Mobile No" helperText={false} required={true} />
                    </Grid>

                    <Grid item container xs={12} style={{ marginTop: '10px' }}>
                      <Grid item xs={12}>
                        <Typography variant='h6' sx={{ lineHeight: '30px' }}>
                          Mother Details
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Mother's Global Id"
                        value={'GID12574194'}
                        placeholder='Global Id'
                        defaultValue={'GID12574194'}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Mother First Name'
                        value={parentFirstName}
                        placeholder='Father First Name'
                        onChange={e => setParentFirstName(e.target.value)}
                        defaultValue={parentFirstName}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Mother Last Name'
                        value={parentLastName}
                        placeholder='Father Last Name'
                        onChange={e => setParentLastName(e.target.value)}
                        defaultValue={parentLastName}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Mother Adhar Card'
                        value={parentradharCard}
                        placeholder='Enter Here'
                        onChange={e => setParentradharCard(e.target.value)}
                        defaultValue={parentradharCard}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Mother Pan No'
                        value={parentpanNO}
                        placeholder='Enter Here'
                        onChange={e => setParentpanNO(e.target.value)}
                        defaultValue={parentpanNO}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Qualification'
                        value={qualification}
                        placeholder='Enter Here'
                        onChange={e => setQualification(e.target.value)}
                        defaultValue={qualification}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Occupation
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Occupation'
                          defaultValue={occupation}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleOccupation}
                          disabled
                        >
                          <MenuItem value=''>Select Occupation</MenuItem>
                          <MenuItem value='Nursery'>Select Occupation</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Organisation name'
                        value={OrganisationName}
                        placeholder='Enter Here'
                        onChange={e => setOrganisationName(e.target.value)}
                        defaultValue={OrganisationName}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Designing'
                        value={designing}
                        placeholder='Enter Here'
                        onChange={e => setDesigning(e.target.value)}
                        defaultValue={designing}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Office Address'
                        value={OfficeAddress}
                        placeholder='Enter Here'
                        onChange={e => setOfficeAddress(e.target.value)}
                        defaultValue={OfficeAddress}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Area'
                        value={area}
                        placeholder='Enter Here'
                        onChange={e => setArea(e.target.value)}
                        defaultValue={area}
                        required
                        disabled
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

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Mother's Email ID"
                        value={parentEmailId}
                        placeholder="Father's Email ID"
                        onChange={e => setParentEmailId(e.target.value)}
                        defaultValue={parentEmailId}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PhoneNumberInput disabled={true} label="Father's Mobile No" helperText={false} required={true} />
                    </Grid>

                    <Grid item container xs={12} style={{ marginTop: '20px' }}>
                      <Grid item xs={12}>
                        <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                          Are The Parents Separated
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ mt: 2 }}>
                        <RadioGroup
                          row
                          aria-labelledby='demo-row-radio-buttons-group-label'
                          name='row-radio-buttons-group'
                        >
                          <FormControlLabel className='radio' value='yes' control={<Radio />} label='Yes' />
                          <FormControlLabel
                            className='radio'
                            sx={{ ml: 4 }}
                            value='no'
                            control={<Radio />}
                            label='No'
                          />
                        </RadioGroup>
                      </Grid>
                    </Grid>

                    <Grid item container xs={12} style={{ marginTop: '10px' }}>
                      <Grid item xs={12}>
                        <Typography variant='h6' sx={{ lineHeight: '30px' }}>
                          Guardian Details
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Guardian's' Global Id"
                        value={'GID12574194'}
                        placeholder='Global Id'
                        defaultValue={'GID12574194'}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Guardian First Name'
                        value={parentFirstName}
                        placeholder='Father First Name'
                        onChange={e => setParentFirstName(e.target.value)}
                        defaultValue={parentFirstName}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Guardian Last Name'
                        value={parentLastName}
                        placeholder='Father Last Name'
                        onChange={e => setParentLastName(e.target.value)}
                        defaultValue={parentLastName}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Guardian's Email ID"
                        value={parentEmailId}
                        placeholder="Father's Email ID"
                        onChange={e => setParentEmailId(e.target.value)}
                        defaultValue={parentEmailId}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PhoneNumberInput disabled={true} label="Father's Mobile No" helperText={false} required={true} />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Relationship with child'
                        value={relationshipchild}
                        placeholder='Father Last Name'
                        onChange={e => setRelationshipchild(e.target.value)}
                        defaultValue={relationshipchild}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Present Residential Address'
                        value={presentResidentAddress}
                        placeholder='Father Last Name'
                        onChange={e => setPresentResidentAddress(e.target.value)}
                        defaultValue={presentResidentAddress}
                        required
                        disabled
                      />
                    </Grid>
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
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Guardian Adhar Card'
                        value={parentradharCard}
                        placeholder='Enter Here'
                        onChange={e => setParentradharCard(e.target.value)}
                        defaultValue={parentradharCard}
                        required
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Guardian Pan No'
                        value={parentpanNO}
                        placeholder='Enter Here'
                        onChange={e => setParentpanNO(e.target.value)}
                        defaultValue={parentpanNO}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item container xs={12} style={{ marginTop: '20px' }}>
                      <Grid item xs={12}>
                        <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                          This Guardiun Is Also A
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <RadioGroup
                          row
                          aria-labelledby='demo-row-radio-buttons-group-label'
                          name='row-radio-buttons-group'
                        >
                          <FormControlLabel
                            className='radio'
                            value='Customer Guardiun'
                            control={<Radio />}
                            label='Customer Guardiun'
                          />
                          <FormControlLabel
                            className='radio'
                            sx={{ ml: 4 }}
                            value='Legal Guardiun'
                            control={<Radio />}
                            label='Legal Guardiun'
                          />
                          <FormControlLabel
                            className='radio'
                            sx={{ ml: 4 }}
                            value='Not Applicable'
                            control={<Radio />}
                            label='Not Applicable'
                          />
                        </RadioGroup>
                      </Grid>
                    </Grid>

                    <Grid item container xs={12} style={{ marginTop: '10px' }}>
                      <Grid item xs={12}>
                        <Typography variant='h6' sx={{ lineHeight: '30px' }}>
                          For Sibling 1
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid item container xs={12} style={{ paddingTop: '10px' }}>
                      <Grid item xs={12}>
                        <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                          Is Sibling
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <RadioGroup
                          row
                          aria-labelledby='demo-row-radio-buttons-group-label'
                          name='row-radio-buttons-group'
                        >
                          <FormControlLabel
                            className='radio'
                            value='VIBGYOR Student'
                            control={<Radio />}
                            label='VIBGYOR Student'
                          />
                          <FormControlLabel
                            className='radio'
                            sx={{ ml: 4 }}
                            value='NON-VIBGYOR Student'
                            control={<Radio />}
                            label='NON-VIBGYOR Student'
                          />
                        </RadioGroup>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Sibling First Name'
                        value={siblingFirstName}
                        placeholder='Father First Name'
                        onChange={e => setSiblingFirstName(e.target.value)}
                        defaultValue={siblingFirstName}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Sibling Last Name'
                        value={siblingFirstName}
                        placeholder='Father First Name'
                        onChange={e => setSiblingFirstName(e.target.value)}
                        defaultValue={siblingFirstName}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          sx={{ width: '100%' }}
                          slots={{
                            openPickerIcon: CalendarIcon
                          }}
                          format='DD/MM/YYYY'
                          label='Date Of Birth'
                          disabled
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item container xs={4} style={{ paddingTop: '10px' }}>
                      <Grid item xs={12}>
                        <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                          Gender
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <RadioGroup
                          row
                          aria-labelledby='demo-row-radio-buttons-group-label'
                          name='row-radio-buttons-group'
                        >
                          <FormControlLabel className='radio' value='Male' control={<Radio />} label='Male' />
                          <FormControlLabel
                            className='radio'
                            sx={{ ml: 4 }}
                            value='Female'
                            control={<Radio />}
                            label='Female'
                          />
                          <FormControlLabel
                            className='radio'
                            sx={{ ml: 4 }}
                            value='Other'
                            control={<Radio />}
                            label='Other'
                          />
                        </RadioGroup>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='School Name'
                        value={existingSchoolName}
                        placeholder='School Name'
                        onChange={e => setExistingSchoolName(e.target.value)}
                        defaultValue={existingSchoolName}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel disabled id='demo-simple-select-outlined-label'>
                          Grade
                        </InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label=' Grade'
                          defaultValue={existingGrade}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleExistingGrade}
                          disabled
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
                </>
              )}

              {selectedOptions === 'Contact Infor...' && (
                <>
                  <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12} md={12}>
                    <Grid item container xs={12} style={{ marginTop: '10px' }}>
                      <Grid item xs={12}>
                        <Typography variant='h6' sx={{ lineHeight: '30px' }}>
                          Point of contact
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                        Preference 1
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Choose Parent Type</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Choose Parent Type'
                          defaultValue={schoolLocation}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleSchoolLocation}
                        >
                          <MenuItem value=''>Select Option</MenuItem>
                          <MenuItem value='Vibgyor High - Goregaon West'>Mother</MenuItem>
                          <MenuItem value='Vibgyor High - Borivali West'>Father</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PhoneNumberInput disabled={true} label='Parent Mobile No' helperText={false} required={true} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Choose Parent Type</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Choose Parent Type'
                          defaultValue={schoolLocation}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleSchoolLocation}
                        >
                          <MenuItem value=''>Select Option</MenuItem>
                          <MenuItem value='Vibgyor High - Goregaon West'>Father</MenuItem>
                          <MenuItem value='Vibgyor High - Borivali West'>Mother</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Father's Email ID"
                        value={parentEmailId}
                        placeholder="Father's Email ID"
                        onChange={e => setParentEmailId(e.target.value)}
                        defaultValue={parentEmailId}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                        Preference 2
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Choose Parent Type</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Choose Parent Type'
                          defaultValue={schoolLocation}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleSchoolLocation}
                        >
                          <MenuItem value=''>Select Option</MenuItem>
                          <MenuItem value='Vibgyor High - Goregaon West'>Mother</MenuItem>
                          <MenuItem value='Vibgyor High - Borivali West'>Father</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PhoneNumberInput disabled={true} label='Parent Mobile No' helperText={false} required={true} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Choose Parent Type</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Choose Parent Type'
                          defaultValue={schoolLocation}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleSchoolLocation}
                        >
                          <MenuItem value=''>Select Option</MenuItem>
                          <MenuItem value='Vibgyor High - Goregaon West'>Father</MenuItem>
                          <MenuItem value='Vibgyor High - Borivali West'>Mother</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Father's Email ID"
                        value={parentEmailId}
                        placeholder="Father's Email ID"
                        onChange={e => setParentEmailId(e.target.value)}
                        defaultValue={parentEmailId}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item container xs={12} style={{ marginTop: '10px' }}>
                      <Grid item xs={12}>
                        <Typography variant='body1' sx={{ lineHeight: '30px' }}>
                          Emergency contact
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Contact Number Of</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Contact Number Of'
                          defaultValue={schoolLocation}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleSchoolLocation}
                        >
                          <MenuItem value=''>Select Option</MenuItem>
                          <MenuItem value='Vibgyor High - Borivali West'>Father</MenuItem>
                          <MenuItem value='Vibgyor High - Goregaon West'>Mother</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item container xs={12}>
                      <Grid item xs={12} sx={{ mt: 6 }}>
                        <Divider />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item container xs={12} style={{ marginTop: '10px' }}>
                    <Grid item xs={12}>
                      <Typography variant='h6' sx={{ lineHeight: '30px' }}>
                        Residential Information
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12} md={12}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        required
                        fullWidth
                        label='Present Residential Address'
                        value={houseNo}
                        placeholder='Present Residential Address'
                        onChange={e => setHouseNo(e.target.value)}
                        defaultValue={houseNo}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        required
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
                        required
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
                        required
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
                        required
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
                    <Grid item xs={12} md={4}>
                      <Grid item xs={12}>
                        <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                          Is Permanent Address Same As Present
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <RadioGroup
                          row
                          aria-labelledby='demo-row-radio-buttons-group-label'
                          name='row-radio-buttons-group'
                        >
                          <FormControlLabel className='radio' value='yes' control={<Radio />} label='Yes' />
                          <FormControlLabel
                            className='radio'
                            sx={{ ml: 20 }}
                            value='no'
                            control={<Radio />}
                            label='No'
                          />
                        </RadioGroup>
                      </Grid>
                    </Grid>
                    <Grid item container xs={12}>
                      <Grid item xs={12} sx={{ mt: 6 }}>
                        <Divider />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item container xs={12}>
                    <Grid item xs={12} sx={{ mt: 5, mb: 5 }}>
                      <Divider />
                    </Grid>
                    <Grid item container xs={12} sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                      <Grid item xs={6}>
                        <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                          Timeline
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <FormControl fullWidth sx={{ mr: 5 }}>
                          <InputLabel id='demo-simple-select-outlined-label'>Select Event</InputLabel>
                          <Select
                            IconComponent={DownArrow}
                            label='Select Event'
                            defaultValue={events}
                            id='demo-simple-select-outlined'
                            labelId='demo-simple-select-outlined-label'
                            onChange={handleEvent}
                          >
                            <MenuItem value=''>Select Event</MenuItem>
                            <MenuItem value='Followup'>Select</MenuItem>
                            <MenuItem value='Meeting'>Meeting</MenuItem>
                            <MenuItem value='Enquiry Received'>Enquiry Received</MenuItem>
                            <MenuItem value='Enquiry Captured'>Enquiry Captured</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth>
                          <InputLabel id='demo-simple-select-outlined-label'>Select Event Sub Type</InputLabel>
                          <Select
                            IconComponent={DownArrow}
                            label='Select Event Sub Type'
                            defaultValue={eventSubType}
                            id='demo-simple-select-outlined'
                            labelId='demo-simple-select-outlined-label'
                            onChange={handleEventSubType}
                          >
                            <MenuItem value=''>Select Event Sub Type</MenuItem>
                            <MenuItem value='Followup'>Select</MenuItem>
                            <MenuItem value='Meeting'>Meeting</MenuItem>
                            <MenuItem value='Enquiry Received'>Enquiry Received</MenuItem>
                            <MenuItem value='Enquiry Captured'>Enquiry Captured</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
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

                <Button onClick={handleNext} size='large' variant='contained' color='secondary'>
                  {selectedOptions === 'Enquiry & Student Details' ? 'Save & Next' : 'Continue Registration'}
                </Button>
              </Grid>
            </Grid>
          </Box>
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
      {mergeDialog && (
        <MergeDialog
          openModal={mergeDialog}
          closeModal={handleMergeDialogClose}
          header='Merge'
          enquirerColumns={enquirerColumns}
          enquirerRows={enquirerRows}
        />
      )}

      {reassignDialog && (
        <ReassignEnquiriesDialog
          openModal={reassignDialog}
          closeModal={handleReassignDialogClose}
          header='Reassign'
          enquirerColumns={enquirerColumns}
          enquirerRows={enquirerRows}
          handleReassignClose={handlerReassign}
        />
      )}
      {reassignCompleteDialog && (
        <SuccessDialog
          openDialog={reassignCompleteDialog}
          title='Lead Is Assigned To Another Employee For Further Processing'
          handleClose={handleReasignCompleteClose}
        />
      )}
      {transferDialog && (
        <TransferEnquiriesDialog
          openModal={transferDialog}
          closeModal={handleTransferDialogClose}
          header='Transfer'
          handleReassignClose={handlerTransfer}
          transferColumns={enquirerColumns}
          transferRows={enquirerRows}
        />
      )}
      {transferCompleteDialog && (
        <SuccessDialog
          openDialog={transferCompleteDialog}
          title='Leads Is Assigned To RE For Further Processing'
          handleClose={handleTransferSuccessClose}
        />
      )}
      {schoolTourDialog && (
        <SchoolTourDialog
          openDialog={schoolTourDialog}
          title='Schedule School Tour'
          handleClose={handleSchoolTourDialogClose}
          setSchoolTourDialog={setSchoolTourDialog}
          minimized={minimized}
          setMinimized={setMinimized}
        />
      )}
      {competencyTest && (
        <CompetencyTest
          openDialog={competencyTest}
          title='Book Competency Test'
          handleClose={handleCompetencyTestDialogClose}
          setCompetencyTest={setCompetencyTest}
          minimized={minimized}
          setMinimized={setMinimized}
        />
      )}

      {followUpDialog && (
        <FollowUpDialog
          openDialog={followUpDialog}
          title='Follow Up Details'
          handleClose={handleFollowUpDialogClose}
          minimized={minimizedFollow}
          setMinimized={setMinimizedFollow}
        />
      )}
    </Fragment>
  )
}

export default RegisterStudent
