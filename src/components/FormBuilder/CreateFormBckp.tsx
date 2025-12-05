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
  Divider
} from '@mui/material'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import AddIcon from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import { Fragment, useEffect, useState, useCallback } from 'react'
import MultiSelectDropdown from './MultiSelect'
import { getRequest, patchRequest, postRequest } from '../../services/apiService'
import moment from 'moment'
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
import { convertDate, getNestedProperty, removeObjectNullAndEmptyKeys } from 'src/utils/helper'
import dayjs from 'dayjs'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { type } from 'os'
import style from '../../pages/stages/stage.module.css'
import EnquirySourceType from './ExternalFields/EnquirySourceType'
import EnquirySource from './ExternalFields/EnquirySource'
import EnquirySubSource from './ExternalFields/EnquirySubSource'
import EnquiryMode from './ExternalFields/EnquiryMode'

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
  attachExternalFields
}: CreateProps) {
  const [formfields, setFormfields] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [requiredFields, setRequiredFields] = useState<any>({})
  const [dependentField, setDependentField] = useState<any>(null)
  const [files, setFiles] = useState<File[]>([])
  const [sectionFields, setSectionFields] = useState<any>({})
  const [formTouched, setFormTouched] = useState<any>(false)
  const [masterDropDownOptions, setMasterDropDownOptions] = useState<any>([])
  const { setGlobalState } = useGlobalContext()

  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
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
    console.log('params>>', params)
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
        console.log('setMasterDropDownOptions>>>', options)
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

  const formDataVal = watch()

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
  useEffect(() => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `/form-builder/form/` + slug,
      serviceURL: 'admin'
    }
    getRequest(params).then((data: any) => {
      console.log('FFFF', data?.data)
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

  console.log('DATA', sectionFields, formTouched)
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

  const validateAllFields = () => {
    const fields = formfields[0]?.inputs
    let isValid = true

    const errors: any = {}

    fields.map((field: any, index: number) => {
      const value =
        field.input_type == 'masterDropdown'
          ? formData[field.input_field_name + '.id']
            ? formData[field.input_field_name + '.id']
            : formData[field.input_field_name] && formData[field.input_field_name].includes('api')
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

    return errors
  }

  const validateExternalFields = () => {
    const errors: any = {}

    const external_fields = ['enquiry_mode', 'enquiry_source_type', 'enquiry_source', 'enquiry_sub_source']
    external_fields?.map((val: any, index: number) => {
      const error = checkValidations(validationArray, formData[`${val}.id`])
      if (error) {
        if (error) {
          errors[val] = error
        }
      }
    })
    if (Object.keys(errors).length > 0 && attachExternalFields) {
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
    let _formData = {}
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
    })

    // setRequiredFields(_formData);
    setFormData(_formData)
  }, [formfields])

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
            checkDependentValue(getNestedProperty(dynamicFormData, item.input_field_name), item)
            _formData[item.input_field_name] =
              getNestedProperty(dynamicFormData, item.input_field_name) || item.input_default_value
          }
        }
      })

      if (attachExternalFields) {
        const external_fields = ['enquiry_mode', 'enquiry_source_type', 'enquiry_source', 'enquiry_sub_source']
        external_fields?.map((val: any) => {
          _formData[val] = getNestedProperty(dynamicFormData, val + '.id')
          _formData[val + '.id'] = getNestedProperty(dynamicFormData, val + '.id')
          _formData[val + '.value'] = getNestedProperty(dynamicFormData, val + '.value')
        })
      }
      console.log('_formData>>>', _formData)
      setFormData(_formData)
    }
  }, [dynamicFormData, formfields])

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
        console.log('index' + entry)
        console.log(index)
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
      errorMessage: string
      min: number
      max: number
    }>,
    value: any
  ) => {
    let error = ''
    if (validations?.[0]?.validation) {
      error = validateRequiredField(value, validations?.[0]?.errorMessage)
    }
    if (error === '') {
      if (validations?.[1]?.validation) {
        error = validateNumericField(value, validations?.[1]?.errorMessage)
      }
      if (validations?.[3]?.validation) {
        error = validateEmailField(value, validations?.[3]?.errorMessage)
      }
      if (validations?.[2]?.validation) {
        error = validateAlphaNumericField(value, validations?.[2]?.errorMessage)
      }
      if (validations?.[4]?.validation) {
        error = validateMobileNoField(value, validations?.[4]?.errorMessage)
      }
      if (validations?.[5]?.validation) {
        error = validateRangeField(value, validations?.[4]?.errorMessage, validations?.[4]?.min, validations?.[4]?.max)
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
      console.log('Display>>', found)

      return found?.display
    }
  }

  const checkDependentValue = (value: any, item: any) => {
    const input = dependentField
    console.log('input', input, item)
    const _dependentFields = input[item?.['input_name']]
    console.log('---1----', _dependentFields, value)
    console.log(2112, item?.['input_field_name'])

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
            console.log(
              '--1111--',
              obj[key]?.start,
              JSON.parse(obj[key])?.['start'],
              typeof JSON.parse(obj[key]),
              value
            )
          } else {
            console.log(11, key, obj[key])
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

  const handleChange = async (
    name: string,
    value: any,
    validations: Array<{
      validation: boolean
      type: string
      errorMessage: string
      min: number
      max: number
    }>,
    isRepeatable: boolean,
    id: any = '',
    item: any = null
  ) => {
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
      if (item.input_type == 'masterDropdown') {
        const newObj = findObjectById(masterDropDownOptions[item.input_field_name], value)
        if (item.input_field_name in dependentField) {
          UpdateDependentDropDownInputs(name)
        }
        setFormData((item: any) => ({
          ...item,
          [name + '.id']: value,
          [name + '.value']:
            newObj?.attributes.name || newObj?.attributes.description || Object.values(newObj?.attributes)[0],
          error: {
            ...formData.error,
            [name]: error
          }
        }))
      } else if (item.input_type == 'masterDropdownExternal') {
        const newObj = findObjectById(item.msterOptions, value)
        // if (item.input_field_name in dependentField) {
        //   UpdateDependentDropDownInputs(name)
        // }
        let valueee: any
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
      } else {
        setFormData((item: any) => ({
          ...item,
          [name]: value,
          error: {
            ...formData.error,
            [name]: error
          }
        }))
      }

      setRequiredFields((item: any) => ({
        ...item,
        [name]: value
      }))
    }
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

  const saveFormData = async () => {
    const errors = validateAllFields()
    const externalErrors = validateExternalFields()
    console.log('isValid>>>', errors)

    if (Object.keys(errors).length > 0 || externalErrors?.status) {
      setFormData((prevState: any) => ({
        ...prevState,
        error: { ...errors, ...externalErrors?.errors }
      }))

      const paramData = {
        action: false,
        slug: formfields?.[0]?.form?.slug,
        status: false
      }
      if (submitPropsFunction) {
        submitPropsFunction(paramData)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
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

      //Delete name field of masterdrodown beacuse id are sending values in .id and  .value
      const external_fields = ['enquiry_mode', 'enquiry_source_type', 'enquiry_source', 'enquiry_sub_source']

      Object.keys(reqObj).forEach(key => {
        if (key == 'is_guest_student') {
          if (Array.isArray(reqObj[key])) {
            if (reqObj[key].includes('yes')) {
              reqObj[key] = true
            } else {
              reqObj[key] = false
            }
          } else {
            reqObj[key] = false
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
          ...(formData?.enquiry_type && { enquiry_type: formData?.enquiry_type }),
          ...appendRequest
        }
      }

      const inputFields = formfields?.[0]?.inputs?.map((item: any) => item?.['input_field_name'])

      const dataToPassOld = {
        data: {
          TableName: formfields?.[0]?.form?.collection_name,
          storeData: reqObj,
          db_type: formfields?.[0]?.form?.db_type
        }
      }
      const dataToPass = {
        ...appendRequest,
        data: {
          ...removeObjectNullAndEmptyKeys(reqObj),
          ...(formData?.enquiry_type && { enquiry_type: formData?.enquiry_type })
        }
      }

      let apiUrl

      if (auto) {
        apiUrl = `marketing/enquiry/create`
      } else {
        apiUrl = url
      }

      let resp
      if (requestParams && requestParams.reqType == 'PATCH') {
        resp = await patchRequest({ url: apiUrl, data: dataToPass })
      } else {
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
    console.log('chhhh', item, value)
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
      console.log('CheckBB123', formData?.[name])
      if (Array.isArray(formData?.[name]) && formData?.[name]?.includes(value)) {
        const filteredArray = formData?.[name]?.filter((item: any) => item !== value)
        console.log('FG', filteredArray)
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

  const renderExternalFields = () => {
    return (
      <>
        <Grid item container xs={12} spacing={5}>
          <Grid item xs={4} md={4}>
            <EnquiryMode
              handleChange={handleChange}
              val={formData['enquiry_source_type']}
              setFormData={setFormData}
              formData={formData}
              validation={validationArray}
            />
          </Grid>
          <Grid item xs={4} md={4}>
            <EnquirySourceType
              handleChange={handleChange}
              val={formData['enquiry_source_type']}
              setFormData={setFormData}
              formData={formData}
              validation={validationArray}
            />
          </Grid>
          <Grid item xs={4} md={4}>
            <EnquirySource
              handleChange={handleChange}
              val={formData['enquiry_source']}
              enquirySource={formData['enquiry_source_type']}
              setFormData={setFormData}
              formData={formData}
              validation={validationArray}
            />
          </Grid>

          <Grid item xs={4} md={4}>
            <EnquirySubSource
              handleChange={handleChange}
              val={formData['enquiry_sub_source']}
              enquirySubSource={formData['enquiry_source']}
              validation={validationArray}
              formData={formData}
            />
          </Grid>
        </Grid>
      </>
    )
  }

  return (
    <>
      {/* <div>{formfields?.[0]?.form?.name}</div> */}
      <Grid container xs={12} spacing={7} style={{ marginTop: '5px' }}>
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
                    <Grid key={dataIndex} item xs={12} md={item?.['input_type'] === 'radio' ? 12 : 4}>
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

                              // <Button
                              //   variant='contained'
                              //   color='secondary'
                              //   onClick={() => handleAddMore(item?.['input_field_name'], item)}
                              //   disableFocusRipple
                              //   disableTouchRipple
                              // >
                              //   <AddIcon />
                              // </Button>
                            )}
                            {item?.validations?.[6]?.validation &&
                            formData?.[item?.['input_field_name']]?.length > 0 ? (
                              formData?.[item?.['input_field_name']]?.map((_text: any, inx: any) => (
                                <>
                                  <TextField
                                    type='text'
                                    fullWidth
                                    {...(item?.['input_field_name'] == 'enquiry_number' ||
                                      (item?.['input_field_name']?.includes('.global_id') && { disabled: true }))}
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
                              <>
                                <PhoneNumberInput
                                  label={item?.['input_label']}
                                  required={true}
                                  error={Boolean(formData?.error?.[item?.['input_field_name']])}
                                  handleOnChange={handleChange}
                                  item={item}
                                />
                                <FormHelperText>
                                  <span className={style.errorField}>
                                    {formData?.error?.[item?.['input_field_name']]
                                      ? formData?.error?.[item?.['input_field_name']]
                                      : ``}
                                  </span>
                                </FormHelperText>
                              </>
                            ) : (
                              <TextField
                                type='text'
                                required={item?.validations?.[0]?.validation}
                                {...((item?.['input_field_name'] == 'enquiry_number' ||
                                  item?.['input_field_name']?.includes('.global_id')) && { disabled: true })}
                                fullWidth
                                sx={{ ...(item?.validations?.[8]?.validation && { display: 'none' }) }}
                                placeholder={item?.['input_placeholder']}
                                label={item?.['input_label']}
                                id={item?.['input_id']}
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
                                        <div {...getRootProps({ className: 'dropzone' })}>
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
                                    formFieldsInput={[]}
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
                            ) : masterDropDownOptions?.[item.input_field_name] &&
                              masterDropDownOptions?.[item.input_field_name].length ? (
                              <MasterDropDown
                                item={item}
                                masterDropDownOptions={masterDropDownOptions}
                                handleChange={handleChange}
                                formData={formData}
                                _text={''}
                                setMasterDropDownOptions={setMasterDropDownOptions}
                                formFieldsInput={[]}
                              />
                            ) : // <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
                            //   <InputLabel id='dropdown-label'>{item?.['input_label']}</InputLabel>
                            //   <Select
                            //     fullWidth
                            //     labelId='dropdown-label'
                            //     name={item?.['input_field_name']}
                            //     label={item?.['input_label']}
                            //     id={item?.['input_id']}
                            //     error={Boolean(formData?.error?.[item?.['input_field_name']])}
                            //     onChange={(e: any) =>
                            //       handleChange(
                            //         item?.['input_field_name'],
                            //         e.target.value,
                            //         item?.validations,
                            //         item?.validations?.[6]?.validation,
                            //         '',
                            //         item
                            //       )
                            //     }
                            //   >
                            //     {masterDropDownOptions?.[item.input_name] &&
                            //     masterDropDownOptions?.[item.input_name].length
                            //       ? masterDropDownOptions?.[item.input_name]?.map((item: any, index: number) => {
                            //           return (
                            //             <MenuItem key={index} value={item?.id}>
                            //               {item?.attributes?.name}
                            //             </MenuItem>
                            //           )
                            //         })
                            //       : null}
                            //   </Select>
                            //   <FormHelperText>
                            //     {formData?.error?.[item?.['input_field_name']]
                            //       ? formData?.error?.[item?.['input_field_name']]
                            //       : ``}
                            //   </FormHelperText>
                            // </FormControl>
                            null}
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
                                    id={item?.['input_id']}
                                    name={item?.['input_field_name']}
                                    value={formData?.[item?.['input_field_name']]?.[inx]?.value}
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
                                id={item?.['input_id']}
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
                                key={dataIndex}
                                multiline={true}
                                rows={2}
                                maxRows={4}
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
                                      labelId='dropdown-label'
                                      name={item?.['input_field_name']}
                                      label={item?.['input_label']}
                                      id={item?.['input_id']}
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
                                <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
                                  <InputLabel required={item?.validations?.[0]?.validation} id='dropdown-label'>
                                    {item?.['input_label']}
                                  </InputLabel>
                                  <Select
                                    fullWidth
                                    labelId='dropdown-label'
                                    name={item?.['input_field_name']}
                                    label={item?.['input_label']}
                                    id={item?.['input_id']}
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
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <TimePicker
                                label={item?.['input_label']}
                                value={formData?.[item?.['input_field_name']]}
                                name={item?.['input_field_name']}
                                onChange={e => handleRadioChange(e, `${item?.['input_field_name']}_start`)}
                              />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <TimePicker
                                label={`${item?.['input_label']}-2`}
                                value={formData?.[item?.['input_field_name']]}
                                name={item?.['input_field_name']}
                                onChange={e => handleRadioChange(e, `${item?.['input_field_name']}_end`)}
                              />
                            </LocalizationProvider>
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
                                <>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                      sx={{ width: '100%' }}
                                      label='date'
                                      name={item?.['input_field_name']}
                                      format='DD-MM-YYYY'
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
                                    {...(item?.['input_field_name'] == 'enquiry_date' && { minDate: dayjs() })}
                                    value={
                                      formData?.[item?.['input_field_name']]
                                        ? dayjs(formData?.[item?.['input_field_name']])
                                        : null
                                    }
                                    format='DD-MM-YYYY'
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
                                  ></DatePicker>
                                </LocalizationProvider>
                              </>
                            )}
                          </>
                        )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'dateRange' &&
                        isFieldVisible(item) && (
                          <>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                sx={{ width: '100%' }}
                                label={`${item?.['input_label']}-1`}
                                name={item?.['input_field_name']}
                                value={formData?.[item?.['input_field_name']]}
                                onChange={e => handleRadioChange(e, `${item?.['input_field_name']}_start`)}
                              ></DatePicker>
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                sx={{ width: '100%' }}
                                label={`${item?.['input-label']}-2`}
                                name={item?.['input_field_name']}
                                value={formData?.item?.['input_field_name']}
                                onChange={e => handleRadioChange(e, `${item?.['input_field_name']}_end`)}
                              ></DatePicker>
                            </LocalizationProvider>
                          </>
                        )}
                      {!item?.validations?.[7]?.validation &&
                        item?.['input_type'] === 'checkbox' &&
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
                                    option: { label: string | undefined; value: unknown },
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
                                            control={<Radio />}
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
                                >
                                  {item?.['input_type_dropdown_options']
                                    ? (item?.['input_type_dropdown_options']).map((values: any, key: number) => (
                                        <FormControlLabel
                                          key={key}
                                          value={values.value}
                                          control={<Radio />}
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
                                    value={
                                      formData?.[item?.['input_field_name']]
                                        ? dayjs(formData?.[item?.['input_field_name']])
                                        : null
                                    }
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
        {attachExternalFields ? renderExternalFields() : null}
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
    </>
  )
}
