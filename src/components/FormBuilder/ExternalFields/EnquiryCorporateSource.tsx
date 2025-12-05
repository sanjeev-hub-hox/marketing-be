import React, { useState, useEffect } from 'react'
import { Autocomplete, TextField, Box, Typography } from '@mui/material'
import { getRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

interface CorporateOption {
  id: number
  attributes: {
    corporate_name: string
    spoc_mobile_no?: string
    spoc_email?: string
  }
}

const EnquiryCorporateSource = ({
  enquiryCorporateSource,
  handleChange,
  val,
  formData,
  setFormData
}: any) => {
  const [options, setOptions] = useState<CorporateOption[]>([])
  const [selectedOption, setSelectedOption] = useState<CorporateOption | null>(null)
  const { setGlobalState } = useGlobalContext()

  // 🔄 Fetch full corporate list once when sub-source changes
  useEffect(() => {
    if (!enquiryCorporateSource) {
      setOptions([])
      setSelectedOption(null)
      setFormData((prev: any) => ({
        ...prev,
        'enquiry_corporate_source.id': '',
        'enquiry_corporate_source.value': '',
        'enquiry_corporate_source.spoc_mobile_no': '',
        'enquiry_corporate_source.spoc_email': ''
      }))
      
      return
    }

    const fetchOptions = async () => {
      try {
        setGlobalState({ isLoading: true })
        const params = {
          url: `/api/ac-corporate-tie-ups?pagination[limit]=-1`, // fetch all
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }
        const response = await getRequest(params)
        const data = response?.data || []
        setOptions(data)
      } catch (error) {
        console.error('Error fetching corporate sources:', error)
        setOptions([])
      } finally {
        setGlobalState({ isLoading: false })
      }
    }

    fetchOptions()
  }, [enquiryCorporateSource])

  // 🧩 Set selected option when val already exists
  useEffect(() => {
    if (val && options.length) {
      const found = options.find(opt => opt.id === val)
      if (found) setSelectedOption(found)
    }
  }, [val, options])

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.attributes.corporate_name || ''}
      value={selectedOption}
      onChange={(event, newValue) => {
        if (!newValue) {
          setSelectedOption(null)
          setFormData((prev: any) => ({
            ...prev,
            'enquiry_corporate_source.id': '',
            'enquiry_corporate_source.value': '',
            'enquiry_corporate_source.spoc_mobile_no': '',
            'enquiry_corporate_source.spoc_email': ''
          }))

          return
        }

        setSelectedOption(newValue)

        handleChange('enquiry_corporate_source', newValue.id, [], false, null, {
          name: 'enquiry_corporate_source',
          input_type: 'masterDropdownExternal',
          masterOptions: options,
          type: 'extFields',
          keyMap: 'id'
        })

        setFormData((prev: any) => ({
          ...prev,
          'enquiry_corporate_source.id': newValue.id,
          'enquiry_corporate_source.value': newValue.attributes.corporate_name || '',
          'enquiry_corporate_source.spoc_mobile_no': newValue.attributes.spoc_mobile_no || '',
          'enquiry_corporate_source.spoc_email': newValue.attributes.spoc_email || ''
        }))
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Corporate Source"
          variant="outlined"
          required
          error={Boolean(formData?.error?.['enquiry_corporate_source'])}
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
            <Typography variant="body1">{option.attributes.corporate_name}</Typography>
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

export default EnquiryCorporateSource
