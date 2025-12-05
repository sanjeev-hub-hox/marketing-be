import React, { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Button,
  TextField,
  Typography,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel,
  RadioGroup,
  Radio,
  Link
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import MinimizeIcon from '@mui/icons-material/Minimize'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { StaticDatePicker, PickersDay, PickersDayProps } from '@mui/x-date-pickers'
import { display, margin, styled, width } from '@mui/system'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { Container, Grid } from '@mui/material'
import { Tooltip, Switch, Autocomplete, CircularProgress } from '@mui/material'
import { postRequest, getRequest, putRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { FEETYPES, schoolApiUrl } from 'src/utils/constants'
import ErrorDialogBox from 'src/@core/CustomComponent/ErrorDialogBox/ErrorDialogBox'
import { formatAmount, getObjectByKeyVal, getUserInfo, removeDuplicatesAndNullByKey } from 'src/utils/helper'
import CreateStop from './CreateStop'

const CustomStaticDatePicker = styled(StaticDatePicker)(({ theme }) => ({
  '&.MuiPickersLayout-root.MuiPickersLayout-landscape': {
    boxShadow: '0px 2px 10px 0px #4C4E6438',
    '& .MuiPickersToolbar-root ': {
      '& .MuiTypography-root': {
        display: 'none'
      },
      '& .MuiPickersToolbar-content': {
        display: 'none'
      }
    },
    '& .MuiPickersLayout-contentWrapper': {
      '& .MuiDateCalendar-root': {
        margin: '0px',
        width: '350px'
      }
    },

    '& .MuiDialogActions-root': {
      '& button': {
        marginLeft: '-22px'
      }
    }
  }
}))

const CalendarIcon = () => <span className='icon-calendar-1'></span>
const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

//Chips Styled
const StyledChipProps = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorPrimary': {
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 10px',
    background: '#4849DA14 !important',
    color: '#4849DA !important'
  },
  '&.MuiChip-colorDefault': {
    border: `1px solid ${theme.palette.grey[300]} !important`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 10px',
    background: `${theme.palette.customColors.text6} !important`,
    color: `${theme.palette.customColors.mainText} `
  }
}))
const Dot = styled(Box)(({ theme }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: `${theme.palette.primary.dark}`,
  position: 'absolute',
  bottom: 2,
  left: '50%',
  transform: 'translateX(-50%)'
}))

interface FormValues {
  busType: any
  serviceType: any
  route: any
  pickup: any
  drop: any
  period_of_service: number | null
  psa_batch: number | null
}

const defaultValues: FormValues = {
  busType: null,
  serviceType: null,
  route: null,
  pickup: null,
  drop: null,
  period_of_service: null,
  psa_batch: null
}

type SchoolTour = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
  setTransportDialog?: any
  minimized?: boolean
  setMinimized?: any
  enquiryID?: any
  setRefresh?: any
  refresh?: any
  details?: any
  viewMode?: boolean
  setViewMode?: any
  enquiryDetails?: any
  academic_year?: any
  schoolParentId?: any
}

interface Option {
  id: number
  attributes: any
}

