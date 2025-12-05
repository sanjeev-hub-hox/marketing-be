'use client'

import {
  Autocomplete,
  Grid,
  TextField,
  CircularProgress,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Tooltip,
  MenuItem,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  InputLabel,
  Select
} from '@mui/material'
import { CalendarIcon, DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import DownArrow from 'src/@core/CustomComponent/DownArrow/DownArrow'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { getRequest, postRequest } from 'src/services/apiService'
import { getCurrentYearObject, getObjectByKeyVal, getObjectByKeyValNew, getUserInfo } from 'src/utils/helper'
import style from '../../../pages/stages/stage.module.css'
import InfoIcon from '@mui/icons-material/Info'
import { ENQUIRY_STAGES } from 'src/utils/constants'
import PhoneNumberField from 'src/components/PhoneNumberField'

interface AutocompleteProps {
  label?: any
  value?: any
  onChange?: any
  options?: any
  loading?: any
  getOptionLabel?: any
}

const CommonAutocomplete = ({
  label,
  value,
  onChange,
  options = [],
  loading,
  getOptionLabel,
  error,
  note,
  infoDialog,
  id,
  required
}: any) => {
  return (
    <Autocomplete
      id={id}
      options={options}
      getOptionLabel={getOptionLabel || (option => option?.name || '')}
      value={options.find((option: any) => option.id === value) || null}
      onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
      loading={loading}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option.name}
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={
            <Box sx={{ display: 'flex', alignItems: 'normal' }}>
              {label}
              {infoDialog && note && (
                <span>
                  <Tooltip title={note}>
                    <InfoIcon style={{ color: '#a3a3a3' }} />
                  </Tooltip>
                </span>
              )}
            </Box>
          }
          variant='outlined'
          error={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color='inherit' size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
          required={required}
        />
      )}
      popupIcon={<DownArrow />}
    />
  )
}

