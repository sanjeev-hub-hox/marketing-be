'use client'
import {
  TextField,
  Checkbox,
  Select,
  RadioGroup,
  Button,
  FormControl,
  InputLabel,
  FormHelperText,
  MenuItem,
  FormControlLabel,
  Radio,
  Box,
  List,
  ListItem,
  IconButton,
  Grid,
  Divider,
  Tooltip,
  TextareaAutosize,
  FormLabel,
  Modal
} from '@mui/material'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import AddIcon from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import { Fragment, useEffect, useState, useCallback, useRef, use } from 'react'
import MultiSelectDropdown from './MultiSelect'
import { getRequest, patchRequest, postRequest } from '../../services/apiService'
import moment from 'moment'
import LeadReopenedDialog from './Dialog/ReopenRedirect'
import {
  validateAlphaNumericField,
  validateEmailField,
  validateMobileNoField,
  validateNumericField,
  validateRangeField,
  validateRequiredField
} from '../../utils/formValidations'
import Icon from '../../@core/components/icon'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'
import { useForm, Controller } from 'react-hook-form'
import PhoneNumberInput from 'src/@core/CustomComponent/PhoneNumberInput/PhoneNumberInput'
import MasterDropDown from './MasterDropDown'
import {
  convertDate,
  getCurrentYearObject,
  getNestedProperty,
  getObjectByKeyVal,
  getObjectByKeyValNew,
  getObjectByShortNameTwoDigit,
  removeObjectNullAndEmptyKeys
} from 'src/utils/helper'
import dayjs from 'dayjs'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { type } from 'os'
import style from '../../pages/stages/stage.module.css'
import EnquirySourceType from './ExternalFields/EnquirySourceType'
import EnquirySource from './ExternalFields/EnquirySource'
import EnquirySubSource from './ExternalFields/EnquirySubSource'
// Nikhil
import EnquiryEmployeeSource from './ExternalFields/EnquiryEmployeeSource'
import EnquiryParentSource from './ExternalFields/EnquiryParentSource'
import EnquiryCorporateSource from './ExternalFields/EnquiryCorporateSource'
import EnquirySchoolSource from './ExternalFields/EnquirySchoolSource'
import EnquiryMode from './ExternalFields/EnquiryMode'
import { useRouter } from 'next/router'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import InfoIcon from '@mui/icons-material/Info'
import { info } from 'console'
import PSASubType from './ExternalFields/PSASubType'
import PSACategory from './ExternalFields/PSACategory'
import PSASubCategory from './ExternalFields/PSASubCategory'
import PeriodOfService from './ExternalFields/PeriodOfService'
import PSABatch from './ExternalFields/PSABatch'
import KidsClubFields from './ExternalFields/KidsClubFields'
import PSAFields from './ExternalFields/PSAFields'
import DownArrow from 'src/@core/CustomComponent/DownArrow/DownArrow'
import EnquiryDetails from './ExternalFields/EnquiryDetails'
import { academicYearApiUrl, ENQUIRY_STAGES } from 'src/utils/constants'
import ParentsDetails from './ExternalFields/ParentsDetails'
import { parentFields } from './parentFields'
import ResidentislDetails from './ExternalFields/ResidentialDetails'
import KidsClubEnquiryDetails from './ExternalFields/KidsClubEnquiryDetails'
import PhoneNumberField from '../PhoneNumberField'
import { usePathname } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'


interface CreateProps {
  auto: boolean
  url: string | null
  slug: string
  appendRequest: {} // Additional Params
  submitProp?: any // Trigers form submittion from outside.
  submitPropsFunction?: any // Callback after form  is submitted
  dataId?: any
  requestParams?: any
  dynamicFormData?: any // Pre Loaded form data
  attachExternalFields?: any
  externalPSAFields?: any
  externalKidsClubFields?: any
  setDynamicFormData?: any
  enquiryTypeData?: any
  activeStageName?: any
  queryTesxtBox?:any
  setSubmitProp?:any
  authToken?:any
}

interface FileProp {
  name: string
  type: string
  size: number
}

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginRight: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(4)
  },
  [theme.breakpoints.down('sm')]: {
    width: 250
  }
}))

const HeadingTypography = styled(Typography)<TypographyProps>(({ theme }) => ({
  marginBottom: theme.spacing(5),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(4)
  }
}))

