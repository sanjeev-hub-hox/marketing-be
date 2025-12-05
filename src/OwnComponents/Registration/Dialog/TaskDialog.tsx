import React, { useEffect, useState } from 'react'
import { Box, IconButton, Typography, Drawer, Chip, Divider } from '@mui/material'
import { styled } from '@mui/material/styles'
import FatherSVGIcon from '../Image/father.svg'
import MotherSVGIcon from '../Image/mother.svg'
import Image from 'next/image'
import { fontSize, letterSpacing, lineHeight, textAlign } from '@mui/system'
import { getRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SpinnerBackdrop from 'src/@core/components/backdrop-spinner'
import { useRouter } from 'next/router'
import { formatDate } from 'src/utils/helper'

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
const StyledChipSuccess = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorSuccess': {
    border: `1px solid ${theme.palette.success.main} !important`,
    borderRadius: '8px',
    height: '24px',
    padding: '6px 4px',
    backgroundColor: `#82BA3D1A !important`,
    color: `${theme.palette.text.primary} !important `,
    '& span': {
      fontSize: '10px !important',
      lineHeight: '11px',
      letterSpacing: '0.25px',
      textAlign: 'center'
    }
  }
}))

type SchoolTour = {
  openDrawer: boolean
  handleClose?: () => void
  title?: string
}

