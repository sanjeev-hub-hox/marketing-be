'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { Box, display } from '@mui/system'

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
import { gridPageCountSelector, GridPagination, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'
import { ThemeColor } from 'src/@core/layouts/types'
import { useRouter } from 'next/navigation'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SearchBox from 'src/@core/CustomComponent/CustomSearchBox/SearchBox'
import FilterComponent from '../Enquiry-Listing/FilterComponent'
import CalenderDialog from './Dialog/CalenderDialog'
import TaskDialog from './Dialog/TaskDialog'
import NotificationDialog from './Dialog/NotificationDialog'
import { getRequest, postRequest } from 'src/services/apiService'
import {
  calculateSerialNumber,
  generateExcelFromJson,
  formatTimeNew,
  getLocalStorageVal,
  getCurrentYearObject,
  getObjectByKeyValNew,
  setOptionsFromResponse,
  getNameWithDate
} from 'src/utils/helper'
import useDebounce from 'src/utils/useDebounce'
import { gridRowCountSelector, gridPageSizeSelector } from '@mui/x-data-grid'
import SchoolTourDialog from '../Enquiry-Listing/Dialog/SchoolTourDialog'
import FollowUpDialog from '../Enquiry-Listing/Dialog/FollowUpDialog'
import ReassignEnquiriesDialog from '../Enquiry-Listing//Dialog/ReassignEnquiriesDialog'
import TransferEnquiriesDialog from '../Enquiry-Listing//Dialog/TransferEnquiriesDialog'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { ENQUIRY_STAGES, PERMISSIONS } from 'src/utils/constants'
import { Can } from 'src/components/Can'
import DynamicFilterComponent from 'src/@core/CustomComponent/FilterComponent/DynamicFilterComponent'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'

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

// Function to format date to dd-MM-yyyy

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth is zero-based
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

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
  name: number
  operation: string
  value: string
  // Add other properties as needed
}

