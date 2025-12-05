import React from 'react'
import Logo from '../../../public/images/logo.png'
import { Box } from '@mui/system'
import Image from 'next/image'
import { Typography } from '@mui/material'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

function CustomHeader() {
  const { pagePaths } = useGlobalContext()

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <Box sx={{ width: '10%' }}>
          <Image src={Logo} alt='Logo' width={80} height={80} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '90%' }}>
          <Typography variant='h4' color={'text.primary'} sx={{ lineHeight: '37.4px', textTransform: 'capitalize' }}>
            {pagePaths?.title}
          </Typography>
        </Box>
      </Box>
    </>
  )
}

export default CustomHeader
