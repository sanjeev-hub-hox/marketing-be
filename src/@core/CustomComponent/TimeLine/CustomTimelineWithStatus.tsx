import React, { useEffect, useState } from 'react'
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import InstagramIcon from '@mui/icons-material/Instagram'
import CustomChip from 'src/@core/components/mui/chip'
import { ThemeColor } from 'src/@core/layouts/types'
import { Theme } from '@mui/system'
import moment from 'moment'
import FallbackSpinner from 'src/@core/components/spinner'

interface StatusObj {
  [key: string]: {
    title: string
    color: string
    labelColor: string
  }
}

type BullProps = {
  count: any
  cardType: string
}

interface CardType {
  cardType: string
  theme: Theme
}

const Bull = ({ count, cardType }: BullProps) => {
  const theme = useTheme()

  return (
    <Box
      component='span'
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        ...(cardType === 'disableCard'
          ? {
              border: `3px solid ${theme.palette.customColors.text3}`,
              color: theme.palette.customColors.mainText
            }
          : {
              border: `3px solid ${theme.palette.primary.dark}`,
              color: theme.palette.primary.dark
            }),
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '15.4px'
      }}
    >
      {count}
    </Box>
  )
}

const CustomCard = styled(Card, {
  shouldForwardProp: prop => prop !== 'cardType'
})<{ cardType: string }>(({ theme, cardType }) => ({
  width: '200px',
  height: '220px',
  marginBottom: '20px',
  borderRadius: '16px',
  '&.MuiPaper-outlined': {
    backgroundColor:
      cardType === 'subCard'
        ? theme.palette.customColors.surface1
        : cardType === 'disableCard'
        ? theme.palette.customColors.chipTonalBackground
        : theme.palette.customColors.primaryLightest,
    border: cardType === 'disableCard' ? 0 : `1px solid ${theme.palette.primary.dark}`,
    overflow: 'unset'
  },
  '& .MuiCardContent-root:last-child': {
    paddingBottom: 0
  }
}))