function AdmissionListing() {
  const router = useRouter()
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [isHighlighted, setIsHighlighted] = useState<string>('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [columnPositions, setColumnPositions] = useState<{ [key: string]: { top: number; left: number } }>({})
  const apiRef = useGridApiRef() // Initialize the apiRef
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [totalRows, setTotalRows] = useState<any>(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filterOptions, setfilterOptions] = useState<filterOptionTypes[]>([])
  const [academicYears, setacademicYears] = useState<string[]>([])
  const [searchText, setSearchText] = useState('')
  const debouncedSearchTerm = useDebounce(searchText, 700)
  const [refresh, setRefresh] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState<number>(0)
  const [schoolTourDialog, setSchoolTourDialog] = useState<boolean>(false)
  const [followUpDialog, setFollowUpDialog] = useState<boolean>(false)
  const [minimized, setMinimized] = useState(false)
  const [minimizedFollow, setMinimizedFollow] = useState(false)
  const [actionEnquiryId, setActionEnquiryId] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [filterCount, setFilterCount] = useState<any>(0)
  const [filterValue, setFilterValue] = useState<any>('')
  const [gradeSearch, setGradeSearch] = useState<any>(null)
  const [boardSearch, setBoardSearch] = useState<any>(null)
  const [shiftSearch, setShiftSearch] = useState<any>(null)
  const [divisionSearch, setDivisionSearch] = useState<any>(null)
  const [enteredValue, setEnteredValue] = useState<any>(0)
  const [filterSelectedSentData, setFilterSelectedSentData] = useState<any>([])
  const [dataGridsColsMain, setDataGridColsMain] = useState<any>([])
  const [employeesList, setEmployeesList] = useState<any>([])
  const [pushData, setPushData] = useState<boolean>(false)
  const [year, setYear] = useState<any>('')
  const [yearShortCode, setyearShortCode] = useState<any>('')
  const [actionAcademicYear, setActionAcademicYear] = useState<any>(null)
  const [userPermisionData, setuserPermisionData] = useState<any>(null)
  const [academicYearTabs, setAcademicYearTabs] = useState([])

  const handleApplyFilterUrl = (filters: any) => {
   
    sessionStorage.setItem("admissionFilters", JSON.stringify(filters));
    setfilterOptions(filters)

  }



  useEffect(() => {
   
    const saved = sessionStorage.getItem("admissionFilters");
    const filters = saved ? JSON.parse(saved) : [];
    setfilterOptions(filters)
  }, [])


  const handleSchoolTourDialogClose = () => {
    setSchoolTourDialog(false)
    router.refresh()
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

  // useEffect(() => {
  //   fetchData(page + 1, pageSize)
  // }, [page, refresh])

  useEffect(() => {
    if (debouncedSearchTerm == '') {
      const modifyPayload = filterOptions?.map((val: any) => {
        return {
          column: val?.name,
          operation: val?.operation,
          search: val?.value
        }
      })
        fetchData(page + 1, pageSize, [ ...modifyPayload])
    } else if (debouncedSearchTerm && debouncedSearchTerm.length > 3) {
      getSearchData()
    }
  }, [page, debouncedSearchTerm, refresh ])

  // console.log(screenWidth, 'screenWidth')

  //Sticky column
  const getHeaderClassName = (field: string): string | undefined => {
    if (selectedOptions.includes(field)) {
      return `Custom-Column-Sticky`
    }

    return undefined // No class name if condition is not met
  }

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
  const statusObj1: StatusObj1[] = [
    { title: 'Hot', color: '#3F41D1' },
    { title: 'Warm', color: '#FF9500' },
    { title: 'Cold', color: '#E6393E' }
  ]

  //Handler for action button
  const handleView = (params: GridRenderCellParams) => {
    console.log(params, 'view')
    // router.push('/enquiry-listing/enquiries')
    router.push('/enquiries/registration/' + params?.row?.id)
  }
  const handleFollowUp = (params: GridRenderCellParams) => {
    setActionEnquiryId(params?.row?.id)
    setActionAcademicYear(params?.row?.academicYear)
    setFollowUpDialog(true)
  }
  const handleSchoolVisit = (params: GridRenderCellParams) => {
    setActionEnquiryId(params?.row?.id)
    setSchoolTourDialog(true)
  }
  const handleRegistration = (params: GridRenderCellParams) => {
    console.log(params, 'Registration')
    router.push('/registraion-listing/registered-student')
  }

  const fetchData = useCallback(async (page: number, pageSize: number, filterData?: any) => {
    setGlobalState({
      isLoading: true
    })
    try {
      const apiRequest = {
        url: `marketing/enquiry-registration/list?page=${page}&size=${pageSize}`,
        serviceURL: 'marketing',
        data: { ...(filterData && filterData?.length && { filters: filterData }) }
      }
      const response: any = await postRequest(apiRequest)
      if (response.status) {
        const data: any = response?.data
        const meta: any = response?.meta

        const rowsWithSerialNumber = response?.data?.content?.map((row: any, index: any) => ({
          ...row,
          serialNumber: calculateSerialNumber(index, page, pageSize)
        }))
        setAdmissionList(rowsWithSerialNumber)
        // if (!academicYears?.length) {
        //   setacademicYears(data?.academicYears)
        //   if (data?.academicYears && data?.academicYears?.length) {
        //     setYear(data?.academicYears[1])
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

  const getSearchData = async () => {
    setGlobalState({
      isLoading: true
    })
    try {
      const apiRequest = {
        url: `marketing/enquiry-registration/list/global-search`,
        serviceURL: 'marketing',
        params: {
          pageNumber: page + 1,
          pageSize: pageSize,
          search: debouncedSearchTerm
        }
      }
      const response: any = await getRequest(apiRequest)
      const data: any = response?.data
      const meta: any = response?.meta

      const rowsWithSerialNumber = response?.data?.content?.map((row: any, index: any) => ({
        ...row,
        serialNumber: calculateSerialNumber(index, page, pageSize)
      }))
      setAdmissionList(rowsWithSerialNumber)
      //setacademicYears(data?.academicYears)

      setTotalRows(data?.pagination?.total_count) // Set total rows from API response
      setTotalPages(Math.ceil(data?.pagination?.total_count / pageSize)) // Calculate total pages
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setGlobalState({ isLoading: false }) // Stop loading
    }
  }

  useEffect(() => {
    const modifyPayload = filterOptions?.map((val: any) => {
      return {
        column: val?.name,
        operation: val?.operation,
        search: val?.value
      }
    })
      fetchData(paginationModel?.page + 1, paginationModel.pageSize, [
        ...modifyPayload
      ])
  }, [fetchData, paginationModel, filterOptions])

  const handlePushData = async (enquiryId: any) => {
    const params = {
      url: `marketing/admission/${enquiryId}/submit-student-detail`
    }

    const response = await postRequest(params)
    if (response?.stage_status) {
      setPushData(true)
      setRefresh(!refresh)
    } else {
      setApiResponseType({ status: true, message: 'Something Went Wrong!' })
    }
  }

  const handlePushDataClose = () => {
    setPushData(false)
  }

  const columns: any = [
    {
      flex: 1,
      minWidth: 200,
      field: 'registrationDate',
      headerName: 'Registered Date',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('Enquiry Date'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
      // renderCell: (params: GridCellParams): string => {
      //   const dateStr: any = params.value

      //   return formatTimeNew(dateStr, 'Do MMM YY')
      // }
    },
    {
      flex: 1,
      minWidth: 160,
      field: 'enquirer',
      headerName: 'Enquirer Name',
      headerClassName: getHeaderClassName('Enquirer Name'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
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
      headerClassName: getHeaderClassName('Mobile Number'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'studentName',
      headerName: 'Student Name',
      headerClassName: getHeaderClassName('Student Name'),
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
      minWidth: 160,
      field: 'applicationFor',
      headerName: 'Application For',
      headerClassName: getHeaderClassName('Enquiry For'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    // {
    //   flex: 1,
    //   minWidth: 200,
    //   field: 'applicationSubType',
    //   headerName: 'Application Sub Type',
    //   headerClassName: getHeaderClassName('Admission Sub Type'),
    //   cellClassName: (params: GridCellParams): string => {
    //     const headerName = params.colDef.headerName || ''
    //     const className = getCellClassName(headerName)

    //     return className || ''
    //   }
    // },
    {
      flex: 1,
      minWidth: 180,
      field: 'school',
      headerName: 'School',
      headerClassName: getHeaderClassName('School'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'grade',
      headerName: 'Grade',
      headerClassName: getHeaderClassName('Grade'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 180,
      field: 'board',
      headerName: 'Board/Batch',
      headerClassName: getHeaderClassName('Board/Batch'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    // {
    //   flex: 1,
    //   minWidth: 130,
    //   field: 'nextAction',
    //   headerName: 'Next Action',
    //   headerClassName: getHeaderClassName('Next Action'),
    //   cellClassName: (params: GridCellParams): string => {
    //     const headerName = params.colDef.headerName || ''
    //     const className = getCellClassName(headerName)

    //     return className || ''
    //   },
    //   renderCell: (params: GridCellParams): string => {
    //     const dateStr: any = params.value

    //     return formatTimeNew(dateStr, 'Do MMM YY')
    //   }
    // },
    {
      flex: 1,
      minWidth: 150,
      field: 'nextFollowUpDate',
      headerName: 'Follow-up Date',
      headerClassName: getHeaderClassName('Action Date'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
      // renderCell: (params: GridCellParams): string => {
      //   const dateStr: any = params.value

      //   return formatTimeNew(dateStr, 'Do MMM YY')
      // }
    },
    {
      flex: 1,
      minWidth: 150,
      field: 'stage',
      headerName: 'Stage',
      headerClassName: getHeaderClassName('Stage'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      }
    },
    {
      flex: 1,
      minWidth: 180,
      field: 'status',
      headerName: 'Status',
      align: 'center',
      headerAlign: 'center',
      headerClassName: getHeaderClassName('Status'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      },
      renderCell: (params: GridRenderCellParams) => {
        const status = statusObj.find((ele: any) => {
          return ele.title == params.row.status
        })

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
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'priority',
      headerName: 'Priority',
      headerClassName: getHeaderClassName('Priority'),
      cellClassName: (params: GridCellParams): string => {
        const headerName = params.colDef.headerName || ''
        const className = getCellClassName(headerName)

        return className || ''
      },
      renderCell: (params: GridRenderCellParams) => {
        const status = statusObj1.find((element: any) => {
          return element.title == params.row.priority
        })
        console.log(status, 'status')

        return (
          <Typography sx={{ lineHeight: '20px' }} variant='body2' color={status?.color}>
            {status?.title}
          </Typography>
        )
      }
    },

    {
      flex: 1,
      minWidth: 210,
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
            <Can pagePermission={[PERMISSIONS?.REGISTRATION_LIST_FOLOWUP]} action={'HIDE'}>
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
            <Can pagePermission={[PERMISSIONS?.REGISTRATION_VIEW]} action={'HIDE'}>
              <Tooltip title='View Details'>
                <IconButton disableFocusRipple disableRipple onClick={() => handleView(params)}>
                  {/* <EditIcon /> */}
                  <span className='icon-eye'></span>
                </IconButton>
              </Tooltip>
            </Can>

            <Can pagePermission={[PERMISSIONS?.REGISTRATION_LIST_SCHOOL_VISIT]} action={'HIDE'}>
              <Tooltip title='School Visit'>
                <IconButton
                  disableFocusRipple
                  disabled={params?.row?.status === 'Closed'}
                  disableRipple
                  onClick={() => handleSchoolVisit(params)}
                >
                  {/* <EditIcon /> */}
                  <span className='icon-School_building-1'></span>
                </IconButton>
              </Tooltip>
            </Can>
            <Tooltip title='Push Student Data To Academics'>
              <IconButton disabled={params?.row?.status === 'Closed' || params?.row?.student_details_pushed}>
                <ArrowUpwardIcon
                  sx={
                    params?.row?.status === 'Closed' || params?.row?.student_details_pushed ? { color: '#E0E0E0' } : {}
                  }
                  onClick={() => {
                    handlePushData(params?.row?.id)
                  }}
                />
              </IconButton>
            </Tooltip>
          </>
        )
      }
    }
  ].map(col => ({ ...col, sortable: false }))
  const userDetailsJson = getLocalStorageVal('userDetails')
  const userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : {}

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
        const response: any = await getRequest(apiRequest)
        // Handle the response here, e.g., set the state with the data
        const allYears = response.data.map((element: any) => element.attributes.name)
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
    //     // // Handle the response here, e.g., set the state with the data

    //     // setEmployeesList(response.data)

    //     // const apiRequest = {
    //     //   url: 'marketing/enquiry/reassign',
    //     //   data: {
    //     //     "school_code": userDetails?.schoolCode,
    //     //     "hris_code": userDetails?.hrisCodes?.length ? userDetails?.hrisCodes[0] : null
    //     //   }
    //     // }

    //     // const response: any = await postRequest(apiRequest)
    //     // const filteredData = response?.data.filter((item: any) => item.attributes?.Official_Email_ID != userDetails?.userInfo?.email)

    //     // // Handle the response here, e.g., set the state with the data

    //     // setEmployeesList(filteredData)
    //   } catch (error) {
    //     console.error('Error fetching data:', error)
    //   }
    // }

    fetchData()

    //fetchUsersData()
  }, [])

  const [admissionList, setAdmissionList] = useState([])
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()
  const [filterOpen, setFilterOpen] = React.useState<any>(null)
  const [isSerachInput, setIsSerachInput] = useState(false)
  const [action, setAction] = useState('Select Action')
  const [selectedRows, setSelectedRows] = useState([])
  const [enquirerDialog, setEnquirerDialog] = React.useState<boolean>(false)
  const [rowData, setRowData] = useState()
  const [reassignDialog, setReassignDialog] = React.useState<boolean>(false)
  const [transferDialog, setTransferDialog] = React.useState<boolean>(false)
  const [successDialog, setSuccessDialog] = useState<boolean>(false)
  const [transferSuccessDialog, setTransferSuccessDialog] = useState<boolean>(false)
  const [calenderDialog, setCalenderDialog] = useState<boolean>(false)
  const [taskDialog, setTaskDialog] = useState<boolean>(false)
  const [notificationDialog, setNotificationDialog] = useState<boolean>(false)
  const [filteredColumns, setFilteredColumns] = useState<any>([])
  const [dataGridsCols, setDataGridCols] = useState<any>([])
  const enquirerStatusObj: any = {
    Open: { title: 'Open', color: 'success' },
    Closed: { title: 'Close', color: 'error' }
  }
  //handler for Enquirer dialog box
  const handleEnquirerDialog = (params: any) => {
    setRowData(params)
    setEnquirerDialog(true)
  }

  const handleEnquirerDialogClose = () => setEnquirerDialog(false)

  //Handler For Enquiries Page
  const handleStudentDetails = (params: any) => {
    setRowData(params)
    router.push('/enquiries/registration/' + params?.row?.id)
  }

  //Handler For Reaasign Dialog

  const handleReassignDialogClose = () => setReassignDialog(false)
  const handlerReassign = () => {
    setReassignDialog(false)
    setSuccessDialog(true)
  }
  const handleSuccessClose = () => {
    setSuccessDialog(false)
    router.refresh()
  }

  //Handler For Transfer Dialog

  const handleTransferDialogClose = () => setTransferDialog(false)
  const handlerTransfer = () => {
    setTransferDialog(false)
    setTransferSuccessDialog(true)
  }
  const handleTransferSuccessClose = () => {
    setTransferSuccessDialog(false)
  }

  //Handling Search Functionality
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchText('')
    setIsSerachInput(false)
  }

  //Handler For Search Bar
  const handleSearchBar = () => {
    setIsSerachInput(prev => !prev)
  }

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Registered Student Listing',
        path: '/registered-student-listing'
      }
    ])
  }, [])

  //Handler For Filer Popover
  const handleFilterClick = (event: any) => {
    //setFilterOpen(event.currentTarget)
    setIsDrawerOpen(true)
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
  }, [action])

  const handleYearChange = (event: SelectChangeEvent) => {
    const filterOpt = [{ column: 'academicYear', operation: 'equals', search: event.target.value }]
    fetchData(1, paginationModel.pageSize, filterOpt)
    setYear(event.target.value as string)
  }

  //handler for checkbox in datagrid
  const handleSelectionChange = (newSelection: any) => {
    setSelectedRows(newSelection)
  }

  //Handler for Calender Dialog
  const handleCloseCalenderDialog = () => {
    setCalenderDialog(false)
  }

  //Handler for Task Dialog
  const handleCloseTaskDialog = () => {
    setTaskDialog(false)
  }

  //Handler for Notification Dialog
  const handleCloseNotificationDialog = () => {
    setNotificationDialog(false)
  }

  const applyFilter = (options: any[]) => {
    console.log(options)
    const filterOption: any[] = options
    setfilterOptions(filterOption)

    fetchData(1, paginationModel.pageSize, filterOption)
  }

  const clearAllFilters = (options: any[]) => {
    const filterOption: any[] = []
    setfilterOptions([])
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize })
    sessionStorage.removeItem('admissionFilters')

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
      url: `marketing/enquiry-registration/list?page=1&size=50000`,
      serviceURL: 'marketing',
      data: { filters: [
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
      ] }
    }
    const response: any = await postRequest(apiRequest)
    if (response.status) {
      const fName = getNameWithDate('AdmissionList')
      generateExcelFromJson(response?.data?.content, fName)
    }
    setGlobalState({ isLoading: false })
  }

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

  const toggleDrawer = (open: boolean) => (event: any) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setIsDrawerOpen(open)
  }

  const filterSectionData = [
    {
      name: 'Registered Date',
      value: 'registrationDate',
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
      name: 'Application For',
      value: 'applicationFor',
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

    try {
      if (serviceURL) {
        if(data == 'school'){
          setGlobalState({isLoading:true})
          const params = {
            url: serviceURL,
            serviceURL: 'mdm',
            data: { operator:`academic_year_id = ${yearShortCode}` }
          }

          const response = await postRequest(params)
          const opData = setOptionsFromResponse(response?.data?.schools, {
            id: 'school_id',
            name: 'name',
            key:'school'
          })

          const schoolList = opData.map((val:any,indx:any)=>{
              return {
                id: val.id,
                attributes: {
                  name: val?.name
                }
              }
          })

          setFilterValue(schoolList)
          setGlobalState({isLoading:false})


        }else{
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
                {/* <div
                  style={{ display: 'flex', padding: '16px', justifyContent: 'space-between', alignItems: 'center' }}
                > */}
                <Box></Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', mt: 3 }}>
                    {/* <Box sx={{ mr: 2 }}>
                      <SearchBox
                        placeHolderTitle='Search enquiry list'
                        searchText={searchText}
                        handleClearSearch={handleClearSearch}
                        handleInputChange={handleInputChange}
                      />
                    </Box> */}
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
                        {checkMatch(userPermisionData,['registration_details_reassign']) ? <MenuItem value='Reassign'>Reassign</MenuItem> :null}
                        {checkMatch(userPermisionData,['registration_details_transfer']) ? <MenuItem value='Transfer'>Transfer</MenuItem> :null}
                        <MenuItem value='Reopen'>Re-open</MenuItem>
                      </Select>
                      
                    </FormControl>
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
                    {/* <Box sx={{ mr: 2 }}>
                        <SearchBox
                          placeHolderTitle='Search for Enquirer Name, Mobile Number, Student Name & Enquiry Number'
                          searchText={searchText}
                          handleClearSearch={handleClearSearch}
                          handleInputChange={handleInputChange}
                        />
                        </Box> */}
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

                    <Tooltip title='Download'>
                      <Fab
                        disabled={!admissionList?.length}
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
                        // style={{ display: 'none' }}
                        startIcon={<span className='icon-filter-search'></span>}
                        onClick={() => {
                          handleFilterClick(true)
                        }}
                      >
                        filter
                      </Button>
                    </Badge>
                    {/* <FilterComponent
                      filterOption={selectedOptions}
                      setFilterOption={setSelectedOptions}
                      setFilter={setIsHighlighted}
                      filterOpen={filterOpen}
                      setFilterOpen={setFilterOpen}
                    /> */}

                    {/* <FilterComponent
                        filterOpen={filterOpen}
                        setFilterOpen={setFilterOpen}
                        applyFilterOptions={applyFilter}
                        title='Parmanent Role'
                        academicYears={academicYears}
                        clearFilter={clearAllFilters}
                        setFilteredColumns={setFilteredColumns}
                      /> */}
                    <DynamicFilterComponent
                      pageName={'admissionFilters'}
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

                    {/* <Button
                      variant='contained'
                      color='secondary'
                      onClick={e => handleChange(e)}
                      disableFocusRipple
                      disableTouchRipple
                      startIcon={<span className='icon-add'></span>}
                    >
                      Create New Enquiry
                    </Button> */}
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
                    rows={admissionList} // Use the rows state
                    pagination
                    pageSizeOptions={[2, 10, 25, 50, 100]}
                    paginationMode='server'
                    paginationModel={paginationModel}
                    onPaginationModelChange={newModel => setPaginationModel(newModel)}
                    rowCount={totalRows} // Total number of rows
                    slots={{ pagination: CustomPagination }}
                    disableRowSelectionOnClick
                    //className={screenWidth < 1520 ? 'datatabaleWShadow' : 'dataTable'}
                    sx={{ boxShadow: 0 }}
                    getRowId={(row: any) => row.id}
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
            <span className='icon-calendar-1' onClick={() => setCalenderDialog(true)}></span>
          </Box>
          <Box sx={{ mt: 5, cursor: 'pointer' }}>
            <span className='icon-task-square' onClick={() => setTaskDialog(true)}></span>
          </Box>
          <Box sx={{ mt: 5, cursor: 'pointer' }}>
            <span className='icon-notification' onClick={() => setNotificationDialog(true)}></span>
          </Box>
          <Box sx={{ mt: 5, cursor: 'pointer' }}>
            <span className='icon-messages'></span>
          </Box>
        </Box> */}
      </Box>

      {calenderDialog && (
        <CalenderDialog openDrawer={calenderDialog} handleClose={handleCloseCalenderDialog} title='Calendar' />
      )}
      {taskDialog && <TaskDialog openDrawer={taskDialog} handleClose={handleCloseTaskDialog} title='My Tasks' />}
      {notificationDialog && (
        <NotificationDialog
          openDrawer={notificationDialog}
          handleClose={handleCloseNotificationDialog}
          title='Notification'
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
          admissionListing={true}
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
          admissionListing={true}
        />
      )}
      {transferSuccessDialog && (
        <SuccessDialog
          openDialog={transferSuccessDialog}
          title='Enquiries transfered'
          handleClose={handleTransferSuccessClose}
        />
      )}
      {pushData && (
        <SuccessDialog openDialog={pushData} title='Submitted Successfully' handleClose={handlePushDataClose} />
      )}
    </>
  )
}

export default AdmissionListing
