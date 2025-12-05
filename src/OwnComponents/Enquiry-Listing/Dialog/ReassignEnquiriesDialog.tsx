// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import {
  Button,
  Card,
  DialogActions,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import UserIcon from 'src/layouts/components/UserIcon'
import { gridPageCountSelector, GridPagination, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import PhoneNumberInput from 'src/@core/CustomComponent/PhoneNumberInput/PhoneNumberInput'
import { getRequest, patchRequest, postRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { getLocalStorageVal } from 'src/utils/helper'
import router, { useRouter } from 'next/router'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'

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

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
  enquirerColumns: GridColDef[]
  enquirerRows?: any
  handleReassignClose?: () => void
  enquiryId?: any
  mode?: string
  enquiryIds?: any
  setRefresh?: any
  refresh?: any
  admissionListing?: any
}

function ReassignEnquiriesDialog({
  openModal,
  closeModal,
  header,
  enquirerColumns,
  handleReassignClose,
  enquiryId,
  mode,
  enquiryIds,
  setRefresh,
  refresh,
  admissionListing
}: customModal) {
  // ** Hooks
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [enquirerName, setEnquirerName] = useState('Ashok Shah')
  const [emailId, setEmailId] = useState('ashokshah@gmail.com')
  const [empName, setEmpName] = useState<string>('EMP101-Nittal')
  const [empId, setEmpId] = useState<number>(0)
  const [employeesList, setEmployeesList] = useState<any>([])
  const [reassignCompleteDialog, setReassignCompleteDialog] = useState<boolean>(false)

  const [similarEnquiries, setSimilarEnquiries] = useState<any>([])
  //Handler for CTA Details Button
  const [selectedIds, setSelectedIds] = useState([])
  const { setGlobalState, setApiResponseType } = useGlobalContext()

  const getEmployeeList = async () => {
    const userDetailsJsonDt = getLocalStorageVal('userInfo')
    const userDetailsDt = userDetailsJsonDt ? JSON.parse(userDetailsJsonDt) : {}
    const apiRequest = {
      url: 'marketing/enquiry/reassign',
      data: {
        school_code: userDetailsDt?.schoolCode,
        hris_code: userDetailsDt?.hrisCodes?.length ? userDetailsDt?.hrisCodes[0] : null
      }
    }
    const response: any = await postRequest(apiRequest)
    if (response && response?.data) {
      const filteredData = response?.data?.filter(
        (item: any) => item.attributes?.Official_Email_ID != userDetailsDt?.userInfo?.email
      )
      // Handle the response here, e.g., set the state with the data

      setEmployeesList(filteredData)
    }
  }

  useEffect(() => {
    if (enquiryIds) {
      setSelectedIds(enquiryIds)
    }
    getEmployeeList()
  }, [enquiryIds])

  const handleSelectionChange = (selection: any) => {
    setSelectedIds(selection)
    console.log('Selected IDs:', selection)
  }

  const handleEmployeeName = (event: any) => {
    const selectedEmpId = event.target.value as number
    // Find the selected employee details based on the id
    const employedetails = employeesList.find((ele: any) => ele.id === Number(selectedEmpId))
    setEmpId(event.target.value)
    const ename = (employedetails?.attributes?.First_Name ?? "") + " " + (employedetails?.attributes?.Last_Name ?? "")
    
    setEmpName(ename)
  }

  //Handler for CTA Details Button

  //   const handlerDetails = () => {
  //     console.log('Eneter Routes Here')
  //   }
  const getSimilarEnquiries = async () => {
    const params = {
      url: `marketing/enquiry/${enquiryId}/reassign-enquiry-details`
    }
    const response = await getRequest(params)
    if (response.status) {
      setSimilarEnquiries(response.data.similarEnquiries)
    }
  }

  useEffect(() => {
    if (enquiryId) {
      const emqids = enquiryId.split(',')
      setSelectedIds(emqids)
      getSimilarEnquiries()
    }
  }, [enquiryId])

  const handleReasignCompleteClose = () => {
    if (closeModal) {
      closeModal()
    }
    setReassignCompleteDialog(false)
    if (setRefresh) {
      setRefresh(!refresh)
    }
    if (admissionListing) {
      router.push('/registered-student-listing')
    } else {
      router.push('/enquiries')
    }
  }

  const handleReasign = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/reassign`,
      data: {
        enquiryIds: selectedIds,
        assigned_to: empName,
        assigned_to_id: +empId
      }
    }
    const response = await patchRequest(params)
    if (response?.status) {
      setReassignCompleteDialog(true)
    } else if (response?.error && response?.error?.errorMessage) {
      setApiResponseType({ status: true, message: response?.error?.errorMessage })
    }
    setGlobalState({ isLoading: false })
  }

  return (
    <>
      <Dialog
        // fullScreen={fullScreen}
        open={openModal}
        onClose={closeModal}
        maxWidth={mode ? maxWidths : null}
        aria-labelledby='responsive-dialog-title'
        sx={{
          '& .MuiPaper-root': {
            maxWidth: mode ? '600px' : '100%',
            width: mode ? '600px' : '100%'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle id='responsive-dialog-title'>{header}</DialogTitle>
          <IconButton disableFocusRipple disableRipple onClick={closeModal}>
            <HighlightOffIcon style={{ color: '#666666' }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ overflowY: mode ? 'initial' : 'auto' }}>
          <Box sx={{ mb: 5 }}>
            <Grid container spacing={5} xs={12}>
              <Grid item xs={mode ? 12 : 4}>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>Employee Name</InputLabel>
                  <Select
                    label='Employee Name'
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleEmployeeName}
                    IconComponent={DownArrow}
                  >
                    <MenuItem value=''>Select Employee Name</MenuItem>
                    {/* <MenuItem value='EMP101-Nittal'>EMP101-Nittal</MenuItem>
                    <MenuItem value='EMP103-Pallavi'>EMP103-Pallavi</MenuItem>
                    <MenuItem value='EMP104-Anjali'>EMP104-Anjali</MenuItem> */}

                    {employeesList?.map((employee: any) => (
                      <MenuItem key={employee.id} value={`${employee.id}`}>
                        {`${employee?.attributes?.First_Name} ${employee?.attributes?.Last_Name}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          {!mode ? (
            <>
              <Box sx={{ mb: 5 }}>
                <Typography variant='subtitle2' sx={{ lineHeight: '20px', letterSpacing: '0.1px' }}>
                  Enquiries From The Same Enquirer(Global ID)
                </Typography>
              </Box>

              <Box>
                <DataGrid
                  autoHeight
                  columns={enquirerColumns}
                  rows={similarEnquiries}
                  pagination={true}
                  checkboxSelection={true}
                  pageSizeOptions={[7, 10, 25, 50]}
                  paginationModel={paginationModel}
                  slots={{ pagination: CustomPagination }}
                  onPaginationModelChange={setPaginationModel}
                  className='dataTable'
                  sx={{
                    boxShadow: 'none',
                    '& .MuiDataGrid-main': { overflow: 'hidden' }
                  }}
                  getRowId={row => row.enquiry_id}
                  onRowSelectionModelChange={handleSelectionChange}
                />
              </Box>
            </>
          ) : (
            <div style={{ minWidth: '1000px' }}></div>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button onClick={closeModal} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button onClick={handleReasign} size='large' variant='contained' color='secondary'>
              Reassign
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {reassignCompleteDialog && (
        <SuccessDialog
          openDialog={reassignCompleteDialog}
          title='Leads Transferred Successfully'
          handleClose={handleReasignCompleteClose}
        />
      )}
    </>
  )
}

export default ReassignEnquiriesDialog
