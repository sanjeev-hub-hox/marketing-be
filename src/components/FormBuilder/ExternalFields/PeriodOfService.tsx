import React, { useState, useEffect } from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import axios from 'axios'
import { getRequest } from 'src/services/apiService'

const PeriodOfService = ({ handleChange, val, setFormData, formData, validation }: any) => {
  const [enquirySources, setEnquirySources] = useState([])
  const [selectedSource, setSelectedSource] = useState('')

  useEffect(() => {
    const fetchEnquirySources = async () => {
      const params = {
        url: `/api/fc-period-of-services?fields[1]=name`,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        }
      }

      const response = await getRequest(params)
      if (response) {
        setEnquirySources(response.data)
      }
    }

    fetchEnquirySources()
  }, [])

  //   const handleSourceChange = event => {
  //     setSelectedSource(event.target.value)
  //     onSourceChange(event.target.value)
  //   }

  return enquirySources?.length ? (
    <FormControl fullWidth required>
      <InputLabel id='enquiry-source-label'>Period Of Service</InputLabel>
      <Select
        name='period_of_service'
        labelId='enquiry-source-label'
        value={val}
        label='PSA Sub Type'
        error={Boolean(formData?.error?.['period_of_service'])}
        required
        onChange={e => {
          setFormData({ ...formData, psa_sub_type: '' })
          setFormData({ ...formData, psa_category: '' })

          handleChange('period_of_service', e.target.value, validation, false, null, {
            input_type: 'masterDropdownExternal',
            name: 'period_of_service',
            msterOptions: enquirySources,
            key: ['attributes', 'name']
          })
        }}
      >
        {enquirySources.map((item: any) => (
          <MenuItem key={item.id} value={item.id}>
            {item?.attributes.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : null
}

export default PeriodOfService
