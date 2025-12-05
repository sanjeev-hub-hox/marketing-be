// ** React Import
import { useRef, useState, useEffect, Children } from 'react'

// ** MUI Imports
import List from '@mui/material/List'
import Box, { BoxProps } from '@mui/material/Box'
import { createTheme, responsiveFontSizes, styled, ThemeProvider } from '@mui/material/styles'

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Type Import
import { NavLink, NavGroup, LayoutProps, NavSectionTitle } from 'src/@core/layouts/types'

// ** Theme Config
import themeConfig from 'src/configs/themeConfig'

// ** Component Imports
import Drawer from './Drawer'
import VerticalNavItems from './VerticalNavItems'
import VerticalNavHeader from './VerticalNavHeader'

// ** Theme Options
import themeOptions from 'src/@core/theme/ThemeOptions'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import VerticalNavLink from './VerticalNavLink'
import { Typography } from '@mui/material'
import { usePathname } from 'next/navigation'

interface Props {
  navWidth: number
  navVisible: boolean
  collapsedNavWidth: number
  hidden: LayoutProps['hidden']
  navigationBorderWidth: number
  toggleNavVisibility: () => void
  settings: LayoutProps['settings']
  children: LayoutProps['children']
  setNavVisible: (value: boolean) => void
  saveSettings: LayoutProps['saveSettings']
  navMenuContent: LayoutProps['verticalLayoutProps']['navMenu']['content']
  navMenuBranding: LayoutProps['verticalLayoutProps']['navMenu']['branding']
  menuLockedIcon: LayoutProps['verticalLayoutProps']['navMenu']['lockedIcon']
  verticalNavItems: LayoutProps['verticalLayoutProps']['navMenu']['navItems']
  navMenuProps: LayoutProps['verticalLayoutProps']['navMenu']['componentProps']
  menuUnlockedIcon: LayoutProps['verticalLayoutProps']['navMenu']['unlockedIcon']
  afterNavMenuContent: LayoutProps['verticalLayoutProps']['navMenu']['afterContent']
  beforeNavMenuContent: LayoutProps['verticalLayoutProps']['navMenu']['beforeContent']
}