export default function CustomTimelineWithStatus({ events }: any) {
  const theme = useTheme()
  // const [events, setEvents] = useState<any>([]);
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)

  // useEffect(() => {
  //   setEvents(
  //     events.map((item: any) => ({
  //       date: moment(item?.created_at).format("DD-MM-YYYY"),
  //       status: null,
  //       title: "Test",
  //       subTitle: "test",
  //       time: "10:30 AM",
  //       count: "L1",
  //       cardType: "card",
  //     }))
  //   );
  // }, [data]);
  // console.log("events data", data, events);

  const StatusObj: StatusObj = {
    approved: {
      title: 'Approved',
      color: theme.palette.success.light,
      labelColor: theme.palette.success.main
    },
    rejected: {
      title: 'Rejected',
      color: theme.palette.customColors.chipWarningContainer,
      labelColor: theme.palette.error.main
    },
    onhold: {
      title: 'On Hold',
      color: theme.palette.customColors.chipPendingContainer,
      labelColor: theme.palette.customColors.chipPendingText
    },
    sendback: {
      title: 'Send Back',
      color: theme.palette.customColors.approvalPrimaryChipBG,
      labelColor: theme.palette.customColors.approvalPrimaryChipText
    }
  }
  const events_ = [
    {
      date: '01/05/2024',
      status: null,
      title: 'Principal Review',
      subTitle: 'No Comments',

      // Name: 'Anjali Sood',
      time: '10:30 AM',
      count: 'L1',
      cardType: 'card'
    },
    {
      date: '01/05/2024',
      status: null,
      title: 'Cluster principal',
      subTitle: 'No Comments',

      // Name: 'Anjali Sood',
      time: '10:30 AM',
      count: 'L2',
      cardType: 'card'
    },

    {
      date: '01/05/2024',
      status: StatusObj[3],
      title: 'Cluster principal',
      subTitle: 'Attach Birth Certificate and share again',

      // Name: 'Anjali Sood',
      time: '10:30 AM',
      count: 'L3',
      cardType: 'card'
    },
    {
      date: '01/05/2024',
      status: StatusObj[2],
      title: 'Cluster principal',
      subTitle: 'No Comments',

      // Name: 'Anjali Sood',
      time: '10:30 AM',
      count: 'L3.1',
      cardType: 'subCard'
    },
    {
      date: '01/05/2024',
      status: null,
      title: 'Cluster principal',
      subTitle: 'No Comments',

      // Name: 'Anjali Sood',
      time: '10:30 AM',
      count: 'L4',
      cardType: 'disableCard'
    },
    {
      date: '01/05/2024',
      status: null,
      title: 'Cluster principal',
      subTitle: 'No Comments',

      // Name: 'Anjali Sood',
      time: '10:30 AM',
      count: 'L5',
      cardType: 'disableCard'
    }
  ]

  // const eventsWithPosition = events.map((event: any, index: any) => ({
  //   ...event,
  //   count: index + 1 // Position starts from 1
  // }))

  // Split events into rows of 4 items
  const rows = []
  for (let i = 0; i < events?.length; i += 4) {
    rows.push(events?.slice(i, i + 4))
  }

  //Handler for screen width
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  return (
    <>
      {rows.map((row, rowIndex) => (
        <Box key={rowIndex}>
          {rowIndex % 2 === 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row',
                position: 'relative'
              }}
            >
              {row.map((event: any, index: number) => (
                <Grid key={index} item xs={3} sx={{ position: 'relative' }}>
                  <CustomCard
                    cardType={event.cardType}
                    variant='outlined'
                    className={index === row.length - 1 ? 'MuiPaper-outlined last-child' : 'MuiPaper-outlined'}
                    sx={{
                      marginRight: index !== row.length - 1 ? '65px' : '0',
                      '&::before': {
                        content:
                          rowIndex % 2 !== 0 && index === 0
                            ? '""'
                            : rowIndex % 2 === 0 && index === row.length - 1
                            ? '""'
                            : 'none',
                        position: 'absolute',
                        width: '2px',
                        height: '21px',
                        ...(rowIndex != rows.length - 1 && {
                          borderLeft:
                            event.cardType === 'disableCard'
                              ? `dashed 3px ${theme.palette.customColors.text3}`
                              : `dashed 3px ${theme.palette.primary.dark}`
                        }),
                        left: '100px',
                        bottom: '0%',
                        zIndex: 999
                      },
                      '&::after': {
                        content: index !== row.length - 1 ? '""' : 'none',
                        position: 'absolute',
                        width: 'calc(100% - 70px)',
                        height: '0',
                        ...(event.cardType === 'disableCard'
                          ? {
                              borderTop: `dashed 3px ${theme.palette.customColors.text3}`
                            }
                          : {
                              borderTop: `dashed 3px ${theme.palette.primary.dark}`
                            }),
                        top: '31%',
                        right: '0px',
                        zIndex: 999
                      }
                    }}
                  >
                    <CardContent sx={{ padding: '16px 10px 0 10px' }}>
                      <div
                        style={{
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          height: '35px'
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{ lineHeight: '15.4' }}
                          color='customColors.mainText'
                          gutterBottom
                        >
                          {event.date}
                        </Typography>
                        {event.status !== null && (
                          <Chip
                            variant='filled'
                            sx={{
                              backgroundColor: `${event.status.color} !important`,
                              color: `${event.status.labelColor} !important`,
                              height: '34px',
                              borderRadius: '100px !important',
                              border: '0px !important',
                              '& .MuiChip-label': {
                                fontSize: '12px',
                                lineHeight: '16px',
                                textTransform: 'capitalize'
                              }
                            }}
                            label={event.status.title}
                          />
                        )}
                      </div>

                      {<Bull count={event?.count} cardType={event.cardType} />}
                      <Typography
                        variant='subtitle2'
                        color={event.cardType === 'disableCard' ? 'customColors.mainText' : 'text.primary'}
                        sx={{
                          mt: 2,
                          mb: 2,
                          lineHeight: '15.4px',
                          marginBottom: '0.5rem'
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='customColors.mainText'
                        sx={{ lineHeight: '15.4px', marginBottom: '0.5rem' }}
                      >
                        {event.subTitle}
                      </Typography>

                      {/* <Typography
                        variant='body2'
                        sx={{ lineHeight: '15.4px' }}
                        color='customColors.mainText'
                        gutterBottom
                      >
                        <span className='icon-user-square'></span> {event.Name}
                      </Typography> */}

                      <Typography
                        variant='body2'
                        sx={{
                          lineHeight: '15.4px',
                          position: 'absolute',
                          bottom: 15,
                          left: 10
                        }}
                        color='customColors.mainText'
                        gutterBottom
                      >
                        {event.time}
                      </Typography>
                    </CardContent>
                  </CustomCard>
                </Grid>
              ))}
            </Box>
          )}
          {rowIndex % 2 !== 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row-reverse',
                position: 'relative'
              }}
            >
              {row.map((event: any, index: number) => (
                <Grid key={index} item xs={3} sx={{ position: 'relative' }}>
                  <CustomCard
                    cardType={event.cardType}
                    variant='outlined'
                    className={index === row.length - 1 ? 'MuiPaper-outlined last-child' : 'MuiPaper-outlined'}
                    sx={{
                      marginRight: index !== row.length - 1 ? '65px' : '65px',
                      '&::before': {
                        content: index === row.length - 1 ? '""' : 'none', // Remove the vertical line before the first card of the second row
                        position: 'absolute',
                        width: '2px',
                        height: '21px',
                        ...(rowIndex != rows.length - 1 && {
                          borderLeft:
                            event.cardType === 'disableCard'
                              ? `dashed 3px ${theme.palette.customColors.text3}`
                              : `dashed 3px ${theme.palette.primary.dark}`
                        }),
                        left: '100px',
                        bottom: '0%',
                        zIndex: 999
                      },
                      '&::after': {
                        content: index !== row.length - 1 ? '""' : 'none',
                        position: 'absolute',
                        width: 'calc(100% - 70px)',
                        height: '0',
                        ...(event.cardType === 'disableCard'
                          ? {
                              borderTop: `dashed 3px ${theme.palette.customColors.text3}`
                            }
                          : {
                              borderTop: `dashed 3px ${theme.palette.primary.dark}`
                            }),
                        top: '31%',
                        left: screenWidth <= 1024 ? '-70%' : screenWidth >= 1920 ? '-80%' : '-70%',
                        zIndex: 999
                      }
                    }}
                  >
                    <CardContent sx={{ padding: '16px 10px 0 10px' }}>
                      <div
                        style={{
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          height: '35px'
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{ lineHeight: '15.4' }}
                          color='customColors.mainText'
                          gutterBottom
                        >
                          {event.date}
                        </Typography>
                        {event.status !== null && (
                          <Chip
                            variant='filled'
                            sx={{
                              backgroundColor: `${event.status.color} !important`,
                              color: `${event.status.labelColor} !important`,
                              height: '34px',
                              borderRadius: '100px !important',
                              border: '0px !important',
                              '& .MuiChip-label': {
                                fontSize: '12px',
                                lineHeight: '16px',
                                textTransform: 'capitalize'
                              }
                            }}
                            label={event.status.title}
                          />
                        )}
                      </div>

                      {<Bull count={event.count} cardType={event.cardType} />}
                      <Typography
                        variant='subtitle2'
                        color={event.cardType === 'disableCard' ? 'customColors.mainText' : 'text.primary'}
                        sx={{
                          mt: 2,
                          mb: 2,
                          lineHeight: '15.4px',
                          marginBottom: '0.5rem'
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='customColors.mainText'
                        sx={{ lineHeight: '15.4px', marginBottom: '0.5rem' }}
                      >
                        {event.subTitle}
                      </Typography>

                      {/* <Typography
                        variant='body2'
                        sx={{ lineHeight: '15.4px' }}
                        color='customColors.mainText'
                        gutterBottom
                      >
                        <span className='icon-user-square'></span> {event.Name}
                      </Typography> */}

                      <Typography
                        variant='body2'
                        sx={{
                          lineHeight: '15.4px',
                          position: 'absolute',
                          bottom: 15,
                          left: 10
                        }}
                        color='customColors.mainText'
                        gutterBottom
                      >
                        {event.time}
                      </Typography>
                    </CardContent>
                  </CustomCard>
                </Grid>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </>
  )
}
