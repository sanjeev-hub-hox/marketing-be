import React, { useState, useRef } from 'react'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { Typography } from '@mui/material'

import { styled } from '@mui/material/styles'

type FileUploadProps = {
  label: string
  required: boolean
  accept: string
  type: string
  onChange?: (base64: string | null) => void
}

const TruncatedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    whiteSpace: 'nowrap',
    width: '100%',
    cursor: 'pointer',
    pointerEvents: 'auto'
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink+.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend .MuiTypography-root ':
    {
      fontSize: '12px'
    }
}))

const FileUploadTextField = ({
  label,
  required,
  accept,
  type,
  onChange
}: FileUploadProps & { onChange: (file: File | null) => void }) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files ? event.target.files[0] : null
    if (newFile) {
      setFile(newFile)
      convertFileToBase64(newFile)
    } else {
      setFile(null)
      if (onChange) onChange(null)
    }
  }

  const convertFileToBase64 = (file: File) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      if (onChange) onChange(base64) // Pass the Base64 string to the parent component
    }
    reader.onerror = error => {
      console.error('Error converting file to Base64:', error)
      if (onChange) onChange(null) // Pass null on error
    }
  }

  const handleTextFieldClick = (event: any) => {
    event.preventDefault() // Prevent default behavior to avoid double triggering
    event.stopPropagation() // Stop the event from bubbling up
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDeleteFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Clear the file input
    }
  }

  const truncatedFileName = file ? (file.name.length > 100 ? file.name.substring(0, 20) + '...' : file.name) : ''

  return (
    <>
      <Box sx={{ background: 'white', width: '100%', position: 'relative' }}>
        <TruncatedTextField
          required={required}
          id='outlined-required'
          label={
            <Typography sx={{ color: 'customColors.mainText' }} component={'span'} noWrap title={label}>
              {label}
            </Typography>
          }
          value={loading ? '...Uploading' : truncatedFileName}
          variant='outlined'
          onClick={handleTextFieldClick}
          fullWidth
          title={file?.name}
          disabled={loading}
          InputLabelProps={{
            title: label
          }}
        />
        {type === 'pdf' && !file && (
          <IconButton
            aria-label='delete-file'
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <span className='icon-document-1'></span>
          </IconButton>
        )}
        {file && (
          <IconButton
            aria-label='delete-file'
            onClick={handleDeleteFile}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            disabled={loading}
          >
            <span className='icon-close-circle'></span>
          </IconButton>
        )}
        <input
          type='file'
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept={accept}
        />
      </Box>
      {type === 'image' && (
        <Typography variant='body2' color='textSecondary' mt={1}>
          .JPG, .JPEG, .PNG
        </Typography>
      )}
      {type === 'video' && (
        <Typography variant='body2' color='textSecondary' mt={1}>
          .MP4
        </Typography>
      )}
      {type === 'document' && (
        <Typography variant='body2' color='textSecondary' mt={1}>
          .DOC, .PDF
        </Typography>
      )}
    </>
  )
}

export default FileUploadTextField
