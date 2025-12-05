import React, { useState, useEffect } from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import axios from 'axios'
import { getRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

const EnquirySubSource = ({ enquirySubSource, handleChange, val, formData, setFormData, enquiryType }: any) => {
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState('')
  const { setGlobalState } = useGlobalContext()

  useEffect(() => {
    setGlobalState({ isLoading: true })

      let url = `/api/ad-enquiry-source-mappings?filters[enquiry_source][id]=${enquirySubSource}&populate[0]=enquiry_sub_source`
      switch (enquiryType) {
        case 'readmission_10_11':
          url = `/api/ad-enquiry-source-mappings?filters[enquiry_source][id]=6&populate[0]=enquiry_sub_source&filters[id][$eq]=39`
          break
        default:
          url = `/api/ad-enquiry-source-mappings?filters[enquiry_source][id]=${enquirySubSource}&populate[0]=enquiry_sub_source`
          break
      }
      // url = `/api/ad-enquiry-source-mappings?filters[enquiry_source][id]=6&populate[0]=enquiry_sub_source&filters[id][$eq]=39`

    const fetchOptions = async () => {
      if (enquirySubSource) {
        const params = {
          url: url,
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }

        const response = await getRequest(params)
        if (response) {
          setOptions(response.data)
          if (response?.data?.length == 0) {
            setFormData((prevState: any) => ({
              ...prevState,
              'enquiry_sub_source.id': '-1',
              'enquiry_sub_source.value': 'N/A'
            }))
          } else if (response?.data?.length === 1) {
            // Auto-select if only one option is available
            const singleOption = response.data[0]
            handleChange('enquiry_sub_source', singleOption?.attributes?.enquiry_sub_source?.data?.id, [], false, null, {
              name: 'enquiry_sub_source',
              input_type: 'masterDropdownExternal',
              msterOptions: response.data,
              type:'extFields',
              keyMap:'attributes.enquiry_sub_source.data.id',
              key: ['attributes', 'enquiry_sub_source', 'data', 'attributes', 'source']
            })
          }
          setGlobalState({ isLoading: false })
        } else {
          setGlobalState({ isLoading: false })
        }
      } else {
        setOptions([])
      }
      setGlobalState({ isLoading: false })
    }

    fetchOptions()
  }, [enquirySubSource])

  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const clearDependentDropdowns = (selectedSubSource: any) => {
    const dependentFields = [
      'enquiry_employee_source',
      'enquiry_parent_source',
      'enquiry_corporate_source',
      'enquiry_school_source'
    ];

    setFormData((prev: any) => {
      const updated = { ...prev };

      dependentFields.forEach(field => {
        // Only clear if current field is not the selected one
        if (!isFieldMatchingSubSource(field, selectedSubSource)) {
          delete updated[`${field}.id`];
          delete updated[`${field}.value`];
        }
      });

      return updated;
    });
  };

// Helper to match sub-source to dependent dropdown
const isFieldMatchingSubSource = (field: string, subSource: any) => {
  const map: any = {
    'Employee Referral': 'enquiry_employee_source',
    'Parent Referral': 'enquiry_parent_source',
    'Corporate Tie-Up': 'enquiry_corporate_source',
    'Pre School Tie-Up': 'enquiry_school_source'
  };
  
  return map[subSource] === field;
};

  return options?.length ? (
    <FormControl fullWidth required>
      <InputLabel id='dependent-option-label'>Enquiry Sub Source</InputLabel>
      <Select
        name={'enquiry_sub_source'}
        labelId='dependent-option-label'
        value={val}
        error={Boolean(formData?.error?.['enquiry_sub_source'])}
        IconComponent={DownArrow}
        label='Enquiry Sub Source'
        onChange={e => {
          handleChange('enquiry_sub_source', e.target.value, [], false, null, {
            name: 'enquiry_sub_source',
            input_type: 'masterDropdownExternal',
            msterOptions: options,
            type:'extFields',
            keyMap:'attributes.enquiry_sub_source.data.id',
            key: ['attributes', 'enquiry_sub_source', 'data', 'attributes', 'source']
          })
          // Nikhil - Clear dependent dropdowns if sub-source changes
          clearDependentDropdowns(e.target.value);
        }}
        disabled={!enquirySubSource}
      >
        {options && options?.length
          ? options.map((item: any) => (
              <MenuItem key={item.id} value={item?.attributes?.enquiry_sub_source?.data?.id}>
                {item?.attributes?.enquiry_sub_source?.data?.attributes?.source}
              </MenuItem>
            ))
          : null}
      </Select>
    </FormControl>
  ) : null
}

export default EnquirySubSource
