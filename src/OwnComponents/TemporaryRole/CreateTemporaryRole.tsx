// ** React Imports
import { SyntheticEvent, useEffect, useState } from 'react'

// ** MUI Imports
import { styled } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import SuccessDialog from '../ManageRequest/Dialog/SuccessDialog'
import InfoIcon from '@mui/icons-material/Info'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

// import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// import dayjs from 'dayjs'

// import DatePicker, { ReactDatePickerProps } from 'react-datepicker'

// // ** Custom Component Imports
// import CustomInput from './PickersCustomInput'

// ** Types
// import { DateType } from 'src/types/forms/reactDatepickerTypes'

import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  StepLabel,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material'
import UserIcon from 'src/layouts/components/UserIcon'
import TreeViewCheckbox from '../ManageRequest/TreeViewCheckbox'
import { useRouter } from 'next/navigation'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  marginLeft: 0,
  '& .MuiSwitch-root': {
    width: 42,
    height: 26,
    padding: 0,
    marginRight: theme.spacing(3),
    '& .MuiSwitch-switchBase': {
      padding: 1,
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: theme.palette.common.white,
        '& + .MuiSwitch-track': {
          opacity: 1,
          border: 'none',
          backgroundColor: '#3635C9'
        }
      }
    },
    '& .MuiSwitch-thumb': {
      width: 24,
      height: 24
    },
    '& .MuiSwitch-track': {
      opacity: 1,
      borderRadius: 13,
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.selected : theme.palette.grey[50],
      border: `1px solid ${theme.palette.grey[400]}`,
      transition: theme.transitions.create(['background-color', 'border'])
    }
  }
}))

const steps = ['Create Role', 'Assign Rights']

//Autocomplete data
type Autocomplete = {
  title: string
}
export const Auto1: Autocomplete[] = [
  { title: 'CBSE Primary NA NA Coordinator' },
  { title: 'CBSE Primary NA NA Coordinator' },
  { title: 'CBSE Primary NA NA Coordinator' },
  { title: 'CBSE Primary NA NA Coordinator' }
]

//multiselect style

// Define a styled FormControl component
// const FormControl = styled(FormControl)<any>(({ theme, hasValue }) => ({
//   '& .MuiOutlinedInput-root': {
//     borderColor: hasValue ? 'black' : 'default', // Change border color when value is added
//     '&:hover .MuiOutlinedInput-notchedOutline': {
//       borderColor: '#C6C8D2' // Border color when hovering
//     },
//     '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//       borderColor: '#C6C8D2' // Border color when focused
//     }
//   },
//   '& .MuiInputLabel-root': {
//     color: hasValue ? 'black' : 'default', // Change label color when value is added
//     '&.Mui-focused': {
//       color: 'black' // Label color when focused
//     }
//   }
// }))

