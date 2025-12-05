import React, { useState, useEffect, useRef } from 'react'
import { FormControl, InputLabel, Select, MenuItem, Box, Tooltip } from '@mui/material'
import axios from 'axios'
import { getRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import InfoIcon from '@mui/icons-material/Info'
import { getObjectByKeyVal, getObjectByKeyValNew, searchObjectsByAttribute } from 'src/utils/helper'

const EnquirySource = ({ enquirySource, handleChange, val, setFormData, formData, infoDialog, enquiryType }: any) => {
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState('')
  const { setGlobalState } = useGlobalContext()
  const hasAutoSelected = useRef(false)

  useEffect(() => {
    const fetchOptions = async () => {
      setGlobalState({ isLoading: true })

      let url = `/api/ad-enquiry-source-mappings?filters[enquiry_source_type][id]=${enquirySource}&populate[0]=enquiry_source`
      switch (enquiryType) {
        case 'readmission_10_11':
          url = `/api/ad-enquiry-source-mappings?filters[enquiry_source_type][id]=2&populate[0]=enquiry_source&filters[id][$eq]=39`
          break
        default:
          url = `/api/ad-enquiry-source-mappings?filters[enquiry_source_type][id]=${enquirySource}&populate[0]=enquiry_source`
          break
      }
      // url = `/api/ad-enquiry-source-mappings?filters[enquiry_source_type][id]=2&populate[0]=enquiry_source&filters[id][$eq]=39`

      if (enquirySource) {
        const params = {
          url: url,
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
            setOptions(filteredData)

            const result = searchObjectsByAttribute(
              filteredData,
              'attributes.enquiry_source.data.id',
              formData?.[`enquiry_source.id`]
            )
            if (!result?.length) {
              setFormData((prevState: any) => {
                return {
                  ...prevState,
                  'enquiry_source.id': '',
                  'enquiry_source.value': '',
                  'enquiry_sub_source.id': '',
                  'enquiry_sub_source.value': ''
                }
              })
            }

            // Auto-select if only one option and no value is already set
            if (filteredData.length === 1 && !val && !hasAutoSelected.current) {
              hasAutoSelected.current = true
              const singleOption = filteredData[0]
              
              setTimeout(() => {
                handleChange('enquiry_source', singleOption?.attributes?.enquiry_source?.data?.id, [], false, null, {
                  input_type: 'masterDropdownExternal',
                  name: 'enquiry_source',
                  msterOptions: filteredData,
                  type: 'extFields',
                  keyMap: 'attributes.enquiry_source.data.id',
                  key: ['attributes', 'enquiry_source', 'data', 'attributes', 'source']
                })
              }, 0)
            }

            setGlobalState({ isLoading: false })
          } else {
            setGlobalState({ isLoading: false })
          }
        }
      }
    }

    // Reset auto-select flag when enquirySource changes
    hasAutoSelected.current = false
    fetchOptions()
  }, [enquirySource])

  // Reset auto-select flag if val is cleared externally
  useEffect(() => {
    if (!val) {
      hasAutoSelected.current = false
    }
  }, [val])

  console.log('options>>', options)
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  return options?.length ? (
    <FormControl fullWidth required>
      <InputLabel id='dependent-option-label'>Enquiry Source</InputLabel>
      <Select
        name={'enquiry_source'}
        labelId='dependent-option-label'
        IconComponent={DownArrow}
        value={val || ''}
        label={
          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
            Enquiry Source
            {infoDialog && (
              <span>
                <Tooltip title={'Enquiry Mode'}>
                  <InfoIcon style={{ color: '#a3a3a3' }} />
                </Tooltip>
              </span>
            )}
          </Box>
        }
        error={Boolean(formData?.error?.['enquiry_source'])}
        onChange={e => {
          setFormData({ ...formData, enquiry_sub_source: '' })

          handleChange('enquiry_source', e.target.value, [], false, null, {
            input_type: 'masterDropdownExternal',
            name: 'enquiry_source',
            msterOptions: options,
            type: 'extFields',
            keyMap: 'attributes.enquiry_source.data.id',
            key: ['attributes', 'enquiry_source', 'data', 'attributes', 'source']
          })
        }}
        disabled={!enquirySource}
      >
        {options.map((item: any) => (
          <MenuItem key={item.id} value={item?.attributes?.enquiry_source?.data?.id}>
            {item?.attributes?.enquiry_source?.data?.attributes?.source}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : null
}

export default EnquirySource