export default function ParentsDetails({
  areParentSingle,
  parentType,
  formData,
  handleChange,
  handleParentFieldChange,
  validationArray,
  setFormData
}: any) {
  const { setGlobalState } = useGlobalContext()
  const [dropdownData, setDropdownData] = useState<any>({})
  const [stateOptions, setStateOptions] = useState<any>([])
  const [cityOptions, setCityOptions] = useState<any>([])

  const setOptionsFormat = (array: any, key: any) => {
    const arrayData = array
      .map((val: any, index: any) => {
        return {
          id: val?.id,
          name: val?.attributes[key],
          value: val?.attributes[key]
        }
      })
      .filter((val: any) => {
        return val?.name
      })

    return arrayData
  }

  // const fetchOptions = async (operator: any, setOptions?: any, optionSet?: any, apiUrl?: any) => {
  //     try {
  //         setGlobalState({ isLoading: true })
  //         const params = {
  //             url: apiUrl,
  //             serviceURL: 'mdm',
  //             data: { operator }
  //         }
  //         const response = await postRequest(params)
  //         const opData = setOptionsFromResponse(response?.data?.schools, optionSet)
  //         if (optionSet?.id == 'grade_id') {
  //             const sortedData = opData.sort((a: any, b: any) => a.id - b.id)
  //             setOptions(sortedData)
  //         } else {
  //             setOptions(opData)
  //         }
  //     } catch (error) {
  //         console.error('Error fetching options:', error)
  //     } finally {
  //         setGlobalState({ isLoading: false })
  //     }

  // }

  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const dropdownRequests = [
          getRequest({
            url: '/api/co-qualifications?fields[1]=Education&fields[2]=Description',
            serviceURL: 'mdm'
          }),
          getRequest({
            url: '/api/co-occupations?fields[1]=Name&fields[2]=Order',
            serviceURL: 'mdm'
          }),
          getRequest({
            url: '/api/organizations?fields[1]=name',
            serviceURL: 'mdm'
          }),
          getRequest({
            url: '/api/ps-designations?fields[1]=Designation',
            serviceURL: 'mdm'
          }),
          getRequest({
            url: '/api/co-guardian-relationships',
            serviceURL: 'mdm'
          }),
          getRequest({
            url: '/api/countries?sort[0]=id:asc',
            serviceURL: 'mdm'
          }),
          getRequest({
            url: '/api/states',
            serviceURL: 'mdm'
          }),
          getRequest({
            url: '/api/cities',
            serviceURL: 'mdm'
          })
        ]

        const [
          qualificationOptions,
          occupationOptions,
          organizationOptions,
          designationOptions,
          relationshipOptions,
          countriesOptions,
          states,
          cities
        ] = await Promise.all(dropdownRequests)

        setDropdownData({
          qualification: setOptionsFormat(qualificationOptions.data, 'Education'),
          occupations: setOptionsFormat(occupationOptions.data, 'Name'),
          organizations: setOptionsFormat(organizationOptions.data, 'name'),
          designations: setOptionsFormat(designationOptions.data, 'Designation'),
          relationships: setOptionsFormat(relationshipOptions.data, 'name'),
          countries: setOptionsFormat(countriesOptions.data, 'name')
        })
        setStateOptions(setOptionsFormat(states.data, 'name'))
        setCityOptions(setOptionsFormat(cities.data, 'name'))
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
      }
    }

    fetchDropdownData()
  }, [])

  const getFieldCondition = (fieldName: string) => {
    switch (fieldName) {
      case 'father':
        return (
          formData['parent_details.is_parent_single'] == 'no' ||
          (formData['parent_details.is_parent_single'] == 'yes' &&
            formData['parent_details.single_parent_type'] == 'father')
        )
        break

      case 'mother':
        return (
          formData['parent_details.is_parent_single'] == 'no' ||
          (formData['parent_details.is_parent_single'] == 'yes' &&
            formData['parent_details.single_parent_type'] == 'mother')
        )
        break
      case 'guardian':
        return (
          formData['parent_details.is_parent_single'] == 'yes' &&
          formData['parent_details.single_parent_type'] == 'guardian'
        )

        break
    }
  }

  const getDataFromPin = async (pincode: any) => {
    const params = {
      url: `/api/co-pincodes?filters[Pincode]=${pincode}&populate[0]=District_Or_City&populate[District_Or_City][populate]=State&populate[State][populate]=country`,
      serviceURL: 'mdm'
    }

    return await getRequest(params)
  }

  const handlePincodeChange = async (fieldName: any, value: any) => {
    if (value?.length == 6) {
      switch (fieldName) {
        case 'parent_details.father_details.pin_code':
          const response = await getDataFromPin(value)
          if (response && response?.data?.length) {
            setFormData((prevState: any) => ({
              ...prevState,
              ['parent_details.father_details.country']: {
                id: response?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.id,
                value: response?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.attributes?.name
              },
              ['parent_details.father_details.country.id']:
                response?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.id,
              ['parent_details.father_details.country.value']:
                response?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.attributes?.name,
              ['parent_details.father_details.state.id']: response?.data[0]?.attributes?.State?.data?.id,
              ['parent_details.father_details.state.value']:
                response?.data[0]?.attributes?.State?.data?.attributes?.name,
              ['parent_details.father_details.city.id']: response?.data[0]?.attributes?.District_Or_City?.data?.id,
              ['parent_details.father_details.city.value']:
                response?.data[0]?.attributes?.District_Or_City?.data?.attributes?.name
            }))
          }
          break
        case 'parent_details.mother_details.pin_code':
          const response1 = await getDataFromPin(value)
          if (response1 && response1?.data?.length) {
            setFormData((prevState: any) => ({
              ...prevState,
              ['parent_details.mother_details.country']: {
                id: response1?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.id,
                value: response1?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.attributes?.name
              },
              ['parent_details.mother_details.country.id']:
                response1?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.id,
              ['parent_details.mother_details.country.value']:
                response1?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.attributes?.name,
              ['parent_details.mother_details.state.id']: response1?.data[0]?.attributes?.State?.data?.id,
              ['parent_details.mother_details.state.value']:
                response1?.data[0]?.attributes?.State?.data?.attributes?.name,
              ['parent_details.mother_details.city.id']: response1?.data[0]?.attributes?.District_Or_City?.data?.id,
              ['parent_details.mother_details.city.value']:
                response1?.data[0]?.attributes?.District_Or_City?.data?.attributes?.name
            }))
          }
          break
        case 'parent_details.guardian_details.pin_code':
          const response2 = await getDataFromPin(value)
          if (response2 && response2?.data?.length) {
            setFormData((prevState: any) => ({
              ...prevState,
              ['parent_details.guardian_details.country']: {
                id: response2?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.id,
                value: response2?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.attributes?.name
              },
              ['parent_details.guardian_details.country.id']:
                response2?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.id,
              ['parent_details.guardian_details.country.value']:
                response2?.data[0]?.attributes?.State?.data?.attributes?.country?.data?.attributes?.name,
              ['parent_details.guardian_details.state.id']: response2?.data[0]?.attributes?.State?.data?.id,
              ['parent_details.guardian_details.state.value']:
                response2?.data[0]?.attributes?.State?.data?.attributes?.name,
              ['parent_details.guardian_details.city.id']: response2?.data[0]?.attributes?.District_Or_City?.data?.id,
              ['parent_details.guardian_details.city.value']:
                response2?.data[0]?.attributes?.District_Or_City?.data?.attributes?.name
            }))
          }
          break
      }
    }
  }

  return (
    <>
      <Grid item container xs={12} spacing={5} sx={{ mt: '15px' }}>
        <Grid item xs={12}>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>Is Parent Single</FormLabel>
            <RadioGroup
              row
              name='parent_details.is_parent_single'
              value={formData['parent_details.is_parent_single'] || 'no'}
              onChange={e => {
                handleParentFieldChange('parent_details.is_parent_single', e.target.value, [])
              }}
            >
              <FormControlLabel value='yes' control={<Radio />} label='Yes' />
              <FormControlLabel value='no' control={<Radio />} label='No' />
            </RadioGroup>
          </FormControl>
        </Grid>
        {formData['parent_details.is_parent_single'] == 'yes' ? (
          <Grid item xs={12}>
            <FormControl sx={{ width: '33%' }} variant='outlined'>
              <InputLabel id='parent-type-label'>Parent Type</InputLabel>
              <Select
                name='parent_details.single_parent_type'
                labelId='parent-type-label'
                value={formData['parent_details.single_parent_type']}
                onChange={e => {
                  handleParentFieldChange('parent_details.single_parent_type', e.target.value, [])
                }}
                label='Single Parent Type'
              >
                <MenuItem value='father'>Father</MenuItem>
                <MenuItem value='mother'>Mother</MenuItem>
                <MenuItem value='guardian'>Guardian</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        ) : null}

        <Grid item xs={12} md={12}>
          <Typography variant='h6' color={'text.primary'} sx={{ lineHeight: '22px' }}>
            Fathers Details
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Father First Name'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.first_name']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.first_name',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('father') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.first_name',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.first_name'] ? true : false }}
            required={getFieldCondition('father')}
            error={Boolean(formData?.error?.['parent_details.father_details.first_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.first_name']) &&
              formData?.error?.['parent_details.father_details.first_name']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Father Last Name'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.last_name']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.last_name',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('father') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.last_name',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.last_name'] ? true : false }}
            required={getFieldCondition('father')}
            error={Boolean(formData?.error?.['parent_details.father_details.last_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.last_name']) &&
              formData?.error?.['parent_details.father_details.last_name']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='PAN Number'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.pan']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.pan',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'mobile_no',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'regex',
                    validation: true,
                    error_message: 'Invalid Pan number',
                    regexFormat: '[A-Z]{5}[0-9]{4}[A-Z]{1}'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.pan',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.pan'] ? true : false }}
            error={Boolean(formData?.error?.['parent_details.father_details.pan'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.pan']) &&
              formData?.error?.['parent_details.father_details.pan']
            }
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'qualification'}
            label='Qualification'
            value={formData['parent_details.father_details.qualification.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.father_details.qualification',
                value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'qualification',
                  msterOptions: dropdownData?.qualification,
                  key: ['qualification'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.qualification}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //infoDialog={infoDialog}
            //required={getFieldCondition('father')}
            note={'Qualification'}
            error={Boolean(formData?.error?.['parent_details.father_details.qualification'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.qualification']) &&
              formData?.error?.['parent_details.father_details.qualification']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Aadhar Number'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.aadhar']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.aadhar',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation:  false,
                    error_message: 'Field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'mobile_no',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'regex',
                    validation: true,
                    error_message: 'Invalid Aadhar number',
                    regexFormat: '^\\d{12}$'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.aadhar',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.aadhar'] ? true : false }}
            required={false}
            error={Boolean(formData?.error?.['parent_details.father_details.aadhar'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.aadhar']) &&
              formData?.error?.['parent_details.father_details.aadhar']
            }
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'occupation'}
            label='Occupation'
            value={formData['parent_details.father_details.occupation.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.father_details.occupation',
                value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'occupation',
                  msterOptions: dropdownData?.occupations,
                  key: ['occupation'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.occupations}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //required={getFieldCondition('father')}
            //infoDialog={infoDialog}
            note={'Occupation'}
            error={Boolean(formData?.error?.['parent_details.father_details.occupation'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.occupation']) &&
              formData?.error?.['parent_details.father_details.occupation']
            }
          />
        </Grid>
        <Grid item xs={4} md={4}>
          {/* <CommonAutocomplete
            id={'organization_name'}
            label='Organisation Name'
            value={formData['parent_details.father_details.organization_name.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.father_details.organization_name',
                value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('father') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'organization_name',
                  msterOptions: dropdownData?.organizations,
                  key: ['organization_name'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.organizations}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //infoDialog={infoDialog}
            required={getFieldCondition('father')}
            note={'Organisation Name'}
            error={Boolean(formData?.error?.['parent_details.father_details.organization_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.organization_name']) &&
              formData?.error?.['parent_details.father_details.organization_name']
            }
          /> */}
          <TextField
            label='Organisation Name'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.organization_name']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.organization_name',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.organization_name',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.organization_name'] ? true : false }}
            //required={getFieldCondition('father')}
            error={Boolean(formData?.error?.['parent_details.father_details.organization_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.organization_name']) &&
              formData?.error?.['parent_details.father_details.organization_name']
            }
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'designation'}
            label='Designation'
            value={formData['parent_details.father_details.designation.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.father_details.designation',
                value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'designation',
                  msterOptions: dropdownData?.designations,
                  key: ['designation'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.designations}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //infoDialog={infoDialog}
            //required={getFieldCondition('father')}
            note={'Designation'}
            error={Boolean(formData?.error?.['parent_details.father_details.designation'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.designation']) &&
              formData?.error?.['parent_details.father_details.designation']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Organization Address'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.office_address']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.office_address',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.office_address',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.office_address'] ? true : false }}
            error={Boolean(formData?.error?.['parent_details.father_details.office_address'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.office_address']) &&
              formData?.error?.['parent_details.father_details.office_address']
            }
          />
        </Grid>
        {/* <Grid item xs={12} md={4}>
          <TextField
            label='Area'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.area']}
            onChange={e => {
                handleChange(
                  'parent_details.father_details.area',
                  e.target.value,
                  [
                    {
                      type: 'is_required',
                      validation: getFieldCondition('father') ? true : false,
                      error_message: 'Field is required'
                    }
                  ],
                  false,
                  null,
                  {
                    name: 'parent_details.father_details.area',
                    input_type: 'externalParents'
                  }
                )
              }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid> */}
        <Grid item xs={12} md={4}>
          <TextField
            label='Pincode'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.pin_code']}
            onChange={e => {
              handlePincodeChange('parent_details.father_details.pin_code', e.target.value)
              handleChange(
                'parent_details.father_details.pin_code',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'This field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'mobile_no',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'regex',
                    validation: getFieldCondition('father') ? true : false,
                    error_message: 'Invalid Pincode',
                    regexFormat: '^\\d{6}$'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.pin_code',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.pin_code'] ? true : false }}
            error={Boolean(formData?.error?.['parent_details.father_details.pin_code'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.pin_code']) &&
              formData?.error?.['parent_details.father_details.pin_code']
            }
            //required={getFieldCondition('father')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Country'
            disabled
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.country.value']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.country',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.country',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.country'] ? true : false }}
            //required={getFieldCondition('father')}
            error={Boolean(formData?.error?.['parent_details.father_details.country'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.country']) &&
              formData?.error?.['parent_details.father_details.country']
            }
          />
        </Grid>
        {/* <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'country'}
            label='Country'
            value={formData['parent_details.father_details.country.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.father_details.country',
                value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('father') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'country',
                  msterOptions: dropdownData?.countries,
                  key: ['country'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.countries}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            required={getFieldCondition('father')}
            //infoDialog={infoDialog}
            note={'Country'}
            error={Boolean(formData?.error?.['parent_details.father_details.country'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.country']) &&
              formData?.error?.['parent_details.father_details.country']
            }
          />
        </Grid> */}
        {/* <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'state'}
            label='State'
            value={formData['parent_details.father_details.state.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.father_details.state',
                value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('father') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'state',
                  msterOptions: stateOptions,
                  key: ['state'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={stateOptions}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //infoDialog={infoDialog}
            required={getFieldCondition('father')}
            note={'State'}
            error={Boolean(formData?.error?.['parent_details.father_details.state'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.state']) &&
              formData?.error?.['parent_details.father_details.state']
            }
          />
        </Grid> */}
        {/* <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'city'}
            label='City'
            value={formData['parent_details.father_details.city.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.father_details.city',
                value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('father') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'city',
                  msterOptions: cityOptions,
                  key: ['state'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={cityOptions}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //infoDialog={infoDialog}
            required={getFieldCondition('father')}
            note={'City'}
            error={Boolean(formData?.error?.['parent_details.father_details.city'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.city']) &&
              formData?.error?.['parent_details.father_details.city']
            }
          />
        </Grid> */}
        <Grid item xs={12} md={4}>
          <TextField
            label='State'
            disabled
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.state.value']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.state',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.state',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.state.value'] ? true : false }}
            //required={getFieldCondition('father')}
            error={Boolean(formData?.error?.['parent_details.father_details.state'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.state']) &&
              formData?.error?.['parent_details.father_details.state']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='City'
            disabled
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.city.value']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.city',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.city',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.city.value'] ? true : false }}
            //required={getFieldCondition('father')}
            error={Boolean(formData?.error?.['parent_details.father_details.city'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.city']) &&
              formData?.error?.['parent_details.father_details.city']
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          {/* <TextField
            label='Mobile Number'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.mobile']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.mobile',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('father') ? true : false,
                    error_message: 'Field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: false,
                    error_message: 'Please enter valid email'
                  },
                  {
                    type: 'mobile_no',
                    validation: true,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.mobile',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.mobile'] ? true : false }}
            required={getFieldCondition('father')}
            error={Boolean(formData?.error?.['parent_details.father_details.mobile'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.mobile']) &&
              formData?.error?.['parent_details.father_details.mobile']
            }
          /> */}
          <PhoneNumberField
            setFormData={setFormData}
            required={ getFieldCondition('father') ? true : false}
            formData={formData}
            label='Mobile Number'
            onChange={handleChange}
            countryCodeVal={formData[`${'parent_details.father_details.mobile'?.replace(/\.[^.]+$/, ".country_code")}`]}
            value={formData['parent_details.father_details.mobile']}
             error={Boolean(formData?.error?.['parent_details.father_details.mobile'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.mobile']) &&
              formData?.error?.['parent_details.father_details.mobile']
            }
            item={{
              input_field_name:'parent_details.father_details.mobile',
              validations: [
                {
                  type: 'is_required',
                  validation: getFieldCondition('father') ? true : false,
                  error_message: 'Field is required'
                },
                {
                  type: 'numeric',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'alphanumeric',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'email',
                  validation: false,
                  error_message: 'Please enter valid email'
                },
                {
                  type: 'mobile_no',
                  validation: true,
                  error_message: "Value must be a proper mobile number"
                },
                {
                  type: 'range',
                  validation: false,
                  error_message: '',
                  min: 0,
                  max: 0
                },
                {
                  type: 'is_repeatable',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'is_group_repeatable',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'is_hidden',
                  validation: false,
                  error_message: ''
                }
              ]
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Email ID'
            type='email'
            fullWidth
            variant='outlined'
            value={formData['parent_details.father_details.email']}
            onChange={e => {
              handleChange(
                'parent_details.father_details.email',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('father') ? true : false,
                    error_message: 'Field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: true,
                    error_message: 'Please enter valid email'
                  },
                  {
                    type: 'mobile_no',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.father_details.email',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.father_details.email'] ? true : false }}
            required={getFieldCondition('father')}
            error={Boolean(formData?.error?.['parent_details.father_details.email'])}
            helperText={
              Boolean(formData?.error?.['parent_details.father_details.email']) &&
              formData?.error?.['parent_details.father_details.email']
            }
          />
        </Grid>
      </Grid>
      <Grid item container xs={12} spacing={5} sx={{ mt: '15px' }}>
        <Grid item xs={12} md={12}>
          <Typography variant='h6' color={'text.primary'} sx={{ lineHeight: '22px' }}>
            Mothers Details
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Mother First Name'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.first_name']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.first_name',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('mother') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.first_name',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.first_name'] ? true : false }}
            required={getFieldCondition('mother')}
            error={Boolean(formData?.error?.['parent_details.mother_details.first_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.first_name']) &&
              formData?.error?.['parent_details.mother_details.first_name']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Mother Last Name'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.last_name']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.last_name',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('mother') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.last_name',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.last_name'] ? true : false }}
            required={getFieldCondition('mother')}
            error={Boolean(formData?.error?.['parent_details.mother_details.last_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.last_name']) &&
              formData?.error?.['parent_details.mother_details.last_name']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='PAN Number'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.pan']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.pan',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation:  false,
                    error_message: 'Field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'mobile_no',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'regex',
                    validation: true,
                    error_message: 'Invalid Pan number',
                    regexFormat: '[A-Z]{5}[0-9]{4}[A-Z]{1}'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.pan',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.pan'] ? true : false }}
            error={Boolean(formData?.error?.['parent_details.mother_details.pan'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.pan']) &&
              formData?.error?.['parent_details.mother_details.pan']
            }
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'qualification'}
            label='Qualification'
            value={formData['parent_details.mother_details.qualification.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.mother_details.qualification',
                value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'qualification',
                  msterOptions: dropdownData?.qualification,
                  key: ['qualification'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.qualification}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //infoDialog={infoDialog}
            //required={getFieldCondition('mother')}
            note={'Qualification'}
            error={Boolean(formData?.error?.['parent_details.mother_details.qualification'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.qualification']) &&
              formData?.error?.['parent_details.mother_details.qualification']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Aadhar Number'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.aadhar']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.aadhar',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation:  false,
                    error_message: 'Field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'mobile_no',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'regex',
                    validation: true,
                    error_message: 'Invalid Aadhar number',
                    regexFormat: '^\\d{12}$'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.aadhar',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.aadhar'] ? true : false }}
            error={Boolean(formData?.error?.['parent_details.mother_details.aadhar'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.aadhar']) &&
              formData?.error?.['parent_details.mother_details.aadhar']
            }
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'occupation'}
            label='Occupation'
            value={formData['parent_details.mother_details.occupation.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.mother_details.occupation',
                value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'occupation',
                  msterOptions: dropdownData?.occupations,
                  key: ['occupation'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.occupations}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //required={getFieldCondition('mother')}
            //infoDialog={infoDialog}
            note={'Occupation'}
            error={Boolean(formData?.error?.['parent_details.mother_details.occupation'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.occupation']) &&
              formData?.error?.['parent_details.mother_details.occupation']
            }
          />
        </Grid>
        <Grid item xs={4} md={4}>
          {/* <CommonAutocomplete
            id={'organization_name'}
            label='Organisation Name'
            value={formData['parent_details.mother_details.organization_name.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.mother_details.organization_name',
                value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('mother') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'organization_name',
                  msterOptions: dropdownData?.organizations,
                  key: ['organization_name'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.organizations}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //infoDialog={infoDialog}
            required={getFieldCondition('mother')}
            note={'Organisation Name'}
            error={Boolean(formData?.error?.['parent_details.mother_details.organization_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.organization_name']) &&
              formData?.error?.['parent_details.mother_details.organization_name']
            }
          /> */}
          <TextField
            label='Organisation Name'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.organization_name']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.organization_name',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.organization_name',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.organization_name'] ? true : false }}
            //required={getFieldCondition('father')}
            error={Boolean(formData?.error?.['parent_details.mother_details.organization_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.organization_name']) &&
              formData?.error?.['parent_details.mother_details.organization_name']
            }
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'designation'}
            label='Designation'
            value={formData['parent_details.mother_details.designation.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.mother_details.designation',
                value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'designation',
                  msterOptions: dropdownData?.designations,
                  key: ['designation'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.designations}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            //infoDialog={infoDialog}
            //required={getFieldCondition('mother')}
            note={'Designation'}
            error={Boolean(formData?.error?.['parent_details.mother_details.designation'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.designation']) &&
              formData?.error?.['parent_details.mother_details.designation']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Organization Address'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.office_address']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.office_address',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.office_address',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.office_address'] ? true : false }}
            error={Boolean(formData?.error?.['parent_details.mother_details.office_address'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.office_address']) &&
              formData?.error?.['parent_details.mother_details.office_address']
            }
          />
        </Grid>
        {/* <Grid item xs={12} md={4}>
          <TextField
            label='Area'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.area']}
            onChange={e => {
                handleChange(
                  'parent_details.mother_details.area',
                  e.target.value,
                  [
                    {
                      type: 'is_required',
                      validation: getFieldCondition('mother') ? true : false,
                      error_message: 'Field is required'
                    }
                  ],
                  false,
                  null,
                  {
                    name: 'parent_details.mother_details.area',
                    input_type: 'externalParents'
                  }
                )
              }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid> */}
        <Grid item xs={12} md={4}>
          <TextField
            label='Pincode'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.pin_code']}
            onChange={e => {
              handlePincodeChange('parent_details.mother_details.pin_code', e.target.value)
              handleChange(
                'parent_details.mother_details.pin_code',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'This field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'mobile_no',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'regex',
                    validation: getFieldCondition('mother') ? true : false,
                    error_message: 'Invalid Pincode',
                    regexFormat: '^\\d{6}$'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.pin_code',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.pin_code'] ? true : false }}
            error={Boolean(formData?.error?.['parent_details.mother_details.pin_code'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.pin_code']) &&
              formData?.error?.['parent_details.mother_details.pin_code']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Country'
            disabled
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.country.value']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.country',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.country',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.country.value'] ? true : false }}
            //required={getFieldCondition('mother')}
            error={Boolean(formData?.error?.['parent_details.mother_details.country'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.country']) &&
              formData?.error?.['parent_details.mother_details.country']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='State'
            disabled
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.state.value']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.state',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.state',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.state.value'] ? true : false }}
            //required={getFieldCondition('mother')}
            error={Boolean(formData?.error?.['parent_details.mother_details.state'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.state']) &&
              formData?.error?.['parent_details.mother_details.state']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='City'
            disabled
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.city.value']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.city',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.city',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.city.value'] ? true : false }}
            //required={getFieldCondition('mother')}
            error={Boolean(formData?.error?.['parent_details.mother_details.city'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.city']) &&
              formData?.error?.['parent_details.mother_details.city']
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          {/* <TextField
            label='Mobile Number'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.mobile']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.mobile',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('mother') ? true : false,
                    error_message: 'Field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: false,
                    error_message: 'Please enter valid email'
                  },
                  {
                    type: 'mobile_no',
                    validation: true,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.mobile',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.mobile'] ? true : false }}
            required={getFieldCondition('mother')}
            error={Boolean(formData?.error?.['parent_details.mother_details.mobile'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.state']) &&
              formData?.error?.['parent_details.mother_details.mobile']
            }
          /> */}
           <PhoneNumberField
            setFormData={setFormData}
            required={ getFieldCondition('mother') ? true : false}
            formData={formData}
            label='Mobile Number'
            onChange={handleChange}
            countryCodeVal={formData[`${'parent_details.mother_details.mobile'?.replace(/\.[^.]+$/, ".country_code")}`]}
            value={formData['parent_details.mother_details.mobile']}
             error={Boolean(formData?.error?.['parent_details.mother_details.mobile'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.mobile']) &&
              formData?.error?.['parent_details.mother_details.mobile']
            }
            item={{
              input_field_name:'parent_details.mother_details.mobile',
              validations: [
                {
                  type: 'is_required',
                  validation: getFieldCondition('mother') ? true : false,
                  error_message: 'Field is required'
                },
                {
                  type: 'numeric',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'alphanumeric',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'email',
                  validation: false,
                  error_message: 'Please enter valid email'
                },
                {
                  type: 'mobile_no',
                  validation: true,
                  error_message: "Value must be a proper mobile number"
                },
                {
                  type: 'range',
                  validation: false,
                  error_message: '',
                  min: 0,
                  max: 0
                },
                {
                  type: 'is_repeatable',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'is_group_repeatable',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'is_hidden',
                  validation: false,
                  error_message: ''
                }
              ]
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
        <TextField
            label='Email ID'
            type='email'
            fullWidth
            variant='outlined'
            value={formData['parent_details.mother_details.email']}
            onChange={e => {
              handleChange(
                'parent_details.mother_details.email',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('mother') ? true : false,
                    error_message: 'Field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: true,
                    error_message: 'Please enter valid email'
                  },
                  {
                    type: 'mobile_no',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.mother_details.email',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.mother_details.email'] ? true : false }}
            required={getFieldCondition('mother')}
            error={Boolean(formData?.error?.['parent_details.mother_details.email'])}
            helperText={
              Boolean(formData?.error?.['parent_details.mother_details.email']) &&
              formData?.error?.['parent_details.mother_details.email']
            }
          />
        </Grid>
      </Grid>
      <Grid item container xs={12} spacing={5} sx={{ mt: '15px' }}>
        <Grid item xs={12} md={12}>
          <Typography variant='h6' color={'text.primary'} sx={{ lineHeight: '22px' }}>
            Guardian Details
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='First Name'
            fullWidth
            variant='outlined'
            value={formData['parent_details.guardian_details.first_name']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.first_name',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('guardian') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.first_name',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.first_name'] ? true : false }}
            required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.first_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.first_name']) &&
              formData?.error?.['parent_details.guardian_details.first_name']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Last Name'
            fullWidth
            variant='outlined'
            value={formData['parent_details.guardian_details.last_name']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.last_name',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('guardian') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.last_name',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.last_name'] ? true : false }}
            required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.last_name'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.last_name']) &&
              formData?.error?.['parent_details.guardian_details.last_name']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Email ID'
            type='email'
            fullWidth
            variant='outlined'
            value={formData['parent_details.guardian_details.email']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.email',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('guardian') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.email',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.email'] ? true : false }}
            required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.email'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.email']) &&
              formData?.error?.['parent_details.guardian_details.email']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          {/* <TextField
            label='Mobile Number'
            fullWidth
            variant='outlined'
            id={'parent_details.guardian_details.mobile'}
            value={formData['parent_details.guardian_details.mobile']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.mobile',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('guardian') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.mobile',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.mobile'] ? true : false }}
            required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.mobile'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.mobile']) &&
              formData?.error?.['parent_details.guardian_details.mobile']
            }
          /> */}
           <PhoneNumberField
            setFormData={setFormData}
            required={ getFieldCondition('guardian') ? true : false}
            formData={formData}
            label='Mobile Number'
            onChange={handleChange}
            countryCodeVal={formData[`${'parent_details.guardian_details.mobile'?.replace(/\.[^.]+$/, ".country_code")}`]}
            value={formData['parent_details.guardian_details.mobile']}
             error={Boolean(formData?.error?.['parent_details.guardian_details.mobile'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.mobile']) &&
              formData?.error?.['parent_details.guardian_details.mobile']
            }
            item={{
              input_field_name:'parent_details.guardian_details.mobile',
              validations: [
                {
                  type: 'is_required',
                  validation: getFieldCondition('guardian') ? true : false,
                  error_message: 'Field is required'
                },
                {
                  type: 'numeric',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'alphanumeric',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'email',
                  validation: false,
                  error_message: 'Please enter valid email'
                },
                {
                  type: 'mobile_no',
                  validation: true,
                  error_message: "Value must be a proper mobile number"
                },
                {
                  type: 'range',
                  validation: false,
                  error_message: '',
                  min: 0,
                  max: 0
                },
                {
                  type: 'is_repeatable',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'is_group_repeatable',
                  validation: false,
                  error_message: ''
                },
                {
                  type: 'is_hidden',
                  validation: false,
                  error_message: ''
                }
              ]
            }}
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'relationship_with_child'}
            label='Relationship With Child'
            value={formData['parent_details.guardian_details.relationship_with_child.id']}
            onChange={(value: any) => {
              //handleOptionChange('academic_year', value)
              handleChange(
                'parent_details.mother_details.relationship_with_child',
                value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('guardian') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'relationship_with_child',
                  msterOptions: cityOptions,
                  key: ['relationship_with_child'],
                  type: 'enquiryDetails'
                }
              )
            }}
            options={dropdownData?.relationships}
            //loading={loading}
            getOptionLabel={(option: any) => option?.name || ''}
            required={getFieldCondition('guardian')}
            //infoDialog={infoDialog}
            note={'Relationship With Child'}
            error={Boolean(formData?.error?.['parent_details.guardian_details.relationship_with_child'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.relationship_with_child']) &&
              formData?.error?.['parent_details.guardian_details.relationship_with_child']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='House'
            fullWidth
            variant='outlined'
            id={'parent_details.guardian_details.house'}
            value={formData['parent_details.guardian_details.house']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.house',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('guardian') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.house',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.house'] ? true : false }}
            required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.house'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.house']) &&
              formData?.error?.['parent_details.guardian_details.house']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Street'
            fullWidth
            variant='outlined'
            id={'parent_details.guardian_details.street'}
            value={formData['parent_details.guardian_details.street']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.street',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('guardian') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.street',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.street'] ? true : false }}
            required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.street'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.street']) &&
              formData?.error?.['parent_details.guardian_details.street']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Landmark'
            fullWidth
            variant='outlined'
            id={'parent_details.guardian_details.landmark'}
            value={formData['parent_details.guardian_details.landmark']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.landmark',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: getFieldCondition('guardian') ? true : false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.landmark',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.landmark'] ? true : false }}
            required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.landmark'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.landmark']) &&
              formData?.error?.['parent_details.guardian_details.landmark']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Aadhar Number'
            fullWidth
            variant='outlined'
            id={'parent_details.guardian_details.aadhar'}
            value={formData['parent_details.guardian_details.aadhar']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.aadhar',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.aadhar',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.aadhar'] ? true : false }}
            error={Boolean(formData?.error?.['parent_details.guardian_details.aadhar'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.aadhar']) &&
              formData?.error?.['parent_details.guardian_details.aadhar']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='PAN Number'
            fullWidth
            variant='outlined'
            id={'parent_details.guardian_details.pan'}
            value={formData['parent_details.guardian_details.pan']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.pan',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.pan',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.pan'] ? true : false }}
            error={Boolean(formData?.error?.['parent_details.guardian_details.pan'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.pan']) &&
              formData?.error?.['parent_details.guardian_details.pan']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Guardian Details - Pincode'
            fullWidth
            variant='outlined'
            id={'parent_details.guardian_details.pin_code'}
            value={formData['parent_details.guardian_details.pin_code']}
            onChange={e => {
              handlePincodeChange('parent_details.guardian_details.pin_code', e.target.value)
              handleChange(
                'parent_details.guardian_details.pin_code',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'This field is required'
                  },
                  {
                    type: 'numeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'alphanumeric',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'email',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'mobile_no',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'range',
                    validation: false,
                    error_message: '',
                    min: 0,
                    max: 0
                  },
                  {
                    type: 'is_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_group_repeatable',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'is_hidden',
                    validation: false,
                    error_message: ''
                  },
                  {
                    type: 'regex',
                    validation: getFieldCondition('guardian') ? true : false,
                    error_message: 'Invalid Pincode',
                    regexFormat: '^\\d{6}$'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.pin_code',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.pin_code'] ? true : false }}
            //required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.pin_code'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.pin_code']) &&
              formData?.error?.['parent_details.guardian_details.pin_code']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='Country'
            disabled
            fullWidth
            variant='outlined'
            value={formData['parent_details.guardian_details.country.value']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.country',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.country',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.country.value'] ? true : false }}
            //required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.country'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.country']) &&
              formData?.error?.['parent_details.guardian_details.country']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='State'
            disabled
            fullWidth
            variant='outlined'
            value={formData['parent_details.guardian_details.state.value']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.state',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.state',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.state.value'] ? true : false }}
            //required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.state'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.state']) &&
              formData?.error?.['parent_details.guardian_details.state']
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label='City'
            disabled
            fullWidth
            variant='outlined'
            value={formData['parent_details.guardian_details.city.value']}
            onChange={e => {
              handleChange(
                'parent_details.guardian_details.city',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: false,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'parent_details.guardian_details.city',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{ shrink: formData['parent_details.guardian_details.city.value'] ? true : false }}
            //required={getFieldCondition('guardian')}
            error={Boolean(formData?.error?.['parent_details.guardian_details.city'])}
            helperText={
              Boolean(formData?.error?.['parent_details.guardian_details.city']) &&
              formData?.error?.['parent_details.guardian_details.city']
            }
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <RadioGroup
            row
            name='guardianType'
            defaultValue='Not Applicable'
            // value={formData['parent_details.guardian_details.guardian_type']}
            // onChange={e => {
            //   handleParentFieldChange('parent_details.guardian_details.guardian_type', e.target.value, [])

            // }}
            value={formData['parent_details.guardian_details.guardian_type'] || 'Custodian Guardian'}
            onChange={e => {
              handleParentFieldChange('parent_details.guardian_details.guardian_type', e.target.value, [])
            }}
          >
            <FormControlLabel value='Custodian Guardian' control={<Radio />} label='Custodian Guardian' />
            <FormControlLabel value='Legal Guardian' control={<Radio />} label='Legal Guardian' />
            <FormControlLabel value='Not Applicable' control={<Radio />} label='Not Applicable' />
          </RadioGroup>
        </Grid>
      </Grid>
    </>
  )
}
