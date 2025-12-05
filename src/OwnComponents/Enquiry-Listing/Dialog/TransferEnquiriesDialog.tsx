// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  DialogTitle,
  Grid,
  Chip,
  IconButton,
  Typography,
  Autocomplete,
  TextField
} from '@mui/material'
import { Box } from '@mui/material'
import StudentLogo from '../Image/student.png'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import Image from 'next/image'
import { styled } from '@mui/material/styles'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { gridPageCountSelector, GridPagination, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'
import { getRequest, patchRequest } from 'src/services/apiService'
import { RuleIndex } from '@casl/ability/dist/types/RuleIndex'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { getLocalStorageVal } from 'src/utils/helper'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { useRouter } from 'next/router'

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
  handleReassignClose?: any
  transferColumns: GridColDef[]
  enquiryId?: any
  enquiryIds?: any
  mode?: any
  refresh?: any
  setRefresh?: any
  year?: any
  admissionListing?: any
}

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

function TransferEnquiriesDialog({
  openModal,
  closeModal,
  header,
  handleReassignClose,
  transferColumns,
  enquiryIds,
  enquiryId,
  mode,
  refresh,
  setRefresh,
  year,
  admissionListing
}: customModal) {
  // ** Hooks
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  const [location, setLocation] = useState<string>('Vibgyor High - Goregaon West')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [schoolLocation, setSchoolLocation] = useState<any>(null)
  const [schoolLocationList, setSchoolLocationList] = useState<any>([])
  const { setGlobalState } = useGlobalContext()
  const [similarEnquiries, setSimilarEnquiries] = useState<any>([])
  //Handle Clickable Chips Handler
  const [selectedIds, setSelectedIds] = useState([])
  const [transferSuccessDialog, setTransferSuccessDialog] = useState<boolean>(false)
  const router = useRouter()

  const handleTransferSuccessClose = () => {
    setTransferSuccessDialog(false)
    if (closeModal) {
      closeModal()
    }
    if (admissionListing) {
      router.push('/registered-student-listing')
    } else {
      router.push('/enquiries')
    }
  }
  useEffect(() => {
    if (enquiryIds) {
      setSelectedIds(enquiryIds)
    }
  }, [enquiryIds])
  const handleSelectionChange = (selection: any) => {
    setSelectedIds(selection)
    console.log('Selected IDs:', selection)
  }
  const chipsLabel = ['Enquiry Open', 'ENDAS#52487']

  //Handler for CTA Details Button
  const handleSchoolLocation = (newValue: any) => {
    console.log('Selected value:', newValue)
    setSchoolLocation(newValue || '') // Update state with the new value or an empty string if null
  }

  // const handleSchoolLocation = (event: any) => {
  //   setSchoolLocation(event.target.value)
  // }
  const handleLocation = (event: any) => {
    setLocation(event.target.value as string)
  }

  const getSchoolLocations = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `/api/ac-schools?fields[1]=name&fields[2]=short_name&fields[3]=code&filters[academic_year_id]=${year}`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }

    const userDetailsJson = getLocalStorageVal('userInfo')
    const userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : {}

    const response = await getRequest(params)
    if (response.data) {
      const filteredData = response?.data.filter((item: any) => item.attributes.code != userDetails?.schoolCode)
      setSchoolLocationList(filteredData)
      // if (response?.data?.length) {
      //   setSchoolLocation(response?.data[0])
      // }
    }
    setGlobalState({ isLoading: false })
  }

  const getSimilarEnquiries = async () => {
    const params = {
      url: `marketing/enquiry/${enquiryId}/transfer-enquiry-details/`
    }
    const response = await getRequest(params)
    if (response.status) {
      setSimilarEnquiries(response.data.similarEnquiries)
    }
  }

  useEffect(() => {
    getSchoolLocations()
    if (enquiryId) {
      const emqids = enquiryId.split(',')
      setSelectedIds(emqids)
      getSimilarEnquiries()
    }
  }, [enquiryId])

  const handleTransfer = async () => {
    setGlobalState({ isLoading: true })
    if (handleReassignClose) {
      const params = {
        url: `marketing/enquiry/transfer`,
        data: {
          enquiryIds: selectedIds,
          school_location: {
            id: schoolLocation?.id,
            value: schoolLocation?.attributes?.name
          }
        }
      }
      const response = await patchRequest(params)
      if (response.status) {
        //handleReassignClose(schoolLocation)
        setTransferSuccessDialog(true)
        if (setRefresh) {
          setRefresh(!refresh)
        }
      }
    }
    setGlobalState({ isLoading: false })
  }

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
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
                {/* <Grid item xs={4}>
                {schoolLocationList?.length ? (
                  <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-outlined-label'>School Location</InputLabel>
                    <Select
                      IconComponent={DownArrow}
                      label='School Location'
                      defaultValue={schoolLocation}
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                      onChange={handleSchoolLocation}
                    >
                      {schoolLocationList?.length
                        ? schoolLocationList?.map((val: any, index: any) => {
                            return (
                              <MenuItem key={index} value={val}>
                                {val?.attributes?.description}
                              </MenuItem>
                            )
                          })
                        : null}
                    </Select>
                  </FormControl>
                ) : null}
              </Grid> */}
                {schoolLocationList?.length ? (
                  <Autocomplete
                    options={schoolLocationList}
                    getOptionLabel={(option: any) => option?.attributes?.name || ''}
                    value={schoolLocation} // Current selected value
                    onChange={(event, newValue) => handleSchoolLocation(newValue)} // Handling the new selection
                    renderInput={params => (
                      <TextField
                        {...params}
                        label='School Location'
                        variant='outlined'
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    )}
                    isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                  />
                ) : null}
              </Grid>
            </Grid>
          </Box>
          {!mode ? (
            <>
              <Box sx={{ mt: 5, mb: 5 }}>
                <Typography variant='body2' sx={{ lineHeight: '21px', fontWeight: '500' }}>
                  Enquiries From The Same Enquirer(Global ID)
                </Typography>
              </Box>
              <Box sx={{ mt: 3, mb: 3 }}>
                <DataGrid
                  autoHeight
                  columns={transferColumns}
                  rows={similarEnquiries}
                  className='dataTable'
                  pagination={true}
                  checkboxSelection={true}
                  pageSizeOptions={[7, 10, 25, 50]}
                  paginationModel={paginationModel}
                  slots={{ pagination: CustomPagination }}
                  onPaginationModelChange={setPaginationModel}
                  hideFooterPagination
                  sx={{
                    boxShadow: 'none',
                    width: '100%',
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

            <Button
              onClick={handleTransfer}
              size='large'
              variant='contained'
              color='secondary'
              disabled={schoolLocation ? false : true}
            >
              Transfer
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {transferSuccessDialog && (
        <SuccessDialog
          openDialog={transferSuccessDialog}
          title='Enquiries transfered'
          handleClose={handleTransferSuccessClose}
        />
      )}
    </>
  )
}

export default TransferEnquiriesDialog
