import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Drawer,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  TextField,
  Autocomplete,
  Checkbox
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { getRequest } from 'src/services/apiService'

const CalendarIcon = () => <span className='icon-calendar-1'></span>

interface FilterConfig {
  name: string
  label: string
  type: 'text' | 'date' | 'select' | 'multiselect' | 'dateRange'
  key: string
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  apiEndpoint?: string
  defaultValue?: any
}

interface ReportFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onDownload: (reportType: string, filters: any) => void,
  reportConfigs: any[]
}

export default function ReportFilterDrawer({ isOpen, onClose, onDownload, reportConfigs }: ReportFilterDrawerProps) {
  const [selectedReport, setSelectedReport] = useState('')
  const [filterValues, setFilterValues] = useState<any>({})
  const [dynamicOptions, setDynamicOptions] = useState<any>({})

  const currentConfig = reportConfigs.find(config => config.value === selectedReport)

  const handleReportChange = (event: any) => {
    setSelectedReport(event.target.value)
    setFilterValues({})
  }

  useEffect(() => {
    if (currentConfig?.filters) {
      currentConfig.filters.forEach(async (filter: FilterConfig) => {
        if (filter.apiEndpoint) {
          try {
            const url = {
              url: `/api/${filter.apiEndpoint}`,
              serviceURL: 'mdm',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
              }
            }
            const response = await getRequest(url)
            if (response?.data?.length > 0) {
              setDynamicOptions((prev: any) => ({
                ...prev,
                [filter.key]: response.data.map((item: any) => ({
                  value: item.id,
                  label: item.attributes.name
                }))
              }))
            }
          } catch (error) {
            console.error(`Error fetching options for ${filter.name}:`, error)
          }
        }
      })
    }
  }, [selectedReport, currentConfig]) 

  const handleFilterChange = (filterKey: string, value: any) => {
    setFilterValues((prev: any) => ({
      ...prev,
      [filterKey]: value
    }))
  }

  const handleDownloadClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() 
    e.stopPropagation() 
    const formattedFilters: any = {}
    
    currentConfig?.filters.forEach((filter: FilterConfig) => {
      const value = filterValues[filter.key]
      
      if (filter.type === 'dateRange' && value) {
        formattedFilters.start_date = value.startDate 
          ? dayjs(value.startDate).format('DD-MM-YYYY') 
          : ''
        formattedFilters.end_date = value.endDate 
          ? dayjs(value.endDate).format('DD-MM-YYYY') 
          : ''
      } else if (filter.type === 'date' && value) {
        formattedFilters[filter.key] = dayjs(value).format('DD-MM-YYYY')
      } else if (value !== undefined && value !== null && value !== '') {
        formattedFilters[filter.key] = value
      }
    })

    console.log('Formatted Filters:', formattedFilters)
    
    await onDownload(selectedReport, formattedFilters)
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setSelectedReport('')
    setFilterValues({})
    setDynamicOptions({})
  }

  const handleCancel = () => {
    handleReset()
    onClose()
  }

  const isDownloadDisabled = () => {
    if (!selectedReport) return true

    if (currentConfig?.filters) {
      return currentConfig.filters.some((filter: FilterConfig) => {
        if (!filter.required) return false
        
        const value = filterValues[filter.key]
        
        if (filter.type === 'dateRange') {
          return !value?.startDate || !value?.endDate
        }
        
        return !value || value === '' || (Array.isArray(value) && value.length === 0)
      })
    }

    return false
  }

  const renderFilter = (filter: FilterConfig) => {
    const value = filterValues[filter.key]

    switch (filter.type) {
      case 'text':
        return (
          <TextField
            key={filter.key}
            fullWidth
            label={filter.label}
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            required={filter.required}
          />
        )

      case 'select':
        const selectOptions = filter.options || dynamicOptions[filter.key] || []

        return (
          <FormControl key={filter.key} fullWidth required={filter.required}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value || ''}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              {selectOptions.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )

      case 'multiselect':
        const multiOptions = filter.options || dynamicOptions[filter.key] || []
        
        return (
          <Autocomplete
            key={filter.key}
            multiple
            options={multiOptions}
            getOptionLabel={(option: any) => option.label}
            value={multiOptions.filter((opt: any) => (value || []).includes(opt.value))}
            onChange={(_, newValue) => 
              handleFilterChange(filter.key, newValue.map((v: any) => v.value))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={filter.label}
                placeholder={filter.placeholder}
                required={filter.required}
              />
            )}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox checked={selected} />
                {option.label}
              </li>
            )}
          />
        )

      case 'date':
        return (
          <LocalizationProvider key={filter.key} dateAdapter={AdapterDayjs}>
            <DatePicker
              label={filter.label}
              value={value || null}
              onChange={(newValue) => handleFilterChange(filter.key, newValue)}
              format='DD-MM-YYYY'
              slots={{ openPickerIcon: CalendarIcon }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: filter.required
                },
                popper: {
                  disablePortal: false,
                  placement: 'auto'
                },
                desktopPaper: {
                  sx: {
                    zIndex: 1301
                  }
                }
              }}
            />
          </LocalizationProvider>
        )

      case 'dateRange':
        return (
          <Box key={filter.key}>
            <Typography variant='subtitle2' color='text.primary' sx={{ fontWeight: 500, mb: 2 }}>
              {filter.label} {filter.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <Stack spacing={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='Start Date'
                  value={value?.startDate || null}
                  onChange={(newValue) => 
                    handleFilterChange(filter.key, { ...value, startDate: newValue })
                  }
                  format='DD-MM-YYYY'
                  slots={{ openPickerIcon: CalendarIcon }}
                  slotProps={{ 
                    textField: { fullWidth: true },
                    popper: {
                      disablePortal: true,
                      placement: 'auto'
                    },
                    desktopPaper: {
                      sx: {
                        zIndex: 1301
                      }
                    }
                  }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='End Date'
                  value={value?.endDate || null}
                  onChange={(newValue) => 
                    handleFilterChange(filter.key, { ...value, endDate: newValue })
                  }
                  minDate={value?.startDate ? dayjs(value.startDate) : undefined}
                  format='DD-MM-YYYY'
                  slots={{ openPickerIcon: CalendarIcon }}
                  slotProps={{ 
                    textField: { fullWidth: true },
                    popper: {
                      disablePortal: true,  
                      placement: 'auto'
                    }
                  }}
                />
              </LocalizationProvider>
            </Stack>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Drawer
      anchor='right'
      open={isOpen}
      onClose={handleCancel}
      sx={{ '.MuiDrawer-paper': { maxWidth: '500px', minWidth: '500px' } }}
    >
      <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
          <Typography
            color={'customColors.mainText'}
            style={{ lineHeight: '30px', fontWeight: 500 }}
            sx={{ p: 2 }}
            variant='h6'
          >
            Download Report
          </Typography>
          <Button style={{ color: '#666' }} onClick={handleReset}>
            Reset
          </Button>
        </Stack>

        <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', p: 2, overflow: 'visible' }}>
          <Box sx={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto', overflowX: 'hidden' }}>
            <Card
              variant='outlined'
              style={{
                borderColor: '#e0e0e0',
                backgroundColor: '#fff',
                padding: '20px',
                marginBottom: '16px',
                overflow: 'visible'
              }}
            >
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel id='report-type-label'>Select Report Type</InputLabel>
                  <Select
                    labelId='report-type-label'
                    value={selectedReport}
                    label='Select Report Type'
                    onChange={handleReportChange}
                  >
                    {reportConfigs.map(report => (
                      <MenuItem key={report.value} value={report.value}>
                        {report.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {currentConfig?.filters.map((filter: FilterConfig) => renderFilter(filter))}

                {selectedReport && currentConfig && (
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      padding: '12px',
                      borderRadius: '8px',
                      mt: 2
                    }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      {currentConfig.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Box>
        </Box>

        <Stack direction='row' justifyContent='end' spacing={2} mt={2} sx={{ alignSelf: 'flex-end' }}>
          <Button variant='outlined' color='inherit' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant='contained'
            disabled={isDownloadDisabled()}
            onClick={handleDownloadClick}
            type='button' 
            startIcon={<span className='icon-download'></span>}
          >
            Download
          </Button>
        </Stack>
      </Box>
    </Drawer>
  )
}