import React, { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Button,
  TextField,
  Typography,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import MinimizeIcon from '@mui/icons-material/Minimize'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { StaticDatePicker, PickersDay, PickersDayProps } from '@mui/x-date-pickers'
import { display, margin, styled, width } from '@mui/system'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { Container, Grid } from '@mui/material'
import { Tooltip, Switch, Autocomplete, CircularProgress } from '@mui/material'
import { postRequest, getRequest, putRequest, patchRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { FEETYPES } from 'src/utils/constants'

const CustomStaticDatePicker = styled(StaticDatePicker)(({ theme }) => ({
  '&.MuiPickersLayout-root.MuiPickersLayout-landscape': {
    boxShadow: '0px 2px 10px 0px #4C4E6438',
    '& .MuiPickersToolbar-root ': {
      '& .MuiTypography-root': {
        display: 'none'
      },
      '& .MuiPickersToolbar-content': {
        display: 'none'
      }
    },
    '& .MuiPickersLayout-contentWrapper': {
      '& .MuiDateCalendar-root': {
        margin: '0px',
        width: '350px'
      }
    },

    '& .MuiDialogActions-root': {
      '& button': {
        marginLeft: '-22px'
      }
    }
  }
}))

const CalendarIcon = () => <span className='icon-calendar-1'></span>
const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

//Chips Styled
const StyledChipProps = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorPrimary': {
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 10px',
    background: '#4849DA14 !important',
    color: '#4849DA !important'
  },
  '&.MuiChip-colorDefault': {
    border: `1px solid ${theme.palette.grey[300]} !important`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 10px',
    background: `${theme.palette.customColors.text6} !important`,
    color: `${theme.palette.customColors.mainText} `
  }
}))
const Dot = styled(Box)(({ theme }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: `${theme.palette.primary.dark}`,
  position: 'absolute',
  bottom: 2,
  left: '50%',
  transform: 'translateX(-50%)'
}))

interface FormValues {
  psa_sub_type: number | null
  psa_category: number | null
  psa_sub_category: number | null
  period_of_service: number | null
  psa_batch: number | null
}

const defaultValues: FormValues = {
  psa_sub_type: null,
  psa_category: null,
  psa_sub_category: null,
  period_of_service: null,
  psa_batch: null
}

type SchoolTour = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
  setPsaDialog?: any
  minimized?: boolean
  setMinimized?: any
  enquiryID?: any
  setRefresh?: any
  refresh?: any
  details?: any
  viewMode?: boolean
  setViewMode?: any
  enquiryDetails?: any
  academic_year?: any
}

interface Option {
  id: number
  attributes: any
}

