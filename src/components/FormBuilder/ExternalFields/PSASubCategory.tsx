import React, { useState, useEffect } from 'react'
import { FormControl, InputLabel, Select, MenuItem, Box, Tooltip } from '@mui/material'
import axios from 'axios'
import { getRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import InfoIcon from '@mui/icons-material/Info'

const PSASubCategory = ({ psaSubType, handleChange, val, setFormData, formData, infoDialog }: any) => {
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState('')
  const { setGlobalState } = useGlobalContext()
  console.log('psaSubType', psaSubType)
  useEffect(() => {
    const fetchOptions = async () => {
      setGlobalState({ isLoading: true })

      const params = {
        url: `/api/ac-spa-subjects?fields[1]=name&fields[2]=short_name`,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        }
      }

      const response = await getRequest(params)
      if (response) {
        const filteredData: any = []
        const seenSources = new Set()

        if (response.data?.length) {
          response.data.forEach((item: any) => {
            const source = item.attributes?.enquiry_source?.data?.attributes?.source
            if (source && !seenSources.has(source)) {
              seenSources.add(source)
              filteredData.push(item)
            }
          })
          setOptions(response.data)
          setGlobalState({ isLoading: false })
        } else {
          setGlobalState({ isLoading: false })
        }
      }
    }

    fetchOptions()
  }, [])
  console.log('options>>', options)

  return options?.length ? (
    <FormControl fullWidth required>
      <InputLabel id='dependent-option-label'>PSA Sub Category</InputLabel>
      <Select
        name={'psa_sub_category'}
        labelId='dependent-option-label'
        value={val}
        label={
          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
            PSA Sub Category
            {infoDialog && (
              <span>
                <Tooltip title={'PSA Sub Category'}>
                  <InfoIcon style={{ color: '#a3a3a3' }} />
                </Tooltip>
              </span>
            )}
          </Box>
        }
        error={Boolean(formData?.error?.['psa_sub_category'])}
        onChange={e => {
          setFormData({ ...formData, enquiry_sub_source: '' })

          handleChange('psa_sub_category', e.target.value, [], false, null, {
            input_type: 'masterDropdownExternal',
            name: 'psa_sub_category',
            msterOptions: options,
            key: ['attributes', 'name']
          })
        }}
      >
        {options.map((item: any) => (
          <MenuItem key={item.id} value={item.id}>
            {item?.attributes?.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : null
}

export default PSASubCategory
