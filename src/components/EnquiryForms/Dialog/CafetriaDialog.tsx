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
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import { Container, Grid } from '@mui/material'
import { patchRequest, postRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { FEETYPES } from 'src/utils/constants'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

interface FormValues {
  psa_category: any
  period_of_service: number | null
}

const defaultValues: FormValues = {
  psa_category: null,
  period_of_service: null
}

type SchoolTour = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
  setCafeteriaDialog?: any
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
  schoolParentId?: any
}

const CafetriaDialog = ({
  openDialog,
  handleClose,
  title,
  setCafeteriaDialog,
  minimized,
  setMinimized,
  enquiryID,
  setRefresh,
  refresh,
  details,
  viewMode,
  setViewMode,
  enquiryDetails,
  academic_year,
  schoolParentId
}: SchoolTour) => {
  const [isBooked, setIsBooked] = useState<boolean>(false)
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm<any>({
    defaultValues
  })
  const formDatVal = watch()

  const handleMinimize = () => {
    setMinimized(true)
  }

  const handleBook = () => {
    setIsBooked(true)
  }
  const [vasAmount, setVasAmount] = useState<number>(0)
  const [isFinalSubmit, setFinalSubmit] = useState<boolean>(false)
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  const onSubmit = async (data: FormValues) => {
    setGlobalState({ isLoading: true })

    const requestData: any = {}
    requestData.fee_category_id = categoryOptions.find(
      (item: any) => item.fee_category === data.psa_category
    )?.fee_category_id
    requestData.period_of_service_id = periodOfServiceOptions.find(
      (item: any) => item.period_of_service === data.period_of_service
    )?.period_of_service_id

    if (isFinalSubmit) {
      let finalSubmitData = {}
      // finalSubmitData = {
      //   // type: 'Cafeteria',
      //   cafeteriaOptFor: parseInt(formDatVal?.psa_category),
      //   //cafeteriaOptForId: requestData.fee_category_id,
      //   cafeteriaPeriodOfService: formDatVal.period_of_service,
      //   cafeteriaAmount: vasAmount
      // }

      finalSubmitData = {
        cafeteria: {
          fee_type_id: FEETYPES?.cafeteriaFees,
          fee_category_id: formDatVal?.psa_category ? parseInt(formDatVal?.psa_category) : null,
          period_of_service_id: formDatVal?.period_of_service ? parseInt(formDatVal?.period_of_service) : null,
          amount: vasAmount,
          batch_id: null,
          fee_sub_type_id: null,
          fee_subcategory_id: null
        }
      }
      // const params4 = {
      //   url: `marketing/admission/${enquiryID}`,
      //   serviceURL: 'marketing',
      //   data: finalSubmitData
      // }
      const params4 = {
        url: `marketing/admission/${enquiryID}/vas/add?type=Cafeteria`,
        data: finalSubmitData
      }
      try {
        const data = await postRequest(params4)
        setCafeteriaDialog(false)
        setRefresh(!refresh)
        setViewMode(false)

        // setPsaDetails(data?.data)
        // setCategoryOptions(data?.data?.feeCategory)
      } catch (error) {
        console.error('Error fetching Child lobs:', error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    } else {
      // const params4 = {
      //   url: `/fee_payment/finance/calculate`,
      //   serviceURL: 'finance',
      //   data: {
      //     board_id: 3,
      //     course_id: null,
      //     shift_id: null,
      //     stream_id: null,
      //     grade_id: 3,
      //     school_id: 2,
      //     batch_id: null,
      //     fee_type_id: 2,
      //     fee_sub_type_id: 25,
      //     fee_category_id: requestData.fee_category_id,
      //     fee_subcategory_id: null,
      //     period_of_service_id: requestData.period_of_service_id
      //   }
      // }
      // try {
      //   const data = await postRequest(params4)
      //   // setPsaDetails(data?.data);

      //   setGlobalState({ isLoading: false })
      //   setVasAmount(data?.data?.amount ? data?.data?.amount : 0)
      //   setFinalSubmit(true)
      //   // setCategoryOptions(data?.data?.feeCategory);
      // } catch (error) {
      //   console.error('Error fetching Child lobs:', error)
      // }
      calculateAmmount()
    }
  }

  const [psaDetails, setPsaDetails] = useState<any>({})
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])

  useEffect(() => {
    setGlobalState({ isLoading: true })
    const handleSearch = async () => {
      const params4 = {
        url: `/api/fc-fees-masters/cafeteria-details`,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        },
        data: {
          academic_year_id: academic_year ? parseInt(academic_year) : 25,
          board_id: enquiryDetails?.board?.id,
          course_id: enquiryDetails?.course?.id,
          shift_id: enquiryDetails?.shift?.id,
          stream_id: enquiryDetails?.stream?.id,
          grade_id: enquiryDetails?.student_details.grade?.id,
          // school_id: enquiryDetails?.school_location?.id,
          school_parent_id: schoolParentId
        }
      }
      try {
        const data = await postRequest(params4)
        setPsaDetails(data?.data)
        setCategoryOptions(data?.data?.feeCategory)
      } catch (error) {
        console.error('Error fetching Child lobs:', error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    }

    handleSearch()
  }, [])

  const handleOptions = (event: any, value: any, name: any) => {
    setFinalSubmit(false)
    if (name === 'psa_category') {
      const selectedIds = categoryOptions
        .filter((item: any) => item.fee_category_id == value)
        .map((item: any) => item.fee_category)

      const subcategoryOptions = psaDetails.periodOfService.filter((element: any) => {
        return selectedIds.includes(element.fee_category)
      })
      if (subcategoryOptions && subcategoryOptions?.length) {
        setValue('period_of_service', subcategoryOptions[0]?.period_of_service_id)
      }
      setPeriodOfServiceOptions(subcategoryOptions)
    }
  }

  useEffect(() => {
    if (details && psaDetails) {
      const selectedIds = psaDetails?.feeCategory
        ?.filter((item: any) => item.fee_category_id === details?.fee_category_id)
        .map((item: any) => item.fee_category)

      const subcategoryOptions = psaDetails?.periodOfService?.filter((element: any) => {
        return selectedIds.includes(element.fee_category)
      })

      setPeriodOfServiceOptions(subcategoryOptions)
      reset({
        psa_category: details?.fee_category_id,
        period_of_service: details?.period_of_service_id
      })
      setVasAmount(details?.amount)
    }
  }, [details, psaDetails])

  const calculateAmmount = async () => {
    setGlobalState({
      isLoading: true
    })
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
        //school_id: enquiryDetails?.school_location?.id,
        school_parent_id: schoolParentId,
        fee_type_id: FEETYPES?.cafeteriaFees,
        fee_category_id: formDatVal?.psa_category ? parseInt(formDatVal?.psa_category) : null,
        period_of_service_id: formDatVal?.period_of_service ? parseInt(formDatVal?.period_of_service) : null
      }
    }
    try {
      const data = await postRequest(params4)
      // setPsaDetails(data?.data);
      if (data?.status == 200) {
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
                  <IconButton
                    disableFocusRipple
                    disableRipple
                    onClick={() => {
                      setCafeteriaDialog(false)
                    }}
                  >
                    <HighlightOffIcon style={{ color: '#666666' }} />
                  </IconButton>
                </Box>
              </div>
            </Box>
            <div style={{ padding: '20px' }}>
              <Box>
                {psaDetails?.feeCategory && psaDetails?.feeCategory?.length ? (
                  <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
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
                        <FormControl component='fieldset' error={!!errors.psa_category}>
                          <FormLabel component='legend'>Category</FormLabel>
                          <Controller
                            name='psa_category'
                            control={control}
                            rules={{ required: 'Please select a PSA category' }}
                            render={({ field }) => (
                              <RadioGroup
                                {...field}
                                onChange={event => {
                                  field.onChange(event.target.value)
                                  handleOptions(event, event.target.value, 'psa_category')
                                }}
                                value={formDatVal.psa_category}
                              >
                                {categoryOptions.map(option => (
                                  <FormControlLabel
                                    disabled={viewMode}
                                    key={option.fee_category_id}
                                    value={option.fee_category_id} // Use the unique id as the value
                                    control={<Radio />}
                                    label={option.fee_category}
                                  />
                                ))}
                              </RadioGroup>
                            )}
                          />
                          {errors.psa_category && (
                            <Typography variant='body2' color='error'>
                              {/* {errors.psa_category.message} */}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      {periodOfServiceOptions && periodOfServiceOptions?.length ? (
                        <Grid sx={{ mb: '15px' }} item xs={12} md={12}>
                          {periodOfServiceOptions && periodOfServiceOptions?.length ? (
                            <FormControl fullWidth>
                              <InputLabel id='drop-point-label'>Period of service</InputLabel>
                              <Controller
                                name='period_of_service'
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    disabled={viewMode}
                                    label='Period of service'
                                    labelId='drop-point-label'
                                    onChange={event => {
                                      field.onChange(event.target.value)
                                      handleOptions(event, event.target.value, 'psa_category1')
                                    }}
                                  >
                                    {periodOfServiceOptions?.map((val: any, ind: number) => {
                                      return (
                                        <MenuItem key={ind} value={val?.period_of_service_id}>
                                          {val?.period_of_service}
                                        </MenuItem>
                                      )
                                    })}
                                  </Select>
                                )}
                              />
                            </FormControl>
                          ) : (
                            <FormControl fullWidth>
                              <InputLabel id='demo-simple-select-outlined-label'>Period of service</InputLabel>
                              <Select
                                IconComponent={DownArrow}
                                label='Select Drop Point'
                                // defaultValue={pickup}
                                id='demo-simple-select-outlined'
                                labelId='demo-simple-select-outlined-label'
                                // onChange={handlePickup}
                              >
                                <MenuItem value='selectOption'>-Select Option-</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        </Grid>
                      ) : null}
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button
                        onClick={() => {
                          setCafeteriaDialog(false)
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
                  </form>
                ) : (
                  <Typography sx={{ mr: 2, fontWeight: 400, color: 'text.secondary' }} align='center'>
                    Data Not Found
                  </Typography>
                )}
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

export default CafetriaDialog
