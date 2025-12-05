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
  Radio
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
import MuiTable from './MuiTable'

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

export const Auto1: Autocomplete[] = [
  { title: 'Student Info' },
  { title: 'Parent Info' },
  { title: 'Enquiry Form 1' },
  { title: 'Enquiry Form 2' },
  { title: 'Enquiry Form 3' },
  { title: 'Enquiry Form 4' },
  { title: 'Enquiry Form 5' }
]

const steps = ['Create Enquiry Type', 'Map With Stage']

const CreateEnquiryType = () => {
  const router = useRouter()

  // ** States
  const [enquiryTypeName, setEnquiryTypeName] = useState<string>('New Admission')
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
  const { setPagePaths } = useGlobalContext()

  //Down Arrow
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  //Handler for multiple selection
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
    router.push('/enquiry-type-listing')

    // handleRoleDialog(false)
  }

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }
  const handleClose = () => {
    // handleRoleDialog(false)
    router.push('/enquiry-type-listing')
  }
  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }
  const handleSubmit = () => {
    if (activeStep === steps.length - 1) {
      setOpenDialog(true)
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

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Enquiry Type Listing',
        path: '/enquiry-type-listing'
      },
      {
        title: 'Create Enquiry Type',
        path: '/enquiry-type-listing/create-enquiry-type'
      }
    ])
  }, [])

  //Rows and columns for datagrid

  type ParamsType = Record<string, any>

  // const handleSelectChange = (e: any, params: ParamsType) => {
  //   const { value } = e.target
  //   const { id } = params.row
  //   console.log(value, 'Value Enquiry Type Listing')
  //   console.log(id, 'Id Enquiry Type Listing')
  //   setRows(prevRows => prevRows.map(row => (row.id === id ? { ...row, [params.field]: value } : row)))
  // }

  // const [rows, setRows] = useState([
  //   {
  //     id: 1,
  //     stagesApplicable: 'S1',
  //     isMandatory: 'Yes',
  //     orderOfStage: 'One',
  //     weightage: '20%',
  //     tatInHrDay: { tat: 3, type: 'Hr' },
  //     initiateWorkflow: 'workflow1'
  //   },
  //   {
  //     id: 2,
  //     stagesApplicable: 'S2',
  //     isMandatory: 'No',
  //     orderOfStage: 'One',
  //     weightage: '10%',
  //     tatInHrDay: { tat: 3, type: 'Hr' },
  //     initiateWorkflow: 'workflow1'
  //   },
  //   {
  //     id: 3,
  //     stagesApplicable: 'S3',
  //     isMandatory: 'Yes',
  //     orderOfStage: 'One',
  //     weightage: '50%',
  //     tatInHrDay: { tat: 3, type: 'Hr' },
  //     initiateWorkflow: 'workflow1'
  //   },
  //   {
  //     id: 4,
  //     stagesApplicable: 'S4',
  //     isMandatory: 'Yes',
  //     orderOfStage: 'One',
  //     weightage: '10%',
  //     tatInHrDay: { tat: 3, type: 'Hr' },
  //     initiateWorkflow: 'workflow1'
  //   },
  //   {
  //     id: 5,
  //     stagesApplicable: 'S5',
  //     isMandatory: 'Yes',
  //     orderOfStage: 'One',
  //     weightage: '5%',
  //     tatInHrDay: { tat: 3, type: 'Hr' },
  //     initiateWorkflow: 'workflow1'
  //   },
  //   {
  //     id: 6,
  //     stagesApplicable: 'S6',
  //     isMandatory: 'Yes',
  //     orderOfStage: 'One',
  //     weightage: '5%',
  //     tatInHrDay: { tat: 3, type: 'Hr' },
  //     initiateWorkflow: 'workflow1'
  //   }
  // ])

  // const columns: GridColDef[] = [
  //   {
  //     field: 'stagesApplicable',
  //     headerName: 'Stages Applicable',
  //     align: 'left',
  //     headerAlign: 'left',
  //     minWidth: 80,
  //     flex: 1
  //   },
  //   {
  //     field: 'isMandatory',
  //     headerName: 'Is Mandatory',
  //     align: 'left',
  //     headerAlign: 'left',
  //     minWidth: 114,
  //     flex: 1,
  //     renderCell: params => {
  //       console.log(params)

  //       return (
  //         <FormControl fullWidth sx={{ height: '35px', fontSize: '14px' }} size='small'>
  //           <Select
  //             labelId='demo-simple-select-label'
  //             id='demo-simple-select'
  //             value={params.row.isMandatory}
  //             sx={{
  //               height: '36px',
  //               fontSize: '14px',
  //               fontWeight: '400'
  //             }}
  //             onChange={e => handleSelectChange(e, params)}
  //           >
  //             <MenuItem value='Yes'>Yes</MenuItem>
  //             <MenuItem value='No'>No</MenuItem>
  //           </Select>
  //         </FormControl>
  //       )
  //     }
  //   },
  //   {
  //     field: 'orderOfStage',
  //     headerName: 'Order Of Stage',
  //     align: 'left',
  //     headerAlign: 'left',
  //     minWidth: 145,
  //     flex: 1,
  //     renderCell: params => {
  //       return (
  //         <FormControl fullWidth sx={{ height: '35px', fontSize: '14px' }} size='small'>
  //           <Select
  //             labelId='demo-simple-select-label'
  //             id='demo-simple-select'
  //             value={params.row.orderOfStage}
  //             sx={{
  //               height: '36px',
  //               fontSize: '14px',
  //               fontWeight: '400'
  //             }}
  //             onChange={e => handleSelectChange(e, params)}
  //           >
  //             <MenuItem value='1'>1</MenuItem>
  //             <MenuItem value='2'>2</MenuItem>
  //             <MenuItem value='3'>3</MenuItem>
  //             <MenuItem value='4'>4</MenuItem>
  //             <MenuItem value='5'>5</MenuItem>
  //           </Select>
  //         </FormControl>
  //       )
  //     }
  //   },
  //   {
  //     field: 'weightage',
  //     headerName: 'Weightage',
  //     align: 'left',
  //     headerAlign: 'left',
  //     minWidth: 112,
  //     flex: 1,
  //     renderCell: params => {
  //       return (
  //         <FormControl fullWidth sx={{ height: '35px', fontSize: '14px' }} size='small'>
  //           <Select
  //             labelId='demo-simple-select-label'
  //             id='demo-simple-select'
  //             value={params.row.weightage}
  //             sx={{
  //               height: '36px',
  //               fontSize: '14px',
  //               fontWeight: '400'
  //             }}
  //             onChange={e => handleSelectChange(e, params)}
  //           >
  //             <MenuItem value='5%'>5%</MenuItem>
  //             <MenuItem value='10%'>10%</MenuItem>
  //             <MenuItem value='15%'>15%</MenuItem>
  //             <MenuItem value='20%'>20%</MenuItem>
  //             <MenuItem value='25%'>25%</MenuItem>
  //             <MenuItem value='30%'>30%</MenuItem>
  //             <MenuItem value='35%'>35%</MenuItem>
  //             <MenuItem value='40%'>40%</MenuItem>
  //             <MenuItem value='45%'>45%</MenuItem>
  //             <MenuItem value='50%'>50%</MenuItem>
  //             <MenuItem value='55%'>55%</MenuItem>
  //             <MenuItem value='60%'>60%</MenuItem>
  //             <MenuItem value='65%'>65%</MenuItem>
  //             <MenuItem value='70%'>70%</MenuItem>
  //             <MenuItem value='75%'>75%</MenuItem>
  //             <MenuItem value='80%'>80%</MenuItem>
  //             <MenuItem value='85%'>85%</MenuItem>
  //             <MenuItem value='90%'>90%</MenuItem>
  //             <MenuItem value='95%'>95%</MenuItem>
  //             <MenuItem value='100%'>100%</MenuItem>
  //           </Select>
  //         </FormControl>
  //       )
  //     }
  //   },
  //   {
  //     field: 'tatInHrDay',
  //     headerName: 'TAT in Hr/Day',
  //     align: 'left',
  //     headerAlign: 'left',
  //     minWidth: 200,
  //     flex: 1,
  //     renderCell: params => {
  //       console.log(params.row.tatInHrDay)

  //       return (
  //         <>
  //           <Grid container spacing={2}>
  //             <Grid item xs={7}>
  //               <TextField
  //                 name='tat'
  //                 onChange={e => handleSelectChange(e, params)}
  //                 size='small'
  //                 type='text'
  //                 value={params.row.tatInHrDay?.tat}
  //                 InputProps={{
  //                   style: {
  //                     fontSize: '14px',
  //                     padding: '6px 10px',
  //                     margin: '0',
  //                     height: '36px'
  //                   }
  //                 }}
  //                 style={{ height: '36px', padding: 0 }}
  //               />
  //             </Grid>
  //             <Grid item xs={5}>
  //               <FormControl
  //                 fullWidth
  //                 size='small'
  //                 sx={{
  //                   height: '36px',
  //                   fontSize: '14px'
  //                 }}
  //               >
  //                 <Select
  //                   labelId='demo-simple-select-label'
  //                   id='demo-simple-select'
  //                   value={params.row.tatInHrDay?.type}
  //                   sx={{
  //                     height: '36px',
  //                     fontSize: '14px',
  //                     fontWeight: '400'
  //                   }}
  //                   onChange={e => handleSelectChange(e, params)}
  //                 >
  //                   <MenuItem value='Hr'>Hr</MenuItem>
  //                   <MenuItem value='Day'>Day</MenuItem>
  //                 </Select>
  //               </FormControl>
  //             </Grid>
  //           </Grid>
  //         </>
  //       )
  //     }
  //   },
  //   {
  //     field: 'initiateWorkflow',
  //     headerName: 'Initiate Workflow',
  //     align: 'left',
  //     headerAlign: 'left',
  //     minWidth: 114,
  //     flex: 1,
  //     renderCell: params => {
  //       return (
  //         <FormControl fullWidth sx={{ height: '36px', fontSize: '14px' }} size='small'>
  //           <Select
  //             labelId='demo-simple-select-label'
  //             id='demo-simple-select'
  //             value={params.row.initiateWorkflow}
  //             sx={{
  //               height: '36px',
  //               fontSize: '14px',
  //               fontWeight: '400'
  //             }}
  //             onChange={e => handleSelectChange(e, params)}
  //           >
  //             <MenuItem value='workflow1'>Stage workflow 1</MenuItem>
  //             <MenuItem value='workflow2'>Stage workflow 2</MenuItem>
  //             <MenuItem value='workflow3'>Stage workflow 3</MenuItem>
  //             <MenuItem value='workflow4'>Stage workflow 4</MenuItem>
  //             <MenuItem value='workflow5'>Stage workflow 5</MenuItem>
  //             <MenuItem value='workflow6'>Stage workflow 6</MenuItem>
  //           </Select>
  //         </FormControl>
  //       )
  //     }
  //   }
  // ]

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
                  value={enquiryTypeName}
                  placeholder='Enquiry Type Name'
                  onChange={e => setEnquiryTypeName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
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
                  value={enquiryTypeSlug}
                  placeholder='Enquiry Type Slug'
                  onChange={e => setEnquiryTypeSlug(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>
                    {
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
                    }
                  </InputLabel>
                  <Select
                    label='Enquiry Mode'
                    defaultValue=''
                    IconComponent={DownArrow}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleEnqMode}
                  >
                    <MenuItem value=''>
                      <em>Select Option</em>
                    </MenuItem>
                    <MenuItem value='digital'>Digital</MenuItem>
                    <MenuItem value='offline'>Offline</MenuItem>
                    <MenuItem value='referral'>Referral</MenuItem>
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
                        User Type
                        {infoDialog && (
                          <span>
                            <Tooltip title='User Type'>
                              <InfoIcon style={{ color: '#a3a3a3' }} />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='User Type'
                    IconComponent={DownArrow}
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
                    {['Parent', 'RE', 'FE', 'CC', 'Student'].map(value => (
                      <MenuItem key={value} value={value}>
                        <Checkbox checked={selectedItems1.indexOf(value) > -1} />
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
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
                  <Select
                    label='Enquiry Order'
                    IconComponent={DownArrow}
                    defaultValue=''
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleEnqOrder}
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
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* <FormControl
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
                        Enquiry Form
                        {infoDialog && (
                          <span>
                            <Tooltip title='Enquiry Form'>
                              <InfoIcon style={{ color: '#a3a3a3' }} />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Enquiry Form'
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    multiple
                    value={selectedItems2}
                    onChange={handleChange2}
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
                    {['Student Info', 'Parent Info', 'Enquiry Form 3', 'Enquiry Form 4', 'Enquiry Form 5'].map(
                      value => (
                        <MenuItem key={value} value={value}>
                          <Checkbox checked={selectedItems2.indexOf(value) > -1} />
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl> */}
                <Autocomplete
                  multiple
                  id='autocomplete-multiple-filled'
                  popupIcon={<span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>}
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
                <TextField
                  fullWidth
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
                  value={description}
                  placeholder='Description'
                  onChange={e => setDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <div className='toggle-select'>
                  <span className='toggle-status'>Active</span>
                  <Switch defaultChecked />
                </div>
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
                        Registration Form
                        {infoDialog && (
                          <span>
                            <Tooltip title='Registration Form'>
                              <InfoIcon style={{ color: '#a3a3a3' }} />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Registration Form'
                    IconComponent={DownArrow}
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    multiple
                    value={selectedItems3}
                    onChange={handleChange3}
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
                    {['Student Info', 'Parent Info', 'Enquiry Form 3', 'Enquiry Form 4', 'Enquiry Form 5'].map(
                      value => (
                        <MenuItem key={value} value={value}>
                          <Checkbox checked={selectedItems3.indexOf(value) > -1} />
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl>
                  <FormLabel style={{ color: '#212121' }} className='radio' id='demo-row-radio-buttons-group-label'>
                    Is Registration Applicable?
                  </FormLabel>
                  <RadioGroup row aria-labelledby='demo-row-radio-buttons-group-label' name='row-radio-buttons-group'>
                    <FormControlLabel value='yes' control={<Radio />} label='Yes' />
                    <FormControlLabel value='no' control={<Radio />} label='No' />
                  </RadioGroup>
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
                        Admission Form
                        {infoDialog && (
                          <span>
                            <Tooltip title='Admission Form'>
                              <InfoIcon style={{ color: '#a3a3a3' }} />
                            </Tooltip>
                          </span>
                        )}
                      </Box>
                    }
                  </InputLabel>
                  <Select
                    label='Admission Form'
                    labelId='demo-mutiple-chip-label'
                    id='demo-mutiple-chip'
                    IconComponent={DownArrow}
                    multiple
                    value={selectedItems4}
                    onChange={handleChange4}
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
                    {['Student Info', 'Parent Info', 'Enquiry Form 3', 'Enquiry Form 4', 'Enquiry Form 5'].map(
                      value => (
                        <MenuItem key={value} value={value}>
                          <Checkbox checked={selectedItems4.indexOf(value) > -1} />
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl>
                  <FormLabel style={{ color: '#212121' }} className='radio' id='demo-row-radio-buttons-group-label'>
                    Is Admission Applicable?
                  </FormLabel>
                  <RadioGroup row aria-labelledby='demo-row-radio-buttons-group-label' name='row-radio-buttons-group'>
                    <FormControlLabel value='yes' control={<Radio />} label='Yes' />
                    <FormControlLabel value='no' control={<Radio />} label='No' />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          )}
          {activeStep === 1 && (
            <>
              <Grid container spacing={5}>
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
                    </InputLabel>
                    <Select
                      label='Enquiry Type Name'
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      IconComponent={DownArrow}
                      value={selectedItems5}
                      onChange={handleChange5}
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
                              <HtmlTooltip
                                title={<span style={{ whiteSpace: 'pre-line' }}>{moreItems.join('\n')}</span>}
                              >
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
                      {['Admission', 'Re-Admission', 'PSA', 'Kids Club'].map(value => (
                        <MenuItem key={value} value={value}>
                          <Checkbox checked={selectedItems5.indexOf(value) > -1} />
                          {value}
                        </MenuItem>
                      ))}
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
                          Select Stages
                          {infoDialog && (
                            <span>
                              <Tooltip title='Select Stages'>
                                <InfoIcon style={{ color: '#a3a3a3' }} />
                              </Tooltip>
                            </span>
                          )}
                        </Box>
                      }
                    </InputLabel>
                    <Select
                      label='Select Stages'
                      IconComponent={DownArrow}
                      labelId='demo-mutiple-chip-label'
                      id='demo-mutiple-chip'
                      multiple
                      value={selectedItems6}
                      onChange={handleChange6}
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
                              <HtmlTooltip
                                title={<span style={{ whiteSpace: 'pre-line' }}>{moreItems.join('\n')}</span>}
                              >
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
                      {['Enquiry', 'Competency Test', 'Enquiry1', 'Enquiry2'].map(value => (
                        <MenuItem key={value} value={value}>
                          <Checkbox checked={selectedItems6.indexOf(value) > -1} />
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                  {/* <DataGrid autoHeight columns={columns} rows={rows} hideFooterPagination sx={{ boxShadow: 'none' }} /> */}
                  <MuiTable />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
        <SuccessDialog
          title='Enquiry Type Created Successfully'
          openDialog={openDialog}
          handleClose={handleCloseDialog}
        />
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

export default CreateEnquiryType
