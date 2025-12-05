import React from 'react'
import { Box, Typography } from '@mui/material'
import { SxProps, Theme } from '@mui/system'

// Define the styles for the marquee container and text
const marqueeContainer: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  width: '100%',
  borderRadius: '10px',
  padding: '12px 24px',
  background: '#fff'
}

const marqueeText: SxProps<Theme> = {
  display: 'inline-block',
  paddingLeft: '100%',
  animation: 'marquee 20s linear infinite',
  '@keyframes marquee': {
    '0%': { transform: 'translateX(0)' },
    '10%': { transform: 'translateX(0)' }, // Initial delay
    '100%': { transform: 'translateX(-100%)' }
  }
}

interface MarqueeProps {
  title: string
  texts: string[]
}

const MarqueeText: React.FC<MarqueeProps> = ({ title, texts }) => {
  const concatenatedText = texts.join(' • ')

  return (
    <Box sx={marqueeContainer}>
      <Typography variant='subtitle2' color={'text.primary'} sx={{ mr: 2, lineHeight: '15.4px' }}>
        {title}:
      </Typography>
      <Box sx={{ width: 'calc(100% - 100px)', overflow: 'hidden' }}>
        <Box sx={marqueeText}>
          <Typography variant='caption' color={'primary.dark'} sx={{ lineHeight: '13.2px' }} component='span'>
            {concatenatedText}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default MarqueeText
