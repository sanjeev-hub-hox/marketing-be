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
import SuccessLogo from '../../../public/images/success.gif'
import Image from 'next/image'
import { Box, Typography } from '@mui/material'

type DialogBox = {
  openDialog: boolean
  handleClose?: () => void
  handleReset?: () => void
  title?: string
}

function SuccessDialog({ openDialog, handleClose, handleReset, title }: DialogBox) {
  // ** Hooks
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      <Dialog fullScreen={fullScreen} open={openDialog} onClose={handleClose} aria-labelledby='responsive-dialog-title'>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Image src={SuccessLogo} width={100} height={100} alt='success' />
          </Box>
          <DialogContentText>
            {' '}
            <Typography
              sx={{ color: 'customColors.sliderMainColor', fontWeight: '600', letterSpacing: '0.1px' }}
              variant='body2'
            >
              {title}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense' sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant='outlined' color='inherit' onClick={handleReset}>
            Reset
          </Button>
          <Button variant='contained' color='primary' onClick={handleClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SuccessDialog