const TaskDialog = ({ openDrawer, handleClose, title }: SchoolTour) => {
  const [selectedOptions, setSelectedOptions] = useState<string>('Today')
  const [taskList, setTaskList] = useState<any>([])
  const { setGlobalState } = useGlobalContext()
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const router = useRouter()

  //Handle Clickable Chips Handler

  const chipsLabel = [
    { name: 'Today', value: 'Today' },
    { name: 'Overdue', value: 'Overdue' },
    { name: 'Upcoming', value: 'Upcoming' }
  ]

  const handleToggle = (option: string) => {
    // setFilter(option)
    setTaskList([]);
    setPage(1)
    setHasMore(true); 
    setSelectedOptions(option)
  }

  const getTaskList = async () => {
   if (!hasMore) return
    setLoading(true)
    setGlobalState({ isLoading: true })

    const params = {
      url: `marketing/my-task/list`,
      params: {
        page,
        size: 10,
        type: selectedOptions
      }
    }

    const response = await getRequest(params)
    if (response?.status) {
      const newTasks = response?.data[0]?.data
      if (newTasks.length > 0) {
        setTaskList((prevTasks:any) => [...prevTasks, ...newTasks]);
      }else {
        setHasMore(false); // No more tasks to load
      }
      // setTaskList(newTasks)
    }

    setLoading(false)
    setGlobalState({ isLoading: false })
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    console.log('FGFG>>', scrollTop, scrollHeight, clientHeight, Math.round(scrollHeight - scrollTop))

    if (Math.round(scrollHeight - scrollTop) === clientHeight && !loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  useEffect(() => {
    getTaskList()
  }, [selectedOptions,page])

  return (
    <div>
      {openDrawer && (
        <Drawer
          anchor='right'
          open={openDrawer}
          onClose={handleClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: '630px',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 24,
              borderRadius: '10px 0 0 10px',
              zIndex: 1500,
              padding: '15px',

              overflow: `hidden`
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
          <Box sx={{ height: '55px', borderRadius: '8px', padding: '6px', background: '#F5F5F7' }}>
            <Box>
              {chipsLabel.map((label, index) => (
                <StyledChipProps
                  key={index}
                  label={label?.name}
                  onClick={() => handleToggle(label?.value)}
                  className='taskDialogChip'
                  color={selectedOptions?.includes(label?.value) ? 'primary' : 'default'}
                  variant='filled'
                  sx={{
                    mr: 4
                  }}
                />
              ))}
            </Box>
          </Box>
          <Box
            className='fixedModal'
            sx={{ height: 'calc(100vh - 110px)', overflowY: 'auto', padding: '16px' }}
             onScroll={handleScroll}
          >
            {taskList && taskList?.length ? (
              taskList?.map((val: any, index: number) => {
                return (
                  <Box
                    key={index}
                    sx={{ mt: 8, mb: 5, border: '1px solid #E0E0E0', padding: '16px', borderRadius: '10px' }}
                    onClick={() => {
                      router.push(`/enquiries/view/${val?._id}`)
                      if (handleClose) {
                        handleClose()
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'unset' }}>
                      <Box>
                        <IconButton
                          sx={{
                            mr: 3,
                            width: '56px',
                            height: '56px',
                            backgroundColor: '#f6f6f6',
                            color: 'text.primary'
                          }}
                        >
                          <span className='icon-call'></span>
                        </IconButton>
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                          <span className='icon-monitor' style={{ marginRight: '8px' }}></span>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Typography
                              variant='body2'
                              color={'text.primary'}
                              sx={{ mr: 2, lineHeight: '15.4px', textTransform: 'capitalize' }}
                            >
                              {`${val?.student_first_name} ${val?.student_last_name}`}
                            </Typography>
                            <Typography
                              variant='caption'
                              color={'customColors.mainText'}
                              sx={{ lineHeight: '13.4px', textTransform: 'capitalize' }}
                            >
                              <span>|</span> {val?.enquiry_number}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ mt: 1, mb: 1, lineHeight: '13.4px', textTransform: 'capitalize' }}
                          >
                            {`${val?.enquiry_type} : ${val?.school}`}
                          </Typography>
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ mb: 1, lineHeight: '13.4px', textTransform: 'capitalize' }}
                          >
                            {`Parent Global ID - ${val?.enquirer_global_id} `}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                          <Image
                            style={{ marginRight: '8px' }}
                            src={MotherSVGIcon}
                            alt='Mother Icon'
                            width={30}
                            height={35}
                          />
                          <Typography
                            variant='caption'
                            color={'customColors.mainText'}
                            sx={{ lineHeight: '13.4px', textTransform: 'capitalize' }}
                          >
                            {val?.enquirer_mobile}, <span>{val?.enquirer_email}</span>
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <StyledChipSuccess
                          color='success'
                          label='Registration - Open'
                          variant='filled'
                          sx={{ mr: 4 }}
                        />
                      </Box>
                    </Box>
                    <Divider sx={{ mt: 5, mb: 5 }} />
                    <Box sx={{ mt: 5, mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          variant='caption'
                          color={'customColors.mainText'}
                          sx={{ mb: 1, lineHeight: '13.4px', textTransform: 'capitalize' }}
                        >
                          Enquiry Date : <span>{formatDate(val?.enquiry_date)}</span>
                        </Typography>
                        <Typography
                          variant='caption'
                          color={'customColors.mainText'}
                          sx={{ mb: 1, lineHeight: '13.4px', textTransform: 'capitalize' }}
                        >
                          Follow Up Date & Time : <span>{val?.follow_up_date}</span>
                        </Typography>
                        <Typography
                          variant='caption'
                          color={'customColors.mainText'}
                          sx={{ lineHeight: '13.4px', textTransform: 'capitalize' }}
                        >
                          {val?.remarks ? (
                            <>
                              {' '}
                              Remarks : <span>{val?.remarks}</span>{' '}
                            </>
                          ) : null}
                        </Typography>
                      </Box>
                      <Box>
                        <span
                          className='icon-call'
                          style={{ color: '#3F41D1', borderWidth: '1.5px', marginRight: '10px' }}
                        ></span>
                        <span
                          className='icon-sms'
                          style={{ color: '#3F41D1', borderWidth: '1.5px', marginRight: '10px' }}
                        ></span>
                        <span className='icon-note-1' style={{ color: '#3F41D1', borderWidth: '1.5px' }}></span>
                      </Box>
                    </Box>
                  </Box>
                )
              })
            ) : (
              <Typography sx={{ mr: 2, mt: 15, fontWeight: 400, color: 'text.secondary' }} align='center'>
                Data Not Found
              </Typography>
            )}
          </Box>
          {loading ? (
            <Typography sx={{ mr: 2, fontWeight: 400, color: 'text.secondary' }} align='center'>
              Loading ...
            </Typography>
          ) : null}
        </Drawer>
      )}
    </div>
  )
}

export default TaskDialog
