import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton } from '@mui/material'
import CreateStopListing from './CreateStopListing'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

const CreateStop = ({ open, handleClose, school, schoolLocation, activeStudent, academicYear,schoolParentId }: any) => {
  return (
    <div>
      <Dialog open={open} onClose={handleClose} maxWidth='xl' fullWidth sx={{ zIndex: 1300 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle id='responsive-dialog-title'>
            {' '}
            <Box>Create Stop</Box>
          </DialogTitle>
          <IconButton disableFocusRipple disableRipple onClick={handleClose}>
            {/* <UserIcon icon='mdi:close-circle-outline' /> */}
            <HighlightOffIcon style={{ color: '#666666' }} />
          </IconButton>
        </Box>
        <DialogContent>
          <CreateStopListing
            school={school}
            handleClose={handleClose}
            schoolLocation={schoolLocation}
            activeStudent={activeStudent}
            academicYear={academicYear}
            schoolParentId={schoolParentId}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='inherit'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default CreateStop
