// ** MUI Imports

import Box from '@mui/material/Box'

// ** Icon Imports

import Image from 'next/image'
import Logo from '../../../../public/images/logo_new.png'
import { usePathname } from 'next/navigation'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components

import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import { Icon, IconButton } from '@mui/material'
import UserIcon from '../UserIcon'
import NotificationDropdown, {
  NotificationsType
} from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import ShortcutsDropdown, { ShortcutsType } from 'src/@core/layouts/components/shared-components/ShortcutsDropdown'
import Breadcrumb from '../breadcrumbs/Breadcrumb'
import Reminder from 'src/@core/layouts/components/shared-components/Reminder'
import Attendance from 'src/@core/layouts/components/shared-components/Attendance'
import Logout from 'src/@core/layouts/components/shared-components/Logout'
import Help from 'src/@core/layouts/components/shared-components/Help'
import KnowledgeBase from 'src/@core/layouts/components/shared-components/KnowledgeBase'
import Requisition from 'src/@core/layouts/components/shared-components/Requisition'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const notifications: NotificationsType[] = [
  {
    meta: 'Today',
    avatarAlt: 'Flora',
    title: 'Congratulation Flora! 🎉',
    avatarImg: '/images/avatars/4.png',
    subtitle: 'Won the monthly best seller badge'
  },
  {
    meta: 'Yesterday',
    avatarColor: 'primary',
    subtitle: '5 hours ago',
    avatarText: 'Robert Austin',
    title: 'New user registered.'
  },
  {
    meta: '11 Aug',
    avatarAlt: 'message',
    title: 'New message received 👋🏻',
    avatarImg: '/images/avatars/5.png',
    subtitle: 'You have 10 unread messages'
  },
  {
    meta: '25 May',
    title: 'Paypal',
    avatarAlt: 'paypal',
    subtitle: 'Received Payment',
    avatarImg: '/images/misc/paypal.png'
  },
  {
    meta: '19 Mar',
    avatarAlt: 'order',
    title: 'Received Order 📦',
    avatarImg: '/images/avatars/3.png',
    subtitle: 'New order received from John'
  },
  {
    meta: '27 Dec',
    avatarAlt: 'chart',
    subtitle: '25 hrs ago',
    avatarImg: '/images/misc/chart.png',
    title: 'Finance report has been generated'
  }
]

const shortcuts: ShortcutsType[] = [
  {
    title: 'Calendar',
    url: '/apps/calendar',
    subtitle: 'Appointments',
    icon: 'mdi:calendar-month-outline'
  },
  {
    title: 'Invoice App',
    url: '/apps/invoice/list',
    subtitle: 'Manage Accounts',
    icon: 'mdi:receipt-text-outline'
  },
  {
    title: 'Users',
    url: '/apps/user/list',
    subtitle: 'Manage Users',
    icon: 'mdi:account-outline'
  },
  {
    url: '/apps/roles',
    title: 'Role Management',
    subtitle: 'Permissions',
    icon: 'mdi:shield-check-outline'
  },
  {
    url: '/',
    title: 'Dashboard',
    icon: 'mdi:chart-pie',
    subtitle: 'User Dashboard'
  },
  {
    title: 'Settings',
    icon: 'mdi:cog-outline',
    subtitle: 'Account Settings',
    url: '/pages/account-settings/account'
  },
  {
    title: 'Help Center',
    subtitle: 'FAQs & Articles',
    icon: 'mdi:help-circle-outline',
    url: '/pages/help-center'
  },
  {
    title: 'Dialogs',
    subtitle: 'Useful Dialogs',
    icon: 'mdi:window-maximize',
    url: '/pages/dialog-examples'
  }
]

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  const pathName = usePathname()

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden ? (
          <IconButton disableFocusRipple disableRipple color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <UserIcon icon='mdi:menu' />
          </IconButton>
        ) : null}
        <Box sx={{ cursor: 'pointer' }}>
          <Image
            onClick={() => {
              window.open(process.env.NEXT_PUBLIC_FRONT_ACADEMICS_URL, '_self')
            }}
            alt='Logo'
            src={Logo}
            width={56}
            height={56}
          />
        </Box>
        {/* <ModeToggler settings={settings} saveSettings={saveSettings} /> */}
        <Box sx={{ marginLeft: '80px' }}>
          <Breadcrumb currentPath={pathName} />
        </Box>
      </Box>

      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        {/* <ShortcutsDropdown settings={settings} shortcuts={shortcuts} /> */}
        {/* <NotificationDropdown settings={settings} notifications={notifications} /> */}
        {/* <Requisition settings={settings} shortcuts={shortcuts} />
        <Attendance settings={settings} shortcuts={shortcuts} />
        <Logout settings={settings} shortcuts={shortcuts} />
        <Help settings={settings} shortcuts={shortcuts} />
        <KnowledgeBase settings={settings} shortcuts={shortcuts} /> */}
        <UserDropdown settings={settings} />
      </Box>
    </Box>
  )
}

export default AppBarContent
