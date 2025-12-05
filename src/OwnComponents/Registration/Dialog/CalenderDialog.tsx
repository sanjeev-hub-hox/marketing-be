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
  Autocomplete,
  RadioGroup,
  Radio,
  FormLabel,
  Drawer,
  ToggleButtonGroup,
  ToggleButton,
  Avatar
} from '@mui/material'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { Dayjs } from 'dayjs'
import { Stack, styled } from '@mui/system'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'

const CalendarIcon = () => <span className='icon-calendar-1'></span>
const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

// Customized Tooltip
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.customColors.primaryLightest,
    color: theme.palette.customColors.mainText
  }
}))

type SchoolTour = {
  openDrawer: boolean
  handleClose?: () => void
  title?: string
}

const CalenderDialog = ({ openDrawer, handleClose, title }: SchoolTour) => {
  const [view, setView] = useState('tab1')
  const [activityName, setActivityName] = useState<string>('Activity Name')
  const [comment, setComment] = useState<string>('Comment')
  const [value, setValue] = React.useState<Dayjs | null>(dayjs('2022-04-17T15:30'))
  const [activity, setActivity] = useState(false)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)

  //Calculate screen width
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  //Handler for tab
  const handleToggleChange = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
    setView(nextView)
  }

  //Handler for Activity
  const handleActivity = () => {
    setActivity(true)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div>
        {openDrawer && (
          <Drawer
            anchor='right'
            open={openDrawer}
            onClose={handleClose}
            sx={{
              '& .MuiDrawer-paper': {
                width: '500px',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 24,
                borderRadius: '10px 0 0 10px',
                zIndex: 1500,
                padding: '15px',

                overflow: `${view === 'tab1' && activity ? 'auto' : 'hidden'}`
              }
            }}
          >
            <Box
              sx={{
                backgroundColor: 'white',
                zIndex: 1500,
                width: '100%',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px' }}>
                {title}
              </Typography>
              <IconButton disableFocusRipple disableRipple onClick={handleClose}>
                <span className='icon-close-circle'></span>
              </IconButton>
            </Box>
            <Divider />
            <Box>
              <Box sx={{ my: 5, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup value={view} exclusive onChange={handleToggleChange}>
                  <ToggleButton sx={{ padding: '0px 60px' }} value='tab1' aria-label='Tab 1'>
                    My Calender
                  </ToggleButton>
                  <ToggleButton sx={{ padding: '0px 60px' }} value='tab2' aria-label='Tab 2'>
                    School Calender
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
            <Box>
              <Box sx={{ mt: 0, mb: 7 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <StaticDatePicker
                    className='desktopDate'
                    sx={{
                      '&.MuiPickersLayout-root': {
                        '& .MuiPickersLayout-contentWrapper': {
                          '& .MuiDateCalendar-root': {
                            margin: '0px',
                            width: '400px'
                          }
                        },

                        '& .MuiDialogActions-root': {
                          display: 'none'
                        }
                      }
                    }}
                    defaultValue={dayjs('2022-04-17')}
                  />
                </LocalizationProvider>
              </Box>

              {/*Activity section start here*/}

              {view === 'tab1' && (
                <>
                  {!activity ? (
                    <>
                      <Box>
                        <Divider />
                        <Box
                          sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <Box>
                            <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px' }}>
                              Activity
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              sx={{
                                width: '24px',
                                height: '24px',
                                color: 'secondary.dark',
                                backgroundColor: 'secondary.main',
                                '&.MuiIconButton-root:hover': {
                                  color: 'secondary.dark',
                                  backgroundColor: 'secondary.main'
                                }
                              }}
                              onClick={handleActivity}
                            >
                              <span className='icon-add'></span>
                            </IconButton>
                          </Box>
                        </Box>
                        <Divider />
                        <Box
                          className='fixedModal'
                          sx={
                            screenWidth >= 2500
                              ? { height: '800px', overflowY: 'auto' }
                              : screenWidth >= 1900
                              ? { height: '450px', overflowY: 'auto' }
                              : screenWidth >= 1600
                              ? { height: '280px', overflowY: 'auto' }
                              : screenWidth >= 1400
                              ? { height: '270px', overflowY: 'auto' }
                              : screenWidth >= 1300
                              ? { height: '170px', overflowY: 'auto' }
                              : { height: '170px', overflowY: 'auto' }
                          }
                        >
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,

                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <IconButton
                                sx={{
                                  mr: 3,
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                <span className='icon-call'></span>
                              </IconButton>
                              <Box>
                                <Typography variant='body2' color={'text.primary'} sx={{ lineHeight: '15.4px' }}>
                                  MDM Demo
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color={'customColors.mainText'}
                                  sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                                >
                                  {' '}
                                  Microsoft Teams meeting with{' '}
                                  <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '15.4px' }}>
                                    Ashish Mittal
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                {' '}
                                Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maec mauris. Vulputate
                                commodo quis amet.
                              </Typography>
                              <Box
                                sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-clock'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    08:30 am - 09:30 am
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                  <span className='icon-calendar-1'></span>
                                  <Typography
                                    variant='caption'
                                    color={'customColors.mainText'}
                                    sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                                  >
                                    15/05/2025
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <>
                      {/*New Activity section start here*/}

                      <Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant='subtitle1'
                            color={'text.primary'}
                            sx={{ lineHeight: '17.6px', textTransform: 'capitalize' }}
                          >
                            Add New Activtiy
                          </Typography>
                        </Box>
                        <Box className='fixedModal' sx={{ height: '500px', overflowY: 'auto' }}>
                          <Box sx={{ mt: 3 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                sx={{ width: '100%' }}
                                slots={{
                                  openPickerIcon: CalendarIcon
                                }}
                                format='DD/MM/YYYY'
                                label='Start Date'
                              />
                            </LocalizationProvider>
                          </Box>

                          <Box sx={{ mt: 4 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                sx={{ width: '100%' }}
                                slots={{
                                  openPickerIcon: CalendarIcon
                                }}
                                format='DD/MM/YYYY'
                                label='End Date'
                              />
                            </LocalizationProvider>
                          </Box>
                          <Box sx={{ mt: 4 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <TimePicker
                                sx={{ width: '100%' }}
                                label='Start Time'
                                value={value}
                                onChange={newValue => setValue(newValue)}
                              />
                            </LocalizationProvider>
                          </Box>
                          <Box sx={{ mt: 4 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <TimePicker
                                sx={{ width: '100%' }}
                                label='End Time'
                                value={value}
                                onChange={newValue => setValue(newValue)}
                              />
                            </LocalizationProvider>
                          </Box>
                          <Box sx={{ mt: 4 }}>
                            <TextField
                              fullWidth
                              required
                              label='Activity Name'
                              value={activityName}
                              placeholder='Activity Name'
                              onChange={e => setActivityName(e.target.value)}
                              defaultValue={activityName}
                            />
                          </Box>
                          <Box sx={{ mt: 4 }}>
                            <TextField
                              fullWidth
                              label='Comment'
                              required
                              value={comment}
                              placeholder='Comment'
                              onChange={e => setComment(e.target.value)}
                              defaultValue={comment}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 4 }}>
                            <Button
                              variant='outlined'
                              color='inherit'
                              sx={{ mr: 3 }}
                              onClick={() => setActivity(false)}
                            >
                              Cancel
                            </Button>
                            <Button variant='contained' color='secondary' onClick={() => setActivity(false)}>
                              Submit
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}
                </>
              )}

              {view === 'tab2' && (
                <>
                  <Box>
                    <Box sx={{ mt: 5, mb: 5 }}>
                      <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '17.6px' }}>
                        Activtiy
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      className='fixedModal'
                      sx={
                        screenWidth >= 2500
                          ? { height: '810px', overflowY: 'auto' }
                          : screenWidth >= 1900
                          ? { height: '480px', overflowY: 'auto' }
                          : screenWidth >= 1600
                          ? { height: '300px', overflowY: 'auto' }
                          : screenWidth >= 1400
                          ? { height: '300px', overflowY: 'auto' }
                          : screenWidth >= 1300
                          ? { height: '180px', overflowY: 'auto' }
                          : { height: '220px', overflowY: 'auto' }
                      }
                    >
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'unset' }}>
                        <Box sx={{ mr: 3 }}>
                          <Avatar sx={{ width: '50px', height: '50px' }} className='primary' variant='circular'>
                            B
                          </Avatar>
                        </Box>
                        <Box>
                          <Typography
                            variant='body2'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            <span style={{ color: 'text.primary', fontWeight: '500' }}>Basket Ball Matches</span> - VBR
                            Goregaon West
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.2px', textTransform: 'capitalize' }}
                          >
                            Lorem ipsum dolor sit amet consectetur. In ultrices risus eget maecenas mauris. Vulputate
                            commodo quis amet.
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-clock'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                08:30 am - 09:30 am
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                              <span className='icon-calendar-1'></span>
                              <Typography
                                variant='caption'
                                color={'customColors.mainText'}
                                sx={{ ml: 2, lineHeight: '13.2px', textTransform: 'capitalize' }}
                              >
                                15/05/2025
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Drawer>
        )}
      </div>
    </LocalizationProvider>
  )
}

export default CalenderDialog
