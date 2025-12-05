// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { FormControl, InputLabel, Select, MenuItem, Divider, Tooltip, IconButton, Checkbox } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import SkipNextIcon from '@mui/icons-material/SkipNext'

import { Autocomplete, Chip, Switch } from '@mui/material'

// ** Data
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import UserIcon from 'src/layouts/components/UserIcon'
import TreeViewCheckbox from './TreeViewCheckbox'
import SuccessDialog from './Dialog/SuccessDialog'
import { useRouter } from 'next/navigation'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { color, fontSize, fontWeight, lineHeight, padding } from '@mui/system'

// type CreateRoleType = {
//   handleRoleDialog: (a: boolean) => void
// }

//Customized Tooltip

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.customColors.primaryLightest,
    color: theme.palette.customColors.mainText
  }
}))

type Autocomplete = {
  title: string
}

export const Auto1: Autocomplete[] = [
  { title: ' value 1' },
  { title: ' value 2' },
  { title: ' value 3' },
  { title: ' value 4' }
]

// Define a styled FormControl component

const steps = ['Create Role', 'Assign Rights']

const CreateNewRole = () => {
  const columns: GridColDef[] = [
    {
      flex: 1,
      minWidth: 200,
      field: 'uniqueRole',
      headerName: 'HRIS Unique Role'
    },
    {
      flex: 1,
      minWidth: 230,
      field: 'uniqueRoleCode',
      headerName: 'HRIS Unique Role Code',
      headerAlign: 'center',
      align: 'center'
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'board',
      headerName: 'Board'
    },
    {
      flex: 1,
      field: 'section',
      minWidth: 150,
      headerName: 'Section'
    },
    {
      flex: 1,
      field: 'department',
      minWidth: 150,
      headerName: 'Department'
    },
    {
      flex: 1,
      field: 'subDepartment',
      minWidth: 150,
      headerName: 'Sub Department'
    },
    {
      flex: 1,
      field: 'subSubDepartment',
      minWidth: 150,
      headerName: 'Sub Sub Department'
    },
    {
      flex: 0.1,
      field: 'hrRole',
      minWidth: 150,
      headerName: 'HR Role'
    }
  ]

  const rows = [
    {
      id: 1,
      uniqueRole: 'CBSE Primary Primary NA NA Co-ordinator',
      uniqueRoleCode: '23667548YT44',
      board: 'ICSE',
      section: 'Primary',
      department: 'Academics',
      subDepartment: 'NA',
      subSubDepartment: 'NA',
      hrRole: 'Teacher'
    },
    {
      id: 2,
      uniqueRole: 'CBSE Primary Primary NA NA Co-ordinator',
      uniqueRoleCode: '23667548YT44',
      board: 'CBSE',
      section: 'Primary',
      department: 'Academics',
      subDepartment: 'NA',
      subSubDepartment: 'NA',
      hrRole: 'Co Ordinator'
    },
    {
      id: 3,
      uniqueRole: 'CBSE Primary Primary NA NA Co-ordinator',
      uniqueRoleCode: '23667548YT44',
      board: 'CBSE',
      section: 'Primary',
      department: 'Academics',
      subDepartment: 'NA',
      subSubDepartment: 'NA',
      hrRole: 'Co Ordinator'
    },
    {
      id: 4,
      uniqueRole: 'CBSE Primary Primary NA NA Co-ordinator',
      uniqueRoleCode: '23667548YT44',
      board: 'CBSE',
      section: 'Primary',
      department: 'Academics',
      subDepartment: 'NA',
      subSubDepartment: 'NA',
      hrRole: 'Co Ordinator'
    },
    {
      id: 5,
      uniqueRole: 'CBSE Primary Primary NA NA Co-ordinator',
      uniqueRoleCode: '23667548YT44',
      board: 'CBSE',
      section: 'Primary',
      department: 'Academics',
      subDepartment: 'NA',
      subSubDepartment: 'NA',
      hrRole: 'Co Ordinator'
    }
  ]

  // ** States
  const [erpRoleName, setErpRoleName] = useState<string>('Sample Text')
  const [activeStep, setActiveStep] = useState<number>(0)
  const [selectedItems1, setSelectedItems1] = useState<string[]>([])
  const [selectedItems2, setSelectedItems2] = useState([])
  const [selectedItems3, setSelectedItems3] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [infoDialog, setInfoDialog] = useState(false)
  const [draftDialog, setDraftDialog] = useState(false)
  const router = useRouter()
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
  const handleDelete = (itemToDelete: string) => () => {
    setSelectedItems1(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems2(selectedItems => selectedItems.filter(item => item !== itemToDelete))
    setSelectedItems3(selectedItems => selectedItems.filter(item => item !== itemToDelete))
  }

  //Handler for dialog box
  const handleCloseDialog = () => {
    setOpenDialog(false)
    router.push('/permanent-role')

    // handleRoleDialog(false)
  }

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }
  const handleClose = () => {
    // handleRoleDialog(false)
    router.push('/permanent-role')
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
        title: 'Permanant Role',
        path: '/permanent-role'
      },
      {
        title: 'Create New Permanant Role',
        path: '/permanent-role/create-role'
      }
    ])
  }, [])

  //Draft Dialog handle Here

  const handleDraft = () => {
    setDraftDialog(true)
  }
  const handleDraftClose = () => {
    setDraftDialog(false)
    router.push('/permanent-role')
  }

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
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>
                    {
                      <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                        Applications
                        {infoDialog && (
                          <span>
                            <Tooltip title='Applications'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Applications'
                    defaultValue=''
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                  >
                    <MenuItem value=''>
                      <em>Select</em>
                    </MenuItem>
                    <MenuItem value='School ERP'>School ERP</MenuItem>
                    <MenuItem value='Oracle'>Oracle</MenuItem>
                    <MenuItem value='LMS'>LMS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                      ERP Role Name{' '}
                      {infoDialog && (
                        <span>
                          <Tooltip title='ERP Role Name'>
                            <InfoIcon />
                          </Tooltip>
                        </span>
                      )}
                    </Box>
                  }
                  value={erpRoleName}
                  placeholder='ERP Role Name'
                  onChange={e => setErpRoleName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  id='autocomplete-multiple-filled'
                  defaultValue={[Auto1[1].title]}
                  options={Auto1.map(option => option.title)}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox checked={selected} />
                      {option}
                    </li>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Select HRIS Unique Role
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select HRIS Unique Role'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                      placeholder='Select HRIS Unique Role'
                    />
                  )}
                  renderTags={(value: string[], getTagProps) => {
                    const displayItems = value.length > 2 ? value.slice(0, 2) : value
                    const moreItems = value.length > 2 ? value.slice(2) : []

                    return (
                      <div>
                        {displayItems.map((option: string, index: number) => (
                          <Chip
                            color='default'
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            variant='filled'
                            label={option}
                            {...getTagProps({ index })}
                            key={index}
                          />
                        ))}
                        {moreItems.length > 0 && (
                          <HtmlTooltip title={<span style={{ whiteSpace: 'pre-line' }}>{moreItems.join('\n')}</span>}>
                            <span> +{moreItems.length} </span>
                          </HtmlTooltip>
                        )}
                      </div>
                    )
                  }}
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
                        School Categories
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
                    label='School Categories'
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    multiple
                    value={selectedItems1}
                    onChange={handleChange1}
                    renderValue={selected => {
                      const displayItems = selected.length > 2 ? selected.slice(0, 2) : selected
                      const moreItems = selected.length > 2 ? selected.slice(2) : []

                      return (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            overflowY: 'auto'
                          }}
                          className='scroller-hide'
                        >
                          {displayItems.map(value => (
                            <Chip
                              color='default'
                              variant='filled'
                              key={value}
                              label={value}
                              onDelete={handleDelete(value)}
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              style={{ margin: 2 }}
                            />
                          ))}
                          {moreItems.length > 0 && (
                            <HtmlTooltip title={<span style={{ whiteSpace: 'pre-line' }}>{moreItems.join('\n')}</span>}>
                              <Typography
                                variant='subtitle2'
                                sx={{ lineHeight: '21px', display: 'flex', alignItems: 'center', margin: 2 }}
                                color={'customColors.mainText'}
                              >
                                {' '}
                                +{moreItems.length}
                              </Typography>
                            </HtmlTooltip>
                          )}
                        </div>
                      )
                    }}
                  >
                    {/* <MenuItem value='500'>
                      <Checkbox /> 500
                    </MenuItem>
                    <MenuItem value='500-1000'>
                      <Checkbox /> 500-1000
                    </MenuItem>
                    <MenuItem value='1000-1500'>
                      
                      <Checkbox /> 1000-1500
                    </MenuItem>
                    <MenuItem value='2000'>
                      
                      <Checkbox /> 2000
                    </MenuItem> */}
                    {['500', '500-1000', '1000-1500', '2000'].map(value => (
                      <MenuItem key={value} value={value}>
                        <Checkbox checked={selectedItems1.indexOf(value) > -1} />
                        {value}
                      </MenuItem>
                    ))}
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
                <DataGrid autoHeight columns={columns} rows={rows} hideFooterPagination sx={{ boxShadow: 'none' }} />
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
                        Business Vertical (LOB Segment2 Parent 2)
                        {infoDialog && (
                          <span>
                            <Tooltip title='Business Vertical (LOB segment2 parent 2)'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Business Vertical (LOB Segment2 Parent 2)'
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
                            color='default'
                            variant='filled'
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
                            color='default'
                            variant='filled'
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
                <Autocomplete
                  multiple
                  id='autocomplete-multiple-filled'
                  defaultValue={[Auto1[1].title]}
                  options={Auto1.map(option => option.title)}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'normal' }}>
                          Business sub sub vertical(LOB Segment2 Child)
                          {infoDialog && (
                            <span>
                              <Tooltip title=' Business sub sub vertical(LOB Segment2 Child)'>
                                <InfoIcon />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                      placeholder='Select HRIS Unique Role'
                    />
                  )}
                  renderTags={(value: string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip
                        color='default'
                        variant='filled'
                        deleteIcon={<span className='icon-trailing-icon'></span>}
                        label={option}
                        {...(getTagProps({ index }) as {})}
                        key={index}
                      />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant='body2' sx={{ color: 'primary.dark', textTransform: 'capitalize' }}>
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
                        ERP Role Name
                        {infoDialog && (
                          <span>
                            <Tooltip title='ERP Role Name'>
                              <InfoIcon />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                    value={erpRoleName}
                    placeholder='ERP Role Name'
                    onChange={e => setErpRoleName(e.target.value)}
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
          title='Roles & Rights Created Successfully!'
          openDialog={openDialog}
          handleClose={handleCloseDialog}
        />
        {draftDialog && (
          <SuccessDialog title='Draft Saved Successfully!' openDialog={draftDialog} handleClose={handleDraftClose} />
        )}
        <Box sx={{ mt: 5, mb: 5 }}>
          <Divider />
        </Box>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant='outlined'
            color='inherit'
            sx={{ mr: 2 }}
            onClick={() => (activeStep === 0 ? handleClose() : handleBack())}
          >
            {activeStep === 0 ? 'Cancel' : 'Go Back'}
          </Button>
          <Button variant='contained' color='inherit' sx={{ mr: 2 }} onClick={handleDraft}>
            Save As Draft
          </Button>
          <Button
            variant='contained'
            color='secondary'
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            startIcon={activeStep === 0 ? <span className='icon-next'></span> : null}
          >
            {activeStep === 0 ? 'Next' : 'Submit'}
          </Button>
        </Grid>
      </Box>
    </Fragment>
  )
}

export default CreateNewRole
