import React, { useEffect, useRef, useState } from 'react'
import { Box, IconButton, Typography, Drawer, Chip, Divider, Skeleton } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
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
import { postRequest } from 'src/services/apiService'
import { NOTIFICATION_LIST_TYPE } from 'src/utils/constants'
import moment from 'moment'

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
        backgroundColor: theme.palette.customColors.stepDefault,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& span': {
          color: `${theme.palette.primary.dark}`
        }
      },
      '& .MuiTypography-root': {
        fontWeight: '500',
        color: `${theme.palette.primary.dark}`,
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
  color: `${theme.palette.customColors.mainText}`,
  '&:hover': {
    boxShadow: 'none',
    borderRadius: '0px'
  },
  '&.Mui-selected': {
    backgroundColor: `${theme.palette.customColors.chipHoverBackground}`,
    color: `${theme.palette.customColors.sliderMainColor}`,
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
    color: active ? '#313030' : theme.palette.customColors.mainText,

    '& span': {
      color: active ? '#3635C9' : theme.palette.customColors.mainText
    }
  },
  '& .MuiTypography-root.MuiTypography-subtitle2': {
    fontSize: '14px',
    fontWeight: active ? 500 : 400,
    lineHeight: '15.4px',
    textTransform: 'capitalize',
    color: active ? '#313030' : theme.palette.customColors.mainText,
    marginTop: '5px',
    display: 'flex',
    alignItems: 'center',
    '& span': {
      color: active ? '#3635C9' : theme.palette.customColors.mainText,
      fontSize: '14px !important'
    }
  },
  '& .MuiTypography-root.MuiTypography-body2': {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '17.4px',
    textTransform: 'capitalize',
    color: active ? '#313030' : theme.palette.customColors.mainText,
    marginTop: '5px'
  },
  '& .MuiTypography-root.MuiTypography-caption': {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '13.2px',
    textTransform: 'capitalize',
    color: theme.palette.customColors.mainText
  }
}))

type SchoolTour = {
  openDrawer: boolean
  handleClose?: () => void
  title?: string
  userType?: number
  userId?: number
}

interface ContentItem {
  _id: string
  title: string
  body: string
  timestamp: string
  active: boolean
}

