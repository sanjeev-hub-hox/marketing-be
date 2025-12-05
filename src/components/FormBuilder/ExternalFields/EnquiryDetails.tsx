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
  useMediaQuery,
  useTheme
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

let academicYearApiUrl =
  '/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1&filters[id][$notIn][0]=1&filters[id][$notIn][1]=2&sort[0]=id:asc'
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

export default function EnquiryDetails({
  validationArray,
  handleChange,
  formData,
  infoDialog,
  academicYear,
  schoolLocation,
  brand,
  board,
  grade,
  shift,
  course,
  stream,
  activeStageName,
  setFormData,
  isIVT,
  ivtType, // slug = 'ivtEnquiry' || slug == 'reAdmission'
  isRegistration
}: any) {
  const [academicYearOptions, setAcademicYearOptions] = useState<any>([])
  const [ivtReasons, setIvtReasons] = useState<any>([])
  const [optionData, setOptionData] = useState<any>([])
  const [schoolOptions, setSchoolOptions] = useState<any>([])
  const [brandOptions, setBrandOptions] = useState<any>([])
  const [boardOptions, setBoardOptions] = useState<any>([])
  const [gradeOptions, setGradeOptions] = useState<any>([])
  const [shiftOptions, setShiftOptions] = useState<any>([])
  const [courseOptions, setCourseOptions] = useState<any>([])
  const [streamOptions, setStreamOptions] = useState<any>([])
  const [year, setYear] = useState<any>('')
  const [defaultSchool, setDefaultSchool] = useState<any>('')
  const [hostSchoolOptions, setHostSchoolOptions] = useState<any>([]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const { setGlobalState } = useGlobalContext()
  const pathname = usePathname()

  let dateLabel;
  let reasonLabel: any;
  let slugName: any;
  switch (ivtType) {
    case "ivtEnquiry":
      dateLabel = "IVT Date";
      reasonLabel = "IVT Reason";
      slugName = 'ivt_reasons';
      break;
    case "reAdmission":
      dateLabel = "Re-Admission Date";
      reasonLabel = "Re-Admission Reason";
      slugName = 'reAdmission';
      break;
    case "readmission_10_11":
      dateLabel = "10-11 Admission Date";
      reasonLabel = "10-11 Admission Reason";
      slugName = '10_11_readmission';
      academicYearApiUrl = '/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1&filters[id][$notIn][0]=1&filters[id][$notIn][1]=2&filters[id][$notIn][]=3'
      break;
    default:
      dateLabel = "Admission Date";
      reasonLabel = "Admission Reason";
      slugName = 'admission_reason';
      break;
  }

  const getivtReasons = async () => {
    const params = {
      url: `/api/co-reasons?filters[slug]=${encodeURIComponent(slugName)}`,
      serviceURL: 'mdm'
    }

    const response = await getRequest(params)
    if (response?.data) {
      const formattedData = response.data.map((item: any) => ({
        id: item.id,
        name: item.attributes.name,
        value: item.id,
      }))
      setIvtReasons(formattedData)
    }
  }


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

  const fetchAcademicYears = async () => {
    try {
      // setLoading(true);
      const params = {
        url: academicYearApiUrl,
        serviceURL: 'mdm'
      }
      const response = await getRequest(params)
      const formattedData = response.data.map((item: any) => ({
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
        if (opData?.length == 1) {
          setFormData((prevState: any) => {
            return {
              ...prevState,
              [`${optionSet?.key}.id`]: opData[0]?.id,
              [`${optionSet?.key}.value`]: opData[0]?.name
            }
          })
          setFormData((prevState:any)=>{
            return {
              ...prevState,
              error: {
                ...prevState.error,
                [`${optionSet?.key}`]: null
              }
            }
          })
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
    getivtReasons()
  }, [ivtType])

  useEffect(() => {
    if (academicYear && academicYearOptions) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(`academic_year_id = ${yearShort}`, setSchoolOptions, {
        id: 'school_id',
        name: 'name',
        key: 'school'
      })
      // setSchool(null);
      // setBrand(null);
      // setBoard(null);
      // setGrade(null);
      // setShift(null);
      // setCourse(null);
    }
  }, [academicYear, academicYearOptions])

  //grade_id

  useEffect(() => {
    if (academicYear && academicYearOptions) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit

      fetchOptions(`academic_year_id = ${yearShort} and school_id = ${schoolLocation}`, (options: any) => {
        // Filter for grade 11 only when ivtType is readmission_10_11
        if (ivtType === 'readmission_10_11') {
          const filteredOptions = options.filter((opt: any) => opt.id === 11 || opt.id === 22)
          setGradeOptions(filteredOptions)
        } else {
          setGradeOptions(options)
        }
      }, {
        id: 'grade_id',
        name: 'grade_name',
        key: 'grade'
      })
    }
  }, [academicYear, schoolLocation, academicYearOptions, ivtType])

  useEffect(() => {
    if (academicYear && academicYearOptions) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit

      fetchOptions(`academic_year_id = ${yearShort} and school_id = ${schoolLocation}  and grade_id=${grade}`, setBrandOptions, {
        id: 'brand_id',
        name: 'brand_name',
        key: 'brand'
      })

      // setBrand(null);
      // setBoard(null);
      // setGrade(null);
      // setShift(null);
    }
  }, [academicYear, schoolLocation, grade, academicYearOptions])

  useEffect(() => {
    if (academicYear && academicYearOptions) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation} and brand_id = ${brand}  and grade_id=${grade}`,
        setBoardOptions,
        {
          id: 'board_id',
          name: 'board_name',
          key: 'board'
        }
      )
      // setBoard(null);
      // setGrade(null);
      // setShift(null);
    }
  }, [academicYear, schoolLocation, brand, grade, academicYearOptions])

  useEffect(() => {
    if (academicYear && academicYearOptions) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation} and brand_id = ${brand} and board_id = ${board} and course_id = ${course}  and grade_id=${grade}`,
        setStreamOptions,
        {
          id: 'stream_id',
          name: 'stream_name',
          key: 'stream'
        }
      )

      // setGrade(null);
      // setShift(null);
    }
  }, [academicYear, schoolLocation, brand, board, course, grade, academicYearOptions])

  // useEffect(() => {
  //   if (academicYear && academicYearOptions) {
  //     const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
  //     fetchOptions(
  //       `academic_year_id = ${yearShort} and school_id = ${schoolLocation} and brand_id = ${brand} and board_id = ${board} and course_id = ${course} and stream_id=${stream}`,
  //       setGradeOptions,
  //       {
  //         id: 'grade_id',
  //         name: 'grade_name'
  //       }
  //     )
  //     // setGrade(null);
  //     // setShift(null);
  //   }
  // }, [academicYear, schoolLocation, brand, board, course, stream, academicYearOptions])

  useEffect(() => {

  const fetchHostSchools = async () => {
  if (academicYear && schoolLocation && grade && course && board && stream && academicYearOptions) {

    const selectedYear = academicYearOptions.find((opt : any) => opt.id === academicYear);
    const yearShort = selectedYear?.short_name_two_digit

     const response :any =  await postRequest({
            url: `/studentProfile/get-guest-school-list`,
            serviceURL: 'admin',
            data: {
              academic_year_id: Number(yearShort),
              school_id: schoolLocation,
              grade_id: grade,
              course_id: course,
              board_id: board,
              stream_id: stream
            }
          })
    
   if (response?.status && response?.data?.data.length > 0) {
      setFormData((prevState:any)=>{
        
        return {
          ...prevState,
          is_guest_student: true
        }
      })
        const mappedOptions = response.data.data.map((item: any) => ({
          id: item.host_school_id,
          name: item.host_school_name
        }));
        setHostSchoolOptions(mappedOptions);
        
        // Auto-select if only one option is available
        if (mappedOptions.length === 1) {
          setFormData((prevState:any)=>{
            
            return {
              ...prevState,
              'guest_student_details.location.id': mappedOptions[0].id,
              'guest_student_details.location.value': mappedOptions[0].name,
              error: {
                ...prevState.error,
                ['guest_student_details.location']: null // <-- clear error here
              }
            }
          })
        }
        
      } else {
        setFormData((prevState:any)=>{
          
          return {
            ...prevState,
            is_guest_student: false
          }
        })
        setHostSchoolOptions([]);
        // also clear selected host school value
        handleChange(
          'guest_student_details.location',
          null,
          validationArray,
          false,
          null,
          {
            input_type: 'masterDropdownExternal',
            name: 'guest_student_details.location',
            msterOptions: [],
            key: ['guest_student_details.location'],
            type: 'enquiryDetails'
          }
        );
      }
    } else {
      // ✅ Clear dropdown + reset selected host school when any dependency unselected
      setHostSchoolOptions([]);
      handleChange(
        'guest_student_details.location',
        null,
        validationArray,
        false,
        null,
        {
          input_type: 'masterDropdownExternal',
          name: 'guest_student_details.location',
          msterOptions: [],
          key: ['guest_student_details.location'],
          type: 'enquiryDetails'
        }
      );
  }};

  fetchHostSchools();   

}, [academicYear, schoolLocation, grade, course, board, stream, academicYearOptions]);

  useEffect(() => {
    if (academicYear && academicYearOptions) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation} and brand_id = ${brand} and board_id = ${board}  and course_id = ${course} and stream_id=${stream} and grade_id=${grade}`,
        setShiftOptions,
        {
          id: 'shift_id',
          name: 'shift_name',
          key: 'shift'
        }
      )
      // setShift(null);
    }
  }, [academicYear, schoolLocation, brand, board, course, stream, shift, grade, academicYearOptions])

  useEffect(() => {
    if (academicYear && academicYearOptions) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit

      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation} and brand_id = ${brand} and board_id = ${board} and grade_id=${grade}`,
        setCourseOptions,
        {
          id: 'course_id',
          name: 'course_name',
          key: 'course'
        }
      )
      // setCourse(null);

    }
  }, [academicYear, schoolLocation, brand, board, grade, academicYearOptions])

  // End Try Code

  return (
    <>
      {isIVT ? (
        <>
          <Grid item xs={4} md={4}>
            <TextField
              value={formData?.['student_details.enrolment_number'] || ''}
              fullWidth
              disabled={isRegistration}
              required
              error={Boolean(formData?.error?.['student_details.enrolment_number'])}
              helperText={formData?.error?.['student_details.enrolment_number']}
              onChange={event => {
                handleChange('student_details.enrolment_number', event?.target?.value, validationArray, false, null, {
                  name: 'student_details.enrolment_number',
                  key: ['student_details.enrolment_number'],
                  type: 'enquiryDetails'
                })
              }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                  Enrollment Number
                  {infoDialog && 'Enrollment Number' && (
                    <span>
                      <Tooltip title={'Enrollment Number'}>
                        <InfoIcon style={{ color: '#a3a3a3' }} />
                      </Tooltip>
                    </span>
                  )}
                </Box>
              }
            />
          </Grid>

          <Grid item xs={4} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                className={formData?.error?.['ivt_date'] ? 'field-error' : ''}
                sx={{ width: '100%' }}
                disabled={true} 
                label={
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      {dateLabel}
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
                name={'ivt_date'}
                //minDate={dayjs()}
                value={formData?.['ivt_date'] ? dayjs(formData?.['ivt_date']) : dayjs()}
                format='DD-MM-YYYY'
                // slots={{
                //   openPickerIcon: CalendarIcon
                // }}

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
                onChange={(event: any) => {
                  handleChange('ivt_date', event, validationArray, false, null, {
                    // input_type: 'checkBoxExternal',
                    name: 'ivt_date',
                    // msterOptions: academicYearOptions,
                    key: ['ivt_date'],
                    type: 'enquiryDetails'
                  })
                }}
              ></DatePicker>
            </LocalizationProvider>
            {formData?.error?.['ivt_date'] && <span className={style.errorField}>{formData?.error?.['ivt_date']}</span>}
          </Grid>

          <Grid item xs={4} md={4}>
            <CommonAutocomplete
              id={'ivt_reason'}
              label={reasonLabel}
              value={formData['ivt_reason.id']}
              onChange={(value: any) => {
                //handleOptionChange('academic_year', value)
                handleChange('ivt_reason', value, validationArray, false, null, {
                  input_type: 'masterDropdownExternal',
                  name: 'ivt_reason',
                  msterOptions: ivtReasons,
                  key: ['ivt_reason'],
                  type: 'enquiryDetails'
                })
              }}
              options={ivtReasons}
              //loading={loading}
              getOptionLabel={(option: any) => option?.name || ''}
              error={Boolean(formData?.error?.['ivt_reason'])}
              infoDialog={infoDialog}
              note={ivtType == 'ivtEnquiry' ? 'IVT Reason' : 'Re-Admission Reason'}
            />
          </Grid>
        </>
      ) : null}
      {activeStageName == ENQUIRY_STAGES?.REGISTRATION ? (
        <Grid item xs={4} md={4}>
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

      <Grid item xs={4} md={4}>
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
        <Grid item xs={4} md={4}>
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

      <Grid item xs={4} md={4}>
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

      <Grid item xs={4} md={4}>
        <CommonAutocomplete
          id={'school_location'}
          label='School Location'
          value={formData['school_location.id'] || defaultSchool}
          onChange={(value: any) => {
            handleChange('school_location', value, validationArray, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'school_location',
              msterOptions: schoolOptions,
              key: ['school_location'],
              type: 'enquiryDetails'
            })

            // Clear host school location error if they become different
            if (
              formData['guest_student_details.location.id'] &&
              value?.id !== formData['guest_student_details.location.id']
            ) {
              // Clear the error for host school location
              handleChange(
                'guest_student_details.location',
                formData['guest_student_details.location'],
                validationArray,
                false,
                null,
                {
                  input_type: 'masterDropdownExternal',
                  name: 'guest_student_details.location',
                  msterOptions: schoolOptions,
                  key: ['guest_student_details.location'],
                  type: 'enquiryDetails'
                }
              )
            }
          }}
          options={schoolOptions}
          getOptionLabel={(option: any) => option?.name || ''}
          error={Boolean(formData?.error?.['school_location'])}
          infoDialog={infoDialog}
          note={'School Location'}
        />
      </Grid>


      <Grid item xs={4} md={4}>
        <CommonAutocomplete
          id={'grade'}
          label='Grade'
          value={formData['student_details.grade.id']}
          onChange={(value: any) => {
            //handleOptionChange('grade', value)
            handleChange('student_details.grade', value, validationArray, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'student_details.grade',
              msterOptions: gradeOptions,
              key: ['student_details.grade'],
              type: 'enquiryDetails'
            })
          }}
          options={gradeOptions}
          //loading={loading}
          getOptionLabel={(option: any) => option?.name || ''}
          error={Boolean(formData?.error?.['student_details.grade'])}
          infoDialog={infoDialog}
          note={'Grade'}
        />
      </Grid>
      <Grid item xs={4} md={4}>
        <CommonAutocomplete
          id={'brand'}
          label='Brand'
          value={formData['brand.id']}
          onChange={(value: any) => {
            //handleOptionChange('brand', value)
            handleChange('brand', value, validationArray, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'brand',
              msterOptions: brandOptions,
              key: ['brand'],
              type: 'enquiryDetails'
            })
          }}
          options={brandOptions}
          //loading={loading}
          getOptionLabel={(option: any) => option?.name || ''}
          error={Boolean(formData?.error?.['brand'])}
          infoDialog={infoDialog}
          note={'Brand'}
        />
      </Grid>
      <Grid item xs={4} md={4}>
        <CommonAutocomplete
          id={'board'}
          label='Board'
          value={formData['board.id']}
          onChange={(value: any) => {
            //handleOptionChange('board', value)
            handleChange('board', value, validationArray, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'board',
              msterOptions: boardOptions,
              key: ['board'],
              type: 'enquiryDetails'
            })
          }}
          options={boardOptions}
          //loading={loading}
          getOptionLabel={(option: any) => option?.name || ''}
          error={Boolean(formData?.error?.['board'])}
          infoDialog={infoDialog}
          note={'Board'}
        />
      </Grid>
      <Grid item xs={4} md={4}>
        <CommonAutocomplete
          id={'course'}
          label='Course'
          value={formData['course.id']}
          onChange={(value: any) => {
            handleChange('course', value, validationArray, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'course',
              msterOptions: courseOptions,
              key: ['course'],
              type: 'enquiryDetails'
            })
          }}
          options={courseOptions}
          //loading={loading}
          getOptionLabel={(option: any) => option?.name || ''}
          error={Boolean(formData?.error?.['course'])}
          infoDialog={infoDialog}
          note={'Course'}
        />
      </Grid>
      <Grid item xs={4} md={4}>
        <CommonAutocomplete
          id={'stream'}
          label='Stream'
          value={formData['stream.id']}
          onChange={(value: any) => {
            handleChange('stream', value, validationArray, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'stream',
              msterOptions: streamOptions,
              key: ['stream'],
              type: 'enquiryDetails'
            })
          }}
          options={streamOptions}
          //loading={loading}
          getOptionLabel={(option: any) => option?.name || ''}
          error={Boolean(formData?.error?.['stream'])}
          infoDialog={infoDialog}
          note={'Stream'}
        />
      </Grid>

      <Grid item xs={4} md={4}>
        <CommonAutocomplete
          id={'shift'}
          label='Shift'
          value={formData['shift.id']}
          onChange={(value: any) => {
            handleChange('shift', value, validationArray, false, null, {
              input_type: 'masterDropdownExternal',
              name: 'shift',
              msterOptions: shiftOptions,
              key: ['shift'],
              type: 'enquiryDetails'
            })
          }}
          options={[...shiftOptions]?.sort((a, b) => {
            const getNum = (s: string) => parseInt(s.match(/\d+/)?.[0] || '0')

            return getNum(a.name) - getNum(b.name)
          })}
          //loading={loading}
          getOptionLabel={(option: any) => option?.name || ''}
          error={Boolean(formData?.error?.['shift'])}
          infoDialog={infoDialog}
          note={'Shift'}
        />
      </Grid>

      {hostSchoolOptions.length > 0 && (
        <Grid item xs={4} md={4}>
          <CommonAutocomplete
            id={'guest_student_details.location'}
            label='Host School Location'
            value={formData['guest_student_details.location.id']}
            onChange={(value: any) => {
              handleChange('guest_student_details.location', value, validationArray, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'guest_student_details.location',
                msterOptions: hostSchoolOptions,
                key: ['guest_student_details.location'],
                type: 'enquiryDetails'
              })
            }}
            options={hostSchoolOptions}
            getOptionLabel={(option: any) => option?.name || ''}
            error={Boolean(
              formData?.error?.['guest_student_details.location'] ||
              (hostSchoolOptions.length > 1 && !formData['guest_student_details.location.id'])
            )}
            infoDialog={infoDialog}
            note={'Host School Location'}
          />
        </Grid>
      )}
    </>
  )
}
