import React, { useState, useEffect } from 'react'
import { Box, borderRadius, fontWeight, minWidth } from '@mui/system'
import {
  Button,
  Tabs,
  Popover,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  TextField,
  InputAdornment,
  Card,
  Divider,
  IconButton
} from '@mui/material'
import Tab, { TabProps } from '@mui/material/Tab'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { styled } from '@mui/system'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import UserIcon from 'src/layouts/components/UserIcon'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded'
import Badge, { BadgeProps } from '@mui/material/Badge'
import { getRequest, postRequest, putRequest } from 'src/services/apiService'
import Grid from '@mui/material/Grid'
import { Checkbox, Autocomplete, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  minWidth: '190px',
  '& .MuiTab-root': {
    minWidth: '190px'
  },
  '& .MuiTabs-vertical': {
    minWidth: '190px'
  },
  '& .MuiTabs-scroller': {
    marginRight: 10
  }
}))
const StyledTab = styled((props: TabProps) => <Tab {...props} />)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '20px',
  color: '#484646',
  backgroundColor: '#fff',
  borderRadius: '8px',
  minHeight: '40px',
  marginBottom: theme.spacing(1),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: '10px 12px',
  '& .MuiTab-iconWrapper': {
    marginBottom: 0,
    color: theme.palette.text.primary
  },
  '& .MuiTypography-root': {
    fontWeight: `500 !important`,
    fontSize: '14px !important',
    lineHeight: '21px !important',
    color: theme.palette.customColors.mainText
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.customColors.primaryLightest,
    color: theme.palette.customColors.mainText
  },
  '&:hover': {
    boxShadow: 'none'
  }
}))
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.customColors.primaryLightest,
    color: theme.palette.customColors.mainText
  }
}))

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`
  }
}

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 15,
    top: 20,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '8px'
  }
}))

// column chips
// interface StyledChipProps {
//   selected: boolean
// }

const StyledChipProps = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorPrimary': {
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: '8px',
    padding: '9px 24px',
    background: '#4849DA14 !important',
    color: '#4849DA !important'
  },
  '&.MuiChip-colorDefault': {
    border: `1px solid ${theme.palette.grey[300]} !important`,
    borderRadius: '8px',
    padding: '9px 20px',
    background: `${theme.palette.customColors.text6} !important`,
    color: `${theme.palette.customColors.mainText} `
  }
}))

interface FilterProps {
  filterOpen?: null
  setFilterOpen?: any
  title?: string
  applyFilterOptions?: any // array of objects
  academicYears?: string[]
  clearFilter?: any
  options?: any
  optionColumns?: any
}

export default function FilterCRMComponent(props: FilterProps) {
  const { filterOpen, setFilterOpen, title, applyFilterOptions, academicYears, clearFilter, options, optionColumns } =
    props
  // popover
  const handleClose = () => {
    setFilterOpen(null)
  }

  const applyFilter = () => {
    applyFilterOptions(filterOptions)
  }

  const open = Boolean(filterOpen)
  const id = open ? 'simple-popover' : undefined

  // tabs
  const [value, setValue] = React.useState(0)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const [inputValue, setInputValue] = useState('')
  const [operationName, setOperationName] = useState('')
  const [columnName, setColumnName] = useState('')
  const [academicYearFilterOptions, setAcademicYearFilterOptions] = useState<string[]>([])

  const filterInputValue = (event: any) => {
    setInputValue(event.target.value)
  }
  // filter - status

  const statusOptionsList = [
    {
      id: 1,
      name: 'Active',
      value: 1
    },
    {
      id: 2,
      name: 'Inactive',
      value: 0
    }
  ]
  interface Operators {
    id: number
    name: string
    value: string
  }
  // type columnName = 'schoolCategory' | 'hrisCode' | 'name' | 'lob' | 'status'; // Add other column names as needed

  const operators: Operators[] = [
    { id: 1, name: 'Contains', value: 'contains' },
    { id: 2, name: 'Equals', value: 'equals' },
    { id: 3, name: 'StartsWith', value: 'startsWith' },
    { id: 4, name: 'EndsWith', value: 'endsWith' },
    { id: 5, name: 'IsEmpty', value: 'isEmpty' },
    { id: 6, name: 'IsNotEmpty', value: 'isNotEmpty' },
    { id: 7, name: 'IsAnyOf', value: 'isAnyOf' }
  ]

  const [searhRole, setSearchRole] = useState<string>('')
  // const [selectedHrisItems, setSelectedHrisItems] = useState<string[]>([]);
  const [loadingCount, setLoadingCount] = useState(0)
  const [schoolCategories, setSchoolCategories] = useState<
    Array<{
      id: number
      attributes: any
    }>
  >([])
  const [hrisdata, setHrisDta] = useState<
    Array<{
      id: number
      attributes: any
    }>
  >([])
  const [usersdata, setUsersdata] = useState<
    Array<{
      id: number
      attributes: any
    }>
  >([])
  const [infoDialog, setInfoDialog] = useState(false)

  // column

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const handleToggle = (option: string) => {
    setSelectedOptions(prevSelected => {
      if (prevSelected.includes(option)) {
        return prevSelected.filter(item => item !== option)
      } else {
        return [...prevSelected, option]
      }
    })
  }
  const [filterCoulmnValue, setfilterCoulmnValue] = useState<string>('')

  const handleCoulmnFilter = (status: string) => {
    setfilterCoulmnValue(status)
    const index = options.findIndex((x: any) => x.value === status)
    if (index >= 0) {
      setColumnName(options[index].name)
    }
  }

  const [filterOptions, setFilterOptions] = useState<{ column: any; operation: any; search: any }[]>([])

  const [filterOperatorValue, setfilterOperatorCoulmnValue] = useState<string>('')
  const [disbaleFilterInputValue, setDisbaleFilterInputValues] = useState(false)

  const handleCoulmnOperatorFilter = (status: string) => {
    const index = operators.findIndex((x: any) => x.value === status)
    if (index >= 0) {
      setOperationName(operators[index].name)
    }

    // if (status == 5 || status == 6) {
    //   setDisbaleFilterInputValues(true);
    // } else {
    //   setDisbaleFilterInputValues(false);
    // }
    setfilterOperatorCoulmnValue(status)
  }

  const handleSchoolCategories = async (event: any, value: any, name: any) => {
    if (name === 'academicYear') {
      const item: any = academicYearFilterOptions.find((item: any) => item === value)
      setInputValue(item)
    }
  }

  const AddFilterOption = () => {
    const tempfilterOptions = {
      column: filterCoulmnValue,
      operation: filterOperatorValue,
      search: inputValue
    }
    setFilterOptions(prevValues => [...prevValues, tempfilterOptions])

    setfilterCoulmnValue('')
    setfilterOperatorCoulmnValue('')
    setInputValue('')
    setOperationName('')
    setOperationName('')
    setColumnName('')
  }

  const resetFilterOption = () => {
    setfilterCoulmnValue('')
    setfilterOperatorCoulmnValue('')
    setInputValue('')
  }

  const deleteFilterOption = (index: number) => {
    setFilterOptions(prevValues => prevValues.filter((_, i) => i !== index))
  }

  const clearAllFilters = () => {
    setfilterCoulmnValue('')
    setfilterOperatorCoulmnValue('')
    setInputValue('')
    setFilterOptions([])
    clearFilter()
  }

  useEffect(() => {
    if (Array.isArray(academicYears)) {
      setAcademicYearFilterOptions(academicYears)
    }
  }, [academicYears])

  const incrementLoading = () => setLoadingCount(count => count + 1)
  const decrementLoading = () => setLoadingCount(count => count - 1)

  return (
    <>
      <Popover
        id={id}
        open={open}
        anchorEl={filterOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        sx={{
          width: '600px',
          '.MuiPopover-paper': {
            height: '100vh',
            top: '22px'
          }
        }}
        style={{ padding: '24px' }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
          <Typography
            color={'customColors.mainText'}
            style={{ lineHeight: '30px', fontWeight: 500 }}
            sx={{ p: 2 }}
            variant='h6'
          >
            Filters
          </Typography>
          <Button style={{ color: '#666' }} onClick={() => clearAllFilters()}>
            Clear Filter
          </Button>
        </Stack>
        <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}>
          <StyledTabs
            orientation='vertical'
            variant='scrollable'
            value={value}
            onChange={handleChange}
            aria-label='Vertical tabs example'
          >
            <StyledTab
              icon={<span className='icon-filter-search'></span>}
              label={
                <Stack direction='row' justifyContent='space-between' alignItems='center' flex='1'>
                  <Typography>Filter</Typography>
                  <Badge badgeContent={filterOptions?.length} color='secondary' sx={{ marginRight: '10px' }} />
                </Stack>
              }
              {...a11yProps(0)}
            />
            <StyledTab
              icon={<span className='icon-slider-horizontal'></span>}
              label={
                <Stack direction='row' justifyContent='space-between' alignItems='center' flex='1'>
                  <Typography>Column</Typography>
                  <Badge badgeContent={selectedOptions?.length} color='secondary' sx={{ marginRight: '10px' }} />
                </Stack>
              }
              {...a11yProps(1)}
            />
            {/* <StyledTab
              icon={<span className='icon-sticker'></span>}
              label={
                <Stack direction='row' justifyContent='space-between' alignItems='center' flex='1'>
                  <Typography>Sticky Column</Typography>
                  <Badge badgeContent={1} color='secondary' sx={{ marginRight: '10px' }} />
                </Stack>
              }
              {...a11yProps(2)}
            /> */}
          </StyledTabs>
          <Divider sx={{ ml: 3, mr: 3 }} orientation='vertical' flexItem />
          <TabPanel value={value} index={0}>
            <div>
              <Card
                variant='outlined'
                style={{
                  borderColor: '#e0e0e0',
                  backgroundColor: '#fff',
                  padding: '0 20px'
                }}
              >
                <Accordion disableGutters style={{ margin: 0, padding: 0 }}>
                  <AccordionSummary
                    expandIcon={<ArrowRightIcon />}
                    aria-controls='panel2-content'
                    id='panel2-header'
                    sx={{ padding: 0, margin: 0 }}
                  >
                    <Stack direction='column' justifyContent='center' alignItems='flexStart' spacing={2}>
                      <Typography variant='caption' sx={{ fontSize: '12px !important' }}>
                        Column
                      </Typography>
                      <Typography
                        variant='subtitle2'
                        color={'text.primary'}
                        style={{ marginTop: '0', fontWeight: 500 }}
                      >
                        {columnName ? columnName : ''}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ margin: '0 4px', padding: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexWrap: 'wrap'
                      }}
                    >
                      {options.map((status: any, index: number) => (
                        <StyledChipProps
                          key={index}
                          label={status.name}
                          variant='filled'
                          sx={{ margin: '4px' }}
                          color={filterCoulmnValue == status.value ? 'primary' : 'default'}
                          onClick={() => handleCoulmnFilter(status.value)}
                        />
                      ))}
                    </div>
                  </AccordionDetails>
                </Accordion>
                <Accordion disableGutters style={{ margin: 0, padding: 0 }}>
                  <AccordionSummary
                    expandIcon={<ArrowRightIcon />}
                    aria-controls='panel2-content'
                    id='panel2-header'
                    sx={{ padding: 0, margin: 0 }}
                  >
                    <Stack direction='column' justifyContent='center' alignItems='flexStart' spacing={2}>
                      <Typography variant='caption' sx={{ fontSize: '12px !important' }}>
                        Operator
                      </Typography>
                      <Typography
                        variant='subtitle2'
                        color={'text.primary'}
                        style={{ marginTop: '0', fontWeight: 500 }}
                      >
                        {operationName ? operationName : ''}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ margin: '0 4px', padding: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexWrap: 'wrap'
                      }}
                    >
                      {operators.map((status, index) => (
                        <React.Fragment key={status.id}>
                          <StyledChipProps
                            label={status.name}
                            variant='filled'
                            sx={{ margin: '4px' }}
                            color={filterOperatorValue === status.value ? 'primary' : 'default'}
                            onClick={() => handleCoulmnOperatorFilter(status.value)}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                  </AccordionDetails>
                </Accordion>
                <Stack spacing={2}>
                  {filterCoulmnValue == 'academicYear' ? (
                    <>
                      <Stack spacing={2}>
                        <Grid item xs={12} sm={12}>
                          <Autocomplete
                            id='autocomplete-multiple-filled'
                            popupIcon={<span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>}
                            options={academicYearFilterOptions.map((option: any) => option)}
                            onChange={(event, value) => handleSchoolCategories(event, value, 'academicYear')}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Academic Year
                                    {infoDialog && (
                                      <span>
                                        <Tooltip title='Academic Year'>
                                          <InfoIcon style={{ color: '#a3a3a3' }} />
                                        </Tooltip>
                                      </span>
                                    )}
                                  </Box>
                                }
                                placeholder='Academic Year'
                              />
                            )}
                          />
                        </Grid>
                      </Stack>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ paddingTop: '14px' }}>Value</Typography>
                      <TextField
                        id='standard-basic'
                        placeholder='Text'
                        variant='standard'
                        value={inputValue} // Bind the value to state
                        onChange={filterInputValue} // Handle change events
                        disabled={disbaleFilterInputValue}
                        sx={{ marginTop: '0 !important' }}
                        InputLabelProps={{
                          style: {
                            fontWeight: 500,
                            color: '#212121',
                            fontSize: '14px'
                          }
                        }}
                      />
                    </>
                  )}
                </Stack>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'end',
                    padding: '4px 0px'
                  }}
                >
                  <Button variant='text' onClick={() => resetFilterOption()}>
                    Reset
                  </Button>
                  <Button variant='text' onClick={() => AddFilterOption()}>
                    Add More
                  </Button>
                </div>
              </Card>
              {filterOptions.map((status: any, index) => (
                <>
                  <Card
                    variant='outlined'
                    style={{
                      backgroundColor: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      gap: '10px',
                      margin: '12px 0',
                      padding: '10px'
                    }}
                  >
                    <Typography color={'customColors.text3'}>
                      {options.find((op: any) => op.value === status.column)?.name}
                    </Typography>

                    <Typography color={'customColors.text3'}>
                      {' '}
                      {operators.find(op => op.value === status.operation)?.name}
                    </Typography>
                    <Typography color={'customColors.text3'}>{status.search}</Typography>
                    <Divider orientation='vertical' flexItem />
                    <IconButton
                      aria-label='delete'
                      color='primary'
                      sx={{ width: '20px', height: '20px' }}
                      onClick={() => deleteFilterOption(index)}
                    >
                      <HighlightOffRoundedIcon style={{ color: '#a3a3a3' }} />
                    </IconButton>
                  </Card>
                </>
              ))}
              ;
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Stack direction='column' alignItems='center' spacing={2}>
              <TextField
                value={searhRole}
                placeholder='Search here...'
                onChange={e => setSearchRole(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <UserIcon icon='mdi:magnify' />
                    </InputAdornment>
                  )
                }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    height: '40px'
                  }
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  flexWrap: 'wrap'
                }}
              >
                {optionColumns.map((option: any, index: number) => (
                  <StyledChipProps
                    key={index}
                    label={option}
                    clickable
                    onClick={() => handleToggle(option)}
                    color={selectedOptions.includes(option) ? 'primary' : 'default'}
                    variant='filled'
                    style={{ margin: '4px' }}
                  />
                ))}
              </div>
            </Stack>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Stack direction='column' alignItems='center' spacing={2}>
              <TextField
                value={searhRole}
                placeholder='Search here...'
                onChange={e => setSearchRole(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <UserIcon icon='mdi:magnify' />
                    </InputAdornment>
                  )
                }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    height: '40px'
                  }
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  flexWrap: 'wrap'
                }}
              >
                {optionColumns.map((option: any, index: number) => (
                  <StyledChipProps
                    key={index}
                    label={option}
                    clickable
                    onClick={() => handleToggle(option)}
                    color={selectedOptions.includes(option) ? 'primary' : 'default'}
                    variant='filled'
                    style={{ margin: '4px' }}
                  />
                ))}
              </div>
            </Stack>
          </TabPanel>
        </Box>
        <Stack direction='row' justifyContent='end' spacing={2} mt={2}>
          <Button variant='outlined' color='inherit' onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='contained' onClick={applyFilter}>
            Apply
          </Button>
        </Stack>
      </Popover>
    </>
  )
}
