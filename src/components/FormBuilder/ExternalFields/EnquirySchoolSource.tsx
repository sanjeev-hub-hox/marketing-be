import React, { useState, useEffect } from 'react'
import { Autocomplete, TextField, Box, Typography } from '@mui/material'
import { getRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

interface SchoolOption {
  id: number
  attributes: {
    pre_school_name: string
    pre_school_display_name: string
    address_1: string
    address_2?: string
    spoc_name?: string
    spoc_mobile_no?: string
    spoc_email?: string
  }
}

const EnquirySchoolSource = ({
  enquirySchoolSource,
  handleChange,
  val,
  formData,
  setFormData
}: any) => {
  const [options, setOptions] = useState<SchoolOption[]>([])
  const [selectedOption, setSelectedOption] = useState<SchoolOption | null>(null)
  const { setGlobalState } = useGlobalContext()

  // Fetch full school list once when sub-source changes
  useEffect(() => {
    if (!enquirySchoolSource) {
      setOptions([])
      setSelectedOption(null)
      setFormData((prev: any) => ({
        ...prev,
        'enquiry_school_source.id': '',
        'enquiry_school_source.value': '',
        'enquiry_school_source.spoc_name': '',
        'enquiry_school_source.spoc_mobile_no': '',
        'enquiry_school_source.spoc_email': ''
      }))
      
      return
    }

    const fetchOptions = async () => {
      try {
        setGlobalState({ isLoading: true })
        const params = {
          url: `/api/ac-pre-school-tie-ups?pagination[limit]=-1`, // fetch all
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }
        const response = await getRequest(params)
        const data = response?.data || []
        setOptions(data)
      } catch (error) {
        console.error('Error fetching school sources:', error)
        setOptions([])
      } finally {
        setGlobalState({ isLoading: false })
      }
    }

    fetchOptions()
  }, [enquirySchoolSource])

  // Initialize selected option if val exists
  useEffect(() => {
    if (val && options.length) {
      const found = options.find(opt => opt.id === val)
      if (found) setSelectedOption(found)
    }
  }, [val, options])

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) =>
        option.attributes.pre_school_name || ''
      }
      value={selectedOption}
      onChange={(event, newValue) => {
        if (!newValue) {
          setSelectedOption(null)
          setFormData((prev: any) => ({
            ...prev,
            'enquiry_school_source.id': '',
            'enquiry_school_source.value': '',
            'enquiry_school_source.spoc_name': '',
            'enquiry_school_source.spoc_mobile_no': '',
            'enquiry_school_source.spoc_email': ''
          }))

          return
        }

        setSelectedOption(newValue)

        handleChange('enquiry_school_source', newValue.id, [], false, null, {
          name: 'enquiry_school_source',
          input_type: 'masterDropdownExternal',
          masterOptions: options,
          type: 'extFields',
          keyMap: 'id'
        })

        setFormData((prev: any) => ({
          ...prev,
          'enquiry_school_source.id': newValue.id,
          'enquiry_school_source.value':
            newValue.attributes.pre_school_name || '',
          'enquiry_school_source.spoc_mobile_no': newValue.attributes.spoc_mobile_no || '',
          'enquiry_school_source.spoc_email': newValue.attributes.spoc_email || ''
        }))
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          required
          label="Select Pre School Source"
          variant="outlined"
          error={Boolean(formData?.error?.['enquiry_school_source'])}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={option.id}
          display="flex"
          justifyContent="space-between"
          width="100%"
        >
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">
              {option.attributes.pre_school_name || option.attributes.pre_school_display_name}
            </Typography>
            {option.attributes.spoc_email && (
              <Typography variant="body2" color="textSecondary">
                {option.attributes.spoc_email}
              </Typography>
            )}
          </Box>

        </Box>
      )}
    />
  )
}

export default EnquirySchoolSource
