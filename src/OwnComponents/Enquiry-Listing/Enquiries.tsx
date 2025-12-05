// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
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
  Popover,
  Modal,
  Dialog,
  useMediaQuery,
  useTheme
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { Dayjs } from 'dayjs'
import { GridColDef, GridCellParams, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid'
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
import { getRequest, postRequest, putRequest } from 'src/services/apiService'
import { useSearchParams } from 'next/navigation'
import CustomTimeline from 'src/components/CustomTimeline'
import FatherSVGIcon from './Image/father.svg'
import MotherSVGIcon from './Image/mother.svg'
import StepperForms from 'src/components/EnquiryForms/StepperForms'
import CompetencyTest from '../Registration/Dialog/CompetencyTest'
import {
  getLocalStorageVal,
  getObjectByKeyVal,
  formatDate as formatDatee,
  getUserInfo,
  getObjectByKeyValNew
} from 'src/utils/helper'
import ErrorDialogBox from 'src/@core/CustomComponent/ErrorDialogBox/ErrorDialogBox'
import { Can } from 'src/components/Can'
import { ENQUIRY_STAGES, ENQUIRY_STATUS, PERMISSIONS } from 'src/utils/constants'
import CloseEnquiryDialog from './Dialog/CloseEnquiryDialog'
import toast from 'react-hot-toast'
import EnquiryModal from './EnquiryModal'
import ReopenEnquiryDialog from './Dialog/ReopenEnquiryDialog'

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

type EnquiryDetails = {
  edit: boolean
  setEdit: React.Dispatch<React.SetStateAction<boolean>>
  view: boolean
  setView: React.Dispatch<React.SetStateAction<boolean>>
  selectedRowId: any
  registration?: boolean
  app?: any
  authToken?: any
}

const Enquiries = ({ edit, setEdit, view, setView, selectedRowId, registration, app, authToken }: EnquiryDetails) => {

  const router = useRouter()
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()
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
  const [followUpDialog, setFollowUpDialog] = useState<boolean>(false)
  const [schoolVisitMinimized, setSchoolVisitMinimized] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [minimizedFollow, setMinimizedFollow] = useState(false)
  const searchParams = useSearchParams()
  const searchParamsData = searchParams.get('dialog')
  const [enquiryDetails, setEnquiryDetails] = useState<any>(null)
  const [enquiryTypeData, setEnquiryTypeData] = useState<any>(null)
  const [similarEnquiries, setSimilarEnquries] = useState<any>(null)
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null)
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [enquiryCounts, setEnquiryCounts] = useState<any>({
    duplicate: null,
    merged: null,
    formCompleted: null,
    enquiry_status: null,
    enquiry_type: null
  })
  const [mergeSuccess, setMergeSuccess] = useState<boolean>(false)
  const [competencyTest, setCompetencyTest] = useState<boolean>(false)
  const [competencyTestSuccess, setCompetencyTestSuccess] = useState<boolean>(false)
  const [successDialogTitle, setSuccessDialogTitle] = useState<string>('')
  const [refresh, setRefresh] = useState<boolean>(false)
  const [employeesList, setEmployeesList] = useState<any>([])
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false)
  const [closeEnquiryDialog, setCloseEnquiryDialog] = useState(false)
  const [ReopenEnquiryDialogbox, setReopenEnquiryDialogbox] = useState(false)
  const [closeEnquirySuccess, setCloseEnquirySuccess] = useState<boolean>(false)
  const [academicYears, setacademicYears] = useState<any>([])
  const [mergedEnquiries, setMergedEnquiries] = useState<any>(null)
  const [mobileView, setMobileView] = useState<boolean>(false)
  const [authenticationToken, setAuthenticationToken] = useState<any>('')
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const queryParams = app
    if (queryParams === 'mobile') {
      setMobileView(true)
      getSimilarEnquiries()
    }
  }, [app])

  const getAcademicYear = async () => {
    const apiRequest = {
      url: `/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response: any = await getRequest(apiRequest)
    if (response.data) {
      setacademicYears(response.data)
    }
  }

  useEffect(() => {
    getAcademicYear()
  }, [])
  //Handler for chip delete
  const handleChipDelete = () => {
    setCloseEnquiryDialog(true)
    setAnchorElOne(null)
  }
  const handleCloseEnquiryDialog = () => {
    setCloseEnquiryDialog(false)
    setAnchorElOne(null)
  }  
  const handleReopenEnquiryDialogOpen = async () => {

    setGlobalState({ isLoading: true })
      const params = {
        url: `marketing/enquiry/enquiryReopen/${enquiryDetails?._id?.toString()}`,
        data: { 
          validate: true, 
          reopenReason: {
            id: 0,
            value: 'Reopen'
          }
        },
        serviceURL: 'marketing',
        authToken: authToken
      }
      
      const response = await postRequest(params)
    if (response?.status == 200) {
      setReopenEnquiryDialogbox(true)
    } else {
      setApiResponseType({ status: true, message: response?.error?.error?.response?.message || "Something Went Wrong!" })
    }
    setGlobalState({ isLoading: false })
  }

  const handleReopenEnquiryDialog = () => {
    setReopenEnquiryDialogbox(false)
    setAnchorElOne(null)
  }
  const handleErrorClose = () => {
    setOpenErrorDialog(false)
  }
  const enquirerStatusObj: any = {
    Open: { title: 'Open', color: 'success' },
    Close: { title: 'Close', color: 'error' }
  }

  const getSimilarEnquiries = async () => {
    let userInfo
    if (mobileView) {
      userInfo = {
        userInfo: {
          id: 4
        }
      }
    } else {
      userInfo = getUserInfo()
    }
    const params = {
      url: `marketing/enquiry/${selectedRowId}/similar-enquiries`,
      params: {
        user_id: userInfo?.userInfo?.id
      },
      authToken: authToken
    }
    const response = await getRequest(params)
    if (response.status) {
      const currentEnquiryDetails = response?.data?.current_enquiry_details
      const similarEnquiriesData = response?.data?.similar_enquiries
      similarEnquiriesData.unshift(currentEnquiryDetails)
      setSelectedEnquiry(similarEnquiriesData[0])
      setSimilarEnquries(similarEnquiriesData)
      setEnquiryCounts({
        duplicate: response?.data?.duplicate_count,
        merged: response?.data?.merged_count,
        formCompleted: response?.data?.form_completed_percentage,
        enquiry_status: response?.data?.enquiry_status,
        enquiry_type: response?.data?.enquiry_type
      })
    }

    const apiRequest = {
      url: `marketing/enquiry/${selectedRowId}/merged-enquiries`,
      authToken: authToken
    }
    const res = await getRequest(apiRequest)
    if (res.status) {
      try {
        const result = res.data.map((item: any) => item.enquiry_number).join(', ')
        setMergedEnquiries(result)
      } catch (e: any) {
        console.log('Error')
      }
    }
  }

  const setFormCompletion = async () => {
    const userInfo = getUserInfo()
    const params = {
      url: `marketing/enquiry/${selectedRowId}/similar-enquiries`,
      params: {
        user_id: userInfo?.userInfo?.id
      },
      authToken: authToken
    }
    const response = await getRequest(params)

    setEnquiryCounts((prevState: any) => {
      return {
        ...prevState,
        formCompleted: response?.data?.form_completed_percentage
      }
    })
  }

  useEffect(() => {
    console.log('coming getSimilarEnquiries ', selectedRowId)
    if (selectedRowId) {
      getSimilarEnquiries()
    }
  }, [selectedRowId])

  const getEnquiryTypeData = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry-type/${selectedEnquiry?.enquiry_type_id}/formdata`,
      authToken: authToken
    }

    const response = await getRequest(params)
    if (response?.status) {
      setEnquiryTypeData(response?.data)
    }
    setGlobalState({ isLoading: false })
  }

  useEffect(() => {
    if (selectedEnquiry) {
      getEnquiryTypeData()
    }
  }, [selectedEnquiry])
  const userDetailsJson = getLocalStorageVal('userDetails')
  const userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : {}

  useEffect(() => {
    // const fetchUsersData = async () => {
    //   try {
    //     const apiRequest = {
    //       url: `/api/rbac-role-permissions/role-permissions-for-user`,
    //       serviceURL: 'mdm',
    //       data: {
    //         user_email: userDetails?.email ? userDetails.email : 'danik.shera@ampersandgroup.in',
    //         application_id: 1,
    //         service: 'marketing_service'
    //       },
    //       headers: {
    //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
    //       }
    //     }
    //     const response: any = await postRequest(apiRequest)
    //     // Handle the response here, e.g., set the state with the data
    //     if (response.success) {
    //       //fetchEmployeesList(response?.data?.userInfo)
    //     }
    //   } catch (error) {
    //     console.error('Error fetching data:', error)
    //   }
    // }
    // const fetchEmployeesList = async (userDetails: any) => {
    //   try {
    //     const userDetailsJsonDt = getLocalStorageVal('userInfo')
    //     const userDetailsDt = userDetailsJsonDt ? JSON.parse(userDetailsJsonDt) : {}
    //     // const apiRequest = {
    //     //   url: `/api/hr-employee-masters?[Base_Location][Base_Location][parent_1_id][$eq]=${userDetailsDt?.schoolCode}`,
    //     //   serviceURL: 'mdm',
    //     //   headers: {
    //     //     Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
    //     //   }
    //     // }
    //     // const response: any = await getRequest(apiRequest)
    //     const apiRequest = {
    //       url: 'marketing/enquiry/reassign',
    //       data: {
    //         "school_code": userDetailsDt?.schoolCode,
    //         "hris_code": userDetailsDt?.hrisCodes?.length ? userDetailsDt?.hrisCodes[0] : null
    //       }
    //     }
    //     const response: any = await postRequest(apiRequest)
    //     const filteredData = response?.data.filter((item: any) => item.attributes?.Official_Email_ID != userDetailsDt?.userInfo?.email)
    //     // Handle the response here, e.g., set the state with the data
    //     setEmployeesList(filteredData)
    //   } catch (error) {
    //     console.error('Error fetching data:', error)
    //   }
    // }
    //fetchUsersData()
  }, [])

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
      field: 'enquiry_date',
      headerName: 'Enquiry Date',
      align: 'center',
      headerAlign: 'center',
      minWidth: 200,
      valueFormatter: params => formatDate(params.value as string),
      flex: 1
    },
    {
      field: 'enquiry_number',
      headerName: 'Enquiry Number',
      align: 'center',
      headerAlign: 'center',
      minWidth: 190,
      flex: 1
    },
    {
      field: 'enquiry_for',
      headerName: 'Enquiry For',
      align: 'center',
      headerAlign: 'center',
      minWidth: 190,
      flex: 1
    },
    {
      field: 'student_name',
      headerName: 'Student Name',
      align: 'center',
      headerAlign: 'center',
      minWidth: 200,
      flex: 1
    },

    {
      field: 'stage_name',
      headerName: 'Stage',
      align: 'center',
      headerAlign: 'center',
      minWidth: 200,
      flex: 1
    },
    {
      flex: 1,
      minWidth: 120,
      field: 'stage_status',
      headerName: 'Status',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const status = enquirerStatusObj[params.row.stage_status]

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

  const mergeColumn = [
    {
      field: 'enquiry_date',
      headerName: 'Enquiry Date',
      align: 'center',
      headerAlign: 'center',
      minWidth: 200,
      flex: 1
    },
    {
      field: 'enquiry_number',
      headerName: 'Enquiry Number',
      align: 'center',
      headerAlign: 'center',
      minWidth: 190,
      flex: 1
    },
    {
      field: 'enquiry_for',
      headerName: 'Enquiry For',
      align: 'center',
      headerAlign: 'center',
      minWidth: 190,
      flex: 1
    },
    {
      field: 'student_name',
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
  const getEnquiryDetails = async () => {
    try {
      const url = {
        url: `marketing/enquiry/${selectedRowId}`,
        serviceURL: 'marketing',
        authToken: authToken
      }
      const response = await getRequest(url)
      if (response.status) {
        setEnquiryDetails(response.data)
      }
    } catch (error) {
      console.error('Error fetching role details:', error)
    } finally {
      // decrementLoading();
    }
  }

  useEffect(() => {
    if ((edit || view || registration) && selectedRowId != undefined) {
      getEnquiryDetails()
    }
  }, [edit, view, registration, selectedRowId, refresh])

  useEffect(() => {
    if (searchParamsData === 'followUp') {
      setFollowUpDialog(true)
    } else if (searchParamsData === 'schoolVisit') {
      setSchoolTourDialog(true)
    }
  }, [searchParamsData])

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
  const academicText = `AY ${enquiryDetails?.academic_year?.value}`
  const enquiry_status = enquiryCounts?.enquiry_status === 'Admitted' ? 'Provisional Admission' : enquiryCounts?.enquiry_status; // this is a temporary fix for testing because of Sampada
  const chipsLabel2 = [`${enquiryCounts?.formCompleted}% Form Completed`, `${enquiry_status}`]

  if (enquiryDetails?.academic_year?.value) {
    chipsLabel2.unshift(academicText)
  }

  const handleSuccessDialogClose = () => {
    setSuccessDialog(false)
    router.push('/enquiries')
  }

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Enquiry Listing',
        path: '/enquiries'
      },
      {
        title: 'Enquiries'
      }
    ])
  }, [])

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
    router.push('/enquiries')
  }

  //Handler for transfer Dialog

  const handleTransferDialogClose = () => {
    setTransferDialog(false)
    setAnchorElOne(null)
  }
  const handlerTransfer = (data: any) => {
    setTransferDialog(false)
    setTransferCompleteDialog(true)
  }
  const handleTransferSuccessClose = () => {
    setTransferCompleteDialog(false)
    setAnchorElOne(null)
    router.push('/enquiries')
  }

  //Handler for schoolTour Dialog
  const handleSchoolTourDialogClose = () => {
    setSchoolTourDialog(false)
  }
  const handleFollowUpDialogClose = () => {
    setFollowUpDialog(false)
    window.location.reload()
  }

  const handleSelectedEnquiry = (data: any) => {
    setSelectedEnquiry(data)
    setAnchorEl(null)
  }

  const handleOpenTransfer = (params: any) => {
    setTransferDialog(true)
  }

  const handleAdmissionApprovel = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/admission-approvel/${enquiryDetails?.enquiry_number}`,
      serviceURL: 'marketing',
      authToken: authToken
    }
    const response = await getRequest(params)
    if (response?.status == 200) {
      toast.success('admission Approved Successfully', { duration: 2000 })
      await getEnquiryDetails()
      window.location.reload(); // this is done to update getformdata from steppertForms
    } else {
      toast.error('admission Approvel Failed', { duration: 2000 })
    }
    setGlobalState({ isLoading: false })
  }

  const handleMergeSubmit = () => {
    setMergeSuccess(true)
  }
  const handleMergeSuccessDialogClose = () => {
    setMergeSuccess(false)
    setMergeDialog(false)
    window.location.reload()
  }
  const handleCompetencyTestDialogClose = () => {
    setCompetencyTest(false)
  }

  const handleCompetencySuccessClose = () => {
    window?.location?.reload()

    setCompetencyTestSuccess(false)
    setAnchorElOne(null)
  }

  const handleCloseEnquirySuccess = () => {
    setCloseEnquirySuccess(false)
    window.location.reload()
  }

  const handeSucessDialog = (title: string) => {
    setCompetencyTestSuccess(true)
    setSuccessDialogTitle(title)
  }

  const openCompetencyTest = () => {
    if (!minimized) {
      setCompetencyTest(true)
      setAnchorElOne(null)
    } else {
      setMinimized(false)
      setAnchorElOne(null)
    }
  }

  return (
    <Fragment>
      {/* <Card sx={{ mt: 4, width: '100%' }}> */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <Box sx={{ width: '96%' }}>
          {!mobileView && (
            <>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
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
                          {selectedEnquiry?.enquiry_name}
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
                            {similarEnquiries && similarEnquiries?.length
                              ? similarEnquiries?.map((val: any, index: any) => {
                                return (
                                  <MenuItem
                                    key={index}
                                    onClick={() => {
                                      handleSelectedEnquiry(val)
                                    }}
                                  >
                                    <ListItemText primary={val?.enquiry_name} />
                                  </MenuItem>
                                )
                              })
                              : null}
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
                        // onDelete={label == 'Open' ? () => handleChipDelete(label) : undefined}
                        // deleteIcon={
                        //   label == 'Open' ? (
                        //     <span className='icon-trailing-icon' style={{ color: '#3F41D1' }}></span>
                        //   ) : undefined
                        // }
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                      <Box>
                        <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '21px' }}>
                          {enquiryCounts?.enquiry_type}
                          <Box
                            component='span'
                            sx={{
                              position: 'relative',
                              display: 'inline-block',
                              fontWeight: 'bold',
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
                            (
                            <Tooltip title={mergedEnquiries} placement='top'>
                              <span>{enquiryCounts?.merged} Merged </span>
                            </Tooltip>
                            )
                          </Box>
                        </Typography>
                        <Typography
                          variant='body2'
                          color={'text.primary'}
                          sx={{ lineHeight: '21px', mt: '5px', mb: '5px' }}
                        >
                          Enquiry Number -{' '}
                          <span
                            style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={handleOpen}
                          >
                            {enquiryDetails?.enquiry_number}
                          </span>
                        </Typography>
                        <Typography variant='caption' sx={{ lineHeight: '18px' }} color={'text.primary'}>
                          {formatDatee(selectedEnquiry?.enquiry_date)}
                        </Typography>
                      </Box>

                      {enquiryDetails?.parent_details && enquiryDetails?.parent_details?.father_details?.first_name ? (
                        <>
                          <Divider orientation='vertical' flexItem sx={{ borderWidth: '2px', ml: 2 }} />

                          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', ml: 2 }}>
                            <Box sx={{ mt: 1 }}>
                              <Image src={FatherSVGIcon} alt='Father Icon' width={30} height={35} />
                            </Box>
                            <Box sx={{ ml: 2 }}>
                              <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '21px' }}>
                                {`${enquiryDetails?.parent_details?.father_details?.first_name} ${enquiryDetails?.parent_details?.father_details?.last_name}(Father)`}
                              </Typography>
                              <Typography variant='caption' sx={{ lineHeight: '18px' }} color={'text.primary'}>
                                {`${enquiryDetails?.parent_details?.father_details?.mobile}`} |{' '}
                                {`${enquiryDetails?.parent_details?.father_details?.email}`}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      ) : null}

                      {enquiryDetails?.parent_details && enquiryDetails?.parent_details?.mother_details?.first_name ? (
                        <>
                          <Divider orientation='vertical' flexItem sx={{ borderWidth: '2px', ml: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', ml: 2 }}>
                            <Box sx={{ mt: 1 }}>
                              <Image src={MotherSVGIcon} alt='Father Icon' width={30} height={35} />
                            </Box>
                            <Box sx={{ ml: 2 }}>
                              <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '21px' }}>
                                {`${enquiryDetails?.parent_details?.mother_details?.first_name} ${enquiryDetails?.parent_details?.mother_details?.last_name}(Mother)`}
                              </Typography>
                              <Typography variant='caption' sx={{ lineHeight: '18px' }} color={'text.primary'}>
                                {`${enquiryDetails?.parent_details?.mother_details?.mobile}`} |{' '}
                                {`${enquiryDetails?.parent_details?.mother_details?.email}`}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      ) : null}
                    </Box>
                  </Box>
                </Box>
                <Box>
                  {similarEnquiries && similarEnquiries?.length && enquiryDetails?.status !== 'Closed' ? (
                    <>
                      <IconButton
                        disableFocusRipple
                        disableRipple
                        sx={{ mr: 2, background: "#F4F0EF'" }}
                        onClick={() => router.push(`/enquiries/student-onboarding/${selectedRowId}`)}
                      >
                        <span className='icon-studentInfo'></span>
                      </IconButton>
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
                    </>
                  ) : null}
                  {enquiryDetails?.status === 'Closed' ? (
                    <Can pagePermission={[PERMISSIONS?.ENQUIRY_REOPEN]} action={'HIDE'}>
                      <Button
                        disableRipple
                        disableFocusRipple
                        disableTouchRipple
                        variant='contained'
                        color='primary'
                        onClick={handleReopenEnquiryDialogOpen}
                        startIcon={<OpenInNewIcon />}
                      >
                        Re-Open
                      </Button>
                    </Can>
                  ) : null}

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
                      <Can pagePermission={[PERMISSIONS?.COMPETENCY_TEST]} action={'HIDE'}>
                        {getObjectByKeyVal(enquiryDetails?.enquiry_stages, 'stage_name', ENQUIRY_STAGES?.REGISTRATION)
                          ?.status == ENQUIRY_STATUS?.COMPLETED &&
                          getObjectByKeyVal(enquiryDetails?.enquiry_stages, 'stage_name', ENQUIRY_STAGES?.COMPETENCY_TEST)
                            ?.status != 'Failed' ? (
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
                        ) : null}
                      </Can>
                      <Can pagePermission={[PERMISSIONS?.REGISTRATION_MERGE]} action={'HIDE'}>
                        <MenuItem>
                          <ListItemText primary='Merge' onClick={() => setMergeDialog(true)} />
                        </MenuItem>
                      </Can>

                      <Can pagePermission={[PERMISSIONS?.REGISTRATION_REASSIGN]} action={'HIDE'}>
                        <MenuItem>
                          <ListItemText primary='Reassign' onClick={() => setReassignDialog(true)} />
                        </MenuItem>
                      </Can>
                      <Can pagePermission={[PERMISSIONS?.REGISTRION_TRANSFER]} action={'HIDE'}>
                        <MenuItem>
                          <ListItemText primary='Transfer' onClick={handleOpenTransfer} />
                        </MenuItem>
                      </Can>
                      <Can pagePermission={[PERMISSIONS?.REGISTRATION_SCHOOL_VISIT]} action={'HIDE'}>
                        <MenuItem>
                          <ListItemText
                            primary='School Visit'
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
                      </Can>
                      <Can pagePermission={[PERMISSIONS?.REGISTRATION_FOLOWUP]} action={'HIDE'}>
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
                      </Can>
                      {/* <Can pagePermission={[PERMISSIONS?.ADMISION_APPROVEL]} action={'HIDE'}> */}
                      <MenuItem>
                        <ListItemText primary='Approve Admission' onClick={handleAdmissionApprovel} />
                      </MenuItem>
                      {/* </Can>                       */}
                      <MenuItem>
                        <ListItemText primary='Close Enquiry' onClick={handleChipDelete} />
                      </MenuItem>
                    </CustomListOne>
                  </CustomPopoverOne>
                </Box>
              </Box>
            </>
          )}
          <Box
            sx={{
              background: '#fff',
              padding: '24px 24px 20px 24px',
              borderRadius: '10px',
              width: '100%',
              height: 'auto'
            }}
          >
            {enquiryTypeData ? (
              <StepperForms
                enquiryTypeData={enquiryTypeData}
                propsEnquiryId={selectedEnquiry?.enquiry_id}
                activeStepProp={registration ? 2 : undefined}
                view={view}
                hideCTA={enquiryDetails?.status === 'Closed'}
                enquiryDetails={enquiryDetails}
                registration={registration}
                openCompetencyTest={openCompetencyTest}
                mobileView={mobileView}
                authToken={authToken}
                setRefreshList={setRefresh}
                refreshList={refresh}
                setFormCompletion={setFormCompletion}
              />
            ) : null}
            {!mobileView && (
              <>
                <Can pagePermission={[PERMISSIONS?.TIMELINE]} action={'HIDE'}>
                  <Grid container xs={12} spacing={0}>
                    <Grid item xs={12}>
                      {!mobileView ? <CustomTimeline enquiryID={selectedEnquiry?.enquiry_id} /> : null}
                    </Grid>
                  </Grid>
                </Can>
              </>
            )}
          </Box>
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
      {successDialog && (
        <SuccessDialog
          openDialog={successDialog}
          title={`Enquiry Submitted Successfully!`}
          handleClose={handleSuccessDialogClose}
        />
      )}
      {mergeDialog && (
        <MergeDialog
          openModal={mergeDialog}
          closeModal={handleMergeDialogClose}
          header='Merge'
          enquirerColumns={mergeColumn}
          enquirerRows={enquirerRows}
          handleMergeSuccess={handleMergeSubmit}
          enquiryId={selectedEnquiry?.enquiry_id}
        />
      )}

      {mergeSuccess && (
        <SuccessDialog
          openDialog={mergeSuccess}
          title='Enquiry Merged Successfully!'
          handleClose={handleMergeSuccessDialogClose}
        />
      )}

      {reassignDialog && (
        <ReassignEnquiriesDialog
          openModal={reassignDialog}
          closeModal={handleReassignDialogClose}
          header='Reassign'
          enquirerColumns={enquirerColumns}
          handleReassignClose={handlerReassign}
          enquiryId={selectedEnquiry?.enquiry_id}
          mode={'listing'}
        />
      )}
      {reassignCompleteDialog && (
        <SuccessDialog
          openDialog={reassignCompleteDialog}
          title='Leads Transferred Successfully'
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
          enquiryId={selectedEnquiry?.enquiry_id}
          mode={'listing'}
          year={
            getObjectByKeyValNew(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes
              ?.short_name_two_digit
          }
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
          minimized={schoolVisitMinimized}
          setMinimized={setSchoolVisitMinimized}
          enquiryId={selectedRowId}
        />
      )}
      {followUpDialog && (
        <FollowUpDialog
          openDialog={followUpDialog}
          title='Follow Up Details'
          handleClose={handleFollowUpDialogClose}
          minimized={minimizedFollow}
          setMinimized={setMinimizedFollow}
          enquiryId={selectedRowId}
          setFollowUpDialog={setFollowUpDialog}
          academic_year={
            getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes?.short_name_two_digit
          }
        />
      )}
      {competencyTest && (
        <CompetencyTest
          openDialog={competencyTest}
          title='Book Competency Test'
          setOpenErrorDialog={setOpenErrorDialog}
          handleClose={handleCompetencyTestDialogClose}
          setCompetencyTest={setCompetencyTest}
          setCompetencyTestSuccess={handeSucessDialog}
          minimized={minimized}
          setMinimized={setMinimized}
          setRefresh={setRefresh}
          enquiryId={selectedEnquiry?.enquiry_id}
          enquiryDetails={enquiryDetails}
          refresh={refresh}
          academic_year={
            getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes?.short_name_two_digit
          }
        />
      )}
      {competencyTestSuccess && (
        <SuccessDialog
          openDialog={competencyTestSuccess}
          title={successDialogTitle}
          handleClose={handleCompetencySuccessClose}
        />
      )}
      {closeEnquiryDialog && (
        <CloseEnquiryDialog
          openModal={closeEnquiryDialog}
          closeModal={handleCloseEnquiryDialog}
          header='Close Enquiry'
          enquiryId={selectedEnquiry?.enquiry_id}
        //setCloseEnquirySuccess={setCloseEnquirySuccess}
        />
      )}
      {ReopenEnquiryDialogbox && (
        <ReopenEnquiryDialog
          openModal={ReopenEnquiryDialogbox}
          closeModal={handleReopenEnquiryDialog}
          header='Reopen Enquiry'
          enquiryId={selectedEnquiry?.enquiry_id}
          authToken={authToken}
          getEnquiryDetails={getEnquiryDetails}
        />
      )}

      {closeEnquirySuccess && (
        <SuccessDialog
          openDialog={closeEnquirySuccess}
          title={'Enquiry Closed Successfully!'}
          handleClose={handleCloseEnquirySuccess}
        />
      )}

      <Dialog
        open={open}
        fullScreen={fullScreen}
        fullWidth 
        maxWidth='xl' 
        sx={{ width: '100%' }}
      >

        <Box
          sx={{
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              pointerEvents: 'none',    
              userSelect: 'none',       
              opacity: 0.8,         
              padding: 4    
            }}
          >
            <EnquiryModal
              enquiryTypeData={enquiryTypeData}
              propsEnquiryId={selectedEnquiry?.enquiry_id}
              view={view}
              enquiryDetails={enquiryDetails}
              registration={registration}
              mobileView={mobileView}
              authToken={authToken}
              
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              pointerEvents: 'auto',
              zIndex: 10,
              cursor: 'pointer',
              color: 'grey.600',
            }}
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </Box>
        </Box>
      </Dialog>
      <ErrorDialogBox openDialog={openErrorDialog} handleClose={handleErrorClose} title={'Something Went Wrong !'} />
    </Fragment>
  )
}

export default Enquiries
