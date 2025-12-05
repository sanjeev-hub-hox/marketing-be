import React, { useEffect, useState } from 'react'
import { Box, IconButton, Typography, Drawer, Chip, Divider } from '@mui/material'
import { styled } from '@mui/material/styles'
import FatherSVGIcon from '../Image/father.svg'
import MotherSVGIcon from '../Image/mother.svg'
import Image from 'next/image'
import { Tabs, Tab } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import FavoriteIcon from '@mui/icons-material/Favorite'
import PersonIcon from '@mui/icons-material/Person'
import {
  borderRadius,
  boxSizing,
  color,
  display,
  fontSize,
  fontWeight,
  lineHeight,
  margin,
  textTransform
} from '@mui/system'

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

//Style for custom tab
const StyledTabs = styled(Tabs)({
  backgroundColor: '#fff',
  borderRadius: '4px',

  '& .MuiTabs-indicator': {
    display: 'none'
  }
})

const StyledTab = styled((props: any) => <Tab {...props} />)(({ theme }) => ({
  '&.MuiTab-root': {
    '&:hover': {
      boxShadow: 'none',
      borderRadius: '0px'
    },
    '& .MuiTypography-root': {
      fontWeight: '400',
      marginTop: '6px'
    },
    '&.Mui-selected': {
      '& .MuiButtonBase-root.MuiIconButton-root': {
        backgroundColor: '#F6F6F6',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& span': {
          color: '#3F41D1'
        }
      },
      '& .MuiTypography-root': {
        fontWeight: '500',
        color: '#3F41D1',
        marginTop: '6px'
      }
    }
  }
}))

//Custom style for tab 2
const CustomTabs = styled(Tabs)({
  backgroundColor: '#fff'
})

const CustomTab = styled((props: any) => <Tab {...props} />)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 100,
  marginRight: '20px',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '15.4px',
  color: '#666',
  '&:hover': {
    boxShadow: 'none',
    borderRadius: '0px'
  },
  '&.Mui-selected': {
    backgroundColor: '#FCF8FF',
    color: '#3635C9',
    fontWeight: 500
  }
}))

//Custom Style for tab 2 section content
interface StyledBoxProps {
  active: boolean
}

const StyledBox = styled(Box)<StyledBoxProps>(({ theme, active }) => ({
  '& .MuiButtonBase-root.MuiIconButton-root': {
    fontSize: '14px',
    fontWeight: active ? 500 : 400,
    lineHeight: '15.4px',
    textTransform: 'capitalize',
    color: active ? '#313030' : '#666666',

    '& span': {
      color: active ? '#3635C9' : '#666666'
    }
  },
  '& .MuiTypography-root.MuiTypography-subtitle2': {
    fontSize: '14px',
    fontWeight: active ? 500 : 400,
    lineHeight: '15.4px',
    textTransform: 'capitalize',
    color: active ? '#313030' : '#666666',
    marginTop: '5px',
    display: 'flex',
    alignItems: 'center',
    '& span': {
      color: active ? '#3635C9' : '#666666',
      fontSize: '14px !important'
    }
  },
  '& .MuiTypography-root.MuiTypography-body2': {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '15.4px',
    textTransform: 'capitalize',
    color: active ? '#313030' : '#666666',
    marginTop: '5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '370px'
  },
  '& .MuiTypography-root.MuiTypography-caption': {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '13.2px',
    textTransform: 'capitalize',
    color: '#666666'
  }
}))

type SchoolTour = {
  openDrawer: boolean
  handleClose?: () => void
  title?: string
}

