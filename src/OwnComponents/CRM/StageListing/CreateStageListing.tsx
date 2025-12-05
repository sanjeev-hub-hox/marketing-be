// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { FormControl, InputLabel, Select, MenuItem, Divider, Tooltip, IconButton } from '@mui/material'

import { Switch } from '@mui/material'
import { useRouter } from 'next/navigation'

import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

// import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

const CreateStageListing = () => {
  const router = useRouter()

  // ** States
  const [stageName, setStageName] = useState<string>('Enquiry')
  const [selectedItems1, setSelectedItems1] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const { setPagePaths } = useGlobalContext()
  const [textFields, setTextFields] = useState([{ id: 1, label: 'Sub-Stage/Events' }])
  const maxFields = 5 // Original field + 2 additional fields

  //Down Arrow
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  //Calender Icon goes from here
  const CalendarIcon = () => <span className='icon-calendar-1'></span>

  //Handler for multi select option
  const handleChange1 = (e: any) => {
    setSelectedItems1(e.target.value)
  }

  //Handler for dialog box
  const handleCloseDialog = () => {
    setOpenDialog(false)
    router.push('/stage-listing')

    // handleRoleDialog(false)
  }

  //Handle Cancel Button

  const handleClose = () => {
    // handleRoleDialog(false)
    router.push('/stage-listing')
  }

  //Handle Submit button

  const handleSubmit = () => {
    setOpenDialog(true)
  }

  //Handle Dyanamic TextField Here
  const addTextField = () => {
    if (textFields.length < maxFields) {
      const newFieldId = textFields.length + 1
      setTextFields([...textFields, { id: newFieldId, label: `Sub-Stage ${newFieldId}` }])
    }
  }

  const removeTextField = (id: any) => {
    setTextFields(textFields.filter(field => field.id !== id))
  }

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Stage Listing',
        path: '/stage-listing'
      },
      {
        title: 'Create Stage',
        path: '/stage-listing/create-stage'
      }
    ])
  }, [])

  return (
    <Fragment>
      {/* <Card sx={{ mt: 4, width: '100%' }}> */}
      <Box sx={{ background: '#fff', borderRadius: '10px', padding: '20px 10px' }}>
        <Box sx={{ mt: 5 }}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Stage Name'
                value={stageName}
                placeholder='Stage Name'
                onChange={e => setStageName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel
                  style={{
                    marginTop: '0px'
                  }}
                  id='demo-mutiple-chip-label'
                >
                  Stage Color
                </InputLabel>
                <Select
                  labelId='demo-mutiple-chip-label'
                  id='demo-mutiple-chip'
                  IconComponent={DownArrow}
                  label='Stage Color'
                  value={selectedItems1}
                  onChange={handleChange1}
                >
                  <MenuItem value='#101010'>#101010</MenuItem>
                  <MenuItem value='#111111'>#111111</MenuItem>
                  <MenuItem value='#121212'>#121212</MenuItem>
                  <MenuItem value='#131313'>#131313</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  slots={{
                    openPickerIcon: CalendarIcon
                  }}
                  format='DD/MM/YYYY'
                  label='Start Date'
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: '100%' }}
                  slots={{
                    openPickerIcon: CalendarIcon
                  }}
                  format='DD/MM/YYYY'
                  label=' End Date'
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className='toggle-select'>
                <span className='toggle-status'>Active</span>
                <Switch defaultChecked />
              </div>
            </Grid>
          </Grid>
          <Grid container spacing={5} sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
            {textFields.map((field, index) => (
              <>
                <Grid key={field.id} item xs={12} md={6}>
                  <Box>
                    <TextField fullWidth label={field.label} variant='outlined' sx={{ mr: 2 }} />
                  </Box>
                </Grid>
                <Grid item>
                  <IconButton
                    disabled={textFields.length >= maxFields && index === textFields.length - 1}
                    color='default'
                    onClick={addTextField}
                  >
                    <span className='icon-add-circle'></span>
                  </IconButton>

                  {field.id !== 1 && (
                    <IconButton color='default' onClick={() => removeTextField(field.id)}>
                      <span className='icon-close-circle'></span>
                    </IconButton>
                  )}
                </Grid>
              </>
            ))}
          </Grid>
        </Box>

        <SuccessDialog title='Stage Created Successfully!' openDialog={openDialog} handleClose={handleCloseDialog} />

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button size='large' variant='outlined' color='inherit' sx={{ mr: 2 }} onClick={handleClose}>
            Cancel
          </Button>

          <Button size='large' variant='contained' color='secondary' onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Box>
    </Fragment>
  )
}

export default CreateStageListing
