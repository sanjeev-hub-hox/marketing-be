/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Grid,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Box,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  Typography,
  InputLabel,
  Chip,
  Checkbox,
  Divider
} from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { getRequest, postRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import FileUploadTextField from 'src/@core/components/file-upload/FileUploadTextField'
import { formatAmount, getCurrentAcademicYear, linkFile, storeFile } from 'src/utils/helper'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { getLocalStorageVal } from 'src/utils/helper'
import AddIcon from '@mui/icons-material/Add'
import DialogOpener from 'src/OwnComponents/SharedUIComponent/ApprovalManagement/DialogOpener'
import FeesDialog from './Dialog/FeesDialog'

interface FormData {
  concessions: {
    [key: string]: string
  }
}

interface DocumentOption {
  id: number
  document_name: string
}
type DocumentTypeDetails = {
  [key: number]: string | File // Adjust as needed for your data
}

interface concessionVerification {
  items: Array<{
    enquiry_id: any
    academic_yrs_id: number
    concession_id: number
    concession_name: string
    approval_applicable_type: string
    verification_type: string
    document_type_ids: number[]
    applicable_field_ids: number[]
    document_type_details: any
    applicable_field_details: any
    coupon_codes: any

    // field_type_options: {
    //   [key: number]: Array<{ id: number; name: string }>
    // },
    field_type_options: any
    documents: any[]
    review_cycle: string
    student_name: string
    lob_id: string
  }>
}

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
  academicYear: number
  enquiryDetails: any
  authToken?: string
}

