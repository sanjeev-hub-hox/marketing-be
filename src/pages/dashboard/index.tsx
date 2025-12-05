import React, { useEffect } from 'react'

import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { logoutUser } from '../../services/authService'
import { useSession } from 'next-auth/react'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { getLocalStorageVal } from 'src/utils/helper'
import DasboardUI from 'src/OwnComponents/Dashboard/DasboardUI'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary
}))

const Page: React.FC = () => {
  const session = useSession()
  const { setPagePaths } = useGlobalContext()
  const handleSignout = async () => {
    if (session) {
      await logoutUser(session)
    } else {
      window.location.href = '/signout'
    }
  }
  useEffect(() => {
    setPagePaths([
      {
        title: 'Dashboard',
        path: '/dashboard'
      }
    ])
  }, [])

  const userInfoJson = getLocalStorageVal('userInfo')
  const userInfoDetails = userInfoJson ? JSON.parse(userInfoJson) : {}

  return (
    <>
      {userInfoDetails ? <div>Welcome, {userInfoDetails?.userInfo?.name}</div> : null}

      {/* <button
        onClick={() => {
          handleSignout()
        }}
      >
        Logout
      </button> */}
      <DasboardUI />
      <Box sx={{ flexGrow: 1 }}></Box>
    </>
  )
}

export default Page
