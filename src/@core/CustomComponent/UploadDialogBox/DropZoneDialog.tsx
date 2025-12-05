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
import FileUploaderMultiple from './FileUploaderMultiple'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

type customModal = {
  title: string
  subTitle?: string
  openModal: boolean
  closeModal?: () => void
  handleSubmitClose?: any
  allowedTypes?: any
}

function DropZoneDialog({ title, subTitle, openModal, closeModal, handleSubmitClose, allowedTypes }: customModal) {
  // ** Hooks
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [maxWidths, setMaxWidths] = useState<any>('md')
  const [files, setFiles] = useState<File[]>([])

  const handleSetFiles = (files: any) => {
    setFiles(files)
  }

  return (
    <>
      <Dialog maxWidth={maxWidths} open={openModal} onClose={closeModal} aria-labelledby='customized-dialog-title'>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle sx={{ color: '#313030', lineHeight: '20px' }} id='customized-dialog-title'>
            {title} <br />
            <span>{subTitle}</span>
          </DialogTitle>
          {/* <IconButton disableFocusRipple disableRipple onClick={closeModal}>
            <HighlightOffIcon sx={{ marginTop: '-25px' }} />
          </IconButton> */}
        </Box>
        <DialogContent>
          <FileUploaderMultiple handleSetFiles={handleSetFiles} allowedTypes={allowedTypes} />
        </DialogContent>
        <DialogActions
          className='dialog-actions-dense'
          sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '50px' }}>
            {/* <InsertDriveFileIcon sx={{ color: '#292D32' }} /> */}

            {/* <Typography sx={{ textTransform: 'capitalize' }} variant='button' color='primary.main'>
              Download Template
            </Typography> */}
            {/* <Button
              variant='text'
              color='primary'
              disableRipple
              disableFocusRipple
              disableTouchRipple
              startIcon={<span className='icon-import-1' style={{ marginRight: '5px' }}></span>}
            >
              Download Template
            </Button> */}
          </Box>
          <Box>
            <Button variant='outlined' color='inherit' onClick={closeModal}>
              Cancel
            </Button>
            <Button
              disabled={files && files.length == 0}
              sx={{ ml: 3 }}
              variant='contained'
              color='primary'
              onClick={() => handleSubmitClose(files)}
            >
              Submit
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DropZoneDialog
