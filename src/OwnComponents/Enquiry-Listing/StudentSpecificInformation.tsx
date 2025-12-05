import {
  Badge,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import { DataGrid, GridColDef, GridCellParams, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid'
import SubjectBook from './Image/subject.jpg'
import ShitBook from './Image/shit.jpg'
import Image from 'next/image'
import { useTheme } from '@mui/system'
import { title } from 'process'
import { getRequest, postRequest } from 'src/services/apiService'
import Academics from '../StudentOnBoard/Academics'
import TransportFees from '../StudentOnBoard/Transport'
import FeesStructure from '../StudentOnBoard/Fees'
import DynamicFilterComponent from 'src/@core/CustomComponent/FilterComponent/DynamicFilterComponent'
import Cafeteria from '../StudentOnBoard/Cafeteria'
import PSA from '../StudentOnBoard/PSA'
import SummerCamp from '../StudentOnBoard/SummerCamp'
import KidsClub from '../StudentOnBoard/KidsClub'
import { formatAmount, getCurrentYearObject, getObjectByKeyVal } from 'src/utils/helper'
import SubjectDisplay from '../StudentOnBoard/SubjectDisplay'

//Chips Styled
const StyledChipProps = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorPrimary': {
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: `${theme.palette.customColors.customChipBackgroundColor}`,
    color: `${theme.palette.customColors.customChipColor}`,
    width: '100px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  '&.MuiChip-colorDefault': {
    border: `1px solid ${theme.palette.grey[300]} !important`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: `${theme.palette.customColors.text6} !important`,
    color: `${theme.palette.customColors.mainText} `,
    width: '100px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}))

// Create a styled Tabs component
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff'
}))

// Create a styled Tab component
const StyledTab = styled(Tab)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '15.4px',
  color: '#666',
  width: '160px', //if tab increases then please remove that width

  '&:hover': {
    boxShadow: 'none',
    borderRadius: '0px'
  },
  '&.Mui-selected': {
    color: '#212121',
    fontWeight: 500
  }
}))

//Columns and row for Students Offred data grid

const columns: GridColDef[] = [
  {
    flex: 1,
    minWidth: 100,
    field: 'compulsorySubjects',
    headerName: 'Compulsory Subjects',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'optionalSubjects',
    headerName: 'Optional Subjects',
    align: 'left',
    headerAlign: 'left'
  }
]

const rows: any[] = [
  {
    id: 1,
    compulsorySubjects: 'Computer',
    optionalSubjects: 'Hindi 2nd Language'
  },
  {
    id: 2,
    compulsorySubjects: 'Computer',
    optionalSubjects: 'Hindi 2nd Language'
  },
  {
    id: 3,
    compulsorySubjects: 'Englisg Literature',
    optionalSubjects: ''
  },
  {
    id: 4,
    compulsorySubjects: 'Marathi 3rd Language',
    optionalSubjects: ''
  },
  {
    id: 5,
    compulsorySubjects: 'Social Studies',
    optionalSubjects: ''
  },
  {
    id: 6,
    compulsorySubjects: 'Mathematics',
    optionalSubjects: ''
  }
]

//Columns and row for Spa Offred data grid

const columnsOne: GridColDef[] = [
  {
    flex: 1,
    minWidth: 100,
    field: 'sports',
    headerName: 'Sports',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'performingArts',
    headerName: 'Performing Arts',
    align: 'left',
    headerAlign: 'left'
  }
]

const rowsOne: any[] = [
  {
    id: 1,
    sports: 'Gymnastics',
    performingArts: 'Western Dance'
  },
  {
    id: 2,
    sports: 'Swimming, Skating',
    performingArts: 'Music'
  },
  {
    id: 3,
    sports: 'Basketball',
    performingArts: 'Speech & Drama'
  },
  {
    id: 4,
    sports: 'Judo',
    performingArts: ''
  },
  {
    id: 5,
    sports: 'Football',
    performingArts: ''
  },
  {
    id: 6,
    sports: 'Handball',
    performingArts: ''
  }
]

//Columns and row for Spa Offred data grid

const columnsTwo: GridColDef[] = [
  {
    flex: 1,
    minWidth: 100,
    field: 'trip',
    headerName: 'Trip',
    align: 'center',
    headerAlign: 'center'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'details',
    headerName: 'Details',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'duration',
    headerName: 'Duration',
    align: 'center',
    headerAlign: 'center'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'fee',
    headerName: 'Fee',
    align: 'center',
    headerAlign: 'center'
  }
]

const rowsTwo: any[] = [
  {
    id: 1,
    trip: 'Grade 8',
    details:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.',
    duration: '2 Days',
    fee: 'Rs. 550'
  },
  {
    id: 2,
    trip: 'Grade 7',
    details:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.',
    duration: '2 Days',
    fee: 'Rs. 550'
  }
]

//Columns and row for Fee Stracture data grid

const columnsFee: GridColDef[] = [
  {
    flex: 1,
    minWidth: 100,
    field: 'feeDescription',
    headerName: 'Fee Description',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'feeSubType',
    headerName: 'Fees Sub Type',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'periodOfService',
    headerName: 'Period Of Service',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'amount',
    headerName: 'Amount',
    align: 'center',
    headerAlign: 'center'
  }
]

const rowsFee: any[] = [
  {
    id: 1,
    feeDescription: 'Admission Fees',
    feeSubType: 'Admission',
    periodOfService: 'NA',
    amount: '1600'
  },
  {
    id: 2,
    feeDescription: 'Admission Fees',
    feeSubType: 'Administration Charges',
    periodOfService: 'NA',
    amount: '4000'
  },
  {
    id: 3,
    feeDescription: 'Consolidated Fees',
    feeSubType: 'Instalment 1',
    periodOfService: 'Full Year',
    amount: '18000'
  },
  {
    id: 4,
    feeDescription: 'Consolidated Fees',
    feeSubType: 'Instalment 2',
    periodOfService: 'Quarter 1',
    amount: '14000'
  },
  {
    id: 5,
    feeDescription: 'Consolidated Fees',
    feeSubType: 'Instalment 3',
    periodOfService: 'Quarter 2',
    amount: '14000'
  },
  {
    id: 6,
    feeDescription: 'Consolidated Fees',
    feeSubType: 'Instalment 4',
    periodOfService: 'Quarter 3',
    amount: '14000'
  },
  {
    id: 6,
    feeDescription: 'Consolidated Fees',
    feeSubType: 'Instalment 5',
    periodOfService: 'Quarter 4',
    amount: '14000'
  }
]

//Column and row for table
const admisionFeeColumn: any = [
  {
    flex: 1,
    minWidth: 160,
    field: 'fee_type',
    headerName: 'Fee Description',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'fee_sub_type',
    headerName: 'Fees Sub Type',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'fee_category',
    headerName: 'Fees Category',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'fee_sub_category',
    headerName: 'Fees Sub Category',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'period_of_service',
    headerName: 'Period Of Service',
    align: 'left',
    headerAlign: 'left'
  },
  {
    flex: 1,
    minWidth: 100,
    field: 'amount',
    headerName: 'Amount',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: any) => {
      // console.log(status, 'status')

      return `₹ ${formatAmount(Math.round(params?.value))}`
    }
  }
]

