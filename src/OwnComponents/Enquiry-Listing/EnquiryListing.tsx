'use client'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { Box } from '@mui/system'

import {
  Button,
  Chip,
  Divider,
  Fab,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  Tooltip,
  Typography,
  Badge
} from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { DataGrid, GridColDef, GridCellParams, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid'
import {
  gridPageCountSelector,
  GridPagination,
  useGridApiContext,
  useGridSelector,
  gridRowCountSelector,
  gridPageSizeSelector
} from '@mui/x-data-grid'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'
import { ThemeColor } from 'src/@core/layouts/types'
import { useRouter } from 'next/router'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SearchBox from 'src/@core/CustomComponent/CustomSearchBox/SearchBox'
import FilterComponent from './FilterComponent'
import EnquirerDialog from './Dialog/EnquirerDialog'
import ReassignDialog from './Dialog/ReassignDialog'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import TransferDialog from './Dialog/TransferDialog'
import useDebounce from 'src/utils/useDebounce'
import { getRequest, postRequest, patchRequest } from 'src/services/apiService'
import {
  calculateSerialNumber,
  generateExcelFromJson,
  getCurrentYearObject,
  getNameWithDate,
  getObjectByKeyVal,
  getObjectByKeyValNew,
  setOptionsFromResponse
} from 'src/utils/helper'
import ReassignEnquiriesDialog from './Dialog/ReassignEnquiriesDialog'
import TransferEnquiriesDialog from './Dialog/TransferEnquiriesDialog'
import ReopenDialog from './Dialog/ReopenDialog'
import SchoolTourDialog from './Dialog/SchoolTourDialog'
import FollowUpDialog from './Dialog/FollowUpDialog'
import { getLocalStorageVal } from 'src/utils/helper'
import { Can } from 'src/components/Can'
import { ENQUIRY_STAGES, PERMISSIONS } from 'src/utils/constants'
import DynamicFilterComponent from 'src/@core/CustomComponent/FilterComponent/DynamicFilterComponent'
import DownArrow from 'src/@core/CustomComponent/DownArrow/DownArrow'
import EditFeeDetailDialog from './Dialog/EditFeeDetailDialog'
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { SettingsContext } from 'src/@core/context/settingsContext'

// type ManageRequestType = {
//   handleRoleDialog: (a: boolean) => void
//   openRoleDialog: boolean
// }

interface StatusObj {
  title: string
  color: ThemeColor
}
interface StatusObj1 {
  title: string
  color: string
}

//Table data for enquirer
//Rows and column of data grid with status obj and click event
const enquirerStatusObj: any = {
  Open: { title: 'Open', color: 'success' },
  Closed: { title: 'Close', color: 'error' },
  Completed: { title: 'Completed', color: 'success' },
  Approved: { title: 'Approved', color: 'success' },
  Passed: { title: 'Passed', color: 'success' },
  Failed: { title: 'Failed', color: 'error' },
  Admitted: { title: 'Open', color: 'success' }
}

console.log('enquirerStatusObj', enquirerStatusObj)
// Function to format date to dd-MM-yyyy

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth is zero-based
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

// table for Enquirer Dialog box Table
const enquirerColumns: GridColDef[] = [
  {
    field: 'enquiry_date',
    headerName: 'Enquiry Date',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150,
    valueFormatter: params => formatDate(params.value as string),
    flex: 1
  },
  {
    field: 'enquiry_number',
    headerName: 'Enquiry Number',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150,
    flex: 1
  },
  {
    field: 'academicYear',
    headerName: 'Academic Year',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150,
    flex: 1
  },
  {
    field: 'enquiry_for',
    headerName: 'Enquiry For',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150,
    flex: 1
  },

  {
    field: 'school_name',
    headerName: 'School Location',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150,
    flex: 1
  },
  {
    field: 'student_name',
    headerName: 'Student Name',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150,
    flex: 1
  },
  {
    field: 'stage_name',
    headerName: 'Stage',
    align: 'center',
    headerAlign: 'center',
    minWidth: 100,
    flex: 1
  },
  {
    flex: 1,
    minWidth: 150,
    field: 'stage_status',
    headerName: 'Status',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams) => {
      const status = enquirerStatusObj[params.row.stage_status]
      console.log(status)

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

// table for Transfer Dialog box Table
const transferColumns: GridColDef[] = [
  {
    flex: 1,
    field: 'enqDate',
    headerName: 'Enquiry Date',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150,
    valueFormatter: params => formatDate(params.value as string)
  },
  {
    flex: 1,
    field: 'enqNumber',
    headerName: 'Enquiry Number',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150
  },
  {
    flex: 1,
    field: 'enqFor',
    headerName: 'Enquiry For',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150
  },
  {
    flex: 1,
    field: 'studentName',
    headerName: 'Student Name',
    align: 'center',
    headerAlign: 'center',
    minWidth: 200
  },
  {
    flex: 1,
    field: 'stage',
    headerName: 'Stage',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150
  },
  {
    flex: 1,
    minWidth: 100,
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
const transferRows = [
  {
    id: 1,
    enqDate: '01/05/2024',
    enqNumber: 'ENADMS#4402',
    enqFor: 'New Admission',
    studentName: 'Khevna Shah',
    stage: 'Enquiry',
    status: 1
  },
  {
    id: 2,
    enqDate: '04/30/2024',
    enqNumber: 'ENADMS#4401',
    enqFor: 'New Admission',
    studentName: 'Khevna Shah',
    stage: 'Enquiry',
    status: 2
  },
  {
    id: 3,
    enqDate: '04/20/2024',
    enqNumber: 'ENADMS#4400',
    enqFor: 'New Admission',
    studentName: 'Khevna Shah',
    stage: 'Enquiry',
    status: 1
  }
]

function Pagination(props: any) {
  const { page, onPageChange, className } = props
  const apiRef = useGridApiContext()
  const rowCount = useGridSelector(apiRef, gridRowCountSelector)
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector) // Get the page size
  const pageCounts = Math.ceil(rowCount / pageSize)

  return (
    <MuiPagination
      color='primary'
      className={className}
      count={pageCounts}
      page={page + 1}
      shape='rounded'
      onChange={(event, newPage) => {
        onPageChange(event, newPage - 1)
      }}
    />
  )
}

function CustomPagination(props: any) {
  return <GridPagination ActionsComponent={Pagination} {...props} />
}

type filterOptionTypes = {
  // Define properties for the type
  name?: number
  operation?: string
  value?: string
  // Add other properties as needed
}

function EnquiryListing() {
  const router = useRouter()
  // const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [isHighlighted, setIsHighlighted] = useState<string>('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [columnPositions, setColumnPositions] = useState<{ [key: string]: { top: number; left: number } }>({})
  const apiRef = useGridApiRef() // Initialize the apiRef
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState<number>(0)
  const [searchText, setSearchText] = useState('')
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()
  const debouncedSearchTerm = useDebounce(searchText, 700)
  const [refresh, setRefresh] = useState(false)
  const [totalRows, setTotalRows] = useState<any>(0)
  const [totalPages, setTotalPages] = useState(1)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [filterOptions, setfilterOptions] = useState<any>([])
  const [academicYears, setacademicYears] = useState<any[]>([])
  const [schoolTourDialog, setSchoolTourDialog] = useState<boolean>(false)
  const [followUpDialog, setFollowUpDialog] = useState<boolean>(false)
  const [minimized, setMinimized] = useState(false)
  const [minimizedFollow, setMinimizedFollow] = useState(false)
  const [actionEnquiryId, setActionEnquiryId] = useState<any>(null)
  const [filteredColumns, setFilteredColumns] = useState<any>([])
  const [dataGridsCols, setDataGridCols] = useState<any>([])
  const [dataGridsColsMain, setDataGridColsMain] = useState<any>([])
  const [academicYearTabs, setAcademicYearTabs] = useState([])
  const [filterValue, setFilterValue] = useState<any>('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [filterCount, setFilterCount] = useState<any>(0)
  const [year, setYear] = useState<any>('')
  const [yearShortCode, setyearShortCode] = useState<any>('')
  const { settings } = useContext(SettingsContext)

  const [actionAcademicYear, setActionAcademicYear] = useState<any>(null)
  const [userPermisionData, setuserPermisionData] = useState<any>(null)
  const handleApplyFilterUrl = (filters: any) => {
    // const queryString = encodeURIComponent(JSON.stringify(filters))
    // const url = `?filters=${queryString}`

    sessionStorage.setItem('filters', JSON.stringify(filters))

    console.log('filters?.length+1', filters?.length + 1)
    //setFilterCount(filters?.length+1)

    setfilterOptions(filters)

    // router.push(`/enquiries${url}`)
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('filters')
    const filters = saved ? JSON.parse(saved) : []
    //setFilterCount(filters?.length + 1)
    setfilterOptions(filters)
    // apply these filters to your table or form
  }, [])

  const handleSchoolTourDialogClose = () => {
    setSchoolTourDialog(false)
  }
  const handleFollowUpDialogClose = () => {
    setFollowUpDialog(false)
  }
  useEffect(() => {
    const userInfo = getLocalStorageVal('userInfo')
    const userInfoDetails = userInfo ? JSON.parse(userInfo) : {}
    const userPermissions = userInfoDetails?.permissions
    setuserPermisionData(userPermissions)

    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  const userInfoDetailsJson = getLocalStorageVal('userInfo')
  const userInfoDetails = userInfoDetailsJson ? JSON.parse(userInfoDetailsJson) : {}

  const userDetailsJson = getLocalStorageVal('userDetails')
  const userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : {}

  // console.log(screenWidth, 'screenWidth')

  //Sticky column
  const getHeaderClassName = (field: string): string | undefined => {
    if (selectedOptions.includes(field)) {
      return `Custom-Column-Sticky`
    }

    return undefined // No class name if condition is not met
  }

  // const getCellClassName = (params: string) => {
  //   console.log(params, 'Params from row')
  //   if (selectedOptions.includes(params)) {
  //     return `Custom-Column-Sticky`
  //   }

  //   return undefined // No class name if condition is not met
  // }

  function getCellClassName(headerName: string): string {
    // console.log(headerName, 'headerName from row')
    if (selectedOptions.includes(headerName)) {
      return `Custom-Column-Sticky`
    } else {
      return ''
    }
  }

  //Rows and column of data grid with status obj and click event
  const statusObj: StatusObj[] = [
    { title: 'Open', color: 'success' },
    { title: 'Closed', color: 'error' },
    { title: 'Admitted', color: 'success' }
  ]
  const priorityObj: StatusObj1[] = [
    { title: 'Hot', color: '#3F41D1' },
    { title: 'Warm', color: '#FF9500' },
    { title: 'Cold', color: '#E6393E' }
  ]

  const handleView = (params: GridRenderCellParams) => {
    console.log(params, 'view')
    router.push('/enquiries/view/' + params?.row?.id)
  }

  const handleFollowUp = (params: GridRenderCellParams) => {
    console.log(params, 'Follow Up')
    setActionEnquiryId(params?.row?.id)
    setActionAcademicYear(params?.row?.academicYear)

    setFollowUpDialog(true)

    // console.log(params?.row?.id)
    // router.push('/enquiries/view/' + params?.row?.id + '?dialog=followUp')

    // router.push('/enquiry-listing/enquiries?dialog=followUp')
  }
  const handleSchoolVisit = (params: GridRenderCellParams) => {
    setActionEnquiryId(params?.row?.id)

    setSchoolTourDialog(true)
    // console.log(params, 'SChool Visit')
    // console.log(params?.row?.id)
    // router.push('/enquiries/view/' + params?.row?.id + '?dialog=schoolVisit')

    // router.push('/enquiry-listing/enquiries?dialog=schoolVisit')
  }

  const handleRegistration = (params: GridRenderCellParams) => {
    console.log(params, 'Registration')
    router.push('/enquiries/registration/' + params?.row?.id)
  }

  const fetchData = useCallback(async (page: number, pageSize: number, filterData?: any) => {
    setGlobalState({
      isLoading: true
    })
    try {
      const apiRequest = {
        url: `marketing/enquiry/cc/list?page=${page}&size=${pageSize}`,
        serviceURL: 'marketing',
        data: { filters: filterData }
      }
      const response: any = await postRequest(apiRequest)
      if (response?.status) {
        const data: any = response?.data
        const meta: any = response?.meta

        const rowsWithSerialNumber = response?.data?.content?.map((row: any, index: any) => ({
          ...row,
          serialNumber: calculateSerialNumber(index, page, pageSize)
        }))
        setEnquiryListing(rowsWithSerialNumber)
        // if (!academicYears?.length) {
        //   setacademicYears(data?.academicYears)
        //   if (data?.academicYears && data?.academicYears?.length) {
        //     setYear(data?.academicYears[0])
        //   }
        // }
        setTotalRows(data?.pagination?.total_count) // Set total rows from API response
        setTotalPages(Math.ceil(data?.pagination?.total_count / pageSize)) // Calculate total pages
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setGlobalState({ isLoading: false }) // Stop loading
    }
  }, [])

  useEffect(() => {
    const modifyPayload = filterOptions?.map((val: any) => {
      return {
        column: val?.name,
        operation: val?.operation,
        search: val?.value
      }
    })
    console.log('filterOptions>', modifyPayload, filterOptions)
    if (year !== '') {
      fetchData(paginationModel?.page + 1, paginationModel.pageSize, [...modifyPayload])
    }
  }, [fetchData, paginationModel, filterOptions])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiRequest = {
          url: `/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1&sort[0]=id:asc`,
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }
        const response = await getRequest(apiRequest)
        if (response?.data && response?.data?.length) {
          setacademicYears(response.data)
          
          // NEW: Create multiSelectTabs data from API response
          const tabsData = response.data.map((item:any) => ({
            name: item?.attributes?.name,
            value: item?.attributes?.name
          }))
          setAcademicYearTabs(tabsData)
          
          const currentYear = getCurrentYearObject(response?.data)
          if (currentYear && currentYear?.length) {
            setYear(currentYear[0]?.attributes?.name)
            setyearShortCode(currentYear[0]?.attributes?.short_name_two_digit)
          } else {
            setYear(response?.data[0]?.attributes?.name)
            setyearShortCode(response?.data[0]?.attributes?.short_name_two_digit)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
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
    //       console.log(response?.data?.userInfo)
    //       fetchEmployeesList(response?.data)
    //     }
    //   } catch (error) {
    //     console.error('Error fetching data:', error)
    //   }
    // }

    // const fetchEmployeesList = async (userDetails: any) => {
    //   try {
    //     // const apiRequest = {
    //     //   url: `/api/hr-employee-masters?[$or][Base_Location][Base_Location][parent_1_id][$eq]=1012&[$or][Base_Location][Base_Sub_Location][segment_id][$eq]=${userDetails.lobs}`,
    //     //   serviceURL: 'mdm',
    //     //   headers: {
    //     //     Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
    //     //   }
    //     // }
    //     // const response: any = await getRequest(apiRequest)
    //     const apiRequest = {
    //       url: 'marketing/enquiry/reassign',
    //       data: {
    //         "school_code": userDetails?.schoolCode,
    //         "hris_code": userDetails?.hrisCodes?.length ? userDetails?.hrisCodes[0] : null
    //       }
    //     }

    //     const response: any = await postRequest(apiRequest)
    //     const filteredData = response?.data.filter((item: any) => item.attributes?.Official_Email_ID != userDetails?.userInfo?.email)

    //     // Handle the response here, e.g., set the state with the data

    //     setEmployeesList(filteredData)
    //   } catch (error) {
    //     console.error('Error fetching data:', error)
    //   }
    // }
    
    fetchData()

    //fetchUsersData()
  }, [])

  useEffect(() => {
    const searchRequest = async () => {
      setGlobalState({
        isLoading: true
      })
      try {
        const apiRequest = {
          url: `marketing/enquiry/list/global-search`,
          serviceURL: 'marketing',
          params: { page: page + 1, size: pageSize, search: debouncedSearchTerm }
        }
        const response: any = await getRequest(apiRequest)
        if (response?.status) {
          const data: any = response?.data
          const meta: any = response?.meta

          const rowsWithSerialNumber = response?.data?.content?.map((row: any, index: any) => ({
            ...row,
            serialNumber: calculateSerialNumber(index, page, pageSize)
          }))
          setEnquiryListing(rowsWithSerialNumber)
          // setacademicYears(data?.academicYears)
          setTotalRows(data?.pagination?.total_count) // Set total rows from API response
          setTotalPages(Math.ceil(data?.pagination?.total_count / pageSize)) // Calculate total pages
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setGlobalState({ isLoading: false }) // Stop loading
      }
    }
    if (debouncedSearchTerm && debouncedSearchTerm.length > 3) {
      searchRequest()
    }
  }, [debouncedSearchTerm])

  const columns: any = [
    {
      flex: 1,
      minWidth: 250,
      field: 'enquiryDate',
      headerName: 'Enquiry Date',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('enquiryDate'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 180,
      field: 'enquirer',
      headerName: 'Enquirer Name',
      headerClassName: getHeaderClassName('enquirer'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      },
      renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleEnquirerDialog(params)}>
            {params.value}
          </div>
        )
      }
    },
    {
      flex: 1,
      minWidth: 180,
      field: 'enquiry_number',
      headerName: 'Enquiry Number',
      headerClassName: getHeaderClassName('enquiry_number'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 180,
      field: 'academicYear',
      headerName: 'Academic Year',
      headerClassName: getHeaderClassName('academicYear'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 190,
      field: 'leadOwner',
      headerName: 'Lead Owner',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('leadOwner'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 190,
      field: 'isNewLead',
      headerName: 'New Lead',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('leadOwner'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 190,
      field: 'enquirySource',
      headerName: 'Enquiry Source',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('enquirySource'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 190,
      field: 'mobileNumber',
      headerName: 'Mobile Number',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('mobileNumber'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 170,
      field: 'studentName',
      headerName: 'Student Name',
      headerClassName: getHeaderClassName('studentName'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      },
      renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleStudentDetails(params)}>
            {params.value}
          </div>
        )
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'enquiryFor',
      headerName: 'Enquiry For',
      headerClassName: getHeaderClassName('enquiryFor'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    // {
    //   flex: 1,
    //   minWidth: 170,
    //   field: 'admissionSubType',
    //   headerName: 'Admission Sub Type',
    //   headerClassName: getHeaderClassName('Admission Sub Type'),
    //   cellClassName: (params: GridCellParams): string => {
    //     const headerName = params.colDef.headerName || ''
    //     const className = getCellClassName(headerName)

    //     return className || ''
    //   }
    // },
    {
      flex: 1,
      minWidth: 150,
      field: 'school',
      headerName: 'School',
      headerClassName: getHeaderClassName('school'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 120,
      field: 'grade',
      headerName: 'Grade',
      headerClassName: getHeaderClassName('grade'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'board',
      headerName: 'Board/Batch',
      headerClassName: getHeaderClassName('board'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'stage',
      headerName: 'Stage',
      headerClassName: getHeaderClassName('stage'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'status',
      headerName: 'Status',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('status'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      },
      renderCell: (params: GridRenderCellParams) => {
        const statusIndex = statusObj.findIndex((ele: any) => ele.title == params?.value)

        return (
          <CustomChip
            size='small'
            skin='light'
            color={statusObj[statusIndex]?.color}
            label={params?.value}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'priority',
      headerName: 'Priority',
      headerClassName: getHeaderClassName('priority'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      },
      renderCell: (params: GridRenderCellParams) => {
        const statusIndex = priorityObj.findIndex((ele: any) => ele.title == params?.value)

        // console.log(status, 'status')

        return (
          <Typography sx={{ lineHeight: '20px' }} variant='body2' color={priorityObj[statusIndex]?.color}>
            {params?.value}
          </Typography>
        )
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'nextAction',
      headerName: 'Next Action',
      headerClassName: getHeaderClassName('nextAction'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'nextFollowUpDate',
      headerName: 'Follow-up Date',
      headerClassName: getHeaderClassName('actionDate'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 160,
      field: 'action',
      headerName: 'Action',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('Action'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      },
      renderCell: (params: GridRenderCellParams) => {
        return (
          <>
            <Can pagePermission={[PERMISSIONS?.ENQUIRY_ACTION]} action={'HIDE'}>
              <Can pagePermission={[PERMISSIONS?.FOLLOWUP]} action={'HIDE'}>
                <Tooltip title='Follow Up'>
                  <IconButton
                    disableFocusRipple
                    disableRipple
                    disabled={params?.row?.status === 'Closed'}
                    onClick={() => handleFollowUp(params)}
                  >
                    {/* <EditIcon /> */}
                    <span className='icon-Followup-2-1'></span>
                  </IconButton>
                </Tooltip>
              </Can>
              <Can pagePermission={[PERMISSIONS?.ENQUIRY_VIEW]} action={'HIDE'}>
                <Tooltip title='View Details'>
                  <IconButton disableFocusRipple disableRipple onClick={() => handleView(params)}>
                    {/* <EditIcon /> */}
                    <span className='icon-eye'></span>
                  </IconButton>
                </Tooltip>
              </Can>
              <Can pagePermission={[PERMISSIONS?.SCHOOL_VISIT]} action={'HIDE'}>
                <Tooltip title='School Visit'>
                  <IconButton
                    disableFocusRipple
                    disableRipple
                    disabled={params?.row?.status === 'Closed'}
                    onClick={() => handleSchoolVisit(params)}
                  >
                    {/* <EditIcon /> */}
                    <span className='icon-School_building-1'></span>
                  </IconButton>
                </Tooltip>
              </Can>
              <Can pagePermission={[PERMISSIONS?.REGISTRATION_PAGE]} action={'HIDE'}>
                <Tooltip title='Registration'>
                  <IconButton
                    disableFocusRipple
                    disableRipple
                    disabled={params?.row?.status === 'Closed'}
                    onClick={() => handleRegistration(params)}
                  >
                    {/* <EditIcon /> */}
                    <span className='icon-Registration-1'></span>
                  </IconButton>
                </Tooltip>
              </Can>
            </Can>
          </>
        )
      }
    },
    {
      flex: 1,
      minWidth: 250,
      field: 'createdAt',
      headerName: 'Created At',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('createdAt'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)
 
        return className || ''
      }
    }
  ].map(col => ({ ...col, sortable: false }))

  const [data, setEnquiryListing] = useState([])

  // const { setPagePaths } = useGlobalContext()
  const [filterOpen, setFilterOpen] = React.useState<any>(null)
  const [isSerachInput, setIsSerachInput] = useState(false)
  const [action, setAction] = useState('Select Action')
  const [selectedRows, setSelectedRows] = useState([])
  const [enquirerDialog, setEnquirerDialog] = React.useState<boolean>(false)
  const [rowData, setRowData] = useState()
  const [reassignDialog, setReassignDialog] = React.useState<boolean>(false)
  const [transferDialog, setTransferDialog] = React.useState<boolean>(false)
  // Nikhil
  const [reopenDialog, setReopenDialog] = React.useState<boolean>(false)
  const [reopenSuccessDialog, setReopenSuccessDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState<boolean>(false)
  const [transferSuccessDialog, setTransferSuccessDialog] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [gradeSearch, setGradeSearch] = useState<any>(null)
  const [boardSearch, setBoardSearch] = useState<any>(null)
  const [shiftSearch, setShiftSearch] = useState<any>(null)
  const [divisionSearch, setDivisionSearch] = useState<any>(null)
  const [enteredValue, setEnteredValue] = useState<any>(0)
  const [filterSelectedSentData, setFilterSelectedSentData] = useState<any>([])

  //handler for Enquirer dialog box
  const handleEnquirerDialog = (params: any) => {
    setRowData(params)
    setEnquirerDialog(true)
  }

  const handleEnquirerDialogClose = () => setEnquirerDialog(false)

  //Handler For Enquiries Page
  const handleStudentDetails = (params: any) => {
    setRowData(params)
    console.log(params?.row?.id)
    router.push('/enquiries/view/' + params?.row?.id)
  }

  //Handler For Reaasign Dialog

  const handleReassignDialogClose = () => {
    setAction('Select Action')
    setReassignDialog(false)
  }
  const handlerReassign = () => {
    setReassignDialog(false)
    setSuccessDialog(true)
  }
  const handleSuccessClose = () => {
    setAction('Select Action')
    setReassignDialog(false)
    setSuccessDialog(false)
  }

  //Handler For Transfer Dialog

  const handleTransferDialogClose = () => {
    setAction('Select Action')
    setTransferDialog(false)
  }

  const handlerTransfer = () => {
    setTransferDialog(false)
    setTransferSuccessDialog(true)
  }
  const handleTransferSuccessClose = () => {
    setAction('Select Action')
    setTransferDialog(false)
    setTransferSuccessDialog(false)
  }

  // Nikhil
  const handleReopenDialogClose = () => {
  setReopenDialog(false);
  setAction('Select Action'); // Reset dropdown
  };

  const handleReopenSuccessClose = () => {
    setReopenSuccessDialog(false);
  };

  const handleReopenConfirm = async () => {
    
    setGlobalState({ isLoading: true })

  const params = {
    url: 'marketing/enquiry/reopen',
    data: {
      enquiryIds: selectedRows // or whatever your selected enquiries are
    }
  }

  const response = await patchRequest(params)
  // alert(JSON.parse(response[1]))
  if (response?.status) {
    setReopenDialog(false)
    setAction('Select Action')
    setRefresh(!refresh)
    setApiResponseType({ status: true, message: 'Enquiries reopened successfully' })
  } else if (response?.error?.errorMessage) {
    setApiResponseType({ status: true, message: response.error.errorMessage })
  }
  setGlobalState({ isLoading: false })

  }

  //Handling Search Functionality
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchText('')
    setIsSerachInput(false)
  }

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    // handleRoleDialog(true)
    router.push('/enquiries/create')
  }

  //Handler For Search Bar
  const handleSearchBar = () => {
    setIsSerachInput(prev => !prev)
  }

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Enquiry Listing',
        path: '/enquiries'
      }
    ])
  }, [])

  useEffect(() => {
    if (debouncedSearchTerm == '') {
      const modifyPayload = filterOptions?.map((val: any) => {
        return {
          column: val?.name,
          operation: val?.operation,
          search: val?.value
        }
      })
      fetchData(page + 1, pageSize, [...modifyPayload])
      
    }
  }, [page, debouncedSearchTerm, refresh])

  //Handler For Filer Popover
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterOpen(event.currentTarget)
  }

  //Select Dropdown Handler
  const handleActionChange = (event: SelectChangeEvent) => {
    setAction(event.target.value as string)
  }

  useEffect(() => {
    if (action === 'Reassign') {
      setReassignDialog(true)
    } else if (action === 'Transfer') {
      setTransferDialog(true)
    }
    // Nikhil
    else if (action === 'Reopen') {
      setReopenDialog(true)
    }
  }, [action])

  //handler for checkbox in datagrid
  const handleSelectionChange = (newSelection: any) => {
    setSelectedRows(newSelection)
  }

  const applyFilter = (options: any[]) => {
    console.log(options)
    const filterOption: any[] = options
    setfilterOptions(filterOption)

    fetchData(1, paginationModel.pageSize, filterOption)
  }
  const applysetFilteredColumns = (options: any[]) => {
    console.log(options)
    setFilteredColumns([...options])
  }

  const clearAllFilters = (options: any[]) => {
    const filterOption: any[] = []
    setfilterOptions([])
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize })
    sessionStorage.removeItem('filters')

    // fetchData(1, paginationModel.pageSize, filterOption);
  }

  const handleDownload = async () => {
    setGlobalState({ isLoading: true })

    const modifyPayload = filterOptions?.map((val: any) => {
      return {
        column: val?.name,
        operation: val?.operation,
        search: val?.value
      }
    })

    const apiRequest = {
      url: `marketing/enquiry/cc/list?page=1&size=100000`,
      serviceURL: 'marketing',
      data: {
        filters: [
          ...(year !== ''
            ? [
                {
                  column: 'academicYear',
                  operation: 'equals',
                  search: year
                }
              ]
            : []),
          ...modifyPayload
        ]
      }
    }
    const response: any = await postRequest(apiRequest)
    if (response.status) {
      const fName = getNameWithDate('EnquiryList')
      generateExcelFromJson(response?.data?.content, fName)
    }
    setGlobalState({ isLoading: false })
  }

  useEffect(() => {
    if (filteredColumns && filteredColumns?.length > 0) {
      const dd = dataGridsColsMain.filter(
        (column: any) => filteredColumns.includes(column.headerName) || column.field === 'action'
      )
      setDataGridCols([...dd])
    } else {
      setDataGridCols(columns)
      setDataGridColsMain(columns)
    }
  }, [filteredColumns])

  console.log('dataGridsCols', dataGridsCols)

  const selectedFilterData = async (data: any) => {
    let serviceURL = null
    if (data === 'grade') {
      serviceURL = 'ac-grades'
    }
    if (data === 'board') {
      serviceURL = 'ac-boards'
    }
    if (data === 'school') {
      serviceURL = '/api/ac-schools/search-school'
    }
    if (data === 'shift') {
      serviceURL = 'ac-shifts'
    }
    if (data === 'division') {
      serviceURL = 'ac-divisions'
    }
    if (data == 'enquirySource') {
      serviceURL = 'ad-enquiry-sources'
    }
    if (data == 'status') {
      const coustomFilterList = [
        {
          id: 1,
          attributes: {
            name: 'Open'
          }
        },
        {
          id: 2,
          attributes: {
            name: 'Admitted'
          }
        },
        {
          id: 3,
          attributes: {
            name: 'Closed'
          }
        }
      ]
      setFilterValue(coustomFilterList)
    }
    if (data == 'stage') {
      const coustomFilterList = [
        {
          id: 1,
          attributes: {
            name: ENQUIRY_STAGES?.ENQUIRY
          }
        },
        {
          id: 1,
          attributes: {
            name: ENQUIRY_STAGES?.SCHOOL_VISIT
          }
        },
        {
          id: 1,
          attributes: {
            name: ENQUIRY_STAGES?.REGISTRATION_FEES
          }
        },
        {
          id: 1,
          attributes: {
            name: ENQUIRY_STAGES?.REGISTRATION
          }
        },
        {
          id: 1,
          attributes: {
            name: ENQUIRY_STAGES?.COMPETENCY_TEST
          }
        },
        {
          id: 1,
          attributes: {
            name: ENQUIRY_STAGES?.ADMISSION_STATUS
          }
        },
        {
          id: 1,
          attributes: {
            name: ENQUIRY_STAGES?.PAYMENT
          }
        },
        {
          id: 1,
          attributes: {
            name: ENQUIRY_STAGES?.ADMITTED_PROVISIONAL
          }
        }
      ]
      setFilterValue(coustomFilterList)
    }
    if (data == 'isNewLead') {
      const coustomFilterList = [
        {
          id: true,
          attributes: {
            name: 'True'
          }
        },
        {
          id: false,
          attributes: {
            name: 'False'
          }
        }
      ]
      setFilterValue(coustomFilterList)
    }

    try {
      if (serviceURL) {
        if (data == 'school') {
          setGlobalState({ isLoading: true })
          const params = {
            url: serviceURL,
            serviceURL: 'mdm',
            data: { operator: `academic_year_id = ${yearShortCode}` }
          }

          const response = await postRequest(params)
          const opData = setOptionsFromResponse(response?.data?.schools, {
            id: 'school_id',
            name: 'name',
            key: 'school'
          })

          const schoolList = opData.map((val: any) => ({
            id: val.id,
            attributes: { name: val.name }
          })).sort((a: any, b: any) => a.attributes.name.localeCompare(b.attributes.name))

          setFilterValue(schoolList)
          setGlobalState({ isLoading: false })
        } else {
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
            if (data === 'enquirySource') {
              ;(response?.data).map((values: any, key: number) => {
                values.attributes.name = values.attributes.source
              })
            }
            setFilterValue(response?.data)
          } else {
            console.log('error', response)
          }
        }
      } else {
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const toggleDrawer = (open: boolean) => (event: any) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setIsDrawerOpen(open)
  }

  const filterSectionData = [
    {
      name: 'Enquiry Date',
      value: 'enquiryDate',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Within',
          value: 'isWithin'
        }
      ]
    },
    {
      name: 'Enquirer Name',
      value: 'enquirer',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Contains',
          value: 'contains'
        },
        { name: 'StartsWith', value: 'startsWith' },
        { name: 'EndsWith', value: 'endsWith' },
        {
          name: 'IsEmpty',
          value: 'isEmpty'
        }
      ]
    },
    {
      name: 'Enquiry Number',
      value: 'enquiry_number',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Contains',
          value: 'contains'
        }
      ]
    },
    {
      name: 'Academic Year',
      value: 'academicYear',
      operators: [
        {
          name: 'Multi-Select',
          value: 'multiSelect'
        }
      ],
      multiSelectTabs: academicYearTabs
    },
    {
      name: 'Lead Owner',
      value: 'leadOwner',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Contains',
          value: 'contains'
        }
      ]
    },
    {
      name: 'New Lead',
      value: 'isNewLead',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    },
    {
      name: 'Enquiry Source',
      value: 'enquirySource',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Contains',
          value: 'contains'
        }
      ]
    },
    {
      name: 'Mobile Number',
      value: 'mobileNumber',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Contains',
          value: 'contains'
        },
        { name: 'StartsWith', value: 'startsWith' },
        { name: 'EndsWith', value: 'endsWith' },
        {
          name: 'IsEmpty',
          value: 'isEmpty'
        }
      ]
    },
    {
      name: 'Student Name',
      value: 'studentName',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Contains',
          value: 'contains'
        },
        { name: 'StartsWith', value: 'startsWith' },
        { name: 'EndsWith', value: 'endsWith' },
        {
          name: 'IsEmpty',
          value: 'isEmpty'
        }
      ]
    },
    {
      name: 'Enquiry For',
      value: 'enquiryFor',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Contains',
          value: 'contains'
        },
        { name: 'StartsWith', value: 'startsWith' },
        { name: 'EndsWith', value: 'endsWith' },
        {
          name: 'IsEmpty',
          value: 'isEmpty'
        }
      ]
    },
    {
      name: 'School',
      value: 'school',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    },
    {
      name: 'Board/Batch',
      value: 'board',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    },
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
      name: 'Stage',
      value: 'stage',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    },
    {
      name: 'Status',
      value: 'status',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        }
      ]
    },
    {
      name: 'Priority',
      value: 'priority',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Contains',
          value: 'contains'
        },
        { name: 'StartsWith', value: 'startsWith' },
        { name: 'EndsWith', value: 'endsWith' },
        {
          name: 'IsEmpty',
          value: 'isEmpty'
        }
      ]
    },
    // {
    //   name: 'Next Action',
    //   value: 'nextAction'
    // },

    {
      name: 'Follow-up Date',
      value: 'nextFollowUpDate',
      operators: [
        {
          name: 'Equals',
          value: 'equals'
        },
        {
          name: 'Within',
          value: 'isWithin'
        }
      ]
    }

    // {
    //   name: 'Academic Year',
    //   value: 'academicYear'
    // },

    // {
    //   name: 'Priority',
    //   value: 'priority'
    // },
  ]

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

  const checkMatch = (userPermissions: any, permissions: any) => {
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    let match = false
    const permissionsArr = Array.isArray(permissions) ? permissions : [permissions]
    if (permissionsArr.length === 0) {
      match = false
    } else {
      match = permissionsArr.some(p => userPermissions && userPermissions.includes(p))
    }

    return match
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <Box sx={{ background: '#fff', borderRadius: '10px', width: '100%', height: '100%' }}>
          <Grid container>
            <>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', mt: 3 }}>
                    {/* <Can pagePermission={[PERMISSIONS?.REGISTRATION_REASSIGN]} action={'HIDE'}> */}
                    <FormControl sx={{ ml: 0 }} fullWidth>
                      <InputLabel
                        disabled={selectedRows?.length > 0 ? false : true}
                        id='demo-simple-select-outlined-label'
                      >
                        Bulk Action
                      </InputLabel>

                      <Select
                        IconComponent={DownArrow}
                        label='Bulk Action'
                        value={action}
                        defaultValue={action}
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                        onChange={handleActionChange}
                        sx={{ height: '48px' }}
                        disabled={selectedRows?.length > 0 ? false : true}
                      >
                        <MenuItem value='Select Action'>Select Action</MenuItem>

                        {checkMatch(userPermisionData, ['registration_details_reassign']) ? (
                          <MenuItem value='Reassign'>Reassign</MenuItem>
                        ) : null}
                        {checkMatch(userPermisionData, ['registration_details_transfer']) ? (
                          <MenuItem value='Transfer'>Transfer</MenuItem>
                        ) : null}
                        
                        <MenuItem value='Reopen'>Re-open</MenuItem>
                      </Select>
                    </FormControl>
                    {/* </Can> */}
            
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
                    {/* <TextField
                  className='custom-textfield'
                  value={searhRole}
                  placeholder='Search Invoice'
                  onChange={e => setSearchRole(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <UserIcon icon='mdi:magnify' />
                      </InputAdornment>
                    )
                  }}
                /> */}
                    {/* <IconButton
                      disableFocusRipple
                      disableRipple
                      sx={{ mr: 2, background: "#F4F0EF'" }}
                      onClick={() => router.push(`/enquiries/student-onboarding/student`)}
                    >
                      <span className='icon-studentInfo'></span>
                    </IconButton> */}

                    {isSerachInput ? (
                      <Box sx={{ mr: 2 }}>
                        <SearchBox
                          placeHolderTitle='Search for Enquirer Name, Mobile Number,Student Name & Enquiry Number'
                          searchText={searchText}
                          handleClearSearch={handleClearSearch}
                          handleInputChange={handleInputChange}
                        />
                      </Box>
                    ) : null}
                    {!isSerachInput ? (
                      <Tooltip title='Search'>
                        <Fab
                          size='small'
                          sx={{
                            zIndex: 1,

                            mr: 3,
                            '@media (max-width: 910px)': {
                              ml: 3
                            }
                          }}
                          style={{ borderRadius: '100%' }}
                          onClick={handleSearchBar}
                        >
                          <span className='icon-search-normal-1'></span>
                        </Fab>
                      </Tooltip>
                    ) : null}

                    <Can pagePermission={[PERMISSIONS?.ENQUIRY_DOWNLOAD]} action={'HIDE'}>
                      <Tooltip title='Download'>
                        <Fab
                          disabled={!data?.length}
                          size='small'
                          sx={{
                            zIndex: 1,

                            mr: 3,
                            '@media (max-width: 910px)': {
                              ml: 3
                            }
                          }}
                          style={{ borderRadius: '100%' }}
                          onClick={handleDownload}
                        >
                          <span className='icon-import'></span>
                        </Fab>
                      </Tooltip>
                    </Can>
                    <Badge
                      color='error'
                      badgeContent={filterCount}
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
                    {/* <Can pagePermission={[PERMISSIONS?.EDIT_FEE_DETAILS]} action={'HIDE'}> */}
                      <Button
                        variant='contained'
                        color='inherit'
                        sx={{
                          mr: 3,
                          '@media (max-width: 910px)': {
                            ml: 3
                          }
                        }}
                        // startIcon={<EditDocumentIcon/>}
                        onClick={() => setDialogOpen(true)}
                      >
                        Edit Fee Detail
                      </Button>
                    {/* </Can> */}
                    {/* <FilterComponent
                      filterOpen={filterOpen}
                      setFilterOpen={setFilterOpen}
                      applyFilterOptions={applyFilter}
                      title='Filter'
                      academicYears={academicYears}
                      clearFilter={clearAllFilters}
                      setFilteredColumns={applysetFilteredColumns}
                      selectedFilterData={selectedFilterData}
                      filterValue={filterValue}
                    /> */}
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
                      isColumnSection={true}
                      columnSectionData={[]}
                      isStickyColumnSection={false}
                      stickyColumnSectionData={[]}
                      filterCount={setFilterCount}
                      setfilterOptionsProps={handleApplyFilterUrl}
                      setFilteredColumns={applysetFilteredColumns}
                      clearFilter={clearAllFilters}
                      setDisplayEarlierFilter={filterOptions}
                    />
                    <Can pagePermission={[PERMISSIONS?.CREATE_ENQUIRY]} action={'HIDE'}>
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={e => handleChange(e)}
                        sx={{ mr: -3 }}
                        disableFocusRipple
                        disableTouchRipple
                        startIcon={<span className='icon-add'></span>}
                      >
                        Create New Enquiry
                      </Button>
                    </Can>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: '25px' }}>
                {/* <TableFilter /> */}
                {/* <CardHeader title='Quick Filter' /> */}

                {dataGridsCols ? (
                  <DataGrid
                    className={'dataGridList'}
                    checkboxSelection
                    autoHeight
                    columns={dataGridsCols} // Define your columns
                    rows={data} // Use the rows state
                    pagination
                    pageSizeOptions={[10, 25, 50, 100]}
                    paginationMode='server'
                    paginationModel={paginationModel}
                    onPaginationModelChange={newModel => setPaginationModel(newModel)}
                    rowCount={totalRows} // Total number of rows
                    slots={{ pagination: CustomPagination }}
                    disableRowSelectionOnClick
                    sx={{ boxShadow: 0, p: 0 }}
                    getRowId={(row: any) => row?.id}
                    onRowSelectionModelChange={handleSelectionChange}
                    disableColumnFilter
                  />
                ) : null}
              </Grid>
            </>
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

      {enquirerDialog && (
        <EnquirerDialog
          openModal={enquirerDialog}
          closeModal={handleEnquirerDialogClose}
          header='Enquirer Details'
          enquirerColumns={enquirerColumns}
          rowData={rowData}
        />
      )}
      {reassignDialog && (
        <ReassignEnquiriesDialog
          openModal={reassignDialog}
          closeModal={handleReassignDialogClose}
          header='Reassign'
          enquirerColumns={enquirerColumns}
          handleReassignClose={handlerReassign}
          enquiryId={null}
          enquiryIds={selectedRows}
          mode={'listing'}
          setRefresh={setRefresh}
          refresh={refresh}
        />
      )}
      {successDialog && (
        <SuccessDialog openDialog={successDialog} title='Enquiries reassigned' handleClose={handleSuccessClose} />
      )}
      {transferDialog && (
        <TransferEnquiriesDialog
          openModal={transferDialog}
          closeModal={handleTransferDialogClose}
          header='Transfer'
          handleReassignClose={handlerTransfer}
          transferColumns={enquirerColumns}
          enquiryIds={selectedRows}
          mode={'listing'}
          refresh={refresh}
          setRefresh={setRefresh}
          year={getObjectByKeyValNew(academicYears, 'attributes.name', year)?.attributes?.short_name_two_digit}
        />
      )}
      {transferSuccessDialog && (
        <SuccessDialog
          openDialog={transferSuccessDialog}
          title='Enquiries transfered'
          handleClose={handleTransferSuccessClose}
        />
      )}
      
    {reopenDialog && (
    <ReopenDialog
      openDialog={reopenDialog}
      handleClose={handleReopenDialogClose}
      handleConfirm={handleReopenConfirm}
      enquiryIds={selectedRows}
    />
    )}

    {reopenSuccessDialog && (
    <SuccessDialog
      openDialog={reopenSuccessDialog}
      title='Enquiries reopened'
      handleClose={handleReopenSuccessClose}
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
          enquiryId={actionEnquiryId}
          mode='list'
        />
      )}
      {followUpDialog && (
        <FollowUpDialog
          openDialog={followUpDialog}
          title='Follow Up Details'
          handleClose={handleFollowUpDialogClose}
          minimized={minimizedFollow}
          setMinimized={setMinimizedFollow}
          enquiryId={actionEnquiryId}
          setFollowUpDialog={setFollowUpDialog}
          mode='list'
          academic_year={
            getObjectByKeyValNew(academicYears, 'attributes.name', actionAcademicYear)?.attributes?.short_name_two_digit
          }
        />
      )}
      <EditFeeDetailDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
      <ReactHotToast>
        <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
      </ReactHotToast>
    </>
  )
}

export default EnquiryListing
