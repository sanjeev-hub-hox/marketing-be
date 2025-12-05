// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
  IconButton,
  Checkbox,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Paper,
  SelectChangeEvent,
  Hidden
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import { Autocomplete, Chip, Switch } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import MuiTable from '../OwnComponents/CRM/EnuiryType/MuiTable'
import {
  CREATE_ENQUIRY_TYPE,
  GET_ENQUIRY_TYPE,
  GET_FORMS,
  GET_STAGES,
  UPDATE_ENQUIRY_TYPE,
  VALIDATE_SLUG
} from 'src/utils'
import { getRequest, patchRequest, postRequest } from 'src/services/apiService'
import { useForm, Controller } from 'react-hook-form'
import style from '../pages/enquiry-types/enquiryTypes.module.css'
import Head from 'next/head'
import { getOrderCount } from 'src/utils/helper'

// type AddiionalCreateRoleType = {
//   handleRoleDialog: (a: boolean) => void
// }

//Custom css for tooltip
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.customColors.primaryLightest,
    color: theme.palette.customColors.mainText
  }
}))

//AutoComplete Option
type Autocomplete = {
  title: string
}

type FormList = [
  {
    _id: string
    name: string
    slug: string
  }
]

interface TAT {
  tat: number
  type: 'Hr' | 'Day'
}
interface Stage {
  stagesApplicable: string
  isMandatory: string
  stageOrder: string
  weightage: string
  tatInHrDay: TAT
  initiateWorkflow: string
  stageForms: any
}
interface IFormInput {
  dfEnquiry?:any
  enquiryName: string
  slug: string
  enquiryMode: string
  enquiryOrder: string
  enquiryForms: string[]
  description: string
  isRegistrationApplicable: string
  registrationForms: string[]
  isAdmissionApplicable: string
  admissionForms: string[]
  isActive: boolean
  stages: string[]
  enquiryStages: Stage[]
  totalWeightage: any
}

export const Auto1: Autocomplete[] = [
  { title: 'Student Info' },
  { title: 'Parent Info' },
  { title: 'Enquiry Form 1' },
  { title: 'Enquiry Form 2' },
  { title: 'Enquiry Form 3' },
  { title: 'Enquiry Form 4' },
  { title: 'Enquiry Form 5' }
]

interface EnquiryTypeProps {
  edit?: boolean
  enquiryTypeId?: any
  view?: boolean
}