const admisionFeeRow: any[] = [
  {
    id: 1,
    feeDescription: 'Admission Fees',
    feeSubType: 'Admission',
    feeCategory: 'One Way',
    subCategory: 'Zone 1',
    service: 'Full Year',
    amount: '20800'
  }
]
const cafeteriaRow: any[] = [
  {
    id: 1,
    feeDescription: 'Cafeteria Fees',
    feeSubType: 'Pass',
    feeCategory: 'Lunch',
    subCategory: 'NA',
    service: 'Full Year',
    amount: '20800'
  }
]
const psaRow: any[] = [
  {
    id: 1,
    feeDescription: 'Post School Activity Fees',
    feeSubType: 'Sports',
    feeCategory: 'Scout',
    subCategory: 'Fitness & Games',
    service: 'Monthly',
    amount: '20800'
  }
]
const summerCampRow: any[] = [
  {
    id: 1,
    feeDescription: 'Summer Camp Fees',
    feeSubType: 'Perfoming Arts',
    feeCategory: 'NA',
    subCategory: 'Dance',
    service: '11 Days ',
    amount: '20800'
  }
]
const kidsClubRow: any[] = [
  {
    id: 1,
    feeDescription: 'Kids Club Fees',
    feeSubType: 'Regular',
    feeCategory: 'NA',
    subCategory: 'NA',
    service: 'Monthly ',
    amount: '2000'
  }
]

//Array For Cards

const bookArr = [
  { image: SubjectBook, title: 'Mathematics -4357' },
  { image: ShitBook, title: 'Mathematics -4357' }
]

const fieldBookArr = [
  {
    image: SubjectBook,
    title: [
      { name: 'Trip Name :', content: 'Flower shop' },
      { name: 'Subject & Units :', content: 'English language (Unit 2/3 - Plant and animals - Descriptive writing)' },
      { name: 'Term :', content: 'Term 1' }
    ]
  },
  {
    image: ShitBook,
    title: [
      { name: 'Trip Name :', content: 'Flower shop' },
      { name: 'Subject & Units :', content: 'English language (Unit 2/3 - Plant and animals - Descriptive writing)' },
      { name: 'Term :', content: 'Term 1' }
    ]
  }
]

//Array for Discount checkbox label

const group1Label = [
  { label: 'Early Bird offer' },
  {
    label:
      'Admission of students passing Grade X from VIBGYOR School& seeking Admissions to Grade XI eitherin the same or different VIBGYOR School'
  },
  { label: 'VIBGYOR Edu Spark Scholarship for Grade 11 Students' },
  { label: 'Re-admission of VIBGYOR Ex- Students (post deEnrolment of the student)' },
  { label: 'Group Discount (AY 24-25)' },
  { label: 'Existing Grade X VIBGYOR student seeking admission for Grade XI - ACE program' },
  {
    label:
      'Existing Grade X VIBGYOR student seeking admission for CAIE -Grade XI either in the same or different VIBGYOR School'
  },
  {
    label:
      'Advance Reservation Scheme Admission done in advance prior the opening of Admission year Loyalty Discount - Sr.KG to Grade 1'
  }
]
const group2Label = [
  { label: 'Loyalty Discount - Sr.KG to Grade 1' },
  { label: 'E-Mandate Option' },
  { label: 'Multi Year Payment Scheme' },
  { label: 'VIBGYOR Edu Spark Scholarship for Grade 11 Students' },
  { label: 'Re-admission of VIBGYOR Ex- Students (post deEnrolment of the student)' }
]

