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
import { getObjectByKeyVal, removeDuplicatesAndNullByKey } from 'src/utils/helper'
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
  kids_club_type: any
  period_of_service: number | null
  month: number | null
  from_cafeteria_opt_for: number | null
  batch_id: number | null
}

const defaultValues: FormValues = {
  batch_id: null,
  kids_club_type: null,
  period_of_service: null,
  month: null,
  from_cafeteria_opt_for: null
}

type SchoolTour = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
  setKidsClubDialog?: any
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

interface Option {
  id: number
  attributes: any
}

const KidsClubDialog = ({
  openDialog,
  handleClose,
  title,
  setKidsClubDialog,
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
  const [psaDetails, setPsaDetails] = useState<any>({})

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
  console.log('formDatVal>>', formDatVal)

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
        shift_id: enquiryDetails?.shift?.id || null,
        stream_id: enquiryDetails?.stream?.id,
        grade_id: enquiryDetails?.student_details.grade?.id,
        // school_id: enquiryDetails?.school_location?.id,
        school_parent_id: schoolParentId,
        batch_id: formDatVal?.batch_id,
        fee_type_id: FEETYPES?.kidsClubFees,
        fee_sub_type_id: formDatVal?.kids_club_type,
        fee_category_id: formDatVal?.month, //getObjectByKeyVal(psaDetails?.batches, 'batch_id', formDatVal?.batch_id)?.fee_category_id,
        fee_subcategory_id: formDatVal?.from_cafeteria_opt_for,
        period_of_service_id: formDatVal?.period_of_service
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

  const handleMinimize = () => {
    setMinimized(true)
  }

  const handleBook = () => {
    setIsBooked(true)
  }
  const [vasAmount, setVasAmount] = useState<number>(0)
  const [isFinalSubmit, setFinalSubmit] = useState<boolean>(false)
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()

  const onSubmit = async (data: FormValues) => {
    setGlobalState({ isLoading: true })
    const requestData: any = {}
    requestData.fee_sub_type_id = categoryOptions.find(
      (item: any) => item.fee_sub_type === data.kids_club_type
    )?.fee_sub_type_id
    requestData.batch_id = batchOptions.find((item: any) => item.batch_name === data.batch_id)?.batch_id
    requestData.period_of_service_id = periodOfServiceOptions.find(
      (item: any) => item.period_of_service === data.period_of_service
    )?.period_of_service_id

    if (isFinalSubmit) {
      let finalSubmitData = {}
      // finalSubmitData = {
      //   optedForKidsClub: true,
      //   kidsClubTypeId: formDatVal?.kids_club_type,
      //   kidsClubType: formDatVal?.kids_club_type, //'KidsClub',
      //   kidsClubPeriodOfService: formDatVal?.period_of_service,
      //   kidsClubMonth: formDatVal?.month,
      //   kidsclubCafeteriaOptFor: formDatVal?.from_cafeteria_opt_for,
      //   kidsClubBatch: formDatVal?.batch_id,
      //   kidsClubAmount: vasAmount
      // }

      finalSubmitData = {
        kids_club: {
          batch_id: formDatVal?.batch_id,
          fee_type_id: FEETYPES?.kidsClubFees,
          fee_sub_type_id: formDatVal?.kids_club_type,
          fee_category_id: formDatVal?.month, //getObjectByKeyVal(psaDetails?.batches, 'batch_id', formDatVal?.batch_id)?.fee_category_id,
          fee_subcategory_id: formDatVal?.from_cafeteria_opt_for,
          period_of_service_id: formDatVal?.period_of_service,
          amount: vasAmount
        }
      }
      const params4 = {
        url: `/marketing/admission/${enquiryID}/vas/add?type=KidsClub`,
        data: finalSubmitData
      }
      try {
        const data = await postRequest(params4)
        setKidsClubDialog(false)
        setViewMode(false)
        setRefresh(!refresh)
        // setPsaDetails(data?.data)
        // setCategoryOptions(data?.data?.feeCategory)
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
      //     board_id: 4,
      //     course_id: null,
      //     shift_id: null,
      //     stream_id: null,
      //     grade_id: 14,
      //     school_id: 26,
      //     batch_id: requestData?.batch_id,
      //     fee_type_id: 8,
      //     fee_sub_type_id: requestData?.fee_sub_type_id,
      //     fee_category_id: requestData?.fee_category_id,
      //     fee_subcategory_id: null,
      //     period_of_service_id: requestData?.period_of_service_id
      //   }
      // }
      // try {
      //   const data = await postRequest(params4)
      //   // setPsaDetails(data?.data);
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

  const [financialOptions, setFinancialOptions] = useState<Option[]>([])
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([])

  const [feeCategoryOptions, setFeeCategoryOptions] = useState<any[]>([])

  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])
  const [batchOptions, setBatchOptions] = useState<any[]>([])

  console.log('feeCategoryOptions', feeCategoryOptions)
  useEffect(() => {
    setGlobalState({ isLoading: true })
    const handleSearch = async () => {
      const params4 = {
        url: `/api/fc-fees-masters/kids-club-details`,
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
          // school_id: enquiryDetails?.school_location?.id
          school_parent_id: schoolParentId
        }
      }
      try {
        const data = await postRequest(params4)
        // setChild(data4?.data);
        setPsaDetails(data?.data)

        setCategoryOptions(data?.data?.feeSubType)
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

  useEffect(() => {
    if (details && psaDetails != undefined) {
      const value: any = [details?.fee_sub_type_id]
      const selectedIds = value?.map((val: any) => {
        const item: any = categoryOptions.find((item: any) => item.fee_sub_type_id === val)

        return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
      })
      console.log('selectedIds>>', selectedIds, value)
      const subcategoryOptionss = psaDetails?.batches?.filter((element: any) => {
        return selectedIds.includes(element.fee_sub_type_id)
      })
      //setBatchOptions(subcategoryOptions)
      setBatchOptions(removeDuplicatesAndNullByKey(subcategoryOptionss, 'batch_id'))
      const selectedIdsNew = [details?.batch_id]
      const subcategoryOptionsss = psaDetails?.periodOfService?.filter((element: any) => {
        return selectedIdsNew.includes(element.batch_id)
      })
      setPeriodOfServiceOptions(removeDuplicatesAndNullByKey(subcategoryOptionsss, 'period_of_service_id'))

      //

      const subTypeIds = [details?.fee_sub_type_id]
      const categoryOptionsNew = psaDetails?.feeCategory?.filter((element: any) => {
        return subTypeIds.includes(element.fee_sub_type_id)
      })
      // setFeeCategoryOptions(categoryOptionsNew)
      setFeeCategoryOptions(removeDuplicatesAndNullByKey(categoryOptionsNew, 'fee_category_id'))

      const feeSubCategoryOptionsNew = psaDetails?.feeSubCategory?.filter((element: any) => {
        return subTypeIds.includes(element.fee_sub_type_id)
      })
      setSubCategoryOptions(removeDuplicatesAndNullByKey(feeSubCategoryOptionsNew, 'fee_subcategory_id'))

      reset({
        batch_id: details?.batch_id,
        kids_club_type: details?.fee_sub_type_id,
        period_of_service: details?.period_of_service_id,
        month: details?.fee_category_id,
        from_cafeteria_opt_for: details?.fee_subcategory_id
      })
      setVasAmount(details?.amount)
    }
  }, [details, psaDetails])

  const handleOptions = async (event: any, value: any, name: any) => {
    // debugger;
    setFinalSubmit(false)
    if (name === 'kids_club_type') {
      if (value) {
        value = [value] //value?.split(',')
        console.log('selectedIds123>>', value)

        const selectedIds = value?.map((val: any) => {
          const item: any = categoryOptions.find((item: any) => item.fee_sub_type_id === val)

          return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
        })
        console.log('selectedIds>>', selectedIds, value)
        const subcategoryOptionss = psaDetails?.batches?.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        //setBatchOptions(subcategoryOptions)
        setBatchOptions(removeDuplicatesAndNullByKey(subcategoryOptionss, 'batch_id'))

        const categoryOptionsNew = psaDetails?.feeCategory?.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        // setFeeCategoryOptions(categoryOptionsNew)
        setFeeCategoryOptions(removeDuplicatesAndNullByKey(categoryOptionsNew, 'fee_category_id'))

        const feeSubCategoryOptionsNew = psaDetails?.feeSubCategory?.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        setSubCategoryOptions(removeDuplicatesAndNullByKey(feeSubCategoryOptionsNew, 'fee_subcategory_id'))

        // setSubCategoryOptions(feeSubCategoryOptionsNew)
      } else {
        setBatchOptions([])
      }
    }

    if (name === 'batch_id') {
      if (value) {
        value = [value] //value.split(',')
        const selectedIds = value?.map((val: any) => {
          const item: any = batchOptions.find((item: any) => item.batch_id === val)

          return item ? item.batch_id : undefined // Return item.id if found, otherwise undefined
        })
        const subcategoryOptionsss = psaDetails.periodOfService.filter((element: any) => {
          return selectedIds.includes(element.batch_id)
        })

        setPeriodOfServiceOptions(removeDuplicatesAndNullByKey(subcategoryOptionsss, 'period_of_service_id'))

        //setPeriodOfServiceOptions(subcategoryOptions)
      } else {
        setPeriodOfServiceOptions([])
      }
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
                      setKidsClubDialog(false)
                    }}
                  >
                    <HighlightOffIcon style={{ color: '#666666' }} />
                  </IconButton>
                </Box>
              </div>
            </Box>
            <div style={{ padding: '20px' }}>
              <Box>
                {psaDetails?.feeSubType && psaDetails?.feeSubType?.length ? (
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
                          name='kids_club_type'
                          control={control}
                          rules={{ required: 'Please select at least one user' }}
                          render={({ field }) => (
                            <Autocomplete
                              {...field}
                              disabled={viewMode}
                              id='autocomplete-multiple-filled'
                              getOptionLabel={(option: any) => {
                                console.log('option>>', option)
                                const label = categoryOptions.find(opt => opt.fee_sub_type_id === option)

                                return label?.fee_sub_type
                              }}
                              options={categoryOptions.map((option: any) => option.fee_sub_type_id)}
                              onChange={(event, value) => {
                                field.onChange(value)
                                handleOptions(event, value, 'kids_club_type')
                              }}
                              renderOption={(props, option, { selected }) => {
                                const label = categoryOptions.find(opt => opt.fee_sub_type_id === option)

                                return (
                                  <li {...props}>
                                    <Checkbox checked={selected} key={option?.fee_sub_type_id} />
                                    {label?.fee_sub_type}
                                  </li>
                                )
                              }}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Kids Club Type</Box>}
                                  placeholder='Kids Club Type'
                                  error={!!errors.kids_club_type}
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
                        {batchOptions && batchOptions?.length ? (
                          <Controller
                            name='batch_id'
                            control={control}
                            rules={{ required: 'Please select at least one user' }}
                            render={({ field }) => (
                              <Autocomplete
                                {...field}
                                disabled={viewMode}
                                id='autocomplete-multiple-filled'
                                getOptionLabel={(option: any) => {
                                  console.log('option>>', option)
                                  const label = batchOptions?.find(opt => opt.batch_id === option)

                                  return label?.batch_name
                                }}
                                options={batchOptions?.map((option: any) => option.batch_id)}
                                onChange={(event, value) => {
                                  field.onChange(value)
                                  handleOptions(event, value, 'batch_id')
                                }}
                                renderOption={(props, option, { selected }) => {
                                  const label = batchOptions?.find(opt => opt.batch_id === option)

                                  return (
                                    <li {...props} key={option?.batch_id}>
                                      <Checkbox checked={selected} />
                                      {label?.batch_name}
                                    </li>
                                  )
                                }}
                                renderInput={params => (
                                  <TextField
                                    {...params}
                                    label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Batch</Box>}
                                    placeholder='Batch'
                                    error={!!errors.batch_id}
                                    helperText={errors.batch_id ? errors.batch_id.message : ''}
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

                      {periodOfServiceOptions && periodOfServiceOptions?.length ? (
                        <Grid item xs={12} sm={12}>
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
                                  console.log('option>>', option)
                                  const label = periodOfServiceOptions?.find(opt => opt.period_of_service_id === option)

                                  return label?.period_of_service
                                }}
                                options={periodOfServiceOptions?.map((option: any) => option.period_of_service_id)}
                                onChange={(event, value) => {
                                  field.onChange(value)
                                  // handleSchoolCategories(event, value, "academic_year");
                                }}
                                renderOption={(props, option, { selected }) => {
                                  const label = periodOfServiceOptions?.find(opt => opt.period_of_service_id === option)

                                  return (
                                    <li {...props} key={option?.period_of_service_id}>
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
                      ) : null}

                      {feeCategoryOptions && feeCategoryOptions?.length ? (
                        <Grid item xs={12} sm={12}>
                          <Controller
                            name='month'
                            control={control}
                            rules={{ required: 'Please select at least one user' }}
                            render={({ field }) => (
                              <Autocomplete
                                {...field}
                                disabled={viewMode}
                                id='autocomplete-multiple-filled'
                                getOptionLabel={(option: any) => {
                                  console.log('option>>', option)
                                  const label = feeCategoryOptions?.find(opt => opt.fee_category_id === option)

                                  return label?.fee_category
                                }}
                                options={feeCategoryOptions?.map((option: any) => option.fee_category_id)}
                                onChange={(event, value) => {
                                  field.onChange(value)
                                  // handleSchoolCategories(event, value, "academic_year");
                                }}
                                renderOption={(props, option, { selected }) => {
                                  const label = feeCategoryOptions?.find(opt => opt.fee_category_id === option)

                                  return (
                                    <li {...props} key={option?.fee_category_id}>
                                      <Checkbox checked={selected} />
                                      {label?.fee_category}
                                    </li>
                                  )
                                }}
                                renderInput={params => (
                                  <TextField
                                    {...params}
                                    label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Time</Box>}
                                    placeholder='Time'
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
                      ) : null}

                      {subCategoryOptions && subCategoryOptions?.length ? (
                        <Grid item xs={12} sm={12}>
                          <Controller
                            name='from_cafeteria_opt_for'
                            control={control}
                            render={({ field }) => (
                              <Autocomplete
                                {...field}
                                disabled={viewMode}
                                id='autocomplete-multiple-filled'
                                getOptionLabel={(option: any) => {
                                  console.log('option>>', option)
                                  const label = subCategoryOptions?.find(opt => opt.fee_subcategory_id === option)

                                  return label?.fee_subcategory
                                }}
                                options={subCategoryOptions.map((option: any) => option.fee_subcategory_id)}
                                onChange={(event, value) => {
                                  field.onChange(value)
                                  // handleSchoolCategories(event, value, "academic_year");
                                }}
                                renderOption={(props, option, { selected }) => {
                                  const label = subCategoryOptions?.find(opt => opt.fee_subcategory_id === option)

                                  return (
                                    <li {...props} key={option?.fee_subcategory_id}>
                                      <Checkbox checked={selected} />
                                      {label?.fee_subcategory}
                                    </li>
                                  )
                                }}
                                renderInput={params => (
                                  <TextField
                                    {...params}
                                    label={
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>From Cafeteria Opt For</Box>
                                    }
                                    placeholder='From Cafeteria Opt For'
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
                      ) : null}
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: '15px' }}>
                      <Button
                        onClick={() => {
                          setKidsClubDialog(false)
                          setViewMode(false)
                        }}
                        sx={{ width: 'auto', mr: '5px ' }}
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

export default KidsClubDialog
