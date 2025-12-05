import React, { useEffect, useState } from 'react'
import MarqueeText from './ChartsMarquee/MarqueeText'
import { Box } from '@mui/system'
import {
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
  TabsProps,
  TabProps
} from '@mui/material'
import SampleChart from './ChartsMarquee/PieChart'
import PieChartTwo from './ChartsMarquee/StudentPieChart'
import BarChart from './ChartsMarquee/BarChart'
import DepartmentPieChart from './ChartsMarquee/DepartmentPieChart'
import HorizontalBarChart from './ChartsMarquee/HorizontalBarChart'
import FunnelChart from './ChartsMarquee/FunnelChart'
import PerformancePieChart from './ChartsMarquee/PerformancePieChart'
import { useRouter } from 'next/router'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { styled } from '@mui/system'
import PSRISRChart from './ChartsMarquee/PSRISRChart'

//Chips Styled
const StyledChipProps = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorPrimary': {
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: `${theme.palette.customColors.customChipBackgroundColor}`,
    color: `${theme.palette.customColors.customChipColor}`
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

function DasboardUI() {
  const router = useRouter()
  const { setPagePaths } = useGlobalContext()
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const [year, setYear] = useState('AY 2024-2025')
  const [calenderDialog, setCalenderDialog] = useState<boolean>(false)
  const [taskDialog, setTaskDialog] = useState<boolean>(false)
  const [notificationDialog, setNotificationDialog] = useState<boolean>(false)
  const [tabValue, setTabValue] = useState<number>(0)
  const [selectedOptions, setSelectedOptions] = useState<string>('PSR Data Summary')

  const handleYearChange = (event: any) => {
    setYear(event.target.value as string)
  }

  //Handler for Calender Dialog
  const handleCloseCalenderDialog = () => {
    setCalenderDialog(false)
  }

  //Handler for Task Dialog
  const handleCloseTaskDialog = () => {
    setTaskDialog(false)
  }

  //Handler for Notification Dialog
  const handleCloseNotificationDialog = () => {
    setNotificationDialog(false)
  }

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Dashboard',
        path: '/dashboard'
      }
    ])
  }, [])

  //Handler for Tab

  //Handle Clickable Chips Handler

  const chipsLabel = ['PSR Data Summary', 'ISR Data Summary']

  const handleToggle = (option: string) => {
    // setFilter(option)
    setSelectedOptions(option)
  }

  //Below Data fro graphs
  const rowData = [
    { value: 1048, name: '37 This Year', centerLabel: 'Total' },
    { value: 735, name: '30 Next Year', centerLabel: 'Total' }
  ]
  const rowData1 = [{ value: 1048, name: '37 This Year', centerLabel: 'Total' }]
  const barData = [37, 16, 10, 21, 14, 3, 7, 13, 3, 28]
  const departMentData = [
    { value: 1048, name: 'Department School 1' },
    { value: 735, name: 'Department School 2' },
    { value: 580, name: 'Department School 3' },
    { value: 484, name: 'Department School 4' }
  ]

  //Date FOR PSR DATA Summury
  const PSRData = {
    days: ['Jan-24', 'May-24', 'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Dec-24'],
    series: [
      {
        name: 'Open',
        data: [30, 32, 31, 35, 33, 36, 34]
      },
      {
        name: 'WIP',
        data: [15, 17, 16, 18, 16, 19, 17]
      },
      {
        name: 'Resolved',
        data: [22, 24, 23, 26, 24, 27, 25]
      }
    ]
  }

  //Data FOR ISR DATA Summury
  const ISRData = {
    days: ['Jan-24', 'May-24', 'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Dec-24'],
    series: [
      {
        name: 'Open',
        data: [30, 32, 31, 35, 33, 36, 34]
      },
      {
        name: 'WIP',
        data: [15, 17, 16, 18, 16, 19, 17]
      },
      {
        name: 'Resolved',
        data: [22, 24, 23, 26, 24, 27, 25]
      }
    ]
  }

  // //Data for PSR DATA SUMMURY
  // const categories = ['Response', 'Resolved', 'Total PSR']

  // const responseData = [
  //   { value: 600, name: 'Happy' },
  //   { value: 800, name: 'Within TAT' },
  //   { value: 300, name: 'Open' }
  // ]

  // const resolvedData = [
  //   { value: 300, name: 'Sad' },
  //   { value: 200, name: 'Outside..' },
  //   { value: 500, name: 'VIP' }
  // ]

  // const totalPSRData = [
  //   { value: null, name: 'Mon Affiliate Ad within TAT' },
  //   { value: null, name: 'Tue Affiliate Ad within TAT' },
  //   { value: 100, name: 'Resolved' }
  // ]

  //Funnel Chart Data
  const funnelData = [
    { value: 100, name: 'Enquiry' },
    { value: 80, name: 'Walking' },
    { value: 70, name: 'Registered' },
    { value: 60, name: 'Admitted' }
  ]

  //My Performance Data
  const performanceData = [
    { value: 1048, name: 'Riya' },
    { value: 735, name: 'Sagar' },
    { value: 580, name: 'Rohit' },
    { value: 484, name: 'Puja' },
    { value: 300, name: 'Sumit' }
  ]

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <Box sx={{ width: '97%' }}>
          {/* <Box>
            <MarqueeText
              title='Latest News'
              texts={[
                'Lorem ipsum dolor sit amet consectetur. Nec enim tristique eu faucibus libero sit vitae tellus. Pellentesque pellentesque  Lorem ipsum dolor sit amet consectetur. '
              ]}
            />
          </Box> */}
          <Box
            sx={{
              mt: 4,
              mb: 4,
              background: '#fff',
              padding: '12px 24px',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}
          >
            <FormControl required sx={{ ml: 4 }}>
              <InputLabel id='demo-simple-select-outlined-label'>Academic Year</InputLabel>
              <Select
                IconComponent={DownArrow}
                label='Academic Year'
                defaultValue={year}
                id='demo-simple-select-outlined'
                labelId='demo-simple-select-outlined-label'
                onChange={handleYearChange}
                sx={{ height: '48px' }}
              >
                <MenuItem value=''>Select Academic Year</MenuItem>
                <MenuItem value='AY 2024-2025'>AY 2024-2025</MenuItem>
                <MenuItem value='AY 2025-2026'>AY 2025-2026</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ padding: '24px', borderRadius: '10px', background: '#fff' }}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box
                  sx={{ padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}
                  onClick={() => router.push('/enquiry-listing')}
                >
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      enquiry management
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <SampleChart rowData={rowData} />

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Chip
                        label='10 Registered'
                        color='primary'
                        variant='outlined'
                        onClick={() => router.push('/enquiry-listing')}
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='success'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='warning'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='error'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box
                  sx={{ padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}
                  onClick={() => router.push('/registered-student-listing')}
                >
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      Admission management
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <SampleChart rowData={rowData} />

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Chip
                        label='10 Registered'
                        color='primary'
                        variant='outlined'
                        onClick={() => router.push('/registered-student-listing')}
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='success'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='warning'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='error'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box sx={{ padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      Student management
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <PieChartTwo rowData={rowData1} />

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Chip
                        label='10 Registered'
                        color='primary'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='success'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='warning'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='error'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box sx={{ padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      VAS student management
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <SampleChart rowData={rowData} />

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Chip
                        label='10 Registered'
                        color='primary'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='success'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='warning'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                      <Chip
                        label='10 Registered'
                        color='error'
                        variant='outlined'
                        sx={{
                          width: 110,
                          mb: 2,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          },
                          '&.MuiButtonBase-root.MuiChip-root .MuiChip-deleteIcon': {
                            ml: -3
                          }
                        }}
                        onDelete={() => {
                          console.log('delete')
                        }}
                        deleteIcon={
                          <span style={{ fontSize: '17px !important' }} className='icon-arrow-right-3'></span>
                        }
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box sx={{ height: '100%', padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      Create Discount group
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        height: '300px'
                      }}
                    >
                      {' '}
                      <Typography
                        color={'customColors.text3'}
                        sx={{
                          fontSize: '10px',
                          lineHeight: '11px',
                          fontWeight: '400',
                          letterSpacing: '0.25px'
                        }}
                      >
                        No Data
                      </Typography>{' '}
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box sx={{ height: '100%', padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      placeholder
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        height: '300px'
                      }}
                    >
                      {' '}
                      <Typography
                        color={'customColors.text3'}
                        sx={{
                          fontSize: '10px',
                          lineHeight: '11px',
                          fontWeight: '400',
                          letterSpacing: '0.25px'
                        }}
                      >
                        No Data
                      </Typography>{' '}
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4}>
                <Box sx={{ height: '100%', padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      Target Vs Achievement
                    </Typography>
                  </Box>
                  <Box sx={{ ml: -10 }}>
                    <FunnelChart data={funnelData} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={8} lg={8}>
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    padding: '16px',
                    borderRadius: '10px',
                    border: `1px solid #e0e0e0`
                  }}
                >
                  {chipsLabel.map((label, index) => (
                    <StyledChipProps
                      key={index}
                      label={label}
                      onClick={() => handleToggle(label)}
                      color={selectedOptions?.includes(label) ? 'primary' : 'default'}
                      variant='filled'
                      sx={{
                        mr: 4

                        // '&.Muichip-label': {
                        //   fontSize: '10px',
                        //   lineHeight: '11px',
                        //   letterSpacing: '0.25px',
                        //   textAlign: 'center'
                        // }
                      }}
                    />
                  ))}
                  {selectedOptions === 'PSR Data Summary' && (
                    <Box>
                      <PSRISRChart data={PSRData} />
                    </Box>
                  )}
                  {selectedOptions === 'ISR Data Summary' && (
                    <Box>
                      <PSRISRChart data={ISRData} />
                    </Box>
                  )}
                </Box>
              </Grid>
              {/* <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box sx={{ height: '100%', padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      PSR Data Summary
                    </Typography>
                  </Box>
                  <Box>
                    <HorizontalBarChart
                      id='horizontalBar'
                      categories={categories}
                      responseData={responseData}
                      resolvedData={resolvedData}
                      totalPSRData={totalPSRData}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box sx={{ height: '100%', padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      ISR Data Summary
                    </Typography>
                  </Box>
                  <Box>
                    <HorizontalBarChart
                      id='horizontalBar1'
                      categories={categories}
                      responseData={responseData}
                      resolvedData={resolvedData}
                      totalPSRData={totalPSRData}
                    />
                  </Box>
                </Box>
              </Grid> */}
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box sx={{ height: '100%', padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      My Performance
                    </Typography>
                  </Box>
                  <Box>
                    <PerformancePieChart data={performanceData} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box sx={{ height: '100%', padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      My Department
                    </Typography>
                  </Box>
                  <Box>
                    <DepartmentPieChart data={departMentData} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Box sx={{ height: '100%', padding: '16px', borderRadius: '10px', border: `1px solid #e0e0e0` }}>
                  <Box>
                    <Typography
                      variant='subtitle2'
                      color={'text.primary'}
                      sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                    >
                      My School
                    </Typography>
                  </Box>
                  <Box>
                    <BarChart barData={barData} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default DasboardUI
