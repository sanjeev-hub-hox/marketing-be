// ** React Imports
import { useEffect, Fragment, ElementType, useRef } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import ListItem from '@mui/material/ListItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton, { ListItemButtonProps } from '@mui/material/ListItemButton'

// ** Third Party Imports
import clsx from 'clsx'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs Import
import themeConfig from 'src/configs/themeConfig'

// ** Utils
import { hasActiveChild, removeChildren, CheckPermissionMatch } from 'src/@core/layouts/utils'

// ** Type Import
import { NavGroup, LayoutProps } from 'src/@core/layouts/types'

// ** Custom Components Imports
import VerticalNavItems from './VerticalNavItems'
import UserIcon from 'src/layouts/components/UserIcon'
import Translations from 'src/layouts/components/Translations'
import CanViewNavGroup from 'src/layouts/components/acl/CanViewNavGroup'
import { Tooltip } from '@mui/material'

interface Props {
  item: NavGroup
  navHover: boolean
  parent?: NavGroup
  navVisible?: boolean
  groupActive: string
  collapsedNavWidth: number
  currentActiveGroup: string
  navigationBorderWidth: number
  settings: LayoutProps['settings']
  isSubToSub?: NavGroup | undefined
  saveSettings: LayoutProps['saveSettings']
  setGroupActive: (values: string) => void
  isOpen: boolean
  setIsOpen?: (value: boolean | ((prev: boolean | undefined) => boolean)) => void
  setCurrentActiveGroup: (items: string) => void
}

const MenuItemTextWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(themeConfig.menuTextTruncate && { overflow: 'hidden' })
}))

//styles for nav group
// ** Styled Components
const MenuNavLink = styled(ListItemButton)<ListItemButtonProps & { component?: ElementType }>(({ theme }) => ({
  width: '100%',
  borderRadius: 8,
  transition: 'padding-left .25s ease-in-out',
  backgroundColor: theme.palette.common.white,

  '&.Mui-selected': {
    backgroundColor: 'transparent !important',

    '& .MuiListItemIcon-root': {
      width: '56px',
      height: '32px',
      borderRadius: '100px',
      backgroundColor: theme.palette.primary.dark,
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '4px',
      marginLeft: '5px',
      color: `${theme.palette.common.white} !important`,

      '&.Mui-focusVisible': {
        backgroundColor: theme.palette.primary.dark
      }
    },
    '& .MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '21px',
      textAlign: 'center',
      color: theme.palette.primary.dark,
      marginTop: '4px'
    },
    '&:hover': {
      '& .MuiListItemIcon-root': {
        width: '56px',
        height: '32px',
        borderRadius: '100px',
        backgroundColor: theme.palette.primary.dark,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '4px',
        marginLeft: '5px',
        color: `${theme.palette.common.white} !important`,
        '& .MuiTypography-root': {
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '21px',
          textAlign: 'center',
          marginTop: '4px',
          color: `${theme.palette.primary.dark} !important`
        },
        '&.Mui-focusVisible': {
          backgroundColor: theme.palette.primary.main
        }
      }
    }
  },

  '&:hover': {
    backgroundColor: theme.palette.common.white,
    '& .MuiListItemIcon-root': {
      backgroundColor: theme.palette.grey[50],
      color: theme.palette.customColors.mainText
    },
    '& .MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '21px',
      textAlign: 'center',
      marginTop: '4px',
      color: `${theme.palette.customColors.mainText} `
    }
  },
  '& .MuiTypography-root': {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '21px',
    textAlign: 'center',
    marginTop: '4px',
    color: `${theme.palette.customColors.mainText} `
  },
  '& .MuiListItemIcon-root': {
    color: `${theme.palette.customColors.mainText} !important`,
    width: '56px',
    height: '32px',
    borderRadius: '100px',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '4px',
    marginLeft: '5px'
  }
}))

