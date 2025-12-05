import {
    Chip,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Popover,
    Select,
    styled,
    Typography,
    useTheme,
    Button,
    Badge
  } from '@mui/material'
  import { Box } from '@mui/system'
  import React, { useCallback, useEffect, useState } from 'react'
  
  import SearchBox from 'src/@core/CustomComponent/CustomSearchBox/SearchBox'
  import StudentIcon from '../../../public/images/avatars/studentIcon.svg'
  import Image from 'next/image'
  import Link from 'next/link'
  import { useGlobalContext } from 'src/@core/global/GlobalContext'
  import { getRequest, postRequest } from 'src/services/apiService'
  import {
    calculateSerialNumber,
    generateExcelFromJson,
    getCurrentYearObject,
    getLocalStorageVal
  } from 'src/utils/helper'
  import useDebounce from 'src/utils/useDebounce'
  import { useRouter } from 'next/router'
  import DownArrow from 'src/@core/CustomComponent/DownArrow/DownArrow'
  import DownloadIcon from '@mui/icons-material/Download'
  import ReportFilterDrawer from 'src/@core/CustomComponent/ReportComponent/ReportFilterDrawer'
import { alignProperty } from '@mui/material/styles/cssUtils'
import { method } from 'lodash'
import axios, { AxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/'
  
  function Reports() {
    const theme = useTheme()
    const router = useRouter()
    const { setPagePaths, setGlobalState } = useGlobalContext()
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [searchText, setSearchText] = useState('')
    const [selectedOptions, setSelectedOptions] = useState<string>('2024')
    const [enquiryListing, setEnquiryListing] = useState([])
    const debouncedSearchTerm = useDebounce(searchText, 700)
    const [refresh, setRefresh] = useState(false)
    const [totalRows, setTotalRows] = useState<any>(0)
    const [totalPages, setTotalPages] = useState(1)
    const [filterOptions, setfilterOptions] = useState<any>([])
    const [academicYears, setacademicYears] = useState<string[]>([])
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState<number>(0)
    const [year, setYear] = useState('')
    const [reportFilters, setReportFilters] = useState<any>([])
    const [reportDrawerOpen, setReportDrawerOpen] = useState(false)
    const [reportType, setReportType] = useState('')
    const [reportFilterDrawerOpen, setReportFilterDrawerOpen] = useState(false)

  
    //Handling Search Functionality
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(event.target.value)
    }
    const handleClearSearch = () => {
      setSearchText('')
    }
    const chipsLabel = ['2024', '2023', '2022', '5 Years Old']
    const handleToggle = (option: string) => {
      // setFilter(option)
      setSelectedOptions(option)
    }

    //! Define report configurations
    const REPORT_CONFIGS = [
      {
        value: 'enquiry',
        label: 'Enquiry Details',
        description: 'Download complete enquiry details report',
        endpoint: 'marketing/enquiry/ay/enquiry-report',
        method: 'GET',
        filters: [],
        filteredEndpoint: undefined
      },
      {
        value: 'admission',
        label: 'Enquiry To Admission',
        description: 'Download enquiry to admission conversion report',
        endpoint: 'marketing/enquiry/ay/admission-enquiry-report',
        method: 'GET',
        filters: [],
        filteredEndpoint: undefined
      },
      {
        value: 'daily',
        label: 'Enquiry To Daily Appointment',
        description: 'Download daily appointment report for the selected date range',
        endpoint: 'marketing/enquiry/ay/appointment-report',
        method: 'POST',
        filters: [
          {
            name: 'dateRange',
            label: 'Date Range',
            type: 'dateRange',
            key: 'date_range',
            required: true
          }
        ],
        filteredEndpoint: undefined
      }
    ]
  
    //Handle Popover here
    const handlePopOver = (event: any) => {
      setAnchorEl(event.currentTarget)
    }
  
    const handlePopOverClose = () => {
      setAnchorEl(null)
    }
  
    const open = Boolean(anchorEl)
    const id = open ? 'simple-popover' : undefined
  
    const handleStudentDetails = (params: any) => {
      router.push('/enquiries/view/' + params?.enquiryId)
    }
  
    //Passing Breadcrumbs
    useEffect(() => {
      setPagePaths([
        {
          title: 'Reports',
          path: '/reports'
        }
      ])
    }, [])
  
    const handleYearChange = (event: any) => {
      setYear(event.target.value as string)
    }
  
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
            const currentYear = getCurrentYearObject(response?.data)
            if (currentYear && currentYear?.length) {
              setYear(currentYear[0]?.id)
            } else {
              setYear(response?.data[0]?.id)
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
  
      fetchData()
    }, [])

    const handleReportDownload = async(type:string) =>{
      setGlobalState({isLoading:true})
      let endpoint = null;
      if(type == 'enquiry'){
        endpoint = `marketing/enquiry/ay/enquiry-report`
      }else if(type == 'admission'){
        endpoint = `marketing/enquiry/ay/admission-enquiry-report`
      } else if(type == 'daily'){
        endpoint = `marketing/enquiry/ay/appointment-report`
      }
  
      const params = {
          url:endpoint,
      }

      
      const response = type==='daily'? await postRequest(params) : await getRequest(params)
      if(response?.status){
          const fileUrl = response?.data?.url //resp?.data?.url // Replace with your file URL
          const fileName = response.data.fileName // Optional: Specify the file name for download
          const link = document.createElement('a')
          link.href = fileUrl
          link.download = fileName 
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
      }
      setGlobalState({isLoading:false})
    }

    // Helper function to download file from URL
    const downloadFile = (fileUrl: string, fileName: string) => {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    const handleFilteredReportDownload = async (reportType: string, filters: {}) => {
      if (!reportType) return;

      const reportConfig = REPORT_CONFIGS.find(r => r.value === reportType);
      if (!reportConfig) return;

      const { method, endpoint } = reportConfig;
      const appliedFilters = filters || {};

      try {
        setGlobalState({ isLoading: true });  // ✅ START LOADING

        const apiRequest = {
          url: endpoint,
          ...(method === 'POST' && { data: appliedFilters })
        };

        const response =
          method === 'GET'
            ? await getRequest({ ...apiRequest, params: appliedFilters })
            : await postRequest(apiRequest);

        if (response?.data?.url) {
          downloadFile(response.data.url, `${reportConfig.label}.xlsx`);
        }
      } catch (err) {
        console.error('Download error:', err);
      } finally {
        setGlobalState({ isLoading: false });  // ✅ STOP LOADING
      }
    };

  
    return (
      <>  
        <Box sx={{ background: '#fff', borderRadius: '10px', padding: '16px', mt: 2 }}>
          <Box sx={{ background: '#fff', padding: '8px', display: 'flex', justifyContent: 'end' }}> 
            <Badge
              color='error'
              badgeContent={reportFilters.length}
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
                onClick={() => setReportFilterDrawerOpen(true)}
              >
                filter
              </Button>
            </Badge>
          </Box>
          <Grid container spacing={7} xs={12} sx={{ pt: 0, mt: 2, ml: -3.5 }}>
            <Grid
              item
              xs={12}
              md={4}
              lg={4}
              sx={{ '&.MuiGrid-item': { paddingTop: '0px !important', cursor: 'pointer' } }}
              onClick={()=>{
                  handleReportDownload('enquiry')
              }}
            >
              <Box
                sx={{
                  mb: 8,
                  padding: '24px',
                  borderRadius: '10px',
                  background: theme.palette.customColors.surface2,
                  boxShadow: '0px 2px 10px 0px #4C4E6438'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <Box sx={{ ml: 2, display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Typography
                          variant='subtitle2'
                          color={'text.primary'}
                          sx={{ textTransform: 'capitalize', lineHeight: '18px', cursor: 'pointer' }}
                        >
                          Enquiry Details
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              lg={4}
              sx={{ '&.MuiGrid-item': { paddingTop: '0px !important', cursor: 'pointer' } }}
              onClick={()=>{
                  handleReportDownload('admission')
              }}
            >
              <Box
                sx={{
                  mb: 8,
                  padding: '24px',
                  borderRadius: '10px',
                  background: theme.palette.customColors.surface2,
                  boxShadow: '0px 2px 10px 0px #4C4E6438'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <Box sx={{ ml: 2, display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Typography
                          variant='subtitle2'
                          color={'text.primary'}
                          sx={{ textTransform: 'capitalize', lineHeight: '18px', cursor: 'pointer' }}
                        >
                          Enquiry To Admission
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              lg={4}
              sx={{ '&.MuiGrid-item': { paddingTop: '0px !important', cursor: 'pointer' } }}
              onClick={()=>{
                  handleReportDownload('daily')
              }}
            >
              <Box
                sx={{
                  mb: 8,
                  padding: '24px',
                  borderRadius: '10px',
                  background: theme.palette.customColors.surface2,
                  boxShadow: '0px 2px 10px 0px #4C4E6438'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <Box sx={{ ml: 2, display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Typography
                          variant='subtitle2'
                          color={'text.primary'}
                          sx={{ textTransform: 'capitalize', lineHeight: '18px', cursor: 'pointer' }}
                        >
                          Enquiry To Daily Appointment
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <ReportFilterDrawer
          isOpen={reportFilterDrawerOpen}
          onClose={() => setReportFilterDrawerOpen(false)}
          onDownload={(reportType, filters) => handleFilteredReportDownload(reportType, filters)}
          reportConfigs={REPORT_CONFIGS} 
        />

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopOverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
        >
          <Typography variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 2 }}>
            {' '}
            <Link style={{ color: theme.palette.customColors.mainText, fontSize: '16px', lineHeight: '17.6px' }} href='#'>
              Registration
            </Link>
          </Typography>
          <Typography variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 2 }}>
            {' '}
            <Link style={{ color: theme.palette.customColors.mainText, fontSize: '16px', lineHeight: '17.6px' }} href='#'>
              Email
            </Link>
          </Typography>
          <Typography variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 2 }}>
            <Link style={{ color: theme.palette.customColors.mainText, fontSize: '16px', lineHeight: '17.6px' }} href='#'>
              School Tour
            </Link>
          </Typography>
          <Typography variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 2 }}>
            {' '}
            <Link style={{ color: theme.palette.customColors.mainText, fontSize: '16px', lineHeight: '17.6px' }} href='#'>
              Timeline
            </Link>
          </Typography>
        </Popover>
      </>
    )
  }
  
  export default Reports
  