// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import { Button, DialogActions, DialogTitle, IconButton, Typography } from '@mui/material'
import { Box } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

type customModal = {
  openModal: boolean
  closeModal?: () => void
  handleSubmitClose?: () => void
  title: string
  content: string
}

function DeleteDialog({ openModal, closeModal, handleSubmitClose, title, content }: customModal) {
  // ** Hooks
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')

  return (
    <>
      <Dialog open={openModal} onClose={closeModal} aria-labelledby='customized-dialog-title'>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle sx={{ lineHeight: '16px' }} id='customized-dialog-title'>
            {title}
          </DialogTitle>
          {/* <IconButton disableFocusRipple disableRipple onClick={closeModal}>
          
            <HighlightOffIcon />
          </IconButton> */}
        </Box>
        <DialogContent>
          <Typography variant='body2'>{content}</Typography>
        </DialogContent>
        <DialogActions className='dialog-actions-dense' sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='outlined' color='inherit' onClick={closeModal}>
            Cancel
          </Button>
          <Button variant='contained' color='primary' onClick={handleSubmitClose}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DeleteDialog
