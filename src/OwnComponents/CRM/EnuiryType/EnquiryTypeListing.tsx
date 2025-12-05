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
import { gridPageCountSelector, GridPagination, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
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

// table for Lob Assigned Modal
const columnsLobAssign: GridColDef[] = [
  {
    field: 'stageApplicable',
    headerName: 'Stage Applicable',
    minWidth: 250,
    flex: 1
  },
  {
    field: 'orderOfStage',
    headerName: 'Order Of Stage',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150,
    flex: 1
  },
  {
    field: 'weightage',
    headerName: 'Weightage',
    align: 'center',
    headerAlign: 'center',
    minWidth: 150,
    flex: 1
  },
  {
    field: 'tat',
    headerName: 'TAT In Hrs/Days',
    minWidth: 250,
    flex: 1
  },
  {
    field: 'initiateWorkflow',
    headerName: 'Initiate Workflow',
    align: 'center',
    headerAlign: 'center',
    minWidth: 250,
    flex: 1
  }
]
const rowsLobAssign = [
  {
    id: 1,
    stageApplicable: 'Enquiry',
    orderOfStage: '1',
    weightage: '20%',
    tat: '2 Days',
    initiateWorkflow: '01'
  },
  {
    id: 2,
    stageApplicable: 'Schedule School Visit',
    orderOfStage: '2',
    weightage: '30%',
    tat: '1 Day',
    initiateWorkflow: '02'
  },
  {
    id: 3,
    stageApplicable: 'Register Form',
    orderOfStage: '3',
    weightage: '20%',
    tat: '2 Days',
    initiateWorkflow: '03'
  },
  {
    id: 4,
    stageApplicable: 'Back Test',
    orderOfStage: '4',
    weightage: '30%',
    tat: '4 Hrs',
    initiateWorkflow: '04'
  }
]

// type AdditionalDutyRoleType = {
//   handleRoleDialog: (a: boolean) => void
//   openRoleDialog: boolean
// }

interface StatusObj {
  [key: number]: {
    title: string
    color: ThemeColor
  }
}

function Pagination({
  page,
  onPageChange,
  className
}: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) {
  const apiRef = useGridApiContext()
  const pageCount = useGridSelector(apiRef, gridPageCountSelector)

  return (
    <MuiPagination
      color='primary'
      className={className}
      count={pageCount}
      page={page + 1}
      shape='rounded'
      onChange={(event, newPage) => {
        onPageChange(event as any, newPage - 1)
      }}
    />
  )
}

function CustomPagination(props: any) {
  return <GridPagination ActionsComponent={Pagination} {...props} />
}

function EnquiryTypeListing() {
  //Column and row of main data grid
  //Rows and column of data grid with status obj and click event
  const statusObj: StatusObj = {
    1: { title: 'Open', color: 'success' },
    2: { title: 'In-active', color: 'error' }
  }

  const columns: GridColDef[] = [
    {
      flex: 1,
      minWidth: 150,
      field: 'enquiryTypeName',
      headerName: 'Enquiry Type Name'
    },
    {
      flex: 1,
      minWidth: 120,
      field: 'orderNumber',
      headerName: 'Order Number',
      headerAlign: 'center',
      align: 'center'
    },
    {
      flex: 1,
      minWidth: 120,
      field: 'stagesMapped',
      headerName: 'Stages Mapped',
      headerAlign: 'center',
      align: 'center',
      renderCell: params => {
        return (
          <div style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={handleOpenLob}>
            {params.value}
          </div>
        )
      }
    },

    {
      flex: 1,
      minWidth: 100,
      field: 'status',
      headerAlign: 'center',
      align: 'center',
      headerName: 'Status',
      renderCell: (params: GridRenderCellParams) => {
        const status = statusObj[params.row.status]

        return (
          <CustomChip
            size='small'
            skin='light'
            color={status.color}
            label={status.title}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },
    {
      flex: 1,
      minWidth: 100,
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

  const rows = [
    {
      id: 1,
      enquiryTypeName: 'School Admission',
      orderNumber: '1',
      stagesMapped: '3',
      status: 1
    },
    {
      id: 2,
      enquiryTypeName: 'Post School Activities(PSA)',
      orderNumber: '2',
      stagesMapped: '4',
      status: 1
    },
    {
      id: 3,
      enquiryTypeName: 'Kids Club',
      orderNumber: '3',
      stagesMapped: '5',
      status: 1
    },
    {
      id: 4,
      enquiryTypeName: 'VIVA',
      orderNumber: '4',
      stagesMapped: '5',
      status: 1
    },
    {
      id: 5,
      enquiryTypeName: 'Summer Camp',
      orderNumber: '5',
      stagesMapped: '3',
      status: 1
    },
    {
      id: 6,
      enquiryTypeName: 'Name 1',
      orderNumber: '6',
      stagesMapped: '2',
      status: 1
    },
    {
      id: 7,
      enquiryTypeName: 'Name 2',
      orderNumber: '7',
      stagesMapped: '1',
      status: 1
    },
    {
      id: 8,
      enquiryTypeName: 'Name 3',
      orderNumber: '8',
      stagesMapped: '4',
      status: 1
    },
    {
      id: 9,
      enquiryTypeName: 'Name 4',
      orderNumber: '9',
      stagesMapped: '3',
      status: 1
    },
    {
      id: 10,
      enquiryTypeName: 'Name 5',
      orderNumber: '9',
      stagesMapped: '3',
      status: 1
    }
  ]

  const router = useRouter()

  //All states here
  const [data] = useState(rows)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [openLobModal, setOpenLobModal] = useState(false)
  const { setPagePaths } = useGlobalContext()
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false)
  const [deleteRoleDialog, setDeleteRoleDialog] = useState<boolean>(false)
  const [openDropzone, setOpenDropzone] = useState<boolean>(false)
  const [openDropzoneSuccess, setOpenDropzoneSuccess] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [searchText, setSearchText] = useState('')
  const [filterOpen, setFilterOpen] = React.useState<any>(null)

  //Hanlder for capturing current screen width
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  const handleEdit = (params: GridRenderCellParams) => {
    console.log(params, 'edit')
    router.push('/enquiry-type-listing/create-enquiry-type')
  }

  const handleView = (params: GridRenderCellParams) => {
    console.log(params, 'View')
  }

  //Handling Search Functionality
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchText('')
  }

  //Delete dialog funactionality
  //enable delete dialog
  const handleDelete = (params: GridRenderCellParams) => {
    setDeleteDialog(true)
  }

  //disable Delet Dialog
  const handleDeleteDialog = () => {
    setDeleteDialog(false)
  }

  //close delete and enable succes dialog
  const handleDeleteCloseDialog = () => {
    setDeleteDialog(false)
    setDeleteRoleDialog(true)
  }

  //close success dialog
  const handleDeleteRoleDialog = () => {
    setDeleteRoleDialog(false)
  }

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    // handleRoleDialog(true)
    router.push('/enquiry-type-listing/create-enquiry-type')

    // setAnchorEl(event?.currentTarget)
  }

  //Hanlder for dialog box in mui datagrid

  const handleOpenLob = () => setOpenLobModal(true)
  const handleCloseLob = () => setOpenLobModal(false)

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Enquiry Type Listing',
        path: '/enquiry-type-listing'
      }
    ])
  }, [])

  //handler for Menu Collapse create role button
  const open = Boolean(anchorEl)

  // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   setAnchorEl(event.currentTarget)
  // }
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

  return (
    <>
      <Box sx={{ background: '#fff', borderRadius: '10px' }}>
        <Grid container>
          {/* {!openRoleDialog && (
            <Grid item xs={12} className='breadcrumb-container'>
              <CommonHeader
                buttonTitle='Create Role'
                onPush={handleRoleDialog}
                title='Permanent Role'
                isButton={true}
                infoIcon={false}
              />
            </Grid>
          )} */}

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
                <Chip variant='filled' color='primary' label='All' sx={{ ml: 2, mr: 2 }} />
                <Chip variant='outlined' label='Drafts' />
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
                {/* <TextField
                className='custom-textfield'
                value={searhInvoice}
                placeholder='Search Invoice'
                onChange={e => setSearchInvoice(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <UserIcon icon='mdi:magnify' />
                    </InputAdornment>
                  )
                }}
              /> */}
                <Box sx={{ mr: 2 }}>
                  <SearchBox
                    placeHolderTitle='Search Enquiry Type'
                    searchText={searchText}
                    handleClearSearch={handleClearSearch}
                    handleInputChange={handleInputChange}
                  />
                </Box>
                <Tooltip title='Download'>
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
                <FilterComponent filterOpen={filterOpen} setFilterOpen={setFilterOpen} />
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={e => handleChange(e)}
                  disableFocusRipple
                  disableTouchRipple
                  startIcon={<span className='icon-add'></span>}
                >
                  Create Enquiry
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: '25px' }}>
            {/* <TableFilter /> */}

            <DataGrid
              autoHeight
              columns={columns}
              pagination
              pageSizeOptions={[7, 10, 25, 50]}
              paginationModel={paginationModel}
              slots={{ pagination: CustomPagination }}
              onPaginationModelChange={setPaginationModel}
              rows={data}
              className={screenWidth < 1520 ? 'datatabaleWShadow' : 'dataTable'}
            />
          </Grid>
        </Grid>

        {openLobModal && (
          <TableDialog
            openModal={openLobModal}
            closeModal={handleCloseLob}
            header='Stages Mapped To Enquiry Type - School Admission'
            columnsRolCode={columnsLobAssign}
            rowsRoleCode={rowsLobAssign}
          />
        )}
        {deleteDialog && (
          <DeleteDialog
            openModal={deleteDialog}
            handleSubmitClose={handleDeleteCloseDialog}
            closeModal={handleDeleteDialog}
            title='Delete Enquiry Type'
            content='Are You Sure You Want To Delete This Enquiry Type?'
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

export default EnquiryTypeListing
