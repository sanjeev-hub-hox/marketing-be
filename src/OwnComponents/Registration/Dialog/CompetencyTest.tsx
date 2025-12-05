'use client'
import React, { useEffect, useState } from 'react'
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
  Radio
} from '@mui/material'

import MinimizeIcon from '@mui/icons-material/Minimize'
import AddIcon from '@mui/icons-material/Add'
import Grid from '@mui/material/Grid'
import CloseIcon from '@mui/icons-material/Close'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { display, margin, styled, width } from '@mui/system'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useForm, Controller } from 'react-hook-form'
import { getRequest, postRequest } from 'src/services/apiService'
import { convertDate, getObjectByKeyVal, convertDateDD, formatDateShort } from 'src/utils/helper'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

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
    color: '#4849DA !important',
    minWidth: '120px'
  },
  '&.MuiChip-colorDefault': {
    border: `1px solid ${theme.palette.grey[300]} !important`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 10px',
    background: `${theme.palette.common.white} !important`,
    color: `${theme.palette.customColors.mainText} `,
    minWidth: '120px'
  }
}))

type CompetencyTest = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
  setCompetencyTest?: any
  minimized?: boolean
  setMinimized?: any
  enquiryId?: any
  setCompetencyTestSuccess?: any
  enquiryDetails?: any
  setRefresh?: any
  refresh?: boolean
  setOpenErrorDialog?: any
  academic_year?: any
}

