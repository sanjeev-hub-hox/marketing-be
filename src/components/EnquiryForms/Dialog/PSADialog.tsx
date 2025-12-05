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
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

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

const PSADialog = ({
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

  useEffect(() => {
    setGlobalState({ isLoading: true })
    const handleSearch = async () => {
      const params4 = {
        url: `/api/fc-fees-masters/psa-details`,
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
          school_id: enquiryDetails?.school_location?.id
        }
      }
      try {
        const data = await postRequest(params4)
        // setChild(data4?.data);
        setPsaDetails(data?.data)

        setSubTypeOptions(data?.data?.feeSubType)
        // setCategoryOptions(data?.data?.feeCategory)
        // setSubCategoryOptions(data?.data?.feeSubCategory)

        // setPeriodOfServiceOptions(data?.data?.periodOfService)
        // setPsaBatchOptions(data?.data?.batches)
      } catch (error) {
        console.error('Error fetching Child lobs:', error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    }

    handleSearch()
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

  useEffect(() => {
    if (details && psaDetails && details?.sub_category) {
      const psa_sub_type = [details?.sub_type]
      const selectedIds = psa_sub_type?.map((name: any) => {
        const item: any = subTypeOptions.find((item: any) => item.fee_sub_type_id === name)

        return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
      })
      const categoryOptions = psaDetails?.feeCategory?.filter((element: any) => {
        return selectedIds.includes(element.fee_sub_type_id)
      })
      setCategoryOptions(categoryOptions)

      const psa_category = [details?.category]
      const selectedIdsNew = psa_category?.map((val: any) => {
        const item: any = categoryOptions?.find((item: any) => item.fee_category_id === val)

        return item ? item.fee_category_id : undefined // Return item.id if found, otherwise undefined
      })
      const subcategoryOptionsnew = psaDetails?.feeSubCategory?.filter((element: any) => {
        return selectedIdsNew?.includes(element.fee_category_id)
      })
      setSubCategoryOptions(subcategoryOptionsnew)

      const psa_sub_category = [details?.sub_category]
      const selectedIds3 = psa_sub_category?.map((name: any) => {
        const item: any = subcategoryOptionsnew?.find((item: any) => item.fee_subcategory_id == name)

        return item ? item?.fee_subcategory_id : undefined // Return item.id if found, otherwise undefined
      })
      const periodOfServiceOptions = psaDetails?.periodOfService?.filter((element: any) => {
        return selectedIds3.includes(element.fee_subcategory_id)
      })

      const batchOptions = psaDetails?.batches?.filter((element: any) => {
        return selectedIds3.includes(element.fee_subcategory_id)
      })

      setPsaBatchOptions(batchOptions)

      setPeriodOfServiceOptions(periodOfServiceOptions)

      reset({
        psa_sub_type: details?.sub_type,
        psa_category: details?.category,
        psa_sub_category: details?.sub_category,
        period_of_service: details?.period_of_service,
        psa_batch: details?.psa_batch
      })
      if (viewMode) {
        calculateAmmount()
      }
    }
  }, [details, psaDetails])

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
                      setPsaDialog(false)
                    }}
                  >
                    <HighlightOffIcon style={{ color: '#666666' }} />
                  </IconButton>
                </Box>
              </div>
            </Box>
            <div style={{ padding: '20px' }}>
              <Box>
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
                      <Controller
                        name='psa_sub_type'
                        control={control}
                        rules={{ required: 'Please select at least one user' }}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            disabled={viewMode}
                            id='autocomplete-multiple-filled'
                            getOptionLabel={(option: any) => {
                              const label = subTypeOptions?.find(opt => opt.fee_sub_type_id === option)

                              return label?.fee_sub_type
                            }}
                            options={subTypeOptions?.map((option: any) => option?.fee_sub_type_id)}
                            onChange={(event, value) => {
                              field.onChange(value)
                              handleOptions(event, value, 'psa_sub_type')
                            }}
                            renderOption={(props, option, { selected }) => {
                              const label = subTypeOptions?.find(opt => opt.fee_sub_type_id === option)

                              return (
                                <li {...props}>
                                  <Checkbox checked={selected} />
                                  {label?.fee_sub_type}
                                </li>
                              )
                            }}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label={<Box sx={{ display: 'flex', alignItems: 'center' }}>PSA Sub Type</Box>}
                                placeholder='PSA Sub Type'
                                error={!!errors.psa_sub_type}
                                helperText={errors.psa_sub_type ? errors.psa_sub_type.message : ''}
                                required
                              />
                            )}
                            renderTags={(value, getTagProps) => {
                              const displayLimit = 1 // Limit to show only first selected item
                              const displayItems = value.slice(0, displayLimit)
                              const moreItemsCount = value.length - displayLimit

                              return (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {displayItems.map((option, index) => (
                                    <Chip
                                      color='default'
                                      deleteIcon={<span className='icon-trailing-icon'></span>}
                                      variant='filled'
                                      label={option}
                                      {...getTagProps({ index })}
                                      key={index}
                                      style={{
                                        maxWidth: 'calc(100% - 6px)', // Ensuring chip fits within the input
                                        margin: '3px'
                                      }}
                                      sx={{
                                        width: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    />
                                  ))}
                                  {moreItemsCount > 0 && (
                                    <Tooltip
                                      title={
                                        <span style={{ whiteSpace: 'pre-line' }}>
                                          {value.slice(displayLimit).join('\n')}
                                        </span>
                                      }
                                    >
                                      <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                                    </Tooltip>
                                  )}
                                </div>
                              )
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      {categoryOptions && categoryOptions?.length ? (
                        <Controller
                          name='psa_category'
                          control={control}
                          rules={{ required: 'Please select at least one user' }}
                          render={({ field }) => (
                            <Autocomplete
                              {...field}
                              disabled={viewMode}
                              id='autocomplete-multiple-filled'
                              getOptionLabel={(option: any) => {
                                const label = categoryOptions?.find(opt => opt?.fee_category_id === option)

                                return label?.fee_category
                              }}
                              options={categoryOptions?.map((option: any) => option?.fee_category_id)}
                              onChange={(event, value) => {
                                field.onChange(value)
                                handleOptions(event, value, 'psa_category')
                              }}
                              renderOption={(props, option, { selected }) => {
                                const label = categoryOptions?.find(opt => opt?.fee_category_id === option)

                                return (
                                  <li {...props}>
                                    <Checkbox checked={selected} />
                                    {label?.fee_category}
                                  </li>
                                )
                              }}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  label={<Box sx={{ display: 'flex', alignItems: 'center' }}>PSA Category</Box>}
                                  placeholder='PSA Category'
                                  error={!!errors.psa_category}
                                  helperText={errors.psa_category ? errors.psa_category.message : ''}
                                  required
                                />
                              )}
                              renderTags={(value, getTagProps) => {
                                const displayLimit = 1 // Limit to show only first selected item
                                const displayItems = value.slice(0, displayLimit)
                                const moreItemsCount = value.length - displayLimit

                                return (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {displayItems.map((option, index) => (
                                      <Chip
                                        color='default'
                                        deleteIcon={<span className='icon-trailing-icon'></span>}
                                        variant='filled'
                                        label={option}
                                        {...getTagProps({ index })}
                                        key={index}
                                        style={{
                                          maxWidth: 'calc(100% - 6px)', // Ensuring chip fits within the input
                                          margin: '3px'
                                        }}
                                        sx={{
                                          width: '150px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      />
                                    ))}
                                    {moreItemsCount > 0 && (
                                      <Tooltip
                                        title={
                                          <span style={{ whiteSpace: 'pre-line' }}>
                                            {value.slice(displayLimit).join('\n')}
                                          </span>
                                        }
                                      >
                                        <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                                      </Tooltip>
                                    )}
                                  </div>
                                )
                              }}
                            />
                          )}
                        />
                      ) : null}
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      {subCategoryOptions && subCategoryOptions?.length ? (
                        <Controller
                          name='psa_sub_category'
                          control={control}
                          rules={{ required: 'Please select at least one user' }}
                          render={({ field }) => (
                            <Autocomplete
                              {...field}
                              disabled={viewMode}
                              id='autocomplete-multiple-filled'
                              getOptionLabel={(option: any) => {
                                const label = subCategoryOptions?.find(opt => opt?.fee_subcategory_id === option)

                                return label?.fee_subcategory
                              }}
                              options={subCategoryOptions?.map((option: any) => option.fee_subcategory_id)}
                              onChange={(event, value) => {
                                field.onChange(value)
                                handleOptions(event, value, 'psa_sub_category')
                              }}
                              renderOption={(props, option, { selected }) => {
                                const label = subCategoryOptions?.find(opt => opt?.fee_subcategory_id === option)

                                return (
                                  <li {...props}>
                                    <Checkbox checked={selected} />
                                    {label?.fee_subcategory}
                                  </li>
                                )
                              }}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  label={<Box sx={{ display: 'flex', alignItems: 'center' }}>PSA Sub Category</Box>}
                                  placeholder='PSA Sub Category'
                                  error={!!errors.psa_sub_category}
                                  helperText={errors.psa_sub_category ? errors.psa_sub_category.message : ''}
                                  required
                                />
                              )}
                              renderTags={(value, getTagProps) => {
                                const displayLimit = 1 // Limit to show only first selected item
                                const displayItems = value.slice(0, displayLimit)
                                const moreItemsCount = value.length - displayLimit

                                return (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {displayItems.map((option, index) => (
                                      <Chip
                                        color='default'
                                        deleteIcon={<span className='icon-trailing-icon'></span>}
                                        variant='filled'
                                        label={option}
                                        {...getTagProps({ index })}
                                        key={index}
                                        style={{
                                          maxWidth: 'calc(100% - 6px)', // Ensuring chip fits within the input
                                          margin: '3px'
                                        }}
                                        sx={{
                                          width: '150px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      />
                                    ))}
                                    {moreItemsCount > 0 && (
                                      <Tooltip
                                        title={
                                          <span style={{ whiteSpace: 'pre-line' }}>
                                            {value.slice(displayLimit).join('\n')}
                                          </span>
                                        }
                                      >
                                        <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                                      </Tooltip>
                                    )}
                                  </div>
                                )
                              }}
                            />
                          )}
                        />
                      ) : null}
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      {periodOfServiceOptions && periodOfServiceOptions?.length ? (
                        <Controller
                          name='period_of_service'
                          control={control}
                          rules={{ required: 'Please select at least one user' }}
                          render={({ field }) => (
                            <Autocomplete
                              {...field}
                              disabled={viewMode}
                              id='autocomplete-multiple-filled'
                              getOptionLabel={(option: any) => {
                                const label = periodOfServiceOptions?.find(opt => opt?.period_of_service_id === option)

                                return label?.period_of_service
                              }}
                              options={periodOfServiceOptions?.map((option: any) => option.period_of_service_id)}
                              onChange={(event, value) => {
                                field.onChange(value)
                                handleOptions(event, value, 'period_of_service')
                              }}
                              renderOption={(props, option, { selected }) => {
                                const label = periodOfServiceOptions?.find(opt => opt?.period_of_service_id === option)

                                return (
                                  <li {...props}>
                                    <Checkbox checked={selected} />
                                    {label?.period_of_service}
                                  </li>
                                )
                              }}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Period Of Service</Box>}
                                  placeholder='Period Of Service'
                                  error={!!errors.period_of_service}
                                  helperText={errors.period_of_service ? errors.period_of_service.message : ''}
                                  required
                                />
                              )}
                              renderTags={(value, getTagProps) => {
                                const displayLimit = 1 // Limit to show only first selected item
                                const displayItems = value.slice(0, displayLimit)
                                const moreItemsCount = value.length - displayLimit

                                return (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {displayItems.map((option, index) => (
                                      <Chip
                                        color='default'
                                        deleteIcon={<span className='icon-trailing-icon'></span>}
                                        variant='filled'
                                        label={option}
                                        {...getTagProps({ index })}
                                        key={index}
                                        style={{
                                          maxWidth: 'calc(100% - 6px)', // Ensuring chip fits within the input
                                          margin: '3px'
                                        }}
                                        sx={{
                                          width: '150px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      />
                                    ))}
                                    {moreItemsCount > 0 && (
                                      <Tooltip
                                        title={
                                          <span style={{ whiteSpace: 'pre-line' }}>
                                            {value.slice(displayLimit).join('\n')}
                                          </span>
                                        }
                                      >
                                        <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                                      </Tooltip>
                                    )}
                                  </div>
                                )
                              }}
                            />
                          )}
                        />
                      ) : null}
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      {psaBatchOptions && psaBatchOptions?.length ? (
                        <Controller
                          name='psa_batch'
                          control={control}
                          rules={{ required: 'Please select at least one user' }}
                          render={({ field }) => (
                            <Autocomplete
                              {...field}
                              disabled={viewMode}
                              id='autocomplete-multiple-filled'
                              getOptionLabel={(option: any) => {
                                const label = psaBatchOptions?.find(opt => opt?.batch_id === option)

                                return label?.batch_name
                              }}
                              options={psaBatchOptions?.map((option: any) => option.batch_id)}
                              onChange={(event, value) => {
                                field.onChange(value)
                                // handleSchoolCategories(event, value, "academic_year");
                              }}
                              renderOption={(props, option, { selected }) => {
                                const label = psaBatchOptions?.find(opt => opt?.batch_id === option)

                                return (
                                  <li {...props}>
                                    <Checkbox checked={selected} />
                                    {label?.batch_name}
                                  </li>
                                )
                              }}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  label={<Box sx={{ display: 'flex', alignItems: 'center' }}>PSA Batch</Box>}
                                  placeholder='PSA Batch'
                                  error={!!errors.psa_batch}
                                  helperText={errors.psa_batch ? errors.psa_batch.message : ''}
                                  required
                                />
                              )}
                              renderTags={(value, getTagProps) => {
                                const displayLimit = 1 // Limit to show only first selected item
                                const displayItems = value.slice(0, displayLimit)
                                const moreItemsCount = value.length - displayLimit

                                return (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {displayItems.map((option, index) => (
                                      <Chip
                                        color='default'
                                        deleteIcon={<span className='icon-trailing-icon'></span>}
                                        variant='filled'
                                        label={option}
                                        {...getTagProps({ index })}
                                        key={index}
                                        style={{
                                          maxWidth: 'calc(100% - 6px)', // Ensuring chip fits within the input
                                          margin: '3px'
                                        }}
                                        sx={{
                                          width: '150px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      />
                                    ))}
                                    {moreItemsCount > 0 && (
                                      <Tooltip
                                        title={
                                          <span style={{ whiteSpace: 'pre-line' }}>
                                            {value.slice(displayLimit).join('\n')}
                                          </span>
                                        }
                                      >
                                        <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                                      </Tooltip>
                                    )}
                                  </div>
                                )
                              }}
                            />
                          )}
                        />
                      ) : null}
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
                </form>
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

export default PSADialog
