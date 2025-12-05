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
  Autocomplete,
  RadioGroup,
  Radio,
  FormLabel,
  TextFieldProps
} from '@mui/material'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { Dayjs } from 'dayjs'
import { Stack, display, margin, styled, width } from '@mui/system'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { getRequest, postRequest, putRequest } from 'src/services/apiService'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { useForm, Controller } from 'react-hook-form'
import style from '../../../pages/enquiry-types/enquiryTypes.module.css'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { formatTimeNew, getObjectByKeyVal, getUserInfo } from '../../../utils/helper'
import { useRouter } from 'next/navigation'
import DownArrow from 'src/@core/CustomComponent/DownArrow/DownArrow'

const CalendarIcon = () => <span className='icon-calendar-1'></span>

//Customized Tooltip

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.customColors.primaryLightest,
    color: theme.palette.customColors.mainText
  }
}))

type SchoolTour = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
  minimized?: boolean
  setMinimized?: any
  enquiryId?: any
  setFollowUpDialog?: any
  mode?: any
  academic_year?:any
}
type Autocomplete = {
  title: string
}
export const Auto1: any = [
  { name: 'Email' },
  { name: 'Call' },
  { name: 'Virtual Meeting' },
  { name: 'Physical Meeting' }
]
export const Auto2: Autocomplete[] = [
  { title: 'Met' },
  { title: 'No Show' },
  { title: 'Reschedule' },
  { title: 'Cancelled' },
  { title: 'Call Back' },
  { title: 'Awaiting Approval' },
  { title: 'Call Not Picked Up' }
]

