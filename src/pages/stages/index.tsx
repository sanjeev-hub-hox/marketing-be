import React, { useEffect, useState } from 'react'
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
  Typography
} from '@mui/material'
import UserIcon from 'src/layouts/components/UserIcon'
import Card from '@mui/material/Card'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
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
import { useRouter } from 'next/navigation'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import Link from 'next/link'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import DropZoneDialog from 'src/@core/CustomComponent/UploadDialogBox/DropZoneDialog'
import DeleteDialog from 'src/@core/CustomComponent/DeleteDialogBox/DeleteDialog'
import TableDialog from 'src/@core/CustomComponent/DataGridDialogBox/TableDialog'
import FilterComponent from 'src/@core/CustomComponent/FilterComponent/FilterComponent'
import SearchBox from 'src/@core/CustomComponent/CustomSearchBox/SearchBox'
import { deleteRequest, getRequest, postRequest } from 'src/services/apiService'
import { calculateSerialNumber, generateExcelFromJson } from 'src/utils/helper'
import useDebounce from 'src/utils/useDebounce'
import Head from 'next/head'
import FilterCRMComponent from 'src/components/FilterCRMComponent'

// type AdditionalDutyRoleType = {
//   handleRoleDialog: (a: boolean) => void
//   openRoleDialog: boolean
// }