const CreateEnquiryType = (props: EnquiryTypeProps) => {
  const router = useRouter()
  const { enquiryTypeId, edit, view } = props
  const steps = [
    `${edit ? 'Edit' : view ? 'View' : 'Create'} Enquiry Type`,
    `${view ? 'View Mapped Stages' : 'Map With Stage'}`
  ]

  // ** States
  const [enquiryTypeName, setEnquiryTypeName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [enquiryTypeSlug, setEnquiryTypeSlug] = useState<string>('')
  const [selectedItems1, setSelectedItems1] = useState<string[]>([])
  const [selectedItems2, setSelectedItems2] = useState<string[]>([])
  const [selectedItems3, setSelectedItems3] = useState<string[]>([])
  const [selectedItems4, setSelectedItems4] = useState<string[]>([])
  const [selectedItems5, setSelectedItems5] = useState<string[]>([])
  const [selectedItems6, setSelectedItems6] = useState<string[]>([])
  const [activeStep, setActiveStep] = useState<number>(0)
  const [enquiryMode, setEnquiryMode] = useState<string>('')
  const [enquiryOrder, setEnquiryOrder] = useState<string>('')
  const [openDialog, setOpenDialog] = useState(false)
  const [infoDialog, setInfoDialog] = useState(false)
  const { setPagePaths, setGlobalState, setListingMode } = useGlobalContext()
  const [formListing, setFormListing] = useState<FormList>([{ _id: '1', name: 'default', slug: 'default' }])
  const [stageList, setStageListing] = useState<any>([])
  const [selectedStage, setSelectedStage] = useState<any>([])
  const [totalWeight, setTotalWeight] = useState<any>(0)
  const [dataLoaded, setDataLoaded] = useState<any>(false)
  const [orderList, setOrderList] = useState<any>([])
  const [draftDialog, setDraftDialog] = useState(false)
  const [enquiryTypeIdNew, setEnquiryTypeIdNew] = useState<any>(0)
  const [workflowList, setWorkflowList] = useState<any>([])
  const [defaultEnqStage, setDefaultEnqStage]  = useState<any>({})
  const [defaultEnqForm, setdefaultEnqForm]  = useState<any>({})

  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
    setValue,
    trigger,
    getValues
  } = useForm<IFormInput>()

  const formDataVal = watch()

  console.log('formDataVal', formDataVal, errors, selectedStage)
  const getDropDownData = async () => {
    setGlobalState({
      isLoading: true
    })
    let flag = true
    const params = {
      url: GET_FORMS,
      serviceURL: 'admin'
    }

    const response = await getRequest(params)
    if (response.status) {
      flag = true
      setFormListing(response.data)
    } else {
      flag = false
      setGlobalState({
        isLoading: false
      })
    }

    const data = {
      url: GET_STAGES
    }
    const resp = await getRequest(data)
    if (resp.status) {
      flag = true
      setStageListing(resp.data)
    } else {
      flag = false
      setGlobalState({
        isLoading: false
      })
    }
    setGlobalState({
      isLoading: false
    })

    setDataLoaded(flag)
  }


  const getDefualtEnquiryStage = async() =>{
    const params = {
      url:`marketing/enquiry-stage/list/global-search?pageNumber=1&pageSize=10&search=Enquiry`
    }
    const response = await getRequest(params);
    if(response?.data?.content){
      const enquiryObj = response.data.content.find((item:any) => item?.name === "Enquiry");
      setDefaultEnqStage({
        stage_id: enquiryObj._id,
        order: 1,
        weightage: 20,
        tat: {
          unit: 'hour',
          value: 1
        },
        is_mandatory: true,
        workflow: '',
        stage_forms:[]
      })
    }
}


  useEffect(() => {
    getDropDownData()
    getDefualtEnquiryStage()
  }, [])

  const getWorkflowsData = async () => {
    setGlobalState({
      isLoading: true
    })
    const params = {
      url: `/master/details?type=Workflows&subType=Marketing%20workflows`,
      serviceURL: 'admin'
    }
    const response = await getRequest(params)
    if (response?.success) {
      setWorkflowList(response?.data)
    }
  }

  console.log('orderList', orderList)
  const getTypeData = async () => {
    setGlobalState({
      isLoading: true
    })
    const params = {
      url: `${GET_ENQUIRY_TYPE}/${enquiryTypeId}`
    }
    const response = await getRequest(params)
    if (response.status) {
      console.log('stageList', stageList)
      reset({
        enquiryName: response.data.name,
        slug: response.data.slug,
        enquiryMode: response.data.mode,
        enquiryOrder: response.data.order,
        enquiryForms: response.data.enquiry_forms,
        description: response.data.description,
        isRegistrationApplicable: response.data.is_registration_applicable ? 'yes' : 'no',
        registrationForms: response.data.registration_forms,
        isAdmissionApplicable: response.data.is_admission_applicable ? 'yes' : 'no',
        admissionForms: response.data.admission_forms,
        isActive: response.data.is_active,
        stages: response.data.stages
          .filter((stage: any) => stageList.some((item: any) => item._id === stage.stage_id))
          .map((stage: any) => stage.stage_id),
        enquiryStages: response.data.stages
          .filter((stage: any) => stageList.some((item: any) => item._id === stage.stage_id))
          .map((stage: any) => {
            return {
              stagesApplicable: stage?.stage_id,
              isMandatory: stage?.is_mandatory ? 'yes' : 'no',
              stageOrder: stage?.order,
              weightage: stage?.weightage,
              tatInHrDay: {
                tat: stage.tat.value,
                type: stage.tat.unit
              },
              initiateWorkflow: stage.workflow,
              stageForms: stage.stage_forms
            }
          }),
        totalWeightage: 0
      })
      const list = getOrderCount(formDataVal?.stages?.length + 1)
      setOrderList(list)
    } else {
      setGlobalState({
        isLoading: false
      })
    }
    setGlobalState({
      isLoading: false
    })
  }

  useEffect(() => {
    if (enquiryTypeId && dataLoaded) {
      getTypeData()
      if (enquiryTypeId) {
        setEnquiryTypeIdNew(enquiryTypeId)
      }
    }
  }, [enquiryTypeId, dataLoaded])

  const handleChange1 = (e: any) => {
    setSelectedItems1(e.target.value)
  }
  const handleChange2 = (e: any) => {
    setSelectedItems2(e.target.value)
  }
  const handleChange3 = (e: any) => {
    setSelectedItems3(e.target.value)
  }
  const handleChange4 = (e: any) => {
    setSelectedItems4(e.target.value)
  }
  const handleChange5 = (e: any) => {
    setSelectedItems5(e.target.value)
  }
  const handleChange6 = (e: any) => {
    setSelectedItems6(e.target.value)
  }
  const handleDelete = (itemToDelete: string) => () => {
    setSelectedItems1(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems2(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems3(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems4(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems5(selectedItems => selectedItems.filter(item => item !== itemToDelete))
  }

  //Handler for dialog box
  const handleCloseDialog = () => {
    setOpenDialog(false)
    router.push('/enquiry-types')

    // handleRoleDialog(false)
  }
  const handleDraftClose = () => {
    setDraftDialog(false)
    setListingMode({ isDraft: 1 })
    router.push('/enquiry-types')
  }

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }
  const handleClose = () => {
    // handleRoleDialog(false)
    router.push('/enquiry-types')
  }
  const handleNext = async (mode?: string) => {
    // handleValidationCheck().then(res => {

    //   if (res) {
    //     setActiveStep(prevActiveStep => prevActiveStep + 1)
    //   }
    // })

    const data = {
      name: formDataVal.enquiryName,
      slug: formDataVal.slug,
      mode: formDataVal.enquiryMode,
      order: parseInt(formDataVal.enquiryOrder),
      enquiry_forms: formDataVal.enquiryForms,
      description: formDataVal.description,
      is_active: formDataVal.isActive,
      saved_as_draft: true
    }

    if (!view) {
      if (enquiryTypeIdNew) {
        // add patch request

        const params = {
          url: `marketing/enquiry-type/${enquiryTypeIdNew}/metadata`,
          data: data
        }

        const response = await patchRequest(params)
        if (response.status) {
          setEnquiryTypeIdNew(response?.data?._id)
          setdefaultEnqForm(response?.data?.enquiry_forms)
          if (mode == 'draft') {
            setDraftDialog(true)
          } else {
            setActiveStep(prevActiveStep => prevActiveStep + 1)
          }
        }
      } else {
        const params = {
          url: CREATE_ENQUIRY_TYPE,
          data: data
        }

        const response = await postRequest(params)
        if (response.status) {
          setEnquiryTypeIdNew(response?.data?._id)
          setdefaultEnqForm(response?.data?.enquiry_forms)

          if (mode == 'draft') {
            setDraftDialog(true)
          } else {
            setActiveStep(prevActiveStep => prevActiveStep + 1)
          }
        }
      }
    } else {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
    }
  }
  const handleSave = async (mode?: string) => {
    // if(!formDataVal?.dfEnquiry){
    //     alert('Please select enquiry form')

    //     return
    // }
    
    trigger('stages')
    if (activeStep === steps.length - 1) {
      console.log('2', edit)
      const stages = formDataVal.enquiryStages.map((val: any) => {
        return {
          stage_id: val.stagesApplicable,
          order: parseInt(val.stageOrder),
          weightage: parseInt(val.weightage),
          tat: {
            unit: val?.tatInHrDay?.type,
            value: parseInt(val.tatInHrDay?.tat)
          },
          is_mandatory: val.isMandatory == 'yes' ? true : false,
          workflow: val.initiateWorkflow || '',
          stage_forms: val.stageForms
        }
      })
      const df = {
        ...defaultEnqStage,
        stage_forms:defaultEnqForm
      }
      const data = {
        stages: [df,...stages] ,
        saved_as_draft: mode == 'draft' ? true : false,
        is_active: formDataVal.isActive
      }

      console.log('3', data)

      if (!view) {
        if (edit) {
          const params = {
            url: `${UPDATE_ENQUIRY_TYPE}/${enquiryTypeId}`,
            data: data
          }

          if (totalWeight == 100) {
            const response = await patchRequest(params)
            if (response.status) {
              if (mode == 'draft') {
                setDraftDialog(true)
              } else {
                setOpenDialog(true)
              }
            }
          }
        } else {
          const params = {
            url: `marketing/enquiry-type/${enquiryTypeIdNew}/map-stages`,
            data: data
          }

          if (totalWeight == 100) {
            const response = await patchRequest(params)
            if (response.status) {
              if (mode == 'draft') {
                setDraftDialog(true)
              } else {
                setOpenDialog(true)
              }
            }
          }
        }
      }
    }
  }

  //Handler Enquiry Mode
  const handleEnqMode = (e: any) => {
    console.log(e.target.value)
    setEnquiryMode(e.target.value)
  }

  //Handler Enquiry Order
  const handleEnqOrder = (e: any) => {
    console.log(e.target.value)
    setEnquiryOrder(e.target.value)
  }

  const getPageTitle = () => {
    const page = {
      title: 'Create Enquiry Type',
      path: '/enquiry-types'
    }
    if (edit) {
      page.title = 'Edit Enquiry Type'
      page.path = `/enquiry-types/edit/${enquiryTypeId}`
    } else if (view) {
      page.title = 'View Enquiry Type'
      page.path = `/enquiry-types/view/${enquiryTypeId}`
    }

    return page
  }
  useEffect(() => {
    setPagePaths([
      {
        title: 'Enquiry Type Listing',
        path: '/enquiry-types'
      },
      {
        title: `${getPageTitle().title}`,
        path: `${getPageTitle().path}`
      }
    ])
    getWorkflowsData()
  }, [])

  //Rows and columns for datagrid

  type ParamsType = Record<string, any>

  const handleValidationCheck = async () => {
    const isValid = await trigger()
    if (isValid) {
      return true
    } else {
      return false
    }
  }

  interface TAT {
    tat: number
    type: 'Hr' | 'Day'
  }

  const defaultStage = {
    stagesApplicable: '',
    isMandatory: '',
    orderOfStage: '',
    weightage: '',
    tatInHrDay: { tat: '', type: '' },
    initiateWorkflow: ''
  }

  const handleStageSelectChange = async () => {
    if (typeof formDataVal.stages == 'object') {
      const selectedStages = formDataVal.stages as string[]
      const newStages = selectedStages.map((stage: any, index: number) => {
        return {
          ...defaultStage,
          stagesApplicable: {
            name: stageList.find((o: any) => o._id === stage)?.name,
            _id: stage
          }
        }
      })

      if (formDataVal?.enquiryStages && formDataVal?.enquiryStages.length) {
        const ss = formDataVal?.enquiryStages?.filter((val: any) => {
          return formDataVal.stages.includes(val.stagesApplicable)
        })

        setValue('enquiryStages', ss)
        let counData = 0
        ss?.map((val: any, index: any) => {
          if (val[`weightage`] && val[`weightage`] != '') {
            counData += parseInt(val[`weightage`])
          }
        })
        setTotalWeight(counData + 20)
      }

      setSelectedStage(newStages)
    }
  }

  const handleTotalWeightage = () => {
    let counData = 0
    formDataVal?.enquiryStages?.map((val: any, index: any) => {
      if (val[`weightage`] && val[`weightage`] != '') {
        counData += parseInt(val[`weightage`])
      }
    })
    setTotalWeight(counData + 20)
  }

  useEffect(() => {
    const list = getOrderCount(formDataVal?.stages?.length + 1)

    setOrderList(list)
    if (formDataVal?.stages) {
      handleStageSelectChange()
    }
  }, [formDataVal.stages])

  const validateSlug = async () => {
    try {
      const params = {
        url: VALIDATE_SLUG,
        data: {
          slug: formDataVal.slug
        }
      }
      const response = await postRequest(params)
      if (response.status) {
        if (response.data.isUnique) {
          return true
        } else {
          return 'Slug is already taken'
        }
      } else {
        return 'Invalid Slug'
      }
    } catch (error) {
      return 'Error validating slug'
    }
  }


  return (
    <Fragment>
      <Head>
        <title>{`${getPageTitle().title}`} - CRM</title>
        <meta name='description' content={`This is the ${getPageTitle().title} page`} />
      </Head>
      {/* <Card sx={{ mt: 4, width: '100%' }}> */}
      <form
        onSubmit={handleSubmit(() => {
          handleSave()
        })}
        noValidate
      >
        <Box sx={{ background: '#fff', borderRadius: '10px', padding: '20px 10px' }}>
          <Box sx={{ width: '100%', mt: 5, display: 'flex', justifyContent: 'space-around', alignItems: 'start' }}>
            <Box sx={{ width: '95%' }}>
              <Stepper
                activeStep={activeStep}
                sx={{
                  '& .MuiStepConnector-root.MuiStepConnector-horizontal.Mui-active span': {
                    borderWidth: '2px',
                    borderColor: 'primary.dark'
                  }
                }}
              >
                {steps.map((label, index) => {
                  const stepProps: { completed?: boolean } = {}

                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  )
                })}
              </Stepper>
            </Box>
            <Box sx={{ width: '5%', mt: 1 }}>
              <IconButton
                disableFocusRipple
                disableTouchRipple
                color='secondary'
                onClick={() => setInfoDialog(prev => !prev)}
              >
                <InfoIcon style={{ color: '#FA5A7D' }} />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ mt: 5 }}>
            {activeStep === 0 && (
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='enquiryName'
                    control={control}
                    defaultValue=''
                    rules={{ required: 'Enquiry Type Name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        disabled={view}
                        error={!!errors.enquiryName}
                        helperText={errors.enquiryName ? errors.enquiryName.message : ''}
                        fullWidth
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                            Enquiry Type Name
                            {infoDialog && (
                              <span>
                                <Tooltip title='Enquiry Type Name'>
                                  <InfoIcon style={{ color: '#a3a3a3' }} />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                        placeholder='Enquiry Type Name'
                        onChange={e => {
                          field.onChange(e.target.value)
                          trigger('enquiryName')
                        }}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='slug'
                    control={control}
                    defaultValue=''
                    rules={{ required: 'Slug is required', ...(!edit && !view && { validate: validateSlug }) }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        disabled={view}
                        error={!!errors.slug}
                        helperText={errors.slug ? errors.slug.message : ''}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                            Enquiry Type Slug
                            {infoDialog && (
                              <span>
                                <Tooltip title='Enquiry Type Slug'>
                                  <InfoIcon style={{ color: '#a3a3a3' }} />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                        placeholder='Enquiry Type Slug'
                        onChange={e => {
                          field.onChange(e.target.value)
                          trigger('slug')
                        }}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id='demo-simple-select-outlined-label'>
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Enquiry Mode
                        {infoDialog && (
                          <span>
                            <Tooltip title='Enquiry Mode'>
                              <InfoIcon style={{ color: '#a3a3a3' }} />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    </InputLabel>
                    {/* <Controller
                      name='enquiryMode'
                      control={control}
                      defaultValue=''
                      rules={{ required: 'Enquiry Mode is required' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId='demo-mutiple-chip-label'
                          id='demo-mutiple-chip'
                          label='Enquiry Mode'
                          error={!!errors.enquiryMode}
                          onChange={e => {
                            field.onChange(e.target.value)
                            trigger('enquiryMode')
                          }}
                        >
                          <MenuItem value=''>
                            <em>Select Option</em>
                          </MenuItem>
                          <MenuItem value='digital'>Digital</MenuItem>
                          <MenuItem value='offline'>Offline</MenuItem>
                          <MenuItem value='referral'>Referral</MenuItem>
                        </Select>
                      )}
                    /> */}
                    <Controller
                      name='enquiryMode'
                      control={control}
                      defaultValue=''
                      rules={{ required: 'Enquiry Mode is required' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          disabled={view}
                          label='Enquiry Mode'
                          error={!!errors.enquiryMode}
                          id='enquiry-mode'
                          labelId='demo-simple-select-outlined-label'
                          onChange={e => {
                            field.onChange(e.target.value)
                            trigger('enquiryMode')
                          }}
                        >
                          <MenuItem value=''>
                            <em>Select Option</em>
                          </MenuItem>
                          <MenuItem value='digital'>Digital</MenuItem>
                          <MenuItem value='offline'>Offline</MenuItem>
                          <MenuItem value='referral'>Referral</MenuItem>
                        </Select>
                      )}
                    />
                    {errors?.enquiryMode && (
                      <span className={style.errorField}>{errors['enquiryMode']['message']}</span>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id='demo-simple-select-outlined-label'>
                      {
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Enquiry Order
                          {infoDialog && (
                            <span>
                              <Tooltip title='Enquiry Order'>
                                <InfoIcon style={{ color: '#a3a3a3' }} />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Controller
                      name='enquiryOrder'
                      control={control}
                      defaultValue=''
                      rules={{ required: 'Enquiry Order is required' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label='Enquiry Order'
                          disabled={view}
                          defaultValue=''
                          id='demo-simple-select-outlined'
                          labelId='demo-simple-select-outlined-label'
                          onChange={e => {
                            field.onChange(e.target.value)
                            trigger('enquiryOrder')
                          }}
                          error={!!errors.enquiryOrder}
                        >
                          <MenuItem value=''>
                            <em>Select</em>
                          </MenuItem>
                          <MenuItem value='1'>1</MenuItem>
                          <MenuItem value='2'>2</MenuItem>
                          <MenuItem value='3'>3</MenuItem>
                          <MenuItem value='4'>4</MenuItem>
                          <MenuItem value='5'>5</MenuItem>
                        </Select>
                      )}
                    />
                    {errors?.enquiryOrder && (
                      <span className={style.errorField}>{errors['enquiryOrder']['message']}</span>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='enquiryForms'
                    control={control}
                    defaultValue={[]}
                    rules={{ required: 'Enquiry Forms are required' }}
                    render={({ field }) => (
                      <Autocomplete
                        multiple
                        disabled={view}
                        id='autocomplete-multiple-filled'
                        options={formListing}
                        getOptionLabel={option => option.name}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        value={formListing.filter(option => field.value.includes(option._id))}
                        onChange={(event, newValue) => {
                          const newSlugs = newValue.map(item => item._id)
                          field.onChange(newSlugs)
                          trigger('enquiryForms')
                        }}
                        renderOption={(props, option, { selected }) => {
                          const isSelected = field.value.includes(option._id)

                          return (
                            <li {...props}>
                              <Checkbox checked={isSelected} />
                              {option.name}
                            </li>
                          )
                        }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            required
                            error={!!errors?.enquiryForms}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                Enquiry Form
                                {infoDialog && (
                                  <span>
                                    <Tooltip title='Enquiry Form'>
                                      <InfoIcon />
                                    </Tooltip>
                                  </span>
                                )}
                              </Box>
                            }
                            placeholder='Enquiry Form'
                          />
                        )}
                        renderTags={(value, getTagProps) => {
                          const MAX_CHIP_LENGTH = 15
                          const displayItems = value.length > 1 ? value.slice(0, 1) : value
                          const moreItems = value.length > 1 ? value.slice(1) : []

                          return (
                            <div>
                              {displayItems.map((option, index) => {
                                const truncatedLabel =
                                  option.name.length > MAX_CHIP_LENGTH
                                    ? `${option.name.substring(0, MAX_CHIP_LENGTH)}...`
                                    : option.name

                                return (
                                  <Tooltip key={index} title={option.name}>
                                    <Chip
                                      color='default'
                                      deleteIcon={<span className='icon-trailing-icon'></span>}
                                      variant='filled'
                                      label={truncatedLabel}
                                      {...getTagProps({ index })}
                                      key={index}
                                    />
                                  </Tooltip>
                                )
                              })}
                              {moreItems.length > 0 && (
                                <HtmlTooltip
                                  title={
                                    <span style={{ whiteSpace: 'pre-line' }}>
                                      {moreItems.map(item => item.name).join('\n')}
                                    </span>
                                  }
                                >
                                  <span> +{moreItems.length} </span>
                                </HtmlTooltip>
                              )}
                            </div>
                          )
                        }}
                      />
                    )}
                  />
                  {errors?.enquiryForms && (
                    <span className={style.errorField}>{errors['enquiryForms']['message']}</span>
                  )}{' '}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='description'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <TextField
                        {...field}
                        disabled={view}
                        fullWidth
                        error={!!errors.description}
                        helperText={errors.description ? errors.description.message : ''}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                            Description
                            {infoDialog && (
                              <span>
                                <Tooltip title='Description'>
                                  <InfoIcon style={{ color: '#a3a3a3' }} />
                                </Tooltip>
                              </span>
                            )}
                          </Box>
                        }
                        placeholder='Description'
                        onChange={e => {
                          field.onChange(e.target.value)
                          trigger('description')
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name='isActive'
                    control={control}
                    defaultValue={true}
                    render={({ field }) => (
                      <>
                        <div className='toggle-select'>
                          <span className='toggle-status'>{formDataVal?.isActive ? 'Active' : 'Inactive'}</span>
                          <Switch
                            defaultChecked
                            disabled={view}
                            {...field}
                            checked={field.value}
                            onChange={e => {
                              field.onChange(e.target.checked)
                              trigger('isActive')
                            }}
                          />
                        </div>
                      </>
                    )}
                  />
                </Grid>
                {/* <Grid item xs={12} sm={6}>
                  <FormControl>
                    <FormLabel className='radio' id='demo-row-radio-buttons-group-label'>
                      Is Registration Applicable?
                    </FormLabel>
                    <Controller
                      name='isRegistrationApplicable'
                      control={control}
                      defaultValue='no'
                      render={({ field }) => (
                        <RadioGroup row aria-labelledby='demo-row-radio-buttons-group-label' {...field}>
                          <FormControlLabel disabled={view} value='yes' control={<Radio />} label='Yes' />
                          <FormControlLabel disabled={view} value='no' control={<Radio />} label='No' />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                </Grid> */}
                {/* <Grid item xs={12} sm={6}>
                  <FormControl>
                    <FormLabel className='radio' id='demo-row-radio-buttons-group-label'>
                      Is Admission Applicable?
                    </FormLabel>
                    <Controller
                      name='isAdmissionApplicable'
                      control={control}
                      defaultValue='no'
                      render={({ field }) => (
                        <RadioGroup row aria-labelledby='demo-row-radio-buttons-group-label' {...field}>
                          <FormControlLabel disabled={view} value='yes' control={<Radio />} label='Yes' />
                          <FormControlLabel disabled={view} value='no' control={<Radio />} label='No' />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                </Grid> */}
                {/* <Grid item xs={12} sm={6}>
                  {formDataVal.isRegistrationApplicable == 'yes' ? (
                    <Controller
                      name='registrationForms'
                      control={control}
                      defaultValue={[]}
                      rules={{
                        ...(formDataVal.isRegistrationApplicable == 'yes' && {
                          required: formDataVal.isRegistrationApplicable == 'yes'
                        })
                      }}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          id='autocomplete-multiple-filled'
                          disabled={view}
                          options={formListing}
                          getOptionLabel={option => option.name}
                          isOptionEqualToValue={(option: any, value) => option._id === value._id}
                          value={formListing.filter(option => field?.value?.includes(option._id))}
                          onChange={(event: any, newValue) => {
                            const newSlugs = newValue.map(item => item._id)
                            field.onChange(newSlugs)

                            trigger('registrationForms')
                          }}
                          renderOption={(props, option, { selected }) => {
                            const isSelected = field?.value?.includes(option._id)

                            return (
                              <li {...props}>
                                <Checkbox checked={isSelected} />
                                {option.name}
                              </li>
                            )
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              error={!!errors.registrationForms}
                              helperText={errors.registrationForms ? errors.registrationForms.message : ''}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                  Registration Form
                                  {infoDialog && (
                                    <span>
                                      <Tooltip title='Registration Form'>
                                        <InfoIcon />
                                      </Tooltip>
                                    </span>
                                  )}
                                </Box>
                              }
                              placeholder='Registration Form'
                              // onChange={e => {
                              //   // field.onChange(e.target.value)
                              //   trigger('registrationForms')
                              // }}
                            />
                          )}
                          renderTags={(value, getTagProps) => {
                            const displayItems = value.length > 2 ? value.slice(0, 2) : value
                            const moreItems = value.length > 2 ? value.slice(2) : []

                            return (
                              <div>
                                {displayItems.map((option, index) => (
                                  <Chip
                                    color='default'
                                    deleteIcon={<span className='icon-trailing-icon'></span>}
                                    variant='filled'
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    key={index}
                                  />
                                ))}
                                {moreItems.length > 0 && (
                                  <HtmlTooltip
                                    title={
                                      <span style={{ whiteSpace: 'pre-line' }}>
                                        {moreItems.map(item => item.name).join('\n')}
                                      </span>
                                    }
                                  >
                                    <span> +{moreItems.length} </span>
                                  </HtmlTooltip>
                                )}
                              </div>
                            )
                          }}
                        />
                      )}
                    />
                  ) : null}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {formDataVal.isAdmissionApplicable == 'yes' ? (
                    <Controller
                      name='admissionForms'
                      control={control}
                      defaultValue={[]}
                      rules={{
                        ...(formDataVal.isAdmissionApplicable == 'yes' && {
                          required: formDataVal.isAdmissionApplicable == 'yes'
                        })
                      }}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          id='autocomplete-multiple-filled'
                          disabled={view}
                          options={formListing}
                          getOptionLabel={option => option.name}
                          isOptionEqualToValue={(option: any, value) => option._id === value?._id}
                          value={formListing.filter(option => field?.value?.includes(option._id))}
                          onChange={(event: any, newValue) => {
                            const newSlugs = newValue.map(item => item._id)
                            field.onChange(newSlugs)

                            trigger('admissionForms')
                          }}
                          renderOption={(props, option, { selected }) => {
                            const isSelected = field?.value?.includes(option._id)

                            return (
                              <li {...props}>
                                <Checkbox checked={isSelected} />
                                {option.name}
                              </li>
                            )
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              error={!!errors.admissionForms}
                              helperText={errors.admissionForms ? errors.admissionForms.message : ''}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                  Admission Form
                                  {infoDialog && (
                                    <span>
                                      <Tooltip title='Admission Form'>
                                        <InfoIcon />
                                      </Tooltip>
                                    </span>
                                  )}
                                </Box>
                              }
                              placeholder='Admission Form'
                              // onChange={e => {
                              //   //field.onChange(e.target.value)
                              //   trigger('admissionForms')
                              // }}
                            />
                          )}
                          renderTags={(value, getTagProps) => {
                            const displayItems = value.length > 2 ? value.slice(0, 2) : value
                            const moreItems = value.length > 2 ? value.slice(2) : []

                            return (
                              <div>
                                {displayItems.map((option, index) => (
                                  <Chip
                                    color='default'
                                    deleteIcon={<span className='icon-trailing-icon'></span>}
                                    variant='filled'
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    key={index}
                                  />
                                ))}
                                {moreItems.length > 0 && (
                                  <HtmlTooltip
                                    title={
                                      <span style={{ whiteSpace: 'pre-line' }}>
                                        {moreItems.map(item => item.name).join('\n')}
                                      </span>
                                    }
                                  >
                                    <span> +{moreItems.length} </span>
                                  </HtmlTooltip>
                                )}
                              </div>
                            )
                          }}
                        />
                      )}
                    />
                  ) : null}
                </Grid> */}
              </Grid>
            )}
            {activeStep === 1 && (
              <>
                <Grid container spacing={5}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='enquiryName'
                      control={control}
                      defaultValue=''
                      rules={{ required: 'Enquiry Type Name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          disabled
                          error={!!errors.enquiryName}
                          helperText={errors.enquiryName ? errors.enquiryName.message : ''}
                          fullWidth
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                              Enquiry Type Name
                              {infoDialog && (
                                <span>
                                  <Tooltip title='Enquiry Type Name'>
                                    <InfoIcon style={{ color: '#a3a3a3' }} />
                                  </Tooltip>
                                </span>
                              )}
                            </Box>
                          }
                          placeholder='Enquiry Type Name'
                          onChange={e => {
                            field.onChange(e.target.value)
                            trigger('enquiryName')
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='stages'
                      control={control}
                      rules={{ required: 'Stages are required' }}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          disabled={view}
                          id='autocomplete-multiple-filled'
                          options={stageList}
                          getOptionLabel={option => option.name}
                          isOptionEqualToValue={(option, value) => option._id === value._id}
                          value={stageList.filter((option: any) => field?.value?.includes(option._id))}
                          onChange={(event, newValue) => {
                            const newSlugs = newValue.map(item => item._id)
                            field.onChange(newSlugs)
                            trigger('stages')
                          }}
                          renderOption={(props, option, { selected }) => {
                            const isSelected = field?.value?.includes(option._id)

                            return (
                              <li {...props}>
                                <Checkbox checked={isSelected} />
                                {option.name}
                              </li>
                            )
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              error={!!errors?.enquiryForms}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                  Select stages
                                  {infoDialog && (
                                    <span>
                                      <Tooltip title='Select stages'>
                                        <InfoIcon />
                                      </Tooltip>
                                    </span>
                                  )}
                                </Box>
                              }
                              placeholder='Select stages'
                            />
                          )}
                          renderTags={(value, getTagProps) => {
                            const displayItems = value.length > 2 ? value.slice(0, 2) : value
                            const moreItems = value.length > 2 ? value.slice(2) : []

                            return (
                              <div>
                                {displayItems.map((option, index) => (
                                  <Chip
                                    color='default'
                                    deleteIcon={<span className='icon-trailing-icon'></span>}
                                    variant='filled'
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    key={index}
                                  />
                                ))}
                                {moreItems.length > 0 && (
                                  <HtmlTooltip
                                    title={
                                      <span style={{ whiteSpace: 'pre-line' }}>
                                        {moreItems.map(item => item.name).join('\n')}
                                      </span>
                                    }
                                  >
                                    <span> +{moreItems.length} </span>
                                  </HtmlTooltip>
                                )}
                              </div>
                            )
                          }}
                        />
                      )}
                    />
                    {errors?.stages && <span className={style.errorField}>{errors['stages']['message']}</span>}{' '}
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    {/* <DataGrid autoHeight columns={columns} rows={rows} hideFooterPagination sx={{ boxShadow: 'none' }} /> */}
                    {/* <MuiTable /> */}
                    {/*Table*/}
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: '100%', maxWidth: '100%' }} aria-label='simple table'>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ flex: 1 }}>Stages Applicable</TableCell>
                            <TableCell sx={{ flex: 1 }}>Is Mandatory</TableCell>
                            <TableCell sx={{ flex: 1 }}>Order Of Stage</TableCell>
                            <TableCell sx={{ flex: 1 }}>Weightage</TableCell>
                            <TableCell sx={{ flex: 1 }}>TAT in Hr/Day</TableCell>
                            <TableCell sx={{ flex: 1 }}>Initiate Workflow</TableCell>
                            <TableCell sx={{ flex: 1 }}>Dynamic Forms</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>{'Enquiry'}</TableCell>
                            <TableCell sx={{ flex: 1 }}>
                              <Hidden>
                                <TextField
                                  disabled={true}
                                  hidden
                                  size='small'
                                  InputProps={{
                                    style: {
                                      fontSize: '14px',
                                      padding: '6px 10px',
                                      margin: '0'
                                    }
                                  }}
                                  sx={{ padding: 0, display: 'none' }}
                                />
                              </Hidden>

                              <FormControl fullWidth size='small'>
                                <Select disabled={true} value={'yes'} sx={{ paddingRight: '0px' }}>
                                  <MenuItem value='yes'>Yes</MenuItem>
                                  <MenuItem value='no'>No</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ flex: 1 }}>
                              <FormControl fullWidth size='small'>
                                <Select value={1} disabled={true} sx={{}}>
                                  {orderList && orderList?.length
                                    ? orderList?.map((val: any, index: number) => {
                                        return (
                                          <MenuItem key={index} value={val.value}>
                                            {val.label}
                                          </MenuItem>
                                        )
                                      })
                                    : null}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ flex: 1 }}>
                              <FormControl fullWidth size='small'>
                                <TextField
                                  value={'20'}
                                  disabled={true}
                                  size='small'
                                  type='text'
                                  InputProps={{
                                    style: {
                                      fontSize: '14px',
                                      padding: '6px 10px',
                                      margin: '0'
                                    }
                                  }}
                                  sx={{ padding: 0 }}
                                />
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ flex: 1 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <TextField
                                    disabled={true}
                                    value={1}
                                    size='small'
                                    type='number'
                                    InputProps={{
                                      style: {
                                        fontSize: '14px',
                                        padding: '6px 0px',
                                        margin: '0'
                                      }
                                    }}
                                    sx={{ padding: 0 }}
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <FormControl fullWidth>
                                    <Select
                                      value={'hour'}
                                      disabled={true}
                                      sx={{
                                        fontSize: '14px',
                                        paddingRight: '30px'
                                      }}
                                    >
                                      <MenuItem value='hour'>Hr</MenuItem>
                                      <MenuItem value='day'>Day</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                              </Grid>
                            </TableCell>
                            <TableCell sx={{ flex: 1 }}>
                              <FormControl fullWidth size='small'>
                                <Select
                                  value={'66701793e5dc6d07e183710c'}
                                  disabled={true}
                                  sx={{ paddingRight: '0px' }}
                                ></Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ flex: 1 }}>
                              <Controller
                                name={`dfEnquiry`}
                                rules={{ required: 'This Option is required' }}
                                control={control}
                                defaultValue={[]}
                                render={({ field }) => (
                              <Autocomplete
                                multiple
                                sx={{
                                  width: '400px'
                                }}
                                disabled={true}
                                id='autocomplete-multiple-filled'
                                options={formListing}
                                getOptionLabel={option => option.name}
                                isOptionEqualToValue={(option, value) => option._id === value._id}
                                value={formListing.filter(option => field.value.includes(option._id))}
                                onChange={(event, newValue) => {
                                  const newSlugs = newValue.map(item => item._id)
                                  field.onChange(newSlugs)
                                  trigger(`dfEnquiry`)
                                }}
                                renderOption={(props, option, { selected }) => {
                                  const isSelected = false

                                  return (
                                    <li {...props}>
                                      <Checkbox checked={isSelected} />
                                      {option.name}
                                    </li>
                                  )
                                }}
                                renderInput={params => (
                                  <TextField
                                    {...params}
                                    fullWidth
                                    label={
                                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                        Stage Form
                                        {infoDialog && (
                                          <span>
                                            <Tooltip title='Stage Form'>
                                              <InfoIcon />
                                            </Tooltip>
                                          </span>
                                        )}
                                      </Box>
                                    }
                                    placeholder='Stage Form'
                                  />
                                )}
                                renderTags={(value, getTagProps) => {
                                  const MAX_CHIP_LENGTH = 15
                                  const displayItems = value.length > 1 ? value.slice(0, 1) : value
                                  const moreItems = value.length > 1 ? value.slice(1) : []

                                  return (
                                    <div>
                                      {displayItems.map((option, index) => {
                                        const truncatedLabel =
                                          option.name.length > MAX_CHIP_LENGTH
                                            ? `${option.name.substring(0, MAX_CHIP_LENGTH)}...`
                                            : option.name

                                        return (
                                          <Tooltip key={index} title={option.name}>
                                            <Chip
                                              color='default'
                                              deleteIcon={<span className='icon-trailing-icon'></span>}
                                              variant='filled'
                                              label={truncatedLabel}
                                              {...getTagProps({ index })}
                                              key={index}
                                            />
                                          </Tooltip>
                                        )
                                      })}
                                      {moreItems.length > 0 && (
                                        <HtmlTooltip
                                          title={
                                            <span style={{ whiteSpace: 'pre-line' }}>
                                              {moreItems.map(item => item.name).join('\n')}
                                            </span>
                                          }
                                        >
                                          <span> +{moreItems.length} </span>
                                        </HtmlTooltip>
                                      )}
                                    </div>
                                  )
                                }}
                              />
                              )}
                              />
                            </TableCell>
                          </TableRow>
                          {Array.isArray(formDataVal?.stages) && formDataVal?.stages?.length
                            ? formDataVal?.stages?.map((row: any, index: any) => (
                                <TableRow key={index}>
                                  <TableCell>{stageList.find((o: any) => o._id === row)?.name}</TableCell>
                                  <TableCell sx={{ flex: 1 }}>
                                    <Hidden>
                                      <Controller
                                        name={`enquiryStages.${index}.stagesApplicable`}
                                        defaultValue={row}
                                        control={control}
                                        render={({ field }) => (
                                          <TextField
                                            {...field}
                                            onLoad={() => {
                                              setValue(`enquiryStages.${index}.stagesApplicable`, row)
                                            }}
                                            disabled={view}
                                            value={row}
                                            hidden
                                            size='small'
                                            InputProps={{
                                              style: {
                                                fontSize: '14px',
                                                padding: '6px 10px',
                                                margin: '0'
                                              }
                                            }}
                                            sx={{ padding: 0, display: 'none' }}
                                          />
                                        )}
                                      />
                                    </Hidden>
                                    <Controller
                                      name={`enquiryStages.${index}.isMandatory`}
                                      control={control}
                                      rules={{ required: 'This Option is required' }}
                                      render={({ field }) => (
                                        <FormControl fullWidth size='small'>
                                          <Select
                                            {...field}
                                            disabled={view}
                                            value={
                                              formDataVal &&
                                              formDataVal?.enquiryStages &&
                                              formDataVal?.enquiryStages?.length
                                                ? formDataVal.enquiryStages[index]?.isMandatory
                                                : null
                                            }
                                            sx={{ paddingRight: '0px' }}
                                            error={errors.enquiryStages && !!errors.enquiryStages[index]?.isMandatory}
                                          >
                                            <MenuItem value='yes'>Yes</MenuItem>
                                            <MenuItem value='no'>No</MenuItem>
                                          </Select>
                                        </FormControl>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ flex: 1 }}>
                                    <FormControl fullWidth size='small'>
                                      <Controller
                                        name={`enquiryStages.${index}.stageOrder`}
                                        control={control}
                                        rules={{ required: 'Stage Order is required' }}
                                        render={({ field }) => (
                                          <Select
                                            {...field}
                                            value={
                                              formDataVal &&
                                              formDataVal?.enquiryStages &&
                                              formDataVal?.enquiryStages?.length
                                                ? formDataVal.enquiryStages[index]?.stageOrder
                                                : null
                                            }
                                            disabled={view}
                                            sx={{}}
                                            error={errors.enquiryStages && !!errors.enquiryStages[index]?.stageOrder}
                                          >
                                            {orderList && orderList?.length
                                              ? orderList?.map((val: any, index: number) => {
                                                  return (
                                                    <MenuItem key={index} value={val.value}>
                                                      {val.label}
                                                    </MenuItem>
                                                  )
                                                })
                                              : null}
                                          </Select>
                                        )}
                                      />
                                    </FormControl>
                                  </TableCell>
                                  <TableCell sx={{ flex: 1 }}>
                                    <FormControl fullWidth size='small'>
                                      <Controller
                                        name={`enquiryStages.${index}.weightage`}
                                        control={control}
                                        rules={{ required: 'Weightage is required' }}
                                        render={({ field }) => (
                                          <TextField
                                            {...field}
                                            value={
                                              formDataVal &&
                                              formDataVal?.enquiryStages &&
                                              formDataVal?.enquiryStages?.length
                                                ? formDataVal.enquiryStages[index]?.weightage
                                                : null
                                            }
                                            disabled={view}
                                            size='small'
                                            type='text'
                                            onChange={e => {
                                              setValue(`enquiryStages.${index}.stagesApplicable`, row)

                                              field.onChange(e.target.value)
                                              handleTotalWeightage()
                                              trigger('enquiryName')
                                            }}
                                            error={errors.enquiryStages && !!errors.enquiryStages[index]?.weightage}
                                            InputProps={{
                                              style: {
                                                fontSize: '14px',
                                                padding: '6px 10px',
                                                margin: '0'
                                              }
                                            }}
                                            sx={{ padding: 0 }}
                                          />
                                        )}
                                      />
                                    </FormControl>
                                  </TableCell>
                                  <TableCell sx={{ flex: 1 }}>
                                    <Grid container spacing={2}>
                                      <Grid item xs={6}>
                                        <Controller
                                          name={`enquiryStages.${index}.tatInHrDay.tat`}
                                          control={control}
                                          rules={{ required: 'TAT Required' }}
                                          render={({ field }) => (
                                            <TextField
                                              {...field}
                                              disabled={view}
                                              value={
                                                formDataVal &&
                                                formDataVal?.enquiryStages &&
                                                formDataVal?.enquiryStages?.length
                                                  ? formDataVal.enquiryStages[index]?.tatInHrDay?.tat
                                                  : null
                                              }
                                              error={
                                                errors.enquiryStages && !!errors.enquiryStages[index]?.tatInHrDay?.tat
                                              }
                                              size='small'
                                              type='number'
                                              InputProps={{
                                                style: {
                                                  fontSize: '14px',
                                                  padding: '6px 0px',
                                                  margin: '0'
                                                }
                                              }}
                                              sx={{ padding: 0 }}
                                            />
                                          )}
                                        />
                                      </Grid>
                                      <Grid item xs={6}>
                                        <FormControl fullWidth>
                                          <Controller
                                            name={`enquiryStages.${index}.tatInHrDay.type`}
                                            control={control}
                                            rules={{ required: 'TAT type required' }}
                                            render={({ field }) => (
                                              <Select
                                                {...field}
                                                value={
                                                  formDataVal &&
                                                  formDataVal?.enquiryStages &&
                                                  formDataVal?.enquiryStages?.length
                                                    ? formDataVal.enquiryStages[index]?.tatInHrDay?.type
                                                    : null
                                                }
                                                disabled={view}
                                                error={
                                                  errors.enquiryStages &&
                                                  !!errors.enquiryStages[index]?.tatInHrDay?.type
                                                }
                                                sx={{
                                                  fontSize: '14px',
                                                  paddingRight: '30px'
                                                }}
                                              >
                                                <MenuItem value='hour'>Hr</MenuItem>
                                                <MenuItem value='day'>Day</MenuItem>
                                              </Select>
                                            )}
                                          />
                                        </FormControl>
                                      </Grid>
                                    </Grid>
                                  </TableCell>
                                  <TableCell sx={{ flex: 1 }}>
                                    <FormControl fullWidth size='small'>
                                      <Controller
                                        name={`enquiryStages.${index}.initiateWorkflow`}
                                        control={control}
                                        rules={{
                                          required: 'Workflow required'
                                        }}
                                        defaultValue={''}
                                        render={({ field }) => (
                                          <Select
                                            {...field}
                                            value={
                                              formDataVal &&
                                              formDataVal?.enquiryStages &&
                                              formDataVal?.enquiryStages?.length
                                                ? formDataVal.enquiryStages[index]?.initiateWorkflow
                                                : null
                                            }
                                            disabled={
                                              view ||
                                              !workflowList?.find(
                                                (item: any) =>
                                                  item?.stage === stageList.find((o: any) => o._id === row)?.name
                                              )?.workflow_activities?.length
                                            }
                                            onChange={e => {
                                              field.onChange(e.target.value)
                                            }}
                                            sx={{ paddingRight: '0px' }}
                                            error={
                                              errors.enquiryStages && !!errors.enquiryStages[index]?.initiateWorkflow
                                            }
                                          >
                                            {workflowList
                                              ?.find(
                                                (item: any) =>
                                                  item?.stage === stageList.find((o: any) => o._id === row)?.name
                                              )
                                              ?.workflow_activities?.filter((activity_: any) => !activity_?.is_default)
                                              ?.map((stage_: any) => (
                                                <MenuItem key={stage_?._id} value={stage_?._id}>
                                                  {stage_?.display_name}
                                                </MenuItem>
                                              ))}
                                          </Select>
                                        )}
                                      />
                                    </FormControl>
                                  </TableCell>
                                  <TableCell sx={{ flex: 1 }}>
                                    <Controller
                                      name={`enquiryStages.${index}.stageForms`}
                                      control={control}
                                      defaultValue={[]}
                                      render={({ field }) => (
                                        <Autocomplete
                                          multiple
                                          sx={{
                                            width: '400px'
                                          }}
                                          disabled={view}
                                          id='autocomplete-multiple-filled'
                                          options={formListing}
                                          getOptionLabel={option => option.name}
                                          isOptionEqualToValue={(option, value) => option._id === value._id}
                                          value={formListing.filter(option => field.value.includes(option._id))}
                                          onChange={(event, newValue) => {
                                            const newSlugs = newValue.map(item => item._id)
                                            field.onChange(newSlugs)
                                            trigger(`enquiryStages.${index}.stageForms`)
                                          }}
                                          renderOption={(props, option, { selected }) => {
                                            const isSelected = field.value.includes(option._id)

                                            return (
                                              <li {...props}>
                                                <Checkbox checked={isSelected} />
                                                {option.name}
                                              </li>
                                            )
                                          }}
                                          renderInput={params => (
                                            <TextField
                                              {...params}
                                              fullWidth
                                              label={
                                                <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                                                  Stage Form
                                                  {infoDialog && (
                                                    <span>
                                                      <Tooltip title='Stage Form'>
                                                        <InfoIcon />
                                                      </Tooltip>
                                                    </span>
                                                  )}
                                                </Box>
                                              }
                                              placeholder='Stage Form'
                                            />
                                          )}
                                          renderTags={(value, getTagProps) => {
                                            const MAX_CHIP_LENGTH = 15
                                            const displayItems = value.length > 1 ? value.slice(0, 1) : value
                                            const moreItems = value.length > 1 ? value.slice(1) : []

                                            return (
                                              <div>
                                                {displayItems.map((option, index) => {
                                                  const truncatedLabel =
                                                    option.name.length > MAX_CHIP_LENGTH
                                                      ? `${option.name.substring(0, MAX_CHIP_LENGTH)}...`
                                                      : option.name

                                                  return (
                                                    <Tooltip key={index} title={option.name}>
                                                      <Chip
                                                        color='default'
                                                        deleteIcon={<span className='icon-trailing-icon'></span>}
                                                        variant='filled'
                                                        label={truncatedLabel}
                                                        {...getTagProps({ index })}
                                                        key={index}
                                                      />
                                                    </Tooltip>
                                                  )
                                                })}
                                                {moreItems.length > 0 && (
                                                  <HtmlTooltip
                                                    title={
                                                      <span style={{ whiteSpace: 'pre-line' }}>
                                                        {moreItems.map(item => item.name).join('\n')}
                                                      </span>
                                                    }
                                                  >
                                                    <span> +{moreItems.length} </span>
                                                  </HtmlTooltip>
                                                )}
                                              </div>
                                            )
                                          }}
                                        />
                                      )}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            : null}
                          {selectedStage.length > 0 && (
                            <TableRow>
                              <TableCell sx={{ flex: 1 }}></TableCell>
                              <TableCell sx={{ flex: 1 }}></TableCell>
                              <TableCell sx={{ flex: 1 }}></TableCell>
                              <TableCell sx={{ flex: 1 }}>
                                <FormControl fullWidth size='small'>
                                  <Controller
                                    name={`totalWeightage`}
                                    control={control}
                                    rules={{ required: 'Weightage is required' }}
                                    defaultValue={totalWeight}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        disabled
                                        value={totalWeight}
                                        error={totalWeight != 100}
                                        size='small'
                                        type='text'
                                        InputProps={{
                                          style: {
                                            fontSize: '14px',
                                            padding: '6px 10px',
                                            margin: '0'
                                          }
                                        }}
                                        sx={{ padding: 0 }}
                                      />
                                    )}
                                  />
                                  {totalWeight != 100 && (
                                    <span className={style.errorField}>{'Totl weightage should be 100'}</span>
                                  )}
                                </FormControl>
                              </TableCell>
                              <TableCell sx={{ flex: 1 }}></TableCell>
                              <TableCell sx={{ flex: 1 }}></TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/**End Table*/}
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
          <SuccessDialog
            title={`Enquiry Type ${edit ? 'Updated' : 'Created'} Successfully`}
            openDialog={openDialog}
            handleClose={handleCloseDialog}
          />

          {draftDialog && (
            <SuccessDialog title='Draft Saved Successfully!' openDialog={draftDialog} handleClose={handleDraftClose} />
          )}
          {/* <Box sx={{ mt: 5, mb: 5 }}>
          <Divider />
        </Box> */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5, mb: 5 }}>
            <Button
              size='large'
              variant='outlined'
              color='inherit'
              sx={{ mr: 2 }}
              onClick={() => (activeStep === 0 ? handleClose() : handleBack())}
            >
              {activeStep === 0 ? 'Cancel' : 'Go Back'}
            </Button>

            {!view && !edit ? (
              <Button
                disabled={view}
                size='large'
                variant='contained'
                color='inherit'
                onClick={
                  activeStep === steps.length - 1
                    ? () => {
                        handleSave('draft')
                      }
                    : () => {
                        handleNext('draft')
                      }
                }
              >
                Save As Draft
              </Button>
            ) : null}

            <Button
              size='large'
              variant='contained'
              color='secondary'
              onClick={
                activeStep === steps.length - 1
                  ? () => {
                      handleSave()
                    }
                  : () => {
                      handleNext()
                    }
              }
              disabled={activeStep === steps.length - 1 && view}
              startIcon={activeStep === 0 ? <span className='icon-next'></span> : null}
            >
              {activeStep === steps.length - 1 ? `${edit ? 'Update' : 'Submit'}` : 'Next'}
            </Button>
          </Grid>
        </Box>
      </form>
    </Fragment>
  )
}

export default CreateEnquiryType