const StyledBoxForShadow = styled(Box)<BoxProps>(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(${theme.palette.background.default} ${
    theme.direction === 'rtl' ? '95%' : '5%'
  },${hexToRGBA(theme.palette.background.default, 0.85)} 30%,${hexToRGBA(
    theme.palette.background.default,
    0.5
  )} 65%,${hexToRGBA(theme.palette.background.default, 0.3)} 75%,transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const Navigation = (props: Props) => {
  // ** Props
  const { hidden, settings, afterNavMenuContent, beforeNavMenuContent, navMenuContent: userNavMenuContent } = props

  // ** States
  const [navHover, setNavHover] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [groupActive, setGroupActive] = useState<string>('')
  const [currentActiveGroup, setCurrentActiveGroup] = useState<string[]>([])
  const [navigationChildItems, setnavigationChildItems] = useState<[]>([])
  const pathName = usePathname()

  useEffect(() => {
    // if (props.verticalNavItems) {
    //   setnavigationItemsList(props.verticalNavItems)
    // }

    if (isOpen) {
      const childItems: any = props?.verticalNavItems?.find(item => item?.title == groupActive)
      const naItems = childItems ? childItems?.children : []
      setnavigationChildItems(naItems)
    }
  }, [props.verticalNavItems, groupActive, isOpen])

  // ** Ref
  const shadowRef = useRef(null)

  // ** Var
  const { afterVerticalNavMenuContentPosition, beforeVerticalNavMenuContentPosition } = themeConfig

  const navMenuContentProps = {
    ...props,
    navHover,
    groupActive,
    setGroupActive,
    currentActiveGroup,
    setCurrentActiveGroup
  }

  // ** Create new theme for the navigation menu when mode is `semi-dark`
  let darkTheme = createTheme(themeOptions(settings, 'dark'))

  // ** Set responsive font sizes to true
  if (themeConfig.responsiveFontSizes) {
    darkTheme = responsiveFontSizes(darkTheme)
  }

  // ** Fixes Navigation InfiniteScroll
  const handleInfiniteScroll = (ref: HTMLElement) => {
    if (ref) {
      // @ts-ignore
      ref._getBoundingClientRect = ref.getBoundingClientRect

      ref.getBoundingClientRect = () => {
        // @ts-ignore
        const original = ref._getBoundingClientRect()

        return { ...original, height: Math.floor(original.height) }
      }
    }
  }

  // ** Scroll Menu
  const scrollMenu = (container: any) => {
    if (beforeVerticalNavMenuContentPosition === 'static' || !beforeNavMenuContent) {
      container = hidden ? container.target : container
      if (shadowRef && container.scrollTop > 0) {
        // @ts-ignore
        if (!shadowRef.current.classList.contains('scrolled')) {
          // @ts-ignore
          shadowRef.current.classList.add('scrolled')
        }
      } else {
        // @ts-ignore
        shadowRef.current.classList.remove('scrolled')
      }
    }
  }

  const NewresolveNavItemComponent = (item: NavGroup | NavLink | NavSectionTitle) => {
    console.warn('item', item)

    // if ((item as NavSectionTitle).sectionTitle) return VerticalNavSectionTitle
    // if ((item as NavGroup).children) return VerticalNavGroup
    return VerticalNavLink
  }

  const NewVerticalNavItems = (items: NavLink[]) => {
    // ** Props
    const navitems = items
    const RenderMenuItems = navitems?.map((item: NavLink, index: number) => {
      const TagName: any = NewresolveNavItemComponent(item)

      return <TagName {...props} key={index} item={item} />
    })

    return <>{RenderMenuItems}</>
  }

  const ScrollWrapper = hidden ? Box : PerfectScrollbar

  return (
    <ThemeProvider theme={darkTheme}>
      <Drawer {...props} navHover={navHover} setNavHover={setNavHover}>
        <VerticalNavHeader {...props} navHover={navHover} />
        {beforeNavMenuContent && beforeVerticalNavMenuContentPosition === 'fixed'
          ? beforeNavMenuContent(navMenuContentProps)
          : null}
        {(beforeVerticalNavMenuContentPosition === 'static' || !beforeNavMenuContent) && (
          <StyledBoxForShadow ref={shadowRef} />
        )}
        <Box
          sx={{
            position: 'relative',
            overflowY: 'auto',
            height: 'calc(100% - 230px)'
          }}
        >
          {/* @ts-ignore */}
          <ScrollWrapper
            {...(hidden
              ? {
                  onScroll: (container: any) => scrollMenu(container),
                  sx: {
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }
                }
              : {
                  options: { wheelPropagation: false },
                  onScrollY: (container: any) => scrollMenu(container),
                  containerRef: (ref: any) => handleInfiniteScroll(ref)
                })}
          >
            {beforeNavMenuContent && beforeVerticalNavMenuContentPosition === 'static'
              ? beforeNavMenuContent(navMenuContentProps)
              : null}
            {userNavMenuContent ? (
              userNavMenuContent(navMenuContentProps)
            ) : (
              <List className='nav-items' sx={{ pt: 0, '& > :first-child': { mt: '0' } }}>
                <VerticalNavItems
                  navHover={navHover}
                  groupActive={groupActive}
                  setGroupActive={setGroupActive}
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  currentActiveGroup={currentActiveGroup}
                  setCurrentActiveGroup={setCurrentActiveGroup}
                  {...props}
                />
              </List>
            )}
            {afterNavMenuContent && afterVerticalNavMenuContentPosition === 'static'
              ? afterNavMenuContent(navMenuContentProps)
              : null}
          </ScrollWrapper>
        </Box>

        {afterNavMenuContent && afterVerticalNavMenuContentPosition === 'fixed'
          ? afterNavMenuContent(navMenuContentProps)
          : null}
      </Drawer>
      {isOpen ? (
        <div
          className='sideBar-Link'
          style={{
            position: 'fixed',
            top: 0,
            zIndex: 12345,
            left: '125px',
            background: '#FCF8FF',
            width: '230px',
            height: '100%',
            borderRadius: '16px 0px 16px 0px',
            padding: '24px 12px'
          }}
        >
          <Typography variant='body1' className='sidebarHeading'>
            {groupActive} Overview
          </Typography>
          {NewVerticalNavItems(navigationChildItems)}
        </div>
      ) : (
        ''
      )}
    </ThemeProvider>
  )
}

export default Navigation
