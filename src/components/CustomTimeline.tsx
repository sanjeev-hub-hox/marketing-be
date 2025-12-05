import React, { useEffect, useState } from 'react'
import { Box, Card, CardContent, Divider, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import InstagramIcon from '@mui/icons-material/Instagram'
import { getRequest } from 'src/services/apiService'
import Grid from '@mui/material/Grid'
import { convertDateDD, convertTime } from 'src/utils/helper'
import CustomTimelineUI from 'src/@core/CustomComponent/TimeLine/CustomTimelineUI'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { Can } from './Can'
import { PERMISSIONS } from 'src/utils/constants'

interface TimeLineProps {
  enquiryID: any
}

export default function CustomTimeline({ enquiryID }: TimeLineProps) {
  const [timeLineData, setTimeLineData] = useState<any>([])
  const [events, setEvents] = useState<any>(null)
  const [eventSubType, setEventSubType] = useState<any>(null)
  const [filters, setFilters] = useState<any>([])
  const [eventSubTypeList, setEventSubTypeList] = useState<any>(null)
  const { setGlobalState } = useGlobalContext()
  const getTimeLineData = async () => {
    const params = {
      url: `marketing/enquiry/${enquiryID}/timeline`
    }

    const response = await getRequest(params)
    if (response.status) {
      setTimeLineData(response.data.timeline)
      setFilters(response.data.filters)
      if (response.data.filters) {
        //setEvents(response.data.filters?.eventType[0])
        // getEventSubType(response.data.filters?.eventType[0])
      }
    }
  }

  const getTimeLineFilterData = async () => {
    const params = {
      url: `marketing/enquiry/${enquiryID}/timeline`,
      params: {
        ...(events && events != 'all' && { eventType: events }),
        ...(eventSubType && eventSubType != 'all' && { eventSubType: eventSubType })
      }
    }

    const response = await getRequest(params)
    if (response.status) {
      setTimeLineData(response.data.timeline)
      
      
    }
  }

  useEffect(() => {
    
    if (enquiryID) {
      getTimeLineData()
    }
  }, [enquiryID])

  useEffect(() => {
    getTimeLineFilterData()
  }, [events, eventSubType])

  // Split events into rows of 6 items

  function splitArrayIntoChunks(array: any, chunkSize: number) {
    const results = []
    for (let i = 0; i < array.length; i += chunkSize) {
      results.push(array.slice(i, i + chunkSize))
    }

    return results
  }
  const eventsWithPosition = timeLineData.map((event: any, index: any) => ({
    ...event,
    count: index + 1 // Position starts from 1
  }))
  
  const rows = splitArrayIntoChunks(eventsWithPosition, 4)
// alert(JSON.stringify(rows))
  // const rows = []
  // if (timeLineData && timeLineData.length) {
  //   for (let i = 0; i < timeLineData.length; i += 5) {
  //     rows.push(timeLineData.slice(i, i + 5))
  //   }
  // }

  console.log('rows', rows)
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  const getEventSubType = async (val: any) => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/timeline/event-sub-types`,
      params: {
        ...(val && val != 'all' && { eventType: val }),
      }
    }

    const response = await getRequest(params)
    if (response?.status) {
      setEventSubTypeList(response?.data)
      // if (response?.data && response?.data?.length) {
      //   setEventSubType(response?.data[0])
      // }
      setEventSubType(null)
    }
    setGlobalState({ isLoading: false })
  }

  const handleEvent = (event: any) => {
    console.log('event.target.value', event.target.value)

    setEvents(event.target.value as string)
    getEventSubType(event.target.value)
  }
  const handleEventSubType = (event: any) => {
    console.log('event.target.value', event.target.value)

    setEventSubType(event.target.value as string)
  }

  return (
    <>
      <Grid item container xs={12}>
        <Grid item xs={12} sx={{ mt: 5, mb: 5 }}>
          <Divider />
        </Grid>
        <Grid item container xs={12} sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
          <Grid item xs={6}>
            <Typography variant='body1' sx={{ lineHeight: '24px' }}>
              Timeline
            </Typography>
          </Grid>
          <Can pagePermission={[PERMISSIONS?.TIMELINE_FILTER]} action={'HIDE'}>
            <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              {filters?.eventType && filters?.eventType.length ? (
                <FormControl fullWidth sx={{ mr: 5 }}>
                  <InputLabel id='demo-simple-select-outlined-label'>Select Event</InputLabel>
                  <Select
                    IconComponent={DownArrow}
                    label='Select Event'
                    value={events}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleEvent}
                  >
                    <MenuItem value={'all'}>{'All'}</MenuItem>
                    {filters?.eventType && filters?.eventType.length
                      ? filters?.eventType.map((val: any, index: any) => {
                          return (
                            <MenuItem key={index} value={val}>
                              {val}
                            </MenuItem>
                          )
                        })
                      : null}
                  </Select>
                </FormControl>
              ) : null}
              {eventSubTypeList && eventSubTypeList.length ? (
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>Select Event Sub Type</InputLabel>
                  <Select
                    IconComponent={DownArrow}
                    label='Select Event Sub Type'
                    value={eventSubType}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleEventSubType}
                  >
                    <MenuItem value={'all'}>{'All'}</MenuItem>

                    {eventSubTypeList && eventSubTypeList.length
                      ? eventSubTypeList.map((val: any, index: any) => {
                          return (
                            <MenuItem key={index} value={val}>
                              {val}
                            </MenuItem>
                          )
                        })
                      : null}
                  </Select>
                </FormControl>
              ) : (
                <FormControl fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>Select Event Sub Type</InputLabel>
                  <Select
                    IconComponent={DownArrow}
                    label='Select Event Sub Type'
                    disabled
                    value={eventSubType}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                  >
                    <MenuItem value={''}>{'All'}</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Grid>{' '}
          </Can>
        </Grid>
      </Grid>
      <Grid container xs={12}>
        <Grid item xs={12} sx={{ mt: 9, mb: 3, transform: 'translateX(4%)' }}>
          <CustomTimelineUI rows={rows} />
        </Grid>
      </Grid>
    </>
  )
}