const CreateTemporaryRole = () => {
  // ** State
  const [value, setValue] = useState<any>('1')
  const [erpRoleName, setErpRoleName] = useState<string>('Vice Principal')
  const [tempRoleName, setTempRoleName] = useState<string>('Vice Principal')
  const [roleName, setRoleName] = useState<string>('Teaching Faculty')
  const [role, setRole] = useState<string>('')
  const [selectedItems1, setSelectedItems1] = useState([])
  const [selectedItems2, setSelectedItems2] = useState([])
  const [selectedItems3, setSelectedItems3] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [infoDialog, setInfoDialog] = useState(false)
  const router = useRouter()
  const { setPagePaths } = useGlobalContext()
  const [view, setView] = useState('tab1')
  const [draftDialog, setDraftDialog] = useState(false)
  const handleToggleChange = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
    setView(nextView)
  }

  //   const [date, setDate] = useState<DateType>(new Date())
  const [activeStep, setActiveStep] = useState(0)

  //Handler for multi select option
  const handleChange1 = (e: any) => {
    setSelectedItems1(e.target.value)
  }
  const handleChange2 = (e: any) => {
    setSelectedItems2(e.target.value)
  }
  const handleChange3 = (e: any) => {
    setSelectedItems3(e.target.value)
  }
  const handleDelete = (itemToDelete: string) => () => {
    setSelectedItems1(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems2(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems3(selectedItems => selectedItems.filter(item => item !== itemToDelete))
  }

  //Tab State

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  //Handler for role
  const handleTempRole = (e: any) => {
    console.log(e.target.value)
    setRole(e.target.value)
  }

  //stepper handler

  const totalSteps = () => {
    return steps.length
  }

  const isLastStep = () => {
    return activeStep === totalSteps() - 1
  }

  const handleSetRights = () => {
    setActiveStep(prev => prev + 1)
  }

  //Handle Button action
  const handleNext = () => {
    if (activeStep == 0) {
      setActiveStep(prev => prev + 1)
    } else {
      setOpenDialog(true)
    }
  }
  const handleBack = () => {
    if (view === 'tab3' && activeStep === 1) {
      setActiveStep(activeStep - 1)
    } else {
      router.push('/temporary-role-listing')
    }
  }

  const handleSubmit = () => {
    setOpenDialog(true)
  }

  //Handler for dialog box
  const handleCloseDialog = () => {
    setOpenDialog(false)
    router.push('/temporary-role-listing')

    // handleRoleDialog(false)
  }
  console.log(view, 'check toggle button')

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Temporary Role',
        path: '/temporary-role-listing'
      },
      {
        title: 'Create New Temporary Role',
        path: '/temporary-role-listing/create-new-temporary-role'
      }
    ])
  }, [])

  const CalendarIcon = () => <span className='icon-calendar-1'></span>

  //Draft dialog box here

  const handleDraft = () => {
    setDraftDialog(true)
  }
  const handleDraftClose = () => {
    setDraftDialog(false)
    router.push('/temporary-role-listing')
  }

  return (
    <Box sx={{ background: '#fff', borderRadius: '10px', padding: '10px 10px' }}>
      <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          sx={activeStep === 1 ? { display: 'none' } : { display: 'block' }}
          value={view}
          exclusive
          onChange={handleToggleChange}
        >
          <ToggleButton value='tab1' aria-label='Tab 1'>
            I want to assign Permanent role temporarily
          </ToggleButton>
          <ToggleButton value='tab2' aria-label='Tab 2'>
            I want to assign predefined temporary role
          </ToggleButton>
          <ToggleButton value='tab3' aria-label='Tab 3'>
            I want to create and assign custom temporary role
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={activeStep === 1 ? { display: 'none' } : { display: 'flex', justifyContent: 'center', my: 5 }}>
        <Divider sx={{ width: '90%' }} />
      </Box>

      {/* <TabContext value={value}>
        <Box sx={activeStep === 1 ? { borderBottom: 0 } : { borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            variant='fullWidth'
            onChange={handleChange}
            aria-label='full width tabs example'
            TabIndicatorProps={{ children: <span /> }}
            sx={activeStep === 1 ? { display: 'none' } : { display: 'block' }}
            textColor='primary'
            className='fullwidth primary'
          >
            <Tab value={'1'} label='I Want To Assign Permanent Role Temporarily' />
            <Tab value={'2'} label='I Want To Assign Predefined Temporary Role' />
            <Tab value={'3'} label='I Want To Create And Assign Custom Temporary Role' />
          </TabList>
        </Box>
        <TabPanel value={'1'}>
          <Grid container spacing={5} sx={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-outlined-label'>
                  {
                    <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                      Applications
                      {infoDialog && (
                        <span>
                          <Tooltip title='Applications'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                </InputLabel>
                <Select
                  label='Applications'
                  defaultValue=''
                  id='demo-simple-select-outlined'
                  labelId='demo-simple-select-outlined-label'
                >
                  <MenuItem value=''>
                    <em>Select</em>
                  </MenuItem>
                  <MenuItem value='School ERP'>School ERP</MenuItem>
                  <MenuItem value='Oracle'>Oracle</MenuItem>
                  <MenuItem value='LMS'>LMS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                id='autocomplete-multiple-filled'
                defaultValue={[Auto1[1].title]}
                options={Auto1.map(option => option.title)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                        Select HRIS Unique Role
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select HRIS Unique Role'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                    placeholder='Select HRIS Unique Role'
                  />
                )}
                renderTags={(value: string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip
                      color='default'
                      variant='filled'
                      label={option}
                      {...(getTagProps({ index }) as {})}
                      key={index}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={
                  <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                    ERP Role
                    {infoDialog && (
                      <span>
                        <Tooltip title='ERP Role'>
                          <InfoIcon />
                        </Tooltip>
                      </span>
                    )}
                  </Box>
                }
                value={erpRoleName}
                placeholder='ERP Role Name'
                onChange={e => setErpRoleName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-outlined-label'>
                  {
                    <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                      Assign Temporary Role To
                      {infoDialog && (
                        <span>
                          <Tooltip title='Assign Temporary Role To'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                </InputLabel>
                <Select
                  label='Assign Temporary Role To'
                  defaultValue=''
                  id='demo-simple-select-outlined'
                  labelId='demo-simple-select-outlined-label'
                  onChange={handleTempRole}
                >
                  <MenuItem value=''>
                    <em>Select Option</em>
                  </MenuItem>
                  <MenuItem value='user'>User</MenuItem>
                  <MenuItem value='group users'>Group of Users</MenuItem>
                  <MenuItem value='role'>Role</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {role === 'user' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                        Select User
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select User'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Select User'
                    defaultValue=''
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                  >
                    <MenuItem value=''>
                      <em>Select User</em>
                    </MenuItem>
                    <MenuItem value='E123 Mittal'>E123 Mittal</MenuItem>
                    <MenuItem value='E124 Nair'>E124 Nair</MenuItem>
                    <MenuItem value='E125 Ritu'>E125 Ritu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {role === 'group users' && (
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth

                  // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                >
                  <InputLabel
                    style={{
                      marginTop: '0px',
                      background: 'white',
                      padding: '0 4px'
                    }}
                    id='demo-mutiple-chip-label'
                  >
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                        Select Group Users
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select Group Users'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    multiple
                    value={selectedItems1}
                    onChange={handleChange1}
                    renderValue={selected => (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          overflowY: 'auto'
                        }}
                        className='scroller-hide'
                      >
                        {selected.map(value => (
                          <Chip
                            color='default'
                            variant='filled'
                            key={value}
                            label={value}
                            onDelete={handleDelete(value)}
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            style={{ margin: 2 }}
                          />
                        ))}
                      </div>
                    )}
                  >
                    <MenuItem value='user1'>user1</MenuItem>
                    <MenuItem value='user2'>user2</MenuItem>
                    <MenuItem value='user3'>user3</MenuItem>
                    <MenuItem value='user4'>user4</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {role === 'role' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-outlined-label'>
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Select Role
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select Role'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      label='Select Role'
                      defaultValue=''
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                    >
                      <MenuItem value=''>
                        <em>Select Role</em>
                      </MenuItem>
                      <MenuItem value='role1'>Role 1</MenuItem>
                      <MenuItem value='role2'>Role 2</MenuItem>
                      <MenuItem value='role3'>Role 3</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px',
                        background: 'white',
                        padding: '0 4px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Business Vertical (LOB Segment 2 Parent 2 )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Vertical (LOB Segment 2 Parent 2 )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems2}
                      onChange={handleChange2}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='9901'>9901</MenuItem>
                      <MenuItem value='9902'>9902</MenuItem>
                      <MenuItem value='9903'>9903</MenuItem>
                      <MenuItem value='>9904'>9904</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px',
                        background: 'white',
                        padding: '0 4px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Business Sub Vertical (LOB Segment 2 Parent 1 )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Sub Vertical (LOB Segment 2 Parent 1 )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems3}
                      onChange={handleChange3}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='2300'>2300</MenuItem>
                      <MenuItem value='2301'>2301</MenuItem>
                      <MenuItem value='2302'>2302</MenuItem>
                      <MenuItem value='2303'>2303</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px',
                        background: 'white',
                        padding: '0 4px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Business Sub Sub Vertical(LOB segment 2 Child )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Sub Sub Vertical(LOB segment 2 Child )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems2}
                      onChange={handleChange2}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='9901'>9901</MenuItem>
                      <MenuItem value='9902'>9902</MenuItem>
                      <MenuItem value='9903'>9903</MenuItem>
                      <MenuItem value='>9904'>9904</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <div className='toggle-select'>
                <span className='toggle-status'>Active</span>
                <FormControlLabel label='' control={<Switch defaultChecked />} />
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 500,
                  lineHeight: '27px'
                }}
              >
                Set Expiry Date Of Role
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                      Start Date
                      {infoDialog && (
                        <span>
                          <Tooltip title='Start Date'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                      End Date
                      {infoDialog && (
                        <span>
                          <Tooltip title='End Date'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={'2'}>
          <Grid container spacing={5} sx={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-outlined-label'>
                  {
                    <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                      Select Predefined Temporary Role To
                      {infoDialog && (
                        <span>
                          <Tooltip title='Select Predefined Temporary Role To'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                </InputLabel>
                <Select
                  label='Select Predefined Temporary Role To'
                  defaultValue=''
                  id='demo-simple-select-outlined'
                  labelId='demo-simple-select-outlined-label'
                >
                  <MenuItem value=''>
                    <em>Select Existing Temporary Role</em>
                  </MenuItem>
                  <MenuItem value='TRole 1'>TRole 1</MenuItem>
                  <MenuItem value='TRole 2'>TRole 2</MenuItem>
                  <MenuItem value='TRole 3'>TRole 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-outlined-label'>
                  {
                    <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                      Assign Temporary Role To
                      {infoDialog && (
                        <span>
                          <Tooltip title='Assign Temporary Role To'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                </InputLabel>
                <Select
                  label='Assign Temporary Role To'
                  defaultValue=''
                  id='demo-simple-select-outlined'
                  labelId='demo-simple-select-outlined-label'
                  onChange={handleTempRole}
                >
                  <MenuItem value=''>
                    <em>Select Option</em>
                  </MenuItem>
                  <MenuItem value='user'>User</MenuItem>
                  <MenuItem value='group users'>Group of Users</MenuItem>
                  <MenuItem value='role'>Role</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {role === 'user' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                        Select User
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select User'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Select User'
                    defaultValue=''
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                  >
                    <MenuItem value=''>
                      <em>Select User</em>
                    </MenuItem>
                    <MenuItem value='E123 Mittal'>E123 Mittal</MenuItem>
                    <MenuItem value='E124 Nair'>E124 Nair</MenuItem>
                    <MenuItem value='E125 Ritu'>E125 Ritu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {role === 'group users' && (
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth

                  // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                >
                  <InputLabel
                    style={{
                      marginTop: '0px',
                      background: 'white',
                      padding: '0 4px'
                    }}
                    id='demo-mutiple-chip-label'
                  >
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                        Select Group Users
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select Group Users'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    multiple
                    value={selectedItems1}
                    onChange={handleChange1}
                    renderValue={selected => (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          overflowY: 'auto'
                        }}
                        className='scroller-hide'
                      >
                        {selected.map(value => (
                          <Chip
                            color='default'
                            variant='filled'
                            key={value}
                            label={value}
                            onDelete={handleDelete(value)}
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            style={{ margin: 2 }}
                          />
                        ))}
                      </div>
                    )}
                  >
                    <MenuItem value='user1'>user1</MenuItem>
                    <MenuItem value='user2'>user2</MenuItem>
                    <MenuItem value='user3'>user3</MenuItem>
                    <MenuItem value='user4'>user4</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {role === 'role' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-outlined-label'>
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Select Role
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select Role'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      label='Select Role'
                      defaultValue=''
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                    >
                      <MenuItem value=''>
                        <em>Select Role</em>
                      </MenuItem>
                      <MenuItem value='role1'>Role 1</MenuItem>
                      <MenuItem value='role2'>Role 2</MenuItem>
                      <MenuItem value='role3'>Role 3</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px',
                        background: 'white',
                        padding: '0 4px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Business Vertical (LOB Segment 2 Parent 2 )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Vertical (LOB Segment 2 Parent 2 )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems2}
                      onChange={handleChange2}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='9901'>9901</MenuItem>
                      <MenuItem value='9902'>9902</MenuItem>
                      <MenuItem value='9903'>9903</MenuItem>
                      <MenuItem value='>9904'>9904</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px',
                        background: 'white',
                        padding: '0 4px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Business Sub Vertical (LOB Segment 2 Parent 1 )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Sub Vertical (LOB Segment 2 Parent 1 )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems3}
                      onChange={handleChange3}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='2300'>2300</MenuItem>
                      <MenuItem value='2301'>2301</MenuItem>
                      <MenuItem value='2302'>2302</MenuItem>
                      <MenuItem value='2303'>2303</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px',
                        background: 'white',
                        padding: '0 4px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Business Sub Sub Vertical(LOB segment 2 Child )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Sub Sub Vertical(LOB segment 2 Child )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems2}
                      onChange={handleChange2}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='9901'>9901</MenuItem>
                      <MenuItem value='9902'>9902</MenuItem>
                      <MenuItem value='9903'>9903</MenuItem>
                      <MenuItem value='>9904'>9904</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <div className='toggle-select'>
                <span className='toggle-status'>Active</span>
                <FormControlLabel label='' control={<Switch defaultChecked />} />
              </div>
            </Grid>

            <Grid item xs={12} sm={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 500,
                  lineHeight: '27px'
                }}
              >
                Set Expiry Date Of Role
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                      Start Date
                      {infoDialog && (
                        <span>
                          <Tooltip title='Start Date'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                      End Date
                      {infoDialog && (
                        <span>
                          <Tooltip title='End Date'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={'3'}>
          <Box sx={{ width: '100%', mt: 5, display: 'flex', justifyContent: 'space-around', alignItems: 'start' }}>
            <Box sx={{ width: '95%' }}>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  const stepProps: { completed?: boolean } = {}

                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  )
                })}
              </Stepper>
            </Box>
            <Box sx={{ width: '5%', mt: 1 }}>
              <IconButton
                disableFocusRipple
                disableTouchRipple
                color='secondary'
                onClick={() => setInfoDialog(prev => !prev)}
              >
                <InfoIcon style={{ color: '#FA5A7D' }} />
              </IconButton>
            </Box>
          </Box>
          {activeStep === 0 && (
            <Grid container spacing={5} sx={{ marginTop: '10px' }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                      Temporary Role Name
                      {infoDialog && (
                        <span>
                          <Tooltip title='Temporary Role Name'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                  value={tempRoleName}
                  placeholder='Temporary Role Name'
                  onChange={e => setTempRoleName(e.target.value)}

                  // InputProps={{
                  //   endAdornment: (
                  //     <Link onClick={handleSetRights} underline='none' sx={{ width: '130px' }}>
                  //       ++ Set Rights
                  //     </Link>
                  //   )
                  // }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                        Assign Role To
                        {infoDialog && (
                          <span>
                            <Tooltip title='Assign Role To'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Assign Role To'
                    defaultValue=''
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleTempRole}
                  >
                    <MenuItem value=''>
                      <em>Select Option</em>
                    </MenuItem>
                    <MenuItem value='user'>User</MenuItem>
                    <MenuItem value='group users'>Group of Users</MenuItem>
                    <MenuItem value='role'>Role</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {role === 'user' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-outlined-label'>
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Select User
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select User'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      label='Select User'
                      defaultValue=''
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                    >
                      <MenuItem value=''>
                        <em>Select User</em>
                      </MenuItem>
                      <MenuItem value='E123 Mittal'>E123 Mittal</MenuItem>
                      <MenuItem value='E124 Nair'>E124 Nair</MenuItem>
                      <MenuItem value='E125 Ritu'>E125 Ritu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {role === 'group users' && (
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px',
                        background: 'white',
                        padding: '0 4px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Select Group Users
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select Group Users'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems1}
                      onChange={handleChange1}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='user1'>user1</MenuItem>
                      <MenuItem value='user2'>user2</MenuItem>
                      <MenuItem value='user3'>user3</MenuItem>
                      <MenuItem value='user4'>user4</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {role === 'role' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>
                        {
                          <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                            Select Role
                            {infoDialog && (
                              <span>
                                <Tooltip title='Select Role'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      </InputLabel>
                      <Select
                        label='Select Role'
                        defaultValue=''
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                      >
                        <MenuItem value=''>
                          <em>Select Role</em>
                        </MenuItem>
                        <MenuItem value='role1'>Role 1</MenuItem>
                        <MenuItem value='role2'>Role 2</MenuItem>
                        <MenuItem value='role3'>Role 3</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth

                      // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                    >
                      <InputLabel
                        style={{
                          marginTop: '0px',
                          background: 'white',
                          padding: '0 4px'
                        }}
                        id='demo-mutiple-chip-label'
                      >
                        {
                          <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                            Business Vertical (LOB Segment 2 Parent 2 )
                            {infoDialog && (
                              <span>
                                <Tooltip title='Business Vertical (LOB Segment 2 Parent 2 )'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      </InputLabel>
                      <Select
                        labelId='demo-mutiple-chip-label'
                        id='demo-mutiple-chip'
                        multiple
                        value={selectedItems2}
                        onChange={handleChange2}
                        renderValue={selected => (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',

                              overflowY: 'auto'
                            }}
                            className='scroller-hide'
                          >
                            {selected.map(value => (
                              <Chip
                                color='default'
                                variant='filled'
                                key={value}
                                label={value}
                                onDelete={handleDelete(value)}
                                deleteIcon={<span className='icon-trailing-icon'></span>}
                                style={{ margin: 2 }}
                              />
                            ))}
                          </div>
                        )}
                      >
                        <MenuItem value='9901'>9901</MenuItem>
                        <MenuItem value='9902'>9902</MenuItem>
                        <MenuItem value='9903'>9903</MenuItem>
                        <MenuItem value='>9904'>9904</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth

                      // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                    >
                      <InputLabel
                        style={{
                          marginTop: '0px',
                          background: 'white',
                          padding: '0 4px'
                        }}
                        id='demo-mutiple-chip-label'
                      >
                        {
                          <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                            Business Sub Vertical (LOB Segment 2 Parent 1 )
                            {infoDialog && (
                              <span>
                                <Tooltip title='Business Sub Vertical (LOB Segment 2 Parent 1 )'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      </InputLabel>
                      <Select
                        labelId='demo-mutiple-chip-label'
                        id='demo-mutiple-chip'
                        multiple
                        value={selectedItems3}
                        onChange={handleChange3}
                        renderValue={selected => (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',

                              overflowY: 'auto'
                            }}
                            className='scroller-hide'
                          >
                            {selected.map(value => (
                              <Chip
                                color='default'
                                variant='filled'
                                key={value}
                                label={value}
                                onDelete={handleDelete(value)}
                                deleteIcon={<span className='icon-trailing-icon'></span>}
                                style={{ margin: 2 }}
                              />
                            ))}
                          </div>
                        )}
                      >
                        <MenuItem value='2300'>2300</MenuItem>
                        <MenuItem value='2301'>2301</MenuItem>
                        <MenuItem value='2302'>2302</MenuItem>
                        <MenuItem value='2303'>2303</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth

                      // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                    >
                      <InputLabel
                        style={{
                          marginTop: '0px',
                          background: 'white',
                          padding: '0 4px'
                        }}
                        id='demo-mutiple-chip-label'
                      >
                        {
                          <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                            Business Sub Sub Vertical(LOB segment 2 Child )
                            {infoDialog && (
                              <span>
                                <Tooltip title='Business Sub Sub Vertical(LOB segment 2 Child )'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      </InputLabel>
                      <Select
                        labelId='demo-mutiple-chip-label'
                        id='demo-mutiple-chip'
                        multiple
                        value={selectedItems2}
                        onChange={handleChange2}
                        renderValue={selected => (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',

                              overflowY: 'auto'
                            }}
                            className='scroller-hide'
                          >
                            {selected.map(value => (
                              <Chip
                                color='default'
                                variant='filled'
                                key={value}
                                label={value}
                                onDelete={handleDelete(value)}
                                deleteIcon={<span className='icon-trailing-icon'></span>}
                                style={{ margin: 2 }}
                              />
                            ))}
                          </div>
                        )}
                      >
                        <MenuItem value='9901'>9901</MenuItem>
                        <MenuItem value='9902'>9902</MenuItem>
                        <MenuItem value='9903'>9903</MenuItem>
                        <MenuItem value='>9904'>9904</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={6}>
                <div className='toggle-select'>
                  <span className='toggle-status'>Active</span>
                  <FormControlLabel label='' control={<Switch defaultChecked />} />
                </div>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant='h6'>Set Expiry Date Of Role</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{ width: '100%' }}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                        Start Date
                        {infoDialog && (
                          <span>
                            <Tooltip title='Start Date'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{ width: '100%' }}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                        End Date
                        {infoDialog && (
                          <span>
                            <Tooltip title='End Date'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          )}
          {activeStep === 1 && (
            <>
              <Box sx={{ marginTop: '40px' }}>
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                          Role Name
                          {infoDialog && (
                            <span>
                              <Tooltip title='Role Name'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                      value={roleName}
                      placeholder='Role Name'
                      onChange={e => setRoleName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={5} sx={{ marginLeft: '50px' }}>
                    <div className='toggle-select'>
                      <span className='toggle-status'>Active</span>
                      <FormControlLabel label='' control={<Switch defaultChecked />} />
                    </div>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ mt: 6 }} />

              <Box sx={{ marginTop: '20px', marginBottom: '20px' }}>
                <Grid container spacing={5}>
                  <Grid item xs={12}>
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 500,
                        lineHeight: '27px'
                      }}
                    >
                      Set Expiry Date Of Role
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        sx={{ width: '100%' }}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                            Start Date
                            {infoDialog && (
                              <span>
                                <Tooltip title='Start Date'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        sx={{ width: '100%' }}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'normal', ml: 3 }}>
                            End Date
                            {infoDialog && (
                              <span>
                                <Tooltip title='End Date'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 500,
                    lineHeight: '27px'
                  }}
                >
                  Set Rights
                </Typography>
                <TreeViewCheckbox />
              </Box>
            </>
          )}
        </TabPanel>
      </TabContext> */}

      {view === 'tab1' && (
        <Box>
          <Grid container spacing={5} sx={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-outlined-label'>
                  {
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      Applications
                      {infoDialog && (
                        <span>
                          <Tooltip title='Applications'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                </InputLabel>
                <Select
                  label='Applications'
                  defaultValue=''
                  id='demo-simple-select-outlined'
                  labelId='demo-simple-select-outlined-label'
                >
                  <MenuItem value=''>
                    <em>Select</em>
                  </MenuItem>
                  <MenuItem value='School ERP'>School ERP</MenuItem>
                  <MenuItem value='Oracle'>Oracle</MenuItem>
                  <MenuItem value='LMS'>LMS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                id='autocomplete-multiple-filled'
                defaultValue={[Auto1[1].title]}
                options={Auto1.map(option => option.title)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Select HRIS Unique Role
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select HRIS Unique Role'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                    placeholder='Select HRIS Unique Role'
                  />
                )}
                renderTags={(value: string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip
                      color='default'
                      variant='filled'
                      label={option}
                      deleteIcon={<span className='icon-trailing-icon'></span>}
                      {...(getTagProps({ index }) as {})}
                      key={index}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={
                  <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                    ERP Role
                    {infoDialog && (
                      <span>
                        <Tooltip title='ERP Role'>
                          <InfoIcon />
                        </Tooltip>
                      </span>
                    )}
                  </Box>
                }
                value={erpRoleName}
                placeholder='ERP Role Name'
                onChange={e => setErpRoleName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-outlined-label'>
                  {
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      Assign Temporary Role To
                      {infoDialog && (
                        <span>
                          <Tooltip title='Assign Temporary Role To'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                </InputLabel>
                <Select
                  label='Assign Temporary Role To'
                  defaultValue=''
                  id='demo-simple-select-outlined'
                  labelId='demo-simple-select-outlined-label'
                  onChange={handleTempRole}
                >
                  <MenuItem value=''>
                    <em>Select Option</em>
                  </MenuItem>
                  <MenuItem value='user'>User</MenuItem>
                  <MenuItem value='group users'>Group of Users</MenuItem>
                  <MenuItem value='role'>Role</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {role === 'user' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Select User
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select User'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Select User'
                    defaultValue=''
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                  >
                    <MenuItem value=''>
                      <em>Select User</em>
                    </MenuItem>
                    <MenuItem value='E123 Mittal'>E123 Mittal</MenuItem>
                    <MenuItem value='E124 Nair'>E124 Nair</MenuItem>
                    <MenuItem value='E125 Ritu'>E125 Ritu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {role === 'group users' && (
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth

                  // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                >
                  <InputLabel
                    style={{
                      marginTop: '0px'
                    }}
                    id='demo-mutiple-chip-label'
                  >
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Select Group Users
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select Group Users'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Select Group Users'
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    multiple
                    value={selectedItems1}
                    onChange={handleChange1}
                    renderValue={selected => (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          overflowY: 'auto'
                        }}
                        className='scroller-hide'
                      >
                        {selected.map(value => (
                          <Chip
                            color='default'
                            variant='filled'
                            key={value}
                            label={value}
                            onDelete={handleDelete(value)}
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            style={{ margin: 2 }}
                          />
                        ))}
                      </div>
                    )}
                  >
                    <MenuItem value='user1'>user1</MenuItem>
                    <MenuItem value='user2'>user2</MenuItem>
                    <MenuItem value='user3'>user3</MenuItem>
                    <MenuItem value='user4'>user4</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {role === 'role' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-outlined-label'>
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Select Role
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select Role'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      label='Select Role'
                      defaultValue=''
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                    >
                      <MenuItem value=''>
                        <em>Select Role</em>
                      </MenuItem>
                      <MenuItem value='role1'>Role 1</MenuItem>
                      <MenuItem value='role2'>Role 2</MenuItem>
                      <MenuItem value='role3'>Role 3</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Business Vertical (LOB Segment 2 Parent 2 )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Vertical (LOB Segment 2 Parent 2 )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems2}
                      onChange={handleChange2}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='9901'>9901</MenuItem>
                      <MenuItem value='9902'>9902</MenuItem>
                      <MenuItem value='9903'>9903</MenuItem>
                      <MenuItem value='>9904'>9904</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Business Sub Vertical (LOB Segment 2 Parent 1 )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Sub Vertical (LOB Segment 2 Parent 1 )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      label='Business Sub Vertical (LOB Segment 2 Parent 1 )'
                      multiple
                      value={selectedItems3}
                      onChange={handleChange3}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='2300'>2300</MenuItem>
                      <MenuItem value='2301'>2301</MenuItem>
                      <MenuItem value='2302'>2302</MenuItem>
                      <MenuItem value='2303'>2303</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Business Sub Sub Vertical(LOB segment 2 Child )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Sub Sub Vertical(LOB segment 2 Child )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      label='Business Sub Sub Vertical(LOB segment 2 Child )'
                      multiple
                      value={selectedItems2}
                      onChange={handleChange2}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='9901'>9901</MenuItem>
                      <MenuItem value='9902'>9902</MenuItem>
                      <MenuItem value='9903'>9903</MenuItem>
                      <MenuItem value='>9904'>9904</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <div className='toggle-select'>
                <span className='toggle-status'>Active</span>
                <FormControlLabel label='' control={<Switch defaultChecked />} />
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='subtitle1'
                sx={{
                  fontWeight: 500,
                  lineHeight: '24px'
                }}
              >
                Set Expiry Date Of Role
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  slots={{
                    openPickerIcon: CalendarIcon
                  }}
                  format='DD/MM/YYYY'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      Start Date
                      {infoDialog && (
                        <span>
                          <Tooltip title='Start Date'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  slots={{
                    openPickerIcon: CalendarIcon
                  }}
                  format='DD/MM/YYYY'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      End Date
                      {infoDialog && (
                        <span>
                          <Tooltip title='End Date'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      )}
      {view === 'tab2' && (
        <Box>
          <Grid container spacing={5} sx={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-outlined-label'>
                  {
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      Temporary Role Name
                      {infoDialog && (
                        <span>
                          <Tooltip title='Temporary Role Name'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                </InputLabel>
                <Select
                  label='Temporary Role Name'
                  defaultValue=''
                  id='demo-simple-select-outlined'
                  labelId='demo-simple-select-outlined-label'
                >
                  <MenuItem value=''>
                    <em>Select Existing Temporary Role</em>
                  </MenuItem>
                  <MenuItem value='TRole 1'>TRole 1</MenuItem>
                  <MenuItem value='TRole 2'>TRole 2</MenuItem>
                  <MenuItem value='TRole 3'>TRole 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='demo-simple-select-outlined-label'>
                  {
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      Assign Role To
                      {infoDialog && (
                        <span>
                          <Tooltip title='Assign Role To'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                </InputLabel>
                <Select
                  label='Assign Role To'
                  defaultValue=''
                  id='demo-simple-select-outlined'
                  labelId='demo-simple-select-outlined-label'
                  onChange={handleTempRole}
                >
                  <MenuItem value=''>
                    <em>Select Option</em>
                  </MenuItem>
                  <MenuItem value='user'>User</MenuItem>
                  <MenuItem value='group users'>Group of Users</MenuItem>
                  <MenuItem value='role'>Role</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {role === 'user' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Select User
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select User'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Select User'
                    defaultValue=''
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                  >
                    <MenuItem value=''>
                      <em>Select User</em>
                    </MenuItem>
                    <MenuItem value='E123 Mittal'>E123 Mittal</MenuItem>
                    <MenuItem value='E124 Nair'>E124 Nair</MenuItem>
                    <MenuItem value='E125 Ritu'>E125 Ritu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {role === 'group users' && (
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth

                  // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                >
                  <InputLabel
                    style={{
                      marginTop: '0px'
                    }}
                    id='demo-mutiple-chip-label'
                  >
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Select Group Users
                        {infoDialog && (
                          <span>
                            <Tooltip title='Select Group Users'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    label='Select Group Users'
                    multiple
                    value={selectedItems1}
                    onChange={handleChange1}
                    renderValue={selected => (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          overflowY: 'auto'
                        }}
                        className='scroller-hide'
                      >
                        {selected.map(value => (
                          <Chip
                            color='default'
                            variant='filled'
                            key={value}
                            label={value}
                            onDelete={handleDelete(value)}
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            style={{ margin: 2 }}
                          />
                        ))}
                      </div>
                    )}
                  >
                    <MenuItem value='user1'>user1</MenuItem>
                    <MenuItem value='user2'>user2</MenuItem>
                    <MenuItem value='user3'>user3</MenuItem>
                    <MenuItem value='user4'>user4</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {role === 'role' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-outlined-label'>
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Select Role
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select Role'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      label='Select Role'
                      defaultValue=''
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                    >
                      <MenuItem value=''>
                        <em>Select Role</em>
                      </MenuItem>
                      <MenuItem value='role1'>Role 1</MenuItem>
                      <MenuItem value='role2'>Role 2</MenuItem>
                      <MenuItem value='role3'>Role 3</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Business Vertical (LOB Segment2 Parent2 )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Vertical (LOB Segment 2 Parent 2 )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      label='Business Vertical (LOB Segment 2 Parent 2 )'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems2}
                      onChange={handleChange2}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='9901'>9901</MenuItem>
                      <MenuItem value='9902'>9902</MenuItem>
                      <MenuItem value='9903'>9903</MenuItem>
                      <MenuItem value='>9904'>9904</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Business Sub Vertical (LOB Segment2 Parent1 )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Sub Vertical (LOB Segment2 Parent1 )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      label='Business Sub Vertical (LOB Segment2 Parent1 )'
                      multiple
                      value={selectedItems3}
                      onChange={handleChange3}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='2300'>2300</MenuItem>
                      <MenuItem value='2301'>2301</MenuItem>
                      <MenuItem value='2302'>2302</MenuItem>
                      <MenuItem value='2303'>2303</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Business Sub Sub Vertical(LOB Segment2 Child )
                          {infoDialog && (
                            <span>
                              <Tooltip title='Business Sub Sub Vertical(LOB Segment2 Child )'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      label='Business Sub Sub Vertical(LOB Segment2 Child )'
                      multiple
                      value={selectedItems2}
                      onChange={handleChange2}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',

                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='9901'>9901</MenuItem>
                      <MenuItem value='9902'>9902</MenuItem>
                      <MenuItem value='9903'>9903</MenuItem>
                      <MenuItem value='>9904'>9904</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <div className='toggle-select'>
                <span className='toggle-status'>Active</span>
                <FormControlLabel label='' control={<Switch defaultChecked />} />
              </div>
            </Grid>

            <Grid item xs={12} sm={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='subtitle1'
                sx={{
                  fontWeight: 500,
                  lineHeight: '24px'
                }}
              >
                Set Expiry Date Of Role
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  slots={{
                    openPickerIcon: CalendarIcon
                  }}
                  format='DD/MM/YYYY'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      Start Date
                      {infoDialog && (
                        <span>
                          <Tooltip title='Start Date'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  slots={{
                    openPickerIcon: CalendarIcon
                  }}
                  format='DD/MM/YYYY'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      End Date
                      {infoDialog && (
                        <span>
                          <Tooltip title='End Date'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      )}
      {view === 'tab3' && (
        <Box>
          <Box sx={{ width: '100%', mt: 5, display: 'flex', justifyContent: 'space-around', alignItems: 'start' }}>
            <Box sx={{ width: '95%' }}>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  const stepProps: { completed?: boolean } = {}

                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  )
                })}
              </Stepper>
            </Box>
            <Box sx={{ width: '5%', mt: 2 }}>
              <IconButton
                disableFocusRipple
                disableTouchRipple
                color='secondary'
                onClick={() => setInfoDialog(prev => !prev)}
              >
                <InfoIcon style={{ color: '#FA5A7D' }} />
              </IconButton>
            </Box>
          </Box>
          {activeStep === 0 && (
            <Grid container spacing={5} sx={{ marginTop: '10px' }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      Temporary Role Name
                      {infoDialog && (
                        <span>
                          <Tooltip title='Temporary Role Name'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                  value={tempRoleName}
                  placeholder='Temporary Role Name'
                  onChange={e => setTempRoleName(e.target.value)}

                  // InputProps={{
                  //   endAdornment: (
                  //     <Link onClick={handleSetRights} underline='none' sx={{ width: '130px' }}>
                  //       ++ Set Rights
                  //     </Link>
                  //   )
                  // }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Assign Role To
                        {infoDialog && (
                          <span>
                            <Tooltip title='Assign Role To'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Assign Role To'
                    defaultValue=''
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleTempRole}
                  >
                    <MenuItem value=''>
                      <em>Select Option</em>
                    </MenuItem>
                    <MenuItem value='user'>User</MenuItem>
                    <MenuItem value='group users'>Group of Users</MenuItem>
                    <MenuItem value='role'>Role</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {role === 'user' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-outlined-label'>
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Select User
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select User'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      label='Select User'
                      defaultValue=''
                      id='demo-simple-select-outlined'
                      labelId='demo-simple-select-outlined-label'
                    >
                      <MenuItem value=''>
                        <em>Select User</em>
                      </MenuItem>
                      <MenuItem value='E123 Mittal'>E123 Mittal</MenuItem>
                      <MenuItem value='E124 Nair'>E124 Nair</MenuItem>
                      <MenuItem value='E125 Ritu'>E125 Ritu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {role === 'group users' && (
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth

                    // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                  >
                    <InputLabel
                      style={{
                        marginTop: '0px'
                      }}
                      id='demo-mutiple-chip-label'
                    >
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Select Group Users
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select Group Users'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      labelId='demo-mutiple-chip-label'
                      label='Select Group Users'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems1}
                      onChange={handleChange1}
                      renderValue={selected => (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {selected.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                        </div>
                      )}
                    >
                      <MenuItem value='user1'>user1</MenuItem>
                      <MenuItem value='user2'>user2</MenuItem>
                      <MenuItem value='user3'>user3</MenuItem>
                      <MenuItem value='user4'>user4</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {role === 'role' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id='demo-simple-select-outlined-label'>
                        {
                          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                            Select Role
                            {infoDialog && (
                              <span>
                                <Tooltip title='Select Role'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      </InputLabel>
                      <Select
                        label='Select Role'
                        defaultValue=''
                        id='demo-simple-select-outlined'
                        labelId='demo-simple-select-outlined-label'
                      >
                        <MenuItem value=''>
                          <em>Select Role</em>
                        </MenuItem>
                        <MenuItem value='role1'>Role 1</MenuItem>
                        <MenuItem value='role2'>Role 2</MenuItem>
                        <MenuItem value='role3'>Role 3</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth

                      // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                    >
                      <InputLabel
                        style={{
                          marginTop: '0px'
                        }}
                        id='demo-mutiple-chip-label'
                      >
                        {
                          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                            Business Vertical (LOB Segment2 Parent2 )
                            {infoDialog && (
                              <span>
                                <Tooltip title='Business Vertical (LOB Segment2 Parent2 )'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      </InputLabel>
                      <Select
                        labelId='demo-mutiple-chip-label'
                        label='Business Vertical (LOB Segment2 Parent2 )'
                        id='demo-mutiple-chip'
                        multiple
                        value={selectedItems2}
                        onChange={handleChange2}
                        renderValue={selected => (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',

                              overflowY: 'auto'
                            }}
                            className='scroller-hide'
                          >
                            {selected.map(value => (
                              <Chip
                                color='default'
                                variant='filled'
                                key={value}
                                label={value}
                                onDelete={handleDelete(value)}
                                deleteIcon={<span className='icon-trailing-icon'></span>}
                                style={{ margin: 2 }}
                              />
                            ))}
                          </div>
                        )}
                      >
                        <MenuItem value='9901'>9901</MenuItem>
                        <MenuItem value='9902'>9902</MenuItem>
                        <MenuItem value='9903'>9903</MenuItem>
                        <MenuItem value='>9904'>9904</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth

                      // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                    >
                      <InputLabel
                        style={{
                          marginTop: '0px'
                        }}
                        id='demo-mutiple-chip-label'
                      >
                        {
                          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                            Business Sub Vertical (LOB Segment2 Parent1 )
                            {infoDialog && (
                              <span>
                                <Tooltip title='Business Sub Vertical (LOB Segment 2 Parent 1 )'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      </InputLabel>
                      <Select
                        labelId='demo-mutiple-chip-label'
                        label='Business Sub Vertical (LOB Segment2 Parent1 )'
                        id='demo-mutiple-chip'
                        multiple
                        value={selectedItems3}
                        onChange={handleChange3}
                        renderValue={selected => (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',

                              overflowY: 'auto'
                            }}
                            className='scroller-hide'
                          >
                            {selected.map(value => (
                              <Chip
                                color='default'
                                variant='filled'
                                key={value}
                                label={value}
                                onDelete={handleDelete(value)}
                                deleteIcon={<span className='icon-trailing-icon'></span>}
                                style={{ margin: 2 }}
                              />
                            ))}
                          </div>
                        )}
                      >
                        <MenuItem value='2300'>2300</MenuItem>
                        <MenuItem value='2301'>2301</MenuItem>
                        <MenuItem value='2302'>2302</MenuItem>
                        <MenuItem value='2303'>2303</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth

                      // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                    >
                      <InputLabel
                        style={{
                          marginTop: '0px'
                        }}
                        id='demo-mutiple-chip-label'
                      >
                        {
                          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                            Business Sub Sub Vertical(LOB Segment2 Child )
                            {infoDialog && (
                              <span>
                                <Tooltip title='Business Sub Sub Vertical(LOB Segment2 Child )'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      </InputLabel>
                      <Select
                        labelId='demo-mutiple-chip-label'
                        label='Business Sub Sub Vertical(LOB Segment2 Child )'
                        id='demo-mutiple-chip'
                        multiple
                        value={selectedItems2}
                        onChange={handleChange2}
                        renderValue={selected => (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',

                              overflowY: 'auto'
                            }}
                            className='scroller-hide'
                          >
                            {selected.map(value => (
                              <Chip
                                color='default'
                                variant='filled'
                                key={value}
                                label={value}
                                onDelete={handleDelete(value)}
                                deleteIcon={<span className='icon-trailing-icon'></span>}
                                style={{ margin: 2 }}
                              />
                            ))}
                          </div>
                        )}
                      >
                        <MenuItem value='9901'>9901</MenuItem>
                        <MenuItem value='9902'>9902</MenuItem>
                        <MenuItem value='9903'>9903</MenuItem>
                        <MenuItem value='>9904'>9904</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={6}>
                <div className='toggle-select'>
                  <span className='toggle-status'>Active</span>
                  <FormControlLabel label='' control={<Switch defaultChecked />} />
                </div>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 500,
                    lineHeight: '24px'
                  }}
                >
                  Set Expiry Date Of Role
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{ width: '100%' }}
                    slots={{
                      openPickerIcon: CalendarIcon
                    }}
                    format='DD/MM/YYYY'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Start Date
                        {infoDialog && (
                          <span>
                            <Tooltip title='Start Date'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{ width: '100%' }}
                    slots={{
                      openPickerIcon: CalendarIcon
                    }}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        End Date
                        {infoDialog && (
                          <span>
                            <Tooltip title='End Date'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          )}
          {activeStep === 1 && (
            <>
              <Box sx={{ marginTop: '40px' }}>
                <Grid container spacing={5}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Role Name
                          {infoDialog && (
                            <span>
                              <Tooltip title='Role Name'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                      value={roleName}
                      placeholder='Role Name'
                      onChange={e => setRoleName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={5} sx={{ marginLeft: '50px' }}>
                    <div className='toggle-select'>
                      <span className='toggle-status'>Active</span>
                      <FormControlLabel label='' control={<Switch defaultChecked />} />
                    </div>
                  </Grid>
                </Grid>
              </Box>
              {/* <Divider sx={{ mt: 6 }} /> */}

              <Box sx={{ marginTop: '20px', marginBottom: '20px' }}>
                <Grid container spacing={5}>
                  <Grid item xs={12}>
                    <Typography
                      variant='subtitle1'
                      sx={{
                        fontWeight: 500,
                        lineHeight: '24px'
                      }}
                    >
                      Set Expiry Date Of Role
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        sx={{ width: '100%' }}
                        slots={{
                          openPickerIcon: CalendarIcon
                        }}
                        format='DD/MM/YYYY'
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                            Start Date
                            {infoDialog && (
                              <span>
                                <Tooltip title='Start Date'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        sx={{ width: '100%' }}
                        slots={{
                          openPickerIcon: CalendarIcon
                        }}
                        format='DD/MM/YYYY'
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                            End Date
                            {infoDialog && (
                              <span>
                                <Tooltip title='End Date'>
                                  <InfoIcon />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography
                  variant='body1'
                  sx={{
                    fontWeight: 500,
                    lineHeight: '27px',
                    mb: 3
                  }}
                >
                  Set Rights
                </Typography>
                <TreeViewCheckbox />
              </Box>
            </>
          )}
        </Box>
      )}

      <Box sx={{ padding: '10px 10px', mt: 8 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size='large' variant='outlined' color='inherit' sx={{ mr: 2 }} onClick={handleBack}>
              {activeStep === 0 ? 'Cancel' : 'Go Back'}
            </Button>
            <Button size='large' variant='contained' color='inherit' sx={{ mr: 2 }}>
              Save As Draft
            </Button>
            <Button
              size='large'
              variant='contained'
              color='secondary'
              startIcon={activeStep === 0 && view == 'tab3' ? <span className='icon-next'></span> : null}
              onClick={activeStep == 1 || view == 'tab1' || view == 'tab2' ? handleSubmit : handleNext}
            >
              {activeStep === 0 && view == 'tab3' ? ' Next' : 'Submit'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      <SuccessDialog
        title='Roles & Rights Created Successfully'
        openDialog={openDialog}
        handleClose={handleCloseDialog}
      />
      {draftDialog && (
        <SuccessDialog title='Draft Saved Successfully!' openDialog={draftDialog} handleClose={handleDraftClose} />
      )}
    </Box>
  )
}

export default CreateTemporaryRole
