import { Chip, Divider, Grid, Popover, styled, Typography, useTheme } from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
import SearchBox from 'src/@core/CustomComponent/CustomSearchBox/SearchBox'
import StudentIcon from '../../../public/images/avatars/studentIcon.svg'
import Image from 'next/image'
import Link from 'next/link'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

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

function AdmisionLayout() {
  const theme = useTheme()
  const { setPagePaths } = useGlobalContext()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string>('2024')

  //Handling Search Functionality
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }
  const handleClearSearch = () => {
    setSearchText('')
  }
  const chipsLabel = ['2024', '2023', '2022', '5 Years Old']
  const handleToggle = (option: string) => {
    // setFilter(option)
    setSelectedOptions(option)
  }

  //Handle Popover here
  const handlePopOver = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopOverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  const studentArray = [
    {
      id: 1,
      studentName: 'Khevna Shah',
      year: '(AY 2024-2025)',
      enquiryN0: 'ENADM#4402',
      schoolName: 'Vibgyor Kids & High - Malad West',
      grade: 'Grade V',
      board: 'CBSC',
      admission: 'Regular',
      shift: 'Shift1',
      stream: 'Stream- NA',
      tagName: 'School Visit',
      note: 'School Visit scheduled on 18th July 10:30 AM',
      process: '25% Completed'
    },
    {
      id: 2,
      studentName: 'Khevna Shah',
      year: '(AY 2024-2025)',
      enquiryN0: 'ENADM#4402',
      schoolName: 'Vibgyor Kids & High - Malad West',
      grade: 'Grade V',
      board: 'CBSC',
      admission: 'Regular',
      shift: 'Shift1',
      stream: 'Stream- NA',
      tagName: 'School Visit',
      note: 'School Visit scheduled on 18th July 10:30 AM',
      process: '25% Completed'
    },
    {
      id: 3,
      studentName: 'Khevna Shah',
      year: '(AY 2024-2025)',
      enquiryN0: 'ENADM#4402',
      schoolName: 'Vibgyor Kids & High - Malad West',
      grade: 'Grade V',
      board: 'CBSC',
      admission: 'Regular',
      shift: 'Shift1',
      stream: 'Stream- NA',
      tagName: 'School Visit',
      note: 'School Visit scheduled on 18th July 10:30 AM',
      process: '25% Completed'
    },
    {
      id: 4,
      studentName: 'Khevna Shah',
      year: '(AY 2024-2025)',
      enquiryN0: 'ENADM#4402',
      schoolName: 'Vibgyor Kids & High - Malad West',
      grade: 'Grade V',
      board: 'CBSC',
      admission: 'Regular',
      shift: 'Shift1',
      stream: 'Stream- NA',
      tagName: 'School Visit',
      note: 'School Visit scheduled on 18th July 10:30 AM',
      process: '25% Completed'
    },
    {
      id: 5,
      studentName: 'Khevna Shah',
      year: '(AY 2024-2025)',
      enquiryN0: 'ENADM#4402',
      schoolName: 'Vibgyor Kids & High - Malad West',
      grade: 'Grade V',
      board: 'CBSC',
      admission: 'Regular',
      shift: 'Shift1',
      stream: 'Stream- NA',
      tagName: 'Registered',
      note: 'School Visit scheduled on 18th July 10:30 AM',
      process: '25% Completed'
    }
  ]

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Admissions',
        path: '/admissions'
      }
    ])
  }, [])

  return (
    <>
      <Box sx={{ background: '#fff', borderRadius: '10px', padding: '16px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {chipsLabel.map((label, index) => (
              <StyledChipProps
                key={index}
                label={label}
                onClick={() => handleToggle(label)}
                color={selectedOptions?.includes(label) ? 'primary' : 'default'}
                variant='filled'
                sx={{ mr: 4 }}
              />
            ))}
          </Box>
          <Box>
            <SearchBox
              placeHolderTitle='Search Enquiry'
              searchText={searchText}
              handleClearSearch={handleClearSearch}
              handleInputChange={handleInputChange}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ background: '#fff', borderRadius: '10px', padding: '16px', mt: 6 }}>
        <Grid container spacing={7} xs={12} sx={{ pt: 0, mt: 2, ml: -3.5 }}>
          {studentArray?.map(student => (
            <Grid
              item
              xs={12}
              md={6}
              lg={6}
              key={student.id}
              sx={{ '&.MuiGrid-item': { paddingTop: '0px !important' } }}
            >
              <Box
                sx={{
                  mb: 8,
                  padding: '24px',
                  borderRadius: '10px',
                  background:
                    student?.tagName === 'Registered'
                      ? theme.palette.customColors.text6
                      : theme.palette.customColors.surface2,
                  boxShadow: '0px 2px 10px 0px #4C4E6438'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <Image src={StudentIcon} alt='student_icon' width={60} height={60} />
                    <Box sx={{ ml: 2, display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Typography
                          variant='subtitle2'
                          color={student?.tagName === 'Registered' ? 'customColors.text3' : 'text.primary'}
                          sx={{ textTransform: 'capitalize', lineHeight: '18px' }}
                        >
                          {student.studentName}
                        </Typography>
                        <Typography
                          variant='overline'
                          color={student?.tagName === 'Registered' ? 'customColors.text3' : 'text.primary'}
                          sx={{ textTransform: 'capitalize', ml: 1, letterSpacing: '0.25px', lineHeight: '18px' }}
                        >
                          {student.year}
                        </Typography>
                      </Box>
                      <Typography
                        variant='overline'
                        color={student?.tagName === 'Registered' ? 'customColors.text3' : 'text.primary'}
                        sx={{ textTransform: 'capitalize', letterSpacing: '0.25px', lineHeight: '18px' }}
                      >
                        {student.enquiryN0}
                      </Typography>
                      <Typography
                        variant='overline'
                        color={student?.tagName === 'Registered' ? 'customColors.text3' : 'text.primary'}
                        sx={{ textTransform: 'capitalize', letterSpacing: '0.25px', lineHeight: '18px' }}
                      >
                        {student.schoolName}
                      </Typography>
                      <Typography
                        variant='overline'
                        color={student?.tagName === 'Registered' ? 'customColors.text3' : 'text.primary'}
                        sx={{ textTransform: 'capitalize', letterSpacing: '0.25px', lineHeight: '18px' }}
                      >
                        {student.grade} | {student.board} | {student.admission} | {student.shift}
                      </Typography>
                      <Typography
                        variant='overline'
                        color={student?.tagName === 'Registered' ? 'customColors.text3' : 'text.primary'}
                        sx={{ textTransform: 'capitalize', letterSpacing: '0.25px', lineHeight: '18px' }}
                      >
                        {student.stream}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Box>
                      <Box
                        sx={{
                          borderRadius: '8px',
                          backgroundColor:
                            student?.tagName === 'Registered'
                              ? theme.palette.customColors.text6
                              : theme.palette.customColors.primaryLightest,

                          padding: '10px 10px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          mr: 3
                        }}
                      >
                        <Typography
                          variant='body2'
                          color={student?.tagName === 'Registered' ? 'customColors.text3' : 'primary'}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {student.tagName}
                        </Typography>
                      </Box>
                      {student.tagName == 'School Visit' && (
                        <Box sx={{ textAlign: 'center', ml: -2 }}>
                          <Typography
                            variant='overline'
                            color={'success.main'}
                            sx={{ textTransform: 'capitalize', letterSpacing: '0.25px', lineHeight: '11px' }}
                          >
                            {student.process}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <span
                        onClick={handlePopOver}
                        className='icon-Menu-Dots-1'
                        style={{
                          color:
                            student?.tagName === 'Registered'
                              ? theme.palette.customColors.text3
                              : theme.palette.customColors.mainText,
                          cursor: 'pointer'
                        }}
                      ></span>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Divider />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Typography
                    variant='caption'
                    color={student?.tagName === 'Registered' ? 'customColors.text3' : 'text.primary'}
                    sx={{ textTransform: 'capitalize', fontWeight: 500, lineHeight: '13.2px' }}
                  >
                    Important Note :
                  </Typography>
                  <Typography variant='caption' sx={{ textTransform: 'capitalize', lineHeight: '13.2px', ml: 2 }}>
                    <Link
                      href='#'
                      style={{
                        textDecoration: 'none',
                        color:
                          student?.tagName === 'Registered'
                            ? theme.palette.customColors.text3
                            : theme.palette.primary.dark
                      }}
                    >
                      {student.note}
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopOverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <Typography variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 2 }}>
          {' '}
          <Link style={{ color: theme.palette.customColors.mainText, fontSize: '16px', lineHeight: '17.6px' }} href='#'>
            Registration
          </Link>
        </Typography>
        <Typography variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 2 }}>
          {' '}
          <Link style={{ color: theme.palette.customColors.mainText, fontSize: '16px', lineHeight: '17.6px' }} href='#'>
            Email
          </Link>
        </Typography>
        <Typography variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 2 }}>
          <Link style={{ color: theme.palette.customColors.mainText, fontSize: '16px', lineHeight: '17.6px' }} href='#'>
            School Tour
          </Link>
        </Typography>
        <Typography variant='subtitle1' sx={{ textTransform: 'capitalize', mb: 2 }}>
          {' '}
          <Link style={{ color: theme.palette.customColors.mainText, fontSize: '16px', lineHeight: '17.6px' }} href='#'>
            Timeline
          </Link>
        </Typography>
      </Popover>
    </>
  )
}

export default AdmisionLayout
