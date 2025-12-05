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
  Typography,
  CircularProgress,
  TextField
} from '@mui/material'
import { Box } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { getRequest, postRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import toast from 'react-hot-toast'

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
  workflowLogId: string
  statusId: string
}

function ApproveDialog({ openModal, closeModal, header, workflowLogId, statusId }: customModal) {
  // ** Hooks
  const theme = useTheme()
  const DownArrow = () => (
    <span style={{ color: theme.palette.customColors.mainText }} className='icon-arrow-down-1'></span>
  )
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [approveComment, setApproveComment] = useState<string>('')
  const [error, setError] = useState<{
    approveComment?: string
    comment?: string
  }>({})
  const [loading, setLoading] = useState(false) // Loading state
  const { userInfo } = useGlobalContext()
  const [comment, setComment] = useState('')

  const handleApproveComment = (event: any) => {
    setApproveComment(event.target.value as string)
    setError(prev => ({ ...prev, approveComment: '' })) // Clear error when a value is selected
  }

  const handleCommentChange = (event: any) => {
    setComment(event.target.value)
    setError(prev => ({ ...prev, comment: '' })) // Clear error when comment is typed
  }

  const validateFields = () => {
    let isValid = true
    const newError = {} as { approveComment?: string; comment?: string }

    // if (!approveComment) {
    //   newError.approveComment = "Please select an approval reason";
    //   isValid = false;
    // }
    if (!comment) {
      newError.comment = 'Please provide a comment'
      isValid = false
    }

    setError(newError)

    return isValid
  }

  const onSubmit = () => {
    if (!validateFields()) return

    setLoading(true) // Set loading to true when starting submission

    // API call to update the status
    postRequest({
      url: `/workflow/update-status/${workflowLogId}/${statusId}`,
      data: {
        // reason: approveComment,
        comment: comment,
        created_by: userInfo?.userInfo?.id
      },
      serviceURL: 'admin'
    })
      .then(res => {
        toast.success('approved successfully!!!')
        closeModal && closeModal()
      })
      .catch(err => {
        toast.error('something unexpected occured!!!')
        console.log(err)
      })
      .finally(() => {
        setLoading(false) // Reset loading state after submission
      })
  }

  const [statusApplicableList, setStatusApplicableList] = useState<any>([])

  useEffect(() => {
    const url = {
      url: `/workflow/applicableStatuses?type=workflow_approve_reason`,
      serviceURL: 'admin'
    }
    if (!statusApplicableList.length) {
      getRequest(url)
        .then(res => setStatusApplicableList(res?.data?.data))
        .catch(err => console.log(err))
    }
  }, [])

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
              {/* <Grid item xs={12}>
                <FormControl fullWidth required error={!!error.approveComment}>
                  <InputLabel required id="demo-simple-select-outlined-label">
                    Approve Reasons
                  </InputLabel>
                  <Select
                    IconComponent={DownArrow}
                    label="Approve Reasons"
                    value={approveComment}
                    id="demo-simple-select-outlined"
                    labelId="demo-simple-select-outlined-label"
                    onChange={handleApproveComment}
                  >
                    {statusApplicableList?.map((reason_: any) => (
                      <MenuItem key={reason_?.id} value={reason_?.id}>
                        {reason_?.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {error.approveComment && (
                    <Typography variant="caption" color="error">
                      {error.approveComment}
                    </Typography>
                  )}
                </FormControl>
              </Grid> */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Comment'
                  value={comment}
                  placeholder='Comment Here'
                  onChange={handleCommentChange}
                  required
                  error={!!error.comment} // Set error state
                  helperText={error.comment} // Display error message
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

export default ApproveDialog