const FeesDialog = ({
  openDialog,
  handleClose,
  title,
  setPsaDialog,
  minimized,
  setMinimized,
  enquiryID,
  setRefresh,
  refresh,
  details,
  viewMode,
  setViewMode,
  enquiryDetails,
  academic_year
}: SchoolTour) => {
  const [isBooked, setIsBooked] = useState<boolean>(false)
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm<FormValues>({
    defaultValues
  })

  const formDatVal = watch()

  const handleMinimize = () => {
    setMinimized(true)
  }

  const handleBook = () => {
    setIsBooked(true)
  }

  const [subTypeOptions, setSubTypeOptions] = useState<any[]>([])
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([])
  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])
  const [psaBatchOptions, setPsaBatchOptions] = useState<any[]>([])

  const [defaultFees, setDefaultFees] = useState<any[]>([])

  const [psaDetails, setPsaDetails] = useState<any>({})

  const [vasAmount, setVasAmount] = useState<number>(0)
  const [isFinalSubmit, setFinalSubmit] = useState<boolean>(false)
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()

  const calculateAmmount = async () => {
    setGlobalState({ isLoading: true })

    const params4 = {
      url: `/fee_payment/finance/calculate`,
      serviceURL: 'finance',
      data: {
        academic_year_id: academic_year ? parseInt(academic_year) : null,
        board_id: enquiryDetails?.board?.id,
        course_id: enquiryDetails?.course?.id,
        shift_id: enquiryDetails?.shift?.id,
        stream_id: enquiryDetails?.stream?.id,
        grade_id: enquiryDetails?.student_details.grade?.id,
        school_id: enquiryDetails?.school_location?.id,
        batch_id: formDatVal?.psa_batch,
        fee_type_id: FEETYPES?.postSchoolActivityFees,
        fee_sub_type_id: formDatVal?.psa_sub_type,
        fee_category_id: formDatVal?.psa_category,
        fee_subcategory_id: formDatVal?.psa_sub_category,
        period_of_service_id: formDatVal?.period_of_service
      }
    }
    try {
      const data = await postRequest(params4)
      // setPsaDetails(data?.data);
      // setVasAmount(data?.data?.amount)
      if (data?.data?.amount) {
        setVasAmount(data?.data?.amount)
        setFinalSubmit(true)
      } else {
        setApiResponseType({ status: true, message: 'Fees Not Found' })
      }
      // setCategoryOptions(data?.data?.feeCategory);
    } catch (error) {
      console.error('Error fetching Child lobs:', error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  const onSubmit = async (data: FormValues) => {
    setGlobalState({ isLoading: true })
    const requestData: any = {}
    requestData.fee_sub_type_id = categoryOptions.find(
      (item: any) => item.fee_sub_type === data.psa_sub_type
    )?.fee_sub_type_id
    requestData.fee_category_id = categoryOptions.find(
      (item: any) => item.fee_category === data.psa_category
    )?.fee_category_id
    requestData.fee_subcategory_id = subCategoryOptions.find(
      (item: any) => item.fee_subcategory === data.psa_sub_category
    )?.fee_subcategory_id

    requestData.period_of_service_id = periodOfServiceOptions.find(
      (item: any) => item.period_of_service === data.period_of_service
    )?.period_of_service_id
    requestData.batch_id = psaBatchOptions.find((item: any) => item.batch_name === data.psa_batch)?.batch_id

    if (isFinalSubmit) {
      let finalSubmitData = {}
      // finalSubmitData = {
      //   optedForPsa: true,
      //   psaSubType: formDatVal?.psa_sub_type,
      //   psaCategory: formDatVal.psa_category,
      //   psaSubCategory: formDatVal.psa_sub_category,
      //   psaPeriodOfService: formDatVal.period_of_service,
      //   psaBatch: formDatVal.psa_batch,
      //   psaAmount: vasAmount
      // }

      finalSubmitData = {
        psa: {
          batch_id: formDatVal?.psa_batch,
          fee_type_id: FEETYPES?.postSchoolActivityFees,
          fee_sub_type_id: formDatVal?.psa_sub_type,
          fee_category_id: formDatVal?.psa_category,
          fee_subcategory_id: formDatVal?.psa_sub_category,
          period_of_service_id: formDatVal?.period_of_service,
          amount: vasAmount
        }
      }

      // const params4 = {
      //   url: `marketing/admission/${enquiryID}`,
      //   serviceURL: 'marketing',
      //   data: finalSubmitData
      // }
      const params4 = {
        url: `marketing/admission/${enquiryID}/vas/add?type=Psa`,
        data: finalSubmitData
      }
      try {
        const data = await postRequest(params4)
        setPsaDialog(false)
        setRefresh(!refresh)
        setViewMode(false)
      } catch (error) {
        console.error('Error fetching Child lobs:', error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    } else {
      calculateAmmount()
      // const params4 = {
      //   url: `/fee_payment/finance/calculate`,
      //   serviceURL: 'finance',
      //   data: {
      //     academic_year_id: 25,
      //     board_id: 3,
      //     course_id: 1,
      //     shift_id: null,
      //     stream_id: null,
      //     grade_id: 4,
      //     school_id: 7,
      //     batch_id: requestData?.batch_id,
      //     fee_type_id: 11,
      //     fee_sub_type_id: requestData?.fee_sub_type_id,
      //     fee_category_id: requestData?.fee_category_id,
      //     fee_subcategory_id: requestData?.fee_subcategory_id,
      //     period_of_service_id: requestData?.period_of_service_id
      //   }
      // }
      // try {
      //   const data = await postRequest(params4)
      //   // setPsaDetails(data?.data);
      //   // setVasAmount(data?.data?.amount)
      //   if (data?.data?.amount) {
      //     setVasAmount(data?.data?.amount)
      //     setFinalSubmit(true)
      //   }
      //   // setCategoryOptions(data?.data?.feeCategory);
      // } catch (error) {
      //   console.error('Error fetching Child lobs:', error)
      // } finally {
      //   setGlobalState({ isLoading: false })
      // }
    }
  }

  const fetchAllDefaultfees = async () => {
    setGlobalState({ isLoading: true })
    const requestparam = 'school_id = 26 AND academic_year_id= 25 AND grade_id=1 AND board_id=3  AND  shift_id= 3 AND publish_start_date <= current_date AND publish_end_date >= current_date'

    try {
      const concessionResponse = await postRequest({
        url: `/api/ac-schools/search-school-fees`,
        serviceURL: 'mdm',
        data: {
          operator: requestparam
        }
      })
      console.log(concessionResponse?.data?.schoolFees)
      setDefaultFees(concessionResponse?.data?.schoolFees)
    } catch (error) {
      console.error('Error fetching Child lobs:', error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  useEffect(() => {
    fetchAllDefaultfees()
  }, [])

  const handleOptions = async (event: any, value: any, name: any) => {
    if (name === 'psa_sub_type') {
      if (value) {
        value = [value]
        const selectedIds = value?.map((name: any) => {
          const item: any = subTypeOptions.find((item: any) => item.fee_sub_type_id === name)

          return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
        })
        const categoryOptions = psaDetails.feeCategory.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        setCategoryOptions(categoryOptions)
      } else {
        setCategoryOptions([])
      }
    }

    if (name === 'psa_category') {
      if (value) {
        value = [value]
        const selectedIds = value?.map((val: any) => {
          const item: any = categoryOptions.find((item: any) => item.fee_category_id === val)

          return item ? item.fee_category_id : undefined // Return item.id if found, otherwise undefined
        })
        const subcategoryOptions = psaDetails.feeSubCategory.filter((element: any) => {
          return selectedIds.includes(element.fee_category_id)
        })
        setSubCategoryOptions(subcategoryOptions)
      } else {
        setSubCategoryOptions([])
      }
    }

    if (name === 'psa_sub_category') {
      if (value) {
        value = [value]
        const selectedIds = value?.map((name: any) => {
          const item: any = subCategoryOptions.find((item: any) => item.fee_subcategory_id === name)

          return item ? item.fee_subcategory_id : undefined // Return item.id if found, otherwise undefined
        })
        const periodOfServiceOptions = psaDetails.periodOfService.filter((element: any) => {
          return selectedIds.includes(element.fee_subcategory_id)
        })

        const batchOptions = psaDetails.batches.filter((element: any) => {
          return selectedIds.includes(element.fee_subcategory_id)
        })
        setPsaBatchOptions(batchOptions)

        setPeriodOfServiceOptions(periodOfServiceOptions)
      } else {
        setPeriodOfServiceOptions([])
        setPsaBatchOptions([])
      }
    }

    // if (name === "period_of_service") {
    //     if (value) {
    //         value = value.split(',');
    //         const selectedIds = value?.map((name: any) => {
    //             const item: any = periodOfServiceOptions.find(
    //                 (item: any) =>
    //                     item.period_of_service === name
    //             );
    //             return item ? item.period_of_service_id : undefined; // Return item.id if found, otherwise undefined
    //         });
    //         let batchOptions = psaDetails.batches.filter((element: any) => {
    //             return selectedIds.includes(element.period_of_service_id)
    //         })
    //         setPsaBatchOptions(batchOptions)

    //     } else {
    //         setPsaBatchOptions([]);
    //     }

    // }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        {openDialog && !minimized && (
          <Box
            sx={{
              position: 'fixed',
              bottom: '0',
              right: '0',
              width: '100%',
              height: '100vh',
              backgroundColor: 'white',
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
              overflowY: 'auto',
              borderRadius: '10px',
              maxWidth: '450px'
            }}
            className='fixedModal'
          >
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                zIndex: 1400,
                width: '100%',
                p: 2
              }}
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <div
                style={{
                  padding: '10px 20px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px' }}>
                    {title}
                  </Typography>
                </Box>
                <Box>
                  <IconButton disableFocusRipple disableRipple onClick={handleMinimize}>
                    <span className='icon-minus'></span>
                  </IconButton>
                </Box>
              </div>
            </Box>
            <div style={{ padding: '20px' }}>
              <Box>
                <Grid container spacing={5}>
                  <Box
                    sx={{
                      margin: '10px auto',
                      borderRadius: '16px',
                      padding: '10px',
                      height: '80px',
                      width: '90%',
                      boxShadow: '0px 2px 10px 0px #4C4E6438'
                    }}
                  >
                    <Box sx={{ ml: 2 }}>
                      <Typography
                        variant='caption'
                        color='customColors.text3'
                        sx={{ mt: 2, textTransform: 'capitalize', lineHeight: '16px', letterSpacing: '0.4px' }}
                      >
                        Amount
                      </Typography>
                      <Typography
                        variant='h5'
                        color='primary.dark'
                        sx={{
                          mt: 1,
                          fontSize: '22px',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          lineHeight: '28px',
                          letterSpacing: '0.4px'
                        }}
                      >
                        ₹ {vasAmount}
                      </Typography>
                    </Box>
                  </Box>
                  <Grid item xs={12} sm={12}>
                    {defaultFees?.map((fees: any) => (
                      <>
                        <p>
                          {fees?.display_name} - {fees?.fee_type_name} - {fees?.fee_amount_for_period}{' '}
                        </p>
                      </>
                    ))}
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: '15px' }}>
                  <Button
                    onClick={() => {
                      setPsaDialog(false)
                      setViewMode(false)
                    }}
                    sx={{ width: 'auto', mr: '5px' }}
                    variant='outlined'
                    color='inherit'
                    fullWidth
                  >
                    {'Cancel'}
                  </Button>

                  {!viewMode ? (
                    <Button type='submit' sx={{ width: 'auto' }} variant='contained' color='secondary' fullWidth>
                      {isFinalSubmit ? 'Confirm' : 'Calculate'}
                    </Button>
                  ) : null}
                </Box>
              </Box>
            </div>
          </Box>
        )}
        {minimized && (
          <Box
            style={{
              position: 'fixed',
              bottom: 0,
              right: 0,
              width: '300px',
              height: '50px',
              backgroundColor: '#fff',
              boxShadow: '0px -2px 5px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              zIndex: 1300,
              cursor: 'pointer'
            }}
            onClick={() => setMinimized(false)}
          >
            <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '21px' }}>
              {title}
            </Typography>
            <IconButton onClick={() => setMinimized(false)}>
              <span className='icon-add'></span>
            </IconButton>
          </Box>
        )}
      </div>
    </LocalizationProvider>
  )
}

export default FeesDialog
