// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { IconButton } from '@mui/material'
import { useRouter } from 'next/navigation'

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.dark,
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '24px',
  letterSpacing: '0.15px'
}))

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const router = useRouter()
  const handleRedirect = (url: string) => {
    const newWindow = window.open(url, '_blank')
    if (newWindow) {
      newWindow.focus()
    } else {
      console.error('Failed to open a new window. Popup might be blocked.')
    }
    //router.push(url)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <Typography color={'customColors.text3'} variant='subtitle1' sx={{ mr: 2, lineHeight: '24px' }}>
          {`© ${new Date().getFullYear()}, Powered `}

          {` by `}
          <LinkStyled target='_blank' href='https://hubblehox.com/'>
            HubbleHox
          </LinkStyled>
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}
      >
        {/* <LinkStyled
          sx={{ mr: 3 }}
          target="_blank"
          href="https://hubblehox.com/"
        >
          License
        </LinkStyled>
        <LinkStyled
          sx={{ mr: 3 }}
          target="_blank"
          href="https://hubblehox.com/"
        >
          More Themes
        </LinkStyled>
        <LinkStyled
          sx={{ mr: 3 }}
          target="_blank"
          href="https://hubblehox.com/"
        >
          Documentation
        </LinkStyled>
        <LinkStyled target="_blank" href="https://hubblehox.com/">
          Support
        </LinkStyled> */}
        <IconButton onClick={() => handleRedirect('https://www.facebook.com/VibgyorGroupOfSchools/')}>
          <span style={{ color: '#212121', fontSize: '25px !important' }} className='icon-Facebook'></span>
        </IconButton>
        <IconButton onClick={() => handleRedirect('https://www.instagram.com/vibgyorgroupofschools')}>
          <span style={{ color: '#212121', fontSize: '25px !important' }} className='icon-Instagram---2'></span>
        </IconButton>
        <IconButton onClick={() => handleRedirect('https://www.linkedin.com/school/vibgyorgroupofschools/')}>
          <span style={{ color: '#212121' }} className='icon-Linkedin'></span>
        </IconButton>
        <IconButton onClick={() => handleRedirect('https://www.youtube.com/c/VIBGYORGroupOfSchools')}>
          <span style={{ color: '#212121', fontSize: '25px !important' }} className='icon-Youtube-1'></span>
        </IconButton>
      </Box>
    </Box>
  )
}

export default FooterContent
