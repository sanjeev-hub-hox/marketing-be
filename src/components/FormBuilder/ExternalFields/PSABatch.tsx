import React, { useState, useEffect } from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import axios from 'axios'
import { getRequest } from 'src/services/apiService'

const PSABatch = ({ handleChange, val, setFormData, formData, validation }: any) => {
  const [enquirySources, setEnquirySources] = useState([])
  const [selectedSource, setSelectedSource] = useState('')

  useEffect(() => {
    const fetchEnquirySources = async () => {
      const params = {
        url: `/api/ac-batches?fields[1]=name&fields[2]=short_name`,
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
      <InputLabel id='enquiry-source-label'>PSA Batch</InputLabel>
      <Select
        name='psa_batch'
        labelId='enquiry-source-label'
        value={val}
        label='PSA Batch'
        error={Boolean(formData?.error?.['psa_batch'])}
        required
        onChange={e => {
          setFormData({ ...formData, psa_sub_type: '' })
          setFormData({ ...formData, psa_category: '' })

          handleChange('psa_batch', e.target.value, validation, false, null, {
            input_type: 'masterDropdownExternal',
            name: 'psa_batch',
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

export default PSABatch
