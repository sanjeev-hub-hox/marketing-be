import React, { useEffect, useState } from 'react'
import {
  TextField,
  MenuItem,
  InputAdornment,
  Box,
  Typography,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel
} from '@mui/material'
import { borderBottom, color, display, fontSize, lineHeight, minWidth, styled } from '@mui/system'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { getRequest } from 'src/services/apiService'

// Sample country codes and flags
const countryCodes = [
  { code: '+91', flag: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg', label: 'India' },
  { code: '+1', flag: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg', label: 'USA' },
  { code: '+44', flag: 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg', label: 'UK' }
]

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    padding: '8px 12px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.customColors.text3
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.dark
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.customColors.mainText
    },
    '&::before': {
      borderBottom: '0px',
      borderRight: `1px solid ${theme.palette.customColors.text3}`,
      bottom: '13px',
      right: '-3px'
    },
    '&:hover::before': {
      borderBottom: '0px',
      borderRight: `1px solid ${theme.palette.customColors.text3}`,
      bottom: '13px',
      right: '-3px'
    },
    '&:hover:not(.Mui-disabled):before': {
      borderBottom: '0px'
    },
    '&.Mui-focused::after': {
      borderBottom: '0px'
    },
    '&.Mui-disabled': {
      '& .MuiSelect-select.MuiSelect-standard.MuiInputBase-input': {
        color: theme.palette.customColors.text3
      },
      '& .MuiSvgIcon-root': {
        color: theme.palette.customColors.text3
      }
    },
    '& .MuiSelect-select.MuiSelect-standard.MuiInputBase-input': {
      minWidth: '0px !important',
      paddingRight: '13px',
      display: 'flex',
      alignItems: 'center',
      '& img': {
        width: 24,
        height: 24,
        marginRight: 8
      }
    }
  },
  '& .MuiFormHelperText-root': {
    lineHeight: '18px',
    display: 'flex',
    //justifyContent: 'flex-end',
    alignItems: 'center'
  }
}))

type PhoneNumber = {
  label?: string
  helperText?: boolean
  required?: boolean
  rowData?: any
  disabled?: boolean
}

const PhoneNumberField = ({
  label,
  required,
  rowData,
  disabled,
  placeholder,
  name,
  id,
  value,
  item,
  onChange,
  error,
  helperText,
  setFormData,
  formData,
  countryCodeVal
}: any) => {
  const [countryCode, setCountryCode] = useState<any>(0)
  const [countryCodeList, setCountryCodeList] = useState<any>([])
  const [phoneNumber, setPhoneNumber] = useState(rowData ? rowData?.row.mobileNumber : '9874561231')

  const getCountryCodes = async () => {
    const params = {
      url: `/api/countries?fields[0]=number_code&pagination[page]=1&pagination[pageSize]=1000`,
      serviceURL: 'mdm'
    }

    const response = await getRequest(params)
    if (response.data) {
      const filteredData = response?.data?.filter((item: any) => {
        return item?.attributes?.number_code != null
      })
      setCountryCodeList(filteredData)
    }
  }

  useEffect(() => {
    getCountryCodes()
  }, [])

  const handleCountryChange = (event: SelectChangeEvent) => {
    setFormData((prevState:any)=>{
      return {
        ...prevState,
        [`${item['input_field_name']?.replace(/\.[^.]+$/, ".country_code")}`]:event.target.value
      }
    })
    setCountryCode(event.target.value as any)
  }

  // const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = event.target.value
  //   if (/^\d*$/.test(value) && value.length <= 10) {
  //     setPhoneNumber(value)
  //     if (value.length === 10) {
  //       setError('')
  //     } else {
  //       setError('Please enter a 10-digit phone number.')
  //     }
  //   }
  // }

  return (
    <Box>
      <CustomTextField
        variant='outlined'
        value={value}
        label={label}
        onChange={e =>
          onChange(
            item?.['input_field_name'],
            e.target.value,
            item?.validations,
            item?.validations?.[6]?.validation,
            '',
            item
          )
        }
        placeholder='Phone Number'
        required={required}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              {countryCodeList && countryCodeList?.length ?<Select
                value={countryCodeVal}
                onChange={handleCountryChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Country code' }}
                sx={{ display: 'flex', alignItems: 'center', marginRight: 1 }}
                IconComponent={ArrowDropDownIcon}
                variant='standard'
              >
                {countryCodeList.map((country: any) => (
                  <MenuItem key={country.id} value={country.id} sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* <img
                      src={country.flag}
                      alt={country.label}
                      style={{ width: '24px', height: '24px', marginRight: 8 }}
                    /> */}
                    {country?.attributes?.number_code}
                  </MenuItem>
                ))}
              </Select>:null}
            </InputAdornment>
          )
        }}
        fullWidth
        error={!!error}
        helperText={helperText}
      />
    </Box>
  )
}

export default PhoneNumberField
