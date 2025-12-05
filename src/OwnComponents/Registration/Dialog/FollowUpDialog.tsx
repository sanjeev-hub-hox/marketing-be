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
  Checkbox,
  Autocomplete,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import { Stack, display, margin, styled, width } from '@mui/system'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'

const CalendarIcon = () => <span className='icon-calendar-1'></span>
const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

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
}
type Autocomplete = {
  title: string
}
export const Auto1: Autocomplete[] = [
  { title: 'Email' },
  { title: 'Call' },
  { title: 'Meeting' },
  { title: 'School Visit' }
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

const FollowUpDialog = ({ openDialog, handleClose, title, minimized, setMinimized }: SchoolTour) => {
  const [comment, setComment] = useState<string>('Add Comment')

  const [isBookedAgain, setIsBookedAgain] = useState<boolean>(false)
  const [isClosedEnquiry, setIsClosedEnquiry] = useState<boolean>(false)
  const [isRescheduled, setIsRescheduled] = useState<boolean>(false)
  const [radioValue, setRadioValue] = useState<string>('No')
  const [recurringType, setRecurringType] = useState<string>('Daily')
  const [reason, setReason] = useState<string>('Test Enquiry')

  const handleMinimize = () => {
    setMinimized(true)
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
  }

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioValue(event.target.value)
  }
  const handleRecurringTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecurringType((event.target as HTMLInputElement).value)
  }
  const handleReason = (event: any) => {
    setReason(event.target.value as string)
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
                </Box>
              </div>
            </Box>
            <div style={{ padding: '20px' }}>
              <Box>
                <Box>
                  <Box sx={{ mt: 7, mb: 7 }}>
                    <Autocomplete
                      multiple
                      fullWidth
                      id='autocomplete-multiple-filled'
                      defaultValue={[Auto1[1].title]}
                      options={Auto1.map(option => option.title)}
                      filterOptions={filterOptions}
                      renderInput={params => (
                        <TextField {...params} label='Follow Up Mode' placeholder='Follow Up Mode' />
                      )}
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
                    />
                  </Box>
                  <Box sx={{ mt: 7, mb: 7 }}>
                    <Autocomplete
                      multiple
                      fullWidth
                      id='autocomplete-multiple-filled'
                      defaultValue={[Auto2[1].title]}
                      options={Auto2.map(option => option.title)}
                      filterOptions={filterOptions}
                      renderInput={params => (
                        <TextField {...params} label='Status/Progress' placeholder='Status/Progress' />
                      )}
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
                    />
                  </Box>
                  <Box sx={{ mt: 7, mb: 7 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        sx={{ width: '100%' }}
                        slots={{
                          openPickerIcon: CalendarIcon
                        }}
                        format='DD/MM/YYYY'
                        label='Follow Up Date'
                      />
                    </LocalizationProvider>
                  </Box>
                  <Box
                    sx={{
                      mt: 7,
                      mb: 7
                    }}
                  >
                    <TextField
                      fullWidth
                      label='Follow Up Time'
                      value={'10:30 PM'}
                      placeholder='Enter Follow Up Time'
                      onChange={e => setComment(e.target.value)}
                      defaultValue={comment}
                    />
                  </Box>
                  <Box
                    sx={{
                      mt: 7,
                      mb: 7
                    }}
                  >
                    <TextField
                      fullWidth
                      label='Remarks'
                      value={comment}
                      placeholder='Enter Remarks'
                      onChange={e => setComment(e.target.value)}
                      defaultValue={comment}
                    />
                  </Box>
                  <Box sx={{ ml: 1, mt: 7, mb: 7 }}>
                    <FormGroup>
                      <FormControlLabel
                        control={<Checkbox checked={isClosedEnquiry} onChange={handleCheckboxChange} />}
                        label='Close Enquiry'
                      />
                    </FormGroup>
                  </Box>
                  {isClosedEnquiry && (
                    <Box sx={{ mt: 7, mb: 7 }}>
                      <FormControl fullWidth>
                        <InputLabel id='demo-simple-select-outlined-label'>Reason</InputLabel>
                        <Select
                          IconComponent={DownArrow}
                          label='Reason'
                          defaultValue={reason}
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={handleReason}
                        >
                          <MenuItem value=''>Select Reason</MenuItem>
                          <MenuItem value='Test Enquiry'>Test Enquiry</MenuItem>
                          <MenuItem value='Location Related'>Location Related</MenuItem>
                          <MenuItem value='Enquiry For Non Vibgyor School'>Enquiry For Non Vibgyor School</MenuItem>
                          <MenuItem value='Not Enuired'>Not Enuired</MenuItem>
                          <MenuItem value='Existing Parent'>Existing Parent</MenuItem>
                          <MenuItem value='Concern From Prospective Parent'>Concern From Prospective Parent</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                  <Box sx={{ mt: 7, mb: 7 }}>
                    <Divider />
                  </Box>
                  <Box sx={{ mt: 7, mb: 7 }}>
                    <Autocomplete
                      multiple
                      fullWidth
                      id='autocomplete-multiple-filled'
                      defaultValue={[Auto1[1].title]}
                      options={Auto1.map(option => option.title)}
                      filterOptions={filterOptions}
                      renderInput={params => (
                        <TextField {...params} label='Follow Up Mode' placeholder='Follow Up Mode' />
                      )}
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
                    />
                  </Box>
                  <Box sx={{ mt: 7, mb: 7 }}>
                    <TextField
                      fullWidth
                      label='Reminder Text'
                      value={'Add Here'}
                      placeholder='Reminder Text'
                      onChange={e => setComment(e.target.value)}
                      defaultValue={comment}
                    />
                  </Box>
                  <Box sx={{ mt: 7, mb: 7 }}>
                    <TextField
                      fullWidth
                      label='Additional Details'
                      value={'Add Here'}
                      placeholder='Add Here'
                      onChange={e => setComment(e.target.value)}
                      defaultValue={comment}
                    />
                  </Box>
                  <Box sx={{ ml: 1, mt: 7, mb: 2 }}>
                    <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '14px' }}>
                      Recurring
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 1, mt: 2, mb: 3 }}>
                    <RadioGroup
                      row
                      aria-labelledby='demo-row-radio-buttons-group-label'
                      name='row-radio-buttons-group '
                      value={radioValue}
                      onChange={handleRadioChange}
                    >
                      <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                      <FormControlLabel value='No' control={<Radio />} label='No' />
                    </RadioGroup>
                  </Box>
                  {radioValue === 'Yes' ? (
                    <>
                      <Box sx={{ ml: 1, mt: 3, mb: 7 }}>
                        <Stack direction='row' alignItems='center' spacing={2}>
                          <FormLabel component='legend' style={{ fontSize: '16px', color: '#212121' }}>
                            Recurring Type:
                          </FormLabel>
                          <RadioGroup
                            row
                            aria-labelledby='demo-row-radio-buttons-group-label'
                            name='row-radio-buttons-group'
                            value={recurringType}
                            onChange={handleRecurringTypeChange}
                          >
                            <FormControlLabel value='Daily' control={<Radio />} label='Daily' />
                            <FormControlLabel value='Weekly' control={<Radio />} label='Weekly' />
                            <FormControlLabel value='Monthly' control={<Radio />} label='Monthly' />
                          </RadioGroup>
                        </Stack>
                      </Box>
                      <Box sx={{ mt: 7, mb: 7 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            sx={{ width: '100%' }}
                            slots={{
                              openPickerIcon: CalendarIcon
                            }}
                            format='DD/MM/YYYY'
                          />
                        </LocalizationProvider>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box sx={{ mt: 7, mb: 7 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            sx={{ width: '100%' }}
                            slots={{
                              openPickerIcon: CalendarIcon
                            }}
                            format='DD/MM/YYYY'
                            label='Follow Up Date'
                          />
                        </LocalizationProvider>
                      </Box>
                      <Box
                        sx={{
                          mt: 7,
                          mb: 7
                        }}
                      >
                        <TextField
                          fullWidth
                          label='Follow Up Time'
                          value={'10:30 PM'}
                          placeholder='Enter Follow Up Time'
                          onChange={e => setComment(e.target.value)}
                          defaultValue={comment}
                        />
                      </Box>
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

                  <Button onClick={handleClose} sx={{ width: 'auto' }} variant='contained' color='secondary' fullWidth>
                    Submit
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

export default FollowUpDialog
