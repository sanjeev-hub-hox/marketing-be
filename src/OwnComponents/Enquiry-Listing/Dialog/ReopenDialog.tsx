// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import { Box, Typography } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import IconButton from '@mui/material/IconButton'

type ReopenDialogProps = {
  openDialog: boolean
  handleClose: () => void
  handleConfirm: () => void
  enquiryIds?: string[] | number[]
}

const ReopenDialog = ({ openDialog, handleClose, handleConfirm, enquiryIds }: ReopenDialogProps) => {
  return (
    <Dialog
      open={openDialog}
      onClose={handleClose}
      maxWidth='xs'
      aria-labelledby='reopen-dialog-title'
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <DialogTitle id='reopen-dialog-title'>Reopen Enquiries</DialogTitle>
        <IconButton onClick={handleClose}>
          <HighlightOffIcon style={{ color: '#666' }} />
        </IconButton>
      </Box>
      <DialogContent>
        <Typography variant='body1'>
          Are you sure you want to reopen the selected enquiries?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant='outlined' color='inherit'>
          No
        </Button>
        <Button onClick={handleConfirm} variant='contained' color='secondary'>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ReopenDialog
