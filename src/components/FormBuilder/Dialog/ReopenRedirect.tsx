// ** React Imports
import { FC } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import { Box, Typography , Link as MUILink} from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import IconButton from '@mui/material/IconButton'
import NextLink from 'next/link'
import { useGlobalContext } from 'src/@core/global/GlobalContext'


type LeadReopenedDialogProps = {
  openDialog: boolean
  handleClose: () => void
  leadData: any
  skipReopenCheckRef:any
  saveFormData:any
}
const LeadReopenedDialog: FC<LeadReopenedDialogProps> = ({ 
  openDialog, 
  handleClose, 
  leadData, 
  skipReopenCheckRef, 
  saveFormData 
}) => {
  const { setGlobalState } = useGlobalContext()

  const handleCloseDialog = () => {
    handleClose();
  
    if (leadData?.message !== 'Enquiry Already Exists' && 
    leadData?.message !== 'Student already admitted' && 
    leadData?.message !== 'Unactive Vibgyor Student') {
      skipReopenCheckRef.current=true;
      setGlobalState({ isLoading: true })
      saveFormData(); 
    }
  }

  let rootlink = process.env.NEXT_PUBLIC_FRONT_MARKETING_URL
  if (leadData?.message == 'Student already admitted' || leadData?.message == 'Unactive Vibgyor Student') {
    rootlink = process.env.NEXT_PUBLIC_FRONT_ACADEMICS_URL
  }

  return (
<Dialog
  open={openDialog}
  onClose={handleClose}
  maxWidth='xs'
  fullWidth
  aria-labelledby='lead-reopened-dialog-title'
  PaperProps={{
    sx: {
      borderRadius: 2,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    }
  }}
>
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    p: 2.5,
    pb: 1.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
    gap: 1
  }}>
    <DialogTitle 
      id='lead-reopened-dialog-title' 
      sx={{ 
        p: 0, 
        fontSize: '1.25rem', 
        fontWeight: 600,
        color: 'text.primary',
        flex: 1,
        lineHeight: 1.4,
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto'
      }}
    >
      {leadData?.message}
    </DialogTitle>
    <IconButton 
      onClick={handleClose}
      size="small"
      sx={{ 
        color: 'text.secondary',
        flexShrink: 0,
        mt: -0.5,
        '&:hover': {
          color: 'text.primary',
          bgcolor: 'action.hover'
        }
      }}
    >
      <HighlightOffIcon fontSize="small" />
    </IconButton>
  </Box>

<DialogContent sx={{ px: 3, py: 2.5 }}>
  {leadData?.data?.length > 0 ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {leadData.data.map((item: any, index: number) => (
        <Box 
          key={index}
          component={NextLink}
          href={`${rootlink}${item?.url}`}
          sx={{ 
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.50',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            },
            textDecoration: 'none',
            color: 'black',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Box 
              sx={{ 
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'primary.main',
                cursor: 'pointer',
                wordBreak: 'break-word',
                px: 2,
                py: 1,
                borderRadius: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  transform: 'scale(1.02)'
                }
              }}
            >
              {item?.id}
            </Box>

            <Box 
              component="span" 
              sx={{ 
                px: 2,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: 'success.50',
                border: '1px solid',
                borderColor: 'success.200',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'success.700',
                whiteSpace: 'nowrap',
                textTransform: 'capitalize',
                letterSpacing: '0.02em'
              }}
            >
              {item?.status}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  ) : (
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.disabled',
            fontWeight: 400 
          }}
        >
          ∅
        </Typography>
      </Box>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          fontWeight: 500 
        }}
      >
        No data available
      </Typography>
      <Typography 
        variant="caption" 
        color="text.disabled"
      >
        There are no items to display
      </Typography>
    </Box>
  )}
</DialogContent>

  <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
    <Button 
      onClick={handleCloseDialog} 
      variant='contained' 
      color='secondary' 
      disabled={leadData?.message === 'Enquiry Already exists' || leadData?.message === 'Student already admitted' || leadData?.message === 'Unactive Vibgyor Student'}
      fullWidth
      sx={{ 
        py: 1,
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '0.95rem',
        borderRadius: 1.5,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      OK
    </Button>
  </DialogActions>
</Dialog>
  )
}

export default LeadReopenedDialog