const CompetencyTest = ({
  openDialog,
  handleClose,
  title,
  setCompetencyTest,
  minimized,
  setMinimized,
  enquiryId,
  setCompetencyTestSuccess,
  enquiryDetails,
  setRefresh,
  refresh,
  setOpenErrorDialog,
  academic_year
}: CompetencyTest) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())
  const [comment, setComment] = useState<string>('Add Comment')
  const [visitTime, setVisitTime] = useState<string>('10:30 PM')
  const [reComment, setReComment] = useState<string>('Add Comment')
  const [reMark, setReMark] = useState<string>('Add Comment')
  const [isBooked, setIsBooked] = useState<boolean>(false)
  const [isBookedAgain, setIsBookedAgain] = useState<boolean>(false)
  const [isCancel, setIsCancel] = useState<boolean>(false)
  const [isStart, setIsStart] = useState<boolean>(true)
  const [isRescheduled, setIsRescheduled] = useState<boolean>(false)
  const [isBookVisit, setIsBookVisit] = useState<boolean>(false)
  const [reason, setReason] = useState<string>('Personal Reason')
  const [testData, setTestData] = useState<any>(null)

  const isCompetencyCrated = getObjectByKeyVal(enquiryDetails?.enquiry_stages, 'stage_name', 'Competency test')

  const [isRescheduledVisit, setIsRescheduledVisit] = useState<boolean>(false)
  const { setGlobalState } = useGlobalContext()
  const [slots, setSlots] = useState<any>(null)
  const [updateResult, setUpdateResult] = useState<boolean>(false)
  const [status, setStatus] = useState('Fail')

  interface CompetencyForm {
    competency_test_date: any
    competency_test_time: any
    mode: any
  }

  interface CompetencyCancelForm {
    cancel_reason?: any
    cancel_comment?: any
  }

  interface CompetencyRescheduleForm {
    competency_test_date: any
    competency_test_time: any
    mode: any
  }

  //reschedule Form
  const {
    handleSubmit: handleRescheduleSubmit,
    // formState: { cancel_errors },
    watch: rescheduleWatch,
    control: controlReschedule,
    reset
  } = useForm<CompetencyRescheduleForm>({
    defaultValues: {
      mode: 'Online'
    }
  })

  const getTestDetails = async () => {
    const params = {
      url: `marketing/competency-test/${enquiryId}`
    }
    const response = await getRequest(params)
    if (response.status) {
      setTestData(response?.data)
      //setSelectedDate(dayjs('2024-08-17').toDate())
      reset({
        competency_test_date: dayjs('2024-08-17')
      })
    }
  }

  useEffect(() => {
    if (isCompetencyCrated && isCompetencyCrated?.status == 'In Progress') {
      setIsBooked(true)
      setIsStart(false)
      getTestDetails()
    }
  }, [isCompetencyCrated])
  //book form
  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue
  } = useForm<CompetencyForm>({
    defaultValues: {
      mode: 'Online'
    }
  })
  const formDataVal = watch()

  useEffect(() => {
    if (enquiryId) {
      getSlots(selectedDate)
      setValue('competency_test_date', selectedDate)
    }
  }, [enquiryId])

  const getSlots = async (newDate: any) => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/competency-test/slots`,
      params: {
        enquiryId: enquiryId?.toString(),
        date: convertDateDD(newDate)?.toString()
      }
    }

    const response = await getRequest(params)
    if (response.status) {
      setSlots(response?.data)
    }
    setGlobalState({ isLoading: false })
  }

  //cancel Form
  const {
    handleSubmit: handleCancelSubmit,
    // formState: { cancel_errors },
    watch: cancelWatch,
    control: controlCancel
  } = useForm<CompetencyCancelForm>({})
  const cancelFormVals = cancelWatch()

  const rescheduleFormVals = rescheduleWatch()

  console.log('formDataVal', rescheduleFormVals)
  console.log('!!!isBooked -- START', !isBooked)
  console.log('!!!isBookVisit', isBookVisit)
  console.log('!!!isRescheduled', isRescheduled)
  console.log('!!isBookedAgain', isBookedAgain)
  console.log('!!!isCancel -- END', !isCancel)

  const getObjectKeyValSlug: any = (object: any, value: any) => {
    console.log(
      'objectwe',
      object,
      value,
      object.find((o: any) => o._id == value)
    )

    return object.find((o: any) => o._id == value)
  }

  const handleCanelTest = () => {
    setIsCancel(true)
    setIsBooked(false)
    setIsRescheduled(false)
    setIsStart(false)
    setUpdateResult(false)

    // setIsBookVisit(true)
  }
  const handleRescheduleTest = () => {
    setIsRescheduled(true)
    setIsCancel(false)
    setIsBooked(false)
    setIsStart(false)
    setUpdateResult(false)

    // setIsRescheduledVisit(true)
  }

  const handleBookVisit = () => {
    setIsCancel(true)
    setIsRescheduled(false)
    setIsBookVisit(false)
  }
  const handleMinimize = () => {
    setMinimized(true)
  }

  const handleBook = async () => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `marketing/competency-test/${enquiryId}/create`,
      data: {
        date: convertDateDD(formDataVal?.competency_test_date),
        slot_id: formDataVal?.competency_test_time,
        mode: formDataVal?.mode
      }
    }
    const response = await postRequest(params)
    if (response.status) {
      setIsBooked(true)
      setTestData(response.data)
      setCompetencyTestSuccess('Competency Test Booked Successfully')
      setRefresh(!refresh)
    } else {
      if (setOpenErrorDialog) {
        setOpenErrorDialog(true)
      }
    }
    setGlobalState({ isLoading: false })
  }

  const handleCancelTour = () => {
    setIsCancel(true)
    setIsBooked(false)
    setIsRescheduled(false)
  }

  const handleReason = (event: any) => {
    setReason(event.target.value as string)
  }
  const handleReschedule = () => {
    setIsRescheduled(true)
    setIsBooked(false)
  }
  const handleRescheduleCancel = () => {
    setIsRescheduled(false)
    setIsBooked(true)
  }

  const handleCancelBackButton = () => {
    setIsCancel(false)
    setIsRescheduled(false)
    setIsBooked(true)
  }
  const handleCancelClose = () => {
    setCompetencyTest(false)
    setIsBooked(false)
    setIsRescheduled(false)
    setIsCancel(false)
    setIsStart(false)
  }
  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      getSlots(newDate)
    }
    setSelectedDate(newDate)

    // Log the new date to the console
    console.log(newDate)
  }

  //   const handleStartTour = () => {
  //     // setIsStart(true)
  //     setIsBooked(false)
  //     setIsRescheduled(true)
  //     setIsCancel(false)
  //   }

  const handleIsUpdate = () => {
    setUpdateResult(true)
    setIsRescheduled(false)
    setIsCancel(false)
    setIsBooked(false)
    setIsStart(false)
  }

  // console.log(isCancel, 'Is Cancel')
  // console.log(isRescheduled, 'Is Reschedule')
  // console.log(isBooked, 'Is Booked')
  // console.log(isStart, 'Is Start')

  const handleCancel = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/competency-test/${enquiryId}/cancel`,
      data: {
        reason: cancelFormVals?.cancel_reason,
        comment: cancelFormVals?.cancel_comment
      }
    }

    const response = await postRequest(params)
    if (response.status && handleClose) {
      setCompetencyTestSuccess('Competency Test Cancelled')
      if (setRefresh) {
        setRefresh(!refresh)
      }
      handleClose()
    } else {
      if (setOpenErrorDialog) {
        setOpenErrorDialog(true)
      }
    }
    setGlobalState({ isLoading: false })
  }

  const handleRescheduleSubmitData = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/competency-test/${enquiryId}/reschedule/`,
      data: {
        date: convertDateDD(rescheduleFormVals?.competency_test_date),
        new_slot_id: rescheduleFormVals?.competency_test_time,
        mode: rescheduleFormVals?.mode
      }
    }

    const response = await postRequest(params)
    if (response.status && handleClose) {
      setCompetencyTestSuccess('Competency Test Reschedule')
      setRefresh(!refresh)
      handleClose()
    } else {
      if (setOpenErrorDialog) {
        setOpenErrorDialog(true)
      }
    }
    setGlobalState({ isLoading: false })
  }

  const handleSubmitResult = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/competency-test/${enquiryId}/update-test-result?result=${status}`,
      params: {}
    }

    const response = await postRequest(params)
    if (response.status && handleClose) {
      setCompetencyTestSuccess('Result Updated')
      handleClose()
      window.location.reload()
    }
    setGlobalState({ isLoading: false })
  }

  const disableWeekends = (date: any) => {
    const day = date.day()

    return day === 0 || day === 6 // 0 = Sunday, 6 = Saturday
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div>
        {openDialog && !minimized && (
          <Box
            sx={{
              position: 'fixed',
              bottom: '0',
              right: '0',
              width: '456px',
              height: '100vh',
              backgroundColor: 'white',
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
              overflowY: 'auto',
              borderRadius: '10px'
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
                    {isRescheduled
                      ? 'ReScheduled Compentency Test'
                      : isCancel
                      ? 'Cancel Compentency Test'
                      : isStart
                      ? title
                      : isBooked
                      ? 'View Competency Test'
                      : updateResult
                      ? 'Update Result'
                      : title}
                  </Typography>
                </Box>
                <Box>
                  <IconButton disableFocusRipple disableRipple onClick={handleMinimize}>
                    <span className='icon-minus'></span>
                  </IconButton>
                  <IconButton onClick={handleClose}>
                    <span className='icon-close-circle'></span>
                  </IconButton>
                </Box>
              </div>
            </Box>
            {/* TODO: hide  */}
            <div style={{ padding: '20px' }}>
              <Box>
                {isStart && (
                  <form onSubmit={handleSubmit(handleBook)} noValidate>
                    <Box>
                      <Box sx={{ mb: 5 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <Controller
                            name='competency_test_date'
                            control={control}
                            rules={{ required: 'Date is required' }}
                            render={({ field }) => (
                              <StaticDatePicker
                                {...field}
                                className='desktopDate'
                                value={selectedDate}
                                minDate={dayjs(new Date())}
                                onChange={newDate => {
                                  handleDateChange(newDate)
                                  field.onChange(newDate)
                                }}
                                maxDate={dayjs(`20${academic_year}-12-31`)}
                                shouldDisableDate={disableWeekends}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Box>
                      <Grid item container xs={12} style={{ marginTop: '20px' }}>
                        <Grid item xs={12}>
                          <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                            Choose Competency Test Mode
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 2 }}>
                          {/* <RadioGroup
                            row
                            aria-labelledby='demo-row-radio-buttons-group-label'
                            name='row-radio-buttons-group'
                          >
                            <FormControlLabel className='radio' value='Offline' control={<Radio />} label='Offline' />
                            <FormControlLabel
                              className='radio'
                              // sx={{ ml: 20 }}
                              value='Online'
                              control={<Radio />}
                              label='Online'
                            />
                          </RadioGroup> */}
                          <Controller
                            name='mode'
                            control={control}
                            render={({ field }) => (
                              <RadioGroup row aria-labelledby='demo-row-radio-buttons-group-label' {...field}>
                                <FormControlLabel
                                  className='radio'
                                  value='Offline'
                                  control={<Radio />}
                                  label='Offline'
                                />
                                <FormControlLabel className='radio' value='Online' control={<Radio />} label='Online' />
                              </RadioGroup>
                            )}
                          />
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 7, mb: 7 }}>
                        <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '21px' }}>
                          Select Time
                        </Typography>
                        <Box
                          sx={{
                            mt: 7,
                            mb: 7,
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                          }}
                        >
                          <Controller
                            name='competency_test_time'
                            control={control}
                            render={({ field }) => (
                              <>
                                {slots && slots?.length
                                  ? slots?.map((val: any, index: number) => {
                                      return (
                                        <StyledChipProps
                                          key={index}
                                          sx={{ ml: 2, mb: 4 }}
                                          label={val?.slot}
                                          onClick={() => {
                                            setVisitTime(val?._id)
                                            field.onChange(val?._id)
                                          }}
                                          color={visitTime === val?._id ? 'primary' : 'default'}
                                          variant='filled'
                                        />
                                      )
                                    })
                                  : null}
                              </>
                            )}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button
                          sx={{ width: 'auto', mr: 2 }}
                          variant='outlined'
                          color='inherit'
                          onClick={handleClose}
                          fullWidth
                        >
                          Cancel
                        </Button>

                        <Button
                          type='submit'
                          sx={{ width: 'auto' }}
                          variant='contained'
                          color='secondary'
                          fullWidth
                          disabled={!slots || slots.length === 0}
                        >
                          {!slots || slots.length === 0 ? 'No Slots Available' : 'Book now'}
                        </Button>
                      </Box>
                    </Box>
                  </form>
                )}

                {isBooked && (
                  <Box>
                    <Box sx={{ mb: 5 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Controller
                          name='competency_test_date'
                          control={control}
                          render={({ field }) => (
                            <StaticDatePicker
                              {...field}
                              className='desktopDate'
                              value={dayjs(convertDate(testData?.date))}
                              minDate={dayjs(new Date())}
                              // onChange={newDate => {
                              //   handleDateChange(newDate)
                              //   field.onChange(newDate)
                              // }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Box>
                    <Box sx={{ mt: 7, mb: 7 }}>
                      <Typography variant='caption' color={'customColors.text3'} sx={{ lineHeight: '14px' }}>
                        Mode
                      </Typography>
                      <Typography variant='subtitle1' sx={{ lineHeight: '24px', letterSpacing: '0.5px' }}>
                        {testData?.mode == 'Online' ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 7, mb: 7 }}>
                      <Typography variant='caption' color={'customColors.text3'} sx={{ lineHeight: '14px' }}>
                        Date
                      </Typography>
                      <Typography variant='subtitle1' sx={{ lineHeight: '24px', letterSpacing: '0.5px' }}>
                        {testData?.date ? formatDateShort(testData?.date) : null}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 7, mb: 7 }}>
                      <Typography variant='caption' color={'customColors.text3'} sx={{ lineHeight: '14px' }}>
                        Time
                      </Typography>
                      <Typography variant='subtitle1' sx={{ lineHeight: '24px', letterSpacing: '0.5px' }}>
                        {testData?.slot}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button
                        onClick={handleIsUpdate}
                        sx={{ width: 'auto', mr: 2 }}
                        variant='outlined'
                        color='inherit'
                        fullWidth
                      >
                        Update Result
                      </Button>

                      <Button
                        onClick={handleCanelTest}
                        sx={{ width: 'auto', mr: 2 }}
                        variant='outlined'
                        color='inherit'
                        fullWidth
                      >
                        Cancel Test
                      </Button>

                      <Button
                        onClick={handleRescheduleTest}
                        sx={{ width: 'auto' }}
                        variant='contained'
                        color='secondary'
                        fullWidth
                      >
                        Reschedule
                      </Button>
                    </Box>
                  </Box>
                )}
                {isRescheduled && (
                  <form onSubmit={handleRescheduleSubmit(handleRescheduleSubmitData)} noValidate>
                    <Box>
                      <Box sx={{ mb: 5 }}>
                        {selectedDate ? (
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                              name='competency_test_date'
                              control={controlReschedule}
                              rules={{ required: 'Date is required' }}
                              render={({ field }) => (
                                <StaticDatePicker
                                  {...field}
                                  className='desktopDate'
                                  value={selectedDate}
                                  minDate={dayjs()}
                                  shouldDisableDate={disableWeekends}
                                  onChange={newDate => {
                                    handleDateChange(newDate)
                                    field.onChange(newDate)
                                  }}
                                />
                              )}
                            />
                          </LocalizationProvider>
                        ) : null}
                      </Box>
                      <Grid item container xs={12} style={{ marginTop: '20px' }}>
                        <Grid item xs={12}>
                          <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                            Choose Mode
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 2 }}>
                          <Controller
                            name='mode'
                            control={controlReschedule}
                            render={({ field }) => (
                              <RadioGroup row aria-labelledby='demo-row-radio-buttons-group-label' {...field}>
                                <FormControlLabel
                                  className='radio'
                                  value='Offline'
                                  control={<Radio />}
                                  label='Offline'
                                />
                                <FormControlLabel className='radio' value='Online' control={<Radio />} label='Online' />
                              </RadioGroup>
                            )}
                          />
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 7, mb: 7 }}>
                        <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '21px' }}>
                          Select Time
                        </Typography>
                        <Box
                          sx={{
                            mt: 7,
                            mb: 7,
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                          }}
                        >
                          <Controller
                            name='competency_test_time'
                            control={controlReschedule}
                            render={({ field }) => (
                              <>
                                {slots && slots?.length
                                  ? slots?.map((val: any, index: number) => {
                                      return (
                                        <StyledChipProps
                                          key={index}
                                          sx={{ ml: 2, mb: 4 }}
                                          label={val?.slot}
                                          onClick={() => {
                                            setVisitTime(val?._id)
                                            field.onChange(val?._id)
                                          }}
                                          color={visitTime === val?._id ? 'primary' : 'default'}
                                          variant='filled'
                                        />
                                      )
                                    })
                                  : null}
                              </>
                            )}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button
                          onClick={handleClose}
                          sx={{ width: 'auto', mr: 2 }}
                          variant='outlined'
                          color='inherit'
                          fullWidth
                        >
                          Cancel
                        </Button>

                        <Button
                          type='submit'
                          sx={{ width: 'auto' }}
                          variant='contained'
                          color='secondary'
                          fullWidth
                          disabled={!slots || slots.length === 0}
                        >
                          Book Visit
                        </Button>
                      </Box>
                    </Box>
                  </form>
                )}

                {isCancel && (
                  <Box>
                    <form onSubmit={handleCancelSubmit(handleCancel)} noValidate>
                      <>
                        <Box>
                          <Box sx={{ mb: 5 }}>
                            <StaticDatePicker className='desktopDate' defaultValue={dayjs('2022-04-17')} />
                          </Box>
                          <Box sx={{ mt: 7, mb: 7 }}>
                            <Typography variant='caption' color={'customColors.text3'} sx={{ lineHeight: '14px' }}>
                              Mode
                            </Typography>
                            <Typography variant='subtitle1' sx={{ lineHeight: '24px', letterSpacing: '0.5px' }}>
                              {testData?.mode == 'Online' ? 'Online' : 'Offline'}
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 7, mb: 7 }}>
                            <Typography variant='caption' color={'customColors.text3'} sx={{ lineHeight: '14px' }}>
                              Date
                            </Typography>
                            <Typography variant='subtitle1' sx={{ lineHeight: '24px', letterSpacing: '0.5px' }}>
                              {testData?.date ? formatDateShort(testData?.date) : null}
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 7, mb: 7 }}>
                            <Typography variant='caption' color={'customColors.text3'} sx={{ lineHeight: '14px' }}>
                              Time
                            </Typography>
                            <Typography variant='subtitle1' sx={{ lineHeight: '24px', letterSpacing: '0.5px' }}>
                              {testData?.slot}
                            </Typography>
                          </Box>
                          <Box>
                            <Box sx={{ mb: 7 }}>
                              <FormControl fullWidth>
                                <InputLabel id='demo-simple-select-outlined-label'>Reason For Cancellation</InputLabel>
                                <Controller
                                  name='cancel_reason'
                                  control={controlCancel}
                                  rules={{ required: 'Date is required' }}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      IconComponent={DownArrow}
                                      label='Reason For Cancellation'
                                      id='demo-simple-select-outlined'
                                      labelId='demo-simple-select-outlined-label'
                                      // onChange={handleReason}
                                    >
                                      <MenuItem value=''>Select Reason</MenuItem>
                                      <MenuItem value='Personal Reason'>Personal Reason</MenuItem>
                                      <MenuItem value='Travelling'>Travelling</MenuItem>
                                      <MenuItem value='Not Required Anymore'>Not Required Anymore</MenuItem>
                                      <MenuItem value='Took Admission Somewhere Else'>
                                        Took Admission Somewhere Else
                                      </MenuItem>
                                    </Select>
                                  )}
                                />
                              </FormControl>
                            </Box>
                            <Box sx={{ mb: 7 }}>
                              <Controller
                                name='cancel_comment'
                                control={controlCancel}
                                rules={{ required: 'Date is required' }}
                                render={({ field }) => (
                                  <TextField {...field} fullWidth label='Comment' placeholder='Add Comment' />
                                )}
                              />
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Button
                            type='submit'
                            // onClick={handleCanelTest}
                            sx={{ width: 'auto', mr: 2 }}
                            variant='contained'
                            color='secondary'
                            fullWidth
                          >
                            Cancel Test
                          </Button>

                          {/* <Button
                            onClick={handleRescheduleTest}
                            sx={{ width: 'auto' }}
                            variant='contained'
                            color='secondary'
                            fullWidth
                          >
                            Reschedule Test
                          </Button> */}
                        </Box>
                      </>
                    </form>
                  </Box>
                )}

                {updateResult && (
                  <>
                    <Box sx={{ mt: 7, mb: 7 }}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Result</InputLabel>

                        <Select label={'Result'} value={status} onChange={e => setStatus(e.target.value)}>
                          <MenuItem value='Pass'>Pass</MenuItem>
                          <MenuItem value='Fail'>Fail</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button
                        onClick={handleClose}
                        sx={{ width: 'auto', mr: 2 }}
                        variant='outlined'
                        color='inherit'
                        fullWidth
                      >
                        Cancel
                      </Button>

                      <Button
                        onClick={handleSubmitResult}
                        type='submit'
                        sx={{ width: 'auto' }}
                        variant='contained'
                        color='secondary'
                        fullWidth
                      >
                        Update
                      </Button>
                    </Box>
                  </>
                )}

                {/* {isRescheduled && !isStart && !isCancel && !isBooked && (
                  <Box>
                    <Box sx={{ mt: 2, mb: 7 }}>
                      <Box>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <Controller
                            name='competency_test_date'
                            control={control}
                            rules={{ required: 'Date is required' }}
                            render={({ field }) => (
                              <StaticDatePicker
                                {...field}
                                className='desktopDate'
                                value={selectedDate}
                                minDate={dayjs()}
                                onChange={newDate => {
                                  handleDateChange(newDate)
                                  field.onChange(newDate)
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, mb: 7 }}>
                      <Box sx={{ mt: 3, mb: 5 }}>
                        <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px' }}>
                          Select Time
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          mt: 7,
                          mb: 7,
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}
                      >
                        <StyledChipProps
                          sx={{ ml: 2, mb: 4 }}
                          label='10:00 AM'
                          color={true ? 'primary' : 'default'}
                          variant='filled'
                        />
                        <StyledChipProps
                          sx={{ ml: 2, mb: 4 }}
                          label='11:00 AM'
                          color={false ? 'primary' : 'default'}
                          variant='filled'
                        />
                        <StyledChipProps
                          sx={{ ml: 2, mb: 4 }}
                          label='12:00 PM'
                          color={false ? 'primary' : 'default'}
                          variant='filled'
                        />
                        <StyledChipProps
                          sx={{ ml: 2, mb: 4 }}
                          label='01:00 PM'
                          color={false ? 'primary' : 'default'}
                          variant='filled'
                        />
                        <StyledChipProps
                          sx={{ ml: 2, mb: 4 }}
                          label='02:00 PM'
                          color={false ? 'primary' : 'default'}
                          variant='filled'
                        />
                      </Box>
                    </Box>
                    <Grid item container xs={12} style={{ marginTop: '20px' }}>
                      <Grid item xs={12}>
                        <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                          Change Mode
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <RadioGroup
                          row
                          aria-labelledby='demo-row-radio-buttons-group-label'
                          name='row-radio-buttons-group'
                        >
                          <FormControlLabel className='radio' value='Offline' control={<Radio />} label='Offline' />
                          <FormControlLabel
                            className='radio'
                            // sx={{ ml: 20 }}
                            value='Online'
                            control={<Radio />}
                            label='Online'
                          />
                        </RadioGroup>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {isStart && !isRescheduled && !isCancel && !isBooked && (
                  <Box>
                    <Box sx={{ mt: 2, mb: 5 }}>
                      <Box sx={{ mb: 7 }}>
                        <TextField
                          fullWidth
                          label='Comment'
                          value={reComment}
                          placeholder='Add Comment'
                          onChange={e => setReComment(e.target.value)}
                          defaultValue={reComment}
                          disabled
                        />
                      </Box>
                    </Box>
                  </Box>
                )} */}
                {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {!isCancel && !isBooked && !isRescheduledVisit ? (
                      <Button
                        sx={{ width: 'auto', mr: 2 }}
                        variant='outlined'
                        color='inherit'
                        onClick={handleClose}
                        fullWidth
                      >
                        Cancel
                      </Button>
                    ) : null}

                    {!isCancel && isBooked ? (
                      <Button sx={{ width: 'auto', mr: 2 }} variant='outlined' color='inherit' fullWidth>
                        View Result
                      </Button>
                    ) : null}

                    {isCancel || isBooked ? (
                      <Button
                        onClick={!isCancel ? handleCanelTest : handleCancelClose}
                        sx={{ width: 'auto', mr: 2 }}
                        variant='outlined'
                        color='inherit'
                        fullWidth
                      >
                        {isBookVisit ? 'Cancel' : 'Cancel Test'}
                      </Button>
                    ) : null}

                    {!isCancel || !isBooked || !isBookedAgain ? (
                      <Button
                        type='submit'
                        // onClick={
                        //   isBookVisit
                        //     ? handleBookVisit
                        //     : isCancel || isRescheduledVisit
                        //     ? handleRescheduleTest
                        //     : handleBook
                        // }
                        sx={{ width: 'auto' }}
                        variant='contained'
                        color='secondary'
                        fullWidth
                      >
                        {isRescheduled && isBookVisit
                          ? 'Book Visit'
                          : isBooked
                          ? 'Reschedule'
                          : isCancel
                          ? 'Reschedule Test'
                          : 'Book now'}
                      </Button>
                    ) : null}
                  </Box> */}
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
              {isRescheduled
                ? 'ReScheduled Compentency Test'
                : isCancel
                ? 'Cancel Compentency Test'
                : isStart
                ? title
                : isBooked
                ? 'View Competency Test'
                : updateResult
                ? 'Update Result'
                : title}
            </Typography>
            <IconButton onClick={() => setMinimized(false)}>
              <span className='icon-add'></span>
            </IconButton>
            <IconButton onClick={handleClose}>
              <span className='icon-close-circle'></span>
            </IconButton>
          </Box>
        )}
      </div>
    </LocalizationProvider>
  )
}

export default CompetencyTest