interface StatusObj {
  [key: string]: {
    title: string
    color: ThemeColor
  }
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

function StageListing() {
  const [searchText, setSearchText] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState<number>(0)
  const [listData, setListData] = useState([])
  const [listDataPagination, setListDataPagination] = useState<any>({})
  const debouncedSearchTerm = useDebounce(searchText, 700)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const { setPagePaths, setGlobalState, setListingMode, listingMode } = useGlobalContext()

  const [deleteDialog, setDeleteDialog] = useState<boolean>(false)
  const [deleteRoleDialog, setDeleteRoleDialog] = useState<boolean>(false)
  const [openDropzone, setOpenDropzone] = useState<boolean>(false)
  const [openDropzoneSuccess, setOpenDropzoneSuccess] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [deleteId, setDeleteId] = useState(null)
  const [refresh, setRefresh] = useState(false)
  const [filterOptions, setfilterOptions] = useState<any>([])
  const [totalRows, setTotalRows] = useState<any>(0)

  const statusObj: StatusObj = {
    active: { title: 'Active', color: 'success' },
    inactive: { title: 'In-active', color: 'error' }
  }
  const getData = async (filterData?: any) => {
    setGlobalState({
      isLoading: true
    })
    const param = {
      url: `marketing/enquiry-stage/list/?pageNumber=${paginationModel?.page + 1}&pageSize=${
        paginationModel?.pageSize
      }`,
      data: { ...(filterData && { filters: filterData }) }
      // params: {
      //   pageNumber: paginationModel?.page + 1,
      //   pageSize: paginationModel?.pageSize,
      //   ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      // }
    }
    const response: any = await postRequest(param)
    if (response.status) {
      const rowsWithSerialNumber = response?.data?.content.map((row: any, index: any) => ({
        ...row,
        serialNumber: calculateSerialNumber(index, page, pageSize)
      }))

      setListData(rowsWithSerialNumber)
      setListDataPagination(response.data.pagination)
      setTotalRows(response?.data?.pagination?.totalCount)
    }
    setGlobalState({
      isLoading: false
    })
  }

  useEffect(() => {
    getData()
  }, [paginationModel])

  useEffect(() => {
    if (listingMode.isDraft === 1) {
      setListingMode({ isDraft: 1 })
      setListingMode('drafts')
      getData([{ column: 'saved_as_draft', operation: 'equals', search: true }])
    } else {
      setListingMode('All')
    }
  }, [])

  const handleRecordListingMode = (mode: any) => {
    // let data = [{
    //   isDraft: mode == "All" ? 0 : 1,
    // }];
    let data = []
    if (mode == 'All') {
      data = [{ column: 'saved_as_draft', operation: 'equals', search: false }]
    } else {
      data = [{ column: 'saved_as_draft', operation: 'equals', search: true }]
    }
    setListingMode(mode)
    getData(data)
  }

  const getSearchData = async (filterData?: any) => {
    setGlobalState({
      isLoading: true
    })
    const param = {
      url: `marketing/enquiry-stage/list/global-search`,
      params: {
        pageNumber: page + 1,
        pageSize: pageSize,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      }
    }
    const response: any = await getRequest(param)
    if (response.status) {
      const rowsWithSerialNumber = response?.data?.content.map((row: any, index: any) => ({
        ...row,
        serialNumber: calculateSerialNumber(index, page, pageSize)
      }))

      setListData(rowsWithSerialNumber)
      setListDataPagination(response.data.pagination)
    }
    setGlobalState({
      isLoading: false
    })
  }

  useEffect(() => {
    if (debouncedSearchTerm) {
      getSearchData()
    } else {
      getData()
    }
  }, [page, debouncedSearchTerm, refresh])

  const columns: GridColDef[] = [
    {
      flex: 0.275,
      minWidth: 100,
      field: 'name',
      headerName: 'Stage Name'
    },
    {
      flex: 0.275,
      minWidth: 150,
      field: 'start_date',
      headerName: 'Start Date'
    },
    {
      flex: 0.275,
      minWidth: 150,
      field: 'end_date',
      headerName: 'End Date'
    },

    // {
    //   flex: 0.2,
    //   minWidth: 150,
    //   field: 'status',
    //   headerAlign: 'center',
    //   align: 'center',
    //   headerName: 'Status',
    //   renderCell: (params: GridRenderCellParams) => {
    //     const status = statusObj[params.row.status]

    //     return (
    //       <CustomChip
    //         size='small'
    //         skin='light'
    //         color={status.color}
    //         label={status.title}
    //         sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
    //       />
    //     )
    //   }
    // },
    {
      flex: 0.2,
      minWidth: 80,
      field: 'action',
      headerAlign: 'center',
      align: 'center',
      headerName: 'Action',
      renderCell: (params: GridRenderCellParams) => {
        return (
          <>
            <Tooltip title='View'>
              <IconButton disableFocusRipple disableRipple onClick={() => handleView(params)}>
                {/* <EditIcon /> */}
                <span className='icon-eye'></span>
              </IconButton>
            </Tooltip>
            <Tooltip title='Edit'>
              <IconButton disableFocusRipple disableRipple onClick={() => handleEdit(params)}>
                <span className='icon-edit-2'></span>
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete'>
              <IconButton disableFocusRipple disableRipple onClick={() => handleDelete(params)}>
                <span className='icon-trash'></span>
              </IconButton>
            </Tooltip>
          </>
        )
      }
    }
  ]

  const router = useRouter()
  const [filterOpen, setFilterOpen] = React.useState<any>(null)

  const handleEdit = (params: GridRenderCellParams) => {
    console.log(params, 'edit')
    router.push(`/stages/edit/${params.row._id}`)
  }

  const handleView = (params: GridRenderCellParams) => {
    router.push(`/stages/view/${params.row._id}`)

    console.log(params, 'View')
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchText('')
  }
  const handleDelete = (params: GridRenderCellParams) => {
    setDeleteId(params.row._id)
    setDeleteDialog(true)
  }
  const handleDeleteDialog = () => {
    setDeleteDialog(false)
  }
  const handleDeleteCloseDialog = async () => {
    const params = {
      url: `marketing/enquiry-stage/${deleteId}`
    }
    const response = await deleteRequest(params)
    if (response.status) {
      setDeleteDialog(false)
      setDeleteRoleDialog(true)
      setDeleteId(null)
      setRefresh(!refresh)
    }
  }
  const handleDeleteRoleDialog = () => {
    setDeleteRoleDialog(false)
  }

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    router.push('/stages/create')
  }
  useEffect(() => {
    setPagePaths([
      {
        title: 'Stage Listing',
        path: '/stages'
      }
    ])
  }, [])

  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
  }

  //Handler for dropxzone
  const handleCloseDropzone = () => {
    setOpenDropzone(false)
  }

  const handleSubmitDropzone = () => {
    setOpenDropzone(false)
    setOpenDropzoneSuccess(true)
  }

  const handleSuccessClose = () => {
    setOpenDropzoneSuccess(false)
  }

  //Handler For Filer Popover
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterOpen(event.currentTarget)
  }

  const handleDownload = () => {
    generateExcelFromJson(listData, 'StageList')
  }

  const options = [
    {
      name: 'Stage Name',
      value: 'name'
    },
    {
      name: 'Stage Colour',
      value: 'color'
    }
  ]

  const optionColumns = ['Stage Name', 'Stage Colour ']
  const clearAllFilters = (options: any[]) => {
    const filterOption: any[] = []
    setfilterOptions([])
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize })
    // fetchData(1, paginationModel.pageSize, filterOption);
  }

  const applyFilter = async (options: any[]) => {
    console.log(options)
    const filterOption: any[] = options
    setfilterOptions(filterOption)

    await getData(filterOption)
  }

  return (
    <>
      <Head>
        <title>Stage Listing - CRM</title>
        <meta name='description' content={`This is the Stage Listing page`} />
      </Head>
      <Box sx={{ background: '#fff', borderRadius: '10px' }}>
        <Grid container>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { sm: 'flex-start', lg: 'space-around' },
                  mt: 3
                }}
              >
                <Chip
                  variant='filled'
                  color={listingMode === 'All' ? 'primary' : 'default'}
                  label='All'
                  sx={{ ml: 2, mr: 2 }}
                  onClick={() => handleRecordListingMode('All')}
                />
                <Chip
                  color={listingMode === 'drafts' ? 'primary' : 'default'}
                  variant='outlined'
                  label='Drafts'
                  onClick={() => handleRecordListingMode('drafts')}
                />
              </Box>
              <Box
                sx={{
                  mt: 3,
                  ml: 3,
                  padding: '0px 10px',
                  display: 'flex',
                  justifyContent: { sm: 'flex-start', lg: 'flex-end' },
                  alignItems: 'center'
                }}
              >
                <Box sx={{ mr: 2 }}>
                  <SearchBox
                    placeHolderTitle='Search Stage Here'
                    searchText={searchText}
                    handleClearSearch={handleClearSearch}
                    handleInputChange={handleInputChange}
                  />
                </Box>
                <Tooltip onClick={handleDownload} title='Download Stage List'>
                  <Fab
                    size='small'
                    sx={{
                      mr: 3,
                      '@media (max-width: 910px)': {
                        ml: 3
                      }
                    }}
                  >
                    <span className='icon-import-1'></span>
                  </Fab>
                </Tooltip>
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
                  onClick={handleFilterClick}
                >
                  filter
                </Button>
                <FilterCRMComponent
                  filterOpen={filterOpen}
                  setFilterOpen={setFilterOpen}
                  applyFilterOptions={applyFilter}
                  title='Enquiry Types'
                  clearFilter={clearAllFilters}
                  options={options}
                  optionColumns={optionColumns}
                />
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={e => handleChange(e)}
                  disableFocusRipple
                  disableTouchRipple
                  startIcon={<span className='icon-add'></span>}
                >
                  Create Stage
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: '25px' }}>
            {/* <DataGrid
              autoHeight
              columns={columns}
              rowCount={totalRows}
              pagination
              pageSizeOptions={[10, 25, 50, 100]}
              paginationMode='server'
              paginationModel={paginationModel}
              slots={{ pagination: CustomPagination }}
              rows={listData}
              className='dataTable'
              getRowId={row => row._id}
              onPaginationModelChange={newModel => setPaginationModel(newModel)}
            /> */}
            <DataGrid
              checkboxSelection
              autoHeight
              columns={columns} // Define your columns
              rows={listData} // Use the rows state
              pagination
              pageSizeOptions={[10, 25, 50, 100]}
              paginationMode='server'
              paginationModel={paginationModel}
              onPaginationModelChange={newModel => setPaginationModel(newModel)}
              rowCount={totalRows} // Total number of rows
              slots={{ pagination: CustomPagination }}
              disableRowSelectionOnClick
              className='dataTable'
              getRowId={row => row._id}
            />
          </Grid>
        </Grid>

        {deleteDialog && (
          <DeleteDialog
            openModal={deleteDialog}
            handleSubmitClose={handleDeleteCloseDialog}
            closeModal={handleDeleteDialog}
            title='Delete Stage'
            content='Are you sure you want to delete this Stage?'
          />
        )}
        {deleteRoleDialog && (
          <SuccessDialog
            openDialog={deleteRoleDialog}
            title='Deleted Successfully'
            handleClose={handleDeleteRoleDialog}
          />
        )}
        {openDropzone && (
          <DropZoneDialog
            title='Bulk Upload Data'
            subTitle='Upload your data through csv or xls. file'
            openModal={openDropzone}
            closeModal={handleCloseDropzone}
            handleSubmitClose={handleSubmitDropzone}
          />
        )}
        {openDropzoneSuccess && (
          <SuccessDialog
            openDialog={openDropzoneSuccess}
            title='File Uploaded Successfully'
            handleClose={handleSuccessClose}
          />
        )}
      </Box>
    </>
  )
}

export default StageListing
