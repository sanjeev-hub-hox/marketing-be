import { Fragment, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import {
  Button,
  DialogActions,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material'
import { Box } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { getRequest, postRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
  workflowLogId: string
  statusId: string
  rejection_reason_master: string
}

function RejectDialog({
  openModal,
  closeModal,
  header,
  workflowLogId,
  statusId,
  rejection_reason_master
}: customModal) {
  // ** Hooks
  const theme = useTheme()
  const DownArrow = () => (
    <span style={{ color: theme.palette.customColors.mainText }} className='icon-arrow-down-1'></span>
  )
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [rejectReasons, setRejectReasons] = useState<string>('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState({ reason: '', comment: '' })
  const [statusApplicableList, setStatusApplicableList] = useState<any>([])
  const { userInfo } = useGlobalContext()
  const [loading, setLoading] = useState(false) // Loading state

  useEffect(() => {
    const url = {
      url: `/workflow/applicableStatuses?type=${rejection_reason_master}`,
      serviceURL: 'admin'
    }
    statusApplicableList.length
      ? ''
      : getRequest(url)
          .then(res => setStatusApplicableList(res?.data?.data))
          .catch(err => console.log(err))
  }, [])

  const handleRejectReasons = (event: any) => {
    setRejectReasons(event.target.value as string)
    setError(prev => ({ ...prev, reason: '' })) // Clear error when field is updated
  }

  const handleCommentChange = (e: any) => {
    setComment(e.target.value)
    setError(prev => ({ ...prev, comment: '' })) // Clear error when field is updated
  }

  const validateFields = () => {
    let isValid = true
    const errors = { reason: '', comment: '' }

    if (!rejectReasons) {
      errors.reason = 'Please select a reject reason'
      isValid = false
    }
    if (!comment) {
      errors.comment = 'Please enter a comment'
      isValid = false
    }

    setError(errors)

    return isValid
  }

  const onSubmit = () => {
    if (!validateFields()) return // If validation fails, do not proceed

    setLoading(true) // Set loading to true when starting submission

    // API call to update the status
    postRequest({
      url: `/workflow/update-status/${workflowLogId}/${statusId}`,
      data: {
        reason: rejectReasons,
        comment: comment,
        created_by: userInfo?.userInfo?.id
      },
      serviceURL: 'admin'
    })
      .then(res => {
        closeModal && closeModal()
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false) // Reset loading state after submission
      })
  }

  return (
    <>
      <Dialog
        open={openModal}
        onClose={closeModal}
        aria-labelledby='responsive-dialog-title'
        sx={{ '& .MuiPaper-root.MuiDialog-paper': { width: '550px' } }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <DialogTitle id='responsive-dialog-title'>{header}</DialogTitle>
          <IconButton disableFocusRipple disableRipple onClick={closeModal}>
            <HighlightOffIcon style={{ color: '#666666' }} />
          </IconButton>
        </Box>

        <DialogContent>
          <Box sx={{ mb: 5 }}>
            <Grid container spacing={5} xs={12}>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!error.reason}>
                  <InputLabel required id='demo-simple-select-outlined-label'>
                    Reject Reasons
                  </InputLabel>
                  <Select
                    IconComponent={DownArrow}
                    label='Reject Reasons'
                    value={rejectReasons}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    onChange={handleRejectReasons}
                  >
                    {statusApplicableList?.map((reason_: any) => (
                      <MenuItem key={reason_?.id} value={reason_?.id}>
                        {reason_?.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {error.reason && (
                    <Typography variant='caption' color='error'>
                      {error.reason}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Comment'
                  value={comment}
                  placeholder='Comment Here'
                  onChange={handleCommentChange}
                  required
                  error={!!error.comment}
                  helperText={error.comment}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}
          >
            <Button onClick={closeModal} size='large' variant='outlined' color='primary' sx={{ mr: 2 }}>
              Close
            </Button>
            <Button
              onClick={onSubmit}
              size='large'
              variant='contained'
              color='primary'
              disabled={loading} // Disable button while loading
            >
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Submit'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RejectDialog
