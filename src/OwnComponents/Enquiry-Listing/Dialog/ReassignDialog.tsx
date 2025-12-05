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
  IconButton
} from '@mui/material'
import { Box } from '@mui/material'

import HighlightOffIcon from '@mui/icons-material/HighlightOff'

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
  handleReassignClose?: () => void
}

function ReassignDialog({ openModal, closeModal, header, handleReassignClose }: customModal) {
  // ** Hooks
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [maxWidths, setMaxWidths] = useState<any>('lg')
  const [empName, setEmpName] = useState<string>('EMP101-Nittal')

  //Handler for CTA Details Button

  const handleEmployeeName = (event: any) => {
    setEmpName(event.target.value as string)
  }

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
            <HighlightOffIcon style={{ color: '#666666' }} />
          </IconButton>
        </Box>

        <DialogContent>
          <Box sx={{ mb: 5 }}>
            <Grid container spacing={10} xs={12}>
              <Grid item xs={12}>
                <FormControl required fullWidth>
                  <InputLabel id='demo-simple-select-outlined-label'>Employee Name</InputLabel>
                  <Select
                    label='Employee Name'
                    defaultValue={empName}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleEmployeeName}
                    IconComponent={DownArrow}
                  >
                    <MenuItem value=''>Select Employee Name</MenuItem>
                    <MenuItem value='EMP101-Nittal'>EMP101-Nittal</MenuItem>
                    <MenuItem value='EMP103-Pallavi'>EMP103-Pallavi</MenuItem>
                    <MenuItem value='EMP104-Anjali'>EMP104-Anjali</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button onClick={closeModal} size='large' variant='outlined' color='inherit' sx={{ mr: 2 }}>
              Close
            </Button>
            <Button onClick={handleReassignClose} size='large' variant='contained' color='secondary'>
              Reassign
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ReassignDialog
