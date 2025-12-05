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
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
}))

type PhoneNumber = {
  label?: string
  helperText?: boolean
  required?: boolean
  rowData?: any
  disabled?: boolean
  handleOnChange?: any
  item?: any
  error?: any
}

const PhoneNumberInput = ({
  label,
  helperText,
  required,
  rowData,
  disabled,
  handleOnChange,
  item,
  error
}: PhoneNumber) => {
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  // const [error, setError] = useState('')
  const [countryCodeList, setCountryCodesList] = useState<any>([])

  // useEffect(() => {
  //   if (rowData) {
  //     setPhoneNumber(rowData)
  //   }
  // }, [rowData])

  const getCountryCodes = async () => {
    const params = {
      url: '/api/countries?fields[1]=name&fields[2]=number_code&short=id&sort[0]=id:asc',
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }

    const response = await getRequest(params)
    if (response?.data?.length > 0) {
      setCountryCodesList(response.data.filter((item: any) => item.attributes?.number_code !== null))
    }
  }

  useEffect(() => {
    getCountryCodes()
  }, [])

  const handleCountryChange = (event: SelectChangeEvent) => {
    setCountryCode(event.target.value as string)
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
        disabled={disabled}
        variant='outlined'
        label={label}
        onChange={e =>
          handleOnChange(
            item?.['input_field_name'],
            e.target.value, //countryCode ? countryCode + e.target.value : e.target.value,
            item?.validations,
            item?.validations?.[6]?.validation,
            '',
            item
          )
        }
        placeholder='Phone Number'
        required={required}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Select
                disabled={disabled}
                value={countryCode}
                onChange={handleCountryChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Country code' }}
                sx={{ display: 'flex', alignItems: 'center', marginRight: 1 }}
                IconComponent={ArrowDropDownIcon}
                variant='standard'
              >
                {countryCodeList.length
                  ? countryCodeList.map((country: any) => (
                      <MenuItem key={country.id} value={country.id} sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* <img
                          src={country.flag}
                          alt={country.label}
                          style={{ width: '24px', height: '24px', marginRight: 8 }}
                        /> */}
                        {country?.attributes?.number_code}
                      </MenuItem>
                    ))
                  : null}
              </Select>
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

export default PhoneNumberInput
