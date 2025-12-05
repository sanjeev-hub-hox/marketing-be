import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  styled,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import { Box } from '@mui/system'
import React, { useEffect, useState } from 'react'
// import CustomTimelineWithStatus from "src/@core/CustomComponent/Timeline/CustomTimelineWithStatus";
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SendBackDialog from './Dialog/SendBackDialog'
import ApproveDialog from './Dialog/ApproveDialog'
import RejectDialog from './Dialog/RejectDialog'
import OnHoldDialog from './Dialog/OnHoldDialog'
import CustomTimelineWithStatus from 'src/@core/CustomComponent/TimeLine/CustomTimelineWithStatus'
// import CalenderDialog from '../Marketing/Dialog/CalenderDialog'
// import TaskDialog from '../Marketing/Dialog/TaskDialog'
// import NotificationDialog from '../Marketing/Dialog/NotificationDialog'
import { useRouter } from 'next/router'
import { getRequest, postRequest } from 'src/services/apiService'
import moment from 'moment'
import { LoaderIcon } from 'react-hot-toast'
// import FallbackSpinner from "src/@core/components/spinner";
import ActionMenu from './Statusselector'
import { formatDataUrlConfig, workflowRedirectionUrl } from './constant'
import FallbackSpinner from 'src/@core/components/backdrop-spinner'

interface StatusObj {
  [key: string]: {
    title: string
    color: string
    labelColor: string
  }
}

//Chips Styled
const StyledChipProps = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorPrimary': {
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: `${theme.palette.customColors.customChipBackgroundColor}`,
    color: `${theme.palette.customColors.customChipColor}`,
    width: '170px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  '&.MuiChip-colorDefault': {
    border: `1px solid ${theme.palette.grey[300]} !important`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: 'none !important',
    color: `${theme.palette.customColors.mainText} `,
    width: '170px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}))

const TruncatedTypography = styled(Typography)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '200px',
  [theme.breakpoints.down('sm')]: {
    // Adjust truncation for small screens
    width: '80px' // Adjust width as necessary
  }
}))

