import React, { useEffect, useState } from 'react'
import { Box, Card, CardContent, Grid, Tooltip, Typography } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import InstagramIcon from '@mui/icons-material/Instagram'
import { convertDateDD, convertTime } from 'src/utils/helper'
import { SchoolTourLogs } from 'src/components/CustomDialogBox/SchoolTourLogs'
import RemarksPopup from 'src/components/CustomDialogBox/TimeLineLogs'

type BullProps = {
  count: number
}

const Bull = ({ count }: BullProps) => {
  const theme = useTheme()

  return (
    <Box
      component='span'
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '25px',
        height: '25px',
        borderRadius: '50%',
        border: `3px solid ${theme.palette.primary.dark}`,
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '15.4px',
        color: theme.palette.primary.dark,
        marginBottom: '10px'
      }}
    >
      {count}
    </Box>
  )
}

const CustomCard = styled(Card)(({ theme }) => ({
  width: '200px',
  height: '275px',
  marginBottom: '20px',
  '&.MuiPaper-outlined': {
    backgroundColor: theme.palette.customColors.primaryLightest,
    border: `1px solid ${theme.palette.primary.dark}`,
    overflow: 'unset'
  },
  '& .MuiCardContent-root:last-child': {
    paddingBottom: 0
  }
}))

const events = [
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 1,
    title: 'Enquiry Received-1',
    subtitle: 'New Admission',
    icon: <span className='icon-Instagram---2'></span>
  },
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 2,
    title: 'Enquiry Received-2',
    subtitle: 'New Admission',
    icon: <span className='icon-Instagram---2'></span>
  },
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 3,
    title: 'Enquiry Received-3 Enquiry Received-3',
    subtitle: 'New Admission New Admission',
    icon: <span className='icon-Instagram---2'></span>
  },
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 4,
    title: 'Enquiry Received-4',
    subtitle: 'New Admission',
    icon: <span className='icon-Instagram---2'></span>
  },
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 5,
    title: 'Enquiry Received-5',
    subtitle: 'New Admission',
    icon: <span className='icon-Instagram---2'></span>
  },
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 6,
    title: 'Enquiry Received-5',
    subtitle: 'New Admission',
    icon: <span className='icon-Instagram---2'></span>
  },
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 7,
    title: 'Enquiry Received-5',
    subtitle: 'New Admission',
    icon: <span className='icon-Instagram---2'></span>
  },
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 8,
    title: 'Enquiry Received-5',
    subtitle: 'New Admission',
    icon: <span className='icon-Instagram---2'></span>
  },
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 9,
    title: 'Enquiry Received-5',
    subtitle: 'New Admission',
    icon: <span className='icon-Instagram---2'></span>
  },
  {
    date: '01/05/2024',
    time: '10:30 AM',
    count: 10,
    title: 'Enquiry Received-5',
    subtitle: 'New Admission',
    icon: <span className='icon-Instagram---2'></span>
  }
]

interface TimeLineProps {
  rows?: any
}

