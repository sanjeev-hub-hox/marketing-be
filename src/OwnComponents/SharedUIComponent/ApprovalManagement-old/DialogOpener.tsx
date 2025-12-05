// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import SuccessLogo from '../../../../public/images/success.gif'
import Image from 'next/image'
import { IconButton } from '@mui/material'
import ApprovalWorkflow from './ApprovalWorkflow'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

type DialogBox = {
  openDialog: boolean
  handleClose?: () => void
  title?: string
  selectedIds?: any
}

function DialogOpener({ openDialog, handleClose, selectedIds }: DialogBox) {
  // ** Hooks
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  return (
    <>
      <Dialog
        fullScreen={true}
        open={openDialog}
        onClose={() => handleClose && handleClose()}
        aria-labelledby='responsive-dialog-title'
        sx={{
          zIndex: 1234
        }}
      >
        <DialogContent>
          <IconButton onClick={handleClose} disableFocusRipple disableRipple sx={{ float: 'right' }}>
            <HighlightOffIcon style={{ color: '#666666' }} />
          </IconButton>
          <ApprovalWorkflow selectedWorkflowsList={selectedIds} />
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            color='primary'
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}
            onClick={handleClose}
          >
            {' '}
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DialogOpener