const FollowUpDialog = ({
  openDialog,
  handleClose,
  title,
  minimized,
  setMinimized,
  enquiryId,
  setFollowUpDialog,
  mode,
  academic_year
}: SchoolTour) => {
  const [followupComent, setFollowupComment] = useState<string>('')
  const [reminderCommnet, setReminderCommnet] = useState<string>('')
  const [reminderAdditionalDetails, setReminderAdditionalDetails] = useState<string>('')

  interface OptionType {
    _id: any
    name: string
  }

  interface FolloupForm {
    followUpStatus: string
    followupDate: Dayjs | null
    followupTime: any
    followupComent: string
    followUpMode: string[]
    reason: string
    close_status?: string
    isClosedEnquiry: boolean
    reminderFollowupTime?: any
    reminderFollowUpMode?: any
    additionalDetails?: any
    reminderText?: any
    reminderFollowupDate?: any
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
  } = useForm<FolloupForm>({
    defaultValues: {
      followupDate: dayjs(),
      followupTime: dayjs().add(2, 'minute'),
      followUpMode: [],
      reminderFollowupDate: dayjs(),
      reminderFollowupTime: dayjs().add(2, 'minute')
    },
    reValidateMode: 'onBlur'
  })
  const formDataVal = watch()

  const [isBookedAgain, setIsBookedAgain] = useState<boolean>(false)
  const [isClosedEnquiry, setIsClosedEnquiry] = useState<boolean>(false)
  const [isRescheduled, setIsRescheduled] = useState<boolean>(false)
  const [recurringNotificationType, setRecurringNotificationType] = useState<string>('No')
  const [recurringNotificationModeType, setRecurringNotificationModeType] = useState<string>('Daily')
  const [reason, setReason] = useState<string>('Test Enquiry')
  const [followUpTypesList, setFollowupTypesList] = useState<OptionType[]>([])
  const [followupDate, setFollowupDate] = useState<Date | null>(new Date())
  const [followupTime, setFollowupTime] = useState<Date | null>(new Date())
  const [isSentReminder, setIsSetReminder] = useState<boolean>(false)
  const [followUpStatus, setFollowUpStatus] = useState(null)
  const [followUpMode, setFollowUpMode] = useState(null)

  const [reminderDate, setReminderDate] = useState<Dayjs | null>(null)
  const [reminderTime, setReminderTime] = useState<Date | null>(new Date())

  const [notificationDate, setNotificationDate] = useState<Date | null>(new Date())
  const [reminderFollowUpMode, setReminderFollowUpMode] = useState(null)
  const { setGlobalState, setApiResponseType } = useGlobalContext()
  const [loadingCount, setLoadingCount] = useState(0)
  const incrementLoading = () => setLoadingCount(count => count + 1)
  const decrementLoading = () => setLoadingCount(count => count - 1)
  const [followupSuccessDialog, setfollowupSuccessDialog] = useState<boolean>(false)
  const handleMinimize = () => {
    setMinimized(true)
  }
  const [statusList, setStatusList] = useState<any>([])
  const [reasonList, setReasonList] = useState<any>([])

  const router = useRouter()

  const getStatus = async () => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `/api/co-reasons?filters[slug]=closed_enquiry`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response = await getRequest(params)
    if (response?.data) {
      setStatusList(response?.data)
      // getResons(response?.data[0]?.attributes?.slug)
      // setStatus(response?.data[0]?.attributes?.slug)
    }
    setGlobalState({ isLoading: false })
  }

  const getResons = async (id: any) => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `/api/co-reasons?filters[parent_id]=${id}`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response = await getRequest(params)
    if (response?.data) {
      setReasonList(response?.data)
      // setReason(response?.data[0]?.attributes?.name)
    }
    setGlobalState({ isLoading: false })
  }

  //Autocomplete scenario
  const options = Auto1.map((option: any) => option.title)
  const filterOptions = (options: string[], { inputValue }: { inputValue: string }) => {
    if (inputValue.length < 3) {
      return options
    }

    return options.filter(option => option.toLowerCase().includes(inputValue.toLowerCase()))
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsClosedEnquiry(event.target.checked)

    if (event.target.checked) {
      setIsSetReminder(false)
    }
    console.log(isClosedEnquiry)
  }

  const handleRecurringNotification = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecurringNotificationType(event.target.value)
  }
  const handleRecurringNotificationType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecurringNotificationModeType((event.target as HTMLInputElement).value)
  }
  const handleReason = (event: any) => {
    setReason(event.target.value as string)
  }

  const handleDateChange = (date: Date | null) => {
    setFollowupDate(date)
  }

  const handleReminderDateChange = (date: any) => {
    setReminderDate(date)
  }

  const handleNotificationDateChange = (date: Date | null) => {
    setNotificationDate(date)
  }

  const handleSetToday = () => {
    setFollowupDate(new Date()) // Example: set today's date
  }

  const handleTimeChange = (time: Date | null) => {
    setFollowupTime(time)
  }

  const handleReminderTimeChange = (time: any) => {
    setReminderTime(time)
  }

  const handleReminderCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSetReminder(event.target.checked)
    console.log(isSentReminder)
  }
  const submitFollowUp = async () => {
    setGlobalState({
      isLoading: true
    })
    console.log(formDataVal)
    const userInfo = getUserInfo()
    const payloadData = {
      status: formDataVal.followUpStatus,
      date: formDataVal.followupDate ? dayjs(formDataVal.followupDate).format('YYYY-MM-DD') : '',
      time: formDataVal.followupTime ? dayjs(formDataVal.followupTime).format('HH:mm') : '',
      remarks: formDataVal.followupComent,
      mode: formDataVal.followUpMode,
      created_by: {
        user_id: userInfo?.userInfo?.id || 4,
        user_name: userInfo?.userInfo?.name || 'User',
        email: userInfo?.userInfo?.email || ''
      },
      ...(formDataVal?.isClosedEnquiry && {
        close_enquiry_details: {
          reason: formDataVal?.reason,
          status: getObjectByKeyVal(statusList, 'id', formDataVal?.close_status)?.attributes?.name
        }
      }),
      ...(isSentReminder && {
        reminder_details: {
          mode: formDataVal?.reminderFollowUpMode,
          text: formDataVal?.reminderText,
          additional_details: formDataVal?.additionalDetails,
          date: formDataVal.reminderFollowupDate ? dayjs(formDataVal.reminderFollowupDate).format('YYYY-MM-DD') : '',
          time: formDataVal.reminderFollowupTime ? dayjs(formDataVal.reminderFollowupTime).format('HH:mm') : ''
        }
      })
    }
    console.log(payloadData)

    incrementLoading()
    const params = {
      url: `marketing/follow-up/${enquiryId}/create`,
      serviceURL: 'marketing',
      data: payloadData
    }

    const responseData = await postRequest(params)
    console.log(responseData)
    if (responseData?.data) {
      setGlobalState({
        isLoading: false
      })

      // setFollowUpDialog(false)
      setfollowupSuccessDialog(true)
    } else {
      if (responseData?.error && responseData?.error?.errorCode && responseData?.error?.errorMessage) {
        setApiResponseType({ status: true, message: responseData?.error?.errorMessage })
      }
      setGlobalState({
        isLoading: false
      })
      setFollowUpDialog(false)
    }

    // if (isClosedEnquiry) {
    //   console.log("close enquiry enabled");
    //   console.log("reason close enquiry reason" + reason)
    // }
    // if (isSentReminder) {
    //   console.log("set reminder option");
    //   console.log("reminderCommnet" + reminderCommnet);
    //   console.log("reminderAdditionalDetails" + reminderAdditionalDetails);
    //   console.log("recurringNotificationType" + recurringNotificationType);
    //   console.log("recurringNotificationModeType" + recurringNotificationModeType);

    //   console.log("notificationDate" + notificationDate);
    //   console.log("reminderDate" + reminderDate);
    //   console.log("reminderTime" + reminderTime);

    // }

    // console.log(payloadData);
  }

  const handleFollowupSuccessClose = () => {
    window?.location?.reload()

    setFollowUpDialog(false)
  }
  const updateFollowUpMode = (event: React.ChangeEvent<{}>, newValue: any) => {
    console.log(newValue)
    setFollowUpMode(newValue._id) // Update state with the selected value
  }

  const updateReminderFollowUpMode = (event: React.ChangeEvent<{}>, newValue: any) => {
    console.log(newValue)
    setReminderFollowUpMode(newValue._id) // Update state with the selected value
  }

  const updateFollowUpStatus = (event: React.ChangeEvent<{}>, newValue: any) => {
    console.log(newValue)
    setFollowUpStatus(newValue) // Update state with the selected value
  }

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const params = {
  //       url: `marketing/follow-up/types/list`,
  //       serviceURL: 'marketing'
  //     }
  //     try {
  //       const response = await getRequest(params)
  //       console.log(response)
  //       setFollowupTypesList(response.data)
  //     } catch (error) {
  //       console.error('Error fetching data:', error)
  //     }
  //   }
  //   fetchData() // Call the async function here

  //   // Optionally return a cleanup function if needed
  //   // return () => { cleanup code };
  // }, [])

  useEffect(() => {
    if (enquiryId) {
      getStatus()
    }
  }, [enquiryId])

  const handleCancelClose = () => {
    // setSchoolTourDialog(false)
    // setIsBooked(false)
    setFollowUpDialog(false)
    // setIsCancel(false)
    // setIsStart(false)
  }

  const isToday = reminderDate?.isSame(dayjs(), 'day') // Check if the selected date is today
  const currentTime = dayjs() // Current time

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div>
        {openDialog && !minimized && (
          <form onSubmit={handleSubmit(submitFollowUp)} noValidate>
            <Box
              sx={{
                position: 'fixed',
                bottom: '0',
                right: '0',
                width: '600px',
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
                      {isRescheduled ? 'ReScheduled School Tour' : isBookedAgain ? 'Cancel Tour' : title}
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
                  <Box>
                    <Box sx={{ mt: 7, mb: 7 }}>
                      {Auto1 && Auto1?.length ? (
                        <Controller
                          name='followUpMode'
                          control={control}
                          defaultValue={[]}
                          rules={{ required: 'Follow Up mode is required' }}
                          render={({ field }) => (
                            <Autocomplete
                              fullWidth
                              multiple
                              id='autocomplete-multiple-filled'
                              // onChange={updateFollowUpMode}
                              options={Auto1}
                              getOptionLabel={(option: OptionType) => option.name}
                              isOptionEqualToValue={(option: any, value) => option.name === value}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  error={!!errors?.followUpMode}
                                  label='Follow Up Mode'
                                  placeholder='Follow Up Mode'
                                  required
                                />
                              )}
                              onChange={(event: any, newValue) => {
                                // field.onChange(newValue?._id)
                                // setValue("followUpMode", newValue?._id)

                                // trigger('followUpMode')

                                const ids = newValue.map(option => option.name) // Extract IDs from selected options
                                field.onChange(ids) // Update the form field value
                                setValue('followUpMode', ids) // Update form state via setValue

                                trigger('followUpMode') // Trigger validation
                              }}
                              renderTags={(value: OptionType[], getTagProps) => {
                                const displayItems = value.length > 2 ? value.slice(0, 2) : value
                                const moreItems = value.length > 2 ? value.slice(2) : []

                                return (
                                  <div>
                                    {displayItems.map((option, index) => (
                                      <Tooltip title={option.name} key={option._id}>
                                        <Chip
                                          color='default'
                                          deleteIcon={<span className='icon-trailing-icon'></span>}
                                          variant='filled'
                                          label={
                                            option.name.length > 10 ? option.name.slice(0, 5) + '...' : option.name
                                          }
                                          sx={{
                                            maxWidth: 100,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                          {...getTagProps({ index })}
                                        />
                                      </Tooltip>
                                    ))}
                                    {moreItems.length > 0 && (
                                      <Tooltip
                                        title={
                                          <span style={{ whiteSpace: 'pre-line' }}>
                                            {moreItems.map(item => item.name).join('\n')}
                                          </span>
                                        }
                                      >
                                        <span> +{moreItems.length} </span>
                                      </Tooltip>
                                    )}
                                  </div>
                                )
                              }}
                              popupIcon={<DownArrow />}
                            />
                          )}
                        />
                      ) : (
                        <FormControl fullWidth>
                          <InputLabel id='demo-simple-select-outlined-label'>Follow Up Mode</InputLabel>
                          <Select label={'Follow Up Mode'}></Select>
                        </FormControl>
                      )}
                      {errors?.followUpMode && (
                        <span className={style.errorField}>{errors['followUpMode']['message']}</span>
                      )}{' '}
                    </Box>
                    <Box sx={{ mt: 7, mb: 7 }}>
                      <Controller
                        name='followUpStatus'
                        control={control}
                        defaultValue=''
                        rules={{ required: 'Follow Up status is required' }}
                        render={({ field }) => (
                          <Autocomplete
                            fullWidth
                            id='autocomplete-multiple-filled'
                            // onChange={updateFollowUpStatus}
                            options={Auto2.map((option: any) => option?.title)}
                            renderInput={params => (
                              <TextField
                                {...params}
                                error={!!errors?.followUpStatus}
                                label='Status/Progress'
                                placeholder='Status/Progress'
                                required
                              />
                            )}
                            onChange={(event: any, newValue) => {
                              field.onChange(newValue)
                              setValue('followUpStatus', newValue)

                              trigger('followUpStatus')
                            }}
                            renderTags={(value: string[], getTagProps) => {
                              const displayItems = value.length > 2 ? value.slice(0, 2) : value
                              const moreItems = value.length > 2 ? value.slice(2) : []

                              return (
                                <div>
                                  {displayItems.map((option: string, index: number) => (
                                    <Tooltip title={option} key={index}>
                                      <Chip
                                        color='default'
                                        deleteIcon={<span className='icon-trailing-icon'></span>}
                                        variant='filled'
                                        label={option.length > 10 ? option.slice(0, 5) + '...' : option}
                                        sx={{
                                          maxWidth: 100,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                        {...getTagProps({ index })}
                                      />
                                    </Tooltip>
                                  ))}
                                  {moreItems.length > 0 && (
                                    <HtmlTooltip
                                      title={<span style={{ whiteSpace: 'pre-line' }}>{moreItems.join('\n')}</span>}
                                    >
                                      <span> +{moreItems.length} </span>
                                    </HtmlTooltip>
                                  )}
                                </div>
                              )
                            }}
                            popupIcon={<DownArrow />}
                          />
                        )}
                      />
                      {errors?.followUpMode && (
                        <span className={style.errorField}>{errors['followUpMode']['message']}</span>
                      )}{' '}
                    </Box>
                    <Box sx={{ mt: 7, mb: 7 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Controller
                          name='followupDate'
                          control={control}
                          rules={{ required: 'Follow Up Date is required' }}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              label={
                                <>
                                  <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                    Follow Up Date <span style={{ color: 'red' }}>*</span>
                                  </Box>
                                </>
                              }
                              format='DD/MM/YYYY'
                              sx={{ width: '100%' }}
                              minDate={dayjs()}
                              maxDate={dayjs(`20${academic_year}-09-30`)}
                              slots={{ openPickerIcon: CalendarIcon }}
                              onChange={(newValue) => {
                                field.onChange(newValue);
                                trigger("followupTime"); // Revalidate followupTime when date changes
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                      <FormControl>
                        {errors?.followupDate?.message && (
                          <span className={style.errorField}>{`${errors?.followupDate?.message}`}</span>
                        )}
                      </FormControl>
                    </Box>
                    <Box
                      sx={{
                        mt: 7,
                        mb: 7
                      }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {/* <Controller
                          name='followupTime'
                          control={control}
                          rules={{
                            required: 'Follow Up time is required',
                            validate: value => {
                              if (!value) {
                                return 'Follow Up time is required'
                              }
                              if (dayjs(value).isBefore(dayjs(), 'minute')) {
                                return 'Follow Up time must be greater than the current time'
                              }

                              return true
                            }
                          }}
                          render={({ field }) => (
                            <TimePicker
                              {...field}
                              label={
                                <>
                                  <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                    Follow Up Time
                                    <span style={{ color: 'red' }}>*</span>
                                  </Box>
                                </>
                              }
                              value={field.value || null}
                              onChange={newValue => {
                                field.onChange(newValue)
                                trigger('followupTime')
                              }}
                              sx={{ width: '100%' }}
                              minTime={dayjs()}
                            />
                          )}
                        /> */}
                        <Controller
  name="followupTime"
  control={control}
  rules={{
    required: "Follow Up time is required",
    validate: (value) => {
      if (!value) return "Follow Up time is required";

      const selectedTime = dayjs(value);
      const now = dayjs();
      const selectedDate = watch("followupDate"); // Watching followupDate field
      const isToday = selectedDate && dayjs(selectedDate).isSame(now, "day");

      const startTime = dayjs().set("hour", 9).set("minute", 0);
      const endTime = dayjs().set("hour", 18).set("minute", 0);

      if (isToday && selectedTime.isBefore(now, "minute")) {
        return "Follow Up time must be greater than the current time";
      }

      if (selectedTime.isBefore(startTime, "minute") || selectedTime.isAfter(endTime, "minute")) {
        return "Follow Up time must be between 9 AM and 6 PM";
      }

      return true;
    },
  }}
  render={({ field }) => (
    <TimePicker
      {...field}
      label={
        <>
          <Box sx={{ display: "flex", alignItems: "normal" }}>
            Follow Up Time <span style={{ color: "red" }}>*</span>
          </Box>
        </>
      }
      value={field.value || null}
      onChange={(newValue) => {
        field.onChange(newValue);
        trigger("followupTime"); // Revalidate the field
      }}
      sx={{ width: "100%" }}
    />
  )}
/>

                      </LocalizationProvider>
                      <FormControl>
                        {errors?.followupTime?.message && (
                          <span className={style.errorField}>{`${errors?.followupTime?.message}`}</span>
                        )}
                      </FormControl>
                    </Box>
                    <Box
                      sx={{
                        mt: 7,
                        mb: 7
                      }}
                    >
                      <Controller
                        name='followupComent' // Specify the name for the form control
                        control={control}
                        defaultValue=''
                        rules={{
                          required: 'Follow up remark  is required'
                          // pattern: {
                          //   value: /^[A-Za-z]+$/i,
                          //   message: 'Only alphabetic characters are allowed'
                          // }
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label='Remarks'
                            placeholder='Enter Remarks'
                            error={!!error}
                            helperText={error ? error.message : ''}
                            required
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ ml: 1, mt: 7, mb: 7 }}>
                      {!isSentReminder && (
                        <FormGroup>
                          <Controller
                            name='isClosedEnquiry'
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                              <FormGroup>
                                <FormControlLabel
                                  control={<Checkbox {...field} />}
                                  label='Close Enquiry'
                                  value='true'
                                />
                              </FormGroup>
                            )}
                          />
                        </FormGroup>
                      )}
                    </Box>

                    {!formDataVal.isClosedEnquiry && (
                      <Box sx={{ ml: 1, mt: 7, mb: 7 }}>
                        <FormGroup>
                          <FormControlLabel
                            control={<Checkbox checked={isSentReminder} onChange={handleReminderCheckbox} />}
                            label='Set Reminder'
                          />
                        </FormGroup>
                      </Box>
                    )}

                    {formDataVal.isClosedEnquiry && (
                      <>
                        <Box sx={{ mt: 7, mb: 7 }}>
                          {statusList && statusList?.length ? (
                            <>
                              <Controller
                                name='close_status'
                                control={control}
                                rules={{ required: 'Close Satuts required' }}
                                render={({ field }) => (
                                  <FormControl fullWidth>
                                    <InputLabel id='demo-simple-select-outlined-label'>
                                      Status <span style={{ color: 'red' }}>*</span>
                                    </InputLabel>
                                    <Select
                                      IconComponent={DownArrow}
                                      label='Status'
                                      id='demo-simple-select-outlined'
                                      labelId='demo-simple-select-outlined-label'
                                      onChange={(event, value) => {
                                        field.onChange(event.target.value) // Correct usage
                                        getResons(event.target.value)
                                      }}
                                    >
                                      {statusList?.map((val: any, ind: number) => {
                                        return (
                                          <MenuItem key={ind} value={val?.id}>
                                            {val?.attributes?.name}
                                          </MenuItem>
                                        )
                                      })}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                              <FormControl>
                                {errors?.close_status?.message && (
                                  <span className={style.errorField}>{`${errors?.close_status?.message}`}</span>
                                )}
                              </FormControl>
                            </>
                          ) : null}{' '}
                        </Box>
                        <Box sx={{ mt: 7, mb: 7 }}>
                          {reasonList && reasonList?.length ? (
                            <>
                              <Controller
                                name='reason'
                                control={control}
                                render={({ field }) => (
                                  <FormControl fullWidth>
                                    <InputLabel id='demo-simple-select-outlined-label'>Reason</InputLabel>
                                    <Select
                                      {...field}
                                      //sx={{ height: '36px', paddingRight: '0px' }}
                                      error={!!errors?.reason}
                                      IconComponent={DownArrow}
                                      label='Reason'
                                      id='demo-simple-select-outlined'
                                      labelId='demo-simple-select-outlined-label'
                                    >
                                      {reasonList?.map((val: any, ind: number) => {
                                        return (
                                          <MenuItem key={ind} value={val?.attributes?.name}>
                                            {val?.attributes?.name}
                                          </MenuItem>
                                        )
                                      })}
                                    </Select>
                                    {errors?.reason && (
                                      <span className={style.errorField}>{`${errors?.reason?.message}`}</span>
                                    )}
                                  </FormControl>
                                )}
                              />{' '}
                            </>
                          ) : (
                            <FormControl fullWidth>
                              <InputLabel id='demo-simple-select-outlined-label'>Reason</InputLabel>
                              <Select
                                IconComponent={DownArrow}
                                label={'Reason'}
                                disabled={true}
                                value={reason}
                                id='demo-simple-select-outlined'
                                labelId='demo-simple-select-outlined-label'
                                onChange={handleReason}
                              >
                                <MenuItem>Select Reason</MenuItem>
                              </Select>
                            </FormControl>
                          )}

                          {/* <FormControl fullWidth>
                          <InputLabel id='demo-simple-select-outlined-label'>Reason</InputLabel>

                          <Controller
                            name="reason"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Please select a reason' }}
                            render={({ field }) => (
                              <Select
                                IconComponent={DownArrow}
                                label='Reason'
                                // defaultValue={reason}
                                id='demo-simple-select-outlined'
                                labelId='demo-simple-select-outlined-label'
                                // onChange={handleReason}
                                onChange={(e) => field.onChange(e.target.value)}
                                value={field.value}
                                error={!!fieldState.error}
                                helperText={fieldState.error ? fieldState.error.message : null}
                              >
                                <MenuItem value=''>Select Reason</MenuItem>
                                <MenuItem value='Test Enquiry'>Test Enquiry</MenuItem>
                                <MenuItem value='Location Related'>Location Related</MenuItem>
                                <MenuItem value='Enquiry For Non Vibgyor School'>Enquiry For Non Vibgyor School</MenuItem>
                                <MenuItem value='Not Enuired'>Not Enuired</MenuItem>
                                <MenuItem value='Existing Parent'>Existing Parent</MenuItem>
                                <MenuItem value='Concern From Prospective Parent'>Concern From Prospective Parent</MenuItem>
                              </Select>

                            )}
                          />
                        </FormControl> */}
                        </Box>
                      </>
                    )}

                    {isSentReminder && !isClosedEnquiry && (
                      <>
                        <Box sx={{ mt: 7, mb: 7 }}>
                          <Divider />
                        </Box>
                        <Box sx={{ mt: 7, mb: 7 }}>
                          {Auto1 && Auto1?.length ? (
                            <Controller
                              name='reminderFollowUpMode'
                              control={control}
                              defaultValue={[]}
                              rules={{ required: 'Follow Up mode is required' }}
                              render={({ field }) => (
                                <Autocomplete
                                  fullWidth
                                  multiple
                                  id='autocomplete-multiple-filled'
                                  // onChange={updateFollowUpMode}
                                  options={Auto1}
                                  getOptionLabel={(option: OptionType) => option.name}
                                  isOptionEqualToValue={(option: any, value) => option.name === value}
                                  renderInput={params => (
                                    <TextField
                                      {...params}
                                      error={!!errors?.followUpMode}
                                      label='Follow Up Mode'
                                      placeholder='Follow Up Mode'
                                      required
                                    />
                                  )}
                                  onChange={(event: any, newValue) => {
                                    // field.onChange(newValue?._id)
                                    // setValue("followUpMode", newValue?._id)

                                    // trigger('followUpMode')

                                    const ids = newValue.map(option => option.name) // Extract IDs from selected options
                                    field.onChange(ids) // Update the form field value
                                    setValue('followUpMode', ids) // Update form state via setValue

                                    trigger('followUpMode') // Trigger validation
                                  }}
                                  renderTags={(value: OptionType[], getTagProps) => {
                                    const displayItems = value.length > 2 ? value.slice(0, 2) : value
                                    const moreItems = value.length > 2 ? value.slice(2) : []

                                    return (
                                      <div>
                                        {displayItems.map((option, index) => (
                                          <Tooltip title={option.name} key={option._id}>
                                            <Chip
                                              color='default'
                                              deleteIcon={<span className='icon-trailing-icon'></span>}
                                              variant='filled'
                                              label={
                                                option.name.length > 10 ? option.name.slice(0, 5) + '...' : option.name
                                              }
                                              sx={{
                                                maxWidth: 100,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                              }}
                                              {...getTagProps({ index })}
                                            />
                                          </Tooltip>
                                        ))}
                                        {moreItems.length > 0 && (
                                          <Tooltip
                                            title={
                                              <span style={{ whiteSpace: 'pre-line' }}>
                                                {moreItems.map(item => item.name).join('\n')}
                                              </span>
                                            }
                                          >
                                            <span> +{moreItems.length} </span>
                                          </Tooltip>
                                        )}
                                      </div>
                                    )
                                  }}
                                  popupIcon={<DownArrow />}
                                />
                              )}
                            />
                          ) : (
                            <FormControl fullWidth>
                              <InputLabel id='demo-simple-select-outlined-label'>Follow Up Mode</InputLabel>
                              <Select label={'Follow Up Mode'}></Select>
                            </FormControl>
                          )}
                          {errors?.followUpMode && (
                            <span className={style.errorField}>{errors['followUpMode']['message']}</span>
                          )}{' '}
                        </Box>
                        <Box sx={{ mt: 7, mb: 7 }}>
                          <Controller
                            name='reminderText' // Specify the name for the form control
                            control={control}
                            defaultValue=''
                            rules={{
                              required: 'Reminder text is required'
                              // pattern: {
                              //   value: /^[A-Za-z]+$/i,
                              //   message: 'Only alphabetic characters are allowed'
                              // }
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label='Reminder Text'
                                placeholder='Reminder Text'
                                error={!!error}
                                helperText={error ? error.message : ''}
                                required
                              />
                            )}
                          />
                        </Box>
                        <Box sx={{ mt: 7, mb: 7 }}>
                          <Controller
                            name='additionalDetails' // Specify the name for the form control
                            control={control}
                            defaultValue=''
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label='Additional Details'
                                placeholder='Additional Details'
                              />
                            )}
                          />
                        </Box>
                        {/* <Box sx={{ ml: 1, mt: 7, mb: 2 }}>
                          <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '14px' }}>
                            Recurring
                          </Typography>
                        </Box>  */}

                        <>
                          <Box sx={{ mt: 7, mb: 7 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <Controller
                                name='reminderFollowupDate'
                                control={control}
                                rules={{ required: 'Follow Up Date is required' }}
                                render={({ field }) => (
                                  <DatePicker
                                    {...field}
                                    label={
                                      <>
                                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                          Follow Up Date
                                          <span style={{ color: 'red' }}>*</span>
                                        </Box>
                                      </>
                                    }
                                    format='DD/MM/YYYY'
                                    sx={{ width: '100%' }}
                                    minDate={dayjs()}
                                    slots={{ openPickerIcon: CalendarIcon }}
                                    onChange={(newValue) => {
                                      field.onChange(newValue);
                                      trigger("reminderFollowupTime"); // Revalidate the field
                                    }}
                                  />
                                )}
                              />
                            </LocalizationProvider>
                            <FormControl>
                              {errors?.followupDate?.message && (
                                <span className={style.errorField}>{`${errors?.followupDate?.message}`}</span>
                              )}
                            </FormControl>
                          </Box>
                          <Box
                            sx={{
                              mt: 7,
                              mb: 7
                            }}
                          >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <Controller
                                name='reminderFollowupTime'
                                control={control}
                                rules={{
                                  required: 'Follow Up time is required',
                                  validate: (value) => {
                                    if (!value) return "Follow Up time is required";
                              
                                    const selectedTime = dayjs(value);
                                    const now = dayjs();
                                    const selectedDate = watch("reminderFollowupDate"); // Watching followupDate field
                                    const isToday = selectedDate && dayjs(selectedDate).isSame(now, "day");
                              
                                    const startTime = dayjs().set("hour", 9).set("minute", 0);
                                    const endTime = dayjs().set("hour", 18).set("minute", 0);
                              
                                    if (isToday && selectedTime.isBefore(now, "minute")) {
                                      return "Follow Up time must be greater than the current time";
                                    }
                              
                                    if (selectedTime.isBefore(startTime, "minute") || selectedTime.isAfter(endTime, "minute")) {
                                      return "Follow Up time must be between 9 AM and 6 PM";
                                    }
                              
                                    return true;
                                  }
                                }}
                                render={({ field }) => (
                                  <TimePicker
                                    {...field}
                                    label={
                                      <>
                                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                          Follow Up Time
                                          <span style={{ color: 'red' }}>*</span>
                                        </Box>
                                      </>
                                    }
                                    value={field.value || null}
                                    onChange={newValue => {
                                      field.onChange(newValue)
                                      trigger('reminderFollowupTime')
                                    }}
                                    sx={{ width: '100%' }}
                                    // minTime={dayjs()} // Set the minimum time to the current time
                                  />
                                )}
                              />
                            </LocalizationProvider>
                            <FormControl>
                              {errors?.reminderFollowupTime?.message && (
                                <span className={style.errorField}>{`${errors?.reminderFollowupTime?.message}`}</span>
                              )}
                            </FormControl>
                          </Box>
                        </>
                      </>
                    )}
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

                    <Button type='submit' sx={{ width: 'auto' }} variant='contained' color='secondary' fullWidth>
                      Submit
                    </Button>
                  </Box>
                </Box>
              </div>
            </Box>
          </form>
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
            <IconButton onClick={() => handleCancelClose()}>
              <span className='icon-trailing-icon'></span>
            </IconButton>
          </Box>
        )}

        {followupSuccessDialog && (
          <SuccessDialog
            openDialog={followupSuccessDialog}
            title='Followup Has Been Saved Successfully'
            handleClose={handleFollowupSuccessClose}
          />
        )}
      </div>
    </LocalizationProvider>
  )
}

export default FollowUpDialog
