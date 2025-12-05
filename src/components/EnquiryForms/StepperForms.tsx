'use client'
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { Checkbox, Tooltip, IconButton, Typography, Divider, TextField, useTheme, TextFieldProps } from '@mui/material'
import { Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter, usePathname } from 'next/navigation'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import Step from 'src/@core/CustomComponent/TriangleStepper/Step'
import CreateForm from 'src/components/FormBuilder/CreateForm'
import { getRequest, patchRequest, postRequest } from 'src/services/apiService'
import { findIndexBySlug, getObjectByKeyVal } from 'src/utils/helper'
import UploadForms from 'src/components/FormBuilder/UploadForm'
import ToggleGroupStepper from 'src/@core/CustomComponent/TriangleStepper/ToggleGroupStepper'
import ErrorDialogBox from 'src/@core/CustomComponent/ErrorDialogBox/ErrorDialogBox'
import SubjectSelectionComponent from './SubjectSelectionComponent'
import DefaultFees from './DefaultFees'
import DiscountComponent from './DiscountComponent'

import { DataGrid } from '@mui/x-data-grid'
import { ENQUIRY_STAGES, ENQUIRY_STATUS, googlAlgo } from 'src/utils/constants'
import CafetriaDialog from './Dialog/CafetriaDialog'
import SummarCampDialog from './Dialog/SummarCampDialog'
import KidsClub from './Dialog/KidsClubDialog'
import PSADialog from './Dialog/PSADialog'
import { CalendarIcon, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import SuccessLogo from 'public/images/success.gif'
import dayjs from 'dayjs'
import Image from 'next/image'
import AddIcon from '@mui/icons-material/Add'
import TransportationDialog from './Dialog/TransportationDialog'
import EnquiryMessage from './Dialog/EnquiryMessage'
import TermsAndConditionsPopup from '../FormBuilder/TermsConditions'
import KitDownload from '../FormBuilder/Dialog/KitDownload'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StudentExists from './Dialog/StudentExists'

//Chips Styled
const StyledChipProps = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorPrimary': {
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: '#4849DA14 !important',
    color: '#4849DA !important'
  },
  '&.MuiChip-colorDefault': {
    border: `1px solid ${theme.palette.grey[300]} !important`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: `${theme.palette.customColors.text6} !important`,
    color: `${theme.palette.customColors.mainText} `
  }
}))

interface EnquiryForm {
  _id: string
  slug: string
  name: string
}

interface RegistrationForm {
  _id: string
  slug: string
  name: string
}

interface SubStage {
  name: string
}

interface Stage {
  _id: string
  name: string
  sub_stages: SubStage[]
}

interface EnquiryTypeData {
  _id: string
  name: string
  slug: string
  enquiry_forms: EnquiryForm[]
  registration_forms: RegistrationForm[]
  admission_forms: any[] | null
  stages: Stage[]
}

interface FormProps {
  enquiryTypeData?: EnquiryTypeData
  propsEnquiryId?: any
  handleTypeDropDown?: any
  activeStepProp?: number
  view?: boolean
  enquiryDetails?: any
  registration?: any
  openCompetencyTest?: any
  hideCTA?: boolean
  mobileView?: boolean
  authToken?: string
  setRefreshList?: any
  refreshList?: any
  setFormCompletion?: any
}

