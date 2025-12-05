// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  DialogTitle,
  Grid,
  Chip,
  IconButton,
  Typography
} from '@mui/material'
import { Box } from '@mui/material'
import StudentLogo from '../Image/student.png'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import Image from 'next/image'
import SampleImage from '../../Image/sampleImage.png'

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
}

function ViewDocumentDialog({ openModal, closeModal, header }: customModal) {
  // ** Hooks

  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        open={openModal}
        onClose={closeModal}
        maxWidth={maxWidths}
        aria-labelledby='responsive-dialog-title'
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle id='responsive-dialog-title'>{header}</DialogTitle>
          <IconButton disableFocusRipple disableRipple onClick={closeModal}>
            {/* <UserIcon icon='mdi:close-circle-outline' /> */}
            {/* <HighlightOffIcon style={{ color: '#666666' }} /> */}
            <span className='icon-close-circle' style={{ color: '#666666' }}></span>
          </IconButton>
        </Box>

        <DialogContent>
          <Box>
            <Image src={SampleImage} alt='Document Image' />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewDocumentDialog
