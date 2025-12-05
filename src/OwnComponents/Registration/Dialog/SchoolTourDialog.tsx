import React, { useState } from 'react'
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
import dayjs from 'dayjs'
import { display, margin, styled, width } from '@mui/system'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

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

type SchoolTour = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
  setSchoolTourDialog?: any
  minimized?: boolean
  setMinimized?: any
}

const SchoolTourDialog = ({
  openDialog,
  handleClose,
  title,
  setSchoolTourDialog,
  minimized,
  setMinimized
}: SchoolTour) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [comment, setComment] = useState<string>('Add Comment')
  const [visitTime, setVisitTime] = useState<string>('10:30 PM')
  const [reComment, setReComment] = useState<string>('Add Comment')
  const [reMark, setReMark] = useState<string>('Add Comment')
  const [isBooked, setIsBooked] = useState<boolean>(false)
  const [isBookedAgain, setIsBookedAgain] = useState<boolean>(false)
  const [isCancel, setIsCancel] = useState<boolean>(false)
  const [isStart, setIsStart] = useState<boolean>(false)
  const [isRescheduled, setIsRescheduled] = useState<boolean>(false)
  const [reason, setReason] = useState<string>('Personal Reason')

  const handleMinimize = () => {
    setMinimized(true)
  }

  const handleBook = () => {
    setIsBooked(true)
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
    setIsStart(true)
    setIsBooked(false)
    setIsRescheduled(false)
    setIsCancel(false)
  }

  // console.log(isCancel, 'Is Cancel')
  // console.log(isRescheduled, 'Is Reschedule')
  // console.log(isBooked, 'Is Booked')
  // console.log(isStart, 'Is Start')

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
                      ? 'ReScheduled School Tour'
                      : isCancel
                      ? 'Cancel Tour'
                      : isStart
                      ? 'On-Going School Tour'
                      : title}
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
                {!isBooked && !isCancel && !isRescheduled && !isStart && (
                  <Box>
                    <Box sx={{ mb: 5 }}>
                      <StaticDatePicker className='desktopDate' defaultValue={dayjs('2022-04-17')} />
                    </Box>

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

                    <Box
                      sx={{
                        mt: 7,
                        mb: 7
                      }}
                    >
                      <TextField
                        fullWidth
                        label='Comment'
                        value={comment}
                        placeholder='Add Comment'
                        onChange={e => setComment(e.target.value)}
                        defaultValue={comment}
                      />
                    </Box>
                  </Box>
                )}

                {isBooked && !isStart && !isCancel && !isRescheduled && (
                  <Box>
                    <Box sx={{ mb: 5 }}>
                      <StaticDatePicker className='desktopDate' defaultValue={dayjs('2022-04-17')} />
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
                        11:00 AM
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
                        value={comment}
                        placeholder='Add Comment'
                        onChange={e => setComment(e.target.value)}
                        defaultValue={comment}
                        disabled
                      />
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
                        value={visitTime}
                        placeholder='Visit Time'
                        onChange={e => setVisitTime(e.target.value)}
                        defaultValue={visitTime}
                        disabled
                      />
                    </Box>

                    <Box sx={{ mb: 7 }}>
                      <TextField
                        fullWidth
                        label='Last Remark'
                        value={reMark}
                        placeholder='Last Remark'
                        onChange={e => setReMark(e.target.value)}
                        defaultValue={reMark}
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
                        defaultValue={reComment}
                      />
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
                          value={visitTime}
                          placeholder='Visit Time'
                          onChange={e => setVisitTime(e.target.value)}
                          defaultValue={visitTime}
                          disabled
                        />
                      </Box>

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
                      <Box>
                        <Divider />
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, mb: 7 }}>
                      <Box sx={{ mt: 3, mb: 5 }}>
                        <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px' }}>
                          Change Date
                        </Typography>
                      </Box>
                      <Box>
                        <StaticDatePicker className='desktopDate' defaultValue={dayjs('2022-04-17')} />
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, mb: 7 }}>
                      <Box sx={{ mt: 3, mb: 5 }}>
                        <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px' }}>
                          Change Time
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
                )}
                {isStart && !isRescheduled && !isCancel && !isBooked && (
                  <Box>
                    <Box sx={{ mt: 2, mb: 5 }}>
                      <Box sx={{ mb: 7 }}>
                        <FormGroup>
                          <FormControlLabel control={<Checkbox defaultChecked />} label='Grade Specific Counselling' />
                          <FormControlLabel control={<Checkbox />} label='Discovery Room' />
                          <FormControlLabel disabled control={<Checkbox />} label='School Tour' />
                          <FormControlLabel disabled control={<Checkbox />} label='Fee Related Counselling' />
                          <FormControlLabel disabled control={<Checkbox />} label='SPA Counselling' />
                          <FormControlLabel disabled control={<Checkbox />} label='PSA Counselling' />
                          <FormControlLabel disabled control={<Checkbox />} label='Transport Details' />
                          <FormControlLabel disabled control={<Checkbox />} label='Kids Club Details' />
                          <FormControlLabel disabled control={<Checkbox />} label='Cafeteria Details' />
                          <FormControlLabel disabled control={<Checkbox />} label='VAS Details' />
                          <FormControlLabel disabled control={<Checkbox />} label='Exam Details' />
                          <FormControlLabel disabled control={<Checkbox />} label='Tour Details' />
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
                          disabled
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {!isBooked || isCancel ? (
                    <Button
                      sx={{ width: 'auto', mr: 2 }}
                      variant='outlined'
                      color='inherit'
                      onClick={isRescheduled ? handleRescheduleCancel : isCancel ? handleCancelBackButton : handleClose}
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
                  <Button
                    onClick={
                      isBooked
                        ? handleStartTour
                        : isRescheduled
                        ? handleRescheduleCancel
                        : isCancel
                        ? handleCancelClose
                        : isStart
                        ? handleClose
                        : handleBook
                    }
                    sx={{ width: 'auto' }}
                    variant='contained'
                    color='secondary'
                    fullWidth
                  >
                    {isBooked && !isCancel ? 'Start Tour' : isCancel ? 'Cancel Tour' : isStart ? 'Submit' : 'Book Tour'}
                  </Button>
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
          </Box>
        )}
      </div>
    </LocalizationProvider>
  )
}

export default SchoolTourDialog
