// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import ErrorLogo from '../../../../public/images/Error.gif'
import Image from 'next/image'
import { Box, Typography } from '@mui/material'

type DialogBox = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
}

function ErrorDialogBox({ openDialog, handleClose, title }: DialogBox) {
  // ** Hooks
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      <Dialog fullScreen={fullScreen} open={openDialog} onClose={handleClose} aria-labelledby='responsive-dialog-title'>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Image src={ErrorLogo} width={100} height={100} alt='Error' />
          </Box>
          <DialogContentText>
            {' '}
            <Typography
              sx={{
                width: '250px',
                textAlign: 'center',
                color: 'customColors.sliderMainColor',
                fontWeight: '600',
                letterSpacing: '0.1px'
              }}
              variant='body2'
            >
              {title}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense' sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant='contained' color='secondary' onClick={handleClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ErrorDialogBox
