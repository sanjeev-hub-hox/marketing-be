/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
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
  IconButton,
  Drawer,
  Grid,
  Autocomplete,
  Checkbox,
  Tooltip
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
import InfoIcon from '@mui/icons-material/Info'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import SpinnerBackdrop from '../../components/spinner'
import { convertDateDD, getObjectByKeyVal, getObjectByKeyValNew } from 'src/utils/helper'

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  minWidth: '200px',
  '& .MuiTab-root': {
    minWidth: '200px'
  },
  '& .MuiTabs-vertical': {
    minWidth: '200px'
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
  setFilter?: any
  setFilterOption?: any
  filterOption?: any
  isDrawerOpen: boolean
  setDrawerOpen: any
  toggleDrawer: any
  isFilterSection: boolean
  filterSectionData: any
  selectedFilterData: any
  filterValue: any
  filtersSelected: any
  filterSelectedSentData: any
  isColumnSection: boolean
  columnSectionData: any
  isStickyColumnSection: boolean
  stickyColumnSectionData: any
  filterCount: any
  setfilterOptionsProps?: any
  setFilteredColumns?: any
  clearFilter?: any
  setDisplayEarlierFilter?: any
  pageName?:any
}

export default function DynamicFilterComponent(props: FilterProps) {
  const {
    filterOpen,
    setFilterOpen,
    setFilter,
    setFilterOption,
    filterOption,
    isDrawerOpen,
    setDrawerOpen,
    toggleDrawer,
    isFilterSection,
    filterSectionData,
    selectedFilterData,
    filterValue,
    filtersSelected,
    filterSelectedSentData,
    isColumnSection,
    columnSectionData,
    isStickyColumnSection,
    stickyColumnSectionData,
    filterCount,
    setfilterOptionsProps,
    setFilteredColumns,
    clearFilter,
    setDisplayEarlierFilter,
    pageName
  } = props

  const filterLabelArray = [
    { title: 'LOB Assigned', number: 'Number', text: '10' },
    { title: 'LOB Assigned', number: 'Number', text: '10' },
    { title: 'LOB Assigned', number: 'Number', text: '10' }
  ]

  // popover
  const handleClose = () => {
    setFilterOpen(null)
  }
  const open = Boolean(filterOpen)
  const id = open ? 'simple-popover' : undefined

  // tabs
  const [value, setValue] = React.useState(0)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  // filter - status
  const options = ['ERP Role', 'HRIS Unique Role', 'School Category', 'User Assign', 'Status']
  const [searhRole, setSearchRole] = useState<string>('')

  // column
  const optionColumns = [
    'All',
    'Enquiry Role',
    'HRIS Unique Role',
    'School Categories',
    'LOB Assigned',
    'HR Role',
    'User Assigned',
    'Status',
    'Action'
  ]

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [filterCoulmnValue, setfilterCoulmnValue] = useState<string>('')
  const [operationName, setOperationName] = useState<string>('equals')
  const [filterColumnName, setfilterColumnName] = useState('')
  const [filterMultiSelectTabs, setFilterMultiSelectTabs] = useState([])
  const [selectedMultiSelectValues, setSelectedMultiSelectValues] = useState<string[]>([])
  const [filterSelectedData, setFilterSelectedData] = useState({})
  const [operatorNames, setOperatorNames] = useState<any>([])
  const [filterBasedData, setFilterBasedData] = useState<any>([])
  const [infoDialog, setInfoDialog] = useState(false)
  const [inputValue, setInputValue] = useState<any>('')
  const [filterOptions, setFilterOptions] = useState<{ name: any; operation: any; value: any }[]>([])
  const [enableApplyNow, setEnableApplyNow] = useState<boolean>(false)
  const [SDate, setSDate] = useState<Dayjs | null>(null)
  const [EDate, setEDate] = useState<Dayjs | null>(null)
  const [isData, setIsData] = useState<boolean>(true)
  const [displaySelectedFilters, setDisplaySelectedFilters] = useState<any>([])
  const [dates, setDates] = useState([null, null]) // [startDate, endDate]

  const handleStartDateChange = (newStartDate: any) => {
    setDates([newStartDate, dates[1]]) // Start date is always at index 0
  }

  const handleEndDateChange = (newEndDate: any) => {
    setDates([dates[0], newEndDate]) // End date is always at index 1
  }

  const CalendarIcon = () => <span className='icon-calendar-1'></span>

  useEffect(() => {
    setFilterBasedData(filterValue)
    setIsData(true)
  }, [filterValue])

  useEffect(() => {
    if (isDrawerOpen) {
      // earlierSelectedFilters()
    }
  }, [isDrawerOpen])

  const earlierSelectedFilters = () => {
    console.log('filterSelectedSentData', filterSelectedSentData)
    if (filterSelectedSentData && filterSelectedSentData?.length > 0) {
      const filterFinalData: any = []
      console.log('filterValue', filterValue)
      filterSelectedSentData.map((value: any, index: number) => {
        const selectedDisplayData = {
          name: value.name,
          operation: value.operation,
          value: value.valueName
        }
        filterFinalData.push({ ...selectedDisplayData })
      })
      setDisplaySelectedFilters(filterFinalData)
    }
  }

  useEffect(() => {
    console.log('setDisplayEarlierFilter')
    console.log(setDisplayEarlierFilter)
    if (setDisplayEarlierFilter?.length > 0) {
      setDisplaySelectedFilters(setDisplayEarlierFilter)
    }
    // console.log(setDisplayEarlierFilter)
  }, [setDisplayEarlierFilter])

  const handleToggle = (option: string) => {
    setSelectedOptions(prevSelected => {
      if (prevSelected.includes(option)) {
        return prevSelected.filter(item => item !== option)
      } else {
        return [...prevSelected, option]
      }
    })
  }

  const checkIsOptionEnabled = (value: any) => {
    const index: any = setDisplayEarlierFilter?.find((ele: { name: any }) => ele?.name === value)
    if (index) {
      return true
    } else {
      false
    }
  }

  const handleCoulmnFilter = (status: any) => {
    // setIsData(false)
    setFilterBasedData([])
    setEnableApplyNow(false)
    setfilterCoulmnValue(status)
    selectedFilterData(status)
    setOperationName('equals')
    const index = filterSectionData.findIndex((x: any) => x.value === status)
    if (index >= 0) {
      let operatorSet
      filterSectionData.map((value: any, key: number) => {
        if (value.value === status) {
          operatorSet = value.operators
        }
      })
      let multitabs
      filterSectionData.map((value: any, key: number) => {
        if (value.value === status) {
          multitabs = value?.multiSelectTabs
        }
      })
      
      setOperatorNames(operatorSet)
      if(multitabs){
        setFilterMultiSelectTabs(multitabs)
      }
      setfilterColumnName(filterSectionData[index].name)
    }
  }

  const handleCoulmnOperatorFilter = (status: any) => {
    setOperationName(status)
    // if(status != "academic_year"){
    //   setFilterMultiSelectTabs([])
    // }
    // Clear multi-select values when operation changes
    if(status !== 'multiSelect') {
      setSelectedMultiSelectValues([])
    }
  }


  const handleSelectedFilterName = (event: any, data: any, val: any) => {
    if (data?.length) {
      const df = getObjectByKeyValNew(filterValue, 'attributes.name', data)
      const item: any = filterValue
        .filter((item: any) => data.includes(item.attributes.name))
        .map((option: any) => option.id)
        .join(',')
      const itemByName: any = val == 'isNewLead' ? df?.id : data

      if (item !== '') {
        setEnableApplyNow(true)
      } else {
        setEnableApplyNow(false)
      }
      // setInputValue(itemByName)
      const selectedData = {
        name: val,
        operation: operationName,
        value: itemByName,
        valueName: itemByName,
        itemID: val != 'academic_year' ? df?.id : df?.attributes?.short_name_two_digit
      }

      const selectedDisplayData = {
        name: val,
        operation: operationName,
        value:  val == 'isNewLead' ? data : data

      }

      filterOptions.map((value: any, index: number) => {
        if (value.name === val) {
          filterOptions.splice(index, 1)
        }
      })

      displaySelectedFilters.map((value: any, index: number) => {
        if (value.name === val) {
          displaySelectedFilters.splice(index, 1)
        }
      })

      filterOptions.push({ ...selectedData })
      displaySelectedFilters.push({ ...selectedDisplayData })

      setFilterSelectedData(filterOptions)
    } else {
      setFilterSelectedData([])
      setFilterOptions([])
    }
  }

  const isEmpty = (value: any) => {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    )
  }
  const applyFilter = () => {
    if (setFilteredColumns) {
      console.log('filterOptions123', filterOptions, selectedOptions)

      setFilteredColumns(selectedOptions)
    }
    let tempfilterOptions: any
  
    if (operationName === 'isWithin') {
      if (!isEmpty(filterCoulmnValue) && !isEmpty(dates)) {
        tempfilterOptions = {
          name: filterCoulmnValue,
          operation: operationName,
          value: dates
        }
      }
    } else if (operationName === 'isEmpty') {
      if (!isEmpty(filterCoulmnValue)) {
        tempfilterOptions = {
          name: filterCoulmnValue,
          operation: operationName,
          value: ''  // empty string for isEmpty operation
        }
      }
    } else {
      if (!isEmpty(filterCoulmnValue) && !isEmpty(operationName) && !isEmpty(inputValue)) {
        tempfilterOptions = {
          name: filterCoulmnValue,
          operation: operationName,
          value: inputValue
        }
      }
    }
  
    if (tempfilterOptions) {
      const newFilterOptions = [...filterOptions, tempfilterOptions]
      setFilterOptions(newFilterOptions)
      setfilterOptionsProps(newFilterOptions)
  
      const newDisplaySelectedFilters = [...displaySelectedFilters, { ...tempfilterOptions }]
      displaySelectedFilters.push({ ...tempfilterOptions })
    } else {
      setfilterOptionsProps([...filterOptions])
    }
    filtersSelected(filterSelectedData)
  
    setDrawerOpen(false)
  
    filterCount(tempfilterOptions ? filterOptions.length + 1 : filterOptions.length)
  
    setfilterColumnName('')
    setfilterCoulmnValue('')
    setFilterBasedData([])
    setSDate(null)
    setEDate(null)
    setInputValue('')
  }

  const cancelFilter = () => {
    // resetFilterOption()
    // filtersSelected({
    //   name: null,
    //   options: null,
    //   operator: null
    // })
    // setDisplaySelectedFilters([])
    setDrawerOpen(false)
    setDates([null, null])
    // filterCount(0)
    // setSDate(null)
    // setEDate(null)
    // setfilterCoulmnValue('')
  }

  const addFilterOption = () => {
    let tempfilterOptions: any

    if (operationName == 'isWithin') {
      tempfilterOptions = {
        name: filterCoulmnValue,
        operation: operationName,
        value: dates
      }
    } else {
      tempfilterOptions = {
        name: filterCoulmnValue,
        operation: operationName,
        value: inputValue
      }
    }

    setFilterOptions(prevValues => [...prevValues, tempfilterOptions])
    displaySelectedFilters.push({ ...tempfilterOptions })
    setEnableApplyNow(false)
    setfilterCoulmnValue('')
    setOperationName('')
    setfilterColumnName('')
    setInputValue('')
  }

  const resetFilterOption = () => {
    setEnableApplyNow(false)
    setFilterBasedData([])
    setfilterCoulmnValue('')
    setOperationName('')
    setfilterColumnName('')
    setFilterSelectedData([])
    setFilterOptions([])
    filtersSelected({
      name: null,
      options: null,
      operator: null
    })
    setDisplaySelectedFilters([])
    setfilterOptionsProps([])
    filterCount(filterOptions.length)
    sessionStorage?.removeItem(pageName || 'filters')
  }

  const deleteFilterOption = (index: number) => {
    setFilterOptions(prevValues => prevValues.filter((_, i) => i !== index))
    setDisplaySelectedFilters((prevValues: any[]) => prevValues.filter((_: any, i: number) => i !== index))
    setFilterSelectedData(
      (prevValues: any[]) => prevValues?.length && prevValues?.filter((_: any, i: number) => i !== index)
    )
    const dd = setDisplayEarlierFilter.filter((_:any, i:any) => i !== index)
    setfilterOptionsProps(dd)
  }

  const shouldDisableDate = (date: Dayjs) => {
    const today = dayjs().startOf('day') // Start of the day to ignore time

    return date.isBefore(today, 'day') // Disable past dates
  }

  const handleChangeDate = (newValue: any | null, field: string) => {
    if (newValue) {
      // Format the date to DD/MM/YYYY
      newValue = dayjs(newValue).format('DD-MM-YYYY')
    }
    if (field === 'startDate') {
      console.log('newValue', newValue)
      setSDate(newValue)

      if (newValue && newValue !== 'Invalid Date') {
        setEnableApplyNow(true)
        const selectedData = {
          name: 'date',
          operation: operationName,
          value: {
            start_date: newValue,
            end_date: null
          },
          valueName: newValue
        }
        filterOptions.map((value: any, index: number) => {
          if (value.name === 'date') {
            filterOptions.splice(index, 1)
          }
        })

        filterOptions.push({ ...selectedData })
        setFilterSelectedData(filterOptions)
      }
      setEDate(null)
    } else if (field === 'endDate') {
      if (newValue && newValue !== 'Invalid Date') {
        setEnableApplyNow(true)
        const selectedData = {
          name: 'date',
          operation: operationName,
          value: {
            start_date: SDate,
            end_date: newValue
          },
          valueName: SDate + ' | ' + newValue
        }
        filterOptions.map((value: any, index: number) => {
          if (value.name === 'date') {
            filterOptions.splice(index, 1)
          }
        })

        filterOptions.push({ ...selectedData })
        setFilterSelectedData(filterOptions)
      }
      setEDate(newValue)
    }
  }

  /* const handleToggle = (option: string) => {
    // setFilter(option)
    setFilterOption((prevSelected: any) => {
      if (prevSelected.includes(option)) {
        return prevSelected.filter((item: any) => item !== option)
      } else {
        return [...prevSelected, option]
      }
    })
  } */

  const filterInputValue = (event: any) => {
    setInputValue(event.target.value)
  }
  const clearAllFilters = () => {
    setfilterCoulmnValue('')
    setInputValue('')
    setFilterOptions([])
    setSelectedOptions([])
    setFilteredColumns([])
    clearFilter()
    setDisplaySelectedFilters([])
    filterCount(0)
    setDrawerOpen(false)
  }

  const handleDateChange = (val: any) => {
    console.log('handleDateChange', val)
    setInputValue(val)
  }

  const handleMultiSelectChipToggle = (chipValue: any, chipName: string) => {
    setSelectedMultiSelectValues(prev => {
      const isSelected = prev.includes(chipValue.toString())
      let newSelection:any;
      
      if (isSelected) {
        newSelection = prev.filter(item => item !== chipValue.toString())
      } else {
        newSelection = [...prev, chipValue.toString()]
      }
      
      if (newSelection.length > 0) {
        setEnableApplyNow(true)
        
        const selectedNames = filterMultiSelectTabs
          .filter((tab: any) => newSelection.includes(tab.value.toString()))
          .map((tab: any) => tab.name)
        
        const selectedData = {
          name: filterCoulmnValue,
          operation: operationName,
          value: newSelection,
          valueName: selectedNames.join(', '),
          itemID: newSelection.join(',')
        }

        const selectedDisplayData = {
          name: filterCoulmnValue,
          operation: operationName,
          value: selectedNames.join(', ')
        }

        const updatedFilterOptions = filterOptions.filter((value: any) => value.name !== filterCoulmnValue)
        const updatedDisplayFilters = displaySelectedFilters.filter((value: any) => value.name !== filterCoulmnValue)
        
        updatedFilterOptions.push(selectedData)
        updatedDisplayFilters.push(selectedDisplayData)
        
        setFilterOptions(updatedFilterOptions)
        setDisplaySelectedFilters(updatedDisplayFilters)
        setFilterSelectedData(updatedFilterOptions)
      } else {
        setEnableApplyNow(false)
        const updatedFilterOptions = filterOptions.filter((value: any) => value.name !== filterCoulmnValue)
        const updatedDisplayFilters = displaySelectedFilters.filter((value: any) => value.name !== filterCoulmnValue)
        
        setFilterOptions(updatedFilterOptions)
        setDisplaySelectedFilters(updatedDisplayFilters)
        setFilterSelectedData(updatedFilterOptions)
      }
      
      return newSelection
    })
  }


  useEffect(()=>{
      filterCount(setDisplayEarlierFilter?.length)
  },[setDisplayEarlierFilter])

  return (
    <>
      <Drawer
        anchor='right'
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        sx={{ '.MuiDrawer-paper': { maxWidth: '750px' } }}
        disablePortal
      >
        <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              {isFilterSection && (
                <StyledTab
                  icon={<span className='icon-filter-search'></span>}
                  label={
                    <Stack direction='row' justifyContent='space-between' alignItems='center' flex='1'>
                      <Typography>Filter</Typography>
                      <Badge badgeContent={filterOptions.length} color='secondary' sx={{ marginRight: '10px' }} />
                    </Stack>
                  }
                  {...a11yProps(0)}
                />
              )}
              {isColumnSection && (
                <StyledTab
                  icon={<span className='icon-slider-horizontal'></span>}
                  label={
                    <Stack direction='row' justifyContent='space-between' alignItems='center' flex='1'>
                      <Typography>Column</Typography>
                      <Badge badgeContent={selectedOptions.length} color='secondary' sx={{ marginRight: '10px' }} />
                    </Stack>
                  }
                  {...a11yProps(1)}
                />
              )}
              {isStickyColumnSection && (
                <StyledTab
                  icon={<span className='icon-sticker'></span>}
                  label={
                    <Stack direction='row' justifyContent='space-between' alignItems='center' flex='1'>
                      <Typography>Sticky Column</Typography>
                      <Badge badgeContent={1} color='secondary' sx={{ marginRight: '10px' }} />
                    </Stack>
                  }
                  {...a11yProps(2)}
                />
              )}
            </StyledTabs>
            <Divider sx={{ ml: 3, mr: 3 }} orientation='vertical' flexItem />
            <TabPanel value={value} index={0}>
              <Box sx={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
                <Card variant='outlined' style={{ borderColor: '#e0e0e0', backgroundColor: '#fff', padding: '0 20px' }}>
                  <Accordion disableGutters style={{ margin: 0, padding: 0 }}>
                    <AccordionSummary
                      expandIcon={<ArrowRightIcon />}
                      aria-controls='panel2-content'
                      id='panel2-header'
                      sx={{ padding: 0, margin: 0 }}
                    >
                      <Stack direction='column' justifyContent='center' alignItems='flexStart' spacing={2}>
                        {/* <Typography variant='caption' sx={{ fontSize: '12px !important' }}>
                          Column
                        </Typography> */}
                        <Typography sx={{ paddingTop: '14px' }}>Column</Typography>

                        <Typography
                          variant='subtitle2'
                          color={'text.primary'}
                          style={{ marginTop: '0', fontWeight: 500 }}
                        >
                          {filterColumnName ?? ''}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ margin: '0 4px', padding: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                        {filterSectionData.map((value: any, index: number) => (
                          <StyledChipProps
                            key={index}
                            label={value.name}
                            variant='filled'
                            color={filterCoulmnValue == value.value ? 'primary' : 'default'}
                            sx={{ margin: '4px', cursor: 'pointer' }}
                            disabled={checkIsOptionEnabled(value.value)}
                            onClick={() => handleCoulmnFilter(value.value)}
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
                        {/* <Typography variant='caption' sx={{ fontSize: '12px !important' }}>
                          Operator
                        </Typography> */}
                        <Typography sx={{ paddingTop: '14px' }}>Operator</Typography>

                        <Typography
                          variant='subtitle2'
                          color={'text.primary'}
                          style={{ marginTop: '0', fontWeight: 500 }}
                        ></Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ margin: '0 4px', padding: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                        {operatorNames &&
                          operatorNames.map((status: any, index: number) => (
                            <StyledChipProps
                              key={index}
                              label={status.name}
                              variant='filled'
                              color={operationName == status.value ? 'primary' : 'default'}
                              sx={{ margin: '4px' }}
                              onClick={() => handleCoulmnOperatorFilter(status.value)}
                            />
                          ))}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                 {operationName != 'isEmpty' && filterColumnName !== 'Academic Year' ? (
                    <>
                      <Typography sx={{ paddingTop: '14px' }}>Value</Typography>
                      <Stack spacing={2}>
                        {!isData && <SpinnerBackdrop sx={{ height: '100px' }} />}
                        {isData && filterBasedData.length <= 0 && !filterColumnName.includes('Date') && (
                          <>
                            <TextField
                              id='standard-basic'
                              placeholder='Text'
                              value={inputValue}
                              variant='standard'
                              sx={{ marginTop: '10px !important' }}
                              onChange={filterInputValue}
                              InputLabelProps={{ style: { fontWeight: 500, color: '#212121', fontSize: '14px' } }}
                            />
                          </>
                        )}
                        {isData &&
                          filterBasedData.length <= 0 &&
                          filterColumnName.includes('Date') &&
                          (operationName == 'isWithin' ? (
                            <>
                              <Typography sx={{ paddingTop: '14px' }}>Start Date</Typography>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  sx={{ width: '100%' }}
                                  // value={dates[0] && dates[0] != null ? dayjs(dates[0], 'DD-MM-YYYY') : null}
                                  onChange={newValue => handleStartDateChange(convertDateDD(newValue))}
                                  slots={{
                                    openPickerIcon: CalendarIcon
                                  }}
                                 // maxDate={dayjs()}
                                  format='DD-MM-YYYY'
                                  label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Start Date</Box>}
                                />
                              </LocalizationProvider>
                              <Typography sx={{ paddingTop: '14px' }}>End Date</Typography>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  sx={{ width: '100%' }}
                                  //value={dates[1] && dates[1] != null ? dayjs(dates[1], 'DD-MM-YYYY') : null}
                                  minDate={dates[0] ? dayjs(dates[0], 'DD-MM-YYYY') : undefined}
                                  //maxDate={dayjs()}
                                  onChange={newValue => handleEndDateChange(convertDateDD(newValue))}
                                  slots={{
                                    openPickerIcon: CalendarIcon
                                  }}
                                  format='DD-MM-YYYY'
                                  label={<Box sx={{ display: 'flex', alignItems: 'center' }}>End Date</Box>}
                                />
                              </LocalizationProvider>
                            </>
                          ) : (
                            <>
                              <Typography sx={{ paddingTop: '14px' }}> Date</Typography>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  //maxDate={dayjs()}
                                  label='Date'
                                  format='DD/MM/YYYY'
                                  sx={{ width: '100%' }}
                                  slots={{ openPickerIcon: CalendarIcon }}
                                  onChange={e => {
                                    handleDateChange(convertDateDD(e))
                                  }} // Handle change events
                                />
                              </LocalizationProvider>
                            </>
                          ))}
                        {isData && filterBasedData.length > 0 && (
                          <>
                            <Grid item xs={12} sm={12}>
                              <Autocomplete
                                id='autocomplete-multiple-filled'
                                popupIcon={<span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>}
                                options={filterBasedData.map((option: any) => option.attributes.name)}
                                onChange={(event, value) => handleSelectedFilterName(event, value, filterCoulmnValue)}
                                // renderOption={(props, option, { selected }) => (
                                //   <li {...props}>
                                //     <Checkbox checked={selected} />
                                //     {option as React.ReactNode}
                                //   </li>
                                // )}
                                renderInput={params => (
                                  <TextField
                                    {...params}
                                    sx={{ mt: '10px' }}
                                    label={
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {filterColumnName}
                                        {infoDialog && (
                                          <span>
                                            <Tooltip title='Status'>
                                              <InfoIcon style={{ color: '#a3a3a3' }} />
                                            </Tooltip>
                                          </span>
                                        )}
                                      </Box>
                                    }
                                    placeholder=''
                                  />
                                )}
                              />
                            </Grid>
                          </>
                        )}
                      </Stack>
                    </>
                  ) : null}
                  {filterMultiSelectTabs?.length > 0 && filterColumnName === 'Academic Year' && operationName == "multiSelect" ? (
                    <>
                      <Typography sx={{ paddingTop: '14px' }}>Value</Typography>
                      <AccordionDetails sx={{ margin: '0 4px', padding: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                          {filterMultiSelectTabs &&
                            filterMultiSelectTabs.map((status: any, index: number) => (
                              <StyledChipProps
                                key={index}
                                label={status.name}
                                variant='filled'
                                color={selectedMultiSelectValues.includes(status.value.toString()) ? 'primary' : 'default'}
                                sx={{ margin: '4px', cursor: 'pointer' }}
                                onClick={() => handleMultiSelectChipToggle(status.value, status.name)}
                              />
                            ))}
                        </div>
                      </AccordionDetails>
                    </>
                  ) : null}
                  <div style={{ display: 'flex', justifyContent: 'end', padding: '4px 0px' }}>
                    <Button variant='text' onClick={resetFilterOption}>
                      Reset
                    </Button>
                    {filterBasedData?.length <= 0 ? (
                      <Button disabled={!operationName} variant='text' onClick={addFilterOption}>
                        Add More
                      </Button>
                    ) : null}
                  </div>
                </Card>
                {displaySelectedFilters.map((status: any, index: number) => (
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
                        {filterSectionData.find((op: any) => op.value === status.name)?.name}
                      </Typography>
                      <Typography color={'customColors.text3'}>
                        {' '}
                        {operatorNames.find((op: any) => op.value === status.operation)?.name}
                      </Typography>
                      <Typography color={'customColors.text3'}>
                        <>
                          {Array.isArray(status.value)
                            ? status.value?.map((val: any, index: number) => {
                                if (index != status?.value?.length - 1) {
                                  return `${val} to `
                                } else {
                                  return `${val} `
                                }
                              })
                            : status.value}
                        </>
                      </Typography>
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
              </Box>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Box sx={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                    {filterSectionData.map((option: any, index: number) => (
                      <StyledChipProps
                        key={index}
                        label={option.name}
                        clickable
                        onClick={() => handleToggle(option.name)}
                        color={selectedOptions.includes(option.name) ? 'primary' : 'default'}
                        variant='filled'
                        style={{ margin: '4px' }}
                      />
                    ))}
                  </div>
                </Stack>
              </Box>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <Box sx={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                    {optionColumns.map((option, index) => (
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
              </Box>
            </TabPanel>
          </Box>
          <Stack direction='row' justifyContent='end' spacing={2} mt={2} sx={{ alignSelf: 'flex-end' }}>
            <Button variant='outlined' color='inherit' onClick={cancelFilter}>
              Cancel
            </Button>
            <Button variant='contained' onClick={applyFilter}>
              Apply
            </Button>
            {/* {enableApplyNow && (
              <Button variant='contained' onClick={applyFilter}>
                Apply
              </Button>
            )}
            {!enableApplyNow && (
              <Button variant='contained' disabled>
                Apply
              </Button>
            )} */}
          </Stack>
        </Box>
      </Drawer>
    </>
  )
}