export default function CustomTimelineUI({ rows }: TimeLineProps) {
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [open, setOpen] = React.useState(false)
  const [schoolLogs, setSchoolLogs] = React.useState([])
  const [popup, setPopup] = React.useState(false)
  const [logs, setLogs] = React.useState(null)

  const handleClose = (value: string) => {
    setOpen(false)
  }
  const handleClosePopup = (value: string) => {
    setPopup(false)
  }
  // Split events into rows of 6 items
  // const rows = []
  // for (let i = 0; i < events.length; i += 4) {
  //   rows.push(events.slice(i, i + 4))
  // }

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

  const handleSchoolVisitLogs = (schoolEvents: any) => {
    setOpen(true)
    setSchoolLogs(schoolEvents)
  }

  const handleFollowupLogs = (logs: any) => {
    setPopup(true)
    setLogs(logs)
  }

  return (
    <>
      {rows.map((row: any, rowIndex: number) => (
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
                <>
                  <Grid key={index} item xs={3} sx={{ position: 'relative' }}>
                    <CustomCard
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
                          ...(rowIndex != rows.length - 1 && { borderLeft: 'dashed 3px #4B4DD4' }),
                          left: '100px',
                          bottom: '0%',
                          zIndex: 999
                        },
                        '&::after': {
                          content: index !== row.length - 1 ? '""' : 'none',
                          position: 'absolute',
                          width: 'calc(100% - 70px)',
                          height: '0',
                          borderTop: 'dashed 3px #4B4DD4',
                          top: '23.5%',
                          right: '0px',
                          zIndex: 999
                        }
                      }}
                    >
                      <CardContent sx={{ padding: '16px 16px 0 16px' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between' // or 'start' or 'center' depending on your needs
                          }}
                        >
                          <Typography
                            variant='body2'
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                            color='customColors.mainText'
                            gutterBottom
                          >
                            {event.created_at ? convertDateDD(event.created_at) : '09-09-2024'}
                          </Typography>
                          {event?.event == 'School tour completed' ? (
                            <span
                              style={{ cursor: 'pointer' }}
                              className='icon-info-circle'
                              onClick={() => {
                                handleSchoolVisitLogs(event?.school_visit_activities)
                              }}
                            ></span>
                          ) : null}{' '}
                          {event?.event_type == 'Follow up' && event?.log_data?.remarks ? (
                            <span
                              style={{ cursor: 'pointer' }}
                              className='icon-info-circle'
                              onClick={() => {
                                handleFollowupLogs(event?.log_data?.remarks)
                              }}
                            ></span>
                          ) : null}
                        </Box>

                        {<Bull count={event.count} />}
                        <Typography
                          variant='subtitle2'
                          color='text.primary'
                          sx={{ lineHeight: '15.4px', marginBottom: '0.5rem', textTransform: 'capitalize' }}
                        >
                          {event?.event ? event?.event : 'No Data'}
                        </Typography>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                          <span className='icon-timer-1'></span>

                          <Typography
                            variant='body2'
                            sx={{
                              margin: 0,
                              lineHeight: '15.4px'
                            }}
                            color='customColors.mainText'
                            gutterBottom
                          >
                            {event.event_type ? event?.event_type : 'Sub type'}
                          </Typography>
                        </div>
                        {event?.event.includes('Enquiry reopened') && (
                          <>
                          {event?.log_data?.value && (
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, color: 'text.secondary', wordBreak: 'break-word' }}
                            >
                              Reason: {event.log_data.value}
                            </Typography>
                              )}
                            </>
                          )}
                          {event?.event.includes('Enquiry reopened') && (
                            <>
                              {event?.log_data?.reopen_reason && (
                                <Typography
                                  variant="body2"
                                  sx={{ mt: 1, color: 'text.secondary', wordBreak: 'break-word' }}
                                >
                                  Reason: {event.log_data.reopen_reason}
                                </Typography>
                              )}
                            </>
                          )}
                          {event?.log_data && event?.log_data?.registration_payment_details ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span className='icon-bank'></span>

                            <Typography
                              variant='body2'
                              sx={{
                                margin: 0,
                                lineHeight: '15.4px'
                              }}
                              color='customColors.mainText'
                              gutterBottom
                            >
                              {event?.log_data?.registration_payment_details?.mode_of_payment}
                            </Typography>
                          </div>
                        ) : null}
                        {event?.log_data && event?.log_data?.registration_payment_details ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span>₹</span>

                            <Typography
                              variant='body2'
                              sx={{
                                margin: 0,
                                lineHeight: '15.4px'
                              }}
                              color='customColors.mainText'
                              gutterBottom
                            >
                              {event?.log_data && event?.log_data?.registration_payment_details?.amount}
                            </Typography>
                          </div>
                        ) : null}
                        {/* <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}> */}
                        {event?.log_data && event?.log_data?.date ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span className='icon-calendar-2'></span>

                            <Typography
                              variant='body2'
                              sx={{
                                margin: 0,
                                lineHeight: '15.4px'
                              }}
                              color='customColors.mainText'
                              gutterBottom
                            >
                              {event?.log_data?.date}
                            </Typography>
                          </div>
                        ) : null}
                        {event?.log_data && event?.log_data?.time ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span className='icon-timer-start'></span>

                            <Typography
                              variant='body2'
                              sx={{
                                margin: 0,
                                lineHeight: '15.4px'
                              }}
                              color='customColors.mainText'
                              gutterBottom
                            >
                              {event?.log_data?.time}
                            </Typography>
                          </div>
                        ) : null}
                        {event?.event_type == 'Transfer' &&
                        event?.log_data &&
                        event?.log_data?.transferred_to_school ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <Tooltip title={event?.log_data?.transferred_to_school} arrow>
                              <Typography
                                variant='body2'
                                sx={{
                                  margin: 0,
                                  lineHeight: '15.4px'
                                }}
                                color='customColors.mainText'
                                gutterBottom
                              >
                                Transferred to: {event?.log_data?.transferred_to_school}
                              </Typography>
                            </Tooltip>
                          
                          </div>
                        ) : null}
                        <Typography
                          variant='body2'
                          sx={{
                            lineHeight: '15.4px',
                            textTransform: 'capitalize',
                            position: 'absolute',
                            bottom: 43,
                            left: 10,
                            display: 'flex',
                            gap: 1,
                            maxWidth: '60%'
                          }}
                          color='customColors.mainText'
                          gutterBottom
                        >
                          <span className='icon-user'></span>
                          {event?.created_by ? event?.created_by : 'N/A'}
                        </Typography>
                        {/* </div> */}
                        <Typography
                          variant='body2'
                          sx={{
                            lineHeight: '15.4px',
                            //textTransform: 'capitalize',
                            position: 'absolute',
                            bottom: 15,
                            left: 10
                          }}
                          color='customColors.mainText'
                          gutterBottom
                        >
                          {event?.created_at ? convertTime(event?.created_at) : '11:00 AM'}
                        </Typography>
                      </CardContent>
                    </CustomCard>
                  </Grid>
                </>
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
                <>
                  <Grid item xs={3} sx={{ position: 'relative' }}>
                    <CustomCard
                      key={index}
                      variant='outlined'
                      className={index === row.length - 1 ? 'MuiPaper-outlined last-child' : 'MuiPaper-outlined'}
                      sx={{
                        marginRight: index !== row.length - 1 ? '65px' : '65px',
                        '&::before': {
                          content: index === row.length - 1 ? '""' : 'none', // Remove the vertical line before the first card of the second row
                          position: 'absolute',
                          width: '2px',
                          height: '21px',
                          ...(rowIndex != rows.length - 1 && { borderLeft: 'dashed 3px #4B4DD4' }),
                          left: '100px',
                          bottom: '0%',
                          zIndex: 999
                        },
                        '&::after': {
                          content: index !== row.length - 1 ? '""' : 'none',
                          position: 'absolute',
                          width: 'calc(100% - 70px)',
                          height: '0',
                          borderTop: 'dashed 3px #4B4DD4',
                          top: '23.5%',
                          left:
                            screenWidth <= 1024
                              ? '-70%'
                              : screenWidth <= 1280
                              ? '-72%'
                              : screenWidth <= 1512
                              ? '-77%'
                              : screenWidth <= 1440
                              ? '-75%'
                              : screenWidth <= 1600
                              ? '-80%'
                              : screenWidth <= 1920
                              ? '-83%'
                              : '-86%',
                          zIndex: 999
                        }
                      }}
                    >
                      <CardContent sx={{ padding: '16px 16px 0 16px' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between' // or 'start' or 'center' depending on your needs
                          }}
                        >
                          <Typography
                            variant='body2'
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                            color='customColors.mainText'
                            gutterBottom
                          >
                            {event.created_at ? convertDateDD(event.created_at) : '09-09-2024'}
                          </Typography>

                          {event?.event == 'School tour completed' ? (
                            <span
                              style={{ cursor: 'pointer' }}
                              className='icon-info-circle'
                              onClick={() => {
                                handleSchoolVisitLogs(event?.school_visit_activities)
                              }}
                            ></span>
                          ) : null}
                          {event?.event_type == 'Follow up' && event?.log_data?.remarks ? (
                            <span
                              style={{ cursor: 'pointer' }}
                              className='icon-info-circle'
                              onClick={() => {
                                handleFollowupLogs(event?.log_data?.remarks)
                              }}
                            ></span>
                          ) : null}
                        </Box>
                        {<Bull count={event.count} />}
                        <Typography
                          variant='subtitle2'
                          color='text.primary'
                          sx={{ lineHeight: '15.4px', marginBottom: '0.5rem', textTransform: 'capitalize' }}
                        >
                          {event?.event ? event?.event : 'No Data'}
                        </Typography>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                          <span className='icon-timer-1'></span>

                          <Typography
                            variant='body2'
                            sx={{
                              margin: 0,
                              lineHeight: '15.4px'
                            }}
                            color='customColors.mainText'
                            gutterBottom
                          >
                            {event.event_type ? event?.event_type : 'Sub type'}
                          </Typography>
                        </div>
                        {/* Show status & message only for Enquiry Reopened */}
                        {event?.event.includes('Enquiry reopened') && (
                          <>
                            {event?.log_data?.value && (
                              <Typography
                                variant="body2"
                                sx={{ mt: 1, color: 'text.secondary', wordBreak: 'break-word' }}
                              >
                                Reason: {event.log_data.value}
                              </Typography>
                            )}
                          </>
                        )}
                        {event?.event.includes('Enquiry reopened') && (
                          <>
                            {event?.log_data?.reopen_reason && (
                              <Typography
                                variant="body2"
                                sx={{ mt: 1, color: 'text.secondary', wordBreak: 'break-word' }}
                              >
                                Reason: {event.log_data.reopen_reason}
                              </Typography>
                            )}
                          </>
                        )}

                        {event?.log_data && event?.log_data?.registration_payment_details ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span className='icon-bank'></span>

                            <Typography
                              variant='body2'
                              sx={{
                                margin: 0,
                                lineHeight: '15.4px'
                              }}
                              color='customColors.mainText'
                              gutterBottom
                            >
                              {event?.log_data?.registration_payment_details?.mode_of_payment}
                            </Typography>
                          </div>
                        ) : null}
                        {event?.log_data && event?.log_data?.registration_payment_details ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span>₹</span>

                            <Typography
                              variant='body2'
                              sx={{
                                margin: 0,
                                lineHeight: '15.4px'
                              }}
                              color='customColors.mainText'
                              gutterBottom
                            >
                              {event?.log_data?.registration_payment_details?.amount}
                            </Typography>
                          </div>
                        ) : null}
                        {event?.log_data && event?.log_data?.date ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span className='icon-calendar-2'></span>

                            <Typography
                              variant='body2'
                              sx={{
                                margin: 0,
                                lineHeight: '15.4px'
                              }}
                              color='customColors.mainText'
                              gutterBottom
                            >
                              {event?.log_data?.date}
                            </Typography>
                          </div>
                        ) : null}
                        {event?.log_data && event?.log_data?.time ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span className='icon-timer-start'></span>

                            <Typography
                              variant='body2'
                              sx={{
                                margin: 0,
                                lineHeight: '15.4px'
                              }}
                              color='customColors.mainText'
                              gutterBottom
                            >
                              {event?.log_data?.time}
                            </Typography>
                          </div>
                        ) : null}
                        {event?.event_type == 'Transfer' &&
                        event?.log_data &&
                        event?.log_data?.transferred_to_school ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <Tooltip title={event?.log_data?.transferred_to_school} arrow>
                              <Typography
                                variant='body2'
                                sx={{
                                  margin: 0,
                                  lineHeight: '15.4px'
                                }}
                                color='customColors.mainText'
                                gutterBottom
                              >
                                Transferred to: {event?.log_data?.transferred_to_school}
                              </Typography>
                            </Tooltip>
                          
                          </div>
                        ) : null}
                        <Typography
                          variant='body2'
                          sx={{
                            lineHeight: '15.4px',
                            textTransform: 'capitalize',
                            position: 'absolute',
                            bottom: 43,
                            left: 10,
                            display: 'flex',
                            gap: 1,
                            maxWidth: '60%'
                          }}
                          color='customColors.mainText'
                          gutterBottom
                        >
                          <span className='icon-user'></span>
                          {event?.created_by ? event?.created_by : 'N/A'}
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            lineHeight: '15.4px',
                            //textTransform: 'capitalize',
                            position: 'absolute',
                            bottom: 15,
                            left: 10
                          }}
                          color='customColors.mainText'
                          gutterBottom
                        >
                          {event?.created_at ? convertTime(event?.created_at) : '11:00 AM'}
                        </Typography>
                      </CardContent>
                    </CustomCard>
                  </Grid>
                </>
              ))}
            </Box>
          )}
        </Box>
      ))}
      <SchoolTourLogs open={open} onClose={handleClose} data={schoolLogs} />
      <RemarksPopup open={popup} onClose={handleClosePopup} data={logs} />
    </>
  )
}