// function StudentSpecificInformation() {
const StudentSpecificInformation = ({ selectedRowId }: any) => {
  const router = useRouter()
  const CalendarIcon = () => <span className='icon-calendar-1'></span>
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const { setPagePaths, setGlobalState } = useGlobalContext()
  const [tabValue, setTabValue] = React.useState(0)
  const [selectedChipsOptions, setSelectedChipsOptions] = useState<string>('Subjects Offered')
  const [paymentMethod, setPaymentMethod] = useState<string>('EMI')
  const [fee, setFee] = useState<string>('₹ 15,000')
  const [psaType, setPSAType] = useState<string>('selectOption')
  const [psaBatch, setPSABatch] = useState<string>('selectOption')
  const [psaService, setPSAService] = useState<string>('selectOption')
  const [psaActivity, setPSAActivity] = useState<string>('selectOption')
  const [summerCamp, setSummerCamp] = useState<string>('selectOption')
  const [summerCampActiviy, setSummerCampActiviy] = useState<string>('selectOption')
  const [summerDuration, setSummerDuration] = useState<string>('selectOption')
  const [kidsType, setKidsType] = useState<string>('selectOption')
  const [kidsCafeteria, setKidsCafeteria] = useState<string>('selectOption')
  const [kidsBatch, setKidsBatch] = useState<string>('selectOption')
  const [pickup, setPickup] = useState<string>('selectOption')
  const [drop, setDrop] = useState<string>('selectOption')
  const [zone, setZone] = useState<string>('selectZone')
  const [serviceType, setServiceType] = useState('oneWay')
  const [route, setRoute] = useState('')
  const [busType, setBusType] = useState('ac')
  const theme = useTheme()
  const [schoolList, setSchoolList] = useState<any>([])
  const [school, setSchool] = useState<any>(null)
  const [feeStucture, setFeeStucture] = useState<any>([])
  const [filterOpen, setFilterOpen] = React.useState<any>(null)
  const [filterValue, setFilterValue] = useState<any>('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [filterCount, setFilterCount] = useState<any>(0)
  const [gradeSearch, setGradeSearch] = useState<any>(null)
  const [boardSearch, setBoardSearch] = useState<any>(null)
  const [shiftSearch, setShiftSearch] = useState<any>(null)
  const [divisionSearch, setDivisionSearch] = useState<any>(null)
  const [enteredValue, setEnteredValue] = useState<any>(0)
  const [filterSelectedSentData, setFilterSelectedSentData] = useState<any>([])
  const [filterOptions, setfilterOptions] = useState<any>([])
  const [filteredColumns, setFilteredColumns] = useState<any>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [calculatedList, setCalculatedList] = useState<any>([])
  const [selectedFees, setSelectedFees] = useState<any>([])
  const [totalAmmount, setTotalAmmount] = useState<any>(0)
  const [payloadFilter, setPayloadFilter] = useState<any>(null)
  const [enquiryDetails, setEnquiryDetails] = useState<any>(null)
  const [academicYears, setacademicYears] = useState<any[]>([])
  const [year, setYear] = useState<any>('')

  const pp = {
    board: 4,
    course: 5,
    grade: 14,
    shift: 1,
    batch: 1,
    academic_year_id: 25
  }

  useEffect(() => {
    if (selectedRowId != undefined) {
      const getEnquiryDetails = async () => {
        try {
          const url = {
            url: `marketing/enquiry/${selectedRowId}`,
            serviceURL: 'marketing'
          }
          const response = await getRequest(url)
          if (response.status) {
            setEnquiryDetails(response.data)
            const responsedata = response.data
            const filteroptions = []

            // if (responsedata?.academic_year) {
            //   setPayloadFilter((prevState: any) => ({
            //     ...prevState,
            //     academic_year: getObjectByKeyVal(academicYears,'id',responsedata?.academic_year?.id)?.atttibutes?.short_name_two_digit
            //   }));
            //   // const boardDetails = {
            //   //   itemID: responsedata?.academic_year?.id,
            //   //   name: 'academic_year',
            //   //   operation: 'equals',
            //   //   value: responsedata?.academic_year?.value,
            //   //   valueName: responsedata?.academic_year?.value
            //   // }
            //   // filteroptions.push(boardDetails)
            // }
            if (responsedata?.school_location) {
              setSchool(responsedata?.school_location?.id)
            }

            if (responsedata?.board) {
              const boardDetails = {
                itemID: responsedata?.board?.id,
                name: 'board',
                operation: 'equals',
                value: responsedata?.board?.value,
                valueName: responsedata?.board?.value
              }
              filteroptions.push(boardDetails)
            }

            if (responsedata?.student_details?.grade) {
              const gradeDetails = {
                itemID: responsedata?.student_details?.grade?.id,
                name: 'grade',
                operation: 'equals',
                value: responsedata?.student_details?.grade?.value,
                valueName: responsedata?.student_details?.grade?.value
              }
              filteroptions.push(gradeDetails)
            }
            if (responsedata?.course) {
              const boardDetails = {
                itemID: responsedata?.course?.id,
                name: 'courses',
                operation: 'equals',
                value: responsedata?.course?.value,
                valueName: responsedata?.course?.value
              }
              filteroptions.push(boardDetails)
            }
            if (responsedata?.shift) {
              const boardDetails = {
                itemID: responsedata?.shift?.id,
                name: 'shift',
                operation: 'equals',
                value: responsedata?.shift?.value,
                valueName: responsedata?.shift?.value
              }
              filteroptions.push(boardDetails)
            }
            if (responsedata?.stream) {
              const boardDetails = {
                itemID: responsedata?.stream?.id,
                name: 'stream',
                operation: 'equals',
                value: responsedata?.stream?.value,
                valueName: responsedata?.stream?.value
              }
              filteroptions.push(boardDetails)
            }

            console.log('auto apply filter filteroptions')
            console.log(filteroptions)
            setfilterOptions(filteroptions)
          }
        } catch (error) {
          console.error('Error fetching role details:', error)
        } finally {
          // decrementLoading();
        }
      }

      getEnquiryDetails()
    }
  }, [selectedRowId])

  useEffect(() => {
    if (filterOptions && filterOptions?.length) {
      const result = filterOptions.reduce((acc: any, item: any) => {
        if (item.name == 'academic_year') {
          acc.academic_year = getObjectByKeyVal(academicYears, 'id', item?.itemID)?.attributes?.short_name_two_digit
        } else if (item.name == 'grade') {
          acc.grade = item?.itemID
        } else if (item.name == 'board') {
          acc.board = item?.itemID
        } else if (item.name == 'courses') {
          acc.courses = item?.itemID
        } else if (item.name == 'shift') {
          acc.shift = item?.itemID
        } else if (item.name == 'stream') {
          acc.stream = item?.itemID
        }

        return acc
      }, {})

      console.log('filterOptions')
      console.log(filterOptions)
      setPayloadFilter(result)
    }
  }, [filterOptions])

  //Below things for chip handler
  const chipsLabel = [
    'Subjects Offered',
    'SPA Offered'
    // 'Field Trips',
    // 'Uniform Details',
    // 'Holiday List',
    // 'Exam Details',
    // 'Other Events',
    // 'Clubs',
    // 'Kit Details',
    // 'Timetable',
    // 'Syllabus',
    // 'Policies'
  ]
  const maxLabelLength = 10 // Set the max length for the label
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text
    }

    return text.substring(0, maxLength - 3) + '...'
  }

  const handleToggle = (option: string) => {
    // setFilter(option)
    setSelectedChipsOptions(option)
  }

  //Below Things for tab handler
  const tabArray = [
    'Academics',
    'Fees',
    'Transport Details',
    'Cafeteria Details',
    // 'PSA',
    // 'Summer Camp',
    'Kids Club Details',
    'Discount'
  ]

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    }
  }

  const getAcademicYear = async () => {
    const apiRequest = {
      url: `/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1&sort[0]=id:asc`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response: any = await getRequest(apiRequest)
    // Handle the response here, e.g., set the state with the data
    const allYears = response.data.map((element: any) => element.attributes.name)
    if (response?.data && response?.data?.length) {
      setacademicYears(response.data)
      if (enquiryDetails) {
        console.log(
          'enquiryDetails>>',
          enquiryDetails?.academic_year?.id,
          getObjectByKeyVal(response.data, 'id', enquiryDetails?.academic_year?.id)?.attributes?.short_name_two_digit
        )
        const yearShort = getObjectByKeyVal(response.data, 'id', enquiryDetails?.academic_year?.id)?.attributes
          ?.short_name_two_digit
        setYear(yearShort)
        setPayloadFilter((prevState: any) => ({
          ...prevState,
          academic_year: yearShort,
          academic_year_id: yearShort
        }))
      } else {
        const currentYear = getCurrentYearObject(response?.data)
        let yy: any = null
        if (currentYear && currentYear?.length) {
          yy = currentYear[0]?.attributes?.short_name_two_digit
        } else {
          yy = response?.data[0]?.attributes?.short_name_two_digit
        }
        setYear(yy)
        setPayloadFilter((prevState: any) => ({
          ...prevState,
          academic_year: yy,
          academic_year_id: yy
        }))
      }
    }
  }

  const getSchool = async () => {
    const schoolEndpoint = `/api/ac-schools?fields[1]=name&fields[2]=short_name&filters[academic_year_id]=${year}`

    const params = {
      url: `/api/ac-schools?fields[1]=name&fields[2]=short_name`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const responseData: any = await getRequest(params)
    if (responseData?.data) {
      setSchoolList(responseData?.data)
      // setSchool(responseData?.data[0]?.id)
    }
  }
  const handleYearChange = (event: any) => {
    //const filterOpt: any = [{ column: 'academicYear', operation: 'equals', search: event.target.value }]

    //setfilterOptions(filterOpt)
    // fetchData(1, paginationModel.pageSize, filterOpt)
    setPayloadFilter((prevState: any) => ({
      ...prevState,
      academic_year: event.target.value,
      academic_year_id: event.target.value
    }))
    setYear(event.target.value as string)
  }

  useEffect(() => {
    getAcademicYear()
  }, [enquiryDetails])

  useEffect(() => {
    if (year) {
      getSchool()
    }
  }, [year])
  //Breadcrumbs here
  useEffect(() => {
    setPagePaths([
      {
        title: 'Enquiry Listing',
        path: '/enquiry-listing'
      },
      {
        title: 'Enquiries',
        path: '/enquiry-listing/enquiries'
      },
      {
        title: 'Student Specific Information',
        path: '/enquiry-listing/enquiries/student-specific-information'
      }
    ])

    console.log('filter')
    console.log(payloadFilter)
    getFeeStructure()
  }, [school, payloadFilter])

  //Handler for inputs
  const handlePaymentMethod = (event: any) => {
    setPaymentMethod(event.target.value as string)
  }
  const handlePSAType = (event: any) => {
    setPSAType(event.target.value as string)
  }
  const handlePSAService = (event: any) => {
    setPSAService(event.target.value as string)
  }
  const handlePSABatch = (event: any) => {
    setPSABatch(event.target.value as string)
  }
  const handlePSAActivity = (event: any) => {
    setPSAActivity(event.target.value as string)
  }
  const handleSummerCamp = (event: any) => {
    setSummerCamp(event.target.value as string)
  }
  const handleSummerCampActivity = (event: any) => {
    setSummerCampActiviy(event.target.value as string)
  }
  const handleSummerDuration = (event: any) => {
    setSummerDuration(event.target.value as string)
  }
  const handleKidsType = (event: any) => {
    setKidsType(event.target.value as string)
  }
  const handleKidsCafeteria = (event: any) => {
    setKidsCafeteria(event.target.value as string)
  }
  const handleKidsBatch = (event: any) => {
    setKidsBatch(event.target.value as string)
  }
  const handleZone = (event: any) => {
    setZone(event.target.value as string)
  }
  const handlePickup = (event: any) => {
    setPickup(event.target.value as string)
  }
  const handleDrop = (event: any) => {
    setDrop(event.target.value as string)
  }
  const handleServiceType = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (serviceType === 'twoWay') {
      setRoute('')
    }
    setServiceType(event.target.value)
  }
  const handleRoute = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoute(event.target.value)
  }
  const handleBusType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusType(event.target.value)
  }

  const handleSchoolChange = (event: any) => {
    // let filterOpt:any = [];
    // if(event.target.value == 'all'){
    //   filterOpt = []
    // }else{
    //    filterOpt = [{ name: 'school_id', operation: 'Equals', value: event.target.value.toString() }]
    // }

    // setfilterOptions(filterOpt)
    debugger
    setSchool(event.target.value)
  }

  const getFeeStructure = async () => {
    setGlobalState({ isLoading: true })
    const conditions = []
    console.log('payloadFilter', payloadFilter)
    // Add conditions only if the values are defined
    if (school !== undefined) conditions.push(`school_id = ${school}`)
    if (payloadFilter?.academic_year !== undefined) conditions.push(`academic_year_id = ${payloadFilter.academic_year}`)
    if (payloadFilter?.grade !== undefined) conditions.push(`grade_id = ${payloadFilter.grade}`)
    if (payloadFilter?.board !== undefined) conditions.push(`board_id = ${payloadFilter.board}`)
    if (payloadFilter?.courses !== undefined) conditions.push(`course_id = ${payloadFilter.courses}`)
    if (payloadFilter?.shift !== undefined) conditions.push(`shift_id = ${payloadFilter.shift}`)

    // Join the conditions with "AND"
    const operator = conditions.join(' AND ')

    const params = {
      url: `/api/ac-schools/search-school-fees`,
      serviceURL: 'mdm',
      data: {
        operator: operator + ' AND fee_type_id IN (1,17,9) AND publish_start_date <= current_date AND publish_end_date >= current_date'
      },
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response = await postRequest(params)
    if (response?.success) {
      setFeeStucture(response?.data?.schoolFees)
    }
    setGlobalState({ isLoading: false })
  }

  const toggleDrawer = (open: boolean) => (event: any) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setIsDrawerOpen(open)
  }

  const filterSectionData = [
    {
      name: 'Grade',
      value: 'grade',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    },
    {
      name: 'Board',
      value: 'board',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    },
    // {
    //   name: 'Academic Year',
    //   value: 'academic_year',
    //   operators: [
    //     {
    //       name: 'Equals',
    //       value: 'equals'
    //     }
    //   ]
    // },
    {
      name: 'Courses',
      value: 'courses',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    },
    {
      name: 'Stream',
      value: 'stream',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    },
    {
      name: 'Shift',
      value: 'shift',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    }
  ]

  const selectedFilterData = async (data: any) => {
    let serviceURL = null
    if (data === 'grade') {
      serviceURL = 'ac-grades'
    }
    if (data === 'board') {
      serviceURL = 'ac-boards'
    }
    if (data === 'school') {
      serviceURL = 'ac-schools'
    }
    if (data === 'shift') {
      serviceURL = 'ac-shifts'
    }
    if (data === 'division') {
      serviceURL = 'ac-divisions'
    }
    if (data === 'academic_year') {
      serviceURL =
        'ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1&sort[0]=id:asc'
    }
    if (data === 'courses') {
      serviceURL = 'ac-courses'
    }
    if (data === 'stream') {
      serviceURL = 'ac-streams'
    }

    try {
      if (serviceURL) {
        setGlobalState({ isLoading: true })
        const url = {
          url: `/api/${serviceURL}`,
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }
        const response = await getRequest(url)
        console.log('response', response)
        if ((response?.data).length > 0) {
          if (data === 'division') {
            ;(response?.data).map((values: any, key: number) => {
              values.attributes.name = values.attributes.division
            })
          }
          setFilterValue(response?.data)
        } else {
          console.log('error', response)
        }
        setGlobalState({ isLoading: false })
      } else {
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const filtersSelected = async (data: any) => {
    setFilterSelectedSentData(data)
    setGradeSearch(null)
    setBoardSearch(null)
    setShiftSearch(null)
    setDivisionSearch(null)
    if (data?.name === null) {
      setGradeSearch(null)
      setBoardSearch(null)
      setShiftSearch(null)
      setDivisionSearch(null)
    } else {
      // setSelectedItems1([])
      // setSelectedStudentList([])
      // setView('')
      // setEnableTabs(false)
      // setMainStudent({})
      // setInputValue('')
      // setValueEntered(null)
      data?.length &&
        data?.map((dataSet: any) => {
          if (dataSet.name === 'grade') {
            setGradeSearch(dataSet.value)
          }
          if (dataSet.name === 'board') {
            setBoardSearch(dataSet.value)
          }
          if (dataSet.name === 'shift') {
            setShiftSearch(dataSet.value)
          }
          if (dataSet.name === 'division') {
            setDivisionSearch(dataSet.value)
          }
        })
    }
  }

  const applysetFilteredColumns = (options: any[]) => {
    console.log(options)
    setFilteredColumns([...options])
  }

  const clearAllFilters = (options: any[]) => {
    const filterOption: any[] = []
    setfilterOptions([])
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize })
    // fetchData(1, paginationModel.pageSize, filterOption);
  }

  console.log('Calculated List', payloadFilter)

  //   const handleSelectionChange = (selected:any) => {
  //   // Get the IDs of the selected rows
  //   const selectedIds = selected.selectionModel;

  //   // Update the state with the corresponding row data
  //   const updatedSelectedRows = calculatedList.filter((row:any) =>
  //     selectedIds.includes(row.id)
  //   );
  //   setSelectedFees(updatedSelectedRows); // Set the state with selected rows
  // };

  const handleRowSelectionChange = (rowIds: any) => {
    // `rowIds` contains the selected row IDs, so we need to filter the rows
    const updatedSelectedRows = calculatedList.filter((row: any) => rowIds.includes(row.id))
    const totalAmountC = updatedSelectedRows.reduce((sum: any, item: any) => sum + item.amount, 0)
    setTotalAmmount(totalAmountC)
    setSelectedFees(updatedSelectedRows) // Set the state with selected rows
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <Box sx={{ background: '#fff', borderRadius: '10px', width: '100%', height: '100%', mb: '15px' }}>
          <Grid container>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', mt: 3 }}>
                  {academicYears && academicYears?.length ? (
                    <FormControl sx={{ ml: 4 }} fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Academic Year</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Academic Year'
                        value={year}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleYearChange}
                        sx={{ height: '48px' }}
                      >
                        {academicYears && academicYears?.length
                          ? academicYears?.map((val: any, index: number) => {
                              return (
                                <MenuItem key={index} value={val?.attributes?.short_name_two_digit}>
                                  AY {val?.attributes?.name}
                                </MenuItem>
                              )
                            })
                          : null}
                      </Select>
                    </FormControl>
                  ) : null}

                  {schoolList && schoolList?.length ? (
                    <FormControl sx={{ ml: 4 }} fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>Select School</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Select School'
                        value={year}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleSchoolChange}
                        sx={{ height: '48px' }}
                      >
                        {schoolList && schoolList?.length
                          ? schoolList?.map((val: any, index: number) => {
                              return (
                                <MenuItem key={index} value={val?.id}>
                                  AY {val?.attributes?.name}
                                </MenuItem>
                              )
                            })
                          : null}
                      </Select>
                    </FormControl>
                  ) : null}

                  {/* 
                  {schoolList && schoolList?.length ? (
                    <FormControl required sx={{ ml: 4 }} fullWidth>
                      <InputLabel required id='selectSchool'>
                        Select School
                      </InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Select School'
                        value={school}
                        id='selectSchool'
                        labelId='selectSchool'
                        onChange={handleSchoolChange}
                        sx={{ height: '48px' }}
                      >
                        {schoolList?.map((val: any, index: number) => {
                          return (
                            <MenuItem key={index} value={val?.id}>
                              {val?.attributes?.name}
                            </MenuItem>
                          )
                        })
                        }
                      </Select>
                    </FormControl>
                  ) : null} */}
                </Box>
                <Box
                  sx={{
                    mt: 3,
                    ml: 3,
                    padding: '0px 10px',
                    display: 'flex',
                    justifyContent: { lg: 'flex-end' },
                    alignItems: 'center'
                  }}
                >
                  <Badge
                    color='error'
                    // badgeContent={filterCount}
                    sx={{
                      '& .MuiBadge-badge': {
                        width: '20px',
                        height: '20px',
                        top: 7,
                        right: 20,
                        zIndex: 1
                      }
                    }}
                  >
                    <Button
                      variant='contained'
                      color='inherit'
                      sx={{
                        mr: 3,
                        '@media (max-width: 910px)': {
                          ml: 3
                        }
                      }}
                      startIcon={<span className='icon-filter-search'></span>}
                      onClick={toggleDrawer(true)}
                    >
                      filter
                    </Button>
                  </Badge>

                  <DynamicFilterComponent
                    filterOpen={filterOpen}
                    setFilterOpen={setFilterOpen}
                    isDrawerOpen={isDrawerOpen}
                    setDrawerOpen={setIsDrawerOpen}
                    toggleDrawer={toggleDrawer}
                    isFilterSection={true}
                    filterSectionData={filterSectionData}
                    selectedFilterData={selectedFilterData}
                    filterValue={filterValue}
                    filtersSelected={filtersSelected}
                    filterSelectedSentData={filterSelectedSentData}
                    isColumnSection={false}
                    columnSectionData={[]}
                    isStickyColumnSection={false}
                    stickyColumnSectionData={[]}
                    filterCount={setFilterCount}
                    setfilterOptionsProps={setfilterOptions}
                    setDisplayEarlierFilter={filterOptions}
                    setFilteredColumns={applysetFilteredColumns}
                    clearFilter={clearAllFilters}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box
        sx={{
          background: '#fff',
          padding: '10px 16px 0px 16px',
          borderRadius: '10px',
          width: '100%',
          mb: 8
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <StyledTabs
            variant='scrollable'
            scrollButtons='auto'
            value={tabValue}
            onChange={handleChange}
            aria-label='basic StyledTabs example'
          >
            {tabArray.map((tabLabel, index) => (
              <StyledTab key={tabLabel} label={tabLabel} {...a11yProps(index)} />
            ))}
          </StyledTabs>
        </Box>
        {tabValue === 0 && (
          <Box>
            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
              {chipsLabel.map((label, index) => (
                <Tooltip key={index} title={label}>
                  <StyledChipProps
                    label={truncate(label, maxLabelLength)}
                    onClick={() => handleToggle(label)}
                    color={selectedChipsOptions?.includes(label) ? 'primary' : 'default'}
                    variant='filled'
                    sx={{ mr: 4, mb: 5 }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {tabValue === 0 && (
        <Box
          sx={{
            background: '#fff',
            padding: '24px',
            borderRadius: '10px',
            width: '100%'
          }}
        >
          <Box className='fixedModal' sx={{ overflowY: 'auto', height: '500px' }}>
            {school && enquiryDetails ? (
              <>
                {selectedChipsOptions === 'Subjects Offered' && (
                  <Academics school={school} enquiryDetails={enquiryDetails} tab={'Subjects Offered'} />
                )}
                {selectedChipsOptions === 'SPA Offered' && (
                  <SubjectDisplay school={school} enquiryDetails={enquiryDetails} tab={'SPA Offered'} />
                )}
                {selectedChipsOptions === 'Field Trips' && (
                  <>
                    <Typography
                      variant='h6'
                      color={'text.primary'}
                      sx={{ lineHeight: '22px', mt: 4, mb: 5, textTransform: 'capitalize' }}
                    >
                      Field Trips
                    </Typography>
                    <Grid container xs={12} spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12}>
                        <Typography
                          variant='subtitle1'
                          color={'text.primary'}
                          sx={{ lineHeight: '17.6px', mt: 4, mb: 5, textTransform: 'capitalize' }}
                        >
                          National
                        </Typography>
                      </Grid>
                      {fieldBookArr.map((curr, index) => (
                        <Grid item xs={6} md={3} key={index} sx={{ mb: 3 }}>
                          <Card
                            sx={{
                              maxWidth: 300,
                              backgroundColor: '#fff !important',
                              '&.MuiPaper-elevation': { boxShadow: 0 },
                              border: `1px solid ${theme.palette.customColors.text6} !important`
                            }}
                          >
                            <CardMedia sx={{ height: 150 }}>
                              <Image
                                src={curr.image}
                                alt='subject Image'
                                style={{ width: '100%', borderRadius: '0px', height: '150px' }}
                              />
                            </CardMedia>
                            <CardContent style={{ paddingBottom: '10px' }}>
                              {curr.title.map((info, index) => (
                                <Grid container xs={12} key={index} spacing={0}>
                                  <Grid item xs={6} sx={{ mb: 3 }}>
                                    <Typography
                                      variant='caption'
                                      color={'text.primary'}
                                      sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                    >
                                      {info.name}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography
                                      variant='caption'
                                      color={'customColors.mainText'}
                                      sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                    >
                                      {info.content}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              ))}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    <Grid container xs={12} spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12}>
                        <Typography
                          variant='subtitle1'
                          color={'text.primary'}
                          sx={{ lineHeight: '17.6px', mt: 4, mb: 5, textTransform: 'capitalize' }}
                        >
                          International
                        </Typography>
                      </Grid>
                      {fieldBookArr.map((curr, index) => (
                        <Grid item xs={6} md={3} key={index} sx={{ mb: 3 }}>
                          <Card
                            sx={{
                              maxWidth: 300,
                              backgroundColor: '#fff !important',
                              '&.MuiPaper-elevation': { boxShadow: 0 },
                              border: `1px solid ${theme.palette.customColors.text6} !important`
                            }}
                          >
                            <CardMedia sx={{ height: 150 }}>
                              <Image
                                src={curr.image}
                                alt='subject Image'
                                style={{ width: '100%', borderRadius: '0px', height: '150px' }}
                              />
                            </CardMedia>
                            <CardContent style={{ paddingBottom: '10px' }}>
                              {curr.title.map((info, index) => (
                                <Grid container xs={12} key={index} spacing={0}>
                                  <Grid item xs={6} sx={{ mb: 3 }}>
                                    <Typography
                                      variant='caption'
                                      color={'text.primary'}
                                      sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                    >
                                      {info.name}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography
                                      variant='caption'
                                      color={'customColors.mainText'}
                                      sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                    >
                                      {info.content}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              ))}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </>
            ) : (
              <Typography sx={{ mr: 2, fontWeight: 400, color: 'text.secondary' }} align='center'>
                Data Not Found For Applied Filter
              </Typography>
            )}
          </Box>
        </Box>
      )}
      {tabValue === 1 && (
        <Box sx={{ ml: 3 }}>
          {/* <Grid container xs={12} spacing={5}>
            <Grid item xs={12} md={9}>
              <Box
                sx={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '10px',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Box>
                  <Typography
                    variant='h6'
                    color={'text.primary'}
                    sx={{ lineHeight: '22px', mt: 4, textTransform: 'capitalize' }}
                  >
                    Fees Structure
                  </Typography>
                </Box>
                <Box>
                  <DataGrid
                    autoHeight
                    columns={columnsFee}
                    checkboxSelection
                    rows={rowsFee}
                    hideFooterPagination
                    className='dataTable'
                    sx={{
                      boxShadow: 0,
                      mt: 5,
                      '& .MuiDataGrid-main': {
                        overflow: 'hidden'
                      }
                    }}
                  />
                </Box>
                <Divider />
                <Box>
                  <Box>
                    <Typography
                      variant='h6'
                      color={'text.primary'}
                      sx={{ lineHeight: '22px', mt: 4, textTransform: 'capitalize' }}
                    >
                      Mode of Payment
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 6, mb: 6 }}>
                    <FormControl>
                      <InputLabel id='demo-simple-select-outlined-label'>Select Payment Method</InputLabel>
                      <Select
                        IconComponent={DownArrow}
                        label='Select Payment Method'
                        defaultValue={paymentMethod}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handlePaymentMethod}
                      >
                        <MenuItem value=''>Select Payment Method</MenuItem>
                        <MenuItem value='Pay Online'>Pay Online</MenuItem>
                        <MenuItem value='E-Mandate'>E-Mandate</MenuItem>
                        <MenuItem value='EMI'>EMI</MenuItem>
                        <MenuItem value='EDC 1'>EDC 1</MenuItem>
                        <MenuItem value='EDC 2'>EDC 2</MenuItem>
                        <MenuItem value='EDC 3'>EDC 3</MenuItem>
                        <MenuItem value='Main Cash'>Main Cash</MenuItem>
                        <MenuItem value='Cheque'>Cheque</MenuItem>
                        <MenuItem value='DD'>DD</MenuItem>
                        <MenuItem value='PDC'>PDC</MenuItem>
                        <MenuItem value='IMPS'>IMPS</MenuItem>
                        <MenuItem value='NEFT'>NEFT</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Box>
                  <Typography
                    variant='h6'
                    color={'text.primary'}
                    sx={{ lineHeight: '22px', mt: 4, textTransform: 'capitalize' }}
                  >
                    inclusion of fees
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '10px',
                  width: '100%'
                }}
              >
                <Box>
                  <Typography
                    variant='caption'
                    color={'customColors.text3'}
                    sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                  >
                    {' '}
                    Total Amount Payable
                  </Typography>
                  <Typography color={'primary.dark'} sx={{ fontSize: '22px', fontWeight: 600, lineHeight: '28px' }}>
                    {' '}
                    ₹ 13,500
                  </Typography>
                </Box>
                <Divider sx={{ mt: 3, mb: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography
                      variant='caption'
                      color={'customColors.text3'}
                      sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                    >
                      {' '}
                      Net Amount
                    </Typography>
                    <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                      {' '}
                      ₹ 12,000
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant='caption'
                      color={'customColors.text3'}
                      sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                    >
                      {' '}
                      Tax Amount
                    </Typography>
                    <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                      {' '}
                      ₹ 1,500
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '10px',
                  width: '100%',
                  mt: 4,
                  overflow: 'hidden'
                }}
              >
                <Box>
                  <Typography
                    variant='subtitle1'
                    color={'text.primary'}
                    sx={{ lineHeight: '17.6px', textTransform: 'capitalize' }}
                  >
                    {' '}
                    calculated fees
                  </Typography>
                </Box>
                <Box
                  className='fixedModal'
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    mt: 5,
                    height: '510px',
                    overflowY: 'auto'
                  }}
                >
                  <Box>
                    <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant='body2'
                        color={'text.primary'}
                        sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                      >
                        registration fees
                      </Typography>
                      <Typography
                        variant='subtitle2'
                        color={'error.main'}
                        sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                      >
                        ₹ 15,000
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant='body2'
                        color={'text.primary'}
                        sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                      >
                        registration fees
                      </Typography>
                      <Typography
                        variant='subtitle2'
                        color={'success.main'}
                        sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                      >
                        ₹ 15,000
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                      sx={{ mr: 3 }}
                      variant='outlined'
                      color='inherit'
                      onClick={() => router.push('/enquiry-listing/enquiries')}
                    >
                      Cancel
                    </Button>
                    <Button variant='contained' color='secondary'>
                      Calculate
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid> */}
          <FeesStructure school={school} feeStructure={feeStucture} />
        </Box>
      )}

      <Grid container xs={12} spacing={5}>
        <Grid item xs={12} md={9}>
          {tabValue === 2 && (
            <Box sx={{ mb: 8 }}>
              {/* <Grid container xs={12} spacing={5}>
            <Grid item xs={12} md={9}>
              <Box
                sx={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '10px',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Box sx={{ mt: 3, mb: 4 }}>
                  <Grid container xs={12} spacing={3}>
                    <Grid item container xs={12} spacing={3}>
                      <Grid item xs={12} md={4}>
                        <FormControl>
                          <FormLabel
                            sx={{ fontSize: '14px', lineHeight: '15.4px', color: 'text.primary' }}
                            id='demo-row-radio-buttons-group-label'
                          >
                            Select Bus Type
                          </FormLabel>
                          <RadioGroup
                            row
                            aria-labelledby='demo-row-radio-buttons-group-label'
                            name='row-radio-buttons-group'
                            value={busType}
                            onChange={handleBusType}
                          >
                            <FormControlLabel
                              value='ac'
                              sx={{
                                '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                  color: 'customColors.text3'
                                }
                              }}
                              control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                              label='AC'
                            />
                            <FormControlLabel
                              sx={{
                                '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                  color: 'customColors.text3'
                                }
                              }}
                              value='nonAc'
                              control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                              label='Non AC'
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl>
                          <FormLabel
                            sx={{ fontSize: '14px', lineHeight: '15.4px', color: 'text.primary' }}
                            id='demo-row-radio-buttons-group-label'
                          >
                            Select The Service Type
                          </FormLabel>
                          <RadioGroup
                            row
                            aria-labelledby='demo-row-radio-buttons-group-label'
                            name='row-radio-buttons-group'
                            value={serviceType}
                            onChange={handleServiceType}
                          >
                            <FormControlLabel
                              value='oneWay'
                              sx={{
                                '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                  color: 'customColors.text3'
                                }
                              }}
                              control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                              label='One Way'
                            />
                            <FormControlLabel
                              sx={{
                                '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                  color: 'customColors.text3'
                                }
                              }}
                              value='twoWay'
                              control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                              label='Two Way'
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      {serviceType === 'oneWay' && (
                        <Grid item xs={12} md={4}>
                          <FormControl>
                            <FormLabel
                              sx={{ fontSize: '14px', lineHeight: '15.4px', color: 'text.primary' }}
                              id='demo-row-radio-buttons-group-label'
                            >
                              Choose One Way Route
                            </FormLabel>
                            <RadioGroup
                              row
                              aria-labelledby='demo-row-radio-buttons-group-label'
                              name='row-radio-buttons-group'
                              value={route}
                              onChange={handleRoute}
                            >
                              <Tooltip title='Pickup Point To School'>
                                <FormControlLabel
                                  value='school'
                                  sx={{
                                    '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                      color: 'customColors.text3',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      width: '80px'
                                    }
                                  }}
                                  control={
                                    <Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />
                                  }
                                  label='Pickup Point To School'
                                />
                              </Tooltip>
                              <Tooltip title='School To Drop Point'>
                                <FormControlLabel
                                  sx={{
                                    '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                      color: 'customColors.text3',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      width: '80px'
                                    }
                                  }}
                                  value='dropPoint'
                                  control={
                                    <Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />
                                  }
                                  label='School To Drop Point'
                                />
                              </Tooltip>
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                    <Grid item container xs={12} spacing={6}>
                      {(serviceType === 'twoWay' || route === 'school' || route === 'dropPoint') && (
                        <>
                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                              <InputLabel id='demo-simple-select-outlined-label'>Select Pickup Point</InputLabel>
                              <Select
                                IconComponent={DownArrow}
                                label='Select Pickup Point'
                                defaultValue={pickup}
                                id='demo-simple-select-outlined'
                                labelId='demo-simple-select-outlined-label'
                                onChange={handlePickup}
                              >
                                <MenuItem value='selectOption'>-Select Option-</MenuItem>
                                <MenuItem value='Malad'>Malad</MenuItem>
                                <MenuItem value='Dahisar'>Dahisar</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                              <InputLabel
                                disabled={
                                  route === 'school' || (route === 'dropPoint' && serviceType !== 'twoWay')
                                    ? true
                                    : false
                                }
                                id='demo-simple-select-outlined-label'
                              >
                                Select Drop Point
                              </InputLabel>
                              <Select
                                IconComponent={DownArrow}
                                label='Select Drop Point'
                                defaultValue={drop}
                                id='demo-simple-select-outlined'
                                labelId='demo-simple-select-outlined-label'
                                onChange={handleDrop}
                                disabled={
                                  route === 'school' || (route === 'dropPoint' && serviceType !== 'twoWay')
                                    ? true
                                    : false
                                }
                              >
                                <MenuItem value='selectOption'>-Select Option-</MenuItem>
                                <MenuItem value='Malad'>Malad</MenuItem>
                                <MenuItem value='Dahisar'>Dahisar</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </>
                      )}
                      {route === 'dropPoint' && serviceType !== 'twoWay' && (
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label='Other Location'
                            value='Enter Location'
                            placeholder='Enter Location'
                            defaultValue='Enter Location'
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel id='demo-simple-select-outlined-label'>Zone</InputLabel>
                          <Select
                            IconComponent={DownArrow}
                            label='Zone'
                            defaultValue={zone}
                            id='demo-simple-select-outlined'
                            labelId='demo-simple-select-outlined-label'
                            onChange={handleZone}
                          >
                            <MenuItem value='selectZone'>-Select Zone-</MenuItem>
                            <MenuItem value='Zone1'>Zone 1</MenuItem>
                            <MenuItem value='Zone2'>Zone 2</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Button variant='contained' color='primary'>
                    Submit
                  </Button>
                </Box>
                <Box sx={{ mt: 8, mb: 5 }}>
                  <Divider />
                </Box>

                <Box>
                  <Typography
                    variant='h6'
                    color={'text.primary'}
                    sx={{ lineHeight: '22px', mt: 4, textTransform: 'capitalize' }}
                  >
                    Fees Structure
                  </Typography>
                </Box>
                <Box>
                  <DataGrid
                    autoHeight
                    columns={admisionFeeColumn}
                    checkboxSelection
                    rows={admisionFeeRow}
                    hideFooterPagination
                    className='dataTable'
                    sx={{
                      boxShadow: 0,
                      mt: 5,
                      '& .MuiDataGrid-main': {
                        overflow: 'hidden'
                      }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '10px',
                  width: '100%'
                }}
              >
                <Box>
                  <Typography
                    variant='caption'
                    color={'customColors.text3'}
                    sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                  >
                    {' '}
                    Total Amount Payable
                  </Typography>
                  <Typography color={'primary.dark'} sx={{ fontSize: '22px', fontWeight: 600, lineHeight: '28px' }}>
                    {' '}
                    ₹ 13,500
                  </Typography>
                </Box>
                <Divider sx={{ mt: 3, mb: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography
                      variant='caption'
                      color={'customColors.text3'}
                      sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                    >
                      {' '}
                      Net Amount
                    </Typography>
                    <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                      {' '}
                      ₹ 12,000
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant='caption'
                      color={'customColors.text3'}
                      sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                    >
                      {' '}
                      Tax Amount
                    </Typography>
                    <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                      {' '}
                      ₹ 1,500
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '10px',
                  width: '100%',
                  mt: 4,
                  overflow: 'hidden'
                }}
              >
                <Box>
                  <Typography
                    variant='subtitle1'
                    color={'text.primary'}
                    sx={{ lineHeight: '17.6px', textTransform: 'capitalize' }}
                  >
                    {' '}
                    calculated fees
                  </Typography>
                </Box>
                <Box
                  className='fixedModal'
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    mt: 5,
                    height: '510px',
                    overflowY: 'auto'
                  }}
                >
                  <Box>
                    <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant='body2'
                        color={'text.primary'}
                        sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                      >
                        registration fees
                      </Typography>
                      <Typography
                        variant='subtitle2'
                        color={'error.main'}
                        sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                      >
                        ₹ 15,000
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant='body2'
                        color={'text.primary'}
                        sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                      >
                        registration fees
                      </Typography>
                      <Typography
                        variant='subtitle2'
                        color={'success.main'}
                        sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                      >
                        ₹ 15,000
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                      sx={{ mr: 3 }}
                      variant='outlined'
                      color='inherit'
                      onClick={() => router.push('/enquiry-listing/enquiries')}
                    >
                      Cancel
                    </Button>
                    <Button variant='contained' color='secondary'>
                      Calculate
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid> */}
              <TransportFees
                setTotalAmmount={setTotalAmmount}
                setSelectedFees={setSelectedFees}
                selectedFees={selectedFees}
                calculatedList={calculatedList}
                school={school}
                payload={payloadFilter}
                feeStucture={feeStucture}
                setCalculatedList={setCalculatedList}
              />
            </Box>
          )}
          {tabValue === 3 && (
            <Box sx={{ mb: 8 }}>
              <Cafeteria
                setTotalAmmount={setTotalAmmount}
                setSelectedFees={setSelectedFees}
                selectedFees={selectedFees}
                calculatedList={calculatedList}
                school={school}
                payload={payloadFilter}
                feeStucture={feeStucture}
                setCalculatedList={setCalculatedList}
              />
            </Box>
          )}
          {/* {tabValue === 4 && (
            <Box sx={{ mb: 8 }}>
              <PSA
                setTotalAmmount={setTotalAmmount}
                setSelectedFees={setSelectedFees}
                selectedFees={selectedFees}
                calculatedList={calculatedList}
                school={school}
                payload={payloadFilter}
                feeStucture={feeStucture}
                setCalculatedList={setCalculatedList}
              />
            </Box>
          )}
          {tabValue === 5 && (
            <Box sx={{ mb: 8 }}>
              <SummerCamp
                setTotalAmmount={setTotalAmmount}
                setSelectedFees={setSelectedFees}
                selectedFees={selectedFees}
                calculatedList={calculatedList}
                school={school}
                payload={payloadFilter}
                feeStucture={feeStucture}
                setCalculatedList={setCalculatedList}
              />
            </Box>
          )} */}
          {tabValue === 4 && (
            <Box sx={{ mb: 8 }}>
              <KidsClub
                setTotalAmmount={setTotalAmmount}
                setSelectedFees={setSelectedFees}
                selectedFees={selectedFees}
                calculatedList={calculatedList}
                school={school}
                payload={payloadFilter}
                feeStucture={feeStucture}
                setCalculatedList={setCalculatedList}
              />
            </Box>
          )}
          {tabValue === 5 && (
            <Box sx={{ mb: 8 }}>
              <Grid container xs={12} spacing={5}>
                <Grid item xs={12} md={9}>
                  <Box
                    sx={{
                      background: '#fff',
                      padding: '24px',
                      borderRadius: '10px',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <Box className='fixedModal' sx={{ overflowY: 'auto', height: '700px' }}>
                      <Box>
                        <Typography
                          variant='h6'
                          color={'text.primary'}
                          sx={{ lineHeight: '22px', mt: 6, textTransform: 'capitalize' }}
                        >
                          Discounts & Schemes
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 4, mb: 4 }}>
                        <Divider />
                      </Box>
                      <Box sx={{ mt: 3, mb: 5 }}>
                        <Typography
                          variant='subtitle1'
                          color={'text.primary'}
                          sx={{ lineHeight: '17.6px', textTransform: 'capitalize' }}
                        >
                          Group 1
                        </Typography>
                        <Box sx={{ mt: 5, mb: 5, ml: 3 }}>
                          <FormGroup>
                            {group1Label.map((data, index) => (
                              <FormControlLabel
                                sx={{
                                  '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                    color:
                                      index === 0 || index === 4
                                        ? `${theme.palette.success.main} `
                                        : `${theme.palette.customColors.mainText}`
                                  }
                                }}
                                key={index}
                                control={<Checkbox />}
                                label={data.label}
                              />
                            ))}
                          </FormGroup>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 3, mb: 5 }}>
                        <Typography
                          variant='subtitle1'
                          color={'text.primary'}
                          sx={{ lineHeight: '17.6px', textTransform: 'capitalize' }}
                        >
                          Group 2
                        </Typography>
                        <Box sx={{ mt: 5, mb: 5, ml: 3 }}>
                          <FormGroup>
                            {group2Label.map((data, index) => (
                              <FormControlLabel
                                sx={{
                                  '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                    color:
                                      index === 1 || index === 2
                                        ? `${theme.palette.success.main} `
                                        : `${theme.palette.customColors.mainText}`
                                  }
                                }}
                                key={index}
                                control={<Checkbox />}
                                label={data.label}
                              />
                            ))}
                          </FormGroup>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box
                    sx={{
                      background: '#fff',
                      padding: '16px',
                      borderRadius: '10px',
                      width: '100%'
                    }}
                  >
                    <Box>
                      <Typography
                        variant='caption'
                        color={'customColors.text3'}
                        sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                      >
                        {' '}
                        Total Amount Payable
                      </Typography>
                      <Typography color={'primary.dark'} sx={{ fontSize: '22px', fontWeight: 600, lineHeight: '28px' }}>
                        {' '}
                        ₹ 13,500
                      </Typography>
                    </Box>
                    <Divider sx={{ mt: 3, mb: 3 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography
                          variant='caption'
                          color={'customColors.text3'}
                          sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                        >
                          {' '}
                          Net Amount
                        </Typography>
                        <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                          {' '}
                          ₹ 12,000
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant='caption'
                          color={'customColors.text3'}
                          sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                        >
                          {' '}
                          Tax Amount
                        </Typography>
                        <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                          {' '}
                          ₹ 1,500
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      background: '#fff',
                      padding: '16px',
                      borderRadius: '10px',
                      width: '100%',
                      mt: 4,
                      overflow: 'hidden'
                    }}
                  >
                    <Box>
                      <Typography
                        variant='subtitle1'
                        color={'text.primary'}
                        sx={{ lineHeight: '17.6px', textTransform: 'capitalize' }}
                      >
                        {' '}
                        calculated fees
                      </Typography>
                    </Box>
                    <Box
                      className='fixedModal'
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        mt: 5,
                        height: '510px',
                        overflowY: 'auto'
                      }}
                    >
                      <Box>
                        <Box
                          sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <Typography
                            variant='body2'
                            color={'text.primary'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            registration fees
                          </Typography>
                          <Typography
                            variant='subtitle2'
                            color={'error.main'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            ₹ 15,000
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant='body2'
                            color={'text.primary'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            registration fees
                          </Typography>
                          <Typography
                            variant='subtitle2'
                            color={'success.main'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            ₹ 15,000
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button
                          sx={{ mr: 3 }}
                          variant='outlined'
                          color='inherit'
                          onClick={() => router.push('/enquiry-listing/enquiries')}
                        >
                          Cancel
                        </Button>
                        <Button variant='contained' color='secondary'>
                          Calculate
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          {tabValue != 0 && tabValue != 1 ? (
            <Box
              sx={{
                background: '#fff',
                padding: '24px',
                borderRadius: '10px',
                width: '100%'
              }}
            >
              <Box sx={{ mt: 8, mb: 5 }}>
                <Divider />
              </Box>

              <Box>
                <Typography
                  variant='h6'
                  color={'text.primary'}
                  sx={{ lineHeight: '22px', mt: 4, textTransform: 'capitalize' }}
                >
                  Fees Structure
                </Typography>
              </Box>
              <Box>
                <DataGrid
                  autoHeight
                  columns={admisionFeeColumn || []}
                  checkboxSelection
                  rows={calculatedList || []}
                  hideFooterPagination
                  className='dataTable'
                  sx={{
                    boxShadow: 0,
                    mt: 5,
                    '& .MuiDataGrid-main': {
                      overflow: 'hidden'
                    }
                  }}
                  onRowSelectionModelChange={handleRowSelectionChange}
                  getRowId={(row: any) => row?.id}
                />
              </Box>
            </Box>
          ) : null}
        </Grid>
        {tabValue != 0 && tabValue != 1 ? (
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                background: '#fff',
                padding: '16px',
                borderRadius: '10px',
                width: '100%'
              }}
            >
              <Box>
                <Typography
                  variant='caption'
                  color={'customColors.text3'}
                  sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                >
                  {' '}
                  Total Amount Payable
                </Typography>
                <Typography color={'primary.dark'} sx={{ fontSize: '22px', fontWeight: 600, lineHeight: '28px' }}>
                  ₹ {formatAmount(Math.round(totalAmmount))}
                </Typography>
              </Box>
              <Divider sx={{ mt: 3, mb: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* <Box>
                            <Typography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                            >
                                {' '}
                                Net Amount
                            </Typography>
                            <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                                {' '}
                                ₹ 12,000
                            </Typography>
                        </Box>
                        <Box>
                            <Typography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                            >
                                {' '}
                                Tax Amount
                            </Typography>
                            <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                                {' '}
                                ₹ 1,500
                            </Typography>
                        </Box> */}
              </Box>
            </Box>
            <Box
              sx={{
                background: '#fff',
                padding: '16px',
                borderRadius: '10px',
                width: '100%',
                mt: 4,
                overflow: 'hidden'
              }}
            >
              <Box>
                <Typography
                  variant='subtitle1'
                  color={'text.primary'}
                  sx={{ lineHeight: '17.6px', textTransform: 'capitalize' }}
                >
                  {' '}
                  calculated fees
                </Typography>
              </Box>
              <Box
                className='fixedModal'
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  mt: 5,
                  height: '510px',
                  overflowY: 'auto'
                }}
              >
                <Box>
                  {selectedFees && selectedFees?.length
                    ? selectedFees?.map((val: any, index: number) => {
                        return (
                          <Box
                            key={index}
                            sx={{
                              mt: 3,
                              mb: 3,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Typography
                              variant='body2'
                              color={'text.primary'}
                              sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                            >
                              {val?.fee_type}
                            </Typography>
                            <Typography
                              variant='subtitle2'
                              color={'success.main'}
                              sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                            >
                              ₹ {val?.amount}
                            </Typography>
                          </Box>
                        )
                      })
                    : null}
                </Box>
                {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button
                                sx={{ mr: 3 }}
                                variant='outlined'
                                color='inherit'
                                onClick={() => router.push('/enquiries')}
                            >
                                Cancel
                            </Button>
                            <Button variant='contained' color='secondary'>
                                Calculate
                            </Button>
                        </Box> */}
              </Box>
            </Box>
          </Grid>
        ) : null}
      </Grid>
    </>
  )
}

export default StudentSpecificInformation
