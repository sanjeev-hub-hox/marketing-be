import React, { useEffect, useState } from 'react'
import { Box, Tooltip } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useTheme } from '@mui/material'
import DialogOpener from '../SharedUIComponent/ApprovalManagement/DialogOpener'
import NotificationDialog from '../SharedUIComponent/NotificationDialog'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import toast from 'react-hot-toast'
import TaskDialog from '../Registration/Dialog/TaskDialog'
import { RemoteDialogOpener } from '../SharedUIComponent/ApprovalManagement/RemoteDialogOpener'
import { getRequest, postRequest } from 'src/services/apiService'

const FloatingSidebar = () => {
  const theme = useTheme()
  const router = useRouter()
  const [calenderDialog, setCalenderDialog] = useState(false)
  const [taskDialog, setTaskDialog] = useState(false)
  const [notificationDialog, setNotificationDialog] = useState(false)
  const [iSworkflowOpen, setIsWorkflowOpen] = useState(false)
  // const { userInfo } = useGlobalContext();
  const [userInfo, setUserInfo] = useState<any>(() => {
    const savedUserInfo = localStorage.getItem('userInfo')

    return savedUserInfo ? JSON.parse(savedUserInfo) : {} // Default to {} if not found
  })

  useEffect(() => {
    if (LoadUserDetails()) return

    const intervalId = setInterval(() => {
      if (LoadUserDetails()) {
        clearInterval(intervalId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const LoadUserDetails = () => {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo))

      return true // Return true if userInfo is found
    }

    return false // Return false if userInfo is not found
  }

  return (
    <>
      {/* <Box sx={{ cursor: 'pointer', mt: 3 }}>
        <Tooltip title='Calendar'>
          <span className='icon-calendar-1' onClick={() => setCalenderDialog(true)}></span>
        </Tooltip>
      </Box> */}
      <Box sx={{ cursor: 'pointer', mt: 3 }}>
        <Tooltip title='Tasks'>
          <span className='icon-task-square' onClick={() => setTaskDialog(true)}></span>
        </Tooltip>
      </Box>
      {/* <Box sx={{ cursor: 'pointer', mt: 3 }}>
        <Tooltip title='Notifications'>
          <span className='icon-notification' onClick={() => setNotificationDialog(true)}></span>
        </Tooltip>
      </Box>
      <Box sx={{ cursor: 'pointer', mt: 3 }}>
        <Tooltip title='Messages'>
          <span className='icon-messages'></span>
        </Tooltip>
      </Box> */}
      <Box sx={{ cursor: 'pointer', mt: 3 }}>
        <Tooltip title='Workflow'>
          <span
            className='icon-element-4'
            // onClick={() => router.push("/approval-workflow/")}
            onClick={() => setIsWorkflowOpen(!iSworkflowOpen)}
          ></span>
        </Tooltip>
      </Box>
      {iSworkflowOpen && userInfo?.userInfo?.id ? (
        <RemoteDialogOpener
          userInfoData={userInfo}
          openDialog={iSworkflowOpen}
          handleClose={() => setIsWorkflowOpen(false)}
          api={{
            get: (p: any) => getRequest(p),
            post: (p: any) => postRequest(p)
          }}
          ENV_VARIABLES={{
            ADMIN_URL: process.env.NEXT_PUBLIC_FRONT_ADMIN_URL,
            ACADEMICS_URL: process.env.NEXT_PUBLIC_FRONT_ACADEMICS_URL,
            MARKETING_URL: process.env.NEXT_PUBLIC_FRONT_MARKETING_URL,
            FINANCE_URL: process.env.NEXT_PUBLIC_FRONT_FINANCE_URL,
            TRANSPORT_URL: process.env.NEXT_PUBLIC_FRONT_TRANSPORT_URL
          }}
        />
        // <DialogOpener
        //   userInfoData={userInfo}
        //   openDialog={iSworkflowOpen}
        //   handleClose={() => setIsWorkflowOpen(false)}
        // />
      ) : (
        ''
      )}
      {userInfo?.userInfo?.id ? (
        <NotificationDialog
          userId={userInfo?.userInfo?.id}
          userType={1}
          handleClose={() => setNotificationDialog(!notificationDialog)}
          openDrawer={notificationDialog}
          title='Notification'
        />
      ) : (
        ''
      )}
      {taskDialog && (
        <TaskDialog
          openDrawer={taskDialog}
          handleClose={() => {
            setTaskDialog(false)
          }}
          title='My Tasks'
        />
      )}
    </>
  )
}

export default FloatingSidebar