function ApprovalWorkflow({ selectedWorkflowsList = [], userInfo }: { selectedWorkflowsList: any[]; userInfo: any }) {
  const router = useRouter()
  const { setPagePaths } = useGlobalContext()
  const theme = useTheme()
  const [selectedApprovalOtions, setSelectedApprovalOtions] = useState<string>(
    selectedWorkflowsList.length ? 'selected' : 'Action Required'
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [sendDialog, setSendDialog] = React.useState<string | null>(null)
  const [approveDialog, setApproveDialog] = React.useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = React.useState<string | null>(null)
  const [onHoldDialog, setOnHoldDialog] = React.useState<string | null>(null)
  const [calenderDialog, setCalenderDialog] = useState<boolean>(false)
  const [taskDialog, setTaskDialog] = useState<boolean>(false)
  const [notificationDialog, setNotificationDialog] = useState<boolean>(false)
  const [expandedDetails, setExpandedDetails] = useState<any>([])
  const [statusCount, setStatusCount] = useState<any>({})
  const [urlConfig, setUrlConfig] = useState({})
  const open = Boolean(anchorEl)
  const [allRequestArray, setAllRequestArray] = useState<any>([])
  const [pendingRequestArray, setPendingRequestArray] = useState<any>([])
  const [selectedRequestArray, setSelectedRequestArray] = useState<any>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleProfileToggle = (option: string) => {
    // setFilter(option)
    setSelectedApprovalOtions(option)
    if (option === 'Action Required') {
      fetchPendingActivities()
    }
    if (option === 'All Requests') {
      fetchAllActivites()
    }
    if (option === 'selected') {
      fetchSelectedActivites()
    }
  }

  const handleExpandClick = (id: string) => {
    setExpandedId(prevId => (prevId === id ? null : id))
    fetchExpandedActivityLogs(id)
  }

  const StatusObj = {
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
    },
    pending: {
      title: 'Pending',
      color: theme.palette.customColors.approvalPrimaryChipBG,
      labelColor: theme.palette.customColors.approvalPrimaryChipText
    }
  }

  const approvalChipLabel = [
    {
      label: 'Action Required',
      icon: <span className='icon-document-forward'></span>,
      count: statusCount?.pending_activities_count || ''
    },
    {
      label: 'All Requests',
      icon: <span className='icon-document-copy'></span>,
      count: statusCount?.total_activities_count || ''
    }
  ]

  const getStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Pending',
          color: theme.palette.customColors.approvalPrimaryChipBG,
          labelColor: theme.palette.customColors.approvalPrimaryChipText
        }
        break
      case 'approved':
        return {
          title: 'Approved',
          color: theme.palette.success.light,
          labelColor: theme.palette.success.main
        }
        break
      case 'rejected':
        return {
          title: 'Rejected',
          color: theme.palette.customColors.chipWarningContainer,
          labelColor: theme.palette.error.main
        }
        break
      case 'onhold':
        return {
          title: 'On Hold',
          color: theme.palette.customColors.chipPendingContainer,
          labelColor: theme.palette.customColors.chipPendingText
        }
        break
      case 'sendback':
        return {
          title: 'Send Back',
          color: theme.palette.customColors.approvalPrimaryChipBG,
          labelColor: theme.palette.customColors.approvalPrimaryChipText
        }
        break
      case 'completed':
        return {
          title: 'Completed',
          color: theme.palette.success.main,
          labelColor: theme.palette.customColors.avatarBg
        }
        break
      default:
        break
    }
  }

  //Passing Breadcrumbs
  // useEffect(() => {
  //   setPagePaths([
  //     {
  //       title: "Approval Workflow",
  //       path: "/approval-workflow",
  //     },
  //   ]);
  // }, []);

  const handleAction = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleActionClose = () => {
    setAnchorEl(null)
  }
  const handleSendBack = (workflowLogId: string) => {
    setSendDialog(workflowLogId)
  }
  const handleCloseSendDialog = () => {
    setSendDialog('')
    setAnchorEl(null)
  }
  const handleApprove = (workflowLogId: string) => {
    setApproveDialog(workflowLogId)
  }
  const handleCloseApprove = () => {
    setApproveDialog(null)
    setAnchorEl(null)
    // fetchPendingActivities();
    // fetchStatusCount();
  }
  const handleReject = (workflowLogId: string) => {
    setRejectDialog(workflowLogId)
  }
  const handleCloseReject = () => {
    setRejectDialog(null)
    setAnchorEl(null)
    // fetchPendingActivities();
    // fetchStatusCount();
  }
  const handleOnHold = (workflowLogId: string) => {
    setOnHoldDialog(workflowLogId)
  }
  const handleCloseOnHold = () => {
    setOnHoldDialog(null)
    setAnchorEl(null)
    // fetchPendingActivities();
    // fetchStatusCount();
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

  // fetch expanded workflow activity logs
  const fetchExpandedActivityLogs = (workflowLogId: string) => {
    setExpandedDetails([])
    getRequest({
      url: `/workflow/workflow-activity-logs/${workflowLogId}`,
      serviceURL: 'admin'
    }).then(res => {
      console.log(res?.data, '========<')
      setExpandedDetails(res.data)
    })
  }

  const fetchPendingActivities = () => {
    setIsLoading(true)
    getRequest({
      url: `/workflow/activity-workflow/${userInfo?.userInfo?.id}?paginate=false&type=pending`,
      serviceURL: 'admin'
    })
      .then(res => {
        // console.log(res?.data?.activities, "res");
        setPendingRequestArray(res?.data?.activities)
      })
      .finally(() => setIsLoading(false))
  }

  const fetchAllActivites = () => {
    setIsLoading(true)
    getRequest({
      url: `/workflow/activity-workflow/${userInfo?.userInfo?.id}?paginate=false`,
      serviceURL: 'admin'
    })
      .then(res => {
        // console.log(res?.data?.activities, "res");
        setAllRequestArray(res?.data?.activities)
      })
      .finally(() => setIsLoading(false))
  }

  const fetchSelectedActivites = () => {
    setIsLoading(true)
    postRequest({
      url: `/workflow/bulk-details`,
      serviceURL: 'admin',
      data: {
        workflowIds: selectedWorkflowsList
      }
    })
      .then(res => {
        console.log(res, 'res')
        setSelectedRequestArray(res?.data)
      })
      .finally(() => setIsLoading(false))
  }

  const fetchStatusCount = () => {
    getRequest({
      url: `/workflow/status-count/${userInfo?.userInfo?.id}`,
      serviceURL: 'admin'
    }).then(res => {
      console.log(res?.data, 'res')
      setStatusCount(res?.data?.[0])
    })
  }

  useEffect(() => {
    if (!anchorEl) {
      fetchAllActivites()
      fetchStatusCount()
      fetchPendingActivities()
      setExpandedDetails([])
      setExpandedId(null)
    }
  }, [sendDialog, approveDialog, onHoldDialog, rejectDialog, userInfo])

  useEffect(() => {
    getRequest({
      url: `/workflow/url-config`,
      serviceURL: 'admin'
    }).then(res => {
      setUrlConfig(formatDataUrlConfig(res?.data))
    })
  }, [])

  useEffect(() => {
    selectedWorkflowsList.length && !selectedRequestArray.length ? fetchSelectedActivites() : ''
  }, [selectedWorkflowsList])

  // if (isLoading) {
  //   return <FallbackSpinner />;
  // }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'nowrap'
        }}
      >
        <Box sx={{ width: '100%', height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ mt: 2, mb: 2 }}>
              {selectedWorkflowsList?.length ? (
                <Tooltip title='Selected Workflows'>
                  <StyledChipProps
                    label={'Selected'}
                    icon={<span className='icon-eye'></span>}
                    color={selectedApprovalOtions?.includes('selected') ? 'primary' : 'default'}
                    variant='filled'
                    sx={{
                      mr: 4,
                      mb: 4,
                      '& .MuiChip-icon': {
                        fontSize: '18px !important'
                      }
                    }}
                    onClick={() => handleProfileToggle('selected')}
                  />
                </Tooltip>
              ) : (
                ''
              )}

              {approvalChipLabel.map(({ label, icon, count }, index) => (
                <Tooltip key={index} title={`${count} ${label}`}>
                  <StyledChipProps
                    label={`${count} ${label}`}
                    icon={icon}
                    color={selectedApprovalOtions?.includes(label) ? 'primary' : 'default'}
                    variant='filled'
                    sx={{
                      mr: 4,
                      mb: 4,
                      '& .MuiChip-icon': {
                        fontSize: '18px !important'
                      }
                    }}
                    onClick={() => handleProfileToggle(label)}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>

          {selectedApprovalOtions === 'selected' && (
            <Box className='fixedModal' sx={{ overflowY: 'auto', height: 'calc(100vh - 180px)' }}>
              {selectedRequestArray &&
                selectedRequestArray.map((info: any, index: number) => {
                  const currentLevel = info?.levels.find((level_: any) => level_.id === info?.current_level)
                  const statusList = currentLevel ? currentLevel.status_list : []

                  return (
                    <>
                      <Card
                        key={index}
                        sx={{
                          mb: 8,
                          '&.MuiCard-root.MuiPaper-elevation': {
                            boxShadow: '2px 2px 10px 0px #4C4E6426',
                            padding: '20px',
                            borderRadius: '10px'
                          }
                        }}
                      >
                        <CardContent
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Box>
                            <Tooltip title={info.activityInstruction}>
                              <TruncatedTypography
                                variant='h6'
                                color={'text.primary'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '22px'
                                }}
                              >
                                {info.activity_name}
                              </TruncatedTypography>
                            </Tooltip>
                            <Tooltip title={info.description_data}>
                              <TruncatedTypography
                                variant='body2'
                                color={'customColors.mainText'}
                                sx={{
                                  marginTop: '13px',
                                  textTransform: 'capitalize',
                                  lineHeight: '15.4px'
                                }}
                              >
                                {info.description_data}
                              </TruncatedTypography>
                            </Tooltip>
                          </Box>
                          <Box>
                            <Tooltip title='Links'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                Links
                              </TruncatedTypography>
                            </Tooltip>
                            <Tooltip
                              title={info?.redirection_link ? info?.redirection_link :  workflowRedirectionUrl(
                                info?.module_name,
                                info?.module_id,
                                urlConfig,
                                info?.reference_id
                              )}
                            >
                              <a
                                href={info?.redirection_link ? info?.redirection_link :  workflowRedirectionUrl(
                                  info?.module_name,
                                  info?.module_id,
                                  urlConfig,
                                  info?.reference_id
                                )}
                                style={{
                                  cursor: 'pointer',
                                  textDecoration: 'none'
                                }}
                                target='_blank'
                              >
                                <TruncatedTypography
                                  variant='subtitle2'
                                  color={'primary.dark'}
                                  sx={{
                                    marginTop: '13px',
                                    // textTransform: "capitalize",
                                    lineHeight: '15.4px'
                                  }}
                                >
                                  {info?.redirection_link ? info?.redirection_link :  workflowRedirectionUrl(
                                    info?.module_name,
                                    info?.module_id,
                                    urlConfig,
                                    info?.reference_id
                                  )}
                                </TruncatedTypography>
                              </a>
                            </Tooltip>
                          </Box>
                          <Box>
                            <Tooltip title='Attachments'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                Attachments
                              </TruncatedTypography>
                            </Tooltip>
                            {info?.attachment_links?.length ? (
                              info?.attachment_links.map((link: string, idx: number) => (
                                <Tooltip title={`Attachment ${idx + 1}`} key={idx}>
                                  <a
                                    href={link}
                                    style={{
                                      cursor: 'pointer',
                                      textDecoration: 'none'
                                    }}
                                    target='_blank'
                                  >
                                    <TruncatedTypography
                                      variant='subtitle2'
                                      color={'primary.dark'}
                                      sx={{
                                        marginTop: '13px',
                                        textTransform: 'capitalize',
                                        lineHeight: '15.4px'
                                      }}
                                    >
                                      {link || 'N/A'}
                                    </TruncatedTypography>
                                  </a>
                                </Tooltip>
                              ))
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  mt: 2,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  textTransform: 'capitalize',
                                  lineHeight: '15.4px'
                                }}
                              >
                                N/A
                              </Box>
                            )}
                          </Box>
                          <Box>
                            <Tooltip title='Date and Time'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                TAT
                              </TruncatedTypography>
                            </Tooltip>

                            <Tooltip title={info.dateTime}>
                              <TruncatedTypography
                                variant='subtitle2'
                                color={'customColors.mainText'}
                                sx={{
                                  marginTop: '13px',
                                  textTransform: 'capitalize',
                                  lineHeight: '15.4px'
                                }}
                              >
                                {info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.tat_expiry
                                  ? moment(info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.tat_expiry)
                                      .utcOffset('UTC+05:30')
                                      .format('DD/MM/YYYY HH:MM A')
                                  : 'N/A'}
                              </TruncatedTypography>
                            </Tooltip>
                          </Box>
                          <Box>
                            <Tooltip title='Current active level of Workflow'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                Current Level
                              </TruncatedTypography>
                            </Tooltip>

                            <Box
                              sx={{
                                display: 'flex',
                                mt: 2,
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              {info?.isLevelZero
                                ? 'L0'
                                : 'L' + (info?.levels?.findIndex((lvl: any) => lvl.id === info?.current_level) + 1) ||
                                  ''}
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              mt: 2,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Chip
                              variant='filled'
                              sx={{
                                backgroundColor: `${
                                  getStatus(
                                    info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                      ?.status_id === 1
                                      ? 'approved'
                                      : info?.levels?.find((lvl: any) => lvl.id === info?.current_level)
                                          ?.selected_status?.status_id === 3
                                      ? 'rejected'
                                      : 'pending'
                                  )?.color
                                } !important`,
                                color: `${
                                  getStatus(
                                    info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                      ?.status_id === 1
                                      ? 'approved'
                                      : info?.levels?.find((lvl: any) => lvl.id === info?.current_level)
                                          ?.selected_status?.status_id === 3
                                      ? 'rejected'
                                      : 'pending'
                                  )?.labelColor
                                } !important`,
                                height: '40px',

                                padding: '8px',
                                borderRadius: '100px !important',
                                border: '0px !important',
                                '& .MuiChip-label': {
                                  fontSize: '14px',
                                  lineHeight: '15.4px',
                                  fontWeight: '500',
                                  textTransform: 'capitalize'
                                }
                              }}
                              label={`
                                ${
                                  info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                    ?.status_id === 2 ||
                                  info?.isLevelZero ||
                                  !info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                    ? 'pending'
                                    : info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                        ?.name
                                }`}
                            />

                            <Divider
                              orientation='vertical'
                              sx={{
                                ml: 5,
                                borderColor: theme.palette.customColors.text4,
                                height: '50px'
                              }}
                            />

                            <IconButton
                              disableFocusRipple
                              disableRipple
                              color='primary'
                              sx={{
                                ml: 5,
                                background: theme.palette.customColors.primaryLightest,
                                boxShadow: '2px 2px 10px 0px #4C4E6426',
                                '& span': {
                                  color: theme.palette.primary.dark
                                }
                              }}
                              onClick={() => handleExpandClick(info._id)}
                            >
                              {expandedId === info._id ? (
                                <span className='icon-arrow-down-1'></span>
                              ) : (
                                <span className='icon-arrow-right-3'></span>
                              )}
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                      {expandedId === info._id && (
                        <Grid container xs={12} spacing={5}>
                          <Grid item xs={12} sx={{ transform: 'translateX(3.9%)' }}>
                            {!expandedDetails?.length ? (
                              <Box
                                sx={{
                                  height: '200px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}
                              >
                                <CircularProgress size={40} sx={{ color: theme.palette.primary.dark }} />
                              </Box>
                            ) : (
                              <CustomTimelineWithStatus
                                events={expandedDetails?.map((item: any) => ({
                                  date: moment(item?.created_at).format('DD-MM-YYYY'),
                                  status:
                                    item?.type === 'approve'
                                      ? StatusObj.approved
                                      : // : item?.current_level_details
                                      //     ?.selected_status?.status_id === 2
                                      // ? {
                                      //     ...StatusObj.pending,
                                      //     title:
                                      //       item?.current_level_details
                                      //         ?.selected_status?.name,
                                      //   }
                                      item?.type === 'reject'
                                      ? StatusObj.rejected
                                      : item?.type === 'send_back'
                                      ? StatusObj.sendback
                                      : item?.type === 'onhold'
                                      ? StatusObj.onhold
                                      : null,

                                  title:
                                    item?.type === 'create'
                                      ? 'Raised by- ' + item?.created_by_user?.full_name
                                      : item?.created_by_user?.full_name || 'N/A',
                                  subTitle: item?.comment_reasons?.comment || 'No Comments',
                                  time: moment(item?.created_at).format('HH:mm'), // Corrected from "HH:MM" to "HH:mm"
                                  count: item?.current_level == 'L0' ? 'L0' : item?.current_level_count,
                                  cardType: 'card'
                                }))}
                              />
                            )}
                          </Grid>
                        </Grid>
                      )}
                    </>
                  )
                })}
            </Box>
          )}
          {selectedApprovalOtions === 'All Requests' && (
            <Box className='fixedModal' sx={{ overflowY: 'auto', height: 'calc(100vh - 180px)' }}>
              {allRequestArray &&
                allRequestArray.map((info: any, index: number) => {
                  const currentLevel = info?.levels.find((level_: any) => level_.id === info?.current_level)
                  const statusList = currentLevel ? currentLevel.status_list : []

                  return (
                    <>
                      <Card
                        key={index}
                        sx={{
                          mb: 8,
                          '&.MuiCard-root.MuiPaper-elevation': {
                            boxShadow: '2px 2px 10px 0px #4C4E6426',
                            padding: '20px',
                            borderRadius: '10px'
                          }
                        }}
                      >
                        <CardContent
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Box>
                            <Tooltip title={info.activityInstruction}>
                              <TruncatedTypography
                                variant='h6'
                                color={'text.primary'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '22px'
                                }}
                              >
                                {info.activity_name}
                              </TruncatedTypography>
                            </Tooltip>
                            <Tooltip title={info.description_data}>
                              <TruncatedTypography
                                variant='body2'
                                color={'customColors.mainText'}
                                sx={{
                                  marginTop: '13px',
                                  textTransform: 'capitalize',
                                  lineHeight: '15.4px'
                                }}
                              >
                                {info.description_data}
                              </TruncatedTypography>
                            </Tooltip>
                          </Box>
                          <Box>
                            <Tooltip title='Links'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                Links
                              </TruncatedTypography>
                            </Tooltip>
                            <Tooltip
                              title={info?.redirection_link ? info?.redirection_link :  workflowRedirectionUrl(
                                info?.module_name,
                                info?.module_id,
                                urlConfig,
                                info?.reference_id
                              )}
                            >
                              <a
                                href={info?.redirection_link ? info?.redirection_link :  workflowRedirectionUrl(
                                  info?.module_name,
                                  info?.module_id,
                                  urlConfig,
                                  info?.reference_id
                                )}
                                style={{
                                  cursor: 'pointer',
                                  textDecoration: 'none'
                                }}
                                target='_blank'
                              >
                                <TruncatedTypography
                                  variant='subtitle2'
                                  color={'primary.dark'}
                                  sx={{
                                    marginTop: '13px',
                                    // textTransform: "capitalize",
                                    lineHeight: '15.4px'
                                  }}
                                >
                                  {info?.redirection_link ? info?.redirection_link :  workflowRedirectionUrl(
                                    info?.module_name,
                                    info?.module_id,
                                    urlConfig,
                                    info?.reference_id
                                  )}
                                </TruncatedTypography>
                              </a>
                            </Tooltip>
                          </Box>
                          <Box>
                            <Tooltip title='Attachments'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                Attachments
                              </TruncatedTypography>
                            </Tooltip>
                            {info?.attachment_links?.length ? (
                              info?.attachment_links.map((link: string, idx: number) => (
                                <Tooltip title={`Attachment ${idx + 1}`} key={idx}>
                                  <a
                                    href={link}
                                    style={{
                                      cursor: 'pointer',
                                      textDecoration: 'none'
                                    }}
                                    target='_blank'
                                  >
                                    <TruncatedTypography
                                      variant='subtitle2'
                                      color={'primary.dark'}
                                      sx={{
                                        marginTop: '13px',
                                        textTransform: 'capitalize',
                                        lineHeight: '15.4px'
                                      }}
                                    >
                                      {link || 'N/A'}
                                    </TruncatedTypography>
                                  </a>
                                </Tooltip>
                              ))
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  mt: 2,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  textTransform: 'capitalize',
                                  lineHeight: '15.4px'
                                }}
                              >
                                N/A
                              </Box>
                            )}
                          </Box>
                          <Box>
                            <Tooltip title='Date and Time'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                TAT
                              </TruncatedTypography>
                            </Tooltip>

                            <Tooltip title={info.dateTime}>
                              <TruncatedTypography
                                variant='subtitle2'
                                color={'customColors.mainText'}
                                sx={{
                                  marginTop: '13px',
                                  textTransform: 'capitalize',
                                  lineHeight: '15.4px'
                                }}
                              >
                                {info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.tat_expiry
                                  ? moment(info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.tat_expiry)
                                      .utcOffset('UTC+05:30')
                                      .format('DD/MM/YYYY HH:MM A')
                                  : 'N/A'}
                              </TruncatedTypography>
                            </Tooltip>
                          </Box>
                          <Box>
                            <Tooltip title='Current active level of Workflow'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                Current Level
                              </TruncatedTypography>
                            </Tooltip>

                            <Box
                              sx={{
                                display: 'flex',
                                mt: 2,
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              {info?.isLevelZero
                                ? 'L0'
                                : 'L' + (info?.levels?.findIndex((lvl: any) => lvl.id === info?.current_level) + 1) ||
                                  ''}
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              mt: 2,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            {info?.current_status !== 'completed' &&
                            info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.order <=
                              info?.levels?.find((lvl: any) => Number(lvl.assign_to[0]) === userInfo?.userInfo?.id)
                                ?.order ? (
                              <ActionMenu
                                onSendBack={() => handleSendBack(info?._id)}
                                onApprove={() =>
                                  handleApprove(info?._id + '|' + statusList.find((i: any) => i.status == 1).id)
                                }
                                onReject={() =>
                                  handleReject(
                                    info?._id +
                                      '|' +
                                      statusList.find((i: any) => i.status == 3).id +
                                      '|' +
                                      info?.reasons
                                  )
                                }
                                onHold={() =>
                                  handleOnHold(info?._id + '|' + statusList.find((i: any) => i.status == 2).id)
                                }
                                statusList={
                                  info?.isLevelZero && info?.created_by === userInfo?.userInfo?.id
                                    ? statusList?.filter((app: any) => app.status == 1)
                                    : statusList
                                }
                              />
                            ) : (
                              <Chip
                                variant='filled'
                                sx={{
                                  backgroundColor: `${
                                    getStatus(
                                      info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                        ?.status_id === 1
                                        ? 'approved'
                                        : info?.levels?.find((lvl: any) => lvl.id === info?.current_level)
                                            ?.selected_status?.status_id === 3
                                        ? 'rejected'
                                        : 'pending'
                                    )?.color
                                  } !important`,
                                  color: `${
                                    getStatus(
                                      info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                        ?.status_id === 1
                                        ? 'approved'
                                        : info?.levels?.find((lvl: any) => lvl.id === info?.current_level)
                                            ?.selected_status?.status_id === 3
                                        ? 'rejected'
                                        : 'pending'
                                    )?.labelColor
                                  } !important`,
                                  height: '40px',

                                  padding: '8px',
                                  borderRadius: '100px !important',
                                  border: '0px !important',
                                  '& .MuiChip-label': {
                                    fontSize: '14px',
                                    lineHeight: '15.4px',
                                    fontWeight: '500',
                                    textTransform: 'capitalize'
                                  }
                                }}
                                label={`
                                ${
                                  info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                    ?.status_id === 2 ||
                                  info?.isLevelZero ||
                                  !info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                    ? 'pending'
                                    : info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.selected_status
                                        ?.name
                                }`}
                              />
                            )}

                            <Divider
                              orientation='vertical'
                              sx={{
                                ml: 5,
                                borderColor: theme.palette.customColors.text4,
                                height: '50px'
                              }}
                            />

                            <IconButton
                              disableFocusRipple
                              disableRipple
                              color='primary'
                              sx={{
                                ml: 5,
                                background: theme.palette.customColors.primaryLightest,
                                boxShadow: '2px 2px 10px 0px #4C4E6426',
                                '& span': {
                                  color: theme.palette.primary.dark
                                }
                              }}
                              onClick={() => handleExpandClick(info._id)}
                            >
                              {expandedId === info._id ? (
                                <span className='icon-arrow-down-1'></span>
                              ) : (
                                <span className='icon-arrow-right-3'></span>
                              )}
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                      {expandedId === info._id && (
                        <Grid container xs={12} spacing={5}>
                          <Grid item xs={12} sx={{ transform: 'translateX(3.9%)' }}>
                            {!expandedDetails?.length ? (
                              <Box
                                sx={{
                                  height: '200px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}
                              >
                                <CircularProgress size={40} sx={{ color: theme.palette.primary.dark }} />
                              </Box>
                            ) : (
                              <CustomTimelineWithStatus
                                events={expandedDetails?.map((item: any) => ({
                                  date: moment(item?.created_at).format('DD-MM-YYYY'),
                                  status:
                                    item?.type === 'approve'
                                      ? StatusObj.approved
                                      : // : item?.current_level_details
                                      //     ?.selected_status?.status_id === 2
                                      // ? {
                                      //     ...StatusObj.pending,
                                      //     title:
                                      //       item?.current_level_details
                                      //         ?.selected_status?.name,
                                      //   }
                                      item?.type === 'reject'
                                      ? StatusObj.rejected
                                      : item?.type === 'send_back'
                                      ? StatusObj.sendback
                                      : item?.type === 'onhold'
                                      ? StatusObj.onhold
                                      : null,

                                  title:
                                    item?.type === 'create'
                                      ? 'Raised by- ' + item?.created_by_user?.full_name
                                      : item?.created_by_user?.full_name || 'N/A',
                                  subTitle: item?.comment_reasons?.comment || 'No Comments',
                                  time: moment(item?.created_at).format('HH:mm'), // Corrected from "HH:MM" to "HH:mm"
                                  count: item?.current_level == 'L0' ? 'L0' : item?.current_level_count,
                                  cardType: 'card'
                                }))}
                              />
                            )}
                          </Grid>
                        </Grid>
                      )}
                    </>
                  )
                })}
            </Box>
          )}
          {selectedApprovalOtions === 'Action Required' && (
            <Box className='fixedModal' sx={{ overflowY: 'auto', height: 'calc(100vh - 180px)' }}>
              {pendingRequestArray &&
                pendingRequestArray.map((info: any, index: number) => {
                  const currentLevel = info?.levels?.find((level_: any) => level_.id === info?.current_level)
                  const statusList = currentLevel ? currentLevel.status_list : []

                  return (
                    <>
                      <Card
                        key={index}
                        sx={{
                          mb: 8,
                          '&.MuiCard-root.MuiPaper-elevation': {
                            boxShadow: '2px 2px 10px 0px #4C4E6426',
                            padding: '20px',
                            borderRadius: '10px'
                          }
                        }}
                      >
                        <CardContent
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Box>
                            <Tooltip title={info.title}>
                              <TruncatedTypography
                                variant='h6'
                                color={'text.primary'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '22px'
                                }}
                              >
                                {info.activity_name}
                              </TruncatedTypography>
                            </Tooltip>
                            <Tooltip title={info.description_data}>
                              <TruncatedTypography
                                variant='body2'
                                color={'customColors.mainText'}
                                sx={{
                                  marginTop: '13px',
                                  textTransform: 'capitalize',
                                  lineHeight: '15.4px'
                                }}
                              >
                                {info.description_data}
                              </TruncatedTypography>
                            </Tooltip>
                          </Box>
                          <Box>
                            <Tooltip title='Links'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                Links
                              </TruncatedTypography>
                            </Tooltip>
                            <Tooltip
                              title={info?.redirection_link ? info?.redirection_link :  workflowRedirectionUrl(
                                info?.module_name,
                                info?.module_id,
                                urlConfig,
                                info?.reference_id
                              )}
                            >
                              <a
                                href={info?.redirection_link ? info?.redirection_link :  workflowRedirectionUrl(
                                  info?.module_name,
                                  info?.module_id,
                                  urlConfig,
                                  info?.reference_id
                                )}
                                style={{
                                  cursor: 'pointer',
                                  textDecoration: 'none'
                                }}
                                target='_blank'
                              >
                                <TruncatedTypography
                                  variant='subtitle2'
                                  color={'primary.dark'}
                                  sx={{
                                    marginTop: '13px',
                                    // textTransform: "capitalize",
                                    lineHeight: '15.4px'
                                  }}
                                >
                                  {info?.redirection_link ? info?.redirection_link :  workflowRedirectionUrl(
                                    info?.module_name,
                                    info?.module_id,
                                    urlConfig,
                                    info?.reference_id
                                  )}
                                </TruncatedTypography>
                              </a>
                            </Tooltip>
                          </Box>
                          <Box>
                            <Tooltip title='Attachments'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                Attachments
                              </TruncatedTypography>
                            </Tooltip>
                            {info?.attachment_links?.length ? (
                              info?.attachment_links.map((link: string, idx: number) => (
                                <Tooltip title={`Attachment ${idx + 1}`} key={idx}>
                                  <a
                                    href={link}
                                    style={{
                                      cursor: 'pointer',
                                      textDecoration: 'none'
                                    }}
                                    target='_blank'
                                  >
                                    <TruncatedTypography
                                      variant='subtitle2'
                                      color={'primary.dark'}
                                      sx={{
                                        marginTop: '13px',
                                        textTransform: 'capitalize',
                                        lineHeight: '15.4px'
                                      }}
                                    >
                                      {link}
                                    </TruncatedTypography>
                                  </a>
                                </Tooltip>
                              ))
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  mt: 2,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  textTransform: 'capitalize',
                                  lineHeight: '15.4px'
                                }}
                              >
                                N/A
                              </Box>
                            )}
                          </Box>
                          <Box>
                            <Tooltip title='Date and Time'>
                              <TruncatedTypography
                                variant='caption'
                                color={'customColors.text3'}
                                sx={{
                                  textTransform: 'capitalize',
                                  lineHeight: '13.2px'
                                }}
                              >
                                TAT
                              </TruncatedTypography>
                            </Tooltip>

                            <Tooltip title={info.dateTime}>
                              <TruncatedTypography
                                variant='subtitle2'
                                color={'customColors.mainText'}
                                sx={{
                                  marginTop: '13px',
                                  textTransform: 'capitalize',
                                  lineHeight: '15.4px'
                                }}
                              >
                                {info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.tat_expiry
                                  ? moment(info?.levels?.find((lvl: any) => lvl.id === info?.current_level)?.tat_expiry)
                                      .utcOffset('UTC+05:30')
                                      .format('DD/MM/YYYY HH:MM A')
                                  : 'N/A'}
                              </TruncatedTypography>
                            </Tooltip>
                          </Box>
                          <Box
                            sx={{
                              mt: 2,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            {info.status !== null &&
                            !info.levels
                              ?.find((i_: any) => i_?.id === info?.current_level)
                              ?.assign_to?.includes(userInfo?.userInfo?.id) &&
                            info?.isLevelZero &&
                            info?.created_by !== userInfo?.userInfo?.id ? (
                              <Chip
                                variant='filled'
                                sx={{
                                  backgroundColor: `${getStatus(info?.current_status)?.color} !important`,
                                  color: `${getStatus(info?.current_status)?.labelColor} !important`,
                                  height: '40px',

                                  padding: '8px',
                                  borderRadius: '100px !important',
                                  border: '0px !important',
                                  '& .MuiChip-label': {
                                    fontSize: '14px',
                                    lineHeight: '15.4px',
                                    fontWeight: '500',
                                    textTransform: 'capitalize'
                                  }
                                }}
                                label={info?.current_status}
                              />
                            ) : (
                              <ActionMenu
                                onSendBack={() => handleSendBack(info?._id)}
                                onApprove={() =>
                                  handleApprove(info?._id + '|' + statusList.find((i: any) => i.status == 1).id)
                                }
                                onReject={() =>
                                  handleReject(
                                    info?._id +
                                      '|' +
                                      statusList.find((i: any) => i.status == 3).id +
                                      '|' +
                                      info?.reasons
                                  )
                                }
                                onHold={() =>
                                  handleOnHold(info?._id + '|' + statusList.find((i: any) => i.status == 2).id)
                                }
                                statusList={
                                  info?.isLevelZero && info?.created_by === userInfo?.userInfo?.id
                                    ? statusList?.filter((app: any) => app.status == 1)
                                    : statusList
                                }
                              />
                            )}

                            <Divider
                              orientation='vertical'
                              sx={{
                                ml: 5,
                                borderColor: theme.palette.customColors.text4,
                                height: '50px'
                              }}
                            />

                            <IconButton
                              disableFocusRipple
                              disableRipple
                              color='primary'
                              sx={{
                                ml: 5,
                                background: theme.palette.customColors.primaryLightest,
                                boxShadow: '2px 2px 10px 0px #4C4E6426',
                                '& span': {
                                  color: theme.palette.primary.dark
                                }
                              }}
                              onClick={() => handleExpandClick(info._id)}
                            >
                              {expandedId === info._id ? (
                                <span className='icon-arrow-down-1'></span>
                              ) : (
                                <span className='icon-arrow-right-3'></span>
                              )}
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                      {expandedId === info._id && (
                        <Grid container xs={12} spacing={5}>
                          <Grid item xs={12} sx={{ transform: 'translateX(3.9%)' }}>
                            {!expandedDetails?.length ? (
                              <Box
                                sx={{
                                  height: '200px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}
                              >
                                <CircularProgress size={40} sx={{ color: theme.palette.primary.dark }} />
                              </Box>
                            ) : (
                              <CustomTimelineWithStatus
                                events={expandedDetails?.map((item: any) => ({
                                  date: moment(item?.created_at).format('DD-MM-YYYY'),
                                  status:
                                    item?.type === 'approve'
                                      ? StatusObj.approved
                                      : // : item?.current_level_details
                                      //     ?.selected_status?.status_id === 2
                                      // ? {
                                      //     ...StatusObj.pending,
                                      //     title:
                                      //       item?.current_level_details
                                      //         ?.selected_status?.name,
                                      //   }
                                      item?.type === 'reject'
                                      ? StatusObj.rejected
                                      : item?.type === 'send_back'
                                      ? StatusObj.sendback
                                      : item?.type === 'onhold'
                                      ? StatusObj.onhold
                                      : null,

                                  title:
                                    item?.type === 'create'
                                      ? 'Raised by- ' + item?.created_by_user?.full_name
                                      : item?.created_by_user?.full_name || 'N/A',
                                  subTitle: item?.comment_reasons?.comment || 'No Comment',
                                  time: moment(item?.created_at).format('HH:mm'), // Corrected from "HH:MM" to "HH:mm"
                                  count: item?.current_level == 'L0' ? 'L0' : item?.current_level_count,
                                  cardType: 'card'
                                }))}
                              />
                            )}
                          </Grid>
                        </Grid>
                      )}
                    </>
                  )
                })}
            </Box>
          )}
        </Box>
      </Box>
      {sendDialog && (
        <SendBackDialog
          userInfo={userInfo}
          openModal={Boolean(sendDialog)}
          workflowLogId={sendDialog}
          header='Send Back'
          closeModal={handleCloseSendDialog}
        />
      )}
      {approveDialog && (
        <ApproveDialog
          userInfo={userInfo}
          openModal={Boolean(approveDialog)}
          workflowLogId={approveDialog?.split('|')?.[0]}
          statusId={approveDialog?.split('|')?.[1]}
          header='Approve'
          closeModal={handleCloseApprove}
        />
      )}
      {rejectDialog && (
        <RejectDialog
          userInfo={userInfo}
          openModal={Boolean(rejectDialog)}
          workflowLogId={rejectDialog?.split('|')?.[0]}
          statusId={rejectDialog?.split('|')?.[1]}
          header='Reject'
          closeModal={handleCloseReject}
          rejection_reason_master={rejectDialog?.split('|')?.[2]}
        />
      )}
      {onHoldDialog && (
        <OnHoldDialog
          userInfo={userInfo}
          openModal={Boolean(onHoldDialog)}
          workflowLogId={onHoldDialog?.split('|')?.[0]}
          statusId={onHoldDialog?.split('|')?.[1]}
          header='On-Hold'
          closeModal={handleCloseOnHold}
        />
      )}
      {/* {calenderDialog && (
        <CalenderDialog openDrawer={calenderDialog} handleClose={handleCloseCalenderDialog} title='Calendar' />
      )}
      {taskDialog && <TaskDialog openDrawer={taskDialog} handleClose={handleCloseTaskDialog} title='My Tasks' />}
      {notificationDialog && (
        <NotificationDialog
          openDrawer={notificationDialog}
          handleClose={handleCloseNotificationDialog}
          title='Notification'
        />
      )} */}
    </>
  )
}

export default ApprovalWorkflow
