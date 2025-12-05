import { useCallback, useEffect, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import {
  Autocomplete,
  Button,
  DialogActions,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography
} from '@mui/material'
//@ts-ignore
import { debounce } from 'lodash'
import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { styled } from '@mui/system'

import { CircularProgress } from '@mui/material'
import DownArrow from 'src/@core/CustomComponent/DownArrow/DownArrow'
import { getCurrentYearObject, getLocalStorageVal, getObjectByKeyVal } from 'src/utils/helper'
import InfoIcon from '@mui/icons-material/Info'
import {
  validateAlphaNumericField,
  validateEmailField,
  validateMobileNoField,
  validateNumericField,
  validateRangeField,
  validateRequiredField
} from 'src/utils/formValidations'
import { getRequest, postRequest } from 'src/services/apiService'
import toast from 'react-hot-toast'

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
  id,
  disabled
}: any) => {
  return (
    <Autocomplete
      id={id}
      options={options}
      getOptionLabel={getOptionLabel || (option => option?.name || '')}
      value={options.find((option: any) => option.id === value) || null}
      onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
      loading={loading}
      disabled={disabled}
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
interface SelectedStudnetListOption {
  id: number
  name: string
  enrollment_no: string
  board_name: string
  grade_name: string
  shift_name: string
  division: string
  mobile_no: any
  academic_year_id?: any
  board?: any
  course?: any
  grade?: any
  school?: any
  shift?: any
  stream?: any
  school_parent_id?: any
  school_latitude?: any
  school_longitude?: any
}
interface StudnetListOption {
  id: number
  name: string
  enrollment_no: string
  type: string
}

function EditFeeDetailDialog({ dialogOpen, setDialogOpen }: any) {
  let permissions: any = []
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const EnquiryNumber = useRef('')
  const { setGlobalState } = useGlobalContext()
  const [inputValue, setInputValue] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const [formData, setFormData] = useState<any>({})
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 })
  const [studentList, setStudentList] = useState<any>([])
  const [valueEntered, setValueEntered] = useState<StudnetListOption | null>(null)
  const [selectedStudentList, setSelectedStudentList] = useState<any>([])
  const [isInputChange, setIsInputChange] = useState<boolean>(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [academicYearOptions, setAcademicYearOptions] = useState<any>([])
  const [schoolOptions, setSchoolOptions] = useState<any>([])
  const [brandOptions, setBrandOptions] = useState<any>([])
  const [boardOptions, setBoardOptions] = useState<any>([])
  const [gradeOptions, setGradeOptions] = useState<any>([])
  const [shiftOptions, setShiftOptions] = useState<any>([])
  const [courseOptions, setCourseOptions] = useState<any>([])
  const [streamOptions, setStreamOptions] = useState<any>([])
  const [rows, setRows] = useState<any>([])
  const [enquiryId, setEnquiryId] = useState<any>('')
  const [academicYear, setAcademicYear] = useState<any>(null)
  const [schoolLocation, setSchoolLocation] = useState<any>(null)
  const [grade, setGrade] = useState<any>(null)
  const [brand, setBrand] = useState<any>(null)
  const [board, setBoard] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [stream, setStream] = useState<any>(null)
  const [shift, setShift] = useState<any>(null)

  const setOptionsFromResponse = (data: any, optionSet?: any) => {
    if (!data) return []

    switch (optionSet.key) {
      case 'school':
        data = Object.values(
          data.reduce((acc: any, item: any) => {
            acc[item.school_id] = acc[item.school_id] || item

            return acc
          }, {})
        )
        break
      case 'grade':
        data = Object.values(
          data.reduce((acc: any, item: any) => {
            acc[item.grade_id] = acc[item.grade_id] || item

            return acc
          }, {})
        )
        break
      case 'brand':
        data = Object.values(
          data.reduce((acc: any, item: any) => {
            acc[item.brand_id] = acc[item.brand_id] || item

            return acc
          }, {})
        )
        break
      case 'board':
        data = Object.values(
          data.reduce((acc: any, item: any) => {
            acc[item.board_id] = acc[item.board_id] || item

            return acc
          }, {})
        )
        break
      case 'course':
        data = Object.values(
          data.reduce((acc: any, item: any) => {
            acc[item.course_id] = acc[item.course_id] || item

            return acc
          }, {})
        )
        break
      case 'stream':
        data = Object.values(
          data.reduce((acc: any, item: any) => {
            acc[item.stream_id] = acc[item.stream_id] || item

            return acc
          }, {})
        )
        break
      case 'shift':
        data = Object.values(
          data.reduce((acc: any, item: any) => {
            acc[item.shift_id] = acc[item.shift_id] || item

            return acc
          }, {})
        )
        break
      default:
        break
    }

    return data.map((item: any) => ({
      id: item[optionSet?.id] || item.id,
      name: item[optionSet?.name] || item.name
    }))
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
    } catch (error) {
      console.error('Error fetching academic years:', error)
    }
  }

  const getfeesData = async (enquiryId: string) => {
    try {
      const data = {
        type: 'all_fees',
        students: [enquiryId],
        academic_years: [formData['academic_year.value'].split(' - ')[1]]
      }
      const requestparam = `school_id = ${formData['school_location.id']} AND academic_year_id= ${formData['academic_year.value'].split(' - ')[1]} AND grade_id=${formData['grade.id']} AND board_id=${formData['board.id']}  AND  shift_id= ${formData['shift.id']} AND  course_id= ${formData['course.id']} AND fee_type_id IN (1,17,9) AND publish_start_date <= current_date AND publish_end_date >= current_date`
      const response = await postRequest({
        url: `/api/ac-schools/search-school-fees`,
        serviceURL: 'mdm',
        data: {
          operator: requestparam
        }
      })
      if (response?.data?.schoolFees?.length > 0) {
        let resultData: any
        const resultDataArr: any = []
        const feeReferanceIds: any = []
        // const rowsData = response?.data.fees[enquiryId][formData['academic_year.value']]
        const studentFeeIds: any = []
        response?.data?.schoolFees.forEach((dataRowSet: any, index: number) => {
          resultDataArr.push({
            id: index + 1,
            academicYear: dataRowSet.academic_year || 'NA',
            school: dataRowSet.school_name || 'NA',
            grade: dataRowSet.grade_name || 'NA',
            board: dataRowSet.board_name || 'NA',
            course: dataRowSet.course_name || 'NA',
            brand: dataRowSet.brand_name || 'NA',
            shift: dataRowSet.shift_name || 'NA',
            feeType: dataRowSet.fee_type_name || 'NA',
            feeSubType: dataRowSet.fee_sub_type_name || 'NA',
            fees: dataRowSet.fee_amount_for_period || 0,
          })
          studentFeeIds.push(dataRowSet.id)
        })
        if(resultDataArr.length > 0){
          setRows(resultDataArr)
        }else{
          setRows([])
        }
      } else {
        console.log('error', response)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  const createDefaultOption = (id: any, value: any) => {
    if (!id || !value) return null

    return { id, name: value }
  }

  const fetchOptions = async (operator: any, setOptions?: any, optionSet?: any, setValue?: any) => {
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
          if (opData?.length == 1 && setValue) {
          setValue(opData[0].id)
          setFormData((prevState: any) => {
            return {
              ...prevState,
              [`${optionSet?.key}.id`]: opData[0]?.id,
              [`${optionSet?.key}.value`]: opData[0]?.name
            }
          })
        }

        if (response?.success) {
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

  const validationArray: any = [
    {
      type: 'is_required',
      validation: true,
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
    }
  ]

  const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 'none'
    }
  })

  const checkValidations = (
    validations: Array<{
      validation: boolean
      type: string
      error_message: string
      regexFormat?: RegExp
      min: number
      max: number
    }>,
    value: any
  ) => {
    let error = ''
    if (validations?.[0]?.validation) {
      error = validateRequiredField(value, validations?.[0]?.error_message)
    }

    if (validations?.[9]?.validation) {
      const inputValue = value
      let regex: RegExp

      const regexString = validations?.[9]?.regexFormat

      if (regexString) {
        regex = new RegExp(regexString)
      } else {
        regex = /.*/ // Fallback to a regex that matches anything (or use another default)
      }

      const isValid = inputValue === '' || inputValue == null || regex.test(inputValue)
      if (isValid) {
      } else {
        error = validations?.[9]?.error_message || 'Regex Validation Failed.'
      }

      // const isValid = regex.test(inputValue);

      // const inputValue =value;
      // let regexString:RegExp = validations?.[9]?.regexFormat;

      // let regex = new RegExp(regexString);

      // regex.test(inputValue)
    }
    if (error === '') {
      if (validations?.[1]?.validation) {
        error = validateNumericField(value, validations?.[1]?.error_message)
      }
      if (validations?.[3]?.validation) {
        error = validateEmailField(value, validations?.[3]?.error_message)
      }
      if (validations?.[2]?.validation) {
        error = validateAlphaNumericField(value, validations?.[2]?.error_message)
      }
      if (validations?.[4]?.validation) {
        error = validateMobileNoField(value, validations?.[4]?.error_message)
      }
      if (validations?.[5]?.validation) {
        error = validateRangeField(value, validations?.[4]?.error_message, validations?.[4]?.min, validations?.[4]?.max)
      }
    }

    return error
  }

  function findObjectById(array: any, id: any) {
    return array?.find((obj: any) => obj.id === id)
  }

  const resetDependentFields = (fieldName: string) => {
    const dependencyMap: { [key: string]: string[] } = {
      academic_year: ['school_location', 'grade', 'brand', 'board', 'course', 'stream', 'shift'],
      school_location: ['grade', 'brand', 'board', 'course', 'stream', 'shift'],
      grade: ['brand', 'board', 'course', 'stream', 'shift'],
      brand: ['board', 'course', 'stream', 'shift'],
      board: ['course', 'stream', 'shift'],
      course: ['stream', 'shift'],
      stream: ['shift']
    }

    const fieldsToReset = dependencyMap[fieldName] || []

    const resetFormData: any = { ...formData }
    fieldsToReset.forEach(field => {
      // Clear top-level keys like 'grade.id' and also nested keys used elsewhere like 'student_details.grade.id'
      resetFormData[`${field}.id`] = null
      resetFormData[`${field}.value`] = ''
      resetFormData[`student_details.${field}.id`] = null
      resetFormData[`student_details.${field}.value`] = ''

      // Also reset the corresponding state variable
      switch (field) {
        case 'school_location':
          setSchoolLocation(null)
          setGradeOptions(null)
          setBrandOptions(null)
          setBoardOptions(null)
          setCourseOptions(null)
          setStreamOptions(null)
          setShiftOptions(null)
          break
        case 'grade':
          setGrade(null)
          setBrandOptions(null)
          setBoardOptions(null)
          setCourseOptions(null)
          setStreamOptions(null)
          setShiftOptions(null)
          break
        case 'brand':
          setBrand(null)
          setBoardOptions(null)
          setCourseOptions(null)
          setStreamOptions(null)
          setShiftOptions(null)
          break
        case 'board':
          setBoard(null)
          setCourseOptions(null)
          setStreamOptions(null)
          setShiftOptions(null)
          break
        case 'course':
          setCourse(null)
          setStreamOptions(null)
          setShiftOptions(null)
          break
        case 'stream':
          setStream(null)
          setShiftOptions(null)
          break
        case 'shift':
          setShift(null)
          break
      }
    })
    setFormData(resetFormData)
    setRows([])
  }

  const handleChange = async (
    name: string,
    value: any,
    validations: Array<any>,
    isRepeatable: boolean,
    id: any = '',
    item: any = null
  ) => {
    // setFormTouched(true)
    const error = checkValidations ? checkValidations(validations, value) : null

    // Update the form data
    if (item?.input_type === 'masterDropdownExternal') {
      const options = item.msterOptions || []
      const newObj =
        options.length > 0
          ? findObjectById
            ? findObjectById(options, value)
            : options.find((o: any) => o.id === value)
          : null

      const fieldToCheck = (name || '').toString().split('.').pop() || name
      if (
        fieldToCheck in
        {
          academic_year: true,
          school_location: true,
          grade: true,
          brand: true,
          board: true,
          course: true,
          stream: true,
          shift: true
        }
      ) {
        resetDependentFields(fieldToCheck)
      }

      // Update the state variables based on the field name
      if (name === 'academic_year') {
        setAcademicYear(value)
      } else if (name === 'school_location') {
        setSchoolLocation(value)
      } else if (name === 'student_details.grade' || name === 'grade') {
        setGrade(value)
      } else if (name === 'brand') {
        setBrand(value)
      } else if (name === 'board') {
        setBoard(value)
      } else if (name === 'course') {
        setCourse(value)
      } else if (name === 'stream') {
        setStream(value)
      } else if (name === 'shift') {
        setShift(value)
      }

      // Update the form data
      const valueText = newObj ? newObj.name : ''

      setFormData((prevFormData: any) => {
        const updatedFormData = {
          ...prevFormData,
          [`${name}.id`]: value,
          [`${name}.value`]: valueText,
          error: {
            ...prevFormData.error,
            [name]: error
          }
        }
        
        // Only call getfeesData if shift field is updated and enquiryId exists
        if (name === 'shift' && enquiryId) {
          // Use setTimeout to ensure state is updated before calling getfeesData
          setTimeout(() => {
            getfeesData(enquiryId)
          }, 0)
        }
        
        return updatedFormData
      })
    } else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: value,
        error: {
          ...prevFormData.error,
          [name]: error
        }
      }))
    }
  }

  const debouncedStudentSearch = useCallback(
    debounce((newInputValue: string) => {
      studentSearch(newInputValue)
    }, 500),
    []
  )

  const resetAllFields = () => {
    setFormData({})
    setRows([])

    // Reset all state variables
    setAcademicYear(null)
    setSchoolLocation(null)
    setGrade(null)
    setBrand(null)
    setBoard(null)
    setCourse(null)
    setStream(null)
    setShift(null)
  }

  const handleOptionSelect = (event: React.ChangeEvent<{}>, valueInput: StudnetListOption | null) => {
    if (valueInput) {
      setIsInputChange(false)
      setValueEntered(valueInput)
      listSiblings(valueInput)
    } else {
      resetAllFields()
    }
  }

  const handleChange1 = (e: any, selectedData: any, data: any) => {
    const selectedValues = e === null ? selectedData : e.target.value
    const rows: any = []
    const rows2: any = []
    // setSelectedItems1(selectedValues)

    selectedValues.map((value: any, key: any) => {
      if (e === null) {
        data.map((value2: any, key2: any) => {
          if (value === value2.id) {
            rows[key2] = value2.id
            rows2[key2] = value2
          }
        })
      } else {
        selectedStudentList.map((value2: any, key2: any) => {
          if (value === value2.id) {
            rows[key2] = value2.id
            rows2[key2] = value2
          }
        })
      }
    })
    if (selectedValues.length === 0) {
      // setEnableTabs(false)
      //   setView('')
    } else {
      // setEnableTabs(true)
      const filteredrows = rows.filter(function (el: any) {
        return el != null
      })
      const filteredrows2 = rows2.filter(function (el: any) {
        return el != null
      })
      // setSelectedStudentIdToPass(filteredrows)
      // setSelectedStudentListToPass(filteredrows2)
      if (selectedIndex === null) {
        if (process.env.NODE_ENV !== 'development') {
          const userInfoJson = getLocalStorageVal('userInfo')
          const userInfoDetails = userInfoJson ? JSON.parse(userInfoJson) : {}
          permissions = userInfoDetails.permissions
        } else {
          permissions = [
            'fees_collection_concession_request',
            'fees_collection_view',
            'fees_collection_refund_request',
            'fees_collection_list_fees_overdue',
            'fees_collection_update',
            'fees_collection_list_fees_collected',
            'fees_collection_list_student_ledger',
            'add_charges-type',
            'fees_collection_reallocation_request',
            'charges_type',
            'fees_collection_writeoff_request',
            'fees_collection_download',
            'fees_collection_list_fees_collection',
            'fees_collection_notification',
            'finance_fees_collection',
            'fees_collection_mail',
            'update_charges_type'
          ]
        }
        // setPermissionSet(permissions)
        if (permissions.includes('fees_collection_list_fees_collection')) {
          //   setView('tab1')

          return
        } else if (permissions.includes('fees_collection_list_fees_collected')) {
          //   setView('tab2')
        } else if (permissions.includes('fees_collection_list_student_ledger')) {
          //   setView('tab3')

          return
        } else if (permissions.includes('fees_collection_list_fees_overdue')) {
          //   setView('tab4')

          return
        } else {
          //   setView('tab5')
        }
      }
      //   else {
      //     return requestComponents[selectedIndex]
      //   }
    }
  }

  const handleEditRequest = async () => {
    setGlobalState({ isLoading: true })
    // setLoaderCount((prevCount: number) => prevCount + 1)

    if (
      !formData['school_location.id'] ||
      !formData['school_location.value'] ||
      !formData['brand.id'] ||
      !formData['brand.value'] ||
      !formData['board.id'] ||
      !formData['board.value'] ||
      !formData['grade.id'] ||
      !formData['grade.value'] ||
      !formData['course.id'] ||
      !formData['course.value'] ||
      !formData['shift.id'] ||
      !formData['shift.value'] ||
      !formData['academic_year.id'] ||
      !formData['academic_year.value'] ||
      !formData['stream.id'] ||
      !formData['stream.value']
    ) {
      toast.error('Please select all the fields', {
        duration: 2000
      })
      setGlobalState({ isLoading: false })

      return
    }

    if (rows.length === 0) {
      toast.error('No fees to edit', {
        duration: 2000
      })
      setGlobalState({ isLoading: false })

      return
    }

    try {
      const payloadData = {
        enquiry_number: EnquiryNumber.current.includes('-')
          ? EnquiryNumber.current.split('- ')[1]
          : EnquiryNumber.current,
        school: { id: formData['school_location.id'], value: formData['school_location.value'] },
        brand: { id: formData['brand.id'], value: formData['brand.value'] },
        board: { id: formData['board.id'], value: formData['board.value'] },
        grade: { id: formData['grade.id'], value: formData['grade.value'] },
        course: { id: formData['course.id'], value: formData['course.value'] },
        shift: { id: formData['shift.id'], value: formData['shift.value'] },
        academicYearId: { id: formData['academic_year.id'], value: formData['academic_year.value'] },
        stream: { id: formData['stream.id'], value: formData['stream.value'] },
      }

      const url = {
        url: `marketing/enquiry/edit-fee-attached`,
        serviceURL: 'marketing',
        data: payloadData
      }

      const response = await postRequest(url)
      console.log('error response -', response)

      if (response?.status === 200) {
        const resultData: any = response?.data
        if (resultData) {
          setDialogOpen(true)
        }
        toast.success('Fees Edited Successfully', {
          duration: 2000
        })
        setGlobalState({ isLoading: false })
        // setLoaderCount((prevCount: number) => prevCount - 1)
      } else {
        toast.error(response?.error?.error?.message || 'Something went wrong', {
          duration: 2000
        })
        console.log('error', response)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setGlobalState({ isLoading: false })
      // setLoaderCount((prevCount: number) => prevCount - 1)
    }
  }

  const listSiblings = async (data: any) => {
    setEnquiryId(data.id)
    setGlobalState({ isLoading: true })
    // setLoaderCount((prevCount: number) => prevCount + 1)

    try {
      let lobs
      if (process.env.NODE_ENV !== 'development') {
        const userInfoJson = getLocalStorageVal('userInfo')
        const userInfoDetails = userInfoJson ? JSON.parse(userInfoJson) : {}
        const lobs = userInfoDetails.userInfo.lobs
      } else {
        lobs = [
          321, 12, 33, 37, 17, 60, 32, 36, 15, 59, 322, 66, 67, 85, 86, 88, 89, 90, 91, 92, 93, 94, 95, 96, 25, 11, 48,
          49, 50, 51, 52, 53, 54, 68, 69, 70, 71, 72, 73, 74, 75, 76, 79, 80, 81, 82, 83, 45, 47, 55, 56, 57, 58, 61,
          62, 63, 64, 65, 13, 26, 27, 28, 29, 30, 31, 34, 38, 39, 44, 14, 18, 19, 20, 21, 35, 22, 23, 24
        ]
      }

      const id = data.id
      const url = {
        url: `marketing/enquiry/finance/enquiry-details?enquiryId=${id}`,
        serviceURL: 'marketing'
      }

      const response = await getRequest(url)
      if (response?.status === 200) {
        const resultData: any = response?.data
        if (resultData) {
          const rows: SelectedStudnetListOption[] = []

          setAcademicYear(resultData.academic_year_id || null)
          setSchoolLocation(resultData.school_id || null)
          setGrade(resultData.grade_id || null)
          setBrand(resultData.brand_id || null)
          setBoard(resultData.board_id || null)
          setCourse(resultData.course_id || null)
          setStream(resultData.stream_id || null)
          setShift(resultData.shift_id || null)

          // Also update the form data
          setFormData((prevState: any) => ({
            ...prevState,
            ['academic_year.id']: resultData.academic_year_id || null,
            ['academic_year.value']: resultData.academic_year || '',
            ['school_location.id']: resultData.school_id || null,
            ['school_location.value']: resultData.school || '',
            ['grade.id']: resultData.grade_id || null,
            ['grade.value']: resultData.grade || '',
            ['brand.id']: resultData.brand_id || null,
            ['brand.value']: resultData.brand || '',
            ['board.id']: resultData.board_id || null,
            ['board.value']: resultData.board || '',
            ['course.id']: resultData.course_id || null,
            ['course.value']: resultData.course || '',
            ['stream.id']: resultData.stream_id || null,
            ['stream.value']: resultData.stream || '',
            ['shift.id']: resultData.shift_id || null,
            ['shift.value']: resultData.shift || ''
          }))

          rows[0] = {
            id: resultData.enquiry_id,
            name: resultData.student_name,
            enrollment_no: resultData.enquiry_number,
            board_name: resultData.board,
            grade_name: resultData.grade,
            shift_name: resultData.shift,
            division: resultData.enquiry_number,
            mobile_no: resultData.mobile_no,
            board: resultData.board_id || null,
            course: resultData.course_id || null,
            grade: resultData.grade_id || null,
            school: resultData.school_id || null,
            shift: resultData.shift_id || null,
            stream: resultData.stream_id || null,
            academic_year_id: resultData.academic_year_id || null,
            school_parent_id: resultData?.school_parent_id || null,
            school_latitude: resultData?.school_latitude,
            school_longitude: resultData?.school_longitude
          }

          setSelectedStudentList(rows)
          const firstSelection = [data.id]

          const currentDate = new Date()
          const currentAcademicYear =
            currentDate.getMonth() <= 2 ? currentDate.getFullYear() % 100 : (currentDate.getFullYear() % 100) + 1

          // setConcessionFeesData({
          //   studentId: resultData.enquiry_id,
          //   academicYear: currentAcademicYear
          // })
          getfeesData(resultData.enquiry_id)
          handleChange1(null, firstSelection, rows)
        }
        setGlobalState({ isLoading: false })
        // setLoaderCount((prevCount: number) => prevCount - 1)
      } else {
        console.log('error', response)
      }

      if (academicYear) {
        fetchAcademicYears()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setGlobalState({ isLoading: false }) // Stop loading
      // setLoaderCount((prevCount: number) => prevCount - 1)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<{}>, newInputValue: string) => {
    if (newInputValue === '') {
      setInputValue('')
      setIsInputChange(false)
      setValueEntered(null)
      setSelectedIndex(null)
    }
    if (isInputChange) {
      if (newInputValue.length > 2) {
        debouncedStudentSearch(newInputValue)
        setOpen(true)
      }
      setInputValue(newInputValue)
    }
    setIsInputChange(true)
  }

  const studentSearch = async (value: any) => {
    try {
      setGlobalState({ isLoading: true })
      // setLoaderCount((prevCount: number) => prevCount + 1)
      let lobs: any
      if (process.env.NODE_ENV !== 'development') {
        const userInfoJson = getLocalStorageVal('userInfo')
        const userInfoDetails = userInfoJson ? JSON.parse(userInfoJson) : {}
        const lobs = userInfoDetails.userInfo.lobs
      } else {
        lobs = [
          321, 12, 33, 37, 17, 60, 32, 36, 15, 59, 322, 66, 67, 85, 86, 88, 89, 90, 91, 92, 93, 94, 95, 96, 25, 11, 48,
          49, 50, 51, 52, 53, 54, 68, 69, 70, 71, 72, 73, 74, 75, 76, 79, 80, 81, 82, 83, 45, 47, 55, 56, 57, 58, 61,
          62, 63, 64, 65, 13, 26, 27, 28, 29, 30, 31, 34, 38, 39, 44, 14, 18, 19, 20, 21, 35, 22, 23, 24
        ]
      }
      let resultData: any[] = []
      EnquiryNumber.current = value

      const mdmData = {
        global_search: value,
        // grade: gradeSearch,
        // board: boardSearch,
        // shift: shiftSearch,
        // division: divisionSearch,
        lob_ids: lobs
      }
      const mdmUrl = {
        url: `/api/ac-students/search-student`,
        data: mdmData,
        serviceURL: 'mdm'
      }

      const response = await postRequest(mdmUrl)

      if (response?.success && response.data?.students?.length > 0) {
        resultData = response.data.students
      } else {
        // Get schoolIds
        let schoolIds: number[] = []
        if (process.env.NODE_ENV !== 'development') {
          const userInfoJson = getLocalStorageVal('userInfo')
          const userInfoDetails = userInfoJson ? JSON.parse(userInfoJson) : {}
          schoolIds = userInfoDetails.userInfo?.schoolIds ?? []
        } else {
          schoolIds = [
            /* full school id list here */
          ]
        }

        const marketingData = {
          search: value,
          school_id: schoolIds
        }

        const marketingUrl = {
          url: `marketing/enquiry/finance/enquiry-list/search`,
          data: marketingData,
          serviceURL: 'marketing'
        }

        const secResponse = await postRequest(marketingUrl)

        if (secResponse?.status === 200 && secResponse?.data?.length > 0) {
          resultData = secResponse.data
        }
      }

      if (resultData?.length > 0) {
        const rows: StudnetListOption[] = resultData.map((dataSet: any) => ({
          id: dataSet.id,
          name: dataSet.display_name,
          enrollment_no: dataSet.enr_on,
          type: 'f'
        }))

        setStudentList(rows)
      } else {
        setGlobalState({ isLoading: false })

        console.log('error', response)
      }
    } catch (error) {
      setGlobalState({ isLoading: false })

      console.error('Error fetching data:', error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }
  const formatAmount = (amount: any) => {
    return new Intl.NumberFormat('en-IN').format(amount)
  }
  const columns = [
    {
      field: 'academicYear',
      headerName: 'Academic Year',
      width: 100,
      tooltip: 'Academic Year',
    },
    {
      field: 'school',
      headerName: 'School',
      width: 300,
      tooltip: 'School'
    },
    {
      field: 'grade',
      headerName: 'Grade',
      width: 100,
      tooltip: 'Grade'
    },
    {
      field: 'board',
      headerName: 'Board',
      width: 100
    },
    {
      field: 'course',
      headerName: 'Course',
      width: 100
    },
    {
      field: 'brand',
      headerName: 'Brand',
      width: 150,
    },
    {
      field: 'shift',
      headerName: 'Shift',
      width: 100,
    },
    {
      field: 'feeType',
      headerName: 'Fee Sub Type',
      width: 150,
    },
    {
      field: 'feeSubType',
      headerName: 'Fee Sub Type',
      width: 150,
    },
    {
      field: 'fees',
      headerName: ' Fees (₹)',
      width: 100,
      tooltip: 'Payment Amount',
        renderCell: (
        params: any // Changed from (row) to (params:any)
      ) => (
        <div className='text-right'>
          {params.row.isLateFee ? (
            <button
              className='text-blue-600 hover:text-blue-800'
              onClick={() => console.log('Late fee details', params.row)}
            >
              {formatAmount(Math.round(params.row.fees))}
            </button>
          ) : (
            formatAmount(Math.round(params.row.fees))
          )}
        </div>
      )
    }
  ]

  const onClose = () => {
    setDialogOpen(false)
    resetAllFields()
    setValueEntered(null)
    setInputValue('')
    setIsInputChange(true)
    setSelectedIndex(null)
    setRows([])
    setSelectionModel([])
    setStudentList([])
    setSelectedStudentList([])
  }

  useEffect(() => {
    if (academicYear && academicYearOptions) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(`academic_year_id = ${yearShort}`, setSchoolOptions, {
        id: 'school_id',
        name: 'name',
        key: 'school'
      })
    }
  }, [academicYear, academicYearOptions])

  useEffect(() => {
    if (academicYear && schoolLocation && academicYearOptions?.length > 0) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit

      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation}`,
        setGradeOptions,
        {
          id: 'grade_id',
          name: 'grade_name',
          key: 'grade'
        },
        setGrade
      )
    }
  }, [academicYear, schoolLocation, academicYearOptions])

  useEffect(() => {
    if (academicYear && academicYearOptions && schoolLocation && grade) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit

      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation}  and grade_id=${grade}`,
        setBrandOptions,
        {
          id: 'brand_id',
          name: 'brand_name',
          key: 'brand'
        },
        setBrand
      )
    }
  }, [academicYear, schoolLocation, grade, academicYearOptions])

  useEffect(() => {
    if (academicYear && academicYearOptions && schoolLocation && brand && grade) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation} and brand_id = ${brand}  and grade_id=${grade}`,
        setBoardOptions,
        {
          id: 'board_id',
          name: 'board_name',
          key: 'board'
        },
        setBoard
      )
    }
  }, [academicYear, schoolLocation, grade, academicYearOptions,brand])

  useEffect(() => {
    if (academicYear && schoolLocation && brand && board && grade && academicYearOptions?.length > 0) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation} and brand_id = ${brand} and board_id = ${board} and grade_id=${grade}`,
        setCourseOptions,
        {
          id: 'course_id',
          name: 'course_name',
          key: 'course'
        },
        setCourse
      )
    }
  }, [academicYear, schoolLocation, grade, academicYearOptions,brand, board])

  useEffect(() => {
    if (academicYear && academicYearOptions && schoolLocation && brand && board && course && grade) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation} and brand_id = ${brand} and board_id = ${board} and course_id = ${course}  and grade_id=${grade}`,
        setStreamOptions,
        {
          id: 'stream_id',
          name: 'stream_name',
          key: 'stream'
        },
        setStream
      )
    }
  }, [academicYear, schoolLocation, grade, academicYearOptions,brand, board,course])

  useEffect(() => {
    if (academicYear && academicYearOptions && schoolLocation && brand && board && course && stream && grade) {
      const yearShort = getObjectByKeyVal(academicYearOptions, 'id', academicYear)?.short_name_two_digit
      fetchOptions(
        `academic_year_id = ${yearShort} and school_id = ${schoolLocation} and brand_id = ${brand} and board_id = ${board}  and course_id = ${course} and stream_id=${stream} and grade_id=${grade}`,
        setShiftOptions,
        {
          id: 'shift_id',
          name: 'shift_name',
          key: 'shift'
        },
        setShift
      )
    }
  }, [academicYear, schoolLocation, grade, academicYearOptions,brand, board,course,stream])

useEffect(() => {
  // Check if all required fields are present before calling getfeesData
  if (
    enquiryId &&
    formData['school_location.id'] &&
    formData['academic_year.id'] &&
    formData['grade.id'] &&
    formData['board.id'] &&
    formData['shift.id'] &&
    formData['course.id']
  ) {
    getfeesData(enquiryId)
  }
}, [formData['shift.id']]) // Add other dependencies if needed

  return (
    <Dialog
      open={dialogOpen}
      fullScreen={fullScreen}
      fullWidth // Ensures the dialog expands to full width
      maxWidth='xl' // Restricts maximum width
      sx={{ width: '100%' }}
    >
      <DialogContent>
        <Grid item xs={12} sx={{ mb: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant='h6' color={'text.primary'} sx={{ lineHeight: '22px' }}>
            Enquiry Details
          </Typography>
          <div onClick={onClose} className='text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600'>
            <CloseIcon />
          </div>
        </Grid>
        <Grid item xs={12} sx={{ mb: '30px' }}>
          <Divider />
        </Grid>
        <Grid item md={5} sx={{ width: '40%' }}>
          <Autocomplete
            id='combo-box-demo'
            options={studentList}
            value={valueEntered}
            inputValue={inputValue}
            getOptionLabel={(option: StudnetListOption) => option.name}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            filterOptions={options => {
              return options.filter(option => option.name)
            }}
            onInputChange={handleInputChange}
            onChange={handleOptionSelect}
            renderInput={params => (
              <TextField
                {...params}
                placeholder='Enquiry Number '
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='icon-search-normal-1'></i>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      <InputAdornment position='end' sx={{ position: 'absolute', right: '15px' }}>
                        <NoMaxWidthTooltip title='Student Name | Student Enrolment Number | Enquiry Number | Parent Mobile Number'>
                          <i className='icon-info-circle'></i>
                        </NoMaxWidthTooltip>
                      </InputAdornment>
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            sx={{
              '.MuiInputBase-root.MuiOutlinedInput-root': {
                borderRadius: '30px',
                pt: '12px',
                pl: '15px',
                height: '50px'
              },
              '.MuiInputBase-root.MuiOutlinedInput-root .MuiAutocomplete-popupIndicator': {
                display: 'none'
              },
              '.MuiInputBase-root.MuiOutlinedInput-root .MuiAutocomplete-clearIndicator': {
                mt: '5px'
              },
              '.MuiOutlinedInput-root .MuiAutocomplete-endAdornment': {
                right: '40px'
              },
              '& input': {
                //bgcolor: 'background.paper',
                color: theme => theme.palette.getContrastText(theme.palette.customColors.bodyBg)
              }
            }}
          />
        </Grid>
        <Grid item container xs={12} spacing={5} sx={{ mt: '15px' }}>
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
              options={
                academicYearOptions?.length > 0
                  ? academicYearOptions
                  : formData['academic_year.id'] && formData['academic_year.value']
                  ? [createDefaultOption(formData['academic_year.id'], formData['academic_year.value'])]
                  : []
              }
              //loading={loading}
              getOptionLabel={(option: any) => option?.name || ''}
              error={Boolean(formData?.error?.['academic_year'])}
              //infoDialog={infoDialog}
              note={'Academic Year'}
              // disabled={true}
            />
          </Grid>
          <Grid item xs={4} md={4}>
            <CommonAutocomplete
              id={'school_location'}
              label='School Location'
              value={formData['school_location.id']}
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
              options={
                schoolOptions?.length > 0
                  ? schoolOptions
                  : formData['school_location.id'] && formData['school_location.value']
                  ? [createDefaultOption(formData['school_location.id'], formData['school_location.value'])]
                  : []
              }
              //loading={loading}
              getOptionLabel={(option: any) => option?.name || ''}
              error={Boolean(formData?.error?.['school_location'])}
              //infoDialog={infoDialog}
              note={'School Location'}
              // disabled={true}
            />
          </Grid>
          <Grid item xs={4} md={4}>
            <CommonAutocomplete
              id={'grade'}
              label='Grade'
              value={formData['grade.id']}
              onChange={(value: any) => {
                //handleOptionChange('grade', value)
                handleChange('grade', value, validationArray, false, null, {
                  input_type: 'masterDropdownExternal',
                  name: 'grade',
                  msterOptions: gradeOptions,
                  key: ['grade'],
                  type: 'enquiryDetails'
                })
              }}
              options={
                gradeOptions?.length > 0
                  ? gradeOptions
                  : formData['grade.id'] && formData['grade.value']
                  ? [createDefaultOption(formData['grade.id'], formData['grade.value'])]
                  : []
              }
              //loading={loading}
              getOptionLabel={(option: any) => option?.name || ''}
              error={Boolean(formData?.error?.['grade'])}
              //infoDialog={infoDialog}
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
              options={
                brandOptions?.length > 0
                  ? brandOptions
                  : formData['brand.id'] && formData['brand.value']
                  ? [createDefaultOption(formData['brand.id'], formData['brand.value'])]
                  : []
              }
              //loading={loading}
              getOptionLabel={(option: any) => option?.name || ''}
              error={Boolean(formData?.error?.['brand'])}
              //infoDialog={infoDialog}
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
              options={
                boardOptions?.length > 0
                  ? boardOptions
                  : formData['board.id'] && formData['board.value']
                  ? [createDefaultOption(formData['board.id'], formData['board.value'])]
                  : []
              }
              //loading={loading}
              getOptionLabel={(option: any) => option?.name || ''}
              error={Boolean(formData?.error?.['board'])}
              //infoDialog={infoDialog}
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
              options={
                courseOptions?.length > 0
                  ? courseOptions
                  : formData['course.id'] && formData['course.value']
                  ? [createDefaultOption(formData['course.id'], formData['course.value'])]
                  : []
              }
              //loading={loading}
              getOptionLabel={(option: any) => option?.name || ''}
              error={Boolean(formData?.error?.['course'])}
              //infoDialog={infoDialog}
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
              options={
                streamOptions?.length > 0
                  ? streamOptions
                  : formData['stream.id'] && formData['stream.value']
                  ? [createDefaultOption(formData['stream.id'], formData['stream.value'])]
                  : []
              }
              //loading={loading}
              getOptionLabel={(option: any) => option?.name || ''}
              error={Boolean(formData?.error?.['stream'])}
              //infoDialog={infoDialog}
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
              options={
                shiftOptions?.length > 0
                  ? shiftOptions
                  : formData['shift.id'] && formData['shift.value']
                  ? [createDefaultOption(formData['shift.id'], formData['shift.value'])]
                  : []
              }
              //loading={loading}
              getOptionLabel={(option: any) => option?.name || ''}
              error={Boolean(formData?.error?.['shift'])}
              //infoDialog={infoDialog}
              note={'Shift'}
            />
          </Grid>
        </Grid>
        {true && ( //feeCollectionData.length <= 0
          <Grid container sx={{ mt: '15px' }}>
            <Grid item xs={12}>
              <Box component={'div'} sx={{ borderRadius: '12px', height: 250, border: '1px solid #c4c4c4' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  //   checkboxSelection
                  getRowId={row => row.id}
                  rowSelectionModel={selectionModel} // Use selectionModel instead of selectedRows
                  onRowSelectionModelChange={newSelection => {
                    setSelectionModel(newSelection) // Update selectionModel
                    // onRowSelectionModelChange(newSelection) // Call your existing function
                  }}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[25, 50, 100]}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-root': {
                      border: 'none'
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: 'none'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f5f5f5',
                      color: '#000',
                      fontSize: '14px'
                    },
                    '& .MuiDataGrid-virtualScroller': {
                      backgroundColor: '#fff'
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        )}
        <Grid container sx={{ mt: '15px', display: 'flex', justifyContent: 'space-between' }}>
          <div></div>
          <Button
            variant='contained'
            color='info'
            sx={{
              mr: 3,
              '@media (max-width: 910px)': {
                ml: 3
              }
            }}
            // startIcon={<EditDocumentIcon/>}
            onClick={handleEditRequest}
          >
            Confirm
          </Button>
        </Grid>
      </DialogContent>

      <DialogActions></DialogActions>

      {/* {successDilogue && <SuccessDialog openDialog={false} handleClose={() => {}} title={'successMessage'} />}

      {deleteDialog && (
        <DeleteDialog
          openModal={deleteDialog}
          handleSubmitClose={() => {}}
          closeModal={() => {}}
          //   title='Delete this form'
          //   content={`Are You Sure You Want To Delete This Request `}
        />
      )} */}
    </Dialog>
  )
}

export default EditFeeDetailDialog
