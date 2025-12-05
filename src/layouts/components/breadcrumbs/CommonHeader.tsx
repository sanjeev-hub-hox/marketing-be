'use client'
import { Box, Button, IconButton, Typography } from '@mui/material'
import React from 'react'
import UserIcon from '../UserIcon'
import Breadcrumb from './Breadcrumb'
import { usePathname } from 'next/navigation'

type CustomButton = {
  isButton?: boolean
  title?: string
  buttonTitle?: string
  onPush?: (a: boolean) => void
  infoIcon?: boolean
}
export default function CommonHeader({ isButton, onPush, infoIcon, title, buttonTitle }: CustomButton) {
  const handleChange = () => {
    if (onPush) {
      onPush(true)
    }
  }
  const pathName = usePathname()
  const CurrentPath = pathName.replaceAll('/', '').replaceAll('-', ' ')
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase())
  }
  const capitalizedString = capitalizeWords(CurrentPath)

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ textAlign: 'left' }}>
          <Typography
            variant='h5'
            sx={{
              flexGrow: 1,
              color: '#1B1B1B'
            }}
          >
            {title}
          </Typography>
          <Breadcrumb currentPath={capitalizedString} />
        </div>
        <div>
          {infoIcon && (
            <IconButton>
              <UserIcon icon='mdi:info' />
            </IconButton>
          )}
          {isButton && (
            <Button
              variant='contained'
              onClick={handleChange}
              disableFocusRipple
              disableTouchRipple
              startIcon={<UserIcon icon='mdi:plus' />}
            >
              {buttonTitle}
            </Button>
          )}
        </div>
      </Box>
    </>
  )
}
