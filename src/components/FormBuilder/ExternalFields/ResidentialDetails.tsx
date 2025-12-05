'use client'

import { FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { getRequest } from 'src/services/apiService'
import { ENQUIRY_STAGES } from 'src/utils/constants'
import toast from 'react-hot-toast'

export default function ResidentislDetails({
  formData,
  setFormData,
  handleChange,
  handleParentFieldChange,
  activeStageName
}: any) {
  const getDataFromPin = async (pincode: any) => {
    const params = {
      url: `/api/co-pincodes?filters[Pincode]=${pincode}&populate[0]=District_Or_City&populate[District_Or_City][populate]=State&populate[State][populate]=country`,
      serviceURL: 'mdm'
    }

    return await getRequest(params)
  }

  const handlePincodeChange = async (fieldName: any, value: any) => {
    // Allow typing but validate format
    const isValidFormat = /^\d*$/.test(value) // Only allow digits
    
    if (!isValidFormat) {
      toast.error('Only numeric values allowed')

      return
    }

    // Don't proceed with API call if less than 6 digits
    if (value.length < 6) {
      // Clear errors if user is still typing
      setFormData((prevState: any) => ({
        ...prevState,
        error: {
          ...prevState.error,
          [fieldName]: null
        }
      }))
      
      return
    }

    // Only call API and validate if exactly 6 digits
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      try {
        const params = {
          url: `/api/co-pincodes?filters[Pincode]=${value}&populate[0]=District_Or_City&populate[District_Or_City][populate]=State&populate[State][populate]=country`,
          serviceURL: 'mdm'
        }

        const res = await getRequest(params)
        
        if (res && res?.data?.length) {
          setFormData((prevState: any) => ({
            ...prevState,
            [`${fieldName.replace('pin_code', 'country')}.id`]:
              res.data[0].attributes.State?.data?.attributes?.country?.data?.id,
            [`${fieldName.replace('pin_code', 'country')}.value`]:
              res.data[0].attributes.State?.data?.attributes?.country?.data?.attributes?.name,
            [`${fieldName.replace('pin_code', 'state')}.id`]: res.data[0].attributes.State?.data?.id,
            [`${fieldName.replace('pin_code', 'state')}.value`]:
              res.data[0].attributes.State?.data?.attributes?.name,
            [`${fieldName.replace('pin_code', 'city')}.id`]:
              res.data[0].attributes.District_Or_City?.data?.id,
            [`${fieldName.replace('pin_code', 'city')}.value`]:
              res.data[0].attributes.District_Or_City?.data?.attributes?.name,
            error: {
              ...prevState.error,
              [fieldName]: null
            }
          }))
        } else {
          toast.error('Invalid pincode. Please enter a valid pincode.')
          setFormData((prevState: any) => ({
            ...prevState,
            [`${fieldName.replace('pin_code', 'country')}.id`]: null,
            [`${fieldName.replace('pin_code', 'country')}.value`]: null,
            [`${fieldName.replace('pin_code', 'state')}.id`]: null,
            [`${fieldName.replace('pin_code', 'state')}.value`]: null,
            [`${fieldName.replace('pin_code', 'city')}.id`]: null,
            [`${fieldName.replace('pin_code', 'city')}.value`]: null,
            error: {
              ...prevState.error,
              [fieldName]: 'Invalid pincode. Please enter a valid pincode.'
            }
          }))
        }
      } catch (error) {
        console.error('Error fetching pincode data:', error)
        toast.error('Error validating pincode. Please try again.')
        setFormData((prevState: any) => ({
          ...prevState,
          error: {
            ...prevState.error,
            [fieldName]: 'Error validating pincode. Please try again.'
          }
        }))
      }
    } else if (value.length > 6) {
      // Prevent input if more than 6 digits
      toast.error('Pincode must be exactly 6 digits')
    }
  }

  return (
    <>
      {/* CURRENT ADDRESS */}
      <Grid item container xs={12} spacing={5} sx={{ mt: '15px' }}>
        <Grid item xs={12}>
          <Typography variant='h6' color={'text.primary'} sx={{ lineHeight: '22px' }}>
            Residential Details
          </Typography>
        </Grid>

        {/* HOUSE */}
        <Grid item xs={12} md={4}>
          <TextField
            label='Current Address - House'
            fullWidth
            variant='outlined'
            value={formData['residential_details.current_address.house']}
            onChange={e =>
              handleChange(
                'residential_details.current_address.house',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'residential_details.current_address.house',
                  input_type: 'externalParents'
                }
              )
            }
            InputLabelProps={{
              shrink: formData['residential_details.current_address.house'] ? true : false
            }}
            required={activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true}
            error={Boolean(formData?.error?.['residential_details.current_address.house'])}
            helperText={
              formData?.error?.['residential_details.current_address.house'] &&
              formData?.error?.['residential_details.current_address.house']
            }
          />
        </Grid>

        {/* STREET */}
        <Grid item xs={12} md={4}>
          <TextField
            label='Current Address - Street'
            fullWidth
            variant='outlined'
            value={formData['residential_details.current_address.street']}
            onChange={e =>
              handleChange(
                'residential_details.current_address.street',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'residential_details.current_address.street',
                  input_type: 'externalParents'
                }
              )
            }
            InputLabelProps={{
              shrink: formData['residential_details.current_address.street'] ? true : false
            }}
            required={activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true}
            error={Boolean(formData?.error?.['residential_details.current_address.street'])}
            helperText={
              formData?.error?.['residential_details.current_address.street'] &&
              formData?.error?.['residential_details.current_address.street']
            }
          />
        </Grid>

        {/* LANDMARK */}
        <Grid item xs={12} md={4}>
          <TextField
            label='Current Address - Landmark'
            fullWidth
            variant='outlined'
            value={formData['residential_details.current_address.landmark']}
            onChange={e =>
              handleChange(
                'residential_details.current_address.landmark',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true,
                    error_message: 'Field is required'
                  }
                ],
                false,
                null,
                {
                  name: 'residential_details.current_address.landmark',
                  input_type: 'externalParents'
                }
              )
            }
            InputLabelProps={{
              shrink: formData['residential_details.current_address.landmark'] ? true : false
            }}
            required={activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true}
            error={Boolean(formData?.error?.['residential_details.current_address.landmark'])}
            helperText={
              formData?.error?.['residential_details.current_address.landmark'] &&
              formData?.error?.['residential_details.current_address.landmark']
            }
          />
        </Grid>

        {/* PINCODE */}
        <Grid item xs={12} md={4}>
          <TextField
            label='Current Address - Pincode'
            fullWidth
            variant='outlined'
            value={formData['residential_details.current_address.pin_code']}
            onChange={e => {
              handlePincodeChange('residential_details.current_address.pin_code', e.target.value)
              handleChange(
                'residential_details.current_address.pin_code',
                e.target.value,
                [
                  {
                    type: 'is_required',
                    validation: activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true,
                    error_message: 'This field is required'
                  },
                  { type: 'regex', validation: true, error_message: 'Invalid Pincode', regexFormat: '^\\d{6}$' }
                ],
                false,
                null,
                {
                  name: 'residential_details.current_address.pin_code',
                  input_type: 'externalParents'
                }
              )
            }}
            InputLabelProps={{
              shrink: formData['residential_details.current_address.pin_code'] ? true : false
            }}
            required={activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true}
            error={Boolean(formData?.error?.['residential_details.current_address.pin_code'])}
            helperText={
              formData?.error?.['residential_details.current_address.pin_code'] &&
              formData?.error?.['residential_details.current_address.pin_code']
            }
          />
        </Grid>

        {/* COUNTRY */}
        <Grid item xs={12} md={4}>
          <TextField
            label='Country'
            disabled
            fullWidth
            variant='outlined'
            value={formData['residential_details.current_address.country.value']}
            InputLabelProps={{
              shrink: formData['residential_details.current_address.country.value'] ? true : false
            }}
          />
        </Grid>

        {/* STATE */}
        <Grid item xs={12} md={4}>
          <TextField
            label='State'
            disabled
            fullWidth
            variant='outlined'
            value={formData['residential_details.current_address.state.value']}
            InputLabelProps={{
              shrink: formData['residential_details.current_address.state.value'] ? true : false
            }}
          />
        </Grid>

        {/* CITY */}
        <Grid item xs={12} md={4}>
          <TextField
            label='City'
            disabled
            fullWidth
            variant='outlined'
            value={formData['residential_details.current_address.city.value']}
            InputLabelProps={{
              shrink: formData['residential_details.current_address.city.value'] ? true : false
            }}
          />
        </Grid>

        {/* SELECT — Is Permanent Address Same */}
        <Grid item xs={12}>
          <FormControl sx={{ width: '33%' }} variant='outlined'>
            <InputLabel id='parent-type-label'>Is Permanent Address</InputLabel>
            <Select
              name='residential_details.is_permanent_address'
              labelId='parent-type-label'
              value={formData['residential_details.is_permanent_address'] || 'no'}
              onChange={e =>
                handleParentFieldChange('residential_details.is_permanent_address', e.target.value, [])
              }
              label='Is Permanent Address'
            >
              <MenuItem value='yes'>Yes</MenuItem>
              <MenuItem value='no'>No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* PERMANENT ADDRESS SECTION */}
      {formData['residential_details.is_permanent_address'] == 'no' && (
        <Grid item container xs={12} spacing={5} sx={{ mt: '15px' }}>
          <Grid item xs={12} md={4}>
            <TextField
              label='Permanent Address - House'
              fullWidth
              variant='outlined'
              value={formData['residential_details.permanent_address.house']}
              onChange={e =>
                handleChange(
                  'residential_details.permanent_address.house',
                  e.target.value,
                  [
                    {
                      type: 'is_required',
                      validation: activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true,
                      error_message: 'Field is required'
                    }
                  ],
                  false,
                  null,
                  {
                    name: 'residential_details.permanent_address.house',
                    input_type: 'externalParents'
                  }
                )
              }
              InputLabelProps={{
                shrink: formData['residential_details.permanent_address.house'] ? true : false
              }}
              required={activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true}
              error={Boolean(formData?.error?.['residential_details.permanent_address.house'])}
              helperText={
                formData?.error?.['residential_details.permanent_address.house'] &&
                formData?.error?.['residential_details.permanent_address.house']
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label='Permanent Address - Street'
              fullWidth
              variant='outlined'
              value={formData['residential_details.permanent_address.street']}
              onChange={e =>
                handleChange(
                  'residential_details.permanent_address.street',
                  e.target.value,
                  [
                    {
                      type: 'is_required',
                      validation: activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true,
                      error_message: 'Field is required'
                    }
                  ],
                  false,
                  null,
                  {
                    name: 'residential_details.permanent_address.street',
                    input_type: 'externalParents'
                  }
                )
              }
              InputLabelProps={{
                shrink: formData['residential_details.permanent_address.street'] ? true : false
              }}
              required={activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true}
              error={Boolean(formData?.error?.['residential_details.permanent_address.street'])}
              helperText={
                formData?.error?.['residential_details.permanent_address.street'] &&
                formData?.error?.['residential_details.permanent_address.street']
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label='Permanent Address - Landmark'
              fullWidth
              variant='outlined'
              value={formData['residential_details.permanent_address.landmark']}
              onChange={e =>
                handleChange(
                  'residential_details.permanent_address.landmark',
                  e.target.value,
                  [
                    {
                      type: 'is_required',
                      validation: activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true,
                      error_message: 'Field is required'
                    }
                  ],
                  false,
                  null,
                  {
                    name: 'residential_details.permanent_address.landmark',
                    input_type: 'externalParents'
                  }
                )
              }
              InputLabelProps={{
                shrink: formData['residential_details.permanent_address.landmark'] ? true : false
              }}
              required={activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true}
              error={Boolean(formData?.error?.['residential_details.permanent_address.landmark'])}
              helperText={
                formData?.error?.['residential_details.permanent_address.landmark'] &&
                formData?.error?.['residential_details.permanent_address.landmark']
              }
            />
          </Grid>

          {/* Permanent PINCODE */}
          <Grid item xs={12} md={4}>
            <TextField
              label='Permanent Address - Pincode'
              fullWidth
              variant='outlined'
              value={formData['residential_details.permanent_address.pin_code']}
              onChange={e => {
                handlePincodeChange('residential_details.permanent_address.pin_code', e.target.value)
                handleChange(
                  'residential_details.permanent_address.pin_code',
                  e.target.value,
                  [
                    {
                      type: 'is_required',
                      validation: activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true,
                      error_message: 'This field is required'
                    },
                    { type: 'regex', validation: true, error_message: 'Invalid Pincode', regexFormat: '^\\d{6}$' }
                  ],
                  false,
                  null,
                  {
                    name: 'residential_details.permanent_address.pin_code',
                    input_type: 'externalParents'
                  }
                )
              }}
              InputLabelProps={{
                shrink: formData['residential_details.permanent_address.pin_code'] ? true : false
              }}
              required={activeStageName == ENQUIRY_STAGES.ENQUIRY ? false : true}
              error={Boolean(formData?.error?.['residential_details.permanent_address.pin_code'])}
              helperText={
                formData?.error?.['residential_details.permanent_address.pin_code'] &&
                formData?.error?.['residential_details.permanent_address.pin_code']
              }
            />
          </Grid>

          {/* Permanent COUNTRY */}
          <Grid item xs={12} md={4}>
            <TextField
              label='Country'
              disabled
              fullWidth
              variant='outlined'
              value={formData['residential_details.permanent_address.country.value']}
              InputLabelProps={{
                shrink: formData['residential_details.permanent_address.country.value'] ? true : false
              }}
            />
          </Grid>

          {/* Permanent STATE */}
          <Grid item xs={12} md={4}>
            <TextField
              label='State'
              disabled
              fullWidth
              variant='outlined'
              value={formData['residential_details.permanent_address.state.value']}
              InputLabelProps={{
                shrink: formData['residential_details.permanent_address.state.value'] ? true : false
              }}
            />
          </Grid>

          {/* Permanent CITY */}
          <Grid item xs={12} md={4}>
            <TextField
              label='City'
              disabled
              fullWidth
              variant='outlined'
              value={formData['residential_details.permanent_address.city.value']}
              InputLabelProps={{
                shrink: formData['residential_details.permanent_address.city.value'] ? true : false
              }}
            />
          </Grid>
        </Grid>
      )}
    </>
  )
}