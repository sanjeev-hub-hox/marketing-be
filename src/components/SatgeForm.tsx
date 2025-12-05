// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
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
  FormControlLabel
} from '@mui/material'

import { Switch } from '@mui/material'
import { useRouter } from 'next/navigation'

import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Controller, useForm, useFieldArray } from 'react-hook-form'
import style from '../pages/stages/stage.module.css'
import { getRequest, patchRequest, postRequest } from 'src/services/apiService'
import { convertDate } from 'src/utils/helper'
import dayjs from 'dayjs'
import Head from 'next/head'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

// Extend dayjs with the isSameOrAfter plugin
dayjs.extend(isSameOrAfter)

interface StageForm {
  stageId?: any
  edit?: boolean
  view?: boolean
}

interface SubStage {
  name: any
}

interface FormData {
  stageName: string
  startDate: any
  endDate: any
  status: boolean
}

const StageForm = (props: StageForm) => {
  const router = useRouter()
  const { stageId, edit, view } = props
  const [stageName, setStageName] = useState<string>('')
  const [selectedItems1, setSelectedItems1] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const { setPagePaths, setListingMode } = useGlobalContext()
  const [textFields, setTextFields] = useState([{ id: 1, label: 'Sub-Stage/Events' }])
  const maxFields = 5 // Original field + 2 additional fields
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const { setGlobalState } = useGlobalContext()
  const [isDraft, setIsDraft] = useState(false)
  const [draftDialog, setDraftDialog] = useState(false)

  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
    setValue
  } = useForm<FormData>()

  const formDataVal = watch()

  const getData = async () => {
    setGlobalState({
      isLoading: true
    })
    const param = {
      url: `marketing/enquiry-stage/${stageId}`

      //params: { page: 1, size: 1 }
    }
    const response: any = await getRequest(param)

    if (response.status) {
      reset({
        stageName: response.data.name,
        startDate: dayjs(response.data?.start_date),
        endDate: dayjs(response.data?.end_date),
        status: response.data?.status == 'active' ? true : false
      })
      if (response.data.sub_stage) {
        setTextFields(
          response.data.sub_stage.map((val: any, index: any) => {
            return {
              id: index + 1,
              label: `Sub-Stage/Events ${index + 1}`
            }
          })
        )
      }
    }

    setGlobalState({
      isLoading: false
    })
  }

  useEffect(() => {
    if (stageId) {
      getData()
    }
  }, [stageId])

  const CalendarIcon = () => <span className='icon-calendar-1'></span>

  const handleChange1 = (e: any) => {
    setSelectedItems1(e.target.value)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    router.push('/stages')
  }

  const handleClose = () => {
    router.push('/stages')
  }

  const handleDraft = () => {
    setDraftDialog(true)
  }

  const handleDraftClose = () => {
    setDraftDialog(false)
    setListingMode({ isDraft: 1 })
    router.push('/stages')
  }

  const handleSave = async (mode?: boolean) => {
    setGlobalState({
      isLoading: true
    })

    const data = {
      name: formDataVal.stageName,
      start_date: convertDate(formDataVal.startDate),
      end_date: convertDate(formDataVal.endDate),
      saved_as_draft: mode ? true : false
    }
    let response = null
    if (edit) {
      const params = {
        url: `marketing/enquiry-stage/${stageId}`,
        data: data
      }
      response = await patchRequest(params)
    } else {
      const params = {
        url: 'marketing/enquiry-stage/create',
        data: data
      }
      response = await postRequest(params)
    }

    if (response.status) {
      if (mode) {
        setDraftDialog(true)
      } else {
        setOpenDialog(true)
      }
    }
    setGlobalState({
      isLoading: false
    })
  }

  //Handle Dyanamic TextField Here
  const addTextField = () => {
    if (textFields.length < maxFields) {
      const newFieldId = textFields.length + 1
      setTextFields([...textFields, { id: newFieldId, label: `Sub-Stage ${newFieldId}` }])
    }
  }

  // const removeTextField = (id: any, index: number) => {
  //   console.log('INDEX', index)
  //   formDataVal.subStages.splice(index, 1)
  //   reset({
  //     ...formDataVal,
  //     subStages: formDataVal.subStages.map((val: any) => {
  //       return { name: val.name }
  //     })
  //   })
  //   setTextFields(textFields.filter(field => field.id !== id))
  // }

  //Passing Breadcrumbsco

  const getPageTitle = () => {
    const page = {
      title: 'Create Stage',
      path: '/stages/create'
    }
    if (edit) {
      page.title = 'Edit Stage'
      page.path = `/stages/edit/${stageId}`
    } else if (view) {
      page.title = 'View Stage'
      page.path = `/stages/view/${stageId}`
    }

    return page
  }

  useEffect(() => {
    setPagePaths([
      {
        title: 'Stage Listing',
        path: '/stages'
      },
      {
        title: `${getPageTitle().title}`,
        path: `${getPageTitle().path}`
      }
    ])
  }, [])

  const handleSaveAsDraft = () => {
    setIsDraft(true)
    // handleSubmit(handleSave)()
    handleSubmit(data => handleSave(true))()
  }

  const handleSaveFinal = () => {
    setIsDraft(false)
    handleSubmit(data => handleSave(false))()
  }

  console.log(formDataVal, 'MMMMMM')

  return (
    <Fragment>
      <Head>
        <title>{`${getPageTitle().title}`} - CRM</title>
        <meta name='description' content={`This is the ${getPageTitle().title} page`} />
      </Head>
      {/* <Card sx={{ mt: 4, width: '100%' }}> */}
      <form onSubmit={handleSubmit(handleSaveFinal)} noValidate>
        <Box sx={{ background: '#fff', borderRadius: '10px', padding: '20px 10px' }}>
          <Box sx={{ mt: 5 }}>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='stageName'
                  control={control}
                  defaultValue=''
                  rules={{
                    required: 'Stage Name is required',
                    pattern: {
                      value: /^[A-Za-z0-9-_ ]+$/,
                      message: 'Stage Name can only contain alphanumeric characters, spaces, hyphens, and underscores'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      disabled={view}
                      fullWidth
                      label='Stage Name'
                      placeholder='Stage Name'
                      error={!!errors.stageName}
                      helperText={errors.stageName ? errors.stageName.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name='startDate'
                    control={control}
                    rules={{ required: 'Start Date is required' }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        disabled={view}
                        minDate={dayjs()}
                        label='Start Date'
                        format='DD/MM/YYYY'
                        sx={{ width: '100%' }}
                        slots={{ openPickerIcon: CalendarIcon }}
                      />
                    )}
                  />
                </LocalizationProvider>
                <FormControl>
                  {errors?.startDate?.message && (
                    <span className={style.errorField}>{`${errors?.startDate?.message}`}</span>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name='endDate'
                    control={control}
                    rules={{
                      required: 'End Date is required',
                      validate: value =>
                        value &&
                        dayjs(value).isSameOrAfter(formDataVal.startDate, 'day') &&
                        dayjs(value).isSameOrAfter(dayjs(), 'day')
                          ? true
                          : 'End Date must be the same or after Start Date and cannot be in the past'
                    }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        disabled={view}
                        label='End Date'
                        minDate={dayjs()}
                        format='DD/MM/YYYY'
                        sx={{ width: '100%' }}
                        slots={{ openPickerIcon: CalendarIcon }}
                      />
                    )}
                  />
                </LocalizationProvider>
                {errors?.endDate && <span className={style.errorField}>{`${errors?.endDate?.message}`}</span>}
              </Grid>
              {/* <Grid item xs={12} sm={6}>
                <Controller
                  name='status'
                  control={control}
                  defaultValue={true}
                  render={({ field }) => (
                    <>
                      <div className='toggle-select'>
                        <span className='toggle-status'>{field.value ? 'Active' : 'Inactive'}</span>
                        <Switch
                          defaultChecked
                          {...field}
                          disabled={view}
                          checked={field.value}
                          onChange={e => field.onChange(e.target.checked)}
                        />
                      </div>
                    </>
                  )}
                />
              </Grid> */}
            </Grid>
          </Box>

          <SuccessDialog
            title={`Stage ${edit ? 'Updated' : 'Created'} Successfully!`}
            openDialog={openDialog}
            handleClose={handleCloseDialog}
          />

          {draftDialog && (
            <SuccessDialog title='Draft Saved Successfully!' openDialog={draftDialog} handleClose={handleDraftClose} />
          )}

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size='large'
              variant={view ? 'contained' : 'outlined'}
              color={view ? 'secondary' : 'inherit'}
              sx={{ mr: 2 }}
              onClick={handleClose}
            >
              {view ? 'Close' : 'Cancel'}
            </Button>

            {!view && !edit ? (
              <Button disabled={view} size='large' variant='contained' color='inherit' onClick={handleSaveAsDraft}>
                Save As Draft
              </Button>
            ) : null}

            {!view ? (
              <Button disabled={view} type='submit' size='large' variant='contained' color='secondary'>
                {edit ? 'Update' : 'Create'}
              </Button>
            ) : null}
          </Grid>
        </Box>
      </form>
    </Fragment>
  )
}

export default StageForm