const NotificationDialog = ({ openDrawer, handleClose, title, userId, userType }: SchoolTour) => {
  const theme = useTheme()
  const [selectedOptions, setSelectedOptions] = useState<string>('Today')
  const [value, setValue] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)
  const [valueTwo, setValueTwo] = useState('unread')
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [expanded, setExpanded] = useState<boolean[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false) // Loading state
  const [visibleItems, setVisibleItems] = useState<ContentItem[]>([]) // For lazy loading
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [ITEMS_PER_LOAD, setITEMS_PER_LOAD] = useState(10)
  const [isLoadingOnScroll, setIsLoadingOnScroll] = useState<boolean>(false) // Loading state

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  const handleTabTwoChange = (event: React.SyntheticEvent, newValue: string) => {
    setValueTwo(newValue)
  }

  //Content of array
  //   const visibleItems: ContentItem[] = Array.from({ length: 11 }).map((_, index) => ({
  //     title: `You are assigned new enquiry ${index + 1}`,
  //     body: `Lorem ipsum dolor sit amet consectetur. faucibus libero sit vitae tellus. Pellentesque${index + 1}. `,
  //     timestamp: `${index + 1} hours ago`,
  //     active: index % 2 === 0
  //   }))

  //   const ITEMS_PER_LOAD = 10;

  const fetchData = (page = 1, limit: number = ITEMS_PER_LOAD) => {
    setIsLoading(true)
    postRequest({
      url: '/notification-to-user/by-user',
      data: {
        user_id: userId,
        user_type: userType,
        type:
          valueTwo +
          (selectedOptions
            ? `-${
                selectedOptions === 'This Week' ? 'this_week' : selectedOptions === 'Today' ? 'today' : selectedOptions
              }`
            : ''),
        page: page,
        limit: limit
      },
      serviceURL: 'communication'
    })
      .then(res => {
        const data = res?.data?.data
        setTotalEntries(res?.data?.totalCount)
        // Check if data exists and has valid entries
        if (data && Array.isArray(data) && data.length > 0) {
          setVisibleItems(
            data.map((item: any) => {
              const { subject, content } = Object?.values(item?.mode as Record<any, any>)[0] || {
                subject: '',
                content: ''
              }

              return {
                _id: item._id,
                title: subject || 'No Title',
                body: content || 'No Content',
                timestamp: `${moment.utc(item?.created_at).local().fromNow().replace(/^in /, '')}`,
                active: false
              }
            })
          )
        } else {
          // If no data is received, clear visibleItems
          setVisibleItems([])
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        setVisibleItems([])
      })
      .finally(() => {
        setIsLoading(false)
        setIsLoadingOnScroll(false)
      })
  }

  const markAsRead = (id: Array<string>) => {
    // setIsLoading(true);
    postRequest({
      url: '/mark-as-read',
      data: {
        notificationIds: id,
        userId: userId,
        portalId: 0
      },
      serviceURL: 'communication'
    }).then(res => {
      // fetchData(1, ITEMS_PER_LOAD);
    })
    //   .finally(() => setIsLoading(false));
  }

  console.log(visibleItems, 'visibleItems=========================')

  useEffect(() => {
    setVisibleItems([])
    setTotalEntries(0)
    setITEMS_PER_LOAD(10)
    fetchData(1, ITEMS_PER_LOAD)
  }, [valueTwo, selectedOptions, openDrawer])

  useEffect(() => {
    // setVisibleItems([]);
    setIsLoadingOnScroll(true)
    fetchData(1, ITEMS_PER_LOAD)
  }, [ITEMS_PER_LOAD])

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  //Handle Clickable Chips Handler

  const chipsLabel = ['Today', 'This Week']

  const handleToggle = (option: string) => {
    // setFilter(option)
    setSelectedOptions(option)
  }

  const handleExpandClick = (index: number) => {
    setExpanded(prevState => {
      const newState = [...prevState]
      newState[index] = !newState[index]

      return newState
    })
  }

  const truncateText = (text: string, isExpanded: boolean | undefined) => {
    if (isExpanded || text?.length <= 50) return text

    return `${text?.substring(0, 50)}...`
  }

  const loadMoreItems = () => {
    // setIsLoading(true);
    ITEMS_PER_LOAD < totalEntries && setITEMS_PER_LOAD(ITEMS_PER_LOAD + 10)
    // fetchData()
    // setTimeout(() => {
    //   const currentItemCount = visibleItems.length;

    //   if (currentItemCount < visibleItems.length) {
    //     const nextItems = visibleItems.slice(
    //       currentItemCount,
    //       currentItemCount + ITEMS_PER_LOAD
    //     );
    //     setVisibleItems((prev) => [...prev, ...nextItems]);
    //   }

    //   setIsLoading(false);
    // }, 10000); // Simulate network delay
  }

  // const handleScroll = () => {
  //   loadMoreItems()
  // }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current

    // Load more items when the user is near the bottom
    if (scrollTop + clientHeight >= scrollHeight - 10 && !isLoading) {
      loadMoreItems()
    }
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
          {/* <Box sx={{ mb: 3 }}>
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
          </Box> */}

          {value === 0 && (
            <Box>
              <Box
                sx={{
                  height: '55px',
                  borderRadius: '8px',
                  padding: '6px',
                  background: theme.palette.customColors.stepDefault
                }}
              >
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
                    <CustomTab label={`Unread `} value='unread' />
                    <CustomTab label={`Read  `} value='read' />
                    <CustomTab label={`All  `} value='all' />
                  </CustomTabs>
                </Box>
                <Box
                  className='fixedModal'
                  ref={scrollContainerRef}
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
                  onScroll={handleScroll}
                >
                  {valueTwo === 'unread' && (
                    <>
                      {/* {!visibleItems?.length && (
                        <Box
                          sx={{
                            minHeight: "30%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-around",
                          }}
                        >
                          {isLoading ? "Loading!!" : "All Caught up!!"}
                        </Box>
                      )} */}
                      {visibleItems.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{
                              mt: 4,
                              mb: 4,
                              display: 'flex',
                              justifyContent: 'flex-start',
                              alignItems: 'center'
                            }}
                            onClick={() => content._id && markAsRead([content._id])}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start'
                                }}
                              >
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                      {!visibleItems?.length || isLoadingOnScroll ? (
                        <Box
                          sx={{
                            minHeight: '30%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-around'
                          }}
                        >
                          {isLoadingOnScroll || isLoading ? 'Loading...' : 'All Caught up!!'}
                        </Box>
                      ) : (
                        ''
                      )}
                      {isLoading &&
                        Array.from({ length: 5 }).map((_, index) => (
                          <Box
                            key={`skeleton-${index}`}
                            sx={{
                              mt: 4,
                              mb: 4,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Skeleton variant='circular' width={56} height={56} animation='pulse' sx={{ mr: 3 }} />
                            <Box sx={{ flex: 1 }}>
                              <Skeleton variant='text' width='60%' animation='wave' />
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'flex-start'
                                }}
                              >
                                <Skeleton variant='text' width='95%' animation='wave' />
                                <Skeleton variant='text' width='5%' animation='wave' />
                              </Box>
                              <Skeleton variant='text' width='60%' animation='wave' />
                            </Box>
                          </Box>
                        ))}
                    </>
                  )}
                  {valueTwo === 'read' && (
                    <>
                      {visibleItems.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{
                              mt: 4,
                              mb: 4,
                              display: 'flex',
                              justifyContent: 'flex-start',
                              alignItems: 'center'
                            }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start'
                                }}
                              >
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                      {!visibleItems?.length || isLoadingOnScroll ? (
                        <Box
                          sx={{
                            minHeight: '30%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-around'
                          }}
                        >
                          {isLoadingOnScroll ? 'Loading...' : 'All Caught up!!'}
                        </Box>
                      ) : (
                        ''
                      )}
                    </>
                  )}
                  {valueTwo === 'all' && (
                    <>
                      {visibleItems.map((content, index) => (
                        <>
                          <StyledBox
                            active={content.active}
                            sx={{
                              mt: 4,
                              mb: 4,
                              display: 'flex',
                              justifyContent: 'flex-start',
                              alignItems: 'center'
                            }}
                          >
                            <Box sx={{ mr: 3 }}>
                              <IconButton
                                sx={{
                                  width: '56px',
                                  height: '56px',
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start'
                                }}
                              >
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                      {!visibleItems?.length || isLoadingOnScroll ? (
                        <Box
                          sx={{
                            minHeight: '30%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-around'
                          }}
                        >
                          {isLoadingOnScroll || isLoading ? 'Loading...' : 'All Caught up!!'}
                        </Box>
                      ) : (
                        ''
                      )}
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          )}
          {/* {value === 1 && (
            <Box>
              <Box
                sx={{
                  height: '55px',
                  borderRadius: '8px',
                  padding: '6px',
                  background: theme.palette.customColors.stepDefault
                }}
              >
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
                    <CustomTab label={`Unread (${1234}) `} value='unread' />
                    <CustomTab label={`Read (${50}) `} value='read' />
                    <CustomTab label={`All (${50}) `} value='all' />
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
                  {valueTwo === 'unread' && (
                    <>
                      {visibleItems.map((content, index) => (
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
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'read' && (
                    <>
                      {visibleItems.map((content, index) => (
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
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'all' && (
                    <>
                      {visibleItems.map((content, index) => (
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
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
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
              <Box
                sx={{
                  height: '55px',
                  borderRadius: '8px',
                  padding: '6px',
                  background: theme.palette.customColors.stepDefault
                }}
              >
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
                    <CustomTab label={`Unread (${1234}) `} value='unread' />
                    <CustomTab label={`Read (${50}) `} value='read' />
                    <CustomTab label={`All (${50}) `} value='all' />
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
                  {valueTwo === 'unread' && (
                    <>
                      {visibleItems.map((content, index) => (
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
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'read' && (
                    <>
                      {visibleItems.map((content, index) => (
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
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'all' && (
                    <>
                      {visibleItems.map((content, index) => (
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
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
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
              <Box
                sx={{
                  height: '55px',
                  borderRadius: '8px',
                  padding: '6px',
                  background: theme.palette.customColors.stepDefault
                }}
              >
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
                    <CustomTab label={`Unread (${1234}) `} value='unread' />
                    <CustomTab label={`Read (${50}) `} value='read' />
                    <CustomTab label={`All (${50}) `} value='all' />
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
                  {valueTwo === 'unread' && (
                    <>
                      {visibleItems.map((content, index) => (
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
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'read' && (
                    <>
                      {visibleItems.map((content, index) => (
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
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                  {valueTwo === 'all' && (
                    <>
                      {visibleItems.map((content, index) => (
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
                                  backgroundColor: theme.palette.customColors.stepDefault,
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant='body2'>{truncateText(content.body, expanded[index])}</Typography>
                                <span
                                  className={expanded[index] ? 'icon-arrow-up-2' : 'icon-arrow-down-1'}
                                  onClick={() => handleExpandClick(index)}
                                  style={{ marginLeft: 0, cursor: 'pointer' }}
                                ></span>
                              </Box>
                              <Typography variant='caption'>{content.timestamp}</Typography>
                            </Box>
                          </StyledBox>
                          {index !== visibleItems.length - 1 && <Divider sx={{ borderColor: '#e6e6e6' }} />}
                        </>
                      ))}
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          )} */}
        </Drawer>
      )}
    </div>
  )
}

export default NotificationDialog