function SampleDialog({ openModal, closeModal, header, enquiryDetails, academicYear, authToken }: customModal) {
  const { setGlobalState } = useGlobalContext()
  const [consessionGroup, setConsessionGroup] = useState<any[]>([])
  const [uniqueGroupName, setUniqueGroupNames] = useState<any[]>([])
  const [activeForm, setActiveForm] = useState<number>(1)
  const [documentOptions, setDocumentOptions] = useState<DocumentOption[]>([])
  const [loading, setLoading] = useState(false)
  const [allApplicableFields, setAllApplicableFields] = useState<any[]>([])
  const [docTypeMaster, setDocTypeMaste] = useState<any[]>([])
  const [academicYearData, setAcademicYearData] = useState<any>([])
  const [documentUpload, setDocumentUpload] = useState<boolean>(false)
  const [selectedConcessionId, setSelectedConcessionId] = useState<any>('')
  const [isButtonEnabled, setButtonEnabled] = useState(false)
  const [disocuntPopup, setDiscountPopup] = useState<boolean>(false)
  const [refresh, setRefresh] = useState<any>(false)
  const [viewMode, setViewMode] = useState<any>(false)
  const [enquiryID, setEnquiryID] = useState<any>(null)
  const [studentProfile, setStudentProfile] = useState<any>({})
  const [studentTagDetails, setStudentTagDetails] = useState<any[]>([])
  const [draftDialog, setDraftDialog] = useState<boolean>(false)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<any>(academicYear)
  const [applicableWriteOffIds, setApplicableWriteOffIds] = useState<any>([])
  const [writeOffDialogueOpen, setWriteOffDialoueOpen] = useState(false)

  const [psaDialog, setPsaDialog] = useState<boolean>(false)
  const [minimized, setMinimized] = useState(false)
  const [defaultfees, setDefaultFees] = useState<any[]>([])
  const [allFees, setAllFees] = useState<any>({})
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [allCoupons, setAllCoupons] = useState<any[]>([])
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [userInfo, setUserInfo] = useState<any>(() => {
    const savedUserInfo = localStorage.getItem('userInfo')

    return savedUserInfo ? JSON.parse(savedUserInfo) : {} // Default to {} if not found
  })

  useEffect(() => {
    if (LoadUserDetails()) return

    const intervalId = setInterval(() => {
      if (LoadUserDetails()) {
        clearInterval(intervalId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const LoadUserDetails = () => {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo))

      return true // Return true if userInfo is found
    }

    return false // Return false if userInfo is not found
  }

  const setDocumentUploadPopupClose = () => {
    console.log('documentUpload')
    setDocumentUpload(false)
    console.log(concessionVerificationValue('items'))
    console.log(watchedFields)

    const isValid = concessionVerificationValue('items').every(
      field =>
        field.concession_id !== 0 &&
        field.concession_name.trim() !== '' &&
        Array.isArray(field.document_type_details) &&
        field.document_type_details.every((data: any) => data != null && data != undefined) &&
        Array.isArray(field.applicable_field_details) &&
        field.applicable_field_details.every((data: any) => data != null && data != undefined)
      // field.document_type_ids.length > 0 &&
      // field.applicable_field_ids.length > 0
    )
    console.log('isValid')
    console.log(isValid)
    setButtonEnabled(isValid)
  }

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues: getConcessionValues
  } = useForm<FormData>({
    defaultValues: {
      concessions: {}
    }
  })

  const MasterDropDown = [
    {
      slug: 'pre_school_list',
      url: 'co-pre-schools',
      name: 'name'
    },
    {
      slug: 'corporate_list',
      url: 'co-corporate-offices',
      name: 'name'
    },
    {
      slug: 'army_personnel',
      url: 'co-army-personnel-categories',
      name: 'name'
    }
  ]

  interface Option {
    id: number
    name: string
  }

  interface FieldOptions {
    [key1: number]: {
      [key2: number]: Option[]
    }
  }

  interface Document {
    type: number
    filename: string
  }

  interface FieldDocuments {
    [key1: number]: {
      [key2: number]: Document[]
    }
  }
  const [fieldOptions, setFieldOptions] = useState<FieldOptions>()
  const [documentDetails, setDocumentDetails] = useState<FieldDocuments>()

  const {
    control: concessionVerificationControl,
    handleSubmit: concessionSubmit,
    setValue: concessionVerificationSetValue,
    getValues: concessionVerificationValue,
    watch
  } = useForm<concessionVerification>({
    defaultValues: {
      items: [
        {
          enquiry_id: enquiryDetails?._id,
          concession_id: 0,
          approval_applicable_type: '',
          // student_id: stundetId,
          academic_yrs_id: academicYear,
          verification_type: '',
          document_type_ids: [],
          applicable_field_ids: [],
          document_type_details: {},
          applicable_field_details: {},
          field_type_options: {},
          concession_name: '',
          coupon_codes: [],
          student_name: '',
          lob_id: ''
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: concessionVerificationControl,
    name: 'items'
  })
  const watchedFields = watch('items')

  useEffect(() => {
    console.log('watchedFields')
    console.log(watchedFields)
    const isValid = watchedFields.every(
      field =>
        field.concession_id !== 0 &&
        field.concession_name.trim() !== '' &&
        field.document_type_ids.length > 0 &&
        field.applicable_field_ids.length > 0
    )

    setButtonEnabled(isValid)
  }, [watchedFields])

  const getFieldOptions = (index: number, docIndex: number): Option[] => {
    // Ensure that fieldOptions and its properties are not undefined
    const optionsMap = fieldOptions ? fieldOptions[index] : []
    if (!optionsMap) {
      return []
    }

    const optionsArray = optionsMap[docIndex]

    return optionsArray ?? []
  }

  const [selectedItems1, setSelectedItems1] = useState<string[]>([])
  const handleChange1 = async (e: any, selectedData: any) => {
    const selectedValues = e === null ? selectedData : e.target.value
    setSelectedAcademicYear(selectedValues)

    setGlobalState({ isLoading: true })
    try {
      const tagDetailsArray = studentTagDetails.map((tagDetails: any) => tagDetails?.attributes?.tag_id)

      const concessionResponse = await postRequest({
        url: `/concession/fetch-concession-list`,
        serviceURL: 'admin',
        authToken: authToken,
        data: {
          page: 1,
          pageSize: 100,
          student_tags: tagDetailsArray,
          academic_yrs_id: selectedValues,
          // board_ids: [studentProfile?.crt_board_id],
          // course_ids: [studentProfile?.crt_course_id],
          // grade_ids: [studentProfile?.crt_grade_id],
          // stream_ids: [studentProfile?.crt_stream_id],
          // shift_ids: [studentProfile?.crt_shift_id],
          // brand_ids: [studentProfile?.crt_brand_id],
          // student_id: studentProfile?.id

          brand_ids: [enquiryDetails?.brand?.id],
          board_ids: [enquiryDetails?.board?.id],
          stream_ids: [enquiryDetails?.stream?.id],
          term_ids: [enquiryDetails?.tearm?.id] || [1],
          grade_ids: [enquiryDetails?.student_details?.grade?.id],
          course_ids: [enquiryDetails?.student_details?.grade?.id],
          shift_ids: [enquiryDetails?.student_details?.grade?.id]
        }
      })

      if (concessionResponse?.success) {
        const concessionData = concessionResponse.data.data
        setConsessionGroup(concessionData)
        setUniqueGroupNames(Array.from(new Set(concessionData.map((item: any) => item.concession_group_id))))
        setActiveForm(1)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }
  const handleDelete = (itemToDelete: string) => () => {
    setSelectedItems1(selectedItems => selectedItems.filter(item => item !== itemToDelete))
  }

  const concessionFormValues = watch('items')
  useEffect(() => {
    const fetchAllConcessionOptions = async () => {
      setGlobalState({ isLoading: true })

      try {
        // Fetch student profile and tags concurrently
        const [tagsResponse, academicYearsResponse] = await Promise.all([
          // getRequest({ url: `/studentProfile/${stundetId}`, serviceURL: 'admin' }),
          getRequest({
            url: `/api/ac-student-tags`,
            serviceURL: 'mdm',
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
            }
          }),
          getRequest({
            url: `/api/ac-academic-years?sort=id`,
            serviceURL: 'mdm',
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
            }
          })
        ])

        if (tagsResponse?.data && academicYearsResponse?.data) {
          // const studentProfileData = profileResponse.data.profile
          const studentTagDetailsData = tagsResponse.data
          const academicYears = academicYearsResponse.data

          // setStudentProfile(studentProfileData)
          setStudentTagDetails(studentTagDetailsData)

          if (academicYears.length) {
            const resultData = academicYears
            const rows: any = []
            resultData.map((dataSet: any, index: number) => {
              const transformedData = {
                name: dataSet.attributes.name,
                shortNameTwoDigit: dataSet.attributes.short_name_two_digit
              }

              rows.push({ ...transformedData })
            })
            setGlobalState({ isLoading: false })
            setAcademicYearData(rows)
          }

          const tagDetailsArray = studentTagDetailsData.map((tagDetails: any) => tagDetails?.attributes?.tag_id)

          // console.log(studentProfileData)
          console.log(studentTagDetailsData)
          console.log(tagDetailsArray)

          // Fetch concession list
          const concessionResponse = await postRequest({
            url: `/concession/fetch-concession-list`,
            serviceURL: 'admin',
            authToken: authToken,
            data: {
              page: 1,
              pageSize: 100,
              student_tags: tagDetailsArray,
              academic_yrs_id: academicYear ?? getCurrentAcademicYear(),
              // board_ids: [studentProfileData?.crt_board_id],
              // course_ids: [studentProfileData?.crt_course_id],
              // grade_ids: [studentProfileData?.crt_grade_id],
              // stream_ids: [studentProfileData?.crt_stream_id],
              // shift_ids: [studentProfileData?.crt_shift_id],
              // brand_ids: [studentProfileData?.crt_brand_id],
              // student_id: studentProfileData?.id
              enquiry_id: enquiryDetails?._id,
              brand_ids: [enquiryDetails?.brand?.id],
              board_ids: [enquiryDetails?.board?.id],
              stream_ids: [enquiryDetails?.stream?.id],
              term_ids: [enquiryDetails?.tearm?.id] || [1],
              grade_ids: [enquiryDetails?.student_details?.grade?.id],
              course_ids: [enquiryDetails?.student_details?.grade?.id],
              shift_ids: [enquiryDetails?.student_details?.grade?.id]
            }
          })

          if (concessionResponse?.success) {
            const concessionData = concessionResponse.data.data
            setConsessionGroup(concessionData)
            setUniqueGroupNames(Array.from(new Set(concessionData.map((item: any) => item.concession_group_id))))
            setActiveForm(1)
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    }

    fetchAllConcessionOptions()
  }, [setGlobalState])

  useEffect(() => {
    const fetchApplicableFields = async () => {
      setGlobalState({ isLoading: true })
      try {
        const params = {
          url: `/api/applicable-fields`,
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }
        const response = await getRequest(params)
        if (response?.data) {
          setAllApplicableFields(response?.data)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    }

    const fetchAllDocTypes = async () => {
      setGlobalState({ isLoading: true })
      try {
        const params = {
          url: `/api/ac-document-type-masters`,
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }
        const response = await getRequest(params)
        if (response?.data) {
          setDocTypeMaste(response?.data)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    }
    fetchApplicableFields()
    fetchAllDocTypes()
    console.log('enquiryDetails')
    console.log(enquiryDetails)
  }, [])

  const handlHrisCall = async (formIndex: number, docIndex: number, slug: string) => {
    setLoading(true)

    try {
      const fetchHrisData = async () => {
        const masterDropDownUrl = MasterDropDown.find((option: any) => option.slug === slug)?.url
        const params = {
          url: `/api/${masterDropDownUrl}`,
          serviceURL: 'mdm',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
          }
        }
        const data = await getRequest(params)
        if (data?.data.length) {
          const options: { id: any; name: any }[] = []
          data?.data.map((option: any, index: number) => {
            options[index] = {
              id: option.id,
              name: option.attributes?.name
            }
          })
          console.log(options)

          setFieldOptions(prev => {
            // Ensure `prev` is always defined and correctly typed
            const currentOptions = prev ?? {} // Fallback to an empty object if `prev` is undefined

            return {
              ...currentOptions,
              [formIndex]: {
                ...(currentOptions[formIndex] || {}), // Ensure that `currentOptions[formIndex]` is not undefined
                [docIndex]: options
              }
            }
          })
        }
      }
      await Promise.all([fetchHrisData()])
    } catch (error) {
      console.log(error, 'error')
    } finally {
      setLoading(false)
    }

    // }

    console.log(formIndex, docIndex, slug)
  }
  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.customColors.primaryLightest,
      color: theme.palette.customColors.mainText
    }
  }))
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  const onSubmit = async (data: FormData) => {
    console.log('Form Data:', data)

    return false

    setActiveForm(2)

    const concessionIdsQuery = Object.values(data.concessions)
      .filter((concessionId: string | undefined) => concessionId !== undefined) // Filter out undefined values
      .map((concessionId: string) => `concession_Ids=${concessionId}`)
      .join('&')

    setGlobalState({ isLoading: true })
    try {
      const params = {
        url: `concession/verification-criteria?${concessionIdsQuery}`,
        serviceURL: 'admin'
      }
      const verificationCriteriaResponse = await getRequest(params)
      if (verificationCriteriaResponse?.success) {
        const items = verificationCriteriaResponse.data?.data.map((item: any) => ({
          enquiry_id: enquiryDetails?._id,
          concession_id: item._id,
          approval_applicable_type: item.approval_applicable_type,
          verification_type: item.verification_type,
          document_type_ids: item.required_documents_ids,
          applicable_field_ids: item.applicable_fields_ids,
          concession_name: item.concession_name,
          // student_id: stundetId,
          student_name: studentProfile?.first_name + ' ' + studentProfile?.last_name,
          lob_id: studentProfile?.crt_lob_id,
          academic_yrs_id: academicYear,
          review_cycle: item?.review_cycle_id,
          coupon_codes: item?.coupon_codes,
          field_type_options: item.applicable_fields_ids.reduce((acc: any, fieldId: number) => {
            acc[fieldId] = [] // Initialize each field with an empty array

            return acc
          }, {}),
          documents: item.required_documents_ids.reduce((acc: any, fieldId: number) => {
            acc[fieldId] = [] // Initialize each field with an empty array

            return acc
          }, {})
        }))
        console.log('Fetched items:', items) // Debugging line
        // Reset fields to the fetched items
        concessionVerificationSetValue('items', items)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  const loadVerificationCriteriaDetails = async (data: any) => {
    console.log('Form Data:', data)

    // return false

    // setActiveForm(2)

    // const concessionIdsQuery = Object.values(data.concessions)
    //   .filter((concessionId: string | undefined) => concessionId !== undefined) // Filter out undefined values
    //   .map((concessionId: string) => `concession_Ids=${data}`)
    //   .join('&')

    setGlobalState({ isLoading: true })
    try {
      const params = {
        url: `/concession/verification-criteria?concession_Ids=${data}`,
        serviceURL: 'admin',
        authToken: authToken
      }
      const verificationCriteriaResponse = await getRequest(params)
      if (verificationCriteriaResponse?.success) {
        const items = verificationCriteriaResponse.data?.data?.map((item: any) => ({
          enquiry_id: enquiryDetails?._id,
          concession_id: item._id,
          approval_applicable_type: item.approval_applicable_type,
          verification_type: item.verification_type,
          document_type_ids: item.required_documents_ids,
          applicable_field_ids: item.applicable_fields_ids,
          concession_name: item.concession_name,
          // student_id: stundetId,
          student_name: studentProfile?.first_name + ' ' + studentProfile?.last_name,
          lob_id: studentProfile?.crt_lob_id,
          academic_yrs_id: academicYear,
          review_cycle: item?.review_cycle_id,
          coupon_codes: item?.coupon_codes,
          field_type_options: item.applicable_fields_ids.reduce((acc: any, fieldId: number) => {
            acc[fieldId] = [] // Initialize each field with an empty array

            return acc
          }, {}),
          documents: item.required_documents_ids.reduce((acc: any, fieldId: number) => {
            acc[fieldId] = [] // Initialize each field with an empty array

            return acc
          }, {})
        }))
        // console.log('Fetched items:', items) // Debugging line
        // // Reset fields to the fetched items

        console.log('concession verification values')

        console.log('uniqueGroupName', uniqueGroupName)
        console.log(getConcessionValues('concessions'))
        console.log(Object.values(getConcessionValues('concessions')))

        console.log(concessionVerificationValue('items'))

        const previousItems = concessionVerificationValue('items')
        const allItems = [...previousItems, ...items]
        const AllSelectedConcessoinValues = Object.values(getConcessionValues('concessions'))
        console.log(AllSelectedConcessoinValues)

        concessionVerificationSetValue(
          'items',
          allItems
            .filter(item => item.concession_id !== 0)
            .filter(item => AllSelectedConcessoinValues.includes(item.concession_id))
            .filter((item, index, self) => index === self.findIndex(obj => obj.concession_id === item.concession_id))
        )
      }
    } catch (error) {
      console.log(error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  const concessionVerificationSubmit = async () => {
    const formData = concessionVerificationValue('items')
    const updatedFormData = formData.map((field: any, fieldIndex: number) => {
      return {
        ...field, // Spread the existing field properties
        documents: field?.documents
          ? Object.entries(field.documents).reduce((acc: any, [docIndex, doc]: [string, any]) => {
              // Access document details using fieldIndex and docIndex
              const documentDetail = documentDetails?.[fieldIndex]?.[Number(docIndex)] || []

              // Create a new document entry with the document details
              return {
                ...acc,
                [docIndex]: {
                  ...doc,
                  documentDetail // Add the corresponding document detail
                }
              }
            }, {})
          : {} // Handle case where `field.documents` is undefined or null
      }
    })
    const updatedFormDataWithoutDocumentTypeDetails = updatedFormData.map(({ document_type_details, ...rest }) => rest)

    setGlobalState({ isLoading: true })
    try {
      const params = {
        url: `/concession/save-concession`,
        serviceURL: 'admin',
        authToken: authToken,
        data: {
          concession_details: updatedFormDataWithoutDocumentTypeDetails
        }
      }
      const verificationCriteriaResponse = await postRequest(params)
      if (verificationCriteriaResponse?.success) {
        // draftDialog()
        setDraftDialog(true)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setGlobalState({ isLoading: false })
    }

    setActiveForm(2)
  }

  // Handle form reset
  const handleResetSpecificRadio = (groupId: string) => {
    setValue(`concessions.${groupId}`, '') // Reset the specific radio group
  }

  const handleFileUpload = async (index: number, docid: number, file: any, filename: any) => {
    const fileName = 'finance/file_' + filename + '' + Math.floor(Date.now() / 1000)
    const fileStore = await storeFile(file, fileName)
    if (fileStore?.status === 200) {
      // // New document element
      const newElement = { type: fileStore?.data, filename: fileStore?.data }

      setDocumentDetails(prev => {
        // Ensure `prev` is always defined and correctly typed
        const currentOptions = prev ?? {} // Fallback to an empty object if `prev` is undefined

        return {
          ...currentOptions,
          [index]: {
            ...(currentOptions[index] || {}), // Ensure that `currentOptions[index]` is not undefined
            [docid]: [
              ...(currentOptions[index]?.[docid] || []), // Spread existing documents if they exist
              newElement // Add the new element to the array
            ]
          }
        }
      })
    }
  }

  const handleDraftCloseDialog = () => {
    closeModal?.()
    setDraftDialog(false)
  }

  const handleWriteOffDialogOpen = (id: any) => {
    console.log(id)
    const fieldIds: any = [id]

    console.log(fieldIds)
    setApplicableWriteOffIds(fieldIds)
    setWriteOffDialoueOpen(true)
  }

  const handlePsaDialogClose = () => {
    setPsaDialog(false)
  }

  const fetchAllDefaultfees = async () => {
    let totalAmount = 0

    const params = {
      url: `marketing/admission/${enquiryDetails?._id}`
    }
    const response = await getRequest(params)
    if (response?.status === 200) {
      setDefaultFees(response?.data?.default_fees)
      setAllFees(response?.data)

      response?.data?.default_fees.forEach((fees: any) => {
        totalAmount += fees?.fee_amount_for_period || 0 // Add amount or 0 if undefined
      })

      const additionalFees = [
        response?.data?.psa_details?.amount || 0,
        response?.data?.transport_details?.amount || 0,
        response?.data?.summer_camp_details?.amount || 0,
        response?.data?.kids_club_details?.amount || 0,
        response?.data?.hostel_details?.amount || 0,
        response?.data?.cafeteria_details?.amount || 0
      ]

      additionalFees.forEach(amount => {
        totalAmount += amount
      })

      setTotalAmount(totalAmount)
    }
  }

  const fetchAllCoupons = async () => {
    const params = {
      url: `/concession/fetch-all-coupons`,
      serviceURL: 'admin',
      data: {
        enquiry_id: enquiryDetails?._id,
        academic_years_id: 25
      }
    }
    const response = await postRequest(params)
    if (response?.success) {
      let discountamount = 0

      const AllCoupons = response?.data.filter((coupon: any) => coupon.user_coupon_count > 0)
      setAllCoupons(AllCoupons)

      defaultfees?.map((fees: any) =>
        AllCoupons?.filter((coupon: any) => coupon?.fee_type_ids.includes(fees?.fee_type_id))
          .filter((coupon: any) => coupon?.fee_sub_type_ids.includes(fees?.fee_sub_type_id))
          .filter((coupon: any) => coupon?.fee_category_ids.includes(fees?.fee_category_id))
          .filter((coupon: any) => coupon?.fee_sub_category_ids.includes(fees?.fee_subcategory_id))
          .map((coupon: any) => {
            if (coupon?.concession_percentage) {
              discountamount += (coupon?.concession_percentage / 100) * fees?.fee_amount_for_period
            } else {
              discountamount += coupon?.concession_fixed_amount
            }
          })
      )

      if (allFees?.psa_details) {
        const psaDetails = allFees?.psa_details

        AllCoupons?.filter((coupon: any) => coupon?.fee_type_ids.includes(psaDetails?.fee_type_id))
          .filter((coupon: any) => coupon?.fee_sub_type_ids.includes(psaDetails?.fee_sub_type_id))
          .filter((coupon: any) => coupon?.fee_category_ids.includes(psaDetails?.fee_category_id))
          .filter((coupon: any) => coupon?.fee_sub_category_ids.includes(psaDetails?.fee_subcategory_id))
          .map((coupon: any) => {
            if (coupon?.concession_percentage) {
              discountamount += (coupon?.concession_percentage / 100) * psaDetails?.fee_amount_for_period
            } else {
              discountamount += coupon?.concession_fixed_amount
            }
          })
      }

      if (allFees?.cafeteria_details) {
        const psaDetails = allFees?.cafeteria_details

        AllCoupons?.filter((coupon: any) => coupon?.fee_type_ids.includes(psaDetails?.fee_type_id))
          .filter((coupon: any) => coupon?.fee_sub_type_ids.includes(psaDetails?.fee_sub_type_id))
          .filter((coupon: any) => coupon?.fee_category_ids.includes(psaDetails?.fee_category_id))
          .filter((coupon: any) => coupon?.fee_sub_category_ids.includes(psaDetails?.fee_subcategory_id))
          .map((coupon: any) => {
            if (coupon?.concession_percentage) {
              discountamount += (coupon?.concession_percentage / 100) * psaDetails?.fee_amount_for_period
            } else {
              discountamount += coupon?.concession_fixed_amount
            }
          })
      }

      if (allFees?.transport_details) {
        const psaDetails = allFees?.transport_details

        AllCoupons?.filter((coupon: any) => coupon?.fee_type_ids.includes(psaDetails?.fee_type_id))
          .filter((coupon: any) => coupon?.fee_sub_type_ids.includes(psaDetails?.fee_sub_type_id))
          .filter((coupon: any) => coupon?.fee_category_ids.includes(psaDetails?.fee_category_id))
          .filter((coupon: any) => coupon?.fee_sub_category_ids.includes(psaDetails?.fee_subcategory_id))
          .map((coupon: any) => {
            if (coupon?.concession_percentage) {
              discountamount += (coupon?.concession_percentage / 100) * psaDetails?.fee_amount_for_period
            } else {
              discountamount += coupon?.concession_fixed_amount
            }
          })
      }

      if (allFees?.summer_camp_details) {
        const psaDetails = allFees?.summer_camp_details

        AllCoupons?.filter((coupon: any) => coupon?.fee_type_ids.includes(psaDetails?.fee_type_id))
          .filter((coupon: any) => coupon?.fee_sub_type_ids.includes(psaDetails?.fee_sub_type_id))
          .filter((coupon: any) => coupon?.fee_category_ids.includes(psaDetails?.fee_category_id))
          .filter((coupon: any) => coupon?.fee_sub_category_ids.includes(psaDetails?.fee_subcategory_id))
          .map((coupon: any) => {
            if (coupon?.concession_percentage) {
              discountamount += (coupon?.concession_percentage / 100) * psaDetails?.fee_amount_for_period
            } else {
              discountamount += coupon?.concession_fixed_amount
            }
          })
      }

      if (allFees?.kids_club_details) {
        const psaDetails = allFees?.kids_club_details

        AllCoupons?.filter((coupon: any) => coupon?.fee_type_ids.includes(psaDetails?.fee_type_id))
          .filter((coupon: any) => coupon?.fee_sub_type_ids.includes(psaDetails?.fee_sub_type_id))
          .filter((coupon: any) => coupon?.fee_category_ids.includes(psaDetails?.fee_category_id))
          .filter((coupon: any) => coupon?.fee_sub_category_ids.includes(psaDetails?.fee_subcategory_id))
          .map((coupon: any) => {
            if (coupon?.concession_percentage) {
              discountamount += (coupon?.concession_percentage / 100) * psaDetails?.fee_amount_for_period
            } else {
              discountamount += coupon?.concession_fixed_amount
            }
          })
      }

      if (allFees?.hostel_details) {
        const psaDetails = allFees?.hostel_details

        AllCoupons?.filter((coupon: any) => coupon?.fee_type_ids.includes(psaDetails?.fee_type_id))
          .filter((coupon: any) => coupon?.fee_sub_type_ids.includes(psaDetails?.fee_sub_type_id))
          .filter((coupon: any) => coupon?.fee_category_ids.includes(psaDetails?.fee_category_id))
          .filter((coupon: any) => coupon?.fee_sub_category_ids.includes(psaDetails?.fee_subcategory_id))
          .map((coupon: any) => {
            if (coupon?.concession_percentage) {
              discountamount += (coupon?.concession_percentage / 100) * psaDetails?.fee_amount_for_period
            } else {
              discountamount += coupon?.concession_fixed_amount
            }
          })
      }

      setDiscountAmount(discountamount)
    }
  }

  useEffect(() => {
    fetchAllDefaultfees()
  }, [])

  useEffect(() => {
    fetchAllCoupons()
  }, [totalAmount])

  return (
    <>
      {!writeOffDialogueOpen && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <DialogTitle id='responsive-dialog-title'>{header}</DialogTitle>
          </Box>

          {selectedAcademicYear && (
            <>
              <Box>
                <Grid container xs={12} spacing={5}>
                  <Grid item xs={12} md={9}>
                    <Box
                      sx={{
                        background: '#fff',
                        padding: '24px',
                        borderRadius: '10px',
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <Box className='fixedModal' sx={{ overflowY: 'auto', height: '700px' }}>
                        <Box sx={{ mt: 3, mb: 5 }}>
                          <Box sx={{ mb: 5 }}>
                            <Grid container spacing={5} xs={12}>
                              <Grid item xs={12} md={9}>
                                <FormControl fullWidth>
                                  <InputLabel
                                    style={{
                                      marginTop: '0px'
                                    }}
                                    id='demo-mutiple-chip-label'
                                  >
                                    Select Academic Year
                                  </InputLabel>
                                  <Select
                                    label='Select Academic Year'
                                    labelId='demo-mutiple-chip-label'
                                    id='demo-mutiple-chip'
                                    value={selectedAcademicYear}
                                    onChange={e => handleChange1(e, null)}
                                    IconComponent={DownArrow}
                                  >
                                    {academicYearData.map(
                                      (
                                        value:
                                          | boolean
                                          | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                                          | React.ReactFragment
                                          | React.Key
                                          | any,
                                        index: number
                                      ) => (
                                        <MenuItem key={index} value={value.shortNameTwoDigit}>
                                          {value.name}
                                        </MenuItem>
                                      )
                                    )}
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </Box>

                          <Box sx={{ mt: 5, mb: 5 }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                              <Box sx={{ mb: 5 }}>
                                <Grid container spacing={5} xs={12}>
                                  {uniqueGroupName.map((groupId: any) => {
                                    const checkWorkFLowAssigned = consessionGroup.filter(
                                      (option: any) => option.concession_group_id === groupId && option.workflow_id
                                    )

                                    return (
                                      <>
                                        <Grid item xs={12} key={groupId}>
                                          <FormControl>
                                            <FormLabel id={`group-label-${groupId}`}>Group {groupId} </FormLabel>

                                            <Controller
                                              name={`concessions.${groupId}`}
                                              control={control}
                                              render={({ field }) => (
                                                <RadioGroup aria-labelledby={`group-label-${groupId}`} {...field}>
                                                  {consessionGroup
                                                    .filter((option: any) => option.concession_group_id === groupId)
                                                    .map((option: any) => (
                                                      <FormControlLabel
                                                        key={option.id}
                                                        value={option._id}
                                                        control={<Radio checked={option.workflow_id} />}
                                                        onClick={() => loadVerificationCriteriaDetails(option._id)}
                                                        label={
                                                          <span
                                                            style={{
                                                              color: option.is_verify_student_tag ? 'green' : 'inherit',
                                                              display: 'flex',
                                                              alignItems: 'center'
                                                            }}
                                                          >
                                                            {option.concession_question} ({option.concession_name})
                                                            {getConcessionValues(`concessions.${groupId}`) ===
                                                              option._id && (
                                                              <>
                                                                <Button
                                                                  variant='text'
                                                                  disableFocusRipple
                                                                  disableTouchRipple
                                                                  startIcon={<AddIcon />}
                                                                  color='primary'
                                                                  disableRipple
                                                                  sx={{
                                                                    '&.MuiButtonBase-root.MuiButton-root:hover': {
                                                                      backgroundColor: 'rgba(247, 247, 249, 0)'
                                                                    },
                                                                    '&.MuiButtonBase-root.MuiButton-root.Mui-disabled:hover':
                                                                      {
                                                                        backgroundColor: 'rgba(247, 247, 249, 0)'
                                                                      }
                                                                  }}
                                                                  onClick={() => {
                                                                    // handleWriteOffDialogOpen(option?.workflow_id)
                                                                    setSelectedConcessionId(option._id)
                                                                    setDocumentUpload(true)
                                                                    setActiveForm(2)
                                                                  }}
                                                                >
                                                                  Upload Attachments
                                                                </Button>
                                                              </>
                                                            )}
                                                          </span>
                                                        }
                                                        disabled={checkWorkFLowAssigned.length > 0 ? true : false}
                                                      />
                                                    ))}
                                                </RadioGroup>
                                              )}
                                            />
                                          </FormControl>
                                        </Grid>
                                      </>
                                    )
                                  })}
                                </Grid>
                              </Box>

                              {uniqueGroupName?.length > 0 && (
                                <>
                                  <Button
                                    type='submit'
                                    size='large'
                                    variant='contained'
                                    color='primary'
                                    disabled={!isButtonEnabled}
                                    onClick={concessionVerificationSubmit}
                                  >
                                    Submit
                                  </Button>
                                </>
                              )}
                            </form>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box
                      sx={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '10px',
                        width: '100%'
                      }}
                    >
                      <Box>
                        <Typography
                          variant='caption'
                          color={'customColors.text3'}
                          sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                        >
                          {' '}
                          Total Amount Payable
                        </Typography>
                        <Typography
                          color={'primary.dark'}
                          sx={{ fontSize: '22px', fontWeight: 600, lineHeight: '28px' }}
                        >
                          {' '}
                          ₹ {formatAmount(Math.round(totalAmount - discountAmount ?? 0))}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 3, mb: 3 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography
                            variant='caption'
                            color={'customColors.text3'}
                            sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                          >
                            {' '}
                            Net Amount
                          </Typography>
                          <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                            {' '}
                            ₹ {formatAmount(Math.round(totalAmount))}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant='caption'
                            color={'customColors.text3'}
                            sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
                          >
                            {' '}
                            Discount Amount
                          </Typography>
                          <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                            {' '}
                            ₹ {formatAmount(Math.round(discountAmount))}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '10px',
                        width: '100%',
                        mt: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box>
                        <Typography
                          variant='subtitle1'
                          color={'text.primary'}
                          sx={{ lineHeight: '17.6px', textTransform: 'capitalize' }}
                        >
                          {' '}
                          calculated fees
                        </Typography>
                      </Box>
                      <Box
                        className='fixedModal'
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          mt: 5,
                          height: '510px',
                          overflowY: 'auto'
                        }}
                      >
                        <Box>
                          {defaultfees.map((fees: any) => (
                            <>
                              <Box
                                sx={{
                                  mt: 3,
                                  mb: 3,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Typography
                                  variant='body2'
                                  color={'text.primary'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  {fees?.display_name}
                                </Typography>
                                <Typography
                                  variant='subtitle2'
                                  color={'error.main'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  {fees?.fee_amount_for_period
                                    ? `₹ ${formatAmount(Math.round(fees?.fee_amount_for_period))}`
                                    : null}
                                </Typography>
                              </Box>
                            </>
                          ))}

                          {allFees?.psa_details && (
                            <>
                              <Box
                                sx={{
                                  mt: 3,
                                  mb: 3,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Typography
                                  variant='body2'
                                  color={'text.primary'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  PSA Details
                                </Typography>
                                <Typography
                                  variant='subtitle2'
                                  color={'error.main'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  ₹ {formatAmount(Math.round(allFees?.psa_details?.amount))}
                                </Typography>
                              </Box>
                            </>
                          )}

                          {allFees?.transport_details && (
                            <>
                              <Box
                                sx={{
                                  mt: 3,
                                  mb: 3,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Typography
                                  variant='body2'
                                  color={'text.primary'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  Transport Details
                                </Typography>
                                <Typography
                                  variant='subtitle2'
                                  color={'error.main'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  {/* ₹ {allFees?.transport_details?.amount} */}₹{' '}
                                  {formatAmount(Math.round(allFees?.transport_details?.amount))}
                                </Typography>
                              </Box>
                            </>
                          )}

                          {allFees?.summer_camp_details && (
                            <>
                              <Box
                                sx={{
                                  mt: 3,
                                  mb: 3,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Typography
                                  variant='body2'
                                  color={'text.primary'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  Summercamp Details
                                </Typography>
                                <Typography
                                  variant='subtitle2'
                                  color={'error.main'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  {/* ₹ {allFees?.summer_camp_details?.amount} */}₹{' '}
                                  {formatAmount(Math.round(allFees?.summer_camp_details?.amount))}
                                </Typography>
                              </Box>
                            </>
                          )}

                          {allFees?.kids_club_details && (
                            <>
                              <Box
                                sx={{
                                  mt: 3,
                                  mb: 3,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Typography
                                  variant='body2'
                                  color={'text.primary'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  Kids Club Details
                                </Typography>
                                <Typography
                                  variant='subtitle2'
                                  color={'error.main'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  {/* ₹ {allFees?.kids_club_details?.amount} */}₹{' '}
                                  {formatAmount(Math.round(allFees?.kids_club_details?.amount))}
                                </Typography>
                              </Box>
                            </>
                          )}

                          {allFees?.hostel_details && (
                            <>
                              <Box
                                sx={{
                                  mt: 3,
                                  mb: 3,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Typography
                                  variant='body2'
                                  color={'text.primary'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  Hostel Details
                                </Typography>
                                <Typography
                                  variant='subtitle2'
                                  color={'error.main'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  {/* ₹ {allFees?.hostel_details?.amount} */}₹{' '}
                                  {formatAmount(Math.round(allFees?.hostel_details?.amount))}
                                </Typography>
                              </Box>
                            </>
                          )}

                          {allFees?.cafeteria_details && (
                            <>
                              <Box
                                sx={{
                                  mt: 3,
                                  mb: 3,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Typography
                                  variant='body2'
                                  color={'text.primary'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  Cafeteria Details
                                </Typography>
                                <Typography
                                  variant='subtitle2'
                                  color={'error.main'}
                                  sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                                >
                                  {/* ₹ {allFees?.cafeteria_details?.amount} */}₹{' '}
                                  {formatAmount(Math.round(allFees?.cafeteria_details?.amount))}
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Dialog
                open={documentUpload}
                onClose={setDocumentUploadPopupClose}
                aria-labelledby='responsive-dialog-title'
                sx={{ '& .MuiPaper-root.MuiDialog-paper': { width: '1100px', maxWidth: '100%' } }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <DialogTitle id='responsive-dialog-title'>{header}</DialogTitle>
                  <IconButton onClick={setDocumentUploadPopupClose}>
                    <HighlightOffIcon style={{ color: '#666666' }} />
                  </IconButton>
                </Box>

                {activeForm === 2 && (
                  <form onSubmit={concessionSubmit(concessionVerificationSubmit)}>
                    <DialogContent>
                      <Grid container spacing={2}>
                        {fields
                          .filter((element: any) => element.concession_id === selectedConcessionId)
                          .map((field, index: number) => {
                            const CurrentIndex: number = fields.findIndex(
                              element => element.concession_id === field.concession_id
                            )
                            console.log(CurrentIndex)

                            return (
                              <Grid item container spacing={2} key={field.id} xs={12}>
                                {/* Approval Applicable Type */}
                                <Grid item xs={12}>
                                  <Typography variant='h6'>{field.concession_name}</Typography>
                                </Grid>

                                {/* Dynamic Autocomplete Fields for Document Type IDs */}
                                {field.document_type_ids.map((docId, docIndex) => (
                                  <Grid item xs={6} key={docIndex}>
                                    <Controller
                                      name={`items.${CurrentIndex}.document_type_details.${docIndex}`}
                                      control={concessionVerificationControl}
                                      rules={{ required: 'This file is required' }}
                                      render={({ field: { onChange, onBlur, name, ref }, fieldState: { error } }) => (
                                        <div>
                                          <FileUploadTextField
                                            label={docTypeMaster.find((ele: any) => ele.id === docId)?.attributes?.name}
                                            accept='image'
                                            required={false}
                                            type='image'
                                            onChange={(file: any) => {
                                              onChange(file)
                                              handleFileUpload(
                                                CurrentIndex,
                                                docId,
                                                file,
                                                docTypeMaster.find((ele: any) => ele.id === docId)?.attributes?.name
                                              )
                                            }}
                                          />
                                          {error && <span style={{ color: 'red' }}>{error.message}</span>}{' '}
                                          {/* Display error */}
                                        </div>
                                      )}
                                    />
                                  </Grid>
                                ))}

                                {field.applicable_field_ids.map((docId, docIndex) => (
                                  <Grid item xs={6} key={docIndex}>
                                    <Controller
                                      name={`items.${CurrentIndex}.applicable_field_details.${docIndex}`}
                                      control={concessionVerificationControl}
                                      render={({ field }) => {
                                        return (
                                          <Autocomplete
                                            {...field}
                                            onFocus={() =>
                                              handlHrisCall(
                                                CurrentIndex,
                                                docIndex,
                                                allApplicableFields.find((ele: any) => ele.id === docId)?.attributes
                                                  ?.field_slug
                                              )
                                            }
                                            loading={loading}
                                            disableCloseOnSelect={true}
                                            popupIcon={
                                              <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
                                            }
                                            options={getFieldOptions(CurrentIndex, docIndex)}
                                            value={
                                              getFieldOptions(CurrentIndex, docIndex).find(
                                                option => option.id === field.value
                                              ) || null
                                            }
                                            getOptionLabel={option => option.name} // Use the 'name' from options
                                            // onChange={(event, value) => field.onChange(value?.id || null)} // Store the selected option's id
                                            onChange={(event, value) => {
                                              console.log('onChange triggered with value:', value)
                                              if (value) {
                                                field.onChange(value.id)
                                              } else {
                                                field.onChange(null)
                                              }
                                            }}
                                            renderInput={params => (
                                              <TextField
                                                {...params}
                                                label={
                                                  allApplicableFields.find((ele: any) => ele.id === docId)?.attributes
                                                    ?.field_display_name
                                                }
                                              />
                                            )}
                                          />
                                        )
                                      }}
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                            )
                          })}
                      </Grid>

                      <DialogActions>
                        <Button variant='contained' color='primary' onClick={setDocumentUploadPopupClose}>
                          Cancel
                        </Button>
                        {/* <Button type='submit' variant='contained' color='primary'>
                          Submit
                        </Button> */}

                        <Button variant='contained' color='primary' onClick={setDocumentUploadPopupClose}>
                          Save
                        </Button>
                      </DialogActions>
                    </DialogContent>
                  </form>
                )}
              </Dialog>
            </>
          )}

          {draftDialog && (
            <SuccessDialog
              openDialog={draftDialog}
              handleClose={handleDraftCloseDialog}
              title='Concession Details Saved Successfully'
            />
          )}
        </>
      )}

      {disocuntPopup && (
        <FeesDialog
          openDialog={disocuntPopup}
          title='Fees Dialog'
          handleClose={handlePsaDialogClose}
          setPsaDialog={setPsaDialog}
          minimized={minimized}
          setMinimized={setMinimized}
          enquiryID={enquiryID}
          enquiryDetails={enquiryDetails}
          academic_year={25}
        />
      )}

      <DialogOpener
        openDialog={writeOffDialogueOpen}
        handleClose={() => setWriteOffDialoueOpen(false)}
        // selectedIds={applicableWriteOffIds}
        userInfoData={userInfo}
      />
    </>
  )
}

export default SampleDialog
