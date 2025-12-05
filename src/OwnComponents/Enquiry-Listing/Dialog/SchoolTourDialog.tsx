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
import MinimizeIcon from '@mui/icons-material/Minimize'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { display, margin, styled, width } from '@mui/system'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { getRequest, postRequest, putRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { useForm, Controller } from 'react-hook-form'
import style from '../../../pages/enquiry-types/enquiryTypes.module.css'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { useRouter } from 'next/navigation'
import { convertDate, formatDateShort } from 'src/utils/helper'
import { Console } from 'console'

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

type SchoolTour = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
  setSchoolTourDialog?: any
  minimized?: boolean
  setMinimized?: any
  enquiryId?: any
  mode?: any
}
interface SlotTiming {
  _id: string
  slot_for: string
  slot: string
  day: string
  school_id: number
}
const SchoolTourDialog = ({
  openDialog,
  handleClose,
  title,
  setSchoolTourDialog,
  minimized,
  setMinimized,
  enquiryId,
  mode
}: SchoolTour) => {
  interface schoolTourForm {
    comment: string
    visitTime: string
    visitDate: Dayjs | null | Date
  }

  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
    setValue,
    trigger,
    getValues
  } = useForm<schoolTourForm>({
    defaultValues: {
      visitDate: dayjs().toDate() // Initialize visitDate with the current date
    }
  })
  const formDataVal = watch()

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())
  const [comment, setComment] = useState<string>('')
  const [visitTime, setVisitTime] = useState<string>('')

  const [reMark, setReMark] = useState<string>('Add Comment')
  const [isBooked, setIsBooked] = useState<boolean>(false)
  const [isBookedAgain, setIsBookedAgain] = useState<boolean>(false)
  const [isCancel, setIsCancel] = useState<boolean>(false)
  const [isStart, setIsStart] = useState<boolean>(false)
  const [isRescheduled, setIsRescheduled] = useState<boolean>(false)
  const { setGlobalState } = useGlobalContext()
  const [loadingCount, setLoadingCount] = useState(0)
  const incrementLoading = () => setLoadingCount(count => count + 1)
  const decrementLoading = () => setLoadingCount(count => count - 1)
  const [schooltourSuccessDialog, setschooltourSuccessDialog] = useState<boolean>(false)
  const [slotTiming, setSlotTiming] = useState<SlotTiming[]>([])

  // State variables for API data
  const [apiVisitDate, setApiVisitDate] = useState<any>(dayjs())
  const [apiVisitTime, setApiVisitTime] = useState('')
  const [apiComment, setApiComment] = useState('')

  //cancel tour
  const [reason, setReason] = useState<string>('Personal Reason')
  const [reComment, setReComment] = useState<string>('')

  const [options, setOptions] = useState<string[]>([])
  const [activities, setActivities] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    setGlobalState({ isLoading: loadingCount > 0 })
    handleView()
    const formattedDate = dayjs(apiVisitDate).format('DD-MM-YYYY')
    console.log('Formatted date:', formattedDate)
    slotVisitApi(formattedDate)
  }, [loadingCount, enquiryId, apiVisitDate])

  const handleMinimize = () => {
    setMinimized(true)
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = event.target

    if (checked) {
      // Add the value to the activities array
      setActivities(prevActivities => [...prevActivities, value])
    } else {
      // Remove the value from the activities array
      setActivities(prevActivities => prevActivities.filter(activity => activity !== value))
    }
  }

  const handleCancel = () => {
    // Logic for Cancel button
    console.log('Cancel button clicked')
    setIsBooked(true)
    setIsRescheduled(false)
    setIsCancel(false)
    setIsStart(false)
  }

  const optionForSubmition = async () => {
    try {
      // Set loading state to true
      setGlobalState({
        isLoading: true
      })

      // Define parameters for the API request
      const params = {
        url: `/api/co-checklists?filters[parent_id]=1`,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        }
      }

      // Make the API request

      const responseData = await getRequest(params)
      // Set loading state to false
      setGlobalState({
        isLoading: false
      })
      // Check if the response contains data
      if (responseData?.data) {
        // Update the state based on the response
        setOptions(responseData?.data)
        // Set state with API data
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error fetching data:', error)
    }
  }

  const SubmitApi = async () => {
    try {
      // Set loading state to true
      setGlobalState({
        isLoading: true
      })

      const payloadData = {
        activities: activities,
        comment: reComment
      }

      // Define parameters for the API request
      const params = {
        url: `marketing/school-visit/${enquiryId}/complete`,
        serviceURL: 'marketing',
        data: payloadData
      }

      // Make the API request

      const responseData = await postRequest(params)
      // Set loading state to false
      setGlobalState({
        isLoading: false
      })

      // Check if the response contains data
      if (responseData?.data) {
        // Update the state based on the response
        setIsBooked(true)
        setIsRescheduled(false)
        setIsCancel(false)
        setIsStart(false)
        //setSchoolTourDialog(false)
        setschooltourSuccessDialog(true)
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error fetching data:', error)
    }
  }

  const slotVisitApi = async (date: any) => {
    // Set loading state to true
    setGlobalState({
      isLoading: true
    })

    // Define the parameters for the API request

    const params = {
      url: `marketing/school-visit/slots?enquiryId=${enquiryId}&date=${date}`, // Replace slotId with the appropriate variable
      serviceURL: 'marketing'
    }

    try {
      // Make the API request
      const responseData = await getRequest(params)
      console.log('Slot Visit Response:', responseData.data)

      // Handle the API response
      if (responseData?.data) {
        setGlobalState({
          isLoading: false
        })
        setSlotTiming(responseData.data)
      } else {
        setGlobalState({
          isLoading: false
        })
      }
    } catch (error) {
      console.error('Error in slotVisitApi:', error)
      setGlobalState({
        isLoading: false
      })
    }
  }
  const RescheduleApi = async () => {
    const payloadData = {
      date: formDataVal.visitDate ? dayjs(formDataVal.visitDate).format('DD-MM-YYYY') : '',
      new_slot_id: formDataVal.visitTime,
      comment: formDataVal.comment
    }

    setGlobalState({ isLoading: true })

    try {
      // Configure the API request
      const params = {
        url: `marketing/school-visit/${enquiryId}/reschedule`,
        serviceURL: 'marketing',
        data: payloadData
      }

      // Make the API request
      const responseData = await postRequest(params)

      console.log('create res=================>', responseData)

      // Check if response data is valid and perform necessary actions
      if (responseData?.data) {
        setGlobalState({ isLoading: false })
        setschooltourSuccessDialog(true)
        handleView()
      } else {
        setGlobalState({ isLoading: false })
        // Handle unexpected responses
      }
    } catch (error) {
      console.error('API request failed:', error)
      setGlobalState({ isLoading: false })
      // Handle error state or show error message to user
    }
  }

  const CancelTourApi = async () => {
    try {
      // Set loading state to true
      setGlobalState({
        isLoading: true
      })

      const payloadData = {
        reason: reason,
        comment: reComment
      }

      // Define parameters for the API request
      const params = {
        url: `marketing/school-visit/${enquiryId}/cancel`,
        serviceURL: 'marketing',
        data: payloadData
      }

      // Make the API request

      const responseData = await postRequest(params)
      // Set loading state to false
      setGlobalState({
        isLoading: false
      })

      // Check if the response contains data
      if (responseData?.data) {
        // Update the state based on the response
        setIsBooked(true)
        setIsRescheduled(false)
        setIsCancel(false)
        setIsStart(false)
        setSchoolTourDialog(false)
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error fetching data:', error)
    }
  }

  const handleView = async () => {
    try {
      // Set loading state to true
      setGlobalState({
        isLoading: true
      })

      // Define parameters for the API request
      const params = {
        url: `marketing/school-visit/${enquiryId}`,
        serviceURL: 'marketing'
      }

      // Make the API request

      const responseData = await getRequest(params)
      // Set loading state to false
      setGlobalState({
        isLoading: false
      })

      // Check if the response contains data
      if (responseData?.data) {
        // Update the state based on the response
        const { date, slot, comment } = responseData.data
        // Set state with API data
        setApiVisitDate(date) // Assuming date is in ISO format
        setApiVisitTime(slot) // Slot time as a string
        setApiComment(comment || '') // Comment might be null

        setIsBooked(true)
        setIsRescheduled(false)
        setIsCancel(false)
        setIsStart(false)
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error fetching data:', error)
    }
  }

  const handleBook = async () => {
    const payloadData = {
      date: formDataVal.visitDate ? dayjs(formDataVal.visitDate).format('DD-MM-YYYY') : '',
      slot_id: formDataVal.visitTime,
      comment: formDataVal.comment
    }
    // Set loading state before making the request
    setGlobalState({ isLoading: true })

    try {
      // Configure the API request
      const params = {
        url: `marketing/school-visit/${enquiryId}/schedule`,
        serviceURL: 'marketing',
        data: payloadData
      }

      // Make the API request
      const responseData = await postRequest(params)

      console.log('create res=================>', responseData)

      // Check if response data is valid and perform necessary actions
      if (responseData?.data) {
        setGlobalState({ isLoading: false })
        setschooltourSuccessDialog(true)
        //setSchoolTourDialog(false)
        handleView()
      } else {
        setGlobalState({ isLoading: false })
        // Handle unexpected responses
      }
    } catch (error) {
      console.error('API request failed:', error)
      setGlobalState({ isLoading: false })
      // Handle error state or show error message to user
    }
  }

  const handleSchoolTourSuccessClose = () => {
    setschooltourSuccessDialog(false)
    setIsRescheduled(false)
    setIsCancel(false)
    setIsStart(false)
    router.refresh()
    if (!mode) {
      window.location.reload()

      // router.push('/enquiries/view/' + enquiryId)
    }
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
    setSchoolTourDialog(false)
    setIsBooked(false)
    setIsRescheduled(false)
    setIsCancel(false)
    setIsStart(false)
  }

  const handleStartTour = () => {
    optionForSubmition()
    setIsStart(true)
    setIsBooked(false)
    setIsRescheduled(false)
    setIsCancel(false)
  }

  const handleDateChange = (newDate: Dayjs | Date | null) => {
    //setSelectedDate(newDate)
    //setApiVisitDate(newDate)
    const date = dayjs(newDate).format('DD-MM-YYYY')
    slotVisitApi(date)
    console.log('Selected Date:', newDate)
  }

  console.log(isCancel, 'Is Cancel')
  console.log(isRescheduled, 'Is Reschedule')
  console.log(isBooked, 'Is Booked')
  console.log(isStart, 'Is Start')

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div>
        {openDialog && !minimized && (
          <Box
            sx={{
              position: 'fixed',
              bottom: '0',
              right: '0',
              width: '450px',
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
                      ? 'Re-Scheduled School Tour'
                      : isCancel
                      ? 'Cancel Tour'
                      : isStart
                      ? 'On-Going School Tour'
                      : isBooked
                      ? 'View School Tour'
                      : title}
                  </Typography>
                </Box>
                <Box>
                  <IconButton disableFocusRipple disableRipple onClick={handleMinimize}>
                    <span className='icon-minus'></span>
                  </IconButton>
                  <IconButton onClick={() => handleCancelClose()}>
                    <span className='icon-trailing-icon'></span>
                  </IconButton>
                </Box>
              </div>
            </Box>
            <div style={{ padding: '20px' }}>
              <Box>
                {!isBooked && !isCancel && !isRescheduled && !isStart && (
                  <>
                    <form onSubmit={handleSubmit(handleBook)} noValidate>
                      <Box>
                        <Box sx={{ mb: 5 }}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                              name='visitDate'
                              control={control}
                              rules={{ required: 'Visit Date is required' }}
                              render={({ field }) => (
                                <StaticDatePicker
                                  {...field}
                                  className='desktopDate'
                                  value={dayjs(convertDate(dayjs().toDate()))}
                                  // value={field.value || dayjs().toDate()} // Ensure the value is set
                                  minDate={dayjs(new Date())} // Restrict selection to current date and future dates
                                  onChange={newDate => {
                                    console.log('newDate ===========>', newDate)
                                    handleDateChange(newDate)
                                    field.onChange(newDate)
                                  }}
                                />
                              )}
                            />
                          </LocalizationProvider>

                          {/* //sh */}
                          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Controller
                          name='competency_test_date'
                          control={control}
                          render={({ field }) => (
                            <StaticDatePicker
                              {...field}
                              className='desktopDate'
                              value={dayjs(convertDate(testData?.date))} //your state value
                              minDate={dayjs(new Date())}
                             
                            />
                          )}
                        />
                      </LocalizationProvider> */}
                          <FormControl>
                            {errors?.visitDate?.message && (
                              <span className={style.errorField}>{`${errors?.visitDate?.message}`}</span>
                            )}
                          </FormControl>
                        </Box>
                        {/* time slot  */}
                        <Controller
                          name='visitTime'
                          control={control}
                          rules={{ required: 'Visit time is required' }}
                          defaultValue={slotTiming[0]?._id || ''}
                          render={({ field }) => (
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
                              {slotTiming.map((item, index) => (
                                <StyledChipProps
                                  key={item._id} // Use the unique _id as the key
                                  sx={{ ml: 2, mb: 4 }}
                                  label={item.slot}
                                  onClick={() => {
                                    setVisitTime(item._id)
                                    field.onChange(item._id)
                                  }}
                                  color={visitTime === item._id ? 'primary' : 'default'}
                                  variant='outlined'
                                />
                              ))}
                            </Box>
                          )}
                        />
                        <FormControl>
                          {!errors?.visitDate
                            ? errors?.visitTime?.message && (
                                <span className={style.errorField}>{`${errors?.visitTime?.message}`}</span>
                              )
                            : null}
                        </FormControl>

                        <Box
                          sx={{
                            mt: 7,
                            mb: 7
                          }}
                        >
                          <Controller
                            name='comment' // Specify the name for the form control
                            control={control}
                            defaultValue=''
                            rules={{ required: 'Comment  is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label='Comment'
                                placeholder='Add Comment'
                                error={!!error}
                                helperText={error ? error.message : ''}
                                required
                              />
                            )}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {!isBooked || isCancel ? (
                          <Button
                            sx={{ width: 'auto', mr: 2 }}
                            variant='outlined'
                            color='inherit'
                            onClick={
                              isRescheduled ? handleRescheduleCancel : isCancel ? handleCancelBackButton : handleClose
                            }
                            fullWidth
                          >
                            {isCancel ? 'Back' : 'Cancel'}
                          </Button>
                        ) : null}
                        {isBooked && !isCancel ? (
                          <Button
                            onClick={handleCancelTour}
                            sx={{ width: 'auto', mr: 2 }}
                            variant='outlined'
                            color='inherit'
                            fullWidth
                          >
                            Cancel Tour
                          </Button>
                        ) : null}
                        {isBooked && !isCancel && !isStart ? (
                          <Button
                            onClick={handleReschedule}
                            size='large'
                            variant='contained'
                            color='inherit'
                            sx={{ mr: 2, width: 'auto' }}
                          >
                            Reschedule
                          </Button>
                        ) : null}

                        <Button type='submit' sx={{ width: 'auto' }} variant='contained' color='secondary' fullWidth>
                          {isBooked && !isCancel
                            ? 'Start Tour'
                            : isCancel
                            ? 'Cancel Tour'
                            : isStart
                            ? 'Submit'
                            : 'Book Tour'}
                        </Button>
                      </Box>
                    </form>
                  </>
                )}
                {isBooked && !isStart && !isCancel && !isRescheduled && (
                  <Box>
                    <Box sx={{ mb: 5 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Controller
                          name='visitDate'
                          control={control}
                          render={({ field }) => (
                            <StaticDatePicker
                              {...field}
                              className='desktopDate'
                              value={dayjs(convertDate(apiVisitDate))} //your state value
                              minDate={dayjs(new Date())}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Box>

                    <Box sx={{ mt: 7, mb: 7 }}>
                      <Typography variant='caption' color={'customColors.text3'} sx={{ lineHeight: '14px' }}>
                        Visit Date
                      </Typography>
                      <Typography
                        variant='subtitle1'
                        color={'customColors.text3'}
                        sx={{ lineHeight: '24px', letterSpacing: '0.5px' }}
                      >
                        {formatDateShort(apiVisitDate)}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 7, mb: 7 }}>
                      <Typography variant='caption' color={'customColors.text3'} sx={{ lineHeight: '14px' }}>
                        Visit Time
                      </Typography>
                      <Typography
                        variant='subtitle1'
                        color={'customColors.text3'}
                        sx={{ lineHeight: '24px', letterSpacing: '0.5px' }}
                      >
                        {apiVisitTime}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: 7,
                        mb: 7
                      }}
                    >
                      <TextField
                        fullWidth
                        label='Comment'
                        value={apiComment} // Set value from the API
                        placeholder='Add Comment'
                        disabled // Disable editing
                      />
                    </Box>

                    {/* Buttons Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                      {/* Conditional rendering of Cancel Tour button */}
                      {isBooked && !isCancel && (
                        <Button
                          onClick={handleCancelTour}
                          sx={{ width: 'auto' }}
                          variant='outlined'
                          color='inherit'
                          fullWidth
                        >
                          Cancel Tour
                        </Button>
                      )}

                      {/* Conditional rendering of Reschedule button */}
                      {isBooked && !isCancel && !isStart && (
                        <Button
                          onClick={handleReschedule}
                          size='large'
                          variant='contained'
                          color='inherit'
                          sx={{ width: 'auto' }}
                        >
                          Reschedule
                        </Button>
                      )}

                      {/* Conditional rendering of Start Tour button */}
                      {isBooked && !isCancel && !isStart && (
                        <Button
                          onClick={handleStartTour}
                          size='large'
                          variant='contained'
                          color='secondary'
                          sx={{ width: 'auto' }}
                        >
                          Start Tour
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}

                {isCancel && !isStart && !isBooked && !isRescheduled && (
                  <Box>
                    <Box sx={{ mb: 7 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          sx={{ width: '100%' }}
                          slots={{
                            openPickerIcon: CalendarIcon
                          }}
                          defaultValue={dayjs(convertDate(apiVisitDate))}
                          format='DD/MM/YYYY'
                          label='Visit Date'
                          disabled
                        />
                      </LocalizationProvider>
                    </Box>
                    <Box sx={{ mb: 7 }}>
                      <TextField
                        fullWidth
                        label='Visit Time'
                        value={apiVisitTime}
                        placeholder='Visit Time'
                        //  onChange={e => setVisitTime(e.target.value)}
                        //  defaultValue={}
                        disabled
                      />
                    </Box>

                    <Box sx={{ mb: 7 }}>
                      <TextField
                        fullWidth
                        label='Last Remark'
                        value={apiComment}
                        placeholder='Last Remark'
                        //onChange={e => setReMark(e.target.value)}
                        //defaultValue={}
                        disabled
                      />
                    </Box>
                    <Box sx={{ mb: 7 }}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Reason For Cancellation</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Reason For Cancellation'
                          defaultValue={reason}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleReason}
                        >
                          <MenuItem value=''>Select Reason</MenuItem>
                          <MenuItem value='Personal Reason'>Personal Reason</MenuItem>
                          <MenuItem value='Travelling'>Travelling</MenuItem>
                          <MenuItem value='Not Required Anymore'>Not Required Anymore</MenuItem>
                          <MenuItem value='Took Admission Somewhere Else'>Took Admission Somewhere Else</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ mb: 7 }}>
                      <TextField
                        fullWidth
                        label='Comment'
                        value={reComment}
                        placeholder='Add Comment'
                        onChange={e => setReComment(e.target.value)}
                        // defaultValue={reComment}
                      />
                    </Box>

                    {/* Back and Cancel Tour Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        onClick={handleCancelBackButton}
                        sx={{ width: 'auto' }}
                        variant='outlined'
                        color='inherit'
                        fullWidth
                      >
                        Back
                      </Button>

                      <Button
                        onClick={CancelTourApi}
                        sx={{ width: 'auto' }}
                        variant='contained'
                        color='secondary'
                        fullWidth
                      >
                        Cancel Tour
                      </Button>
                    </Box>
                  </Box>
                )}

                {isRescheduled && !isStart && !isCancel && !isBooked && (
                  <Box>
                    <Box sx={{ mt: 2, mb: 5 }}>
                      <Box sx={{ mb: 7 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            sx={{ width: '100%' }}
                            slots={{
                              openPickerIcon: CalendarIcon
                            }}
                            value={dayjs(convertDate(apiVisitDate))}
                            //value={dayjs(convertDate(apiVisitDate))}
                            format='DD/MM/YYYY'
                            label='Visit Date'
                            disabled
                          />
                        </LocalizationProvider>
                      </Box>
                      <Box sx={{ mb: 7 }}>
                        <TextField
                          fullWidth
                          label='Visit Time'
                          value={apiVisitTime}
                          placeholder='Visit Time'
                          disabled
                        />
                      </Box>

                      <Box sx={{ mb: 7 }}>
                        <TextField fullWidth label='Comment' value={apiComment} placeholder='Add Comment' disabled />
                      </Box>
                      <Box>
                        <Divider />
                      </Box>
                    </Box>

                    {/* Reschedule Form */}
                    <form onSubmit={handleSubmit(RescheduleApi)} noValidate>
                      <Box sx={{ mt: 2, mb: 7 }}>
                        <Box sx={{ mt: 3, mb: 5 }}>
                          <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px' }}>
                            Change Date
                          </Typography>
                        </Box>
                        <Box>
                          <Box sx={{ mb: 5 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <Controller
                                name='visitDate'
                                control={control}
                                rules={{ required: 'Visit Date is required' }}
                                render={({ field }) => (
                                  <StaticDatePicker
                                    {...field}
                                    className='desktopDate'
                                    value={selectedDate}
                                    defaultValue={dayjs()} // Initialize with the dynamic current date
                                    minDate={dayjs()} // Restrict selection to current date and future dates
                                    onChange={newDate => {
                                      console.log('newDate ===========>', newDate)
                                      handleDateChange(newDate)
                                      field.onChange(newDate)
                                    }}
                                  />
                                )}
                              />
                            </LocalizationProvider>

                            <FormControl>
                              {errors?.visitDate?.message && (
                                <span className={style.errorField}>{`${errors?.visitDate?.message}`}</span>
                              )}
                            </FormControl>
                          </Box>
                        </Box>
                      </Box>

                      {/* time slot  */}
                      <Controller
                        name='visitTime'
                        control={control}
                        rules={{ required: 'Visit time is required' }}
                        defaultValue={''}
                        render={({ field }) => (
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
                            {slotTiming.map((item, index) => (
                              <StyledChipProps
                                key={item._id} // Use the unique _id as the key
                                sx={{ ml: 2, mb: 4 }}
                                label={item.slot}
                                onClick={() => {
                                  setVisitTime(item._id)
                                  field.onChange(item._id)
                                }}
                                color={visitTime === item._id ? 'primary' : 'default'}
                                variant='filled'
                              />
                            ))}
                          </Box>
                        )}
                      />
                      <FormControl>
                        {!errors?.visitDate
                          ? errors?.visitTime?.message && (
                              <span className={style.errorField}>{`${errors?.visitTime?.message}`}</span>
                            )
                          : null}
                      </FormControl>

                      <Box
                        sx={{
                          mt: 7,
                          mb: 7
                        }}
                      >
                        <Controller
                          name='comment' // Specify the name for the form control
                          control={control}
                          defaultValue=''
                          rules={{ required: 'Comment  is required' }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label='Comment'
                              placeholder='Add Comment'
                              error={!!error}
                              helperText={error ? error.message : ''}
                              required
                            />
                          )}
                        />
                      </Box>

                      {/* Cancel and Book Tour Buttons */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          onClick={handleCancel}
                          sx={{ width: 'auto' }}
                          variant='outlined'
                          color='inherit'
                          fullWidth
                        >
                          Cancel
                        </Button>

                        <Button type='submit' sx={{ width: 'auto' }} variant='contained' color='secondary' fullWidth>
                          Book Tour
                        </Button>
                      </Box>
                    </form>
                  </Box>
                )}

                {isStart && !isRescheduled && !isCancel && !isBooked && (
                  <Box>
                    <Box sx={{ mt: 2, mb: 5 }}>
                      <Box sx={{ mb: 7 }}>
                        <FormGroup>
                          {options.map((option: any) => (
                            <FormControlLabel
                              key={option.id}
                              control={
                                <Checkbox
                                  value={option.attributes.name}
                                  onChange={handleCheckboxChange}
                                  checked={activities.includes(option.attributes?.name)}
                                />
                              }
                              label={option?.attributes.name}
                            />
                          ))}
                        </FormGroup>
                      </Box>
                      <Box sx={{ mb: 7 }}>
                        <TextField
                          fullWidth
                          label='Comment'
                          value={reComment}
                          placeholder='Add Comment'
                          onChange={e => setReComment(e.target.value)}
                          defaultValue={reComment}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                      {/* Cancel button */}
                      <Button
                        onClick={handleCancel}
                        sx={{ width: 'auto' }}
                        variant='outlined'
                        color='inherit'
                        fullWidth
                      >
                        Cancel
                      </Button>

                      {/* Save button */}
                      {/* <Button onClick={handleSave} sx={{ width: 'auto' }} variant='contained' color='primary' fullWidth>
                        Save
                      </Button> */}

                      {/* Submit button */}
                      <Button
                        onClick={SubmitApi}
                        sx={{ width: 'auto' }}
                        variant='contained'
                        color='secondary'
                        fullWidth
                      >
                        Submit
                      </Button>
                    </Box>
                  </Box>
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
              {isRescheduled
                ? 'ReScheduled School Tour'
                : isCancel
                ? 'Cancel Tour'
                : isStart
                ? 'On-Going School Tour'
                : title}
            </Typography>
            <IconButton onClick={() => setMinimized(false)}>
              <span className='icon-add'></span>
            </IconButton>

            <IconButton onClick={() => handleCancelClose()}>
              <span className='icon-trailing-icon'></span>
            </IconButton>
          </Box>
        )}

        {schooltourSuccessDialog && (
          <SuccessDialog
            openDialog={schooltourSuccessDialog}
            title='School Tour Has been Registered Successfully'
            handleClose={handleSchoolTourSuccessClose}
          />
        )}
      </div>
    </LocalizationProvider>
  )
}

export default SchoolTourDialog