export default function CreateForm({
  auto,
  url,
  slug,
  appendRequest,
  submitProp,
  submitPropsFunction,
  dataId,
  requestParams,
  dynamicFormData,
  attachExternalFields,
  externalPSAFields,
  externalKidsClubFields,
  setDynamicFormData,
  enquiryTypeData,
  activeStageName,
  queryTesxtBox,
  setSubmitProp,
  authToken
}: CreateProps) {
  const skipReopenCheckRef = useRef(false)
  const [redirectId, setRedirectId] = useState<string | number | null>(null)
  const [formfields, setFormfields] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [requiredFields, setRequiredFields] = useState<any>({})
  const [dependentField, setDependentField] = useState<any>(null)
  const [files, setFiles] = useState<File[]>([])
  const [sectionFields, setSectionFields] = useState<any>({})
  const [formTouched, setFormTouched] = useState<any>(false)
  const [masterDropDownOptions, setMasterDropDownOptions] = useState<any>([])
  const { setGlobalState,setApiResponseType } = useGlobalContext()
  const router = useRouter()
  const firstErrorRef = useRef(null)
  const [infoDialog, setInfoDialog] = useState(false)
  const [acYearList, setAcYearList] = useState<any>([])
  const [openDublicateschild, setOpenDublicateschild] = useState(false);
  const [openReopenDialog, setOpenReopenDialog] = useState(false);
  const [open10ENRdialog, setOpen10ENRdialog] = useState(false);
  const [handleLeadReopnData, setHandleLeadReopnData] = useState();
  const [reopenedLeadEnquiryId, setReopenedLeadEnquiryId] = useState<string | number | null>(null);
  const [openDublicateIVTenquiry, setOpenDublicateIVTenquiry] = useState(false);
  const [dublicateEnquiry, setDublicateEnquiry] = useState('');

  const pathname = usePathname()

  console.log('pathname',pathname)

  const getAcYear = async() =>{
    const apiRequest = {
      url: `/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1&sort[0]=id:asc`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response: any = await getRequest(apiRequest)
    setAcYearList(response?.data)
  } 

  useEffect(()=>{
    getAcYear()
  },[])

  const checkiFContactUnique = async(value:any,type:any) =>{
      const params = {
        url:`/api/co-global-users?filters[${type}]=${value}`,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        }
      }

      const response = await getRequest(params)
      if(response?.data?.length > 0 ){
        return true
      }

      return false
  }

  //const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const CalendarIcon = () => <span className='icon-calendar-1'></span>

  const selectOptions = async (endpoint = 'products') => {
    setGlobalState({ isLoading: true })

    const params = {
      url: '/' + endpoint,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    try {
      const data = await getRequest(params)
      setGlobalState({ isLoading: false })

      return data?.data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      setGlobalState({ isLoading: false })

      return []
    }
  }

  useEffect(() => {
    formfields?.[0]?.inputs.forEach(async (item: any) => {
      if (item.input_type == 'masterDropdown') {
        const options = await selectOptions(item.input_default_value)
        setMasterDropDownOptions((prevState: any) => {
          return {
            ...prevState,
            [item.input_field_name]: options
          }
        })
      }
    })
  }, [formfields])

  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
    setValue,
    trigger,
    getValues
  } = useForm<any>()

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
    },
    {
      name: 'guest_student_details.location',
      required: true,
      customValidation: (value: any, formData: any) => {
        if (formData?.is_guest_student) {
          if (!value) {
            return 'Host School Location is required for guest students'
          }
          if (value === formData['school_location.id']) {
            return 'Host School Location must be different from School Location'
          }
        }
        
        return null
      }
    }
  ]

  const validationArrayOptional: any = [
    {
      type: 'is_required',
      validation:  activeStageName == ENQUIRY_STAGES?.ENQUIRY ?false : true,
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

  const formDataVal = watch()
  useEffect(() => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `/form-builder/form/` + slug,
      serviceURL: 'admin'
    }
    getRequest(params).then((data: any) => {
      if (data?.data) {
        setFormfields([
          {
            form: data?.data?.[0]?.form,
            inputs: data?.data?.[0]?.inputs
              .sort((a: any, b: any) => a?.['input_order'] - b?.['input_order'])
              ?.map((item: any) => ({
                ...item,
                ['input_dependent_value']: item?.['input_dependent_value']
                  ? JSON.parse(item?.['input_dependent_value'])
                  : null
              })),
            dependent_field: data?.data?.[0]?.dependent_field
          }
        ])
        getDependentArr(data?.data?.[0]?.dependent_field)

        const groupedData = data?.data?.[0]?.inputs.reduce((acc: any, item: any) => {
          const section = item.section
          if (!acc[section]) {
            acc[section] = []
          }
          acc[section].push(item)

          return acc
        }, {})

        setSectionFields(groupedData)
      } else {
        console.log('error', data)
      }
      setGlobalState({ isLoading: false })
    })
  }, [slug])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const inputElement = document.querySelector('input[name]')
    const inputName: any = inputElement?.getAttribute('name')

    // Process the accepted files
    setFiles(acceptedFiles.map(file => Object.assign(file)))

    const convertedFiles = acceptedFiles.map(file => ({
      name: file.name,
      type: file.type,
      link: URL.createObjectURL(file)
    }))
    setFormData((item: any) => ({
      ...item,
      [inputName]: convertedFiles
    }))
    setRequiredFields((item: any) => ({
      ...item,
      [inputName]: convertedFiles
    }))
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop
  })

  const renderFilePreview = (file: FileProp) => {
    if (file.type.startsWith('image')) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file as any)} />
    } else {
      return <Icon icon='mdi:file-document-outline' />
    }
  }

  const handleRemoveFile = (file: FileProp) => {
    const uploadedFiles = files
    const filtered = uploadedFiles.filter((i: FileProp) => i.name !== file.name)
    setFiles([...filtered])

    // let arr = formData?.[name]?.filter((item: any) => item?.name !== e.name);
    // setFormData((item: any) => ({
    //   ...item,
    //   [name]: arr,
    // }));
  }

  const validateAllFields = async () => {
    let isValid = true

    const errors: any = {}

    if (formfields && formfields?.length) {
      const fields = formfields[0]?.inputs

      fields.map((field: any, index: number) => {
        const value =
          field.input_type == 'masterDropdown'
            ? formData[field.input_field_name + '.id']
              ? formData[field.input_field_name + '.id']
              : formData[field.input_field_name] && formData[field.input_field_name]?.includes('api')
              ? null
              : formData[field.input_field_name]
            : formData[field.input_field_name]
        if (isFieldVisible(field)) {
          const error = checkValidations(field.validations, value)
          if (error) {
            isValid = false

            if (error) {
              errors[field.input_field_name] = error
            }
          }
        }
       
      })

      // const asyncChecks = fields.map(async (field: any) => {
      //   if (
      //     (
      //       enquiryTypeData?.slug != 'ivtEnquiry' && 
      //       enquiryTypeData?.slug != 'reAdmission'
      //     ) && (
      //     field.input_field_name?.includes('mobile') ||
      //     field.input_field_name?.includes('email') )
      //   ) {
      //     const type = field.input_field_name.includes('mobile')
      //       ? 'mobile_no'
      //       : 'email';
  
      //     const res = await checkiFContactUnique(formData[field.input_field_name], type);
      //     if (res) {
      //       errors[field.input_field_name] = 'Field must be unique';
      //     }
      //   }
      // });
  
      // await Promise.all(asyncChecks); // Wait for all async checks to complete
    
    }

    console.log('RESS>2',errors)


    return errors
  }

  // const validateExternalFields = () => {
  //   const errors: any = {}
  //   // Nikhil
  //   const external_fields = ['enquiry_mode', 'enquiry_source_type', 'enquiry_source', 'enquiry_sub_source']//  need to added for tieup check
  //   external_fields?.map((val: any, index: number) => {
  //     const error = checkValidations(validationArray, formData[`${val}.id`])
  //     if (error) {
  //       if (error) {
  //         errors[val] = error
  //       }
  //     }
  //   })
  //   if (Object.keys(errors).length > 0 && (attachExternalFields || slug == 'enquiryStudentDetailRegistrationForm')) {
  //     return {
  //       errors: errors,
  //       status: true
  //     }
  //   } else {
  //     return {
  //       status: false
  //     }
  //   }
  // }

  const validateExternalFields = () => {
    const errors: any = {}

    // Base external fields
    const external_fields = ['enquiry_mode', 'enquiry_source_type', 'enquiry_source', 'enquiry_sub_source']

    // Map of sub-source values to their dependent field names
    const dependentFieldsMap: Record<string, string> = {
      'Employee': 'enquiry_employee_source',
      'Parent': 'enquiry_parent_source',
      'Corporate': 'enquiry_corporate_source',
      'Pre School': 'enquiry_school_source'
    }

    // Validate base fields
    external_fields.forEach((val) => {
      const error = checkValidations(validationArray, formData[`${val}.id`])
      if (error) errors[val] = error
    })

    // Get the selected sub-source value and validate its dependent field
    const selectedSubSource = formData['enquiry_sub_source.value']
    const requiredField = dependentFieldsMap[selectedSubSource]

    if (requiredField) {
      const error = checkValidations(validationArray, formData[`${requiredField}.id`])
      if (error) errors[requiredField] = error
    }

    if (Object.keys(errors).length > 0 && (attachExternalFields || slug === 'enquiryStudentDetailRegistrationForm')) {
      return { errors, status: true }
    } else {
      return { status: false }
    }
  }


  const validateExternalPSAFields = () => {
    const errors: any = {}

    const external_fields = ['psa_sub_type', 'psa_category', 'psa_sub_category', 'psa_batch', 'period_of_service']
    external_fields?.map((val: any, index: number) => {
      const error = checkValidations(validationArray, formData[`${val}.id`])
      if (error) {
        if (error) {
          errors[val] = error
        }
      }
    })
    if (Object.keys(errors).length > 0 && externalPSAFields) {
      return {
        errors: errors,
        status: true
      }
    } else {
      return {
        status: false
      }
    }
  }

  const validateExternalEnquiryFields = () => {
    const errors: any = {}

    const external_fields = [
      'academic_year',
      'school_location',
      'board',
      'brand',
      'student_details.grade',
      'shift',
      'course',
      'stream'
    ]


    switch (enquiryTypeData?.slug) {
      case 'ivtEnquiry':
        external_fields.push( 'ivt_reason')
        break;
      case 'readmission_10_11': 
        // external_fields.push( 'enquiry_type_reason') // slug from enquirytype
        external_fields.push( 'ivt_reason')

        break;    
      default:
        break;
    }

    // if(enquiryTypeData?.slug == 'ivtEnquiry'){
    //     external_fields.push( 'ivt_reason')
    // }

    external_fields?.map((val: any, index: number) => {
      const error = checkValidations(validationArray, formData[`${val}.id`])
      if (error) {
        if (error) {
          errors[val] = error
        }
      }
    })
    if (
      Object.keys(errors).length > 0 &&
      ((enquiryTypeData && enquiryTypeData?.slug == 'newAdmissionEnquiry') ||
        slug == 'enquiryStudentDetailRegistrationForm' ||
        enquiryTypeData?.slug == 'externalUserNewAdmissionWebsite' || enquiryTypeData?.slug == 'ivtEnquiry' || enquiryTypeData?.slug == 'reAdmission' || enquiryTypeData?.slug == 'readmission_10_11')
    ) {
      return {
        errors: errors,
        status: true
      }
    } else {
      return {
        status: false
      }
    }
  }

  const validateExternalKIdsClubEnquiryFields = () => {
    const errors: any = {}

    const external_fields = ['academic_year', 'school_location']

    external_fields?.map((val: any, index: number) => {
      const error = checkValidations(validationArray, formData[`${val}.id`])
      if (error) {
        if (error) {
          errors[val] = error
        }
      }
    })
    if (
      Object.keys(errors).length > 0 &&
      ((enquiryTypeData && enquiryTypeData?.slug == 'externalUserKidsClub') || slug == 'externalUserKidsClub')
    ) {
      return {
        errors: errors,
        status: true
      }
    } else {
      return {
        status: false
      }
    }
  }

 const validateUniqueParentEmails = () => {
  const errors: Record<string, string> = {}

  const fatherEmail = formData['parent_details.father_details.email']?.toLowerCase() || ''
  const motherEmail = formData['parent_details.mother_details.email']?.toLowerCase() || ''
  const guardianEmail = formData['parent_details.guardian_details.email']?.toLowerCase() || ''

  const emailMap = {
    'parent_details.father_details.email': fatherEmail,
    'parent_details.mother_details.email': motherEmail,
    'parent_details.guardian_details.email': guardianEmail
  }

  const seen = new Set<string>()

  for (const [key, email] of Object.entries(emailMap)) {
    if (email && seen.has(email)) {
      errors[key] = 'Email must be unique'
    }
    seen.add(email)
  }

  return {
    status: Object.keys(errors).length > 0,
    errors
  }
}


  const validateResidentialFields = () => {
    const errors: any = {}

    console.log('is_permanent_address value:', formData['residential_details.is_permanent_address'])
    console.log('Type:', typeof formData['residential_details.is_permanent_address'])

    // Always validate current address fields
    const current_address_fields = [
      'residential_details.current_address.house',
      'residential_details.current_address.street',
      'residential_details.current_address.landmark',
      'residential_details.current_address.pin_code'
    ]

    // Validate current address fields
    current_address_fields.forEach((field) => {
      const error = checkValidations(validationArrayOptional, formData[field])
      if (error) {
        errors[field] = error
      }
    })

    // Only validate permanent address if user selected 'no' (addresses are different)
    // Check for both 'no' and false to handle different data types
    if (formData['residential_details.is_permanent_address'] === 'no' || 
        formData['residential_details.is_permanent_address'] === false) {
      const permanent_address_fields = [
        'residential_details.permanent_address.house',
        'residential_details.permanent_address.street',
        'residential_details.permanent_address.landmark',
        'residential_details.permanent_address.pin_code'
      ]

      permanent_address_fields.forEach((field) => {
        const error = checkValidations(validationArrayOptional, formData[field])
        if (error) {
          errors[field] = error
        }
      })
    }

    // Return validation result
    if (
      Object.keys(errors).length > 0 &&
      (slug == 'createContactDetails' || activeStageName == ENQUIRY_STAGES?.ENQUIRY)
    ) {
      return {
        errors: errors,
        status: true
      }
    } else {
      return {
        status: false
      }
    }
  }

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

  function updateIsRequired(data: any, conditionCallback: any) {
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach((field: any) => {
          if (Array.isArray(field.validations)) {
            field.validations.forEach((validation: any) => {
              if (validation.type === 'is_required') {
                validation.validation = conditionCallback(key)
              }
            })
          }
        })
      }
    }

    return data
  }

  const validateExternalParentFields = () => {
    const errors: any = {}

    const dataa = updateIsRequired(parentFields, getFieldCondition)
    const external_fields = [...dataa?.father, ...dataa?.mother, ...dataa?.guardian]
    //debugger
    // const external_fields = [
    //   'academic_year',
    //   'school_location',
    //   'board',
    //   'brand',
    //   'student_details.grade',
    //   'shift',
    //   'course',
    //   'stream'
    // ]
    external_fields?.map((val: any, index: number) => {
      if (!val?.is_optional) {
        if (
          !val?.input_field_name.includes('country') &&
          !val?.input_field_name.includes('city') &&
          !val?.input_field_name.includes('state')
        ) {
          let error = null
          if (val?.type == 'masterdropdown') {
            error = checkValidations(val.validations, formData[`${val?.input_field_name}.id`])
            if (error) {
              if (error) {
                errors[val?.input_field_name + '.id'] = error
              }
            }
          } else {
            error = checkValidations(val.validations, formData[`${val?.input_field_name}`])
            if (error) {
              if (error) {
                errors[val?.input_field_name] = error
              }
            }
          }
        }
      }
    })
    if (Object.keys(errors).length > 0 && slug == 'registrationProcessStudentParentDetails') {
      return {
        errors: errors,
        status: true
      }
    } else {
      return {
        status: false
      }
    }
  }

  console.log('formData>>', formData)
  const fileList = files.map((file: FileProp) => (
    <ListItem key={file.name}>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name'>{file.name}</Typography>
          <Typography className='file-size' variant='body2'>
            {Math.round(file.size / 100) / 10 > 1000
              ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
              : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <Icon icon='mdi:close' fontSize={20} />
      </IconButton>
    </ListItem>
  ))

  const handleRemoveAllFiles = () => {
    setFiles([])
  }

  const getDependentArr = (data: Array<[]>) => {
    const convertedObject: any = {}
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        convertedObject[key] = data[key].map((obj: any) => ({
          ...obj,
          display: false
        }))
      }
    }
    setDependentField(convertedObject)
  }
  const getDefaultValue = (data: any) => {
    if (data?.['input_type'] === 'date') {
      const date = data?.['input_default_value'] ? new Date(data?.['input_default_value']?.split('T')[0]) : null

      return date
    } else if (data?.['input_type'] === 'time') {
      const date = new Date()
      const _time = moment(data?.['input_default_value'], 'hh:mm:ss A').format('HH:mm:ss')
      const __time = _time.split(':')
      date.setHours(parseInt(__time[0]))
      date.setMinutes(parseInt(__time[1]))
      date.setSeconds(parseInt(__time[2]))

      console.log('time format', moment(data?.['input_default_value'], 'hh:mm:ss A').format('HH:mm:ss'))

      return date
    } else if (data?.['input_type'] === 'dateRange') {
      const date = new Date(data?.['input_default_value'].split('T')[0])

      return date
    } else if (data?.['input_type'] === 'timeRange') {
      const date = new Date()
      const _time = moment(data?.['input_default_value'].split(','), 'hh:mm:ss A').format('HH:mm:ss')
      const __time = _time.split(':')
      date.setHours(parseInt(__time[0]))
      date.setMinutes(parseInt(__time[1]))
      date.setSeconds(parseInt(__time[2]))

      console.log('time format', moment(data?.['input_default_value'], 'hh:mm:ss A').format('HH:mm:ss'))

      return date
    } else if (data?.['input_type'] === 'checkbox') {
      return data?.['input_default_value'].split(',')
    } else {
      return data?.['input_default_value']
    }
  }
  useEffect(() => {
    let _formData: any = {}
    formfields?.[0]?.inputs?.map((item: any) => {
      if (item?.['input_type'] !== 'timeRange' && item?.['input_type'] !== 'dateRange') {
        if (item?.validations?.[6]?.validation) {
          _formData = {
            ..._formData,
            [item?.['input_field_name']]: [
              {
                id: Date.now(),
                value: item?.['input_is-multiple'] ? item?.['input_default_value'].split(',') : getDefaultValue(item)

                // item?.['input_default_value']
              }
            ]
          }
        } else {
          _formData = {
            ..._formData,
            [item?.['input_field_name']]: item?.['input_is-multiple']
              ? item?.['input_default_value'].split(',')
              : getDefaultValue(item)

            //  item?.['input_default_value'],
          }
        }
      }
      if (item?.['input_type'] === 'timeRange' || item?.['input_type'] === 'dateRange') {
        _formData = {
          ..._formData,
          [`${item?.['input_field_name']}_start`]: getDefaultValue(item),
          [`${item?.['input_field_name']}_end`]: getDefaultValue(item)
        }
      }
      if (item?.validations?.[11]?.validation) {
        _formData = {
          ..._formData,
          [`${item?.['input_field_name']}`]: convertDate(dayjs())
        }
      }
      if (item?.validations?.[4]?.validation) {
        _formData = {
          ..._formData,
          [`${item['input_field_name']?.replace(/\.[^.]+$/, '.country_code')}`]: 1
        }
      }
    })

    if (
      (enquiryTypeData && enquiryTypeData?.slug == 'newAdmissionEnquiry') ||
      slug == 'enquiryStudentDetailRegistrationForm' ||
      enquiryTypeData?.slug == 'externalUserNewAdmissionWebsite'
    ) {
      _formData.enquiry_date = dayjs()
      const params = {
        url: academicYearApiUrl,
        serviceURL: 'mdm'
      }
      getRequest(params).then((response: any) => {
        const formattedData = response.data.map((item: any) => ({
          id: item.id,
          name: item.attributes.name,
          value: item.id,
          short_name_two_digit: item.attributes?.short_name_two_digit
        }))
        const currentYear = getCurrentYearObject(response?.data)

        if (currentYear && currentYear?.length) {
          const yearName = getObjectByKeyVal(formattedData, 'id', currentYear[0]?.id)?.name
          _formData['academic_year.id'] = currentYear[0]?.id
          _formData['academic_year.value'] = yearName
        }
      })
    }

    if (activeStageName == ENQUIRY_STAGES?.ENQUIRY) {
      _formData['residential_details.is_permanent_address'] = 'yes'
    }


    // setRequiredFields(_formData); test
    setFormData(_formData)
  }, [formfields])

  const getEligibleGrade = async (formValues: any) => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/eligible-grade?academicYearId=${formValues['academic_year.id']}&schoolId=${formValues['school_location.id']}&dob=${formValues['student_details.dob']}`,
      serviceURL: 'marketing'
    }
    try {
      const data: any = await getRequest(params)

      return data?.data?.eligibleGrade
    } catch (error) {
      console.error('Error fetching products:', error)
      setGlobalState({ isLoading: false })

      return null
    }
  }

  useEffect(() => {
    if (dynamicFormData) {
      const _formData: any = { ...formData }
      formfields?.[0]?.inputs?.map((item: any) => {
        if (item['input_field_name'] == 'enquiry_form' || item['input_field_name'] == 'registration_form') {
          _formData[item.input_field_name] = getDefaultValue(item)
        } else {
          if (item?.['input_type'] == 'masterDropdown') {
            checkDependentValue(getNestedProperty(dynamicFormData, item['input_field_name'] + '.id'), item)
            _formData[item.input_field_name] = getNestedProperty(dynamicFormData, item['input_field_name'] + '.id')
            _formData[item.input_field_name + '.id'] = getNestedProperty(
              dynamicFormData,
              item['input_field_name'] + '.id'
            )
            _formData[item.input_field_name + '.value'] = getNestedProperty(
              dynamicFormData,
              item['input_field_name'] + '.value'
            )
          } else {
            if (item['input_field_name'] == 'student_details.enrolment_number') {
              console.log('dynamicFormData', dynamicFormData)
              _formData['enquiry_date'] = dayjs()
              _formData[item.input_field_name] = dynamicFormData?.student_details?.enrolment_number
            } else {
              checkDependentValue(getNestedProperty(dynamicFormData, item.input_field_name), item)
              _formData[item.input_field_name] =
                getNestedProperty(dynamicFormData, item.input_field_name) || item.input_default_value
            }
          }
        }
        if (item['input_field_name']?.includes('mobile')) {
          _formData[`${item['input_field_name']?.replace(/\.[^.]+$/, '.country_code')}`] =
            getNestedProperty(dynamicFormData, item['input_field_name']?.replace(/\.[^.]+$/, '.country_code')) || 1
        }
      })

      // const eligibleGrade = getEligibleGrade(_formData).then((resp: any) => {
      //   console.log('_formData>>>eligibleGrade', resp)

      //   _formData['student_details.eligible_grade'] = resp
      //   //setFormData(_formData)

      // })

      setFormData(_formData) ///

      const objNew: any = {}
      if (attachExternalFields || slug == 'enquiryStudentDetailRegistrationForm') {
        // Nikhil
        const external_fields = ['enquiry_mode', 'enquiry_source_type', 'enquiry_source', 'enquiry_sub_source', 'enquiry_employee_source' , 'enquiry_parent_source', 'enquiry_school_source', 'enquiry_corporate_source']
        external_fields?.map((val: any) => {
          objNew[val] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.id'] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.value'] = getNestedProperty(dynamicFormData, val + '.value')
        })
      }

      if (externalPSAFields) {
        const external_fields = ['psa_sub_type', 'psa_category', 'psa_sub_category', 'psa_batch', 'period_of_service']
        external_fields?.map((val: any) => {
          objNew[val] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.id'] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.value'] = getNestedProperty(dynamicFormData, val + '.value')
        })
      }

      if (externalKidsClubFields) {
        const external_fields = [
          'kids_club_type',
          'kids_club_batch',
          'kids_club_period_of_service',
          'kids_club_month',
          'kids_club_from_cafeteria_opt_for'
        ]
        external_fields?.map((val: any) => {
          objNew[val] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.id'] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.value'] = getNestedProperty(dynamicFormData, val + '.value')
        })
      }

      if (
        (enquiryTypeData && enquiryTypeData?.slug == 'newAdmissionEnquiry') ||
        slug == 'enquiryStudentDetailRegistrationForm' ||
        enquiryTypeData?.slug == 'externalUserNewAdmissionWebsite' || enquiryTypeData?.slug == 'ivtEnquiry' || enquiryTypeData?.slug == 'reAdmission' || enquiryTypeData?.slug == 'readmission_10_11'
      ) {
        const external_fields = [
          'academic_year',
          'school_location',
          'board',
          'brand',
          'student_details.grade',
          'shift',
          'course',
          'stream'
        ]
        external_fields?.map((val: any) => {
          objNew[val] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.id'] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.value'] = getNestedProperty(dynamicFormData, val + '.value')
        })
        objNew['enquiry_date'] = dynamicFormData?.enquiry_date || dayjs()


        switch (enquiryTypeData?.slug) {
          case 'ivtEnquiry':
            objNew['ivt_date'] = dynamicFormData?.ivt_date || dayjs()
            objNew['ivt_reason' + '.id'] = getNestedProperty(dynamicFormData, 'ivt_reason' + '.id')
            objNew['ivt_reason' + '.value'] = getNestedProperty(dynamicFormData, 'ivt_reason' + '.value')
            break;
          case 'reAdmission': 
            objNew['ivt_date'] = dynamicFormData?.ivt_date || dayjs()
            objNew['ivt_reason' + '.id'] = getNestedProperty(dynamicFormData, 'ivt_reason' + '.id')
            objNew['ivt_reason' + '.value'] = getNestedProperty(dynamicFormData, 'ivt_reason' + '.value')       
            break;  
          case 'readmission_10_11': 
            objNew['ivt_date'] = dynamicFormData?.ivt_date || dayjs()
            objNew['ivt_reason' + '.id'] = getNestedProperty(dynamicFormData, 'ivt_reason' + '.id')
            objNew['ivt_reason' + '.value'] = getNestedProperty(dynamicFormData, 'ivt_reason' + '.value')
            break;  
          default:
            break;
        }

        // if(enquiryTypeData?.slug == 'ivtEnquiry' || enquiryTypeData?.slug == 'reAdmission'){
        //   objNew['ivt_date'] = dynamicFormData?.ivt_date || dayjs()
        //   objNew['ivt_reason' + '.id'] = getNestedProperty(dynamicFormData, 'ivt_reason' + '.id')
        //   objNew['ivt_reason' + '.value'] = getNestedProperty(dynamicFormData, 'ivt_reason' + '.value')
        // }
        if (slug == 'enquiryStudentDetailRegistrationForm') {
          objNew['enquiry_number'] = dynamicFormData?.enquiry_number
          objNew['enquiry_type'] = dynamicFormData?.enquiry_type
        }
        objNew['student_details.enrolment_number'] = getNestedProperty(dynamicFormData,'student_details.enrolment_number')
        objNew['is_guest_student'] =  getNestedProperty(dynamicFormData,'is_guest_student')
        objNew['guest_student_details.location.id'] =  getNestedProperty(dynamicFormData,'guest_student_details.location.id')
        objNew['guest_student_details.location.value'] =  getNestedProperty(dynamicFormData,'guest_student_details.location.value')
      }

      if (enquiryTypeData && enquiryTypeData?.slug == 'externalUserKidsClub') {
        const external_fields = ['academic_year', 'school_location']
        external_fields?.map((val: any) => {
          objNew[val] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.id'] = getNestedProperty(dynamicFormData, val + '.id')
          objNew[val + '.value'] = getNestedProperty(dynamicFormData, val + '.value')
        })
        objNew['enquiry_date'] = dynamicFormData?.enquiry_date || dayjs()
        if (slug == 'enquiryStudentDetailRegistrationForm') {
          objNew['enquiry_number'] = dynamicFormData?.enquiry_number
          objNew['enquiry_type'] = dynamicFormData?.enquiry_type
        }
      }

      if (slug == 'registrationProcessStudentParentDetails') {
        const dataa = updateIsRequired(parentFields, getFieldCondition)
        const external_fields = [...dataa?.father, ...dataa?.mother, ...dataa?.guardian]
        external_fields?.map((val: any) => {
          objNew[val?.input_field_name] = getNestedProperty(dynamicFormData, val?.input_field_name)
          objNew[val?.input_field_name + '.id'] = getNestedProperty(dynamicFormData, val?.input_field_name + '.id')
          objNew[val?.input_field_name + '.value'] = getNestedProperty(
            dynamicFormData,
            val?.input_field_name + '.value'
          )
          if (val['input_field_name']?.includes('mobile')) {
            objNew[`${val['input_field_name']?.replace(/\.[^.]+$/, '.country_code')}`] =
              getNestedProperty(dynamicFormData, val['input_field_name']?.replace(/\.[^.]+$/, '.country_code')) || 1
          }
        })
        objNew['parent_details.is_parent_single'] =
          getNestedProperty(dynamicFormData, 'parent_details.is_parent_single') || 'no'
        objNew['parent_details.single_parent_type'] =
          getNestedProperty(dynamicFormData, 'parent_details.single_parent_type') || 'father'
      }

      if (slug == 'createContactDetails' || activeStageName == ENQUIRY_STAGES?.ENQUIRY) {
        const external_fields = [
          'residential_details.current_address.house',
          'residential_details.current_address.street',
          'residential_details.current_address.landmark',
          'residential_details.current_address.pin_code',
          'residential_details.current_address.country',
          'residential_details.current_address.state',
          'residential_details.current_address.city',
          'residential_details.is_permanent_address'
        ]
        const isPermanentAddress = getNestedProperty(dynamicFormData, 'residential_details.is_permanent_address')
        if (isPermanentAddress == 'no') {
          const additional_fields = [
            'residential_details.permanent_address.house',
            'residential_details.permanent_address.street',
            'residential_details.permanent_address.landmark',
            'residential_details.permanent_address.pin_code',
            'residential_details.permanent_address.country',
            'residential_details.permanent_address.state',
            'residential_details.permanent_address.city'
          ]

          external_fields.push(...additional_fields)
        }
        external_fields?.map((val: any) => {
          if (val?.includes('country') || val?.includes('city') || val?.includes('state')) {
            objNew[val + '.id'] = getNestedProperty(dynamicFormData, val + '.id')
            objNew[val + '.value'] = getNestedProperty(dynamicFormData, val + '.value')
          } else {
            objNew[val] = getNestedProperty(dynamicFormData, val)
          }
        })
        objNew['residential_details.is_permanent_address'] =
          getNestedProperty(dynamicFormData, 'residential_details.is_permanent_address') === false ? 'no' : 'yes'
      }

      objNew['query']  =   getNestedProperty(dynamicFormData, 'query')


      setFormData((prevState: any) => ({
        ...prevState,
        ...objNew
      }))
    }
  }, [dynamicFormData, formfields])

  // useEffect(() => {
  //   console.log('IN>>>')
  //   if (dynamicFormDataNew) {
  //     const _formData: any = { ...formData }
  //     formfields?.[0]?.inputs?.map((item: any) => {
  //       if (item['input_field_name'] == 'enquiry_form' || item['input_field_name'] == 'registration_form') {
  //         _formData[item.input_field_name] = getDefaultValue(item)
  //       } else {
  //         if (item?.['input_type'] == 'masterDropdown') {
  //           checkDependentValue(getNestedProperty(dynamicFormDataNew, item['input_field_name'] + '.id'), item)
  //           _formData[item.input_field_name] = getNestedProperty(dynamicFormDataNew, item['input_field_name'] + '.id')
  //           _formData[item.input_field_name + '.id'] = getNestedProperty(
  //             dynamicFormDataNew,
  //             item['input_field_name'] + '.id'
  //           )
  //           _formData[item.input_field_name + '.value'] = getNestedProperty(
  //             dynamicFormDataNew,
  //             item['input_field_name'] + '.value'
  //           )
  //         } else {
  //           checkDependentValue(getNestedProperty(dynamicFormDataNew, item.input_field_name), item)
  //           _formData[item.input_field_name] =
  //             getNestedProperty(dynamicFormDataNew, item.input_field_name) || item.input_default_value
  //         }
  //       }
  //     })

  //     console.log('_formData>>>', _formData)
  //     setFormData(_formData)

  //   }
  // }, [dynamicFormDataNew, formfields,masterDropDownOptions])

  const handleAddMore = (name: string, data: any) => {
    if (formData?.[data?.['input_field_name']]) {
      const id = Date.now()
      const arr = formData?.[data?.['input_field_name']]?.push({
        id,
        value: data?.['input_is-multiple'] ? data?.['input_default_value'].split(',') : getDefaultValue(data) || ''
      })

      setFormData((item: any) => ({
        ...item,
        [name]: formData?.[data?.['input_field_name']]
      }))
    } else {
      setFormData((item: any) => ({
        ...item,
        [name]: [
          {
            id: Date.now(),
            value: data?.['input_is-multiple'] ? data?.['input_default_value'].split(',') : getDefaultValue(data) || ''
          }
        ]
      }))
    }
  }
  const handleRemove = (name: string, id: any) => {
    const updatedFields = formData?.[name].filter((item: any) => item?.id !== id)
    setFormData((item: any) => ({
      ...item,
      [name]: updatedFields
    }))
  }

  const handleGroupAddMore = (name: string, data: any) => {
    const keys = Object.keys(sectionFields)
    keys.forEach(key => {
      const inputFields = sectionFields[key]
      const groupInputs = inputFields.filter((entry: any) => entry?.validations[7]?.validation === true)

      const uniquegroupInputs = new Set()

      // Extract unique input_ids
      groupInputs.forEach((entry: any) => {
        if (entry.input_id) {
          uniquegroupInputs.add(entry)
        }
      })

      setSectionFields((prevState: any) => ({
        ...prevState,
        null: [...prevState[key], ...uniquegroupInputs]
      }))
    })
  }

  const handleGroupRemoveMore = (name: string, data: any) => {
    const keys = Object.keys(sectionFields)
    keys.forEach(key => {
      const inputFields = sectionFields[key]
      const groupInputs = inputFields.filter((entry: any) => entry?.validations[7]?.validation === true)

      const uniquegroupInputs = new Set()

      // Extract unique input_ids
      groupInputs.forEach((entry: any) => {
        if (entry.input_id) {
          uniquegroupInputs.add(entry)
        }
      })

      uniquegroupInputs.forEach((entry: any) => {
        const index = inputFields.indexOf(entry)
        // console.log('index' + entry)
        // console.log(index)
        inputFields.splice(index, 1)
        setSectionFields((prevState: any) => ({
          ...prevState,
          null: inputFields
        }))
      })
    })
  }
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

  const isFieldVisible = (data: any) => {
    if (data?.['input_dependent_field'] === null) {
      return true
    } else {
      const arr = dependentField?.[data?.['input_dependent_field']]
      const found = arr.find((obj: any) => obj.hasOwnProperty(data?.['input_name']))

      return found?.display
    }
  }

  const checkDependentValue = (value: any, item: any) => {
    const input = dependentField
    const _dependentFields = input?.[item?.['input_name']] ?? null;

    _dependentFields?.forEach((obj: any) => {
      for (const key in obj) {
        if (key !== 'display')
          if (obj[key] === null) {
            if (value !== '') {
              obj.display = true
            } else {
              obj.display = false
            }
          } else if (JSON.parse(obj[key]) !== null) {
            if (JSON.parse(obj[key]) === value) {
              obj.display = true
            } else if (
              JSON.parse(obj[key])?.['type'] === 'date' &&
              moment(JSON.parse(obj[key])?.['start']).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') ===
                moment(value).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
            ) {
              obj.display = true
            } else if (
              JSON.parse(obj[key])?.['type'] === 'time' &&
              moment(JSON.parse(obj[key])?.['start']).format('HH:mm:ss') === moment(value).format('HH:mm:ss')
            ) {
              obj.display = true
            } else {
              obj.display = false
            }
          } else {
            obj.display = false
          }
      }
    })
    setDependentField((val: any) => ({
      ...val,
      [item?.['input_name']]: _dependentFields
    }))
  }

  function findObjectById(array: any, id: any) {
    return array?.find((obj: any) => obj.id === id)
  }

  //   useEffect(()=>{

  //     formfields?.[0]?.inputs?.map((item: any) => {
  //       console.log('>>MMLL',formData[item['input_field_name']]);
  //       checkDependentValue(formData[item['input_field_name']],item)

  // return true
  //     })

  //   //  if(formfields.length && formData?.parent_type ){
  //   //   debugger
  //   //      const dd = getObjectByKeyVal(formfields[0]?.inputs,'input_field_name','parent_type')
  //   //     checkDependentValue(formData['parent_type'],dd)

  //   //  }

  //   },[formData ,formfields])
  const handleErrorClose = ()=>{
    window.location.reload()
  }
  
  const handleChange = async (
    name: string,
    value: any,
    validations: Array<{
      validation: boolean
      type: string
      error_message: string
      min: number
      max: number
      regexFormat?: RegExp
    }>,
    isRepeatable: boolean,
    id: any = '',
    item: any = null
  ) => {
    let uniqueError:any 
    // if(((enquiryTypeData?.slug != 'ivtEnquiry' && enquiryTypeData?.slug != 'reAdmission') && pathname == '/enquiries/create/' && (name?.includes('mobile') || name?.includes('email')) && value.length >= 10)){
    //   const type = name?.includes('mobile') ? 'mobile_no' : 'email';
    //   const res:any =  await checkiFContactUnique(value,type)
      
    //   if(res){
    //     uniqueError = 'Field must be unique'
    //   }
    // }
    setFormTouched(true)
    checkDependentValue(value, item)
    const error = checkValidations(validations, value)
    if (isRepeatable) {
      const updatedFields = formData?.[name]?.map((field: { id: any }) =>
        field.id === id ? { ...field, value: value } : field
      )
      
      if (updatedFields) {
        setFormData((item: any) => ({
          ...item,
          [name]: updatedFields,
          error: {
            ...formData.error,
            [name]: error
          }
        }))
      } else {
        setFormData((item: any) => ({
          ...item,
          [name]: [{ id: Date.now(), value: value }],
          error: {
            ...formData.error,
            [name]: error
          }
        }))
      }
    } else {
      // if (item.input_type == 'masterDropdown') {
      //   const newObj = findObjectById(masterDropDownOptions[item.input_field_name], value)
      //   if (item.input_field_name in dependentField) {
      //     UpdateDependentDropDownInputs(name)
      //   }
      //   setFormData((item: any) => ({
      //     ...item,
      //     [name + '.id']: value,
      //     [name + '.value']:
      //       newObj?.attributes.name || newObj?.attributes.description || Object?.values(newObj?.attributes)[0],
      //     error: {
      //       ...formData.error,
      //       [name]: error
      //     }
      //   }))
      // }
      if (item.input_type === 'masterDropdown') {
        let options = masterDropDownOptions?.[item.input_field_name] || [] // Ensure options is an array
        const newObj = options.length > 0 ? findObjectById(options, value) : null // Find the object safely

        if (item.input_field_name in dependentField) {
          UpdateDependentDropDownInputs(name)
        }

        if (item.input_field_name == "previous school academic year"){

          options = masterDropDownOptions?.[item?.input_field_name].filter((item:any) => item?.id < formData['academic_year.id']) || masterDropDownOptions?.[item.input_field_name] || [];
        }

        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [`${name}.id`]: value,
          [`${name}.value`]: newObj
            ? newObj.attributes.name || newObj.attributes.description || Object.values(newObj.attributes)[0]
            : '', // Handle null or undefined newObj
          error: {
            ...prevFormData.error,
            [name]: error
          }
        }))
      } else if (item.input_type == 'masterDropdownExternal') {
        let newObj: any = {}
        if (item?.type && item?.type == 'kidsclucb') {
          newObj = getObjectByKeyVal(item.msterOptions, item.key[0], value)
        } else if(item?.type == 'extFields'){
          newObj = getObjectByKeyValNew(item.msterOptions, item.keyMap, value)
        } else {
          newObj = findObjectById(item.msterOptions, value)
        }

        // if (item.input_field_name in dependentField) {
        //   UpdateDependentDropDownInputs(name)
        // }
        let valueee: any
        if (item?.type && item?.type == 'enquiryDetails') {
          valueee = newObj?.name
        } else {
          // alert(JSON.stringify(newObj))
          switch (name) {
            case 'enquiry_mode':
              valueee = newObj?.attributes?.mode
              break

            case 'enquiry_source_type':
              valueee = newObj?.attributes?.type
              break

            case 'enquiry_source':
              valueee = newObj?.attributes?.enquiry_source?.data?.attributes?.source
              break

            case 'enquiry_sub_source':
              valueee = newObj?.attributes?.enquiry_sub_source?.data?.attributes?.source
              break
// Nikhil
            case 'enquiry_employee_source':
              valueee = newObj?.id
              break 

            case 'enquiry_parent_source':
              valueee = newObj?.id
              break
              case 'enquiry_school_source':
              valueee = newObj?.id
              break
              case 'enquiry_corporate_source':
              valueee = newObj?.id
              break
            case 'kids_club_type':
              valueee = newObj?.fee_sub_type
              break

            case 'kids_club_batch':
              valueee = newObj?.batch_name
              break

            case 'kids_club_period_of_service':
              valueee = newObj?.period_of_service
              break

            case 'kids_club_month':
              valueee = newObj?.fee_category
              break

            case 'kids_club_from_cafeteria_opt_for':
              valueee = newObj?.fee_subcategory
              break

            case 'psa_sub_type':
              valueee = newObj?.fee_sub_type
              break

            case 'psa_category':
              valueee = newObj?.fee_category
              break

            case 'psa_sub_category':
              valueee = newObj?.fee_subcategory
              break

            case 'period_of_service':
              valueee = newObj?.period_of_service
              break

            case 'psa_batch':
              valueee = newObj?.batch_name
              break

            case 'academic_year':
              valueee = newObj?.name
              break

            default:
              valueee = newObj?.attributes?.name
              break
          }
        }
        setFormData((item: any) => ({
          ...item,
          [name + '.id']: value,
          [name + '.value']: valueee,
          error: {
            ...formData.error,
            [name]: error
          }
        }))
      } else if (item.input_type == 'externalParents') {
        setFormData((item: any) => ({
          ...item,
          [name]: value,
          error: {
            ...formData.error,
            [name]: error
          }
        }))
      } else {
        setFormData((item: any) => ({
          ...item,
          [name]: value,
          error: {
            ...formData.error,
            [name]: error, // || uniqueError
          }
        }))
      }

      if (item?.input_field_name == 'another_student_details.vibgyor_id') {
        setGlobalState({ isLoading: true })
        const params = {
          url: '/studentProfile/getEnrollmentDetail',
          serviceURL: 'admin',
          data: {
            crt_enr_on: value
          }
        }
        try {
          const data: any = await postRequest(params)
          if (data?.success) {
            //if (name == 'sibling_details.[0].vibgyor_id') {
            //
            setFormData((item: any) => ({
              ...item,
              ['another_student_details.first_name']: data?.data?.studentProfile?.first_name,
              ['another_student_details.last_name']: data?.data?.studentProfile?.last_name,
              ['another_student_details.dob']: data?.data?.studentProfile?.dob,
              ['another_student_details.gender.id']: data?.data?.studentProfile?.gender_id,
              ['another_student_details.gender.value']: data?.data?.studentProfile?.gender,
              // ['sibling_details.[0].school']: data?.data?.studentProfile?.crt_school,
              ['another_student_details.grade.id']: data?.data?.studentProfile?.crt_grade_id
            }))
            const acYear = getObjectByKeyValNew(
              masterDropDownOptions['academic_year'],
              'attributes.short_name_two_digit',
              data?.data?.studentProfile?.academic_year_id.toString()
            )
            console.log('ACY', acYear, masterDropDownOptions['academic_year'])
            const dataObj = {
              [`academic_year.id`]: acYear?.id,
              [`school_location.id`]: data?.data?.studentProfile?.crt_school_id,
              [`student_details.dob`]: data?.data?.studentProfile?.dob
            }
            getEligibleGrade(dataObj)?.then(resp => {
              setFormData((item: any) => ({
                ...item,
                ['another_student_details.eligible_grade']: resp
              }))
              setGlobalState({ isLoading: false })
            })

            //}

            if (name == 'sibling_details.[1].vibgyor_id') {
              //
              setFormData((item: any) => ({
                ...item,
                ['sibling_details.[1].last_name']: data?.data?.studentProfile?.last_name,
                ['sibling_details.[1].first_name']: data?.data?.studentProfile?.first_name,
                ['sibling_details.[1].dob']: data?.data?.studentProfile?.dob,
                ['sibling_details.[1].gender']: data?.data?.studentProfile?.gender_id,
                ['sibling_details.[1].school']: data?.data?.studentProfile?.crt_school,
                ['sibling_details.[1].grade']: data?.data?.studentProfile?.crt_grade_id
              }))
            }

            if (name == 'sibling_details.[2].vibgyor_id') {
              //
              setFormData((item: any) => ({
                ...item,
                ['sibling_details.[2].last_name']: data?.data?.studentProfile?.last_name,
                ['sibling_details.[2].first_name']: data?.data?.studentProfile?.first_name,
                ['sibling_details.[2].dob']: data?.data?.studentProfile?.dob,
                ['sibling_details.[2].gender']: data?.data?.studentProfile?.gender_id,
                ['sibling_details.[2].school']: data?.data?.studentProfile?.crt_school,
                ['sibling_details.[2].grade']: data?.data?.studentProfile?.crt_grade_id
              }))
            }
          }

          setGlobalState({ isLoading: false })
        } catch (error) {
          console.error('Error fetching products:', error)
          setGlobalState({ isLoading: false })

          return []
        }
      }

      //sibling_details.[0].vibgyor_id
      if (
        item?.input_field_name == 'sibling_details.[0].vibgyor_id' ||
        item?.input_field_name == 'sibling_details.[1].vibgyor_id' ||
        item?.input_field_name == 'sibling_details.[2].vibgyor_id'
      ) {
        setGlobalState({ isLoading: true })
        const params = {
          url: '/studentProfile/getEnrollmentDetail',
          serviceURL: 'admin',
          data: {
            crt_enr_on: value
          }
        }
        try {
          const data: any = await postRequest(params)
          if (data?.success) {
            if (name == 'sibling_details.[0].vibgyor_id') {
              //
              setFormData((item: any) => ({
                ...item,
                [`sibling_details.[0].first_name`]: data?.data?.studentProfile?.first_name,
                [`sibling_details.[0].last_name`]: data?.data?.studentProfile?.last_name,
                ['sibling_details.[0].dob']: data?.data?.studentProfile?.dob,
                ['sibling_details.[0].gender.id']: data?.data?.studentProfile?.gender_id,
                ['sibling_details.[0].gender.value']: data?.data?.studentProfile?.gender,
                ['sibling_details.[0].school']: data?.data?.studentProfile?.crt_school,
                ['sibling_details.[0].grade.id']: data?.data?.studentProfile?.crt_grade_id
              }))
              const acYear = getObjectByKeyValNew(
                masterDropDownOptions['academic_year'],
                'attributes.short_name_two_digit',
                data?.data?.studentProfile?.academic_year_id.toString()
              )
              console.log('ACY', acYear, masterDropDownOptions['academic_year'])
              const dataObj = {
                [`academic_year.id`]: acYear?.id,
                [`school_location.id`]: data?.data?.studentProfile?.crt_school_id,
                [`student_details.dob`]: data?.data?.studentProfile?.dob
              }
              getEligibleGrade(dataObj)?.then(resp => {
                setFormData((item: any) => ({
                  ...item,
                  ['sibling_details.[0].eligible_grade']: resp
                }))
                setGlobalState({ isLoading: false })
              })
            }

            if (name == 'sibling_details.[1].vibgyor_id') {
              setFormData((item: any) => ({
                ...item,
                [`sibling_details.[1].first_name`]: data?.data?.studentProfile?.first_name,
                [`sibling_details.[1].last_name`]: data?.data?.studentProfile?.last_name,
                ['sibling_details.[1].dob']: data?.data?.studentProfile?.dob,
                ['sibling_details.[1].gender.id']: data?.data?.studentProfile?.gender_id,
                ['sibling_details.[1].gender.value']: data?.data?.studentProfile?.gender,
                ['sibling_details.[1].school']: data?.data?.studentProfile?.crt_school,
                ['sibling_details.[1].grade.id']: data?.data?.studentProfile?.crt_grade_id
              }))
              const acYear = getObjectByKeyValNew(
                masterDropDownOptions['academic_year'],
                'attributes.short_name_two_digit',
                data?.data?.studentProfile?.academic_year_id.toString()
              )
              console.log('ACY', acYear, masterDropDownOptions['academic_year'])
              const dataObj = {
                [`academic_year.id`]: acYear?.id,
                [`school_location.id`]: data?.data?.studentProfile?.crt_school_id,
                [`student_details.dob`]: data?.data?.studentProfile?.dob
              }
              getEligibleGrade(dataObj)?.then(resp => {
                setFormData((item: any) => ({
                  ...item,
                  ['sibling_details.[1].eligible_grade']: resp
                }))
                setGlobalState({ isLoading: false })
              })
            }

            if (name == 'sibling_details.[2].vibgyor_id') {
              //
              setFormData((item: any) => ({
                ...item,
                [`sibling_details.[2].first_name`]: data?.data?.studentProfile?.first_name,
                [`sibling_details.[2].last_name`]: data?.data?.studentProfile?.last_name,
                ['sibling_details.[2].dob']: data?.data?.studentProfile?.dob,
                ['sibling_details.[2].gender.id']: data?.data?.studentProfile?.gender_id,
                ['sibling_details.[2].gender.value']: data?.data?.studentProfile?.gender,
                ['sibling_details.[2].school']: data?.data?.studentProfile?.crt_school,
                ['sibling_details.[2].grade.id']: data?.data?.studentProfile?.crt_grade_id
              }))
              const acYear = getObjectByKeyValNew(
                masterDropDownOptions['academic_year'],
                'attributes.short_name_two_digit',
                data?.data?.studentProfile?.academic_year_id.toString()
              )
              console.log('ACY', acYear, masterDropDownOptions['academic_year'])
              const dataObj = {
                [`academic_year.id`]: acYear?.id,
                [`school_location.id`]: data?.data?.studentProfile?.crt_school_id,
                [`student_details.dob`]: data?.data?.studentProfile?.dob
              }
              getEligibleGrade(dataObj)?.then(resp => {
                setFormData((item: any) => ({
                  ...item,
                  ['sibling_details.[2].eligible_grade']: resp
                }))
                setGlobalState({ isLoading: false })
              })
            }
          }

          setGlobalState({ isLoading: false })
        } catch (error) {
          console.error('Error fetching products:', error)
          setGlobalState({ isLoading: false })

          return []
        }
      }

      if (name == 'student_details.dob') {
        console.log('formData>>>>>>>>')
        console.log(formData)
        console.log(formfields)

        const params = {
          url: `marketing/enquiry/eligible-grade?academicYearId=${formData['academic_year.id']}&schoolId=${formData['school_location.id']}&dob=${value}`,
          serviceURL: 'marketing'
        }
        try {
          const data: any = await getRequest(params)

          setFormData((item: any) => ({
            ...item,
            ['student_details.eligible_grade']: data?.data?.eligibleGrade
          }))
        } catch (error) {
          console.error('Error fetching products:', error)
          setGlobalState({ isLoading: false })

          return []
        }
      }

      if (name == 'another_student_details.dob') {
        const data = {
          [`academic_year.id`]: formData['academic_year.id'],
          [`school_location.id`]: formData[`school_location.id`],
          [`student_details.dob`]: value
        }
        getEligibleGrade(data)?.then(resp => {
          setFormData((item: any) => ({
            ...item,
            ['another_student_details.eligible_grade']: resp
          }))
          setGlobalState({ isLoading: false })
        })
      }

      if (name == 'student_details.enrolment_number' && value?.length >= 13) {
        setGlobalState({ isLoading: true })

        const params = {
          //url: '/studentProfile/getEnrollmentDetail',
          url: `marketing/admission/${value}/student-details`
          // serviceURL: 'admin',
          // data: {
          //   crt_enr_on: value
          // }
        }

        try {
          const data: any = await getRequest(params)
          if (data?.status) {
            // const acYear = getObjectByKeyValNew(
            //  acYearList,
            //   'attributes.short_name_two_digit',
            //   data?.data?.academic_year?.id.toString()
            // )
            if(enquiryTypeData?.slug == 'readmission_10_11' && data?.data?.student_details?.grade?.id != 10){
              setOpen10ENRdialog(true);
              setFormData({});
              setGlobalState({ isLoading: false })

              return;
            }
            const acYear =  getObjectByShortNameTwoDigit( data?.data?.academic_year?.id.toString(),acYearList)
            const dataObj = {
              [`academic_year.id`]: acYear?.id,
              [`school_location.id`]: data?.data?.school_location?.id,
              [`student_details.dob`]: data?.data?.student_details?.dob
            }
            const eligibleGrade = getEligibleGrade(dataObj).then((resp: any) => {


              const previousSchoolData = {
                existing_school_details: {
                  name: data?.data?.school_location.value,
                  grade: {
                    id: data?.data?.student_details?.grade?.id,
                    value: data?.data?.student_details?.grade?.value
                  },
                  academic_year: { id: acYear?.id, value: data?.data?.academic_year?.value },
                  board: { id: data?.data?.board?.id, value: data?.data?.board?.value }
                }
              }
              delete data?.data?.student_details.grade
              delete data?.data?.brand
              delete data?.data?.board
              delete data?.data?.course
              delete data?.data?.academic_year
              delete data?.data?.shift
              delete data?.data?.stream

              const finalPayload = {
                ...data?.data,
                student_details: { enrolment_number: value, eligible_grade: resp, ...data?.data?.student_details }
              }
              console.log('finalPayload',finalPayload);


              setDynamicFormData({
                ...finalPayload,
                existing_school_details: previousSchoolData.existing_school_details
              })

              setTimeout(() => {
                setGlobalState({ isLoading: false })
              }, 2000)
            })

            // setFormData((item: any) => ({
            //   ...item,
            //   ['student_details.first_name']: data?.data?.student_details?.first_name,
            //   ['student_details.last_name']: data?.data?.student_details?.last_name,
            //   ['student_details.grade.id']: data?.data?.student_details?.grade.id,
            //   ['student_details.grade.value']: data?.data?.student_details?.grade.value,
            //   ['student_details.gender.id']: data?.data?.student_details?.gender.id,
            //   ['student_details.gender.value']: data?.data?.student_details?.gender.value,
            //   ['student_details.dob']: data?.data?.student_details?.dob,
            //   // -------
            //   ['parent_type']: data?.data?.parent_type,
            //   ['parent_details.father_details.first_name']: data?.data?.parent?.[1]?.first_name,
            //   ['parent_details.father_details.last_name']: data?.data?.parent?.[1]?.last_name,
            //   ['parent_details.father_details.mobile']: data?.data?.parent?.[1]?.mobile,
            //   ['parent_details.father_details.email']: data?.data?.parent?.[1]?.email,
            //   ['parent_details.mother_details.first_name']: data?.data?.parent?.[0]?.mother_details?.first_name,
            //   ['parent_details.mother_details.last_name']: data?.data?.parent?.[0]?.mother_details?.last_name,
            //   ['parent_details.mother_details.mobile']: data?.data?.parent?.[0]?.mother_details?.mobile,
            //   ['parent_details.mother_details.email']: data?.data?.parent?.[0]?.mother_details?.email,
            //   // ------
            //   ['residential_details.permanent_address.street']: data?.data?.address?.street_name,
            //   ['residential_details.permanent_address.landmark']: data?.data?.address?.landmark,
            //   ['residential_details.permanent_address.pin_code']: data?.data?.address?.pin_code,
            //   ['residential_details.permanent_address.country']: data?.data?.address?.country_id
            // }))
          }else{
            setApiResponseType({ status: true, message: 'Student Details Not Found!',handleClose: handleErrorClose})
          }
        } catch (error) {
          console.error('Error fetching products:', error)
          setGlobalState({ isLoading: false })

          return []
        }
      }
      setGlobalState({ isLoading: false })

      if (name == 'academic_year') {
        let schoolEndpoint = null
        if (
          getObjectByKeyVal(masterDropDownOptions[item.input_field_name], 'id', value)?.attributes?.short_name_two_digit
        ) {
          schoolEndpoint = `/api/ac-schools?fields[1]=name&fields[2]=short_name&filters[academic_year_id]=${
            getObjectByKeyVal(masterDropDownOptions[item.input_field_name], 'id', value)?.attributes
              ?.short_name_two_digit
          }`
        } else {
          schoolEndpoint = `/api/ac-schools?fields[1]=name&fields[2]=short_name`
        }
        const params = {
          url: schoolEndpoint,
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }
        const data = await getRequest(params)

        setMasterDropDownOptions((prevState: any) => ({
          ...prevState,
          ['school_location']: data.data
        }))
        setFormData((prevState: any) => ({
          ...prevState,
          ['school_location.id']: null,
          ['school_location.value']: null
        }))
      }

      /*
      //  automatic filling of last name for parent's logic 
      // if (name == 'student_details.last_name') {
      //   setFormData((prevState: any) => ({
      //     ...prevState,
      //     ['parent_details.father_details.last_name']: value,
      //     ['parent_details.mother_details.last_name']: value
      //   }))
      // }  
      */


      // if(name.includes('pin')&& value?.length == 6 ){
      //   console.log("PIN>>");
      //   const params = {
      //     url: `/api/co-pincodes?populate[0]=District_Or_City&populate[1]=State&filters[Pincode][$eq]=401303`,
      //     serviceURL: 'mdm',
      //     headers: {
      //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      //     }
      //   }

      //   const response = await getRequest(params)
      //   if(response?.status){
      //          }
      // }

      setRequiredFields((item: any) => ({
        ...item,
        [name]: value
      }))
    }
  }

  const handleParentFieldChange = (name: string, value: any, validations: any) => {
    setFormData((prevState: any) => ({
      ...prevState,
      [name]: value
    }))
  }

  const UpdateDependentDropDownInputs = async (name: string) => {
    const updates = Object.keys(sectionFields).map(async key => {
      const elements = sectionFields[key]
      for (const element of elements) {
        if (element.input_dependent_field === name) {
          const options = await selectOptions(element.input_default_value)
          setMasterDropDownOptions((prevState: any) => ({
            ...prevState,
            [element.input_field_name]: options
          }))

          const dependentFields: any = dependentField
          dependentFields[element.input_dependent_field].map((dependentElement: any) => {
            dependentElement.display = true
          })
          setDependentField(dependentFields)
        }
      }
    })

    await Promise.all(updates)
  }

  const handleMultiDropdown = (id: any = '', options: any, name: any, isRepeatable: boolean) => {
    if (isRepeatable) {
      const updatedFields: any = formData?.[name]?.map((field: { id: any }) =>
        field.id === id ? { ...field, value: options } : field
      )
      if (updatedFields?.length > 0) {
        setFormData((item: any) => ({
          ...item,
          [name]: updatedFields
        }))
      } else {
        setFormData((item: any) => ({
          ...item,
          [name]: [{ id: Date.now(), value: options }]
        }))
      }
    } else {
      setFormData((item: any) => ({
        ...item,
        [name]: options
      }))
      setRequiredFields((item: any) => ({
        ...item,
        [name]: options
      }))
    }
  }
  const handleRadioChange = (value: any, name: any) => {
    setFormData((item: any) => ({
      ...item,
      [name]: value
    }))
    setRequiredFields((item: any) => ({
      ...item,
      [name]: value
    }))
  }

  const validateGuestStudent = () => {
    const errors: any = {}
    if (formData?.is_guest_student === true) {
      // Check if host school location is selected
      if (!formData['guest_student_details.location.id']) {
        errors['guest_student_details.location'] = 'Host School Location is required for guest students'
      }
      // Check if host school location is different from school location
      if (formData['guest_student_details.location.id'] === formData['school_location.id']) {
        errors['guest_student_details.location'] = 'Host School Location must be different from School Location'
      }
    }

    return Object.keys(errors).length > 0 ? { errors, status: true } : { status: false }
  }
  const validateStudentEnrollment = () => {
    const errors: any = {}
    
    // Only validate for IVT and Re-Admission enquiry types
    if (
      enquiryTypeData?.slug === 'ivtEnquiry' || 
      enquiryTypeData?.slug === 'reAdmission' || 
      enquiryTypeData?.slug === 'readmission_10_11'
    ) {
      if (!formData['student_details.enrolment_number']?.trim()) {
        errors['student_details.enrolment_number'] = 'Enrollment Number is required'
      }
    }
    
    return Object.keys(errors).length > 0 ? { errors, status: true } : { status: false }
  }
  const validatePincodeFormat = () => {
    const errors: any = {}

    const pincodeFields = [
      'residential_details.current_address.pin_code',
      'residential_details.permanent_address.pin_code'
    ]

    pincodeFields.forEach((field) => {
      const pincodeValue = formData[field]
      // Check if pincode is required
      if(field==='residential_details.permanent_address.pin_code'){

      } else {
        if (activeStageName === ENQUIRY_STAGES?.ENQUIRY || slug === 'createContactDetails') {
          // Validate that pincode exists and is exactly 6 digits
          if (!pincodeValue || pincodeValue.trim() === '') {
            errors[field] = 'Fill required fields'
          } else if (!/^\d{6}$/.test(pincodeValue.trim())) {
            errors[field] = 'Pincode must be exactly 6 digits'
          }
        } else {
          // For other stages, if pincode is provided, it must be 6 digits
          if (pincodeValue && pincodeValue.trim() !== '' && !/^\d{6}$/.test(pincodeValue.trim())) {
            errors[field] = 'Pincode must be exactly 6 digits'
          }
        }
      }
    })

    return Object.keys(errors).length > 0 
      ? { errors, status: true } 
      : { status: false }
  }

  const saveFormData = async () => {
    const errors = await validateAllFields();
    const externalErrors = validateExternalFields()
    const externalPSAErrors = validateExternalPSAFields()
    const externalEnquiryErrors = validateExternalEnquiryFields()
    const guestStudentErrors = validateGuestStudent()
    const studentEnrollmentErrors = validateStudentEnrollment()
    const pincodeErrors = validatePincodeFormat()

    let externalParentErrors: any = null
    if (slug == 'registrationProcessStudentParentDetails') {
      externalParentErrors = validateExternalParentFields()
    }
    
    let externalResidentialDetailsErrors: any = null
    if (slug == 'createContactDetails' || activeStageName == ENQUIRY_STAGES?.ENQUIRY) {
      externalResidentialDetailsErrors = validateResidentialFields()
    }
    
    const externalKidsClubEnquiryFields = validateExternalKIdsClubEnquiryFields()
    const uniqueEmailErrors = validateUniqueParentEmails()

    // FIX: Corrected the if condition (was using comma instead of ||)
    if (
      Object.keys(errors).length > 0 ||
      externalErrors?.status ||
      externalEnquiryErrors?.status ||
      externalParentErrors?.status ||
      externalResidentialDetailsErrors?.status ||
      externalKidsClubEnquiryFields?.status ||
      guestStudentErrors?.status ||
      studentEnrollmentErrors?.status ||
      pincodeErrors?.status
    ) {
      // Combine all errors
      const allErrors = {
        ...errors,
        ...externalErrors?.errors,
        ...externalEnquiryErrors?.errors,
        ...externalParentErrors?.errors,
        ...externalResidentialDetailsErrors?.errors,
        ...externalKidsClubEnquiryFields?.errors,
        ...guestStudentErrors?.errors,
        ...studentEnrollmentErrors?.errors,
        ...pincodeErrors?.errors 
      };

      // FIX: Show appropriate toast message (removed duplicate)
      if (pincodeErrors?.status) {
        const pincodeErrorMsg = Object.values(pincodeErrors.errors)[0] as string
        toast.error(pincodeErrorMsg || 'Invalid pincode format')
      } else {
        const errorCount = Object.keys(allErrors).length;
        toast.error(`Please fill ${errorCount} required field${errorCount > 1 ? 's' : ''}`)
      }
      
      // Update form data with all errors
      setFormData((prevState: any) => ({
        ...prevState,
        error: allErrors
      }))

      const paramData = {
        action: false,
        slug: formfields?.[0]?.form?.slug,
        status: false
      }
      
      if (submitPropsFunction) {
        submitPropsFunction(paramData)
        
        // FIX: Simplified error field detection with pincode check
        let errorFieldToScroll = ''
        
        if (Object.keys(errors).length > 0) {
          errorFieldToScroll = Object.keys(errors)[0]
        } else if (pincodeErrors?.status) {
          errorFieldToScroll = Object.keys(pincodeErrors.errors)[0]
        } else if (externalErrors?.status) {
          errorFieldToScroll = Object.keys(externalErrors?.errors)[0]
        } else if (externalEnquiryErrors?.status) {
          errorFieldToScroll = Object.keys(externalEnquiryErrors?.errors)[0]
        } else if (externalParentErrors?.status) {
          errorFieldToScroll = Object.keys(externalParentErrors?.errors)[0]
        } else if (externalResidentialDetailsErrors?.status) {
          errorFieldToScroll = Object.keys(externalResidentialDetailsErrors?.errors)[0]
        } else if (externalKidsClubEnquiryFields?.status) {
          errorFieldToScroll = Object.keys(externalKidsClubEnquiryFields?.errors)[0]
        } else if (guestStudentErrors?.status) {
          errorFieldToScroll = Object.keys(guestStudentErrors?.errors)[0]
        }

        // Scroll to first error field
        if (errorFieldToScroll) {
          const errorElement = document.getElementById(errorFieldToScroll)
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }
      
      return; // Important: Prevent further execution
      
    } else {
      // Form is valid, proceed with submission
      let reqObj: any = {}
      for (const [key, value] of Object.entries(formData)) {
        if (key !== 'error') {
          if (Array.isArray(value)) {
            reqObj = {
              ...reqObj,
              [key]: value.map((item: any) => item?.value || item) || value
            }
          } else {
            reqObj = {
              ...reqObj,
              [key]: value
            }
          }
        }
      }

      //Delete name field of masterdropdown because we are sending values in .id and .value
      const external_fields = [
        'enquiry_mode',
        'enquiry_source_type',
        'enquiry_source',
        'enquiry_sub_source',
        'enquiry_emplopyee_source',
        'psa_sub_type',
        'psa_category',
        'psa_sub_category',
        'psa_batch',
        'period_of_service',
        'kids_club_type',
        'kids_club_batch',
        'kids_club_period_of_service',
        'kids_club_month',
        'kids_club_from_cafeteria_opt_for',
        'academic_year',
        'school_location',
        'board',
        'brand',
        'student_details.grade',
        'shift',
        'course',
        'stream'
      ]

      Object.keys(reqObj).forEach(key => {
        if (key == 'is_guest_student') {
          if (Array.isArray(reqObj[key])) {
            if (reqObj[key].includes('yes')) {
              reqObj[key] = true
            } else {
              reqObj[key] = false
            }
          }
        }
        if (key in masterDropDownOptions) {
          delete reqObj[key]
        }
        if (external_fields?.includes(key)) {
          delete reqObj[key]
        }
      })

      if (Object.keys(appendRequest).length != 0) {
        reqObj = {
          ...reqObj,
          ...(formData?.enquiry_type && {
            enquiry_type: formData?.enquiry_type
          })
        }
      }

      // FIX: Changed assignment (=) to comparison (==)
      if (slug == 'registrationProcessStudentParentDetails') {
        reqObj['parent_details.is_parent_single'] = formData['parent_details.is_parent_single']
        reqObj['parent_details.single_parent_type'] = formData['parent_details.single_parent_type']
        delete reqObj['parent_details.father_details.country']
        delete reqObj['parent_details.father_details.state']
        delete reqObj['parent_details.father_details.city']
        delete reqObj['parent_details.mother_details.country']
        delete reqObj['parent_details.mother_details.state']
        delete reqObj['parent_details.mother_details.city']
        delete reqObj['parent_details.guardian_details.country']
        delete reqObj['parent_details.guardian_details.state']
        delete reqObj['parent_details.guardian_details.city']
        delete reqObj['parent_details.father_details.organization_name.id']
        delete reqObj['parent_details.father_details.organization_name.value']
        delete reqObj['parent_details.mother_details.organization_name.id']
        delete reqObj['parent_details.mother_details.organization_name.value']
        if (typeof reqObj['parent_details.mother_details.organization_name'] == 'object') {
          delete reqObj['parent_details.mother_details.organization_name']
        }
        if (typeof reqObj['parent_details.father_details.organization_name'] == 'object') {
          delete reqObj['parent_details.father_details.organization_name']
        }
      }

      const dataToPass = {
        ...appendRequest,
        data: {
          ...removeObjectNullAndEmptyKeys(reqObj),
          ...(formData?.enquiry_type && {
            enquiry_type: formData?.enquiry_type
          })
        }
      }

      let apiUrl
      let enquiryId = null;

      if (auto) {
        apiUrl = `marketing/enquiry/create`
      } else {
        apiUrl = url
        enquiryId = url?.split('/')?.pop()
      }

      // Handle Lead Reopen
      if (activeStageName == ENQUIRY_STAGES?.ENQUIRY && !skipReopenCheckRef.current) {
        const params = {
          url: `marketing/enquiry/handleReopn`,
          authToken: authToken,
          data: {
            "student_details.first_name": formData['student_details.first_name'],
            "student_details.last_name": formData['student_details.last_name'],
            "student_details.dob": formData['student_details.dob'],
            "academic_year.id": formData['academic_year.id'],
            enquiry_type: formData['enquiry_type'],
            ...((enquiryId && enquiryId !== 'create') && { enquiry_id: enquiryId })
          }
        }
        const response = await postRequest(params)
        if(response?.data?.data?.length > 0){
          setHandleLeadReopnData(response?.data)
          setOpenReopenDialog(true);
          setGlobalState({ isLoading: false })

          return;
        }
      }

      let resp
      if (requestParams && requestParams.reqType == 'PATCH') {
        resp = await patchRequest({ url: apiUrl, data: dataToPass })
      } else {
        if (activeStageName == ENQUIRY_STAGES?.ENQUIRY && enquiryTypeData?.slug == 'readmission_10_11' && formData?.enquiry_type && formData['student_details.enrolment_number']) {
          const params = {
            url: `marketing/enquiry/getDublicateEnquiry/enr`,
            authToken: authToken,
            data: {
              enrollment: formData['student_details.enrolment_number'],
              enquiryType: formData?.enquiry_type
            }
          }

          const response = await patchRequest(params)
          if(response?.data.length > 0){
            setOpenDublicateIVTenquiry(true);
            setDublicateEnquiry(response?.data[0].enquiry_number);
            setGlobalState({ isLoading: false })
            
            return;
          }
        }

        resp = await postRequest({ url: apiUrl, data: dataToPass })
      }
      
      if (submitPropsFunction) {
        const paramData = {
          action: false,
          slug: formfields?.[0]?.form?.slug,
          status: resp.status,
          data: resp?.data
        }
        submitPropsFunction(paramData)
      }
    }
  }
  

  useEffect(() => {
    if (submitProp) {
      saveFormData()
      if(setSubmitProp){
        setSubmitProp(false)
      }
    }
  }, [submitProp])




  const handleFiles = (file: any, name: any, isRepeatable: boolean, id: any = '') => {
    if (isRepeatable) {
      const convertedFiles = file.map((_file: any) => ({
        name: _file.name,
        type: _file.type,
        link: URL.createObjectURL(_file)
      }))
      const updatedFields = formData?.[name]?.map((field: { id: any }) =>
        field.id === id ? { ...field, value: convertedFiles } : field
      )
      if (updatedFields) {
        setFormData((item: any) => ({
          ...item,
          [name]: updatedFields
        }))
      } else {
        setFormData((item: any) => ({
          ...item,
          [name]: [{ id: Date.now(), value: convertedFiles }]
        }))
      }
    } else {
      const convertedFiles = file.map((_file: any) => ({
        name: _file.name,
        type: _file.type,
        link: URL.createObjectURL(_file)
      }))
      setFormData((item: any) => ({
        ...item,
        [name]: convertedFiles
      }))
      setRequiredFields((item: any) => ({
        ...item,
        [name]: convertedFiles
      }))
    }
  }
  const handleDelete = (e: any, name: any, isRepeatable: boolean, id: any = '', index: any = '') => {
    if (isRepeatable) {
      const updatedFields = formData?.[name]?.[index]?.value?.filter((item: any) => item?.name !== e.name)
      setFormData((item: any) => ({
        ...item,
        [name]: updatedFields
      }))
    } else {
      const arr = formData?.[name]?.filter((item: any) => item?.name !== e.name)
      setFormData((item: any) => ({
        ...item,
        [name]: arr
      }))
    }
  }
  const getAcceptedFileTypes = (files: any) => {
    let res = {}
    if (files.includes('PDF')) {
      res = {
        ...res,
        'application/pdf': []
      }
    }
    if (files.includes('PNG')) {
      res = {
        ...res,
        'image/png': []
      }
    }
    if (files.includes('JPEG')) {
      res = {
        ...res,
        'image/jpeg': []
      }
    }
    if (files.includes('gif')) {
      res = {
        ...res,
        'image/gif': []
      }
    }

    return res
  }
  const handleCheckbox = (value: any, name: any, isRepeatable: boolean, id: any = '', index: any = '', item: any) => {
    const arr: any = []
    checkDependentValue(value, item)

    if (isRepeatable) {
      if (formData?.[name]?.[index]?.value?.includes(value)) {
        const filteredArray = formData?.[name]?.[index]?.value?.filter((item: any) => item !== value)
        const updatedFields = formData?.[name]?.map((field: { id: any }) =>
          field.id === id ? { ...field, value: filteredArray } : field
        )
        setFormData((item: any) => ({
          ...item,
          [name]: updatedFields
        }))
      } else {
        arr.push(value)
        const updatedFields = formData?.[name]?.map((field: { id: any }) =>
          field.id === id
            ? {
                ...field,
                value: [...arr, ...(formData?.[name]?.[index]?.value || [])]
              }
            : field
        )
        if (updatedFields) {
          setFormData((item: any) => ({
            ...item,
            [name]: updatedFields
          }))
        } else {
          setFormData((item: any) => ({
            ...item,
            [name]: [{ id: Date.now(), value: arr }]
          }))
        }
      }
    } else {
      if (Array.isArray(formData?.[name]) && formData?.[name]?.includes(value)) {
        const filteredArray = formData?.[name]?.filter((item: any) => item !== value)
        checkDependentValue(filteredArray[0], item)
        setFormData((item: any) => ({
          ...item,
          [name]: filteredArray
        }))
        setRequiredFields((item: any) => ({
          ...item,
          [name]: filteredArray
        }))
      } else {
        arr.push(value)
        setFormData((item: any) => ({
          ...item,
          [name]: [...arr, ...(Array.isArray(formData?.[name]) ? formData[name] : [])]
        }))

        setRequiredFields((item: any) => ({
          ...item,
          [name]: [...arr, ...(Array.isArray(formData?.[name]) ? formData[name] : [])]
        }))
      }
    }
  }

  // const checkRequiredFields = () => {
  //   for (const [key, value] of Object.entries(requiredFields)) {
  //     if (value === "" || value === undefined) {
  //       return true;
  //     }
  //   }
  // };
  const checkerrorMessage = () => {
    const obj = formData?.error || {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== '') {
        return true
      }
    }
  }

  const handleformValidation = () => {
    if (formTouched) {
      if (checkerrorMessage()) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }
  const handleClose = () => {
    // handleRoleDialog(false)
    router.push('/dynamic-form-listing/')
  }
  const renderExternalFields = () => {
    return (
      <>
        <Grid item xs={12} sx={{ mb: '30px' }}>
          <Divider />
        </Grid>
        <Grid item container xs={12} spacing={5}>
          <Grid item xs={4} md={4}>
            <EnquiryMode
              handleChange={handleChange}
              val={formData['enquiry_mode.id']}
              setFormData={setFormData}
              formData={formData}
              validation={validationArray}
              infoDialog={infoDialog}
              enquiryType={enquiryTypeData?.slug}
            />
          </Grid>
          <Grid item xs={4} md={4}>
            <EnquirySourceType
              handleChange={handleChange}
              val={formData['enquiry_source_type.id']}
              setFormData={setFormData}
              formData={formData}
              validation={validationArray}
              infoDialog={infoDialog}
              enquiryType={enquiryTypeData?.slug}
            />
          </Grid>
          <Grid item xs={4} md={4}>
            <EnquirySource
              handleChange={handleChange}
              val={formData['enquiry_source.id']}
              enquirySource={formData['enquiry_source_type.id']}
              setFormData={setFormData}
              formData={formData}
              validation={validationArray}
              infoDialog={infoDialog}
              enquiryType={enquiryTypeData?.slug}
            />
          </Grid>
          <Grid item xs={4} md={4}>
            <EnquirySubSource
              handleChange={handleChange}
              val={formData['enquiry_sub_source.id']}
              enquirySubSource={formData['enquiry_source.id']}
              validation={validationArray}
              formData={formData}
              setFormData={setFormData}
              infoDialog={infoDialog}
              enquiryType={enquiryTypeData?.slug}
            />
          </Grid>
{/* Nikhil */}
           {formData['enquiry_sub_source.value'] === 'Employee' && (
            <Grid item xs={4} md={4}>
              <EnquiryEmployeeSource
                handleChange={handleChange}
                val={formData['enquiry_employee_source.id']}
                enquiryEmployeeSource={formData['enquiry_sub_source.id']}
                validation={validationArray}
                formData={formData}
                setFormData={setFormData}
                infoDialog={infoDialog}
              />
            </Grid>
          )}
          {formData['enquiry_sub_source.value'] === 'Parent' && (
            <Grid item xs={4} md={4}>
              <EnquiryParentSource
                handleChange={handleChange}
                val={formData['enquiry_parent_source.id']}
                enquiryParentSource={formData['enquiry_sub_source.id']}
                validation={validationArray}
                formData={formData}
                setFormData={setFormData}
                infoDialog={infoDialog}
              />
            </Grid>
          )}
          {formData['enquiry_sub_source.value'] === 'Corporate' && (
            <Grid item xs={4} md={4}>
              <EnquiryCorporateSource
                handleChange={handleChange}
                val={formData['enquiry_corporate_source.id']}
                enquiryCorporateSource={formData['enquiry_sub_source.id']}
                validation={validationArray}
                formData={formData}
                setFormData={setFormData}
                infoDialog={infoDialog}
              />
            </Grid>
          )}
          {formData['enquiry_sub_source.value'] === 'Pre School' && (
            <Grid item xs={4} md={4}>
              <EnquirySchoolSource
                handleChange={handleChange}
                val={formData['enquiry_school_source.id']}
                enquirySchoolSource={formData['enquiry_sub_source.id']}
                validation={validationArray}
                formData={formData}
                setFormData={setFormData}
                infoDialog={infoDialog}
              />
            </Grid>
          )}
        </Grid>
      </>
    )
  }

  const renderExternalPSAFields = () => {
    return (
      <Grid item container xs={12} spacing={5} sx={{ mt: '15px', mb: '105px' }}>
        <PSAFields
          school={formData['school_location.id']}
          board={formData['board.id']}
          grade={formData['student_details.grade.id']}
          stream={formData['stream.id']}
          course={formData['course.id']}
          academic_year={
            getObjectByKeyVal(masterDropDownOptions['academic_year'], 'id', formData['academic_year.id'])?.attributes
              ?.short_name_two_digit
          }
          handleChange={handleChange}
          setFormData={setFormData}
          formData={formData}
          validation={validationArray}
          psaSubType={formData['psa_sub_type.id']}
          psaCategory={formData['psa_category.id']}
          psaSubCategory={formData['psa_sub_category.id']}
          psaPeriodOfService={formData['period_of_service.id']}
          psaBatch={formData['psa_batch.id']}
        />
      </Grid>
    )

    return (
      <Grid item container xs={12} spacing={5} sx={{ mt: '15px', mb: '105px' }}>
        <Grid item xs={12} md={12}>
          <Typography variant='h6' color={'text.primary'} sx={{ lineHeight: '22px' }}>
            PSA Details
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={4} md={4}>
          <PSASubType
            handleChange={handleChange}
            val={formData['psa_sub_type.id']}
            setFormData={setFormData}
            formData={formData}
            validation={validationArray}
            infoDialog={infoDialog}
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <PSACategory
            handleChange={handleChange}
            val={formData['psa_category.id']}
            psaSubType={formData['psa_sub_type.id']}
            setFormData={setFormData}
            formData={formData}
            validation={validationArray}
            infoDialog={infoDialog}
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <PSASubCategory
            handleChange={handleChange}
            val={formData['psa_sub_category.id']}
            setFormData={setFormData}
            formData={formData}
            validation={validationArray}
            infoDialog={infoDialog}
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <PeriodOfService
            handleChange={handleChange}
            val={formData['period_of_service.id']}
            setFormData={setFormData}
            formData={formData}
            validation={validationArray}
            infoDialog={infoDialog}
          />
        </Grid>
        <Grid item xs={4} md={4}>
          <PSABatch
            handleChange={handleChange}
            val={formData['psa_batch.id']}
            setFormData={setFormData}
            formData={formData}
            validation={validationArray}
            infoDialog={infoDialog}
          />
        </Grid>
      </Grid>
    )
  }

  const renderExternalKidsClubFields = () => {
    return (
      <Grid item container xs={12} spacing={5} sx={{ mt: '15px', mb: '105px' }}>
        <Grid item xs={12}>
          <Divider />
        </Grid>

        <KidsClubFields
          kidsClubType={formData['kids_club_type.id']}
          kidsClubBatch={formData['kids_club_batch.id']}
          kidsClubPeriodOfService={formData['kids_club_period_of_service.id']}
          kidsClubMonth={formData['kids_club_month.id']}
          kidsclubCafeteriaOptFor={formData['kids_club_from_cafeteria_opt_for.id']}
          setFormData={setFormData}
          formData={formData}
          validation={validationArray}
          handleChange={handleChange}
          school={formData['school_location.id']}
          board={formData['board.id']}
          grade={formData['student_details.grade.id']}
          stream={formData['stream.id']}
          course={formData['course.id']}
          academic_year={
            getObjectByKeyVal(masterDropDownOptions['academic_year'], 'id', formData['academic_year.id'])?.attributes
              ?.short_name_two_digit
          }
        />
      </Grid>
    )
  }

  const renderEnquiryDetailsFields = () => {
    return (
      <>
        <Grid item xs={12} sx={{ mb: '30px' }}>
          <Typography variant='h6' color={'text.primary'} sx={{ lineHeight: '22px' }}>
            Enquiry Details
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ mb: '30px' }}>
          <Divider />
        </Grid>
        <Grid item container xs={12} spacing={5} sx={{ mt: '15px' }}>
          <EnquiryDetails
            isIVT={enquiryTypeData?.slug == 'ivtEnquiry' || enquiryTypeData?.slug == 'reAdmission'  || enquiryTypeData?.slug == 'readmission_10_11' ? true : false}
            ivtType={enquiryTypeData?.slug}
            activeStageName={activeStageName}
            validationArray={validationArray}
            handleChange={handleChange}
            formData={formData}
            infoDialog={infoDialog}
            academicYear={formData['academic_year.id']}
            schoolLocation={formData['school_location.id']}
            brand={formData['brand.id']}
            board={formData['board.id']}
            grade={formData['student_details.grade.id']}
            shift={formData['shift.id']}
            course={formData['course.id']}
            stream={formData['stream.id']}
            setFormData={setFormData}
            isRegistration={slug == 'enquiryStudentDetailRegistrationForm'}
          />
        </Grid>
      </>
    )
  }

  const renderKidsClubEnquiryDetailsFields = () => {
    return (
      <>
        <Grid item xs={12} sx={{ mb: '30px' }}>
          <Typography variant='h6' color={'text.primary'} sx={{ lineHeight: '22px' }}>
            Enquiry Details
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ mb: '30px' }}>
          <Divider />
        </Grid>
        <Grid item container xs={12} spacing={5}>
          <KidsClubEnquiryDetails
            activeStageName={activeStageName}
            validationArray={validationArray}
            handleChange={handleChange}
            formData={formData}
            infoDialog={infoDialog}
            academicYear={formData['academic_year.id']}
            schoolLocation={formData['school_location.id']}
          />
        </Grid>
      </>
    )
  }

  const renderParentDetails = () => {
    return (
      <ParentsDetails
        formData={formData}
        handleChange={handleChange}
        validationArray={validationArray}
        handleParentFieldChange={handleParentFieldChange}
        setFormData={setFormData}
      />
    )
  }

  return (
    <>
      {/* <div>{formfields?.[0]?.form?.name}</div> */}
      <Toaster position="top-right" />
      <Grid container xs={12} spacing={7} style={{ marginTop: '5px' }}>
        <Grid item xs={12}>
          <Box sx={{ width: '5%', mt: 1, float: 'right' }}>
            <IconButton
              disableFocusRipple
              disableTouchRipple
              color='secondary'
              onClick={() => setInfoDialog(prev => !prev)}
            >
              <InfoIcon style={{ color: '#FA5A7D' }} />
            </IconButton>
          </Box>
          {slug == 'registrationProcessStudentParentDetails' ? renderParentDetails() : null}
          {slug == 'enquiryStudentDetailRegistrationForm' ||
          slug == 'createEnquiryNewAdmissionTestForm' ||
          enquiryTypeData?.slug == 'externalUserNewAdmissionWebsite' ||
          slug == 'ivtEnquiryForm' ||
          slug == 'readmissionEnquiryForm' ||
          slug == 'X_XI_reAdmissionForm' ||
          slug == 'enquiryStudentDetailRegistrationForm'
            ? renderEnquiryDetailsFields()
            : null}
          {enquiryTypeData && enquiryTypeData?.slug == 'externalUserKidsClub'
            ? renderKidsClubEnquiryDetailsFields()
            : null}
        </Grid>
        {Object.keys(sectionFields).map((mainSection, index) => (
          <Grid key={index} item container xs={12} spacing={5}>
            {mainSection != 'null' ? (
              <Grid item xs={12} md={12}>
                <Typography variant='h6' color={'text.primary'} sx={{ lineHeight: '22px' }}>
                  {mainSection}
                </Typography>
              </Grid>
            ) : null}
            <Grid item xs={12}>
              <Divider />
            </Grid>

            {sectionFields[mainSection] &&
              sectionFields[mainSection].map((item: any, dataIndex: number) => (
                <>
                  {isFieldVisible(item) ? (
                    <Grid
                      key={dataIndex}
                      item
                      xs={12}
                      md={
                        item?.['input_type'] === 'radio' ||
                        item?.['input_field_name'] === 'residential_details.is_permanent_address'
                          ? 12
                          : 4
                      }
                    >
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'text' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <IconButton
                                color='default'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <span className='icon-add-circle'></span>
                              </IconButton>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <TextField
                                    type='text'
                                    fullWidth
                                    placeholder={item?.['input_placeholder']}
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
                                    id={item?.['input_field_name']}
                                    name={item?.['input_field_name']}
                                    value={formData?.[item?.['input_field_name']]?.[inx]?.value}
                                    onChange={e =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        e.target.value,
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        _text?.id,
                                        item
                                      )
                                    }
                                    className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                    InputProps={{
                                      readOnly: item?.validations?.[10]?.validation ? true : false
                                    }}
                                    key={dataIndex}
                                    error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                    helperText={
                                      formData?.error?.[item?.['input_field_name']]
                                        ? formData?.error?.[item?.['input_field_name']]
                                        : ``
                                    }
                                    required={item?.validations?.[0]?.validation}
                                  />
                                  {inx !== 0 && (
                                    <IconButton
                                      color='default'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <span className='icon-close-circle'></span>
                                    </IconButton>

                                    // <Button
                                    //   variant='contained'
                                    //   color='secondary'
                                    //   onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                    //   disableFocusRipple
                                    //   disableTouchRipple
                                    // >
                                    //   <Remove />
                                    // </Button>
                                  )}
                                </>
                              ))
                            ) : item?.['input_id'] === 'mobilenumber' || item?.['input_id'] === 'mobile' ? (
                              <PhoneNumberInput
                                label={item?.['input_label']}
                                helperText={false}
                                error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                required={true}
                                handleOnChange={handleChange}
                                item={item}
                              />
                            ) : item['input_field_name']?.includes('mobile') ? (
                              <PhoneNumberField
                                required={item?.validations?.[0]?.validation}
                                countryCodeVal={
                                  formData[`${item['input_field_name']?.replace(/\.[^.]+$/, '.country_code')}`]
                                }
                                placeholder={item?.['input_placeholder']}
                                id={item?.['input_field_name']}
                                name={item?.['input_field_name']}
                                value={formData?.[item?.['input_field_name']] || ''}
                                label={item?.['input_label']}
                                onChange={handleChange}
                                item={item}
                                setFormData={setFormData}
                                formData={formData}
                                error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                helperText={
                                  formData?.error?.[item?.['input_field_name']]
                                    ? formData?.error?.[item?.['input_field_name']]
                                    : ``
                                }
                              />
                            ) : (
                              <TextField
                                type='text'
                                required={item?.validations?.[0]?.validation}
                                fullWidth
                                sx={{
                                  ...(item?.validations?.[8]?.validation && {
                                    display: 'none'
                                  })
                                }}
                                className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                placeholder={item?.['input_placeholder']}
                                // label={item?.['input_label']}
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
                                id={item?.['input_field_name']}
                                name={item?.['input_field_name']}
                                value={formData?.[item?.['input_field_name']] || ''}
                                InputProps={{
                                  readOnly: item?.validations?.[10]?.validation ? true : false
                                }}
                                onChange={e =>
                                  handleChange(
                                    item?.['input_field_name'],
                                    e.target.value,
                                    item?.validations,
                                    item?.validations?.[6]?.validation,
                                    '',
                                    item
                                  )
                                }
                                key={dataIndex}
                                error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                helperText={
                                  formData?.error?.[item?.['input_field_name']]
                                    ? formData?.error?.[item?.['input_field_name']]
                                    : ``
                                }
                              />
                            )}
                          </>
                        )}
                      {!item?.validations?.[7]?.validation && item?.['input_type'] === 'file' && (
                        <>
                          {item?.validations?.[6]?.validation && (
                            <Button
                              variant='contained'
                              color='secondary'
                              onClick={() => handleAddMore(item?.['input_field_name'], item)}
                              disableFocusRipple
                              disableTouchRipple
                            >
                              <AddIcon />
                            </Button>
                          )}
                          {item?.validations?.[6]?.validation && formData?.[item?.['input_field_name']]?.length > 0 ? (
                            formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                              <>
                                <DropzoneWrapper>
                                  <Grid container spacing={6} className='match-height'>
                                    <Grid item xs={12}>
                                      <Fragment>
                                        <div
                                          {...getRootProps({
                                            className: 'dropzone'
                                          })}
                                        >
                                          <input
                                            {...getInputProps({
                                              name: item?.['input_field_name']
                                            })}
                                          />
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              flexDirection: ['column', 'column', 'row'],
                                              alignItems: 'center'
                                            }}
                                          >
                                            <Img width={300} alt='Upload img' src='/images/misc/upload.png' />
                                            <Box
                                              sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                textAlign: ['center', 'center', 'inherit']
                                              }}
                                            >
                                              <HeadingTypography variant='h5'>
                                                Drop files here or click to upload.
                                              </HeadingTypography>
                                              <Typography
                                                color='textSecondary'
                                                sx={{
                                                  '& a': {
                                                    color: 'primary.main',
                                                    textDecoration: 'none'
                                                  }
                                                }}
                                              >
                                                Drop files here or click{' '}
                                                <Link href='/' onClick={e => e.preventDefault()}>
                                                  browse
                                                </Link>{' '}
                                                thorough your machine
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </div>
                                        {files.length ? (
                                          <Fragment>
                                            <List>{fileList}</List>
                                            <div className='buttons'>
                                              <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                                                Remove All
                                              </Button>
                                              <Button variant='contained'>Upload Files</Button>
                                            </div>
                                          </Fragment>
                                        ) : null}
                                      </Fragment>
                                    </Grid>
                                  </Grid>
                                </DropzoneWrapper>
                                {/* <FileUpload
                            files={
                              formData?.[item?.["input_field_name"]]?.[inx]
                                ?.value || []
                            }
                            onFileDelete={(e) => {
                              handleDelete(
                                e,
                                item?.["input_field_name"],
                                item?.validations?.[6]?.validation,
                                _text?.id,
                                inx
                              );
                            }}
                            onFileUpload={(e) => {
                              handleFiles(
                                e,
                                item?.["input_field_name"],
                                item?.validations?.[6]?.validation,
                                _text?.id
                              );
                            }}
                            showPreview={true}
                            constraints={{
                              acceptedFileTypes: getAcceptedFileTypes(
                                item?.["input_type_files"]
                              ),
                              maxFiles: item?.["input_type_file-max-size"],
                            }}
                          /> */}

                                {inx !== 0 && (
                                  <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                    disableFocusRipple
                                    disableTouchRipple
                                  >
                                    <Remove />
                                  </Button>
                                )}
                              </>
                            ))
                          ) : (
                            <Fragment>
                              <div
                                {...getRootProps({
                                  className: 'dropzone'
                                })}
                              >
                                <input
                                  {...getInputProps({
                                    name: item?.['input_field_name']
                                  })}
                                />
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: ['column', 'column', 'row'],
                                    alignItems: 'center'
                                  }}
                                >
                                  <Img width={300} alt='Upload img' src='/images/misc/upload.png' />
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      textAlign: ['center', 'center', 'inherit']
                                    }}
                                  >
                                    <HeadingTypography variant='h5'>
                                      Drop files here or click to upload.
                                    </HeadingTypography>
                                    <Typography
                                      color='textSecondary'
                                      sx={{
                                        '& a': {
                                          color: 'primary.main',
                                          textDecoration: 'none'
                                        }
                                      }}
                                    >
                                      Drop files here or click{' '}
                                      <Link href='/' onClick={e => e.preventDefault()}>
                                        browse
                                      </Link>{' '}
                                      thorough your machine
                                    </Typography>
                                  </Box>
                                </Box>
                              </div>
                              {files.length ? (
                                <Fragment>
                                  <List>{fileList}</List>
                                  <div className='buttons'>
                                    <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                                      Remove All
                                    </Button>
                                    <Button variant='contained'>Upload Files</Button>
                                  </div>
                                </Fragment>
                              ) : null}
                            </Fragment>

                            // <FileUpload
                            //   files={formData?.[item?.["input_field_name"]] || []}
                            //   onFileDelete={(e) => {
                            //     handleDelete(
                            //       e,
                            //       item?.["input_field_name"],
                            //       item?.validations?.[6]?.validation
                            //     );
                            //   }}
                            //   onFileUpload={(e) => {
                            //     handleFiles(
                            //       e,
                            //       item?.["input_field_name"],
                            //       item?.validations?.[6]?.validation
                            //     );
                            //   }}
                            //   showPreview={true}
                            //   constraints={{
                            //     acceptedFileTypes: getAcceptedFileTypes(
                            //       item?.["input_type_files"]
                            //     ),
                            //     maxFiles: item?.["input_type_file-max-size"],
                            //   }}
                            // />
                          )}
                        </>
                      )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'masterDropdown' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 &&
                            masterDropDownOptions?.[item.input_field_name] &&
                            masterDropDownOptions?.[item.input_field_name].length ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <MasterDropDown
                                    item={item}
                                    masterDropDownOptions={masterDropDownOptions}
                                    handleChange={handleChange}
                                    formData={formData}
                                    _text={_text}
                                    setMasterDropDownOptions={setMasterDropDownOptions}
                                    formFieldsInput={formfields && formfields?.length ? formfields?.[0]?.inputs : []}
                                    dependentFields={
                                      formfields && formfields?.length ? formfields?.[0]?.dependent_field : []
                                    }
                                    infoDialog={infoDialog}
                                  />
                                  {/* <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
                                        <InputLabel id='dropdown-label'>{item?.['input_label']}</InputLabel>
                                        <Select
                                          fullWidth
                                          labelId='dropdown-label'
                                          name={item?.['input_field_name']}
                                          label={item?.['input_label']}
                                          error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                          onChange={(e: any) =>
                                            handleChange(
                                              item?.['input_field_name'],
                                              e.target.value,
                                              item?.validations,
                                              item?.validations?.[6]?.validation,
                                              _text?.id,
                                              item
                                            )
                                          }
                                        >
                                          {masterDropDownOptions?.[item.input_name] &&
                                          masterDropDownOptions?.[item.input_name].length
                                            ? masterDropDownOptions?.[item.input_name]?.map(
                                                (item: any, index: number) => {
                                                  return (
                                                    <MenuItem key={index} value={item?.id}>
                                                      {item?.attributes?.name}
                                                    </MenuItem>
                                                  )
                                                }
                                              )
                                            : null}
                                        </Select>
                                        <FormHelperText>
                                          {formData?.error?.[item?.['input_field_name']]
                                            ? formData?.error?.[item?.['input_field_name']]
                                            : ``}
                                        </FormHelperText>
                                      </FormControl> */}
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <MasterDropDown
                                item={item}
                                masterDropDownOptions={masterDropDownOptions}
                                handleChange={handleChange}
                                formData={formData}
                                _text={''}
                                setMasterDropDownOptions={setMasterDropDownOptions}
                                formFieldsInput={formfields && formfields?.length ? formfields?.[0]?.inputs : []}
                                dependentFields={
                                  formfields && formfields?.length ? formfields?.[0]?.dependent_field : []
                                }
                                infoDialog={infoDialog}
                              />
                            )}
                          </>
                        )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'textarea' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <TextField
                                    type='text'
                                    size='small'
                                    placeholder={item?.['input_placeholder']}
                                    label={item?.['input_label']}
                                    id={item?.['input_field_name']}
                                    name={item?.['input_field_name']}
                                    value={formData?.[item?.['input_field_name']]?.[inx]?.value}
                                    className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                    onChange={(e: any) =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        e.target.value,
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        _text?.id,
                                        item
                                      )
                                    }
                                    key={dataIndex}
                                    multiline={true}
                                    rows={2}
                                    maxRows={4}
                                    InputProps={{
                                      readOnly: item?.validations?.[10]?.validation ? true : false
                                    }}
                                    error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                    helperText={
                                      formData?.error?.[item?.['input_field_name']]
                                        ? formData?.error?.[item?.['input_field_name']]
                                        : ``
                                    }
                                  />
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <TextField
                                fullWidth
                                type='text'
                                placeholder={item?.['input_placeholder']}
                                label={item?.['input_label']}
                                id={item?.['input_field_name']}
                                name={item?.['input_field_name']}
                                value={formData?.[item?.['input_field_name']]}
                                onChange={(e: any) =>
                                  handleChange(
                                    item?.['input_field_name'],
                                    e.target.value,
                                    item?.validations,
                                    item?.validations?.[6]?.validation,
                                    '',
                                    item
                                  )
                                }
                                className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                key={dataIndex}
                                multiline={true}
                                rows={2}
                                maxRows={4}
                                error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                InputProps={{
                                  readOnly: item?.validations?.[10]?.validation ? true : false
                                }}
                                helperText={
                                  formData?.error?.[item?.['input_field_name']]
                                    ? formData?.error?.[item?.['input_field_name']]
                                    : ``
                                }
                              />
                            )}
                          </>
                        )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'dropdown' &&
                        !item?.['input_is-multiple'] &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
                                    <InputLabel required={item?.validations?.[0]?.validation} id='dropdown-label'>
                                      {item?.['input_label']}
                                    </InputLabel>
                                    <Select
                                      fullWidth
                                      className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                      labelId='dropdown-label'
                                      name={item?.['input_field_name']}
                                      label={item?.['input_label']}
                                      id={item?.['input_field_name']}
                                      value={
                                        formData?.[item?.['input_field_name']]?.[inx]?.value ||
                                        item?.['input_default_value']
                                      }
                                      error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                      IconComponent={DownArrow}
                                      onChange={(e: any) =>
                                        handleChange(
                                          item?.['input_field_name'],
                                          e.target.value,
                                          item?.validations,
                                          item?.validations?.[6]?.validation,
                                          _text?.id,
                                          item
                                        )
                                      }
                                      required={item?.validations?.[0]?.validation}
                                    >
                                      {item?.['input_type_dropdown_options']?.map((item: any, index: number) => (
                                        <MenuItem key={index} value={item.value}>
                                          {item.displayValue}
                                        </MenuItem>
                                      ))}
                                      <MenuItem value={item?.['input_type_master-select']}>
                                        {item?.['input_type_master-select']}
                                      </MenuItem>
                                    </Select>
                                    <FormHelperText>
                                      {formData?.error?.[item?.['input_field_name']]
                                        ? formData?.error?.[item?.['input_field_name']]
                                        : ``}
                                    </FormHelperText>
                                  </FormControl>
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <>
                                <FormControl
                                  fullWidth={
                                    item?.['input_field_name'] === 'residential_details.is_permanent_address'
                                      ? false
                                      : true
                                  }
                                  sx={{ m: 1, minWidth: '32%' }}
                                >
                                  <InputLabel required={item?.validations?.[0]?.validation} id='dropdown-label'>
                                    {item?.['input_label']}
                                  </InputLabel>
                                  <Select
                                    fullWidth
                                    className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                    labelId='dropdown-label'
                                    name={item?.['input_field_name']}
                                    label={item?.['input_label']}
                                    id={item?.['input_field_name']}
                                    IconComponent={DownArrow}
                                    value={
                                      (formData && formData?.[item?.['input_field_name']]) ||
                                      item?.['input_default_value']
                                    }
                                    error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                    onChange={(e: any) =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        e.target.value,
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        '',
                                        item
                                      )
                                    }
                                    required={item?.validations?.[0]?.validation}
                                  >
                                    {item?.['input_type_dropdown_options']?.map((item: any, index: number) => (
                                      <MenuItem key={index} value={item.value}>
                                        {item.displayValue}
                                      </MenuItem>
                                    ))}
                                    <MenuItem value={item?.['input_type_master-select']}>
                                      {item?.['input_type_master-select']}
                                    </MenuItem>
                                  </Select>
                                  <FormHelperText>
                                    <span className={style.errorField}>
                                      {formData?.error?.[item?.['input_field_name']]
                                        ? formData?.error?.[item?.['input_field_name']]
                                        : ``}
                                    </span>
                                  </FormHelperText>
                                </FormControl>
                              </>
                            )}
                          </>
                        )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'dropdown' &&
                        item?.['input_is-multiple'] &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <MultiSelectDropdown
                                    options={item?.['input_type_dropdown_options']?.map((item: any, index: number) => ({
                                      ...item,
                                      label: item.displayValue
                                    }))}
                                    handleMulti={handleMultiDropdown}
                                    dataField={formData?.[item?.['input_field_name']]?.[inx]?.value}
                                    name={item?.['input_field_name']}
                                    fieldId={_text?.id}
                                    isRepeatable={item?.validations?.[6]?.validation}
                                  />
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <MultiSelectDropdown
                                options={item?.['input_type_dropdown_options']?.map((item: any, index: number) => ({
                                  ...item,
                                  label: item.displayValue
                                }))}
                                handleMulti={handleMultiDropdown}
                                dataField={formData?.[item?.['input_field_name']]}
                                name={item?.['input_field_name']}
                                fieldId=''
                                isRepeatable={item?.validations?.[6]?.validation}
                              />
                            )}
                          </>
                        )}

                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'time' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                      className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                      label={item?.['input_label']}
                                      value={formData?.[item?.['input_field_name']]}
                                      name={item?.['input_field_name']}
                                      onChange={e =>
                                        handleChange(
                                          item?.['input_field_name'],
                                          e,
                                          item?.validations,
                                          item?.validations?.[6]?.validation,
                                          _text?.id,
                                          item
                                        )
                                      }
                                    />
                                  </LocalizationProvider>
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <TimePicker
                                    label={item?.['input_label']}
                                    className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                    value={formData?.[item?.['input_field_name']]}
                                    name={item?.['input_field_name']}
                                    onChange={e =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        e,
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        '',
                                        item
                                      )
                                    }
                                  />
                                </LocalizationProvider>
                              </>
                            )}
                          </>
                        )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'timeRange' &&
                        isFieldVisible(item) && (
                          <>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <TimePicker
                                    label={item?.['input_label']}
                                    value={formData?.[item?.['input_field_name']]}
                                    name={item?.['input_field_name']}
                                    onChange={e => handleRadioChange(e, `${item?.['input_field_name']}_start`)}
                                    sx={{ width: '100%' }}
                                  />
                                </LocalizationProvider>
                              </Grid>

                              <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <TimePicker
                                    label={`${item?.['input_label']}-2`}
                                    value={formData?.[item?.['input_field_name']]}
                                    name={item?.['input_field_name']}
                                    onChange={e => handleRadioChange(e, `${item?.['input_field_name']}_end`)}
                                    sx={{ width: '100%' }}
                                  />
                                </LocalizationProvider>
                              </Grid>
                            </Grid>
                          </>
                        )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'date' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <div key={inx} id={item?.['input_field_name']}>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                      className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                      sx={{ width: '100%' }}
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
                                      name={item?.['input_field_name']}
                                      format='DD-MM-YYYY'
                                      value={
                                        formData?.[item?.['input_field_name']]
                                          ? dayjs(formData?.[item?.['input_field_name']])
                                          : item?.validations?.[11]?.validation
                                          ? dayjs()
                                          : null
                                      }
                                      slots={{
                                        openPickerIcon: CalendarIcon
                                      }}
                                      minDate={item?.validations?.[11]?.validation ? dayjs() : undefined}
                                      disabled={item?.validations?.[10]?.validation}
                                      onChange={(e: any) =>
                                        handleChange(
                                          item?.['input_field_name'],
                                          convertDate(e),
                                          item?.validations,
                                          item?.validations?.[6]?.validation,
                                          _text?.id,
                                          item
                                        )
                                      }
                                    ></DatePicker>
                                  </LocalizationProvider>
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div id={item?.['input_field_name']}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    className={formData?.error?.[item?.['input_field_name']] ? 'field-error' : ''}
                                    sx={{ width: '100%' }}
                                    // label={item?.['input_label']}

                                    label={
                                      <>
                                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                          {item?.['input_label']}
                                          {item?.validations?.[0]?.validation ? (
                                            <span style={{ color: 'red' }}> *</span>
                                          ) : null}
                                          {infoDialog && item?.['input_note'] && (
                                            <>
                                              <span>
                                                <Tooltip title={item?.['input_note']}>
                                                  <InfoIcon style={{ color: '#a3a3a3' }} />
                                                </Tooltip>
                                              </span>
                                            </>
                                          )}
                                        </Box>
                                      </>
                                    }
                                    name={item?.['input_field_name']}
                                    value={
                                      formData?.[item?.['input_field_name']]
                                        ? dayjs(formData?.[item?.['input_field_name']])
                                        : item?.validations?.[11]?.validation
                                        ? dayjs()
                                        : null
                                    }
                                    format='DD-MM-YYYY'
                                    // slots={{
                                    //   openPickerIcon: CalendarIcon
                                    // }}
                                    //minDate={item?.validations?.[11]?.validation ? dayjs() : undefined}
                                    maxDate={
                                      item?.['input_label']?.includes('DOB') ? dayjs().subtract(6, 'months') : undefined
                                    }
                                    disabled={item?.validations?.[10]?.validation}
                                    onChange={(e: any) =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        convertDate(e),
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        '',
                                        item
                                      )
                                    }
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
                                {formData?.error?.[item?.['input_field_name']] && (
                                  <span className={style.errorField}>
                                    {formData?.error?.[item?.['input_field_name']]}
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'dateRange' &&
                        isFieldVisible(item) && (
                          <>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    sx={{ width: '100%' }}
                                    label={`${item?.['input_label']}-1`}
                                    name={item?.['input_field_name']}
                                    value={
                                      item?.validations?.[11]?.validation
                                        ? dayjs()
                                        : formData?.[item?.['input_field_name']]
                                    }
                                    minDate={item?.validations?.[11]?.validation ? dayjs() : undefined}
                                    disabled={item?.validations?.[10]?.validation}
                                    onChange={newValue =>
                                      handleRadioChange(newValue, `${item?.['input_field_name']}_start`)
                                    }
                                  />
                                </LocalizationProvider>
                              </Grid>

                              <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    sx={{ width: '100%' }}
                                    label={`${item?.['input_label']}-2`}
                                    name={item?.['input_field_name']}
                                    value={
                                      // formData?.[item?.["input_field_name"]]
                                      item?.validations?.[11]?.validation
                                        ? dayjs()
                                        : formData?.[item?.['input_field_name']]
                                    }
                                    minDate={item?.validations?.[11]?.validation ? dayjs() : undefined}
                                    disabled={item?.validations?.[10]?.validation}
                                    onChange={newValue =>
                                      handleRadioChange(newValue, `${item?.['input_field_name']}_end`)
                                    }
                                  />
                                </LocalizationProvider>
                              </Grid>
                            </Grid>
                          </>
                        )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'checkbox' &&
                        isFieldVisible(item) && (
                          <>
                            <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                              {item?.['input_label']}
                              {infoDialog ? (
                                <span style={{ verticalAlign: 'top', marginLeft: '5px' }}>
                                  <Tooltip title={item?.['input_note']}>
                                    <InfoIcon style={{ color: '#a3a3a3' }} />
                                  </Tooltip>
                                </span>
                              ) : null}
                            </Typography>

                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation && formData?.[item?.['input_field_name']]?.length > 0
                              ? formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                  <>
                                    {item?.['input_type_dropdown_options'] &&
                                      item?.['input_type_dropdown_options'].map(
                                        (
                                          option: {
                                            label: string | undefined
                                            value: unknown
                                          },
                                          optionIndex: React.Key | null | undefined
                                        ) => (
                                          <div key={optionIndex}>
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  checked={formData?.[item?.['input_field_name']]?.[
                                                    inx
                                                  ]?.value?.includes(option.value)}
                                                  name={item?.['input_field_name']}
                                                  value={option.value}
                                                  size='medium'
                                                  onChange={e => {
                                                    handleCheckbox(
                                                      e.target.value,
                                                      item?.['input_field_name'],
                                                      item?.validations?.[6]?.validation,
                                                      _text?.id,
                                                      inx,
                                                      item
                                                    )
                                                  }}
                                                />
                                              }
                                              label={option.label}
                                            />
                                          </div>
                                        )
                                      )}
                                    {inx !== 0 && (
                                      <Button
                                        variant='contained'
                                        color='secondary'
                                        onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                        disableFocusRipple
                                        disableTouchRipple
                                      >
                                        <Remove />
                                      </Button>
                                    )}
                                  </>
                                ))
                              : item?.['input_type_dropdown_options'] &&
                                item?.['input_type_dropdown_options'].map(
                                  (
                                    option: {
                                      label: string | undefined
                                      value: unknown
                                    },
                                    optionIndex: React.Key | null | undefined
                                  ) => (
                                    <div key={optionIndex}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={
                                              Array.isArray(formData?.[item?.['input_field_name']])
                                                ? formData?.[item?.['input_field_name']]?.includes(option.value)
                                                : formData?.[item?.['input_field_name']]
                                            }
                                            name={item?.['input_field_name']}
                                            value={option.value}
                                            size='medium'
                                            onChange={e => {
                                              handleCheckbox(
                                                e.target.value,
                                                item?.['input_field_name'],
                                                item?.validations?.[6]?.validation,
                                                '',
                                                '',
                                                item
                                              )
                                            }}
                                          />
                                        }
                                        label={option.label}
                                      />
                                    </div>
                                  )
                                )}
                          </>
                        )}

                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'radio' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                                    Is Permanent Address Same As Present
                                  </Typography>
                                  <RadioGroup
                                    name={item?.['input_field_name']}
                                    value={formData?.[item?.['input_field_name']]?.[inx]?.value}
                                    onChange={e =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        e.target.value,
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        _text?.id,
                                        item
                                      )
                                    }
                                  >
                                    {item?.['input_type_dropdown_options']
                                      ? (item?.['input_type_dropdown_options']).map((values: any, key: number) => (
                                          <FormControlLabel
                                            key={key}
                                            value={values.value}
                                            control={
                                              <Radio
                                                checked={
                                                  formData?.[item?.['input_field_name']]?.[inx]?.value === values.value
                                                }
                                              />
                                            }
                                            label={values.label}
                                          />
                                        ))
                                      : []}
                                  </RadioGroup>
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <>
                                <Typography variant='body1' sx={{ lineHeight: '24px' }}>
                                  {item?.['input_label']}
                                </Typography>
                                <RadioGroup
                                  row
                                  name={item?.['input_field_name']}
                                  value={formData?.[item?.['input_field_name']] || ''}
                                  onChange={e =>
                                    handleChange(
                                      item?.['input_field_name'],
                                      e.target.value,
                                      item?.validations,
                                      item?.validations?.[6]?.validation,
                                      '',
                                      item
                                    )
                                  }
                                >
                                  {item?.['input_type_dropdown_options']
                                    ? (item?.['input_type_dropdown_options']).map((values: any, key: number) => (
                                        <FormControlLabel
                                          key={key}
                                          value={values.value}
                                          // value={formData?.[item?.['input_field_name']] || ''}
                                          control={
                                            <Radio checked={formData?.[item?.['input_field_name']] === values.value} />
                                          }
                                          label={values.label}
                                        />
                                      ))
                                    : []}
                                </RadioGroup>
                              </>
                            )}
                          </>
                        )}
                      {item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'text' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleGroupAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <TextField
                                    type='text'
                                    fullWidth
                                    placeholder={item?.['input_placeholder']}
                                    label={item?.['input_label']}
                                    id={item?.['input_id']}
                                    name={item?.['input_field_name']}
                                    value={formData?.[item?.['input_field_name']]?.[inx]?.value}
                                    onChange={e =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        e.target.value,
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        _text?.id,
                                        item
                                      )
                                    }
                                    key={dataIndex}
                                    error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                    InputProps={{
                                      readOnly: item?.validations?.[10]?.validation ? true : false
                                    }}
                                    helperText={
                                      formData?.error?.[item?.['input_field_name']]
                                        ? formData?.error?.[item?.['input_field_name']]
                                        : ``
                                    }
                                    required={item?.validations?.[0]?.validation}
                                  />
                                  {/* {inx !== 0 && ( */}
                                  <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={() => handleGroupRemoveMore(item?.['input_field_name'], dataIndex)}
                                    disableFocusRipple
                                    disableTouchRipple
                                  >
                                    <Remove />
                                  </Button>
                                  {/* )} */}
                                </>
                              ))
                            ) : item?.['input_id'] === 'mobilenumber' || item?.['input_id'] === 'mobile' ? (
                              <PhoneNumberInput
                                label={item?.['input_label']}
                                helperText={false}
                                required={true}
                                handleOnChange={handleChange}
                                item={item}
                              />
                            ) : (
                              <TextField
                                type='text'
                                required={item?.validations?.[0]?.validation}
                                fullWidth
                                placeholder={item?.['input_placeholder']}
                                label={item?.['input_label']}
                                id={item?.['input_id']}
                                name={item?.['input_field_name']}
                                value={formData?.[item?.['input_field_name']]}
                                onChange={e =>
                                  handleChange(
                                    item?.['input_field_name'],
                                    e.target.value,
                                    item?.validations,
                                    item?.validations?.[6]?.validation,
                                    '',
                                    item
                                  )
                                }
                                key={dataIndex}
                                error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                InputProps={{
                                  readOnly: item?.validations?.[10]?.validation ? true : false
                                }}
                                helperText={
                                  formData?.error?.[item?.['input_field_name']]
                                    ? formData?.error?.[item?.['input_field_name']]
                                    : ``
                                }
                              />
                            )}
                          </>
                        )}

                      {item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'date' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                      sx={{ width: '100%' }}
                                      label='date'
                                      name={item?.['input_field_name']}
                                      format='YYYY-MM-DD'
                                      value={
                                        formData?.[item?.['input_field_name']]
                                          ? dayjs(formData?.[item?.['input_field_name']])
                                          : item?.validations?.[11]?.validation
                                          ? dayjs()
                                          : null
                                      }
                                      minDate={item?.validations?.[11]?.validation ? dayjs() : undefined}
                                      disabled={item?.validations?.[10]?.validation}
                                      onChange={(e: any) =>
                                        handleChange(
                                          item?.['input_field_name'],
                                          convertDate(e),
                                          item?.validations,
                                          item?.validations?.[6]?.validation,
                                          _text?.id,
                                          item
                                        )
                                      }
                                    ></DatePicker>
                                  </LocalizationProvider>
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    sx={{ width: '100%' }}
                                    label={item?.['input_label']}
                                    name={item?.['input_field_name']}
                                    minDate={item?.validations?.[11]?.validation ? dayjs() : undefined}
                                    value={
                                      formData?.[item?.['input_field_name']]
                                        ? dayjs(formData?.[item?.['input_field_name']])
                                        : item?.validations?.[11]?.validation
                                        ? dayjs()
                                        : null
                                    }
                                    disabled={item?.validations?.[10]?.validation}
                                    format='YYYY-MM-DD'
                                    onChange={(e: any) =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        convertDate(e),
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        '',
                                        item
                                      )
                                    }
                                  ></DatePicker>
                                </LocalizationProvider>
                              </>
                            )}
                          </>
                        )}

                      {item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'date_time' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                      sx={{ width: '100%' }}
                                      label='date'
                                      name={item?.['input_field_name']}
                                      format='DD/MM/YY HH:mm'
                                      value={
                                        formData?.[item?.['input_field_name']]
                                          ? dayjs(formData?.[item?.['input_field_name']])
                                          : null
                                      }
                                      onChange={(e: any) =>
                                        handleChange(
                                          item?.['input_field_name'],
                                          convertDate(e),
                                          item?.validations,
                                          item?.validations?.[6]?.validation,
                                          _text?.id,
                                          item
                                        )
                                      }
                                    ></DateTimePicker>
                                  </LocalizationProvider>
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DateTimePicker
                                    sx={{ width: '100%' }}
                                    label={item?.['input_label']}
                                    name={item?.['input_field_name']}
                                    value={
                                      formData?.[item?.['input_field_name']]
                                        ? dayjs(formData?.[item?.['input_field_name']])
                                        : null
                                    }
                                    format='DD/MM/YY HH:mm'
                                    onChange={(e: any) =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        convertDate(e),
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        '',
                                        item
                                      )
                                    }
                                  ></DateTimePicker>
                                </LocalizationProvider>
                              </>
                            )}
                          </>
                        )}

                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'date_time' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                      sx={{ width: '100%' }}
                                      label='date'
                                      name={item?.['input_field_name']}
                                      format='DD/MM/YY HH:mm'
                                      value={
                                        formData?.[item?.['input_field_name']]
                                          ? dayjs(formData?.[item?.['input_field_name']])
                                          : null
                                      }
                                      slots={{
                                        openPickerIcon: CalendarIcon
                                      }}
                                      onChange={(e: any) =>
                                        handleChange(
                                          item?.['input_field_name'],
                                          convertDate(e),
                                          item?.validations,
                                          item?.validations?.[6]?.validation,
                                          _text?.id,
                                          item
                                        )
                                      }
                                    ></DateTimePicker>
                                  </LocalizationProvider>
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DateTimePicker
                                    sx={{ width: '100%' }}
                                    label={item?.['input_label']}
                                    name={item?.['input_field_name']}
                                    value={
                                      formData?.[item?.['input_field_name']]
                                        ? dayjs(formData?.[item?.['input_field_name']])
                                        : null
                                    }
                                    format='DD/MM/YY HH:mm'
                                    // slots={{
                                    //   openPickerIcon: CalendarIcon
                                    // }}

                                    onChange={(e: any) =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        convertDate(e),
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        '',
                                        item
                                      )
                                    }
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
                                  ></DateTimePicker>
                                </LocalizationProvider>
                              </>
                            )}
                          </>
                        )}

                      {item?.validations?.[5]?.validation &&
                        item?.['input_type'] === 'range' &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[5]?.validation && (
                              <>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    sx={{ width: '100%' }}
                                    label={item?.['input_label']}
                                    name={item?.['input_field_name']}
                                    value={
                                      formData?.[item?.['input_field_name']]
                                        ? dayjs(formData?.[item?.['input_field_name']])
                                        : item?.validations?.[11]?.validation
                                        ? dayjs()
                                        : null
                                    }
                                    format='DD/MM/YYYY'
                                    minDate={dayjs(item?.validations?.[5]?.min) || dayjs().startOf('day')}
                                    maxDate={dayjs(item?.validations?.[5]?.max) || null}
                                    disabled={item?.validations?.[10]?.validation}
                                    onChange={(e: any) =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        convertDate(e),
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        '',
                                        item
                                      )
                                    }
                                  ></DatePicker>
                                </LocalizationProvider>
                              </>
                            )}
                          </>
                        )}

                      {item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'dropdown' &&
                        !item?.['input_is-multiple'] &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
                                    <InputLabel id='dropdown-label'>{item?.['input_label']}</InputLabel>
                                    <Select
                                      fullWidth
                                      labelId='dropdown-label'
                                      name={item?.['input_field_name']}
                                      label={item?.['input_label']}
                                      id={item?.['input_id']}
                                      value={
                                        formData?.[item?.['input_field_name']]?.[inx]?.value ||
                                        item?.['input_default_value']
                                      }
                                      error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                      onChange={(e: any) =>
                                        handleChange(
                                          item?.['input_field_name'],
                                          e.target.value,
                                          item?.validations,
                                          item?.validations?.[6]?.validation,
                                          _text?.id,
                                          item
                                        )
                                      }
                                    >
                                      {item?.['input_type_dropdown_options']?.map((item: any, index: number) => (
                                        <MenuItem key={index} value={item.value}>
                                          {item.displayValue}
                                        </MenuItem>
                                      ))}
                                      <MenuItem value={item?.['input_type_master-select']}>
                                        {item?.['input_type_master-select']}
                                      </MenuItem>
                                    </Select>
                                    <FormHelperText>
                                      {formData?.error?.[item?.['input_field_name']]
                                        ? formData?.error?.[item?.['input_field_name']]
                                        : ``}
                                    </FormHelperText>
                                  </FormControl>
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <>
                                <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
                                  <InputLabel id='dropdown-label'>{item?.['input_label']}</InputLabel>
                                  <Select
                                    fullWidth
                                    labelId='dropdown-label'
                                    name={item?.['input_field_name']}
                                    label={item?.['input_label']}
                                    id={item?.['input_id']}
                                    value={
                                      (formData && formData?.[item?.['input_field_name']]) ||
                                      item?.['input_default_value']
                                    }
                                    error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                    onChange={(e: any) =>
                                      handleChange(
                                        item?.['input_field_name'],
                                        e.target.value,
                                        item?.validations,
                                        item?.validations?.[6]?.validation,
                                        '',
                                        item
                                      )
                                    }
                                  >
                                    {item?.['input_type_dropdown_options']?.map((item: any, index: number) => (
                                      <MenuItem key={index} value={item.value}>
                                        {item.displayValue}
                                      </MenuItem>
                                    ))}
                                    <MenuItem value={item?.['input_type_master-select']}>
                                      {item?.['input_type_master-select']}
                                    </MenuItem>
                                  </Select>
                                  <FormHelperText>
                                    {formData?.error?.[item?.['input_field_name']]
                                      ? formData?.error?.[item?.['input_field_name']]
                                      : ``}
                                  </FormHelperText>
                                </FormControl>
                              </>
                            )}
                          </>
                        )}
                      {item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'dropdown' &&
                        item?.['input_is-multiple'] &&
                        isFieldVisible(item) && (
                          <>
                            {item?.validations?.[6]?.validation && (
                              <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => handleAddMore(item?.['input_field_name'], item)}
                                disableFocusRipple
                                disableTouchRipple
                              >
                                <AddIcon />
                              </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <MultiSelectDropdown
                                    options={item?.['input_type_dropdown_options']?.map((item: any, index: number) => ({
                                      ...item,
                                      label: item.displayValue
                                    }))}
                                    handleMulti={handleMultiDropdown}
                                    dataField={formData?.[item?.['input_field_name']]?.[inx]?.value}
                                    name={item?.['input_field_name']}
                                    fieldId={_text?.id}
                                    isRepeatable={item?.validations?.[6]?.validation}
                                  />
                                  {inx !== 0 && (
                                    <Button
                                      variant='contained'
                                      color='secondary'
                                      onClick={() => handleRemove(item?.['input_field_name'], _text?.id)}
                                      disableFocusRipple
                                      disableTouchRipple
                                    >
                                      <Remove />
                                    </Button>
                                  )}
                                </>
                              ))
                            ) : (
                              <MultiSelectDropdown
                                options={item?.['input_type_dropdown_options']?.map((item: any, index: number) => ({
                                  ...item,
                                  label: item.displayValue
                                }))}
                                handleMulti={handleMultiDropdown}
                                dataField={formData?.[item?.['input_field_name']]}
                                name={item?.['input_field_name']}
                                fieldId=''
                                isRepeatable={item?.validations?.[6]?.validation}
                              />
                            )}
                          </>
                        )}
                    </Grid>
                  ) : null}
                </>
              ))}
          </Grid>
        ))}
        <Grid item xs={12} container justifyContent='flex-end'>
          {slug == 'createContactDetails' || activeStageName == ENQUIRY_STAGES?.ENQUIRY ? (
            <ResidentislDetails
              activeStageName={activeStageName}
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              handleParentFieldChange={handleParentFieldChange}
            />
          ) : null}
          {externalPSAFields ? renderExternalPSAFields() : null}
          {externalKidsClubFields ? renderExternalKidsClubFields() : null}
          {attachExternalFields || slug == 'enquiryStudentDetailRegistrationForm' ? (
            <Grid 
              key={enquiryTypeData?.slug || 'default'} 
              item 
              xs={12} 
              sx={{ mb: '30px' }}
            >
              {renderExternalFields()}
            </Grid>
          ) : null}
          {activeStageName == ENQUIRY_STAGES?.ENQUIRY ? (
            <Grid item container xs={12} spacing={5}>
              <Grid item xs={4} md={8}>
                <FormControl fullWidth variant='outlined' sx={{ position: 'relative', marginTop: '20px' }}>
                  <FormLabel
                    sx={{
                      position: 'absolute',
                      top: '-8px',
                      left: '12px',
                      background: 'white',
                      padding: '0 4px',
                      fontSize: '14px',
                      color: '#666666'
                    }}
                  >
                    Query
                  </FormLabel>
                  <TextareaAutosize
                    value={formData?.query}
                    onChange={(e: any) => {
                      setFormData((prevState: any) => {
                        return {
                          ...prevState,
                          query: e.target.value
                        }
                      })
                    }}
                    minRows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      color: '#666666'
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          ) : null}
          {queryTesxtBox ? (
            <Grid item container xs={12} spacing={5}>
              <Grid item xs={4} md={8}>
                <FormControl fullWidth variant='outlined' sx={{ position: 'relative', marginTop: '20px' }}>
                  <FormLabel
                    sx={{
                      position: 'absolute',
                      top: '-8px',
                      left: '12px',
                      background: 'white',
                      padding: '0 4px',
                      fontSize: '14px',
                      color: '#666666'
                    }}
                  >
                    Query
                  </FormLabel>
                  <TextareaAutosize
                    value={formData?.query}
                    onChange={(e: any) => {
                      setFormData((prevState: any) => {
                        return {
                          ...prevState,
                          query: e.target.value
                        }
                      })
                    }}
                    minRows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      color: '#666666'
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          ) : null}
          <Button
            variant='contained'
            color='secondary'
            onClick={saveFormData}
            disableFocusRipple
            disableTouchRipple
            disabled={handleformValidation()}
            sx={{ display: 'none' }}
          >
            Save
          </Button>
        </Grid>
      </Grid>
      {/* <Modal
        open={openDublicateschild}
        onClose={() => setOpenDublicateschild(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 6,
            p: 4,
            textAlign: 'center',
            border: 'none'
          }}
        >
          <Typography
            id='modal-modal-title'
            variant='h5'
            component='h2'
            sx={{ fontWeight: 'bold', color: 'error.main' }}
          >
            {enquiryTypeData?.slug == 'readmission_10_11'? 'Not A Vibgyor Student':'Student Already Exists'}
          </Typography>

          <Typography id='modal-modal-description' sx={{ mt: 2, fontSize: '1rem', color: 'text.secondary' }}>
            {enquiryTypeData?.slug == 'readmission_10_11'? 'PLease Enter Active Vibgyor Student':'Please continue with the existing enquiry.'}

          </Typography>
        </Box>
      </Modal> */}
      <LeadReopenedDialog
        openDialog={openReopenDialog}
        handleClose={() => setOpenReopenDialog(false)}
        leadData={handleLeadReopnData}
        skipReopenCheckRef={skipReopenCheckRef}
        saveFormData={saveFormData}
      />
      <Modal
        open={open10ENRdialog}
        onClose={() => setOpen10ENRdialog(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 0,
            border: 'none',
            overflow: 'hidden'
          }}
        >
          {/* Header with icon */}
          <Box
            sx={{
              bgcolor: 'error.light',
              p: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                sx={{
                  fontSize: '2rem',
                  color: 'error.main'
                }}
              >
                ⚠️
              </Typography>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography
              id='modal-modal-title'
              variant='h5'
              component='h2'
              sx={{ 
                fontWeight: 'bold', 
                color: 'text.primary',
                mb: 2
              }}
            >
              Access Restricted
            </Typography>
            <Typography
              id='modal-modal-description'
              variant='body1'
              sx={{ 
                color: 'text.secondary',
                mb: 4
              }}
            >
              This form is only available for 10th grade students.
            </Typography>

            {/* Action Button */}
            <Button
              variant='contained'
              color='primary'
              fullWidth
              onClick={() => setOpen10ENRdialog(false)}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openDublicateIVTenquiry}
        onClose={() => setOpenDublicateIVTenquiry(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 6,
            p: 4,
            textAlign: 'center',
            border: 'none'
          }}
        >
          <Typography
            id='modal-modal-title'
            variant='h5'
            component='h2'
            sx={{ fontWeight: 'bold', color: 'error.main' }}
          >
            Enquiry Already Exists
          </Typography>

          <Typography id='modal-modal-description' sx={{ mt: 2, fontSize: '1rem', color: 'text.secondary' }}>
            Please continue with the existing enquiry {dublicateEnquiry}.
          </Typography>
        </Box>
      </Modal>
    </>
  )
}