const StepperForms = ({
  enquiryTypeData,
  propsEnquiryId,
  handleTypeDropDown,
  activeStepProp,
  view,
  enquiryDetails,
  registration,
  openCompetencyTest,
  hideCTA,
  mobileView,
  authToken,
  setRefreshList,
  refreshList,
  setFormCompletion
}: FormProps) => {
  const router = useRouter()
  const requestSet = {
    key: 'Dummy'
  }

  const [selectedOptions, setSelectedOptions] = useState<string>('')
  const [activeStep, setActiveStep] = useState<any>(1)
  const [enquiryType, setEnquiryType] = useState<any>(enquiryTypeData)
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [successDialog, setSuccessDialog] = useState<boolean>(false)
  const [submitProp, setSubmitProp] = useState<any>(false)
  const [regDisabled, setRegDisabled] = useState<any>(true)
  const [enquiryID, setEnquiryID] = useState<any>(null)
  const [dynamicFormData, setDynamicFormData] = useState<any>(null)
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false)
  const [renderData, setRenderData] = useState<boolean>(false)
  const [dialogTitle, setDialogTitle] = useState<string>('Enquiry Submitted Successfully!')
  const [regComplete, setRegComplete] = useState<boolean>(false)
  const [activeStageData, setActiveStageData] = useState<any>(null)
  const [enquiryDetailsObj, setEnquiryDetailsObj] = useState<any>(null)
  const [isSubjectApiLoading, setIsSubjectApiLoading] = useState(false)
  const [allSubjects, setAllSubjects] = useState<any>(null)
  const [finalSelectedSubjects, setFinalSelectedSubjects] = useState<any>(null)
  const [isSubjectApiError, setIsSubjectApiError] = useState(false)
  const [guestSchoolParentId, setGuestSchoolParentId] = useState<any>(null)
  const [vasData, setVasData] = useState<any>({
    transport_details: false,
    cafeteria_details: false,
    hostel: false,
    kids_club_details: false,
    psa_details: false,
    summer_camp_details: false
  })
  const [isRegistrationApplicable, setIsRegistrationApplicable] = useState<any>(null)
  const [vasDetails, setVasDetails] = useState<any>(null)
  const [refresh, setRefresh] = useState<any>(false)
  const [viewMode, setViewMode] = useState<any>(false)
  const [finalAdmissionData, setFinalAdmissionData] = useState<any>(null)
  const [enquiryNumber, setEnquiryNumber] = useState<any>(null)
  const [duplicateDialog, setDuplicateDialog] = useState<boolean>(false)
  const [duplicateDialogMessage, setDuplicateDialogMessage] = useState<any>(null)
  const [duplicateEnquiryId, setDuplicateEnquiryId] = useState<any>(null)
  const [termsCondition, setTermsCondition] = useState<boolean>(false)
  const [competenctData, setcompetenctData] = useState<any>(null)
  const [successDialogTerms, setsuccessDialogTerms] = useState<boolean>(false)
  const [schoolParentId, setSchoolParentId] = useState<any>(null)
  const [admissionOptions, setAdmissionOptions] = useState<any>({
    'Default Fees': true,
    VAS: true,
    Concession: true
  })
  const [optionalSubjectCount, setOptionalSubjectCount] = useState<any>([])
  const [uploadScreen, setUploadScreen] = useState<boolean>(false)
  const [studentDialog, setStudentDialog] = useState<boolean>(false)

  const closeStudentDialog = () => {
    setStudentDialog(false)
    router.push('/registered-student-listing/')
  }

  const handleSuccessTermDialogClose = () => {
    setsuccessDialogTerms(false)
  }

  const getFinalData = async () => {
    const params = {
      url: `marketing/admission/${enquiryID}`,
      authToken: authToken
    }
    const response = await getRequest(params)
    if (response?.status) {
      setFinalAdmissionData(response?.data?.payment_details)
      setEnquiryNumber(response?.data)
    }
  }
  const getCompetenctTestResult = async () => {
    const params = {
      url: `marketing/competency-test/${enquiryID}`
    }
    const response = await getRequest(params)
    if (response?.status) {
      setcompetenctData(response?.data)
    }
  }

  useEffect(() => {
    if (enquiryID) {
      getFinalData()
      getCompetenctTestResult()
    }
  }, [enquiryID])

  useEffect(() => {
    if (selectedOptions && selectedOptions == 'VAS') {
      getVasDetails()
    }
  }, [selectedOptions, refresh])


  const getVasDetails = async () => {
    setGlobalState({
      isLoading: true
    })
    const params = {
      url: `marketing/admission/${enquiryID}`,
      authToken: authToken
    }
    const response = await getRequest(params)
    if (response?.status) {
      setVasDetails(response?.data)
      // eslint-disable-next-line prefer-const
      const obb: any = {}

      Object.keys(vasData).forEach(key => {
        if (response?.data[key]) {
          obb[key] = true
          // setVasData({
          //   ...vasData,
          //   [key]: true
          // })
        }
      })
      setVasData({
        ...vasData,
        ...obb
      })
    } else {
      setVasDetails(null)
    }
    setGlobalState({
      isLoading: false
    })
  }

  useEffect(() => {

    const regStatusCheck = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.REGISTRATION)
    if (regStatusCheck) {
      setIsRegistrationApplicable(regStatusCheck)
    }
  }, [enquiryTypeData])
  const theme = useTheme()

  const getObjectKeyValSlug: any = (object: any, value: any) => {
    return object?.find((o: any) => o.stage_name === value)
  }

  // eslint-disable-next-line no-var
  var testStatus

  const handleErrorClose = () => {
    setOpenErrorDialog(false)
  }
  const [cafeteriaDialog, setCafeteriaDialog] = useState<boolean>(false)
  const [minimized, setMinimized] = useState(false)
  const [summerCampDialogue, setSummerCampDialog] = useState<boolean>(false)
  const [KidsCludDialog, setKidsClubDialog] = useState<boolean>(false)
  const [psaDialog, setPsaDialog] = useState<boolean>(false)
  const [transportDialog, setTransportDialog] = useState<boolean>(false)
  const [academicYears, setacademicYears] = useState<any>([])
  const [refreshStatus, setRrefreshStatus] = useState<boolean>(false)
  const [pdfURL, setPDFUrl] = useState<boolean>(false)

  const getAcademicYear = async () => {
    const apiRequest = {
      url: `/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1`,
      serviceURL: 'mdm',
      authToken: authToken,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response: any = await getRequest(apiRequest)
    if (response.data) {
      setacademicYears(response.data)
    }
  }

  useEffect(() => {

    getAcademicYear()
  }, [])

  useEffect(() => {
    if (view) {
      setRegDisabled(false)
    }
    if (enquiryTypeData) {
      setEnquiryType(enquiryTypeData)
      if (propsEnquiryId) {
        setEnquiryID(propsEnquiryId)
      }
      if (activeStepProp) {
        setActiveStep(activeStepProp)
      }
      if (enquiryDetails) {
        setEnquiryDetailsObj(enquiryDetails)
        setInitialForm(enquiryTypeData, enquiryDetails)
        // if (academicYears && academicYears?.length) {
        //   getSubjectData()
        // }
      } else {
        setInitialForm(enquiryTypeData, [])
      }
    }
  }, [enquiryTypeData, activeStep, view, enquiryDetails, registration, refreshStatus, academicYears])

  const getSubjectData = async () => {
    const yearShort = getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes
      ?.short_name_two_digit

  setIsSubjectApiLoading(true)
  setIsSubjectApiError(false)

  try {
    // Common board check
    const commonBoardParams = {
      url: `/school/search-list`,
      serviceURL: 'admin',
      authToken: authToken,
      data: {
        "academic_year_id": [
          `${yearShort}`
        ],
        "school_id": [
          `${enquiryDetails?.school_location?.id}`
        ],
        "brand_id": [
          `${enquiryDetails?.brand?.id}`
        ],
        "board_id": [
          `${enquiryDetails?.board?.id}`
        ],
        "grade_id": [
          `${enquiryDetails?.student_details?.grade?.id}`
        ]
      }
    }
    const commonBoardResponse = await postRequest(commonBoardParams)
    const isCommonBoard = (commonBoardResponse?.data?.data || []).some(
      (      item: { is_common_course: number }) => item?.is_common_course === 1
    )


    const params = {
      url: `/school-subject/fetch-school-subjects`,
      serviceURL: 'admin',
      authToken,
      data: {
        pageSize: 1000,
        academicYearId: yearShort ? parseInt(yearShort) : undefined,
        brandId: enquiryDetails?.brand?.id,
        ...(!isCommonBoard && { boardId: enquiryDetails?.board?.id }),
        streamId: enquiryDetails?.stream?.id,
        termId: enquiryDetails?.term?.id || 1,
        gradeId: enquiryDetails?.student_details?.grade?.id,
        schoolId: enquiryDetails?.is_guest_student ? guestSchoolParentId : schoolParentId,
        courseId: enquiryDetails?.course?.id
      }
    }
    const response = await postRequest(params)
    const subjects = response?.data?.data || []

    setAllSubjects(subjects)

    const optionalNumbers = [...new Set(
      subjects.filter((s: { is_compulsory: number }) => s.is_compulsory !== 1).map((s: { option_number: any }) => s.option_number)
    )].sort((a, b) => (a as number) - (b as number))

    setOptionalSubjectCount(optionalNumbers)

  } catch (error) {
    console.error(error)
    setAllSubjects([])
    setIsSubjectApiError(true)
  } finally {
    setIsSubjectApiLoading(false)
  }
}


  const stageSections: any = (name: string) => {
    switch (name) {
      case 'Enquiry':
        return ['Upload Documents']

      case 'School visit':
        return []

      case 'Registration':
        return ['Upload Documents']

      case ENQUIRY_STAGES?.REGISTRATION_FEES:
        return []

      case 'Competency test':
        return []

      case 'Admission Status':
        if (enquiryType?.name?.includes('PSA') || enquiryType?.name?.includes('Kids club')) {
          return ['VAS']
        } else {
          return ['Subject Selection', 'Default Fees', 'VAS'] //Concession
        }

      case 'Payment':
        return []

      case 'Admitted or Provisional Approval':
        return []

      default:
        return <></>
    }
  }

  const loadJourney = () => {
    // const regFeeStatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.REGISTRATION_FEES)
    const regFeeStatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.REGISTRATION_FEES)
    
    const journeyIndex = enquiryType?.stages?.findIndex(
      (stage: any) => stage.name === ENQUIRY_STAGES?.REGISTRATION_FEES
    )
    const journeyIndex2 = enquiryType?.stages?.findIndex((stage: any) => stage.name === ENQUIRY_STAGES?.REGISTRATION)
    if (regFeeStatus && regFeeStatus?.status == 'In Progress' && journeyIndex < journeyIndex2 && journeyIndex != -1) {
      const regFeeStatusStg = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.REGISTRATION_FEES)
      setActiveStageData(regFeeStatusStg)
      setSelectedOptions('')
    } else {
      const stageStatusObject = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.COMPETENCY_TEST)
      if (stageStatusObject?.status == ENQUIRY_STATUS?.PASSED || stageStatusObject?.status == ENQUIRY_STATUS?.FAILED) {
        const stat = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.ADMISSION_STATUS)
        const admisionStat = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.ADMISSION_STATUS)

        if (admisionStat?.status == ENQUIRY_STATUS?.APPROVED) {
          const stageStat = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.PAYMENT)
          const paymentStat = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, 'Payment')

          if (paymentStat?.status == ENQUIRY_STATUS?.COMPLETED) {
            const finalStage = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.ADMITTED_PROVISIONAL)
            setActiveStageData(finalStage)
            setSelectedOptions('Upload Documents')
          } else if (paymentStat?.status == ENQUIRY_STATUS?.PROGRESS) {
            const dd = stageSections(stat?.name)

            setActiveStageData(stageStat)
            setSelectedOptions(dd[0])
          } else {
            const dd = stageSections(stat?.name)

            setActiveStageData(stat)
            setSelectedOptions(dd[0])
          }
        } else {
          const dd = stageSections(stat?.name)

          setActiveStageData(stat)
          setSelectedOptions(dd[0])
        }
      } else {
        const reverseIndex = [...enquiryDetails?.enquiry_stages]
          .reverse()
          .findIndex(stage => stage.status === ENQUIRY_STATUS?.COMPLETED)
        const originalIndex = reverseIndex !== -1 ? enquiryDetails?.enquiry_stages.length - 1 - reverseIndex : -1

        if (originalIndex != -1) {
          const stageNameVal =
            enquiryDetails?.enquiry_stages[originalIndex + 1]?.stage_name == ENQUIRY_STAGES?.SCHOOL_VISIT
              ? enquiryDetails?.enquiry_stages[originalIndex + 2]?.stage_name
              : enquiryDetails?.enquiry_stages[originalIndex + 1]?.status != ENQUIRY_STATUS?.APPROVED ? enquiryDetails?.enquiry_stages[originalIndex + 1]?.stage_name :  enquiryDetails?.enquiry_stages[originalIndex + 2]?.status == ENQUIRY_STATUS?.PROGRESS ? enquiryDetails?.enquiry_stages[originalIndex + 2]?.stage_name : enquiryDetails?.enquiry_stages[originalIndex + 1]?.stage_name
          const stageDat = getObjectByKeyVal(enquiryTypeData?.stages, 'name', stageNameVal)
          const stageDetails = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, stageDat?.name)
  
          //  stageDetails?.stage_name == ENQUIRY_STAGES?.COMPETENCY_TEST &&
          if (
            (stageDat && stageDetails?.status == ENQUIRY_STATUS?.OPEN) ||
            stageDetails?.status == ENQUIRY_STATUS?.PROGRESS ||
            stageDetails?.status == ENQUIRY_STATUS?.APPROVED ||
            stageDetails?.status == ENQUIRY_STATUS?.ADMITTED ||
            stageDetails?.status == ENQUIRY_STATUS?.PROVISIONAL
          ) {
            setActiveStageData(stageDat)
            if (stageDat?.stage_forms && stageDat?.stage_forms?.length) {
              setSelectedOptions(stageDat?.stage_forms[0]?.name)
            } else {
              const dd = stageSections(stageDat?.name)
              setSelectedOptions(dd[0])
            }
          } else {
            const data = enquiryType?.stages[originalIndex]
            if (data?.name == ENQUIRY_STAGES?.SCHOOL_VISIT) {
              setActiveStageData(enquiryType?.stages[originalIndex - 1])
              setSelectedOptions(enquiryType?.stages[originalIndex - 1]?.stage_forms[0]?.name)
            } else {
              setActiveStageData(enquiryType?.stages[originalIndex])
              setSelectedOptions(enquiryType?.stages[originalIndex]?.stage_forms[0]?.name)
            }
          }
        } else {
          setActiveStageData(enquiryType.stages[0])
          setSelectedOptions(enquiryType.stages[0]?.stage_forms[0]?.name)
        }

        //Bypass stage for development
        // setActiveStageData({ name: 'Registration Fees' })
        // setSelectedOptions('Subject Selection')
      }
    }
  }

  const setInitialForm = (response: any, enquiryDetails: any) => {
    //Bypass stage for development
    // const enqStage = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.ADMISSION_STATUS)

    // setActiveStageData(enqStage)
    // setSelectedOptions(enqStage?.stage_forms[0]?.name)

    const regStatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.REGISTRATION)

    if (enquiryDetails && enquiryDetails?.enquiry_stages && view && regStatus) {
      const enquirystatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.ENQUIRY)

      const enqStage = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.ENQUIRY)
      if ((enquirystatus?.status == 'Open' || enquirystatus?.status == 'In Progress') && enqStage && regStatus) {
        setActiveStageData(enqStage)
        setSelectedOptions(enqStage?.stage_forms[0]?.name)
      } else {
        loadJourney()
      }
    } else {
      const stageDateNew = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.REGISTRATION)

      if (registration && stageDateNew) {
        if (regStatus?.status == ENQUIRY_STATUS?.COMPLETED) {
          loadJourney()
        } else {
          const regFeeStatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.REGISTRATION_FEES)
          const journeyIndex = enquiryType?.stages.findIndex(
            (stage: any) => stage.name === ENQUIRY_STAGES?.REGISTRATION_FEES
          )
          const journeyIndex2 = enquiryType?.stages.findIndex(
            (stage: any) => stage.name === ENQUIRY_STAGES?.REGISTRATION
          )

          if (
            regFeeStatus?.status !== ENQUIRY_STATUS?.COMPLETED &&
            journeyIndex < journeyIndex2 &&
            journeyIndex != -1
          ) {
            const regFeeStatusSatge = getObjectByKeyVal(
              enquiryTypeData?.stages,
              'name',
              ENQUIRY_STAGES?.REGISTRATION_FEES
            )
            setActiveStageData(regFeeStatusSatge)
            setSelectedOptions('')
          } else {
            const stageDat = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.REGISTRATION)
            if (stageDat) {
              setActiveStageData(stageDat)
              setSelectedOptions(stageDat?.stage_forms[0]?.name)
            } else {
              setActiveStageData(response.stages[0])
              setSelectedOptions(response.stages[0]?.stage_forms[0]?.name)
            }
          }
        }
      } else if (response && response?.stages) {
        if (enquiryDetails && enquiryDetails?.enquiry_stages && enquiryDetails?.enquiry_stages?.length) {
          loadJourney()
        } else {
          setActiveStageData(response.stages[0])
          setSelectedOptions(response.stages[0]?.stage_forms[0]?.name)
        }
      }
    }
  }

  const getFormData = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/${enquiryID}`,
      authToken: authToken
    }

    const response = await getRequest(params)
    if (response.status) {
      setDynamicFormData(response.data)
    }
    setGlobalState({ isLoading: false })
  }

  useEffect(() => {
    if (enquiryID) {
      getFormData()
    }
  }, [enquiryID, renderData])

  //Handler for screen width.
  useEffect(() => {

    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  const handleToggle = (option: string) => {
    setSelectedOptions(option)
  }

  //Handler For Inputs
  const handleEnquiryType = (event: any) => {
    setEnquiryType(event.target.value as string)
    //setInitialForm(event.target.value)
  }

  // Handle Stepper

  const handleCancel = () => {
    // handleRoleDialog(false)
    if (enquiryDetails && enquiryDetails?.enquiry_stages) {
      const enquirystatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.ENQUIRY)
      const regStatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.REGISTRATION_FEES)
      const redirect = regStatus && regStatus?.status ? regStatus?.status == ENQUIRY_STATUS?.COMPLETED : true
      if (enquirystatus?.status != 'Open' && enquirystatus?.status != ENQUIRY_STATUS?.PROGRESS && redirect) {
        router.push('/registered-student-listing')
      } else {
        router.push('/enquiries')
      }
    } else {
      router.push('/enquiries')
    }
  }

  const moveToNextStageAPI = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/${enquiryID}/move-to-next-stage`,
      authToken: authToken,
      data: {
        currentStage: activeStageData?.name
      }
    }
    const response = await patchRequest(params)

    setGlobalState({ isLoading: false })
  }

  const handleNext = () => {
    // const journeyIndex = enquiryType?.stages.findIndex((stage: any) => stage.name === 'Registration')
    // if (journeyIndex < enquiryType?.stages?.length - 1) {
    //   setActiveStageData(enquiryType?.stages[journeyIndex])
    //   setSelectedOptions(enquiryType?.stages[journeyIndex]?.stage_forms[0]?.name)
    // }
    moveToNextStageAPI().then(() => {
      setGlobalState({ isLoading: true })
      setTimeout(() => {
        setGlobalState({ isLoading: false })
        if (pathname == '/enquiries/create/') {
          router.push(`/enquiries/view/${enquiryID}`)
        } else {
          window.location.reload()
        }
        if (setRefreshList) {
          setRefreshList(!refreshList)
        }
      }, 3000)
    })
  }

  const setNextStage = () => {
    if (pathname == '/enquiries/create/') {
      router.push(`/enquiries/view/${enquiryID}`)
    } else {
      const journeyIndex = enquiryType?.stages.findIndex((stage: any) => stage.name === activeStageData?.name)

      const stageSectionsVal = stageSections(activeStageData?.name)
      let ind = null
      if (stageSectionsVal && stageSectionsVal?.length && stageSectionsVal?.includes(selectedOptions)) {
        ind = stageSectionsVal.findIndex((val: any) => val === selectedOptions)
      }

      if (ind >= 0 && stageSectionsVal?.length && stageSectionsVal?.length - 1 != ind) {
        setSelectedOptions(stageSectionsVal[ind + 1])
      } else {
        if (journeyIndex < enquiryType?.stages?.length - 1) {
          const cc = enquiryType?.stages[journeyIndex + 1]
          let nextIndex = 1
          if (cc?.name == ENQUIRY_STAGES?.SCHOOL_VISIT) {
            nextIndex = 2
          }
          setActiveStageData(enquiryType?.stages[journeyIndex + nextIndex])

          if (enquiryType?.stages[journeyIndex + nextIndex]?.stage_forms.length) {
            setSelectedOptions(enquiryType?.stages[journeyIndex + nextIndex]?.stage_forms[0]?.name)
          } else {
            if (stageSections(enquiryType?.stages[journeyIndex + nextIndex]?.name)?.length) {
              setSelectedOptions(stageSections(enquiryType?.stages[journeyIndex + nextIndex]?.name)[0])
            }
          }
        }
      }
      setFormCompletion()
    }
  }

  const goToNextStep = () => {
    if (selectedOptions != 'Subject Selection' && selectedOptions != 'Default Fees' && selectedOptions != 'VAS') {
      moveToNextStageAPI().then(() => {
        if (setRefreshList) {
          setRefreshList((prevState: any) => {
            return !prevState
          })
        } else {
          window.location.reload()
        }
        setNextStage()
      })
    } else {
      let optionVal: any = null
      if (selectedOptions == 'Subject Selection') {
        optionVal = 'Default Fees'
      } else if (selectedOptions == 'Default Fees') {
        optionVal = 'VAS'
      }
      // else if(selectedOptions == 'VAS'){
      //   optionVal = 'Concession'
      // }
      setAdmissionOptions((prevState: any) => {
        return {
          ...prevState,
          [optionVal]: false
        }
      })
      setNextStage()
    }
  }

  const isNotMandatory = false
  const handleSubmit = () => {
    const activeStageStatus = getObjectKeyValSlug(dynamicFormData?.enquiry_stages, activeStageData?.name)

    if (
      selectedOptions == 'Upload Documents' ||
      selectedOptions == 'Subject Selection' ||
      selectedOptions == 'VAS' ||
      selectedOptions == 'Default Fees' ||
      selectedOptions == 'Concession' ||
      !activeStageData?.is_mandatory ||
      activeStageData?.name == ENQUIRY_STAGES?.PAYMENT ||
      activeStageData?.name == ENQUIRY_STAGES?.REGISTRATION_FEES ||
      activeStageData?.name == ENQUIRY_STAGES?.COMPETENCY_TEST ||
      activeStageData?.name == ENQUIRY_STAGES?.SCHOOL_VISIT
    ) {
      if (activeStageData?.stage_forms && activeStageData?.stage_forms?.length) {
       
        const slugIndex = activeStageData?.stage_forms.findIndex((stage: any) => stage.name === selectedOptions)
        const formIndex = findIndexBySlug(activeStageData?.stage_forms, activeStageData?.stage_forms[slugIndex]?.slug)
        if (formIndex === activeStageData?.stage_forms.length - 1) {
         
          if (stageSections && stageSections(activeStageData?.name)?.length) {
            setSelectedOptions(stageSections(activeStageData?.name)[0])
          }
          if (activeStageData?.name == 'Enquiry' || activeStageData?.name == 'Registration') {
            setRegDisabled(false)
          } else {
            goToNextStep()
          }
        } else {
          if (selectedOptions == 'Upload Documents' || activeStageData?.stage_forms.length == 0) {
            if (enquiryTypeData?.slug == 'createKidsClubEnquiry') {
              handleNext()
            } else {
              goToNextStep()
            }
          } else {
            setSelectedOptions(activeStageData?.stage_forms[formIndex + 1]?.name)
          }
        }
        // if (data.data) {
        //   setEnquiryID(data?.data?._id)
        // }
        if (handleTypeDropDown) {
          handleTypeDropDown(true)
        }
      } else {
        goToNextStep()
      }
    } else {
      setSubmitProp(true)
      setGlobalState({ isLoading: true })
    }
  }
  const handleSuccessDialogClose = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1000)
    setSuccessDialog(false)
  }
  const handleGoBack = () => {
    const journeyIndex = enquiryType?.stages.findIndex((stage: any) => stage.name === activeStageData?.name)
    if (journeyIndex >= 0) {
      setActiveStageData(enquiryType?.stages[journeyIndex - 1])
      if (
        enquiryType?.stages[journeyIndex - 1] &&
        enquiryType?.stages[journeyIndex - 1]?.name == ENQUIRY_STAGES?.ADMISSION_STATUS
      ) {
        const dd = stageSections(ENQUIRY_STAGES?.ADMISSION_STATUS)
        setSelectedOptions(dd[0])
      } else {
        setSelectedOptions(enquiryType?.stages[journeyIndex - 1]?.stage_forms[0]?.name)
      }
    }
  }

  const submitPropsFunction = (data: any) => {
    setSubmitProp(data.action)
    if (data.status) {
      if (activeStageData?.stage_forms && activeStageData?.stage_forms?.length) {
        const slugIndex = activeStageData?.stage_forms.findIndex((stage: any) => stage.name === selectedOptions)
        const formIndex = findIndexBySlug(activeStageData?.stage_forms, activeStageData?.stage_forms[slugIndex]?.slug)
        if (formIndex === activeStageData?.stage_forms.length - 1) {
          if (stageSections && stageSections(activeStageData?.name)?.length) {
            setSelectedOptions(stageSections(activeStageData?.name)[0])
          }

          if (activeStageData?.name == 'Enquiry' || activeStageData?.name == 'Registration') {
            setRegDisabled(false)
          } else {
            goToNextStep()
          }
          if (activeStageData?.name == 'Enquiry' && data?.data?.flag && data?.data?.flag == 'duplicate') {
            // setDuplicateDialog(true)
            // setDuplicateDialogMessage(data?.data?.message)
            // setDuplicateEnquiryId(data.data?.enquiry_id)
          } else {
            setDialogTitle(`${activeStageData?.name} - ${data?.data?.enquiry_number || ''} Submitted Successfully!`)
            setSuccessDialog(true)
          }
        } else {
          if (selectedOptions == 'Upload Documents' || activeStageData?.stage_forms.length == 0) {
            goToNextStep()
          } else {
            setSelectedOptions(activeStageData?.stage_forms[formIndex + 1]?.name)
          }
        }
        if (data.data) {
          setEnquiryID(data?.data?._id)
          setEnquiryDetailsObj(data?.data)
        }
        if (handleTypeDropDown) {
          handleTypeDropDown(true)
        }
      } else {
        goToNextStep()
      }
      setRenderData(!renderData)
    } else {
      //setOpenErrorDialog(true)
      setGlobalState({ isLoading: false })
    }
    setGlobalState({ isLoading: false })
  }

  const classDetails = [
    {
      id: 1,
      className: enquiryDetails?.student_details?.grade?.value
    }
  ]
  const [reassignDialog, setReassignDialog] = useState<boolean>(false)
  const handleReassignDialogClose = () => setReassignDialog(false)
  const handlerReassign = () => {
    setReassignDialog(false)
    setSuccessDialog(true)
  }

  //Handler for schoolTour Dialog
  const cafeteriaDialogClose = () => {
    setCafeteriaDialog(false)
  }

  const handleSummarCampDialogClose = () => {
    setSummerCampDialog(false)
  }

  const handleKidsClubDialogClose = () => {
    setKidsClubDialog(false)
    setViewMode(false)
  }
  const handlePsaDialogClose = () => {
    setPsaDialog(false)
  }

  const handleEditVas = (params: any) => {
    setViewMode(false)

    if (params.row?.name == 'cafeteria_details') {
      setCafeteriaDialog(true)
    }
    if (params.row?.name == 'kids_club_details') {
      setKidsClubDialog(true)
    }
    if (params.row?.name == 'psa_details') {
      setPsaDialog(true)
    }
    if (params.row?.name == 'summer_camp_details') {
      setSummerCampDialog(true)
    }
    if (params.row?.name == 'transport_details') {
      setTransportDialog(true)
    }

    // debugger;
  }

  const handleViewMode = (params: any) => {
    setViewMode(true)
    if (params.row?.name == 'cafeteria_details') {
      setCafeteriaDialog(true)
    }
    if (params.row?.name == 'kids_club_details') {
      setKidsClubDialog(true)
    }
    if (params.row?.name == 'psa_details') {
      setPsaDialog(true)
    }
    if (params.row?.name == 'summer_camp_details') {
      setSummerCampDialog(true)
    }
    if (params.row?.name == 'transport_details') {
      setTransportDialog(true)
    }
  }

  const getVasName = (val: string) => {
    switch (val) {
      case 'transport_details':
        return 'Transport'
      case 'cafeteria_details':
        return 'Cafeteria'
      case 'kids_club_details':
        return 'KidsClub'
      case 'psa_details':
        return 'Psa'
      case 'summer_camp_details':
        return 'SummerCamp'
    }
  }

  const removeVasData = async (name: any) => {
    setGlobalState({
      isLoading: true
    })
    const params = {
      url: `/marketing/admission/${enquiryID}/vas/remove?type=${name}`,
      authToken: authToken
    }

    const response = await postRequest(params)
    if (response?.status) {
      setRefresh(!refresh)
    }
    setGlobalState({
      isLoading: false
    })
  }

  const handleVasData = (params: any, val: any) => {
    if (!val) {
      const name = getVasName(params?.row?.name)
      removeVasData(name)
    }
    setVasData({
      ...vasData,
      [params?.row?.name]: val
    })
  }
  const vasRows: any = [
    { id: 1, service: 'Would You Like To Opt For Transportation?', name: 'transport_details' },
    { id: 2, service: 'Would You Like To Opt For Cafeteria', name: 'cafeteria_details' },
    // { id: 3, service: 'Would You Like To Opt For Hostel', name: 'hostel_details' },
    { id: 4, service: 'Would You Like To Opt For Kids Club', name: 'kids_club_details' }
    // { id: 5, service: 'Would You Like To Opt For PSA (Post School Activities)', name: 'psa_details' },
    // { id: 6, service: 'Would You Like To Opt For Summar Camp', name: 'summer_camp_details' }
  ]

  const vasRowsPSA: any = [
    { id: 1, service: 'Would You Like To Opt For Transportation?', name: 'transport_details' },
    { id: 2, service: 'Would You Like To Opt For Cafeteria', name: 'cafeteria_details' },
    { id: 4, service: 'Would You Like To Opt For Kids Club', name: 'kids_club_details' }
  ]

  const vasRowsKidsClub: any = [
    { id: 1, service: 'Would You Like To Opt For Transportation?', name: 'transport_details' },
    { id: 2, service: 'Would You Like To Opt For Cafeteria', name: 'cafeteria_details' },
    { id: 5, service: 'Would You Like To Opt For PSA (Post School Activities)', name: 'psa_details' }
  ]
  const vasColumns: any = [
    {
      flex: 1,
      field: 'service',
      headerName: 'Other Added Services',
      width: 600
    },
    {
      flex: 0.2,
      field: 'select',
      headerName: 'Select',
      renderCell: (params: any) => (
        <Checkbox
          color='primary'
          checked={vasData[params?.row?.name]}
          onClick={(e: any) => {
            handleVasData(params, e.target.checked)
          }}
        />
      ),
      width: 350
    },
    {
      flex: 0.2,
      minWidth: 90,
      field: 'action',
      headerName: 'Action',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: any) => {
        return (
          <>
            {params.row.id !== 3 && vasData && vasData[params?.row?.name] ? (
              <>
                {!vasDetails || !vasDetails[params?.row?.name] ? (
                  <Tooltip title='Add'>
                    <IconButton disableFocusRipple disableRipple onClick={() => handleEditVas(params)}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                ) : null}
                {vasDetails && vasDetails[params?.row?.name] ? (
                  <Tooltip title='Edit'>
                    <IconButton disableFocusRipple disableRipple onClick={() => handleEditVas(params)}>
                      <span className='icon-edit-2'></span>
                    </IconButton>
                  </Tooltip>
                ) : null}
                {vasDetails && vasDetails[params?.row?.name] ? (
                  <Tooltip title='View'>
                    <IconButton
                      disableFocusRipple
                      disableRipple
                      onClick={() => {
                        handleViewMode(params)
                      }}
                    >
                      <span className='icon-eye'></span>
                    </IconButton>
                  </Tooltip>
                ) : null}
              </>
            ) : null}
          </>
        )
      }
    }
  ]

  const hanldeFinalData = (data: any) => {
    hanldeSaveSubjects(data)
    //setFinalSelectedSubjects(data)
  }

  const pathname = usePathname()

  // const handleTermsClick = async () => {
  //   // setGlobalState({ isLoading: true })
  //   // const params = {
  //   //   url: `/marketing/enquiry/${enquiryDetails?._id}/${enquiryDetails?.school_location.id}/generate-terms-and-conditions-pdf`,
  //   //   authToken: authToken
  //   // }

  //   // const response = await getRequest(params)
  //   // if (response?.status) {
  //   //   //const fileURL = `https://storage.googleapis.com/ampersand-mdm-vertex/${response?.data}${googlAlgo}`
  //   //   window.open(response?.data?.url, '_blank')
  //   // }
  //   setGlobalState({ isLoading: true })
  //   const params = {
  //     url: `marketing/enquiry/${enquiryID}/${enquiryDetails?.school_location?.id}/generate-terms-and-conditions-pdf`
  //   }

  //   const response = await getRequest(params)
  //   if (response?.status) {
  //     setTermsCondition(true)

  //     setPDFUrl(response?.data?.url)
  //   } else {
  //     setApiResponseType({ status: true, message: 'Terms & Conditions Not Found!' })
  //   }
  //   setGlobalState({ isLoading: false })
  //   // setGlobalState({ isLoading: false })
  // }

  const handleTermsClose = () => {
    setTermsCondition(false)
  }

  const handleTermsAndConditionMail = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/${enquiryID}/trigger-terms-and-condition-email`
    }

    const response = await getRequest(params)
    if (response?.status) {
      setsuccessDialogTerms(true)
    }
    setGlobalState({ isLoading: false })
  }

  const renderForms = (activeSatge: any) => {
    switch (activeSatge?.name) {
      case 'Enquiry':
        return (
          <>
            {activeSatge.stage_forms && activeSatge.stage_forms.length
              ? activeSatge.stage_forms.map((label: any, index: number) => (
                  <StyledChipProps
                    key={index}
                    label={label.name}
                    onClick={() => handleToggle(label.name)}
                    color={selectedOptions?.includes(label.name) ? 'primary' : 'default'}
                    variant='filled'
                    sx={{ mr: 4 }}
                  />
                ))
              : null}
            <StyledChipProps
              label={'Upload Documents'}
              disabled={!enquiryID}
              onClick={() => handleToggle('Upload Documents')}
              color={selectedOptions?.includes('Upload Documents') ? 'primary' : 'default'}
              variant='filled'
              sx={{ mr: 4 }}
            />
            {activeSatge.stage_forms && activeSatge.stage_forms.length
              ? activeSatge.stage_forms.map((val: any, index: number) => {
                  return selectedOptions == val.name ? (
                    <>
                      <CreateForm
                        activeStageName={activeStageData?.name}
                        auto={false}
                        setDynamicFormData={setDynamicFormData}
                        url={
                          dynamicFormData && !enquiryType?.name?.includes('Re Admission') && pathname != '/enquiries/create/'
                            ? `marketing/enquiry/${enquiryID}`
                            : 'marketing/enquiry/create'
                        }
                        
                        requestParams={
                          dynamicFormData && !enquiryType?.name?.includes('Re Admission') && pathname != '/enquiries/create/'
                            ? {
                                reqType: 'PATCH'
                              }
                            : {
                                reqType: 'POST'
                              }
                        }
                        slug={val.slug}
                        appendRequest={{
                          metadata: {
                            form_id: val?._id?.toString(),
                            enquiry_type_id: enquiryType?._id
                          }
                        }}
                        submitProp={submitProp}
                        submitPropsFunction={submitPropsFunction}
                        dataId={enquiryType?._id}
                        dynamicFormData={dynamicFormData}
                        {...(index == 0 && { attachExternalFields: true })}
                        {...(index == 0 && enquiryType?.name.includes('PSA') && { externalPSAFields: true })}
                        {...(index == 0 && enquiryType?.name.includes('Kids club') && { externalKidsClubFields: true })}
                        enquiryTypeData={enquiryTypeData}
                        setSubmitProp={setSubmitProp}
                        authToken={authToken}
                      />
                    </>
                  ) : null
                })
              : null}

            {selectedOptions == 'Upload Documents' ? (
              <UploadForms
                setRrefreshStatus={setRrefreshStatus}
                activeStageName={activeStageData?.name}
                enquiryId={enquiryID}
              />
            ) : null}
          </>
        )

        break

      case 'School visit':
        return 'School visit'

      case 'Registration':
        return (
          <>
            {activeSatge.stage_forms && activeSatge.stage_forms.length
              ? activeSatge.stage_forms.map((label: any, index: number) => (
                  <StyledChipProps
                    key={index}
                    label={label.name}
                    onClick={() => handleToggle(label.name)}
                    //disabled={label?.name != selectedOptions}
                    color={selectedOptions?.includes(label.name) ? 'primary' : 'default'}
                    variant='filled'
                    sx={{ mr: 4 }}
                  />
                ))
              : null}
            <StyledChipProps
              label={'Upload Documents'}
              //disabled={!regComplete}
              onClick={() => handleToggle('Upload Documents')}
              color={selectedOptions?.includes('Upload Documents') ? 'primary' : 'default'}
              variant='filled'
              sx={{ mr: 4 }}
            />
            {activeSatge.stage_forms && activeSatge.stage_forms.length
              ? activeSatge.stage_forms.map((val: any, index: number) => {
                  return (
                    selectedOptions == val.name && (
                      <>
                        <CreateForm
                          activeStageName={activeStageData?.name}
                          auto={false}
                          url={`marketing/enquiry/${enquiryID}`}
                          requestParams={{
                            reqType: 'PATCH'
                          }}
                          slug={val.slug}
                          appendRequest={{
                            metadata: {
                              form_id: val._id.toString(),
                              enquiry_type_id: enquiryType?._id
                            }
                          }}
                          submitProp={submitProp}
                          submitPropsFunction={submitPropsFunction}
                          dataId={enquiryType?._id}
                          dynamicFormData={dynamicFormData}
                          enquiryTypeData={enquiryTypeData}
                          authToken = {authToken}
                        />
                        {selectedOptions == 'Bank details' ? (
                          enquiryDetails?.terms_and_conditions_email_sent &&
                          enquiryDetails?.terms_and_conditions_email_sent == true ? (
                            <p>Pending Acceptance of Terms & Conditions</p>
                          ) : (
                            <div style={{ marginTop: '20px' }}>
                              <button
                                onClick={handleTermsAndConditionMail}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  textDecoration: 'underline',
                                  color: '#007bff',
                                  fontWeight: 'bold',
                                  cursor: 'pointer'
                                }}
                              >
                                Terms & Conditions
                              </button>
                            </div>
                          )
                        ) : null}
                      </>
                    )
                  )
                })
              : null}
            {selectedOptions == 'Upload Documents' ? (
              <>
                <UploadForms
                  setRrefreshStatus={setRrefreshStatus}
                  activeStageName={activeStageData?.name}
                  enquiryId={enquiryID}
                />
                {/* <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={handleTermsAndConditionMail}
                    style={{
                      background: 'none',
                      border: 'none',
                      textDecoration: 'underline',
                      color: '#007bff',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Terms & Conditions
                  </button>
                </div> */}
              </>
            ) : null}
          </>
        )

      case ENQUIRY_STAGES?.REGISTRATION_FEES:
        const condition = getObjectKeyValSlug(dynamicFormData?.enquiry_stages, ENQUIRY_STAGES?.REGISTRATION_FEES)
        console.log('SS>>', enquiryDetails?.registration_fees_paid)

        return enquiryDetails?.registration_fees_paid ? (
          <>
            <Box
              sx={{
                width: '100%',
                borderRadius: '8px',
                padding: '24px',
                background: theme.palette.customColors.surface1,
                boxShadow: '2px 2px 12px 0px #4C4E6426',
                mt: 3,
                mb: 6
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Image src={SuccessLogo} width={100} height={100} alt='Success' />

                <Box>
                  <Typography
                    variant='h6'
                    color={'primary.dark'}
                    sx={{ textTransform: 'capitalize', lineHeight: '22px' }}
                  >
                    Registration Fees Paid!
                  </Typography>
                  {enquiryDetails?.generated_kit_number ? (
                    <Typography sx={{ mt: '10px' }}>Kit Count: {enquiryDetails?.generated_kit_number}</Typography>
                  ) : null}
                </Box>
              </Box>
              <KitDownload
                enquiryId={enquiryID}
                kitNumberProp={enquiryDetails?.kit_number}
                setRefreshList={setRefreshList}
              />
            </Box>
          </>
        ) : (
          <Box>
            <Box>
              <Typography variant='h6' sx={{ textTransform: 'capitalize', lineHeight: '22px' }} align='center'>
                Pending for registration fees process
              </Typography>
            </Box>
          </Box>
        )

      case 'Competency test':
        const competencyStatus = getObjectKeyValSlug(dynamicFormData?.enquiry_stages, 'Competency test')
        testStatus = competencyStatus?.status
        // getCompetenctTestResult()
        if (competencyStatus?.status == 'Failed') {
          return 'Principal Rejected'
        } else if (competencyStatus?.status == ENQUIRY_STATUS?.PROGRESS) {
          return (
            <Box
              sx={{
                width: '100%',
                borderRadius: '8px',
                padding: '24px',
                background: theme.palette.customColors.surface1,
                boxShadow: '2px 2px 12px 0px #4C4E6426',
                mt: 3,
                mb: 6
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                {/* <Image src={SuccessLogo} width={100} height={100} alt='Success' /> */}

                <Box>
                  <Tooltip title='Click here to view'>
                    <Typography
                      variant='h6'
                      color={'primary.dark'}
                      sx={{
                        textTransform: 'capitalize',
                        textDecoration: 'underline',
                        lineHeight: '22px',
                        cursor: 'pointer'
                      }}
                      onClick={openCompetencyTest}
                    >
                      Competency Test Scheduled
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ mt: 2, mb: 5 }}>
                <Divider />
              </Box>
              <Grid container xs={12} spacing={5}>
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle1'
                    color={'text.primary'}
                    sx={{ textTransform: 'capitalize', lineHeight: '17.6px' }}
                  >
                    Test Details
                  </Typography>
                </Grid>
                <Grid sx={{ mt: 0.5 }} item container xs={12} spacing={5}>
                  <Grid item xs={12} sm={12} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label='Scheduled Date'
                        slots={{
                          openPickerIcon: CalendarIcon
                        }}
                        format='DD/MM/YY'
                        value={dayjs(competenctData?.date)}
                        slotProps={{ textField: { fullWidth: true } as TextFieldProps }}
                        className='readOnly'
                        readOnly={true}
                        sx={{
                          width: '100%',
                          '& .MuiInputBase-input': {
                            padding: '0px' // Adjust padding as needed
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={12} md={4}>
                    <TextField
                      fullWidth
                      label='Time '
                      value={competenctData?.slot}
                      placeholder='Time'
                      InputProps={{
                        readOnly: true
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          padding: '0px' // Adjust padding as needed
                        }
                      }}
                      className='readOnly'
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={4}>
                    <TextField
                      fullWidth
                      label='Mode'
                      value={competenctData?.mode}
                      placeholder='Mode'
                      InputProps={{
                        readOnly: true
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          padding: '0px' // Adjust padding as needed
                        }
                      }}
                      className='readOnly'
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )
        }

        return competencyStatus?.status == 'Open' ? (
          <a href='javascript:void(0)' onClick={openCompetencyTest}>
            Apply For Competency Test
          </a>
        ) : (
          ''
        )

      case 'Admission Status':
        const admissionCondition = getObjectKeyValSlug(dynamicFormData?.enquiry_stages, 'Admission Status')
        const journeyIndex = enquiryType?.stages.findIndex(
          (stage: any) => stage.name === ENQUIRY_STAGES?.COMPETENCY_TEST
        )

        return admissionCondition?.status == 'Approved' ? (
          <>
            {stageSections && stageSections('Admission Status').length
              ? stageSections('Admission Status').map((label: any, index: number) => (
                  <StyledChipProps
                    disabled={admissionOptions[label]}
                    key={index}
                    label={label}
                    onClick={() => handleToggle(label)}
                    // disabled={label != selectedOptions}
                    color={selectedOptions?.includes(label) ? 'primary' : 'default'}
                    variant='filled'
                    sx={{ mr: 4, mb: 4 }}
                  />
                ))
              : null}

            {selectedOptions === 'Subject Selection' &&
              (isSubjectApiLoading ? (
                <Typography sx={{ mr: 2, fontWeight: 400, color: 'text.secondary', py: 4 }} align='center'>
                  Loading subjects...
                </Typography>
              ) : isSubjectApiError ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ mb: 2, color: 'error.main' }}>
                    Failed to load subjects. Please try again.
                  </Typography>
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={() => {
                      setIsSubjectApiError(false)
                      setIsSubjectApiLoading(true)
                      getSubjectData() 
                    }}
                  >
                  Refetch Subjects
                  </Button>
                </Box>
              ) : allSubjects?.length > 0 ? (
                <SubjectSelectionComponent
                  classDetails={classDetails}
                  allsubjects={allSubjects}
                  hanldeFinalData={hanldeFinalData}
                  handleCancel={handleCancel}
                  optionalSubjectCount={optionalSubjectCount}
                  isSubjectApiLoading={isSubjectApiLoading} 
                />
              ) : (
                <Typography sx={{ mr: 2, fontWeight: 400, color: 'text.secondary', py: 4 }} align='center'>
                  Data Not Found
                </Typography>
              ))}

            {selectedOptions == 'VAS' ? (
              <>
                <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12} md={12}>
                  <Grid item xs={12} md={12}>
                    <DataGrid
                      autoHeight
                      rows={
                        enquiryType?.name.includes('PSA')
                          ? vasRowsPSA
                          : enquiryType?.name?.includes('Kids club')
                          ? vasRowsKidsClub
                          : vasRows
                      }
                      columns={vasColumns}
                      hideFooterPagination
                      sx={{ boxShadow: 0 }}
                    />
                  </Grid>
                </Grid>
              </>
            ) : null}

            {selectedOptions == 'Default Fees' ? (
              <>
                <DefaultFees
                  schoolParentId={enquiryDetails?.is_guest_student ? guestSchoolParentId : schoolParentId}
                  guestStudentSchoolId={enquiryDetails?.school_location?.id}
                  academicYear={
                    getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes
                      ?.short_name_two_digit
                  }
                  enquiryDetails={enquiryDetails}
                  dynamicFormData={dynamicFormData}
                  hanldeFinalData={hanldeFinalData}
                  authToken={authToken}
                  handleNext={handleSubmit}
                  handleCancel={handleCancel}
                />
              </>
            ) : null}
            {/*selectedOptions == 'Concession' ? (
              <DiscountComponent
                // classDetails={classDetails}
                // allsubjects={allSubjects}
                // hanldeFinalData={hanldeFinalData}
                // studentId={1}
                openModal={true}
                header='Request of Concession Coupon'
                academicYear={
                  getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes
                    ?.short_name_two_digit
                }
                enquiryDetails={enquiryDetails}
                authToken={authToken}
                // closeModal={handleCloseConcessionDialog}
              />
            ) : null*/}
          </>
        ) : admissionCondition?.status == ENQUIRY_STATUS?.REJECTED ? (
          <Box>
            <Box>
              <Typography variant='h6' sx={{ textTransform: 'capitalize', lineHeight: '22px' }} align='center'>
                Admission rejected by principal
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box>
              <Typography variant='h6' sx={{ textTransform: 'capitalize', lineHeight: '22px' }} align='center'>
                Waiting for principal approval
              </Typography>
            </Box>
          </Box>
        )

      case 'Payment':
        const paymentCondition = getObjectKeyValSlug(dynamicFormData?.enquiry_stages, 'Payment')

        return paymentCondition?.status != 'Completed' ? (
          'Pending for payment'
        ) : (
          <>
            <Box
              sx={{
                width: '100%',
                borderRadius: '8px',
                padding: '24px',
                background: theme.palette.customColors.surface1,
                boxShadow: '2px 2px 12px 0px #4C4E6426',
                mt: 3,
                mb: 6
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Image src={SuccessLogo} width={100} height={100} alt='Success' />

                <Box>
                  <Typography
                    variant='h6'
                    color={'primary.dark'}
                    sx={{ textTransform: 'capitalize', lineHeight: '22px' }}
                  >
                    Payment Process Succesfully Completed !
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, mb: 5 }}>
                <Divider />
              </Box>
              <Grid container xs={12} spacing={5}>
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle1'
                    color={'text.primary'}
                    sx={{ textTransform: 'capitalize', lineHeight: '17.6px' }}
                  >
                    Payment Details
                  </Typography>
                </Grid>
                <Grid sx={{ mt: 0.5 }} item container xs={12} spacing={5}>
                  <Grid item xs={12} sm={12} md={4}>
                    <TextField
                      fullWidth
                      label='Admission Fee    '
                      value={'20,000'}
                      placeholder='Admission Fee  '
                      defaultValue={'20,000'}
                      InputProps={{
                        readOnly: true
                      }}
                      className='readOnly'
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={4}>
                    <TextField
                      fullWidth
                      label='Payment Mode'
                      value={'Credit Card'}
                      placeholder='Payment Mode'
                      defaultValue={'Credit Card'}
                      InputProps={{
                        readOnly: true
                      }}
                      className='readOnly'
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label='Payment Date And Time'
                        slots={{
                          openPickerIcon: CalendarIcon
                        }}
                        sx={{ width: '100%' }}
                        format='DD/MM/YY hh:mm A'
                        value={dayjs('2024-09-09')}
                        defaultValue={dayjs('2022-04-17')}
                        slotProps={{ textField: { fullWidth: true } as TextFieldProps }}
                        className='readOnly'
                        readOnly={true}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </>
        )

      case 'Admitted or Provisional Approval':
        const addmissionType = getObjectKeyValSlug(dynamicFormData?.enquiry_stages, 'Admitted or Provisional Approval')

      

        if (enquiryDetails?.is_already_existing_student) {
          return (
            <StudentExists
              openModal={true}
              header={'Student already registered'}
              message={'This student is already registered with the given student ID and enrolment number.'}
              closeModal={closeStudentDialog}
            />
          )
        }

        if(
            (
              enquiryDetails?.enquiry_type == 'ReAdmission' ||
              enquiryDetails?.enquiry_type == 'IVT'
            ) && 
              addmissionType?.status == ENQUIRY_STATUS?.PROGRESS
          ){
          return (
            <>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: '24px',
                  background: theme.palette.customColors.surface1,
                  boxShadow: '2px 2px 12px 0px #4C4E6426',
                  mt: 3,
                  mb: 6
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Image src={SuccessLogo} width={100} height={100} alt='Success' />

                  <Box>
                    <Typography
                      variant='h6'
                      color={'primary.dark'}
                      sx={{ textTransform: 'capitalize', lineHeight: '22px' }}
                    >
                     Your Inter Vibgyor Transfer (IVT) request has been successfully submitted.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )
        }

        if (addmissionType?.status == ENQUIRY_STATUS?.PROGRESS) {
          return (
            <>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: '24px',
                  background: theme.palette.customColors.surface1,
                  boxShadow: '2px 2px 12px 0px #4C4E6426',
                  mt: 3,
                  mb: 6
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Image src={SuccessLogo} width={100} height={100} alt='Success' />

                  <Box>
                    <Typography
                      variant='h6'
                      color={'primary.dark'}
                      sx={{ textTransform: 'capitalize', lineHeight: '22px' }}
                    >
                      {enquiryDetails?.enquiry_type == 'readmission_10_11'
                        ? 'Provisional admission for Grade 11 is done. Enrolment will be generated once the student passes out from Grade 10'
                        : 'Payment Received! Thank you for completing the payment. Your admission is under process.'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )
        }

        if (addmissionType?.status == ENQUIRY_STATUS?.ADMITTED) {
          return (
            <>
              <Box
                sx={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: '24px',
                  background: theme.palette.customColors.surface1,
                  boxShadow: '2px 2px 12px 0px #4C4E6426',
                  mt: 3,
                  mb: 6
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Image src={SuccessLogo} width={100} height={100} alt='Success' />

                  <Box>
                    <Typography
                      variant='h6'
                      color={'primary.dark'}
                      sx={{ textTransform: 'capitalize', lineHeight: '22px' }}
                    >
                      {enquiryDetails?.enquiry_type == 'IVT'
                        ? 'Your Inter Vibgyor Transfer (IVT) request has been successfully submitted.'
                        : 'Admission Process Succesfully Completed !'}
                    </Typography>
                    <Typography
                      variant='body2'
                      color={'customColors.mainText'}
                      sx={{ mt: 2, textTransform: 'capitalize', lineHeight: '15.4px' }}
                    >
                      The details related to the student admission are updated below
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2, mb: 5 }}>
                  <Divider />
                </Box>
                <Grid container xs={12} spacing={5}>
                  <Grid item xs={12}>
                    <Typography
                      variant='subtitle1'
                      color={'text.primary'}
                      sx={{ textTransform: 'capitalize', lineHeight: '17.6px' }}
                    >
                      Student Details
                    </Typography>
                  </Grid>
                  <Grid sx={{ mt: 0.5 }} item container xs={12}>
                    <Grid item xs={12} sm={12} md={4}>
                      <TextField
                        fullWidth
                        label='Enrollment Number'
                        value={enquiryNumber?.enrolment_number || '--'}
                        placeholder='Enrollment Number  '
                        InputProps={{
                          readOnly: true
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            padding: '0px !important' // Adjust padding as needed
                          }
                        }}
                        className='readOnly'
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <TextField
                        fullWidth
                        label='GR Number    '
                        value={enquiryNumber?.gr_number || '--'}
                        placeholder='GR Number  '
                        InputProps={{
                          readOnly: true
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            padding: '0px' // Adjust padding as needed
                          }
                        }}
                        className='readOnly'
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant='subtitle1'
                      color={'text.primary'}
                      sx={{ textTransform: 'capitalize', lineHeight: '17.6px' }}
                    >
                      Admission Details
                    </Typography>
                  </Grid>
                  <Grid sx={{ mt: 0.5 }} item container xs={12} spacing={5}>
                    <Grid item xs={12} sm={12} md={4}>
                      <TextField
                        fullWidth
                        label='Admission Fee    '
                        value={finalAdmissionData?.amount}
                        placeholder='Admission Fee  '
                        defaultValue={'20,000'}
                        InputProps={{
                          readOnly: true
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            padding: '0px' // Adjust padding as needed
                          }
                        }}
                        className='readOnly'
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <TextField
                        fullWidth
                        label='Payment Mode'
                        value={finalAdmissionData?.mode_of_payment}
                        placeholder='Payment Mode'
                        defaultValue={''}
                        InputProps={{
                          readOnly: true
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            padding: '0px' // Adjust padding as needed
                          }
                        }}
                        className='readOnly'
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                      <TextField
                        fullWidth
                        label='Payment Date And Time'
                        value={finalAdmissionData?.payment_date_time}
                        placeholder='Payment Date And Time'
                        defaultValue={''}
                        InputProps={{
                          readOnly: true
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            padding: '0px' // Adjust padding as needed
                          }
                        }}
                        className='readOnly'
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </>
          )
        } else if (addmissionType?.status == 'Provisional Admission' && uploadScreen == false) {
          return (
            <>
              {/* <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px', mb: '10px' }}>
                Note:
              </Typography>
              <StyledChipProps
                label={'Upload Documents'}
                onClick={() => handleToggle('Upload Documents')}
                color={selectedOptions?.includes('Upload Documents') ? 'primary' : 'default'}
                variant='filled'
                sx={{ mr: 4 }}
              />
                                     
              {selectedOptions == 'Upload Documents' ? (
                <UploadForms stage={'Admission Granted'} enquiryId={enquiryID} />
              ) : null} */}

              <>
                <Box
                  sx={{
                    width: '100%',
                    borderRadius: '8px',
                    padding: '24px',
                    background: theme.palette.customColors.surface1,
                    boxShadow: '2px 2px 12px 0px #4C4E6426',
                    mt: 3,
                    mb: 6
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Image src={SuccessLogo} width={100} height={100} alt='Success' />

                      <Box>
                        <Typography
                          variant='h6'
                          color={'primary.dark'}
                          sx={{ textTransform: 'capitalize', lineHeight: '22px' }}
                        >
                          { enquiryDetails?.enquiry_type == 'IVT' ? 'Your Inter Vibgyor Transfer (IVT) request has been successfully submitted.' :'Provisional Admission Granted' }
                        </Typography>
                        <Typography
                          variant='body2'
                          color={'customColors.mainText'}
                          sx={{ mt: 2, textTransform: 'capitalize', lineHeight: '15.4px' }}
                        >
                          The details related to the student admission are updated below
                        </Typography>
                      </Box>
                    </Box>

                    {/* Upload Documents Button */}
                    <Button
                      variant='contained'
                      color='primary'
                      // startIcon={<UploadFileIcon />}
                      onClick={() => {
                        setUploadScreen(true)
                      }} // Define function for handling click
                    >
                      Upload Documents
                    </Button>
                  </Box>

                  <Box sx={{ mt: 2, mb: 5 }}>
                    <Divider />
                  </Box>

                  <Grid container xs={12} spacing={5}>
                    <Grid item xs={12}>
                      <Typography
                        variant='subtitle1'
                        color={'text.primary'}
                        sx={{ textTransform: 'capitalize', lineHeight: '17.6px' }}
                      >
                        Student Details
                      </Typography>
                    </Grid>

                    <Grid sx={{ mt: 0.5 }} item container xs={12} spacing={5}>
                      <Grid item xs={12} sm={12} md={4}>
                        <TextField
                          fullWidth
                          label='Enrollment Number'
                          value={enquiryNumber?.enrolment_number || '--'}
                          placeholder='Enrollment Number'
                          InputProps={{
                            readOnly: true
                          }}
                          className='readOnly'
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={4}>
                        <TextField
                          fullWidth
                          label='GR Number'
                          value={enquiryNumber?.gr_number || '--'}
                          placeholder='GR Number'
                          InputProps={{
                            readOnly: true
                          }}
                          className='readOnly'
                        />
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        variant='subtitle1'
                        color={'text.primary'}
                        sx={{ textTransform: 'capitalize', lineHeight: '17.6px' }}
                      >
                        Admission Details
                      </Typography>
                    </Grid>

                    <Grid sx={{ mt: 0.5 }} item container xs={12} spacing={5}>
                      <Grid item xs={12} sm={12} md={4}>
                        <TextField
                          fullWidth
                          label='Admission Fee'
                          value={finalAdmissionData?.amount}
                          placeholder='Admission Fee'
                          InputProps={{
                            readOnly: true
                          }}
                          className='readOnly'
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={4}>
                        <TextField
                          fullWidth
                          label='Payment Mode'
                          value={finalAdmissionData?.mode_of_payment}
                          placeholder='Payment Mode'
                          InputProps={{
                            readOnly: true
                          }}
                          className='readOnly'
                        />
                      </Grid>
                      <Grid item xs={12} sm={12} md={4}>
                        <TextField
                          fullWidth
                          label='Payment Date And Time'
                          value={finalAdmissionData?.payment_date_time}
                          placeholder='Payment Date And Time'
                          InputProps={{
                            readOnly: true
                          }}
                          className='readOnly'
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>

                {/* <StyledChipProps
                  label={'Upload Documents'}
                  onClick={() => handleToggle('Upload Documents')}
                  color={selectedOptions?.includes('Upload Documents') ? 'primary' : 'default'}
                  variant='filled'
                  sx={{ mr: 4 }}
                />
                {selectedOptions == 'Upload Documents' ? (
                  <UploadForms setRrefreshStatus={setRrefreshStatus} activeStageName={activeStageData?.name} stage={'Admission Granted'} enquiryId={enquiryID} />
                ) : null} */}
              </>
            </>
          )
        }

        if (uploadScreen) {
          return (
            <>
              <IconButton
                onClick={() => {
                  setUploadScreen(false)
                }}
                sx={{ mr: 1 }}
              >
                {' '}
                {/* Define handleBackClick function */}
                <ArrowBackIcon />
              </IconButton>
              <UploadForms
                setRrefreshStatus={setRrefreshStatus}
                activeStageName={activeStageData?.name}
                enquiryId={enquiryID}
                stage={'Registration'}
              />{' '}
            </>
          )
        }

      default:
        return (
          <>
            {activeSatge?.stage_forms && activeSatge.stage_forms.length
              ? activeSatge.stage_forms.map((label: any, index: number) => (
                  <StyledChipProps
                    key={index}
                    label={label.name}
                    onClick={() => handleToggle(label.name)}
                    color={selectedOptions?.includes(label.name) ? 'primary' : 'default'}
                    variant='filled'
                    sx={{ mr: 4 }}
                  />
                ))
              : null}
            <StyledChipProps
              label={'Upload Documents'}
              disabled={!enquiryID}
              onClick={() => handleToggle('Upload Documents')}
              color={selectedOptions?.includes('Upload Documents') ? 'primary' : 'default'}
              variant='filled'
              sx={{ mr: 4 }}
            />
            {activeSatge?.stage_forms && activeSatge?.stage_forms.length
              ? activeSatge?.stage_forms.map((val: any, index: number) => {
                  return selectedOptions == val.name ? (
                    <>
                      <CreateForm
                        auto={false}
                        url={dynamicFormData ? `marketing/enquiry/${enquiryID}` : 'marketing/enquiry/create'}
                        requestParams={
                          dynamicFormData
                            ? {
                                reqType: 'PATCH'
                              }
                            : {
                                reqType: 'POST'
                              }
                        }
                        slug={val.slug}
                        appendRequest={{
                          metadata: {
                            form_id: val?._id?.toString(),
                            enquiry_type_id: enquiryType?._id
                          }
                        }}
                        submitProp={submitProp}
                        submitPropsFunction={submitPropsFunction}
                        dataId={enquiryType?._id}
                        dynamicFormData={dynamicFormData}
                        setSubmitProp={setSubmitProp}
                        authToken = {authToken}
                        // {...(index == 0 && { attachExternalFields: true })}
                      />
                    </>
                  ) : null
                })
              : null}

            {selectedOptions == 'Upload Documents' ? (
              <UploadForms
                setRrefreshStatus={setRrefreshStatus}
                activeStageName={activeStageData?.name}
                enquiryId={enquiryID}
              />
            ) : null}
          </>
        )
    }
  }

  const checkIfStepActive = (name: string) => {
    const dd = getObjectKeyValSlug(dynamicFormData?.enquiry_stages, name)

    switch (name) {
      case 'Competency test':
        if (dd && dd?.status == 'Failed') {
          return { error: true }
        } else if (dd && dd?.status == 'Passed') {
          return { success: true }
        } else if (activeStageData?.name == name) {
          return { active: true }
        } else {
          return { active: false }
        }

      case ENQUIRY_STAGES?.REGISTRATION_FEES:
        if (dd && dd?.status == 'Completed') {
          return { success: true }
        } else if (dd && dd?.status == 'Pending') {
          return { pending: true }
        } else if (activeStageData?.name == name) {
          return { active: true }
        } else {
          return { active: false }
        }

      case 'Admission Status':
        if (dd && dd?.status == 'Rejected') {
          return { error: true }
        }
        if (activeStageData?.name == name) {
          return { active: true }
        } else if (dd && dd?.status == 'Approved') {
          return { success: true }
        } else if (dd && dd?.status == 'Rejected') {
          return { error: true }
        } else if (activeStageData?.name == name) {
          return { active: true }
        } else {
          return { active: false }
        }

      case ENQUIRY_STAGES?.ADMITTED_PROVISIONAL:
        if (activeStageData?.name == name) {
          return { active: true }
        }
        if (dd && (dd?.status == ENQUIRY_STATUS?.ADMITTED || dd?.status == ENQUIRY_STATUS?.PROVISIONAL)) {
          return { success: true }
        } else {
          return { active: false }
        }

      default:
        if (dd && dd?.status == 'Pending') {
          return { pending: true }
        } else if (activeStageData?.name == name) {
          return { active: true }
        } else {
          if (dynamicFormData && dynamicFormData?.enquiry_stages) {
            if (dd && dd?.status == 'Completed') {
              return { success: true }
            } else {
              return { active: false }
            }
          } else {
            return { active: false }
          }
        }
    }
  }

  const checkForNextDisabled = () => {
    const stat = getObjectKeyValSlug(dynamicFormData?.enquiry_stages, activeStageData?.name)

    if (activeStageData?.name == ENQUIRY_STAGES?.REGISTRATION_FEES && !enquiryDetails?.registration_fees_paid) {
      return true
    } else if (activeStageData?.name == 'Competency test' && stat?.status != 'Passed') {
      return true
    } else if (activeStageData?.name == 'Admission Status' && stat?.status != 'Approved') {
      return true
    } else if (activeStageData?.name == 'Payment' && stat?.status != 'Completed') {
      return true
    } else {
      return false
    }
  }

  const hanldeSaveSubjects = async (data: any) => {
    if (data != null) {
      setGlobalState({ isLoading: true })
      const fnData = [...data]
      fnData?.map((val: any) => {
        delete val?.created_at
        delete val?.created_by_id
        delete val?.updated_at
        delete val?.updated_by_id
      })

      const params = {
        url: `marketing/admission/${enquiryID}/subject-details`,
        authToken: authToken,
        data: fnData.filter(Boolean)
      }

      const response = await postRequest(params)
      if (response?.status) {
        handleSubmit()
      } else {
        setOpenErrorDialog(true)
      }
      setGlobalState({ isLoading: false })
    } else {
      handleSubmit()
    }
  }

  const hanldeSaveVAS = async () => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `marketing/admission/${enquiryID}/payment-request`,
      authToken: authToken
    }

    const response = await postRequest(params)
    if (response?.status) {
      handleSubmit()
      setSelectedOptions('')
    } else {
      setOpenErrorDialog(true)
    }

    setGlobalState({ isLoading: false })
  }

  const hanldeSaveDiscount = async () => {
    if (mobileView) {
      router.push('/enquiries/mobile_submitted')
    } else {
      hanldeSaveVAS()
    }
  }

  const getNextStage = () => {
    const journeyIndex = enquiryType?.stages?.findIndex((stage: any) => stage?.name === activeStageData?.name)
    if (journeyIndex >= 0) {
      if (enquiryType?.stages[journeyIndex + 1]?.stage_forms?.length) {
      } else {
      }

      const result = enquiryType?.stages?.filter((val: any, index: any) => {
        if (index > journeyIndex && enquiryType?.stages[index]?.stage_forms?.length) {
          return val
        }
      })

      if (result && result?.length) {
        return result[0]
      } else {
        return null
      }
    }
  }

  const getStageStatus = (stageName: any) => {
    const stageStatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, stageName)

    return stageStatus?.status
  }

  const closeDuplicateDialog = () => {
    setDuplicateDialog(false)
    setDuplicateDialogMessage(null)
    router.push('/enquiries')
  }

  const handleStageClick = (stage: any) => {
    const paymentStat = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, 'Payment')

    if (
      stage?.name == ENQUIRY_STAGES?.REGISTRATION &&
      paymentStat?.status != ENQUIRY_STATUS?.COMPLETED &&
      paymentStat?.status != ENQUIRY_STATUS?.PROGRESS
    ) {
      if (enquiryDetails?.stauts != 'Closed' && enquiryDetails?.status != 'Admitted') {
        const regFeeStatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.REGISTRATION_FEES)
        if (regFeeStatus && regFeeStatus?.status == ENQUIRY_STATUS?.COMPLETED) {
          setActiveStageData(stage)
          if (stage?.stage_forms && stage?.stage_forms?.length) {
            setSelectedOptions(stage?.stage_forms[0]?.name)
          } else {
            setSelectedOptions('')
          }
        }
      } else if (stage?.name == ENQUIRY_STAGES?.ADMISSION_STATUS) {
        const stageStatusObject = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.COMPETENCY_TEST)
        if (stageStatusObject?.status == ENQUIRY_STATUS?.PASSED) {
          setActiveStageData(stage)
          setSelectedOptions('Subject Selection')
        }
      }
    }
    console.log('Clicked')
  }
  console.log('selectedOptions', selectedOptions, activeStageData)

  const getPaymentBtn = () => {
    if (
      activeStageData?.name == ENQUIRY_STAGES?.ADMISSION_STATUS &&
      getStageStatus('Admission Status') == ENQUIRY_STATUS?.APPROVED
    ) {
      // const isDiscountIncluded = stageSections(ENQUIRY_STAGES?.ADMISSION_STATUS)?.includes('Concession')
      // const isDiscountSelected = selectedOptions === 'VAS'

      // if (isDiscountIncluded) {
      //   if (isDiscountSelected && getStageStatus('Admission Status') === ENQUIRY_STATUS?.APPROVED) {
      //     return true
      //   } else {
      //     return false
      //   }
      // } else {
      //   if (getStageStatus('Admission Status') === ENQUIRY_STATUS?.APPROVED) {
      //     return true
      //   } else {
      //     return false
      //   }
      // }
      if (selectedOptions === 'VAS') {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  const getLastElement = (array: any, element: any) => {
    const isLastElement = array[array.length - 1] === element

    return isLastElement
  }
  const getSchoolParentId = async () => {
    if (enquiryDetails) {
      const params = {
        url: `/api/ac-schools/${enquiryDetails?.school_location?.id}`,
        serviceURL: 'mdm'
      }
      const response = await getRequest(params)
      if (response) {
        setSchoolParentId(response?.data?.attributes?.school_parent_id)
      }
    }
  }

  const getGuestSchoolPartentId = async () => {
    if (enquiryDetails) {
      const params = {
        url: `/api/ac-schools/${enquiryDetails?.guest_student_details?.location?.id}`,
        serviceURL: 'mdm'
      }
      const response = await getRequest(params)
      if (response) {
        setGuestSchoolParentId(response?.data?.attributes?.school_parent_id)
      }
    }
  }

  useEffect(() => {
    getSchoolParentId()
    if (enquiryDetails?.is_guest_student) {
      getGuestSchoolPartentId()
    }
  }, [enquiryDetails])

  useEffect(() => {
    if (enquiryDetails && academicYears && academicYears?.length && schoolParentId) {
      getSubjectData()
    }
  }, [enquiryDetails, academicYears, schoolParentId, guestSchoolParentId])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexWrap: 'wrap',
          mt: 3,
          mb: 7
        }}
      >
        {/* Step without sub-steps */}
        {!mobileView && (
          <>
            {enquiryType.stages && enquiryType.stages.length && enquiryType.stages.length >= 5
              ? enquiryType.stages.map((val: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => {
                      handleStageClick(val)
                    }}
                  >
                    <Step
                      key={index}
                      // active={activeStageData?.name == val.name ? true : false}
                      // active={checkIfStepActive(val.name) || false}
                      {...(checkIfStepActive(val?.name) && checkIfStepActive(val?.name))}
                      // success={true}
                      label={val.name}
                      stepNumber={index + 1}
                    />
                  </div>
                ))
              : null}
          </>
        )}
      </Box>
      {enquiryType.stages && enquiryType.stages.length && enquiryType.stages.length < 5 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            flexWrap: 'wrap',
            mt: 3,
            mb: 7,
            width: '100%'
          }}
        >
          <ToggleGroupStepper toggleButtonContent={enquiryType.stages} view={activeStep} />
        </Box>
      ) : null}

      {/* {enquiryType?.enquiry_forms && enquiryType?.enquiry_forms.length ? ( */}
      <>
        <Grid item xs={12}>
          {renderForms(activeStageData)}
        </Grid>

        <Grid item xs={12} sx={{ mt: 9, display: 'flex', justifyContent: 'flex-end' }}>
          {enquiryDetails?.status != 'Admitted' && !hideCTA && selectedOptions !== 'Default Fees' && selectedOptions !== 'Subject Selection' && (
            <>
              <Button onClick={handleCancel} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
                Cancel
              </Button>
            </>
          )}
          {activeStageData?.name == ENQUIRY_STAGES?.ENQUIRY && selectedOptions == 'Upload Documents' ? (
            <Button
              onClick={() => {
                if (pathname == '/enquiries/create/') {
                  window.location.reload()
                } else {
                  router.push('/enquiries/create/')
                }
              }}
              size='large'
              variant='outlined'
              color='inherit'
              sx={{ mr: 2 }}
            >
              Submit & Add New Child
            </Button>
          ) : null}
          {/* {activeStageData?.name != ENQUIRY_STAGES?.ENQUIRY &&
          activeStageData?.name != ENQUIRY_STAGES?.ADMITTED_PROVISIONAL ? (
            <Button onClick={handleGoBack} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
              Go Back
            </Button>
          ) : null} */}
          {selectedOptions == 'Upload Documents' ||
          selectedOptions == 'Subject Selection' ||
          selectedOptions == 'Default Fees' ||
          selectedOptions == 'VAS' ||
          selectedOptions == 'Concession' ||
          activeStageData?.name == ENQUIRY_STAGES?.SCHOOL_VISIT ||
          hideCTA ||
          activeStageData?.name == 'Admitted or Provisional Approval' ? null : (
            <Button
              onClick={handleSubmit}
              disabled={checkForNextDisabled()}
              size='large'
              variant='contained'
              color={activeStageData?.name != 'Enquiry' && !activeStageData?.is_mandatory ? 'inherit' : 'secondary'}
              sx={{ mr: 2 }}
            >
              {activeStageData?.name != 'Enquiry' && !activeStageData?.is_mandatory
                ? 'Skip'
                : activeStageData?.name == ENQUIRY_STAGES?.REGISTRATION_FEES
                ? 'Next'
                : 'Save & Next'}
            </Button>
          )}

          {/* {selectedOptions == 'Subject Selection' ? (
            <Button
              //disabled={finalSelectedSubjects == null}
              variant='contained'
              color='secondary'
              onClick={hanldeSaveSubjects}
              disabled={getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.ADMISSION_STATUS)?.status != ENQUIRY_STATUS?.APPROVED}
            >
              Save & Next 
            </Button>
          ) : null} */}
          {!getLastElement(stageSections('Admission Status'), 'VAS') &&
          selectedOptions == 'VAS' &&
          getStageStatus('Admission Status') == ENQUIRY_STATUS?.APPROVED ? (
            <Button variant='contained' color='secondary' onClick={handleSubmit}>
              Save & Next
            </Button>
          ) : null}
          {activeStageData?.name == ENQUIRY_STAGES?.ADMISSION_STATUS &&
          getStageStatus('Admission Status') == ENQUIRY_STATUS?.APPROVED &&
          selectedOptions == 'Subject Selection' &&
          !allSubjects?.length ? (
            <>
              <Button onClick={handleCancel} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button variant='contained' color='secondary' onClick={handleSubmit} disabled={isSubjectApiLoading} >
                Skip
                </Button>
            </>
          ) : null}
          {getPaymentBtn() ? (
            <Button sx={{ ml: '5px' }} variant='contained' color='secondary' onClick={hanldeSaveDiscount}>
              Proceed to payment
            </Button>
          ) : null}
          {/* {activeStageData?.name == 'Competency test' && testStatus != 'Passed' ? (
            <Button variant='contained' color='secondary' {...(openCompetencyTest && { onClick: openCompetencyTest })}>
              Competency test
            </Button>
          ) : null} */}
          {/* {activeStep == 2 ? (
            <Button onClick={handleSubmit} size='large' variant='contained' color='inherit' sx={{ mr: 2 }}>
              {(enquiryType?.registration_forms &&
                enquiryType?.registration_forms.length &&
                selectedOptions == enquiryType.registration_forms[enquiryType.registration_forms.length - 1].name) ||
              selectedOptions == 'Upload Documents'
                ? 'Submit'
                : 'Save & Next'}
            </Button>
          ) : null} */}
          {/* {activeStep == 1 &&
          enquiryType.enquiry_forms &&
          enquiryType.enquiry_forms.length &&
          selectedOptions == 'Upload Documents' ? (
            <Button
              disabled={regDisabled}
              onClick={() => {
                router.push('/enquiries')
              }}
              size='large'
              variant='contained'
              color='inherit'
              sx={{ mr: 2 }}
            >
              Submit Enquiry
            </Button>
          ) : null} */}
          {activeStageData?.name == 'Enquiry' && selectedOptions == 'Upload Documents' ? (
            <Button onClick={handleCancel} size='large' variant='contained' color='secondary' sx={{ mr: 2 }}>
              Save & Submit
            </Button>
          ) : null}
          {/* {(enquiryType?.name == 'Enquiry - PSA' || enquiryType?.name == 'Enquiry - Kids club') &&
          activeStageData?.name == 'Enquiry' &&
          selectedOptions == 'Upload Documents' ? (
            <Button onClick={handleSubmit} size='large' variant='outlined' color='secondary' sx={{ mr: 2 }}>
              Save & Next
            </Button>
          ) : null} */}
          {/* {activeStageData?.name == 'Enquiry' &&
          !regDisabled &&
          selectedOptions == 'Upload Documents' &&
          enquiryType?.name != 'Enquiry - PSA' &&
          enquiryType?.name != 'Enquiry - Kids club' ? (
            <Button disabled={regDisabled} onClick={handleNext} size='large' variant='contained' color='secondary'>
              Continue Registration
            </Button>
          ) : null} */}

          {getNextStage()?.name == ENQUIRY_STAGES?.REGISTRATION ? (
            selectedOptions == 'Upload Documents' ? (
              <Button disabled={regDisabled} onClick={handleNext} size='large' variant='contained' color='secondary'>
                Continue Registration
              </Button>
            ) : null
          ) : activeStageData?.name != 'Admitted or Provisional Approval' &&
            activeStageData?.name != ENQUIRY_STAGES?.COMPETENCY_TEST &&
            activeStageData?.name != ENQUIRY_STAGES?.PAYMENT &&
            (selectedOptions == getNextStage()?.stage_forms[getNextStage()?.stage_forms?.length - 1]?.name ||
              selectedOptions == 'Upload Documents') ? (
            <Button onClick={handleSubmit} size='large' variant='contained' color='secondary' sx={{ mr: 2 }}>
              {/* Save & Next */}
              {getNextStage()?.name
                ? `Proceed to ${getNextStage()?.name}`
                : activeStageData?.name == ENQUIRY_STAGES?.ENQUIRY && selectedOptions == 'Upload Documents'
                ? 'Proceed to Admission'
                : 'Save & Next'}
            </Button>
          ) : null}
        </Grid>
        {successDialog && (
          <SuccessDialog openDialog={successDialog} title={dialogTitle} handleClose={handleSuccessDialogClose} />
        )}
        <ErrorDialogBox openDialog={openErrorDialog} handleClose={handleErrorClose} title={'Something Went Wrong !'} />

        {cafeteriaDialog && (
          <CafetriaDialog
            schoolParentId={schoolParentId}
            openDialog={cafeteriaDialog}
            title='Cafeteria Details'
            handleClose={cafeteriaDialogClose}
            setCafeteriaDialog={setCafeteriaDialog}
            minimized={minimized}
            setMinimized={setMinimized}
            enquiryID={enquiryID}
            setRefresh={setRefresh}
            refresh={refresh}
            details={vasDetails?.cafeteria_details}
            viewMode={viewMode}
            setViewMode={setViewMode}
            enquiryDetails={enquiryDetails}
            academic_year={
              getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes
                ?.short_name_two_digit
            }
          />
        )}

        {summerCampDialogue && (
          <SummarCampDialog
            openDialog={summerCampDialogue}
            title='Summer Camp Details'
            handleClose={handleSummarCampDialogClose}
            setSummerCampDialog={setSummerCampDialog}
            minimized={minimized}
            setMinimized={setMinimized}
            enquiryID={enquiryID}
            setRefresh={setRefresh}
            refresh={refresh}
            details={vasDetails?.summer_camp_details}
            viewMode={viewMode}
            setViewMode={setViewMode}
            enquiryDetails={enquiryDetails}
            academic_year={
              getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes
                ?.short_name_two_digit
            }
          />
        )}

        {KidsCludDialog && (
          <KidsClub
            schoolParentId={schoolParentId}
            openDialog={KidsCludDialog}
            title='Kids Club Details'
            handleClose={handleKidsClubDialogClose}
            setKidsClubDialog={setKidsClubDialog}
            minimized={minimized}
            setMinimized={setMinimized}
            enquiryID={enquiryID}
            setRefresh={setRefresh}
            refresh={refresh}
            details={vasDetails?.kids_club_details}
            viewMode={viewMode}
            setViewMode={setViewMode}
            enquiryDetails={enquiryDetails}
            academic_year={
              getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes
                ?.short_name_two_digit
            }
          />
        )}

        {psaDialog && (
          <PSADialog
            openDialog={psaDialog}
            title='PSA Dialog'
            handleClose={handlePsaDialogClose}
            setPsaDialog={setPsaDialog}
            minimized={minimized}
            setMinimized={setMinimized}
            enquiryID={enquiryID}
            setRefresh={setRefresh}
            refresh={refresh}
            details={vasDetails?.psa_details}
            viewMode={viewMode}
            setViewMode={setViewMode}
            enquiryDetails={enquiryDetails}
            academic_year={
              getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes
                ?.short_name_two_digit
            }
          />
        )}

        {transportDialog && (
          <TransportationDialog
            schoolParentId={schoolParentId}
            openDialog={transportDialog}
            title='Transportation Dialog'
            handleClose={handlePsaDialogClose}
            setTransportDialog={setTransportDialog}
            minimized={minimized}
            setMinimized={setMinimized}
            enquiryID={enquiryID}
            setRefresh={setRefresh}
            refresh={refresh}
            details={vasDetails?.transport_details}
            viewMode={viewMode}
            setViewMode={setViewMode}
            enquiryDetails={enquiryDetails}
            academic_year={
              getObjectByKeyVal(academicYears, 'id', enquiryDetails?.academic_year?.id)?.attributes
                ?.short_name_two_digit
            }
          />
        )}
        <EnquiryMessage
          openModal={duplicateDialog}
          header={'Duplicate Enquiry'}
          message={duplicateDialogMessage}
          closeModal={closeDuplicateDialog}
          enquiryId={duplicateEnquiryId}
        />
      </>
      {/* ) : null} */}

      {successDialogTerms && (
        <SuccessDialog
          openDialog={successDialogTerms}
          title={'Terms & Conditions Mail Sent'}
          handleClose={handleSuccessTermDialogClose}
        />
      )}
    </>
  )
}

export default StepperForms