const VerticalNavGroup = (props: Props) => {
  // ** Props
  const {
    item,
    parent,
    settings,
    navHover,
    navVisible,
    isSubToSub,
    groupActive,
    setGroupActive,
    isOpen,
    setIsOpen,
    collapsedNavWidth,
    currentActiveGroup,
    setCurrentActiveGroup,
    navigationBorderWidth
  } = props

  // ** Hooks & Vars
  const router = useRouter()
  const currentURL = router.asPath
  const { direction, navCollapsed, verticalNavToggleType } = settings

  // ** Accordion menu group open toggle
  const toggleActiveGroup = (item: NavGroup, parent: NavGroup | undefined) => {
    const openGroup = groupActive
    // debugger;
    // ** If Group is already open and clicked, close the group
    if (openGroup == item.title) {
      // openGroup.splice(openGroup.indexOf(item.title), 1)
      // // If clicked Group has open group children, Also remove those children to close those groups
      // if (item.children) {
      //   // removeChildren(item.children, openGroup, currentActiveGroup)
      // }
    } else if (parent) {
      // ** If Group clicked is the child of an open group, first remove all the open groups under that parent
      if (parent.children) {
        // removeChildren(parent.children, openGroup, currentActiveGroup)
      }

      // ** After removing all the open groups under that parent, add the clicked group to open group array
      // if (!openGroup.includes(item.title)) {
      //   openGroup.push(item.title);
      // }
    } else {
      // ** If clicked on another group that is not active or open, create openGroup array from scratch
      // ** Empty Open Group array
      // openGroup = [];
      // ** push Current Active Group To Open Group array
      // if (currentActiveGroup.every((elem) => groupActive.includes(elem))) {
      //   // openGroup.push(...currentActiveGroup);
      // }
      // // ** Push current clicked group item to Open Group array
      // if (!openGroup.includes(item.title)) {
      //   // openGroup.push(item.title);
      // }
    }
    if (setIsOpen !== undefined) {
      if (item?.children?.length) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }
    setGroupActive(item.title)
  }

  // ** Menu Group Click
  const handleGroupClick = () => {
    const openGroup = groupActive
    if (verticalNavToggleType === 'collapse') {
      if (openGroup.includes(item.title)) {
        // openGroup.splice(openGroup.indexOf(item.title), 1);
      } else {
        // openGroup.push(item.title);
      }
      // setGroupActive([...openGroup]);
    } else {
      toggleActiveGroup(item, parent)
    }
  }

  useEffect(() => {
    if (hasActiveChild(item, currentURL)) {
      setCurrentActiveGroup(item.title)
      setGroupActive(item.title)

      // if (!groupActive.includes(item.title)) groupActive.push(item.title);
    } else {
      const index = groupActive.indexOf(item.title)
      // if (index > -1) groupActive.splice(index, 1);
    }
    // setGroupActive([...groupActive]);
    // setCurrentActiveGroup(groupActive);

    // Empty Active Group When Menu is collapsed and not hovered, to fix issue route change
    // if (navCollapsed && !navHover) {
    //   setGroupActive('');
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath])

  useEffect(() => {
    if (navCollapsed && !navHover) {
      setGroupActive('')
    }

    if ((navCollapsed && navHover) || (groupActive.length === 0 && !navCollapsed)) {
      // setGroupActive([...currentActiveGroup]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navCollapsed, navHover])

  useEffect(() => {
    if (groupActive.length === 0 && !navCollapsed) {
      setGroupActive('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navHover])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Add type for event
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setGroupActive('')
        if (setIsOpen !== undefined) {
          setIsOpen(false)
        }
        // Handle your logic here, e.g., close a modal, toggle state, etc.
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const icon = parent && !item.icon ? themeConfig.navSubItemIcon : item.icon

  const menuGroupCollapsedStyles = navCollapsed && !navHover ? { opacity: 0 } : { opacity: 1 }

  const divRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <div ref={divRef}>
        <CanViewNavGroup navGroup={item}>
          <Fragment>
            {CheckPermissionMatch(item.permissions) ? (
              <Tooltip title={item?.title}>
                <ListItem
                  disablePadding
                  className='nav-group'
                  onMouseOver={handleGroupClick}
                  sx={{
                    mt: 1.5,
                    flexDirection: 'column',
                    transition: 'padding .25s ease-in-out',
                    px: theme =>
                      parent && item.children
                        ? '0 !important'
                        : `${theme.spacing(navCollapsed && !navHover ? 2 : 3)} !important`
                  }}
                >
                  <MenuNavLink
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}
                    // onMouseEnter={() => handleDialog()}
                    className={clsx({
                      'Mui-selected': groupActive === item.title || currentActiveGroup === item.title
                    })}
                    sx={{
                      py: 2.25,
                      width: '100%',
                      borderRadius: '8px',
                      transition: 'padding-left .25s ease-in-out',
                      pr: navCollapsed && !navHover ? (collapsedNavWidth - navigationBorderWidth - 24 - 16) / 8 : 3,
                      pl: navCollapsed && !navHover ? (collapsedNavWidth - navigationBorderWidth - 24 - 16) / 8 : 4,
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                        '&:hover': {
                          backgroundColor: 'action.selected'
                        }
                      },
                      '&.Mui-selected.Mui-focusVisible': {
                        backgroundColor: 'action.focus',
                        '&:hover': {
                          backgroundColor: 'action.focus'
                        }
                      }
                    }}
                  >
                    {isSubToSub ? null : (
                      <ListItemIcon
                        sx={{
                          transition: 'margin .25s ease-in-out',
                          ...(parent && navCollapsed && !navHover ? {} : { mr: 2 }),
                          ...(navCollapsed && !navHover ? { mr: 0 } : {}), // this condition should come after (parent && navCollapsed && !navHover) condition for proper styling
                          ...(parent && item.children ? { ml: 2, mr: 4 } : {}),
                          color: parent && item.children ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {/* <UserIcon icon={icon as string} {...(parent && { fontSize: '0.5rem' })} /> */}
                        <span className={item.icon}></span>
                      </ListItemIcon>
                    )}
                    <MenuItemTextWrapper
                      style={{ display: 'flex', justifyContent: 'center' }}
                      sx={{
                        ...menuGroupCollapsedStyles,
                        ...(isSubToSub ? { ml: 8 } : {})
                      }}
                    >
                      <Typography
                        {...((themeConfig.menuTextTruncate ||
                          (!themeConfig.menuTextTruncate && navCollapsed && !navHover)) && {
                          noWrap: true
                        })}
                      >
                        {item.title}
                        {/* <Translations text={item.title} /> */}
                      </Typography>
                      <Box
                        className='menu-item-meta'
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          '& svg': {
                            transition: 'transform .25s ease-in-out',
                            ...(groupActive.includes(item.title) && {
                              transform: direction === 'ltr' ? 'rotate(90deg)' : 'rotate(-90deg)'
                            })
                          }
                        }}
                      >
                        {item.badgeContent ? (
                          <Chip
                            size='small'
                            label={item.badgeContent}
                            color={item.badgeColor || 'primary'}
                            sx={{
                              mr: 1.5,
                              '& .MuiChip-label': {
                                px: 2.5,
                                lineHeight: 1.385,
                                textTransform: 'capitalize'
                              }
                            }}
                          />
                        ) : null}
                      </Box>
                      {/* <Icon icon={direction === 'ltr' ? 'mdi:chevron-right' : 'mdi:chevron-left'} /> */}
                    </MenuItemTextWrapper>
                  </MenuNavLink>
                </ListItem>
              </Tooltip>
            ) : (
              ''
            )}
          </Fragment>
        </CanViewNavGroup>
      </div>
    </>
  )
}

export default VerticalNavGroup
