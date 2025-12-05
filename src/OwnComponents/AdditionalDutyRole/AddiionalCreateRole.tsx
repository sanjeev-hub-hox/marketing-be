// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { FormControl, InputLabel, Select, MenuItem, Divider, Tooltip, IconButton } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import { Autocomplete, Chip, Switch } from '@mui/material'
import { styled } from '@mui/material/styles'
import UserIcon from 'src/layouts/components/UserIcon'
import TreeViewCheckbox from '../ManageRequest/TreeViewCheckbox'
import SuccessDialog from '../ManageRequest/Dialog/SuccessDialog'
import { useRouter } from 'next/navigation'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

// type AddiionalCreateRoleType = {
//   handleRoleDialog: (a: boolean) => void
// }
type Autocomplete = {
  title: string
}

export const Auto1: Autocomplete[] = [
  { title: 'CBSE Primary NA NA Coordinator' },
  { title: 'CBSE Primary NA NA Coordinator' },
  { title: 'CBSE Primary NA NA Coordinator' },
  { title: 'CBSE Primary NA NA Coordinator' }
]

const steps = ['Create Duty', 'Assign Rights']

const AddiionalCreateRole = () => {
  const router = useRouter()

  // ** States
  const [dutyRoleName, setDutyRoleName] = useState<string>('Teaching Faculty')
  const [activeStep, setActiveStep] = useState<number>(0)
  const [selectedItems1, setSelectedItems1] = useState([])
  const [selectedItems2, setSelectedItems2] = useState([])
  const [selectedItems3, setSelectedItems3] = useState([])
  const [selectedItems4, setSelectedItems4] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [infoDialog, setInfoDialog] = useState(false)
  const { setPagePaths } = useGlobalContext()

  //Handler for multi select option
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
  const handleDelete = (itemToDelete: string) => () => {
    setSelectedItems1(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems2(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems3(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems4(selectedItems => selectedItems.filter(item => item !== itemToDelete))
  }

  //Handler for dialog box
  const handleCloseDialog = () => {
    setOpenDialog(false)
    router.push('/additional-duty-role-listing')

    // handleRoleDialog(false)
  }

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }
  const handleClose = () => {
    // handleRoleDialog(false)
    router.push('/additional-duty-role-listing')
  }
  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }
  const handleSubmit = () => {
    if (activeStep === steps.length - 1) {
      setOpenDialog(true)
    }
  }

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Additional Duty',
        path: '/additional-duty-role-listing'
      },
      {
        title: 'Create New Additional Duty',
        path: '/additional-duty-role-listing/create-new-additional-duty-role'
      }
    ])
  }, [])

  return (
    <Fragment>
      {/* <Card sx={{ mt: 4, width: '100%' }}> */}
      <Box sx={{ background: '#fff', borderRadius: '10px', padding: '20px 10px' }}>
        <Box sx={{ width: '100%', mt: 5, display: 'flex', justifyContent: 'space-around', alignItems: 'start' }}>
          <Box sx={{ width: '95%' }}>
            <Stepper activeStep={activeStep}>
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
                <TextField
                  fullWidth
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      Additional Duty Name
                      {infoDialog && (
                        <span>
                          <Tooltip title='Additional Duty  Name'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                  value={dutyRoleName}
                  placeholder='Additional Duty Role Name'
                  onChange={e => setDutyRoleName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth

                  // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                >
                  <InputLabel
                    style={{
                      marginTop: '0px'
                    }}
                    id='demo-mutiple-chip-label'
                  >
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        School Categories{' '}
                        {infoDialog && (
                          <span>
                            <Tooltip title='School Categories'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    label='School Categories'
                    multiple
                    value={selectedItems1}
                    onChange={handleChange1}
                    renderValue={selected => (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          overflowY: 'auto'
                        }}
                        className='scroller-hide'
                      >
                        {selected.map(value => (
                          <Chip
                            variant='filled'
                            color='default'
                            key={value}
                            label={value}
                            onDelete={handleDelete(value)}
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            style={{ margin: 2 }}
                          />
                        ))}
                      </div>
                    )}
                  >
                    <MenuItem value='500'>500</MenuItem>
                    <MenuItem value='500-1000'>500-1000</MenuItem>
                    <MenuItem value='1000-1500'>1000-1500</MenuItem>
                    <MenuItem value='2000'>2000</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth

                  // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                >
                  <InputLabel
                    style={{
                      marginTop: '0px'
                    }}
                    id='demo-mutiple-chip-label'
                  >
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Business Vertical (LOB segment2 parent 2)
                        {infoDialog && (
                          <span>
                            <Tooltip title=' Business Vertical (LOB segment2 parent 2)'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Business Vertical (LOB segment2 parent 2)'
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    multiple
                    value={selectedItems2}
                    onChange={handleChange2}
                    renderValue={selected => (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',

                          overflowY: 'auto'
                        }}
                        className='scroller-hide'
                      >
                        {selected.map(value => (
                          <Chip
                            variant='filled'
                            color='default'
                            key={value}
                            label={value}
                            onDelete={handleDelete(value)}
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            style={{ margin: 2 }}
                          />
                        ))}
                      </div>
                    )}
                  >
                    <MenuItem value='9901'>9901</MenuItem>
                    <MenuItem value='9902'>9902</MenuItem>
                    <MenuItem value='9903'>9903</MenuItem>
                    <MenuItem value='>9904'>9904</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth

                  // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                >
                  <InputLabel
                    style={{
                      marginTop: '0px'
                    }}
                    id='demo-mutiple-chip-label'
                  >
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Business Sub Vertical (LOB Segment2 Parent1)
                        {infoDialog && (
                          <span>
                            <Tooltip title='Business Sub Vertical (LOB Segment2 Parent1)'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Business Sub Vertical (LOB Segment2 Parent1)'
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    multiple
                    value={selectedItems3}
                    onChange={handleChange3}
                    renderValue={selected => (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',

                          overflowY: 'auto'
                        }}
                        className='scroller-hide'
                      >
                        {selected.map(value => (
                          <Chip
                            variant='filled'
                            color='default'
                            key={value}
                            label={value}
                            onDelete={handleDelete(value)}
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            style={{ margin: 2 }}
                          />
                        ))}
                      </div>
                    )}
                  >
                    <MenuItem value='2300'>2300</MenuItem>
                    <MenuItem value='2301'>2301</MenuItem>
                    <MenuItem value='2302'>2302</MenuItem>
                    <MenuItem value='2303'>2303</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth

                  // hasValue={selectedItems.length > 0} // Pass whether there is a value to the styled FormControl
                >
                  <InputLabel
                    style={{
                      marginTop: '0px'
                    }}
                    id='demo-mutiple-chip-label'
                  >
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Business Sub Sub Vertical(LOB Segment2 Child)
                        {infoDialog && (
                          <span>
                            <Tooltip title='Business Sub Sub Vertical(LOB Segment2 Child)'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Business Sub Sub Vertical(LOB Segment2 Child)'
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    multiple
                    value={selectedItems4}
                    onChange={handleChange4}
                    renderValue={selected => (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',

                          overflowY: 'auto'
                        }}
                        className='scroller-hide'
                      >
                        {selected.map(value => (
                          <Chip
                            variant='filled'
                            color='default'
                            key={value}
                            label={value}
                            onDelete={handleDelete(value)}
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            style={{ margin: 2 }}
                          />
                        ))}
                      </div>
                    )}
                  >
                    <MenuItem value='2300'>2001</MenuItem>
                    <MenuItem value='2301'>2002</MenuItem>
                    <MenuItem value='2302'>2003</MenuItem>
                    <MenuItem value='2303'>2004</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className='toggle-select'>
                  <span className='toggle-status'>Active</span>
                  <Switch defaultChecked />
                </div>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant='body2' sx={{ color: 'primary.main' }}>
                  LOBs will appear based on the selected school category
                  <br />
                  If School Category is marked as NA then LOB selection will be allowed and
                  <br />
                  if school category is value then LOB will be preselected as per the selected category.
                </Typography>
              </Grid>
            </Grid>
          )}
          {activeStep === 1 && (
            <>
              <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Additional Duty Name
                        {infoDialog && (
                          <span>
                            <Tooltip title='Additional Duty Name'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                    value={dutyRoleName}
                    placeholder='Additional Duty Role Name'
                    onChange={e => setDutyRoleName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={5} sx={{ marginLeft: '50px' }}>
                  <div className='toggle-select'>
                    <span className='toggle-status'>Active</span>
                    <Switch defaultChecked />
                  </div>
                </Grid>
              </Grid>

              <Divider sx={{ mt: 6 }} />

              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography
                  variant='body1'
                  sx={{
                    fontWeight: 500,
                    lineHeight: '27px',
                    mb: 3
                  }}
                >
                  Set Rights
                </Typography>
                <TreeViewCheckbox />
              </Box>
            </>
          )}
        </Box>
        <SuccessDialog
          title='Role & Rights Created Successfully'
          openDialog={openDialog}
          handleClose={handleCloseDialog}
        />
        <Box sx={{ mt: 5, mb: 5 }}>
          <Divider />
        </Box>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size='large'
            variant='outlined'
            color='inherit'
            sx={{ mr: 2 }}
            onClick={() => (activeStep === 0 ? handleClose() : handleBack())}
          >
            {activeStep === 0 ? 'Cancel' : 'Go Back'}
          </Button>
          <Button size='large' variant='contained' color='inherit' sx={{ mr: 2 }} onClick={handleBack}>
            Save As Draft
          </Button>
          <Button
            size='large'
            variant='contained'
            color='secondary'
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            startIcon={activeStep === 0 ? <span className='icon-next'></span> : null}
          >
            {activeStep === 0 ? ' Next' : 'Submit'}
          </Button>
        </Grid>
      </Box>
    </Fragment>
  )
}

export default AddiionalCreateRole
