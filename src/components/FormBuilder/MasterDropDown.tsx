import {
  FormControl,
  InputLabel,
  FormHelperText,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  Box,
  Tooltip
} from '@mui/material'
import style from '../../pages/stages/stage.module.css'
import { use, useEffect, useState } from 'react'
import { getRequest } from 'src/services/apiService'
import { getObjectByKeyVal } from 'src/utils/helper'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import InfoIcon from '@mui/icons-material/Info'
import dynamic from 'next/dynamic'

interface MasterProps {
  item: any
  masterDropDownOptions: any
  handleChange: any
  formData: any
  _text: any
  setMasterDropDownOptions: any
  formFieldsInput: any
  dependentFields?: any
  infoDialog?: any
}
export default function MasterDropDown({
  item,
  masterDropDownOptions,
  handleChange,
  formData,
  _text,
  setMasterDropDownOptions,
  formFieldsInput,
  dependentFields,
  infoDialog
}: MasterProps) {
  // console.log('item', item)
  // console.log('masterDropDownOptions123', masterDropDownOptions)
  // console.log('handleChange', handleChange)
  // console.log('_text', _text, item?.input_id, formFieldsInput)
  const { setGlobalState } = useGlobalContext()
  const [selectedValue, setSelectedValue] = useState(null)

  const options = masterDropDownOptions?.[item?.input_field_name] || []

  useEffect(() => {
    const dd = getObjectByKeyVal(formFieldsInput, 'input_dependent_field', item?.['input_id'])
    if (!options?.length) {
      setMasterDropDownOptions((prevState: any) => {
        return {
          ...prevState,
          [dd?.['input_field_name']]: []
        }
      })
    } else {
      const selectedOption =
        options?.find((opt: any) => opt?.id === formData?.[`${item?.['input_field_name']}.id`]) || null
      setSelectedValue(selectedOption)
    }
  }, [options, formData])

  useEffect(() => {
    handleDependentOptionList()
  }, [formData['residential_details.current_address.country'], formData['residential_details.current_address.state']])

  const handleSelectChange = async (event: any, newValue: any | null) => {
    if (dependentFields[item?.input_id]) {
      const dd = getObjectByKeyVal(formFieldsInput, 'input_dependent_field', item?.['input_id'])

      if (dd?.input_dependent_key) {
        setGlobalState({ isLoading: true })

        const params = {
          url: '/' + dd?.['input_default_value'] + `=${newValue?.id}`,
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }

        const response = await getRequest(params)
        if (response?.data) {
          const newObj = { ...masterDropDownOptions, [dd?.['input_feild_name']]: response?.data }
          setMasterDropDownOptions((prevState: any) => {
            return {
              ...prevState,
              [dd?.['input_field_name']]: response?.data
            }
          })
          //setMasterDropDownOptions(newObj)
        } else {
          setMasterDropDownOptions((prevState: any) => {
            return {
              ...prevState,
              [dd?.['input_field_name']]: []
            }
          })
        }
        setGlobalState({ isLoading: false })
      }
    }

    setSelectedValue(newValue)
    handleChange(
      item?.['input_field_name'],
      newValue?.id || '',
      item?.validations,
      item?.validations?.[6]?.validation,
      _text?.id || '',
      item
    )
  }
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  const handleDependentOptionList = async () => {
    setGlobalState({ isLoading: true })
    if (item?.['input_dependent_field'] && item?.['input_dependent_key']) {
      const dd = getObjectByKeyVal(formFieldsInput, 'input_id', item?.['input_dependent_field'])

      const params = {
        url: '/' + item?.['input_default_value'] + `=${formData?.[`${dd?.input_field_name}.id`]}`,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        }
      }

      const response = await getRequest(params)
      if (response?.data) {
        const newObj = { ...masterDropDownOptions, [item?.input_field_name]: response?.data }
        setMasterDropDownOptions((prevState: any) => {
          return {
            ...prevState,
            [item?.input_field_name]: response?.data
          }
        })
        // setMasterDropDownOptions(newObj)
      } else {
        setMasterDropDownOptions((prevState: any) => {
          return {
            ...prevState,
            [item?.input_field_name]: []
          }
        })
      }
    }
    setGlobalState({ isLoading: false })
  }

  return (
    <>
      {options.length > 0 ? (
        <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
          <Autocomplete
            onFocus={handleDependentOptionList}
            fullWidth
            id={item?.['input_field_name']}
            disabled={getObjectByKeyVal(item?.validations, 'type', 'readonly')?.validation === true ? true : false}
            options={options}
            getOptionLabel={(option: any) =>
              option?.attributes.name || option?.attributes.description || Object.values(option?.attributes)[0]
            }
            className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedValue}
            onChange={handleSelectChange}
            renderInput={params => (
              <TextField
                {...params}
                // InputProps={{
                //   readOnly: item?.validations?.[10]?.validation ? true : false
                // }}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                    {item?.['input_label']}
                    {infoDialog && item?.['input_note'] && (
                      <span>
                        <Tooltip title={item?.['input_note']}>
                          <InfoIcon style={{ color: '#a3a3a3' }} />
                        </Tooltip>
                      </span>
                    )}
                  </Box>
                }
                placeholder={item?.['input_placeholder']}
                error={Boolean(formData?.error?.[item?.['input_field_name']])}
                required={item?.validations?.[0]?.validation}
              />
            )}
            popupIcon={<DownArrow />}
          />

          <FormHelperText>
            <span className={style.errorField}>
              {formData?.error?.[item?.['input_field_name']] ? formData?.error?.[item?.['input_field_name']] : ``}
            </span>
          </FormHelperText>
        </FormControl>
      ) : (
        <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
          <Autocomplete
            onFocus={handleDependentOptionList}
            disabled={true}
            fullWidth
            id={item?.['input_field_name']}
            options={[]}
            // getOptionLabel={(option: any) =>
            //   option?.attributes.name || option?.attributes.description || Object.values(option?.attributes)[0]
            // }
            className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
            // isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedValue}
            onChange={handleSelectChange}
            renderInput={params => (
              <TextField
                {...params}
                // InputProps={{
                //   readOnly: item?.validations?.[10]?.validation ? true : false
                // }}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                    {item?.['input_label']}
                    {infoDialog && item?.['input_note'] && (
                      <span>
                        <Tooltip title={item?.['input_note']}>
                          <InfoIcon style={{ color: '#a3a3a3' }} />
                        </Tooltip>
                      </span>
                    )}
                  </Box>
                }
                placeholder={item?.['input_placeholder']}
                error={Boolean(formData?.error?.[item?.['input_field_name']])}
                required={item?.validations?.[0]?.validation}
              />
            )}
            popupIcon={<DownArrow />}
          />

          <FormHelperText>
            <span className={style.errorField}>
              {formData?.error?.[item?.['input_field_name']] ? formData?.error?.[item?.['input_field_name']] : ``}
            </span>
          </FormHelperText>
        </FormControl>
      )}
    </>
  )
}
