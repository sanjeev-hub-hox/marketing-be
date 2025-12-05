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
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material'
import { Box } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { getRequest, postRequest } from 'src/services/apiService'
import toast from 'react-hot-toast'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

type customModal = {
  openModal: boolean
  closeModal?: () => void
  header?: string
  workflowLogId: string
}

function SendBackDialog({ openModal, closeModal, header, workflowLogId }: customModal) {
  // ** Hooks
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const [comment, setComment] = useState('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [error, setError] = useState<{ comment?: string; file?: string }>({})
  const [loading, setLoading] = useState(false) // Loading state for submission
  const [fileLoading, setFileLoading] = useState(false) // Loading state for file upload

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { userInfo } = useGlobalContext()

  const handleAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleUpload = async (file: File) => {
    setFileLoading(true) // Start file loading
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await postRequest({
        url: '/workflow/upload-document',
        serviceURL: 'admin',
        data: formData,
        headers: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      })
      setFileName(response.data.file) // Update the displayed file name
      setSelectedFile(response.data.file) // Store the uploaded file path or name
    } catch (error) {
      toast.error('File upload failed')
    } finally {
      setFileLoading(false) // End file loading
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      await handleUpload(file)
      // setFileName("dummy"); // Update the displayed file name
      // setSelectedFile("dummy"); // Store the uploaded file path or name
      setError(prev => ({ ...prev, file: '' })) // Clear file error
    } else {
      setSelectedFile(null) // Reset if no file is selected
      setFileName('') // Reset the file name
    }
  }

  const validateFields = () => {
    let isValid = true
    const errors = { comment: '', file: '' }

    if (!comment) {
      errors.comment = 'Please enter a comment'
      isValid = false
    }
    if (!selectedFile) {
      errors.file = 'Please attach a file'
      isValid = false
    }

    setError(errors)

    return isValid
  }

  const onSubmit = () => {
    if (!validateFields()) return // If validation fails, do not proceed

    setLoading(true) // Set loading to true when starting submission

    // API call to send back
    postRequest({
      url: `/workflow/send-back/${workflowLogId}`,
      data: {
        comment: comment,
        file: selectedFile,
        created_by: userInfo?.userInfo?.id
      },
      serviceURL: 'admin'
    })
      .then(res => {
        if (res.status === 200) {
          toast.success('Successfully sent back!')
        }

        if (res?.error?.message) {
          toast.error(res?.error?.message, { duration: 2000 })
        }
        closeModal && closeModal()
      })
      .catch(err => {
        toast.error('Opps! something went wrong.')
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
                <TextField
                  fullWidth
                  label='Comment'
                  value={comment}
                  placeholder='Comment Here'
                  onChange={e => setComment(e.target.value)}
                  required
                  error={!!error.comment} // Set error state
                  helperText={error.comment} // Display error message
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type='text'
                  fullWidth
                  label='Attachment'
                  placeholder='Attachment'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <span className='icon-export-1'></span>
                      </InputAdornment>
                    )
                  }}
                  onClick={handleAttachment}
                  value={fileName}
                  required
                  error={!!error.file} // Set error state
                  helperText={error.file} // Display error message
                />
                <input
                  type='file'
                  ref={fileInputRef}
                  style={{ display: 'none' }} // Hide the file input element
                  onChange={handleFileChange}
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
              disabled={loading || fileLoading} // Disable button while loading
            >
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Submit'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SendBackDialog
