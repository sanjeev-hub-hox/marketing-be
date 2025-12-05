import React, { useState, useEffect, useMemo } from 'react'
import { Autocomplete, TextField, Box, Typography } from '@mui/material'
import { getRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import debounce from 'lodash.debounce'

interface EmployeeOption {
  id: number
  attributes: {
    First_Name: string
    Last_Name: string
    Full_Name: string
    Mobile: string
    Official_Email_ID: string
    Role?: string
    Group_Employee_Code?: string
    Designation?: { data?: { attributes?: { Designation?: string } } }
    Business_Sub_Sub_Vertical?: { data?: { attributes?: { description?: string } } }
  }
}

const EnquiryEmployeeSource = ({
  enquiryEmployeeSource,
  handleChange,
  val,
  formData,
  setFormData
}: any) => {
  const [options, setOptions] = useState<EmployeeOption[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedOption, setSelectedOption] = useState<EmployeeOption | null>(null)
  const { setGlobalState } = useGlobalContext()

  // fetch with populate=* so Designation & Business_Sub_Sub_Vertical are present
  const fetchOptions = async (search: string) => {
    if (!enquiryEmployeeSource) return
    try {
      setGlobalState({ isLoading: true })

      const encodedSearch = encodeURIComponent(search)
      const query = `filters[$or][0][First_Name][$containsi]=${encodedSearch}&filters[$or][1][Last_Name][$containsi]=${encodedSearch}&pagination[limit]=50&populate=*`

      const params = {
        url: `/api/hr-employee-masters?${query}`,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        }
      }
      const response = await getRequest(params)
      const data = response?.data

      if (Array.isArray(data) && data.length > 0) {
        setOptions(data)
      } else {
        setOptions([])
      }
    } catch (error) {
      console.error('Error fetching employee source:', error)
      setOptions([])
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  const debouncedFetch = useMemo(() => debounce(fetchOptions, 400), [enquiryEmployeeSource])

  useEffect(() => {
    if (!inputValue) return
    // avoid refetch if input equals current selected full name
    if (inputValue === `${selectedOption?.attributes?.First_Name} ${selectedOption?.attributes?.Last_Name}`) return
    debouncedFetch(inputValue)
    
    return () => debouncedFetch.cancel()
  }, [inputValue, debouncedFetch, selectedOption])

  // Initialize selected option if val already exists
  useEffect(() => {
    if (val && options.length) {
      const found = options.find(opt => opt.id === val)
      if (found) {
        setSelectedOption(found)
        setInputValue(`${found.attributes.First_Name} ${found.attributes.Last_Name}`)
      }
    }
  }, [val, options])

  useEffect(() => {
    const fetchInitialEmployee = async () => {
      if (val && !selectedOption) {
        try {
          console.log('🔍 Fetching employee with ID:', val) // This WILL work in browser console
          
          setGlobalState({ isLoading: true })
          
          const params = {
            url: `/api/hr-employee-masters/${val}?populate=*`,
            serviceURL: 'mdm',
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
            }
          }
          
          const response = await getRequest(params)
          const employeeData = response?.data

          console.log('✅ Employee data received:', employeeData) // This WILL work

          if (employeeData) {
            setSelectedOption(employeeData)
            setInputValue(employeeData.attributes.Official_Email_ID || '')
            setOptions([employeeData])
            
            console.log('✅ Employee set:', employeeData.attributes.Full_Name) // This WILL work
          } else {
            console.log('❌ No employee data found')
          }
        } catch (error) {
          console.error('❌ Error fetching employee:', error) // This WILL work
        } finally {
          setGlobalState({ isLoading: false })
        }
      } else {
        console.log('⏭️ Skipping fetch - val:', val, 'selectedOption exists:', !!selectedOption)
      }
    }

    fetchInitialEmployee()
  }, [val])

  // Helpers to extract designation & location safely
  const getDesignation = (opt?: EmployeeOption) =>
    opt?.attributes?.Designation?.data?.attributes?.Designation || '—'
  const getLocation = (opt?: EmployeeOption) =>
    opt?.attributes?.Business_Sub_Sub_Vertical?.data?.attributes?.description || '—'
  const getFullName = (opt?: EmployeeOption) =>
    opt?.attributes?.Full_Name || `${opt?.attributes?.First_Name || ''} ${opt?.attributes?.Last_Name || ''}`

  return (
    <Autocomplete
      options={options}
      // show full name in the label for filtering (keeps caret/filter behavior)
      getOptionLabel={(option) => (option ? getFullName(option) : '')}
      value={selectedOption}
      inputValue={inputValue}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === 'input') {
          setInputValue(newInputValue)
        } else if (reason === 'clear') {
          setInputValue('')
          setSelectedOption(null)
          setFormData((prev: any) => ({
            ...prev,
            'enquiry_employee_source.id': '',
            'enquiry_employee_source.value': '',
            'enquiry_employee_source.name': ''
          }))
        }
      }}
      onChange={(event, newValue) => {
        if (!newValue) {
          setSelectedOption(null)
          setInputValue('')
          setFormData((prev: any) => ({
            ...prev,
            'enquiry_employee_source.id': '',
            'enquiry_employee_source.value': '',
            'enquiry_employee_source.name': ''
          }))

          return
        }

        setSelectedOption(newValue)
        // keep inputValue to official email as per your original behaviour
        setInputValue(newValue.attributes.Official_Email_ID || '')

        // call your handleChange exactly as before (unchanged)
        handleChange('enquiry_employee_source', newValue.id, [], false, null, {
          name: 'enquiry_employee_source',
          input_type: 'masterDropdownExternal',
          masterOptions: options,
          type: 'extFields',
          keyMap: 'id'
        })

        // push to formData exactly like before (only adding number)
        setFormData((prev: any) => ({
          ...prev,
          'enquiry_employee_source.id': newValue.id,
          'enquiry_employee_source.value': newValue.attributes.Official_Email_ID,
          'enquiry_employee_source.name': newValue.attributes.Full_Name,
          'enquiry_employee_source.number': newValue.attributes.Mobile
        }))
      }}
      // render option (dropdown rows)
      renderOption={(props, option) => {
        const designation = getDesignation(option)
        const location = getLocation(option)

        return (
          <Box
            component="li"
            {...props}
            key={option.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              py: 1.2,
              px: 1.5,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'black' }}>
                {getFullName(option)}
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#1565c0' }}>
                ({option.attributes.Group_Employee_Code || '—'})
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '0.9rem', color: '#424242', fontWeight: 500 }}>
              {designation}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#757575' }}>
              {location}
            </Typography>
          </Box>
        )
      }}
      // We use renderInput and inject a styled startAdornment so selected item looks same as option inside input
     renderInput={(params) => {
  const selectedAdornment = selectedOption ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: 1.1,
        width: '100%',
        scale: '0.85'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'black',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {selectedOption.attributes.Full_Name}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.95rem',
            color: '#1565c0',
            flexShrink: 0,
          }}
        >
          ({selectedOption.attributes.Group_Employee_Code || '—'})
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: '0.9rem',
          color: '#424242',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {selectedOption.attributes?.Designation?.data?.attributes?.Designation || '—'}
      </Typography>

      <Typography
        sx={{
          fontSize: '0.8rem',
          color: '#757575',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {selectedOption.attributes?.Business_Sub_Sub_Vertical?.data?.attributes?.description || '—'}
      </Typography>
    </Box>
  ) : null

  return (
    <TextField
      {...params}
      label={selectedOption ? "Employee Details" : "Search Employee"}
      variant="outlined"
      required
      error={Boolean(formData?.error?.['enquiry_employee_source'])}
      InputProps={{
        ...params.InputProps,
        startAdornment: selectedAdornment ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              pl: 1,
              pr: 1,
              py: 0.5,
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {selectedAdornment}
          </Box>
        ) : (
          params.InputProps.startAdornment
        ),
      }}
      sx={{
        '& .MuiInputBase-root': {
          alignItems: 'flex-start',
          minHeight: '56px', // ✅ standard MUI input height
          height: '56px',
        },
        '& .MuiInputBase-input': {
          display: selectedOption ? 'none' : 'block', // hide text input when selected
        },
      }}
    />
  )
}}

      // keep select on single - disable chips rendering
      disableClearable={false}
      clearOnEscape
      fullWidth
      // ensure the input shows Full_Name text when typing/selecting (getOptionLabel handles it)
      sx={{
        '& .MuiAutocomplete-inputRoot': {
          alignItems: 'flex-start'
        }
      }}
    />
  )
}

export default EnquiryEmployeeSource
