// ** React Imports
import { useState, SyntheticEvent, Fragment, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'
import UserIcon from 'src/layouts/components/UserIcon'
import { getSession, useSession } from 'next-auth/react'
import { logoutUser, logoutUserData } from 'src/services/authService'
import { getInitials, getLocalStorageVal } from 'src/utils/helper'

interface Props {
  settings: Settings
}

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const UserDropdown = (props: Props) => {
  const [userInitialName, setUserInitialName] = useState<any>(null)
  // ** Props
  const { settings } = props

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  // ** Hooks
  const router = useRouter()
  const { logout } = useAuth()
  const userDetailsJson = getLocalStorageVal('userDetails')
  const userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : {}

  const userInfoJson = getLocalStorageVal('userInfo')
  const userInfoDetails = userInfoJson ? JSON.parse(userInfoJson) : {}

  useEffect(() => {
    const nm = getInitials(userInfoDetails?.userInfo?.name)
    setTimeout(() => {
      setUserInitialName(nm)
    }, 1000)
  }, [userInfoDetails?.userInfo?.name])

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2,
      fontSize: '1.375rem',
      color: 'text.primary'
    }
  }

  const session = useSession()

  const handleLogout = async () => {
     
    const newSession:any = await getSession();
    console.log('logout>>', newSession)

    const token = newSession?.idToken
    const userSession = {
      idToken:token
    }
    console.log('idToken', token)
    const path = logoutUserData(userSession)
    if (path && path.url) {
      window.open(path.url, '_self')
    } else {
      window.open('/', '_self')
    }
    // if (session) {
    //   await logoutUser(session)
    // } else {
    //   window.location.href = '/signout'
    // }
    handleDropdownClose()
  }

  return (
    <Fragment>
      <Box onClick={handleDropdownOpen} sx={{ ml: 0, cursor: 'pointer' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}
        >
          <Avatar
            alt='John Doe'
            onClick={handleDropdownOpen}
            sx={{ width: 56, height: 56, borderRadius: '16px' }}

            // src='/images/avatars/1.png'
          >
            <Typography variant='h6' sx={{ color: 'customColors.mainText' }}>
              {userInitialName}
            </Typography>
          </Avatar>
          <Box sx={{ marginLeft: '10px', marginRight: '5px' }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 400, color: '#212121', lineHeight: '24px' }}>
              {/* {userDetails?.name} */}
              {userInfoDetails?.userInfo?.name}
            </Typography>
          </Box>
          <ExpandMoreIcon sx={{ color: '#292D32', marginTop: '-20px' }} />
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: direction === 'ltr' ? 'right' : 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: direction === 'ltr' ? 'right' : 'left'
        }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              <Avatar alt='John Doe' src='/images/avatars/1.png' sx={{ width: '2.5rem', height: '2.5rem' }} />
            </Badge>
            <Box
              sx={{
                display: 'flex',
                ml: 3,
                alignItems: 'flex-start',
                flexDirection: 'column'
              }}
            >
              <Typography sx={{ fontWeight: 600 }}> {userInfoDetails?.userInfo?.name}</Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: '0 !important' }} />
        {/* <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='mdi:account-outline' />
            Profile
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='mdi:email-outline' />
            Inbox
          </Box>
        </MenuItem> */}

        <Divider />
        {/* <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='mdi:cog-outline' />
            Settings
          </Box>
        </MenuItem>

        <Divider /> */}
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 2,
            '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' }
          }}
        >
          <Icon onClick={handleLogout} icon='mdi:logout-variant' />
          Logout
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