const TransportationDialog = ({
  openDialog,
  handleClose,
  title,
  setTransportDialog,
  minimized,
  setMinimized,
  enquiryID,
  setRefresh,
  refresh,
  details,
  viewMode,
  setViewMode,
  enquiryDetails,
  academic_year,
  schoolParentId
}: SchoolTour) => {
  const [isBooked, setIsBooked] = useState<boolean>(false)
  const [formData, setFormata] = useState<any>([])
  const [routeData, setRouteData] = useState<any>([])
  const [pickupData, setPickupData] = useState<any>([])
  const [dropData, setDropData] = useState<any>([])
  const [psaBatchOptions, setPsaBatchOptions] = useState<any[]>([])
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false)
  const [errorTitle, setErrorTitle] = useState<any>('Something went wrong!')

  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([])
  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])
  const [stopList, setStopList] = useState<any[]>([])
  const [pickupStopList, setpickupStopList] = useState<any[]>([])
  const [dropStopList, setdropStopList] = useState<any[]>([])
  const [openStopDailog, setOpenStopDailog] = useState<boolean>(false)
  const [showStopCreationOption, setShowStopCreationOption] = useState<boolean>(true)
  const handleStopClose = () => {
    setOpenStopDailog(false)
  }
  const [schoolLocation,setSchoolLocation] = useState<any>({})
  const [userId, setUserId] = useState<any>(null)

  const getSchoolLocation = async() =>{
    const params = {
      url:schoolApiUrl,
      serviceURL:'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      },
      data: { operator: `academic_year_id = ${academic_year} and school_id=${enquiryDetails?.school_location?.id}` }
    }

    const resp = await postRequest(params)
    if(resp){
      setSchoolLocation({
        school_latitude: resp?.data?.schools[0]?.latitude,
        school_longitude: resp?.data?.schools[0]?.longitude
      })
    }
  }

  useEffect(()=>{
      const userInfo = getUserInfo()
      setUserId(userInfo?.userInfo?.id)
      getSchoolLocation()

  },[])

  const getPickupDropRoutes = async (obj: any, type: string) => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `/transport-service/route/fetch-stops`,
      serviceURL: 'transport',
      data: {
        ...obj
      }
    }

    const response = await postRequest(params)
    if (response?.data) {
      if (type == 'pickup') {
        setpickupStopList(response?.data)
      } else if (type == 'drop') {
        setdropStopList(response?.data)
      } else if (type == 'both') {
        setStopList(response?.data)
      }
    }
    setGlobalState({ isLoading: false })
  }

  const getRouteData = async (e: any) => {
    setGlobalState({ isLoading: true })

    console.log('ERR', e.target?.value)
    const params = {
      url: `/transport-service/route/fetch-stops`,
      serviceURL: 'transport',
      data: {
        school_parent_id: schoolParentId,
        route_type: e?.target?.value == 'school' ? '2' : '1',
        bus_type: formDatVal?.busType == 'ac' ? '1' : '2'
      }
    }

    const response = await postRequest(params)
    if (response?.data) {
      setRouteData(response?.data)
    }
    setGlobalState({ isLoading: false })
  }

  const getFormData = async () => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `/api/fc-fees-masters/transport-details`,
      serviceURL: 'mdm',
      data: {
        academic_year_id: academic_year ? parseInt(academic_year) : null,
        board_id: enquiryDetails?.board?.id,
        course_id: enquiryDetails?.course?.id,
        shift_id: enquiryDetails?.shift?.id || null,
        stream_id: enquiryDetails?.stream?.id,
        grade_id: enquiryDetails?.student_details.grade?.id,
        school_parent_id: schoolParentId
      },
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }

    const response = await postRequest(params)
    if (response?.data) {
      setFormata(response?.data)
      setSubTypeOptions(response?.data?.feeSubType)
      //setPeriodOfServiceOptions(response?.data?.periodOfService)
      setPsaDetails(response?.data)
    }
    setGlobalState({ isLoading: false })
  }

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm<any>({
    defaultValues: { busType: '' }
  })

  const formDatVal = watch()
  console.log('formDatVal>>', errors)

  useEffect(() => {
    getFormData()
    const pickupPayload = {
      school_parent_id: schoolParentId,
      route_type: '1',
      bus_type: formDatVal?.busType == 'AC' ? '1' : '2'
    }
    const dropPayload = {
      school_parent_id: schoolParentId,
      route_type: '2',
      bus_type: formDatVal?.busType == 'AC' ? '1' : '2'
    }
    // getPickupDropRoutes(pickupPayload, 'pickup')
    // getPickupDropRoutes(dropPayload, 'drop')
  }, [formDatVal?.busType])

  console.log('formdatVal>>', formDatVal, formData)

  const handleMinimize = () => {
    setMinimized(true)
  }

  const handleBook = () => {
    setIsBooked(true)
  }

  const [vasAmount, setVasAmount] = useState<number>(0)
  const [isFinalSubmit, setFinalSubmit] = useState<boolean>(false)
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()
  const [serviceType, setServiceType] = useState('One way')

  const getObjectKeyValSlug: any = (object: any, value: any, key: any) => {
    return object?.find((o: any) => o[key] == value)
  }

  const calculateAmmount = async () => {
    setGlobalState({ isLoading: true })
    const catID = getObjectKeyValSlug(formData?.feeCategory, formDatVal?.serviceType, 'fee_category')
    console.log('catID', catID)
    const startValue = getObjectByKeyVal(stopList, 'id', formDatVal?.zoneStart)?.zone_name
    const endValue = getObjectByKeyVal(stopList, 'id', formDatVal?.zoneEnd)?.zone_name
    const pp =
      formDatVal?.serviceType == 'One way'
        ? { fee_subcategory_start: startValue }
        : formDatVal?.serviceType == 'Both way'
        ? { fee_subcategory_start: startValue, fee_subcategory_end: endValue }
        : null

    const params4 = {
      url: `/fee_payment/finance/calculate`,
      serviceURL: 'finance',
      data: {
        academic_year_id: academic_year ? parseInt(academic_year) : null,
        board_id: enquiryDetails?.board?.id,
        course_id: enquiryDetails?.course?.id,
        shift_id: enquiryDetails?.shift?.id,
        stream_id: enquiryDetails?.stream?.id,
        grade_id: enquiryDetails?.student_details.grade?.id,
        // school_id: enquiryDetails?.school_location?.id,
        school_parent_id: schoolParentId,
        batch_id: formDatVal?.psa_batch,
        fee_type_id: FEETYPES?.transportFees,
        fee_sub_type_id: getObjectKeyValSlug(formData?.feeSubType, formDatVal?.busType, 'fee_sub_type')
          ?.fee_sub_type_id, // formDatVal?.busType ? parseInt(formDatVal?.busType): null,
        fee_category_id: getObjectKeyValSlug(formData?.feeCategory, formDatVal?.serviceType, 'fee_category')
          ?.fee_category_id, //formDatVal?.psa_category, formDatVal?.busType ? parseInt(formDatVal?.serviceType): null,
        //fee_subcategory_start: formDatVal?.zone, //formDatVal?.psa_sub_category,
        ...pp,
        period_of_service_id: formDatVal?.periodOfService ? parseInt(formDatVal?.periodOfService) : null
      }
    }
    try {
      const data = await postRequest(params4)
      // setPsaDetails(data?.data);
      setVasAmount(data?.data?.amount)
      if (data?.status == 200) {
        setFinalSubmit(true)
      } else {
        // setErrorTitle('Fees Not Found')
        // setOpenErrorDialog(true)
        setApiResponseType({ status: true, message: 'Fees Not Found' })
      }

      // setCategoryOptions(data?.data?.feeCategory);
    } catch (error) {
      console.error('Error fetching Child lobs:', error)
    }
    setGlobalState({ isLoading: false })
  }
  const onSubmit = async (data: FormValues) => {
    const requestData: any = {}

    requestData.period_of_service_id = periodOfServiceOptions.find(
      (item: any) => item.period_of_service === data.period_of_service
    )?.period_of_service_id
    requestData.batch_id = batchOptions.find((item: any) => item.batch_name === data.psa_batch)?.batch_id
    if (isFinalSubmit) {
      const startValue = getObjectByKeyVal(stopList, 'id', formDatVal?.zoneStart)?.zone_name
      const endValue = getObjectByKeyVal(stopList, 'id', formDatVal?.zoneEnd)?.zone_name
      const pp =
        formDatVal?.serviceType == 'One way'
          ? {
              pickup_point: startValue,
              stop_details: [
                {
                  shift_id: getObjectByKeyVal(stopList, 'id', formDatVal?.zoneStart)?.shift_id,
                  stop_id: formDatVal?.zoneStart,
                  route_id: getObjectByKeyVal(stopList, 'id', formDatVal?.zoneStart)?.route_id
                }
              ]
            }
          : formDatVal?.serviceType == 'Both way'
          ? {
              pickup_point: startValue,
              drop_point: endValue,
              stop_details: [
                {
                  shift_id: getObjectByKeyVal(stopList, 'id', formDatVal?.zoneStart)?.shift_id,
                  stop_id: formDatVal?.zoneStart,
                  route_id: getObjectByKeyVal(stopList, 'id', formDatVal?.zoneStart)?.route_id
                },
                {
                  shift_id: getObjectByKeyVal(stopList, 'id', formDatVal?.zoneEnd)?.shift_id,
                  stop_id: formDatVal?.zoneEnd,
                  route_id: getObjectByKeyVal(stopList, 'id', formDatVal?.zoneEnd)?.route_id
                }
              ]
            }
          : null

      const payload = {
        transport: {
          amount: vasAmount,
          batch_id: formDatVal?.psa_batch,
          fee_type_id: FEETYPES?.transportFees,
          fee_sub_type_id: getObjectKeyValSlug(formData?.feeSubType, formDatVal?.busType, 'fee_sub_type')
            ?.fee_sub_type_id, // formDatVal?.busType ? parseInt(formDatVal?.busType): null,
          fee_category_id: getObjectKeyValSlug(formData?.feeCategory, formDatVal?.serviceType, 'fee_category')
            ?.fee_category_id, //formDatVal?.psa_category, formDatVal?.busType ? parseInt(formDatVal?.serviceType): null,
          ...pp,
          period_of_service_id: formDatVal?.periodOfService ? parseInt(formDatVal?.periodOfService) : null
        }
      }
      const params4 = {
        url: `/marketing/admission/${enquiryID}/vas/add?type=Transport`,
        data: payload
      }
      try {
        const data = await postRequest(params4)
        setTransportDialog(false)
        setViewMode(false)
        setRefresh(!refresh)
        // setPsaDetails(data?.data)
        // setCategoryOptions(data?.data?.feeCategory)
      } catch (error) {
        console.error('Error fetching Child lobs:', error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    } else {
      calculateAmmount()
    }
  }

  const [psaDetails, setPsaDetails] = useState<any>({})
  const [batchOptions, setBatchOptions] = useState<any[]>([])
  const [subtypeOptions, setSubTypeOptions] = useState<any[]>([])

  // useEffect(() => {
  //   setGlobalState({ isLoading: true })
  //   const handleSearch = async () => {
  //     const params4 = {
  //       url: `/api/fc-fees-masters/summer-camp-details`,
  //       serviceURL: 'mdm',
  //       headers: {
  //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
  //       },
  //       data: {
  //         academic_year_id: academic_year,
  //         board_id: enquiryDetails?.board?.id,
  //         course_id: enquiryDetails?.course?.id,
  //         shift_id: enquiryDetails?.shift?.id,
  //         stream_id: enquiryDetails?.stream?.id,
  //         grade_id: enquiryDetails?.student_details.grade?.id,
  //         school_id: enquiryDetails?.school_location?.id,
  //       }
  //     }
  //     try {
  //       const data = await postRequest(params4)
  //       // setChild(data4?.data);
  //       setPsaDetails(data?.data)

  //       setSubTypeOptions(data?.data?.feeSubType)
  //       // setCategoryOptions(data?.data?.feeCategory)
  //       // setSubCategoryOptions(data?.data?.feeSubCategory)

  //       // setPeriodOfServiceOptions(data?.data?.periodOfService)
  //       // setPsaBatchOptions(data?.data?.batches)
  //     } catch (error) {
  //       console.error('Error fetching Child lobs:', error)
  //     } finally {
  //       setGlobalState({ isLoading: false })
  //     }
  //   }

  //   handleSearch()
  // }, [])

  const handleOptions = async (event: any, value: any, name: any) => {
    setFinalSubmit(false)
    if (name === 'busType') {
      if (value) {

        if (formData?.serviceType) {
          if (formData?.serviceType == 'Both Way') {
            handleBusTypeChange('Both Way', value)
          } else if (formData?.serviceType == 'One Way') {
            handleBusTypeChange('One Way', value)
          }
        }
        
        value = [value]
        const selectedIds = value?.map((name: any) => {
          const item: any = subtypeOptions.find((item: any) => item.fee_sub_type == name)

          return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
        })
        const categoryOptions = formData.feeCategory.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        setCategoryOptions(categoryOptions)
      } else {
        setCategoryOptions([])
      }
    }

    if (name === 'serviceType') {
      if (value) {
        value = [value]
        const selectedIds = value?.map((val: any) => {
          const item: any = categoryOptions.find((item: any) => item.fee_category == val)

          return item ? item.fee_category_id : undefined // Return item.id if found, otherwise undefined
        })
        const subcategoryOptions = formData.feeSubCategory.filter((element: any) => {
          return selectedIds.includes(element.fee_category_id)
        })
        setSubCategoryOptions(subcategoryOptions)

        const periodOfServiceOptions = formData.periodOfService.filter((element: any) => {
          return selectedIds.includes(element.fee_category_id)
        })

        setPeriodOfServiceOptions(removeDuplicatesAndNullByKey(periodOfServiceOptions, 'period_of_service_id'))
      } else {
        setSubCategoryOptions([])
      }
    }

    if (name === 'zone') {
      if (value) {
        value = [value]
        const selectedIds = value?.map((name: any) => {
          const item: any = subCategoryOptions.find((item: any) => item.fee_subcategory == name)

          return item ? item.fee_subcategory_id : undefined // Return item.id if found, otherwise undefined
        })
        const periodOfServiceOptions = formData.periodOfService.filter((element: any) => {
          return selectedIds.includes(element.fee_subcategory_id)
        })

        // const batchOptions = psaDetails.batches.filter((element: any) => {
        //   return selectedIds.includes(element.fee_subcategory_id)
        // })
        // setPsaBatchOptions(batchOptions)

        //setPeriodOfServiceOptions(periodOfServiceOptions)
      } else {
        setPeriodOfServiceOptions([])
        setPsaBatchOptions([])
      }
    }

    // if (name === "period_of_service") {
    //     if (value) {
    //         value = value.split(',');
    //         const selectedIds = value?.map((name: any) => {
    //             const item: any = periodOfServiceOptions.find(
    //                 (item: any) =>
    //                     item.period_of_service === name
    //             );
    //             return item ? item.period_of_service_id : undefined; // Return item.id if found, otherwise undefined
    //         });
    //         let batchOptions = psaDetails.batches.filter((element: any) => {
    //             return selectedIds.includes(element.period_of_service_id)
    //         })
    //         setPsaBatchOptions(batchOptions)

    //     } else {
    //         setPsaBatchOptions([]);
    //     }

    // }
  }

  const handleErrorClose = () => {
    setOpenErrorDialog(false)
  }
  useEffect(() => {
    if (details && psaDetails) {
      const selectedIds = psaDetails?.feeCategory
        ?.filter((item: any) => item.fee_category_id === details?.fee_category_id)
        .map((item: any) => item.fee_category)

      const periodOfOptions = psaDetails?.periodOfService?.filter((element: any) => {
        return selectedIds.includes(element.fee_category)
      })

      setPeriodOfServiceOptions(removeDuplicatesAndNullByKey(periodOfOptions, 'period_of_service_id'))
      setCategoryOptions(psaDetails?.feeCategory)
      const dd = details?.fee_sub_type_id
      const busTypeVal = getObjectByKeyVal(
        psaDetails?.feeSubType,
        'fee_sub_type_id',
        details?.fee_sub_type_id
      )?.fee_sub_type
      // setValue('busType',details?.fee_sub_type_id)
      // setValue('serviceType', getObjectByKeyVal(psaDetails?.feeCategory, 'fee_category_id', details?.fee_category_id)?.fee_category)

      // setValue('periodOfService',details?.period_of_service_id)

      // setValue('zoneStart',details?.stop_details[0]?.stop_id)
      const sType =  getObjectByKeyVal(psaDetails?.feeCategory, 'fee_category_id', details?.fee_category_id)
      ?.fee_category
      if(sType == 'One way'){
        const stopPayload = {
          ...(schoolParentId && { school_parent_id: schoolParentId }),
          route_type: '1',
          bus_type: busTypeVal == 'AC' ? '1' : '2'
        }
    
        getPickupDropRoutes(stopPayload, 'both')
      }else if(sType == 'Both way'){
        const pickUpStopPayload = {
          ...(schoolParentId && { school_parent_id: schoolParentId }),
          route_type: '2',
          bus_type: busTypeVal == 'AC' ? '1' : '2'
        }
  
        const dropStopPayload = {
          ...(schoolParentId && { school_parent_id:schoolParentId }),
          route_type: '1',
          bus_type: formDatVal?.busType == 'AC' ? '1' : '2'
        }
  
        getPickupDropRoutes(pickUpStopPayload, 'pickup')
        getPickupDropRoutes(dropStopPayload, 'drop')
      }
      
        reset({
          busType: busTypeVal,
          serviceType: sType,
          periodOfService: details?.period_of_service_id,
          oneWayType: 'pickup',
          zoneStart: details?.stop_details[0]?.stop_id,
          zoneEnd: details?.stop_details[1]?.stop_id
        })
     
      setVasAmount(details?.amount)
      // if (viewMode) {
      //   calculateAmmount()
      // }
    }
  }, [details, psaDetails])

  const hanldeStopTypeChange = async (value: any) => {
    const stopPayload = {
      ...(schoolParentId && { school_parent_id: schoolParentId }),
      route_type: value == 'drop' ? '1' : '2',
      bus_type: formDatVal?.busType == 'AC' ? '1' : '2'
    }

    getPickupDropRoutes(stopPayload, 'both')
  }

  const handleSericeTypeChange = (value: any) => {
    if (value == 'Both way') {
      const pickUpStopPayload = {
        ...(schoolParentId && { school_parent_id: schoolParentId }),
        route_type: '2',
        bus_type: formDatVal?.busType == 'AC' ? '1' : '2'
      }

      const dropStopPayload = {
        ...(schoolParentId && { school_parent_id:schoolParentId }),
        route_type: '1',
        bus_type: formDatVal?.busType == 'AC' ? '1' : '2'
      }

      getPickupDropRoutes(pickUpStopPayload, 'pickup')
      getPickupDropRoutes(dropStopPayload, 'drop')
    } else if (value == 'One way') {
      const pickUpStopPayload = {
        ...(schoolParentId && { school_parent_id: schoolParentId }),
        route_type: '2',
        bus_type: formDatVal?.busType == 'AC' ? '1' : '2'
      }
      getPickupDropRoutes(pickUpStopPayload, 'both')
    }
  }

  const handleBusTypeChange = (value: any, busType: any) => {
    if (value == 'Both way') {
      const pickUpStopPayload = {
        ...(schoolParentId && { school_parent_id: schoolParentId }),
        route_type: '2',
        bus_type: busType == 'AC' ? '1' : '2'
      }

      const dropStopPayload = {
        ...(schoolParentId && { school_parent_id: schoolParentId }),
        route_type: '1',
        bus_type: busType == 'AC' ? '1' : '2'
      }

      getPickupDropRoutes(pickUpStopPayload, 'pickup')
      getPickupDropRoutes(dropStopPayload, 'drop')
    } else if (value == 'One way') {
      const pickUpStopPayload = {
        ...(schoolParentId && { school_parent_id: schoolParentId }),
        route_type: '2',
        bus_type: formDatVal?.busType == 'AC' ? '1' : '2'
      }
      getPickupDropRoutes(pickUpStopPayload, 'pickup')
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <ErrorDialogBox
          openDialog={openErrorDialog}
          handleClose={handleErrorClose}
          title={errorTitle || 'Something Went Wrong !'}
        />

        {openDialog && !minimized && (
          <Box
            sx={{
              position: 'fixed',
              bottom: '0',
              right: '0',
              width: '100%',
              height: '100vh',
              backgroundColor: 'white',
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
              overflowY: 'auto',
              borderRadius: '10px',
              maxWidth: '550px'
            }}
            className='fixedModal'
          >
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                zIndex: 1400,
                width: '100%',
                p: 2
              }}
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <div
                style={{
                  padding: '10px 20px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px' }}>
                    {title}
                  </Typography>
                </Box>
                <Box>
                  <IconButton disableFocusRipple disableRipple onClick={handleMinimize}>
                    <span className='icon-minus'></span>
                  </IconButton>
                </Box>
              </div>
            </Box>
            <div style={{ padding: '20px' }}>
              <Box>
                <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                  <Grid container spacing={5}>
                    <Box
                      sx={{
                        margin: '10px auto',
                        borderRadius: '16px',
                        padding: '10px',
                        height: '80px',
                        width: '90%',
                        boxShadow: '0px 2px 10px 0px #4C4E6438'
                      }}
                    >
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant='caption'
                          color='customColors.text3'
                          sx={{ mt: 2, textTransform: 'capitalize', lineHeight: '16px', letterSpacing: '0.4px' }}
                        >
                          Amount
                        </Typography>
                        <Typography
                          variant='h5'
                          color='primary.dark'
                          sx={{
                            mt: 1,
                            fontSize: '22px',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            lineHeight: '28px',
                            letterSpacing: '0.4px'
                          }}
                        >
                          ₹ {formatAmount(Math.round(vasAmount))}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      className='fixedModal'
                      sx={{ mt: 3, mb: 4, ml: 6, overflowY: 'auto', height: 'calc(100% - 200px)' }}
                    >
                      <Grid item container xs={12} spacing={6}>
                        <Grid item xs={12} md={12}>
                          <FormControl component='fieldset'>
                            <FormLabel component='legend'>Fee Sub Type</FormLabel>
                            <Controller
                              name='busType'
                              control={control}
                              rules={{ required: 'This field is required' }}
                              render={({ field }) => (
                                <RadioGroup
                                  {...field}
                                  onChange={event => {
                                    field.onChange(event.target.value)
                                    handleOptions(event, event.target.value, 'busType')
                                  }}
                                >
                                  {psaDetails?.feeSubType?.map((item: any) => (
                                    <FormControlLabel
                                      key={item.fee_sub_type_id}
                                      value={item.fee_sub_type}
                                      control={<Radio />}
                                      label={item.fee_sub_type}
                                    />
                                  ))}
                                </RadioGroup>
                              )}
                            />
                          </FormControl>
                        </Grid>
                        {categoryOptions && categoryOptions?.length ? (
                          <Grid item xs={12} md={12}>
                            <FormControl>
                              <FormLabel
                                sx={{ fontSize: '14px', lineHeight: '15.4px', color: 'text.primary' }}
                                id='demo-row-radio-buttons-group-label'
                              >
                                Select The Service Type <span style={{ color: 'red' }}>*</span>
                              </FormLabel>
                              <Controller
                                name='serviceType'
                                control={control}
                                rules={{ required: 'Please select a service type' }}
                                render={({ field }) => (
                                  <RadioGroup
                                    row
                                    {...field}
                                    onChange={event => {
                                      field.onChange(event.target.value)
                                      handleOptions(event, event.target.value, 'serviceType')
                                      handleSericeTypeChange(event.target.value)
                                    }}
                                    value={formDatVal.serviceType}
                                  >
                                    {categoryOptions.map(option => (
                                      <FormControlLabel
                                        disabled={viewMode}
                                        key={option.fee_category_id}
                                        value={option.fee_category} // Use the unique id as the value
                                        control={<Radio />}
                                        label={option.fee_category}
                                      />
                                    ))}
                                  </RadioGroup>
                                )}
                              />
                            </FormControl>
                          </Grid>
                        ) : null}

                        {formDatVal?.serviceType === 'One way' && (
                          <>
                            <Grid item xs={12} md={12}>
                              <FormControl>
                                <FormLabel
                                  sx={{ fontSize: '14px', lineHeight: '15.4px', color: 'text.primary' }}
                                  id='demo-row-radio-buttons-group-label'
                                >
                                  Select The Stop Type
                                </FormLabel>
                                <Controller
                                  name='oneWayType'
                                  control={control}
                                  render={({ field }) => (
                                    <RadioGroup
                                      {...field}
                                      row
                                      aria-labelledby='demo-row-radio-buttons-group-label'
                                      onChange={(e, value) => {
                                        field.onChange(value)
                                        hanldeStopTypeChange(value)
                                        //handleOptions(e, value, 'serviceType')
                                      }}
                                    >
                                      <FormControlLabel
                                        value={'pickup'}
                                        sx={{
                                          '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                            color: 'customColors.text3'
                                          }
                                        }}
                                        control={
                                          <Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />
                                        }
                                        label={'Pickup'}
                                      />
                                      <FormControlLabel
                                        value={'drop'}
                                        sx={{
                                          '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                            color: 'customColors.text3'
                                          }
                                        }}
                                        control={
                                          <Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />
                                        }
                                        label={'Drop'}
                                      />
                                    </RadioGroup>
                                  )}
                                />
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={12}>
                              {stopList && stopList?.length ? (
                                <FormControl fullWidth>
                                  <InputLabel id='drop-point-label'>{`Select the stop`}</InputLabel>
                                  <Controller
                                    name='zoneStart'
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        IconComponent={DownArrow}
                                        defaultValue={''}
                                        disabled={viewMode}
                                        label={`Select the stop`}
                                        labelId='drop-point-label'
                                        onChange={(e, value: any) => {
                                          field.onChange(e?.target?.value)
                                          handleOptions(e, e?.target?.value, 'zone1')
                                        }}
                                      >
                                        {stopList?.map((val: any, ind: number) => {
                                          return (
                                            <MenuItem key={ind} value={val?.id}>
                                              {val?.stop_name}
                                            </MenuItem>
                                          )
                                        })}
                                      </Select>
                                    )}
                                  />
                                </FormControl>
                              ) : (
                                <FormControl fullWidth>
                                  <InputLabel id='demo-simple-select-outlined-label'>
                                    Select Stop <span style={{ color: 'red' }}>*</span>{' '}
                                  </InputLabel>
                                  <Select
                                    IconComponent={DownArrow}
                                    label='Select Stop'
                                    // defaultValue={pickup}
                                    id='demo-simple-select-outlined'
                                    labelId='demo-simple-select-outlined-label'
                                    // onChange={handlePickup}
                                  >
                                    <MenuItem value='selectOption'>-Select Option-</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            </Grid>
                          </>
                        )}

                        {formDatVal?.serviceType === 'Both way' && (
                          <>
                            <Grid item xs={12} md={12}>
                              {pickupStopList && pickupStopList?.length ? (
                                <FormControl fullWidth>
                                  <InputLabel id='drop-point-label'>
                                    Select Pickup Stop <span style={{ color: 'red' }}>*</span>{' '}
                                  </InputLabel>
                                  <Controller
                                    name='zoneStart'
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        IconComponent={DownArrow}
                                        disabled={viewMode}
                                        label='Select Pickup Stop'
                                        labelId='drop-point-label'
                                        onChange={(e, value: any) => {
                                          field.onChange(e?.target?.value)
                                          handleOptions(e, e?.target?.value, 'zone1')
                                        }}
                                      >
                                        {pickupStopList?.map((val: any, ind: number) => {
                                          return (
                                            <MenuItem key={ind} value={val?.id}>
                                              {val?.stop_name}
                                            </MenuItem>
                                          )
                                        })}
                                      </Select>
                                    )}
                                  />
                                </FormControl>
                              ) : (
                                <FormControl fullWidth>
                                  <InputLabel id='demo-simple-select-outlined-label'>
                                    Select Pickup Stop <span style={{ color: 'red' }}>*</span>
                                  </InputLabel>
                                  <Select
                                    IconComponent={DownArrow}
                                    label='Select Pickup Stop'
                                    // defaultValue={pickup}
                                    id='demo-simple-select-outlined'
                                    labelId='demo-simple-select-outlined-label'
                                    // onChange={handlePickup}
                                  >
                                    <MenuItem value='selectOption'>-Select Option-</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            </Grid>

                            <Grid item xs={12} md={12}>
                              {dropStopList && dropStopList?.length ? (
                                <FormControl fullWidth>
                                  <InputLabel id='drop-point-label'>
                                    Select Drop Stop <span style={{ color: 'red' }}>*</span>{' '}
                                  </InputLabel>
                                  <Controller
                                    name='zoneEnd'
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        IconComponent={DownArrow}
                                        disabled={viewMode}
                                        label='Select Drop Stop'
                                        labelId='drop-point-label'
                                        onChange={(e, value: any) => {
                                          field.onChange(e?.target?.value)
                                          handleOptions(e, e?.target?.value, 'zone1')
                                        }}
                                      >
                                        {dropStopList?.map((val: any, ind: number) => {
                                          return (
                                            <MenuItem key={ind} value={val?.id}>
                                              {val?.stop_name}
                                            </MenuItem>
                                          )
                                        })}
                                      </Select>
                                    )}
                                  />
                                </FormControl>
                              ) : (
                                <FormControl fullWidth>
                                  <InputLabel id='demo-simple-select-outlined-label'>
                                    Select Drop Stop <span style={{ color: 'red' }}>*</span>
                                  </InputLabel>
                                  <Select
                                    IconComponent={DownArrow}
                                    label='Select Drop Stop'
                                    // defaultValue={pickup}
                                    id='demo-simple-select-outlined'
                                    labelId='demo-simple-select-outlined-label'
                                    // onChange={handlePickup}
                                  >
                                    <MenuItem value='selectOption'>-Select Option-</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            </Grid>
                          </>
                        )}

                        {periodOfServiceOptions && periodOfServiceOptions?.length ? (
                          <Grid item xs={12} md={12}>
                            {periodOfServiceOptions && periodOfServiceOptions?.length ? (
                              <FormControl fullWidth>
                                <InputLabel id='drop-point-label'>
                                  Period of service <span style={{ color: 'red' }}>*</span>{' '}
                                </InputLabel>
                                <Controller
                                  name='periodOfService'
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      IconComponent={DownArrow}
                                      label='Period of service'
                                      labelId='drop-point-label'
                                      required
                                      onChange={(e, value: any) => {
                                        field.onChange(e?.target?.value)
                                        handleOptions(e, e?.target?.value, 'zone1')
                                      }}
                                    >
                                      {periodOfServiceOptions?.map((val: any, ind: number) => {
                                        return (
                                          <MenuItem key={ind} value={val?.period_of_service_id}>
                                            {val?.period_of_service}
                                          </MenuItem>
                                        )
                                      })}
                                    </Select>
                                  )}
                                />
                              </FormControl>
                            ) : (
                              <FormControl fullWidth>
                                <InputLabel id='demo-simple-select-outlined-label'>Period of service</InputLabel>
                                <Select
                                  IconComponent={DownArrow}
                                  label='Select Drop Point'
                                  // defaultValue={pickup}
                                  id='demo-simple-select-outlined'
                                  labelId='demo-simple-select-outlined-label'
                                  // onChange={handlePickup}
                                >
                                  <MenuItem value='selectOption'>-Select Option-</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          </Grid>
                        ) : null}
                      </Grid>
                      
                    </Box>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                      onClick={() => setTransportDialog(false)}
                      sx={{ width: 'auto', mr: '5px' }}
                      variant='outlined'
                      color='inherit'
                      fullWidth
                    >
                      {'Cancel'}
                    </Button>
                    {!viewMode ? (
                      <Button type='submit' sx={{ width: 'auto' }} variant='contained' color='secondary' fullWidth>
                        {isFinalSubmit ? 'Confirm' : 'Calculate'}
                      </Button>
                    ) : null}
                  </Box>
                </form>
                {showStopCreationOption ? (
              <>
                <Box sx={{ mt: '20px' }}>
                  <Link
                    href='#'
                    sx={{
                      fontSize: '14px',
                      color: 'primary.main',
                      textDecoration: 'none'
                    }}
                    onClick={() => {
                      setOpenStopDailog(true)
                    }}
                  >
                    Did Not Find Your Stop? Request New Stop
                  </Link>
                  {/* <Box mt={2}>
                  <Typography variant='body2' color='textSecondary'>
                    <Radio size='small' disabled />
                    Your Stop Addition Request Is Under Review. You’ll Be Notified Once It’s Approved Or Rejected
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Typography variant='body2' fontWeight='bold'>
                    Stop Requested: Oberoi Mall
                  </Typography>
                </Box> */}
                </Box>
                <CreateStop
                  open={openStopDailog}
                  handleClose={handleStopClose}
                  school={enquiryDetails?.school_location.id}
                  schoolLocation={schoolLocation}
                  activeStudent={userId}
                  academicYear={parseInt(academic_year)}
                  schoolParentId={schoolParentId}
                />
              </>
            ) : null}
              </Box>
            </div>
          </Box>
        )}
        {minimized && (
          <Box
            style={{
              position: 'fixed',
              bottom: 0,
              right: 0,
              width: '300px',
              height: '50px',
              backgroundColor: '#fff',
              boxShadow: '0px -2px 5px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              zIndex: 1300,
              cursor: 'pointer'
            }}
            onClick={() => setMinimized(false)}
          >
            <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '21px' }}>
              {title}
            </Typography>
            <IconButton onClick={() => setMinimized(false)}>
              <span className='icon-add'></span>
            </IconButton>
          </Box>
        )}
      </div>
    </LocalizationProvider>
  )
}

export default TransportationDialog
