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
  Tooltip
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
import { usePathname } from 'next/navigation'

interface AutocompleteProps {
  label?: any
  value?: any
  onChange?: any
  options?: any
  loading?: any
  getOptionLabel?: any
}

const academicYearApiUrl =
  '/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1&sort[0]=id:asc'
const apiUrl = '/api/ac-schools/search-school'

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
  id
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
          required
        />
      )}
      popupIcon={<DownArrow />}
    />
  )
}

export default function KidsClubEnquiryDetails({
  validationArray,
  handleChange,
  formData,
  infoDialog,
  academicYear,
  activeStageName
}: any) {
  const [academicYearOptions, setAcademicYearOptions] = useState<any>([])
  const [optionData, setOptionData] = useState<any>([])
  const [schoolOptions, setSchoolOptions] = useState<any>([])
  const [year, setYear] = useState<any>('')
  const [defaultSchool, setDefaultSchool] = useState<any>('')

  const { setGlobalState } = useGlobalContext()
  const pathname = usePathname()

  const setOptionsFromResponse = (response: any, keyMappings: any) => {
    if (!Array.isArray(response)) {
      console.error('Response should be an array')

      return []
    }

    const uniqueItems = response.reduce((acc, item) => {
      const key = `${item[keyMappings.id]}-${item[keyMappings.name]}`
      if (!acc.some((existingItem: any) => existingItem.key === key)) {
        acc.push({
          id: item[keyMappings.id],
          name: item[keyMappings.name],
          value: item[keyMappings.id],
          school_code: item[keyMappings.school_code],
          key // Ensure uniqueness for internal purposes
        })
      }

      return acc
    }, [])

    return uniqueItems
  }

  function filterData(data: any) {
    return data.filter(
      (item: any) => item.attributes.short_name_two_digit !== '24' && item.attributes.short_name_two_digit !== '25'
    )
  }

  const fetchAcademicYears = async () => {
    try {
      // setLoading(true);
      const params = {
        url: academicYearApiUrl,
        serviceURL: 'mdm'
      }
      const response = await getRequest(params)
      const newData = filterData(response.data)
      const formattedData = newData.map((item: any) => ({
        id: item.id,
        name: item.attributes.name,
        value: item.id,
        short_name_two_digit: item.attributes?.short_name_two_digit
      }))
      setAcademicYearOptions(formattedData)
      const currentYear = getCurrentYearObject(response?.data)
      if (currentYear && currentYear?.length) {
        setYear(currentYear[0]?.id)
        // const yearShort = getObjectByKeyVal(formattedData, 'id', currentYear[0]?.id)?.short_name_two_digit
        // fetchOptions(`academic_year_id = ${yearShort}`, setSchoolOptions, {
        //   id: "school_id",
        //   name: "name",
        // });
      }
    } catch (error) {
      console.error('Error fetching academic years:', error)
    } finally {
      // setLoading(false);
    }
  }

  const fetchOptions = async (operator: any, setOptions?: any, optionSet?: any) => {
    try {
      setGlobalState({ isLoading: true })
      const params = {
        url: apiUrl,
        serviceURL: 'mdm',
        data: { operator }
      }
      if (!operator?.includes('undefined')) {
        const response = await postRequest(params)
        const opData = setOptionsFromResponse(response?.data?.schools, optionSet)
        if (optionSet?.id == 'grade_id') {
          const sortedData = opData.sort((a: any, b: any) => a.id - b.id)
          setOptions(sortedData)
        } else {
          setOptions(opData)
        }
        // if(optionSet?.id == 'school_id'){
        //   const userInfo = getUserInfo()
        //   const op = setOptionsFromResponse(response?.data?.schools, optionSet)
        //   const school = getObjectByKeyVal(op,'school_code','1817')
        //  debugger
        //   if(school){
        //       setDefaultSchool(school?.id)
        //   }
        // }
        if (response?.success) {
          setOptionData(response?.data?.schools)
          // if (name == 'academic_year') {
          // const data = setOptionsFromResponse(response?.data?.schools, {
          //   id: "school_id",
          //   name: "name",
          // })
          //   setSchoolOptions(data)
          // }

          return response?.data?.schools
        } else {
          return []
        }
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  useEffect(() => {
    fetchAcademicYears()
  }, [])

  useEffect(() => {
    if (academicYear && academicYearOptions) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(`academic_year_id = ${yearShort}`, setSchoolOptions, {
        id: 'school_id',
        name: 'name'
      })
      // setSchool(null);
      // setBrand(null);
      // setBoard(null);
      // setGrade(null);
      // setShift(null);
      // setCourse(null);
    }
  }, [academicYear, academicYearOptions])


  return (
    <>
      {activeStageName == ENQUIRY_STAGES?.REGISTRATION ? (
        <Grid item xs={12} md={4}>
          <TextField
            value={formData?.['enquiry_number']}
            fullWidth
            disabled
            label={
              <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                Enquiry Number
                {infoDialog && 'Enquiry Number' && (
                  <span>
                    <Tooltip title={'Enquiry Number'}>
                      <InfoIcon style={{ color: '#a3a3a3' }} />
                    </Tooltip>
                  </span>
                )}
              </Box>
            }
            InputLabelProps={{
              shrink: true // Ensures the label does not overlap the value
            }}
          />
        </Grid>
      ) : null}

      <Grid item xs={12} md={4}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            className={formData?.error?.['enquiry_date'] ? 'field-error' : ''}
            sx={{ width: '100%' }}
            // label={item?.['input_label']}
            label={
              <>
                <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                  Enquiry Date
                  <span style={{ color: 'red' }}> *</span>
                  {/* {infoDialog && item?.['input_note'] && (
                  <>
                    <span>
                      <Tooltip title={item?.['input_note']}>
                        <InfoIcon style={{ color: '#a3a3a3' }} />
                      </Tooltip>
                    </span>
                  </>
                )} */}
                </Box>
              </>
            }
            name={'enquiry_date'}
            value={formData?.['enquiry_date'] ? dayjs(formData?.['enquiry_date']) : dayjs()}
            format='DD-MM-YYYY'
            // slots={{
            //   openPickerIcon: CalendarIcon
            // }}
            //minDate={item?.validations?.[11]?.validation ? dayjs() : undefined}

            disabled={true}
            slots={{
              openPickerIcon: CalendarIcon
              // textField: params => (
              //   <TextField
              //     {...params}
              //     required
              //     error={formData?.error?.[item?.['input_field_name']]}
              //     helperText={formData?.error?.[item?.['input_field_name']]}
              //   />
              // )
            }}
          ></DatePicker>
        </LocalizationProvider>
        {formData?.error?.['enquiry_date'] && (
          <span className={style.errorField}>{formData?.error?.['enquiry_date']}</span>
        )}
      </Grid>

      {activeStageName == ENQUIRY_STAGES?.REGISTRATION ? (
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            value={formData?.['enquiry_type']}
            disabled
            label={
              <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                Enquiry Type
                {infoDialog && 'Enquiry Type' && (
                  <span>
                    <Tooltip title={'Enquiry Type'}>
                      <InfoIcon style={{ color: '#a3a3a3' }} />
                    </Tooltip>
                  </span>
                )}
              </Box>
            }
            InputLabelProps={{
              shrink: true // Ensures the label does not overlap the value
            }}
          />
        </Grid>
      ) : null}
      <Grid item xs={12} md={4}>
        <CommonAutocomplete
          id={'academic_year'}
          label='Academic Year'
          value={formData['academic_year.id']}
          onChange={(value: any) => {
            //handleOptionChange('academic_year', value)
            handleChange('academic_year', value, validationArray, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'academic_year',
              msterOptions: academicYearOptions,
              key: ['academic_year'],
              type: 'enquiryDetails'
            })
          }}
          options={academicYearOptions}
          //loading={loading}
          getOptionLabel={(option: any) => option?.name || ''}
          error={Boolean(formData?.error?.['academic_year'])}
          infoDialog={infoDialog}
          note={'Academic Year'}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CommonAutocomplete
          id={'school_location'}
          label='School Location'
          value={formData['school_location.id'] || defaultSchool}
          onChange={(value: any) => {
            //handleOptionChange('school_location', value)
            handleChange('school_location', value, validationArray, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'school_location',
              msterOptions: schoolOptions,
              key: ['school_location'],
              type: 'enquiryDetails'
            })
          }}
          options={schoolOptions}
          //loading={loading}
          getOptionLabel={(option: any) => option?.name || ''}
          error={Boolean(formData?.error?.['school_location'])}
          infoDialog={infoDialog}
          note={'School Location'}
        />
      </Grid>
      
    </>
  )
}
