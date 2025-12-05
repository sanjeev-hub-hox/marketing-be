import React, { useState, useEffect, useRef } from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import axios from 'axios'
import { getRequest } from 'src/services/apiService'

const EnquirySourceType = ({ handleChange, val, setFormData, formData, validation, enquiryType }: any) => {
  const [enquirySources, setEnquirySources] = useState([])
  const hasAutoSelected = useRef(false)
  
  let url = "/api/ad-enquiry-source-types"
  switch (enquiryType) {
    case 'readmission_10_11':
      url = "/api/ad-enquiry-source-types?filters[id]=2"
      break
    default:
      url = "/api/ad-enquiry-source-types"
      break
  }
  // url = "/api/ad-enquiry-source-types?filters[id]=2"

  useEffect(() => {
    const fetchEnquirySources = async () => {
      const params = {
        url: url,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        }
      }

      const response = await getRequest(params)
      if (response?.data) {
        setEnquirySources(response.data)
        
        // Auto-select immediately after fetching if only one option
        if (response.data.length === 1 && !val && !hasAutoSelected.current) {
          hasAutoSelected.current = true
          const singleOption = response.data[0]
          
          // Use setTimeout to ensure this runs after the current render cycle
          setTimeout(() => {
            handleChange('enquiry_source_type', singleOption.id, validation, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'enquiry_source_type',
              msterOptions: response.data,
              key: ['attributes', 'type']
            })
          }, 0)
        }
      }
    }

 setTimeout(()=>{
    fetchEnquirySources()
  },1000)
  }, []) // Empty dependency array - only run once

  // Reset auto-select flag if val is cleared externally
  useEffect(() => {
    if (!val) {
      hasAutoSelected.current = false
    }
  }, [val])

  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  return enquirySources?.length ? (
    <FormControl fullWidth required>
      <InputLabel id='enquiry-source-label'>Enquiry Source Type</InputLabel>
      <Select
        name='enquiry_source_type'
        labelId='enquiry-source-label'
        value={val || ''}
        IconComponent={DownArrow}
        label='Enquiry Source Type'
        error={Boolean(formData?.error?.['enquiry_source_type'])}
        required
        onChange={e => {
          handleChange('enquiry_source_type', e.target.value, validation, false, null, {
            input_type: 'masterDropdownExternal',
            name: 'enquiry_source_type',
            msterOptions: enquirySources,
            key: ['attributes', 'type']
          })
        }}
      >
        {enquirySources.map((item: any) => (
          <MenuItem key={item.id} value={item.id}>
            {item?.attributes.type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : null
}

export default EnquirySourceType