const NotificationDialog = ({ openDrawer, handleClose, title }: SchoolTour) => {
  const [selectedOptions, setSelectedOptions] = useState<string>('Today')
  const [value, setValue] = useState(0)
  const [valueTwo, setValueTwo] = useState('tabOne')
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)

  //Calculate screen width
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  const handleTabTwoChange = (event: React.SyntheticEvent, newValue: string) => {
    setValueTwo(newValue)
  }

  //Content of array
  const contentArray = [
    {
      title: 'You are assigned new enquiry',
      body: 'Lorem ipsum dolor sit amet consectetur. Nec enim tristique eu faucibus libero sit vitae tellus. Pellentesque',
      timestamp: 'About 40 Hours Ago',
      active: true
    },
    {
      title: 'You are assigned new enquiry',
      body: 'Lorem ipsum dolor sit amet consectetur. Nec enim tristique eu faucibus libero sit vitae tellus. Pellentesque',
      timestamp: 'About 40 Hours Ago',
      active: false
    }
  ]

  //Handle Clickable Chips Handler

  const chipsLabel = ['Today', 'This Week', 'Important']

  const handleToggle = (option: string) => {
    // setFilter(option)
    setSelectedOptions(option)
  }

  return (
    <div>
      {openDrawer && (
        <Drawer
          anchor='right'
          open={openDrawer}
          onClose={handleClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: '500px',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '0px',
              zIndex: 1500,
              padding: '16px',
              overflow: `hidden`,
              boxShadow: '0px 2px 10px 0px #4C4E6438'
            }
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              zIndex: 1500,
              width: '100%',
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant='subtitle1' color={'text.primary'} sx={{ lineHeight: '24px' }}>
              {title}
            </Typography>
            <IconButton disableFocusRipple disableRipple onClick={handleClose}>
              <span className='icon-close-circle'></span>
            </IconButton>
          </Box>
          <Box sx={{ mb: 3 }}>
            <StyledTabs value={value} onChange={handleChange} aria-label='icon tabs'>
              <StyledTab
                icon={
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IconButton>
                        {value === 0 ? <span className='icon-graph1'></span> : <span className='icon-graph'></span>}
                      </IconButton>
                      <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                        Marketing
                      </Typography>
                    </Box>
                  </>
                }
                aria-label='Marketing'
              />
              <StyledTab
                icon={
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IconButton>
                        {value === 1 ? <span className='icon-teacher1'></span> : <span className='icon-teacher'></span>}
                      </IconButton>
                      <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                        Academic
                      </Typography>
                    </Box>
                  </>
                }
                aria-label='Academic'
              />
              <StyledTab
                icon={
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IconButton>
                        {value === 2 ? (
                          <span className='icon-school-bus'></span>
                        ) : (
                          <span className='icon-schoolbus'></span>
                        )}
                      </IconButton>
                      <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                        Transport
                      </Typography>
                    </Box>
                  </>
                }
                aria-label='Transport'
              />
              <StyledTab
                icon={
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IconButton>
                        {value === 3 ? (
                          <span className='icon-courthouse1'></span>
                        ) : (
                          <span className='icon-courthouse'></span>
                        )}
                      </IconButton>
                      <Typography variant='subtitle2' color={'customColors.mainText'} sx={{ lineHeight: '15.4px' }}>
                        Finance
                      </Typography>
                    </Box>
                  </>
                }
                aria-label='Finance'
              />
            </StyledTabs>
          </Box>
          {value === 0 && (
            <Box>
              <Box sx={{ height: '55px', borderRadius: '8px', padding: '6px', background: '#F5F5F7' }}>
                <Box>
                  {chipsLabel.map((label, index) => (
                    <StyledChipProps
                      key={index}
                      label={label}
                      onClick={() => handleToggle(label)}
                      color={selectedOptions?.includes(label) ? 'primary' : 'default'}
                      variant='filled'
                      sx={{
                        mr: 4,
                        '&.Muichip-label': {
                          fontSize: '10px',
                          lineHeight: '11px',
                          letterSpacing: '0.25px',
                          textAlign: 'center'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box>
                <Box sx={{ mt: 3 }}>
                  <CustomTabs value={valueTwo} onChange={handleTabTwoChange}>
                    <CustomTab label={`Unread (${1234}) `} value='tabOne' />
                    <CustomTab label={`Read (${50}) `} value='tabTwo' />
                    <CustomTab label={`All (${50}) `} value='tabThree' />
                  </CustomTabs>
                </Box>
                <Box
                  className='fixedModal'
                  sx={
                    screenWidth >= 2500
                      ? { height: '1110px', overflowY: 'auto' }
                      : screenWidth >= 1900
                      ? { height: '850px', overflowY: 'auto' }
                      : screenWidth >= 1600
                      ? { height: '600px', overflowY: 'auto' }
                      : screenWidth >= 1400
                      ? { height: '570px', overflowY: 'auto' }
                      : screenWidth >= 1300
                      ? { height: '430px', overflowY: 'auto' }
                      : { height: '400px', overflowY: 'auto' }
                  }
                >
                  {valueTwo === 'tabOne' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px',
                                    fontSize: '14px !important',
                                    color: content.active ? '#3F41D1' : '#666'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'tabTwo' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'tabThree' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          )}
          {value === 1 && (
            <Box>
              <Box sx={{ height: '55px', borderRadius: '8px', padding: '6px', background: '#F5F5F7' }}>
                <Box>
                  {chipsLabel.map((label, index) => (
                    <StyledChipProps
                      key={index}
                      label={label}
                      onClick={() => handleToggle(label)}
                      color={selectedOptions?.includes(label) ? 'primary' : 'default'}
                      variant='filled'
                      sx={{
                        mr: 4,
                        '&.Muichip-label': {
                          fontSize: '10px',
                          lineHeight: '11px',
                          letterSpacing: '0.25px',
                          textAlign: 'center'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box>
                <Box sx={{ mt: 3 }}>
                  <CustomTabs value={valueTwo} onChange={handleTabTwoChange}>
                    <CustomTab label={`Unread (${1234}) `} value='tabOne' />
                    <CustomTab label={`Read (${50}) `} value='tabTwo' />
                    <CustomTab label={`All (${50}) `} value='tabThree' />
                  </CustomTabs>
                </Box>
                <Box
                  className='fixedModal'
                  sx={
                    screenWidth >= 2500
                      ? { height: '1110px', overflowY: 'auto' }
                      : screenWidth >= 1900
                      ? { height: '850px', overflowY: 'auto' }
                      : screenWidth >= 1600
                      ? { height: '600px', overflowY: 'auto' }
                      : screenWidth >= 1400
                      ? { height: '570px', overflowY: 'auto' }
                      : screenWidth >= 1300
                      ? { height: '430px', overflowY: 'auto' }
                      : { height: '400px', overflowY: 'auto' }
                  }
                >
                  {valueTwo === 'tabOne' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'tabTwo' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'tabThree' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          )}
          {value === 2 && (
            <Box>
              <Box sx={{ height: '55px', borderRadius: '8px', padding: '6px', background: '#F5F5F7' }}>
                <Box>
                  {chipsLabel.map((label, index) => (
                    <StyledChipProps
                      key={index}
                      label={label}
                      onClick={() => handleToggle(label)}
                      color={selectedOptions?.includes(label) ? 'primary' : 'default'}
                      variant='filled'
                      sx={{
                        mr: 4,
                        '&.Muichip-label': {
                          fontSize: '10px',
                          lineHeight: '11px',
                          letterSpacing: '0.25px',
                          textAlign: 'center'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box>
                <Box sx={{ mt: 3 }}>
                  <CustomTabs value={valueTwo} onChange={handleTabTwoChange}>
                    <CustomTab label={`Unread (${1234}) `} value='tabOne' />
                    <CustomTab label={`Read (${50}) `} value='tabTwo' />
                    <CustomTab label={`All (${50}) `} value='tabThree' />
                  </CustomTabs>
                </Box>
                <Box
                  className='fixedModal'
                  sx={
                    screenWidth >= 2500
                      ? { height: '1110px', overflowY: 'auto' }
                      : screenWidth >= 1900
                      ? { height: '850px', overflowY: 'auto' }
                      : screenWidth >= 1600
                      ? { height: '600px', overflowY: 'auto' }
                      : screenWidth >= 1400
                      ? { height: '570px', overflowY: 'auto' }
                      : screenWidth >= 1300
                      ? { height: '430px', overflowY: 'auto' }
                      : { height: '400px', overflowY: 'auto' }
                  }
                >
                  {valueTwo === 'tabOne' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'tabTwo' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'tabThree' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          )}
          {value === 3 && (
            <Box>
              <Box sx={{ height: '55px', borderRadius: '8px', padding: '6px', background: '#F5F5F7' }}>
                <Box>
                  {chipsLabel.map((label, index) => (
                    <StyledChipProps
                      key={index}
                      label={label}
                      onClick={() => handleToggle(label)}
                      color={selectedOptions?.includes(label) ? 'primary' : 'default'}
                      variant='filled'
                      sx={{
                        mr: 4,
                        '&.Muichip-label': {
                          fontSize: '10px',
                          lineHeight: '11px',
                          letterSpacing: '0.25px',
                          textAlign: 'center'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box>
                <Box sx={{ mt: 3 }}>
                  <CustomTabs value={valueTwo} onChange={handleTabTwoChange}>
                    <CustomTab label={`Unread (${1234}) `} value='tabOne' />
                    <CustomTab label={`Read (${50}) `} value='tabTwo' />
                    <CustomTab label={`All (${50}) `} value='tabThree' />
                  </CustomTabs>
                </Box>
                <Box
                  className='fixedModal'
                  sx={
                    screenWidth >= 2500
                      ? { height: '1110px', overflowY: 'auto' }
                      : screenWidth >= 1900
                      ? { height: '850px', overflowY: 'auto' }
                      : screenWidth >= 1600
                      ? { height: '600px', overflowY: 'auto' }
                      : screenWidth >= 1400
                      ? { height: '570px', overflowY: 'auto' }
                      : screenWidth >= 1300
                      ? { height: '430px', overflowY: 'auto' }
                      : { height: '400px', overflowY: 'auto' }
                  }
                >
                  {valueTwo === 'tabOne' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'tabTwo' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'tabThree' && (
                    <>
                      {contentArray.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: '#f6f6f6',
                                  color: 'text.primary'
                                }}
                              >
                                {content.active ? (
                                  <span className='icon-info'></span>
                                ) : (
                                  <span className='icon-alarm'></span>
                                )}
                              </IconButton>
                            </Box>
                            <Box>
                              <Typography variant='subtitle2'>
                                <span
                                  className='icon-tagright'
                                  style={{
                                    marginRight: '10px'
                                  }}
                                ></span>{' '}
                                {content.title}
                              </Typography>
                              <Typography variant='body2'>{content.body}</Typography>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== contentArray.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Drawer>
      )}
    </div>
  )
}

export default NotificationDialog
