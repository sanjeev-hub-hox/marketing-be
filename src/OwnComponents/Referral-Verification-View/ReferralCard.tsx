import { Card, Typography, Button, TextField, Avatar, Alert } from '@mui/material'
import { useEffect, useState } from 'react'

type ReferralCardProps = {
  studentName: string
  academicYear: string
  enquiryId: string
  schoolLocation: string
  grade: string
  stream: string
  referrerName: string
  inputLabel: string
  phoneNumberHelperText: string
  phoneNumber: string
  onPhoneChange: (value: string) => void
  errorMessage?: string
  onSubmit: () => void
  onCancel?: () => void
}

export default function ReferralCard({
  studentName,
  academicYear,
  enquiryId,
  schoolLocation,
  grade,
  stream,
  referrerName,
  inputLabel,
  phoneNumberHelperText,
  phoneNumber,
  onPhoneChange,
  errorMessage,
  onSubmit,
  onCancel
}: ReferralCardProps) {

  const [finalAvatar, setFinalAvatar] = useState('/images/default-avatar.png')

  // You can add avatar logic later if needed
  useEffect(() => {
    // For now, using default avatar
    setFinalAvatar('/images/default-avatar.png')
  }, [])

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 500,
        margin: '0 auto',
        padding: '0 16px'
      }}
    >
      <Card
        variant='outlined'
        style={{
          backgroundColor: '#ebebfa',
          padding: '40px 24px 60px',
          borderRadius: '12px 12px 0 0',
          textAlign: 'center',
        }}
      >
        <img
          src='/images/vibgyor-logo.png'
          alt='logo'
          style={{
            width: '100%',
            maxWidth: 350,
            height: 'auto',
            marginBottom: 20
          }}
        />

        <Typography variant='subtitle1'>
          <h2 style={{ fontWeight: 500, margin: 0 }}>Verification Message</h2>
        </Typography>

        <Typography variant='body2' style={{ marginTop: 10 }}>
          <h3 style={{ fontWeight: 400, margin: 0, color: '#9a9595ff' }}>
            Confirm The Details You've Provided
          </h3>
        </Typography>
      </Card>

      <Card
        variant='outlined'
        style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: 0
        }}
      >
        {/* Student Name and Academic Year */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <Avatar
            src={finalAvatar}
            alt='avatar'
            sx={{
              width: 150,
              height: 150,
              margin: '0 auto',
            }}
          />
        </div>

        <Typography
          variant='h6'
          align='center'
          style={{
            fontWeight: 'bold',
            fontSize: 25
          }}
        >
          {studentName}
          <span
            style={{
              fontWeight: 'normal',
              fontSize: '0.7em',
              color: 'gray',
              marginLeft: '4px'
            }}
          >
            (AY {academicYear})
          </span>
        </Typography>

        {/* Enquiry Details */}
        <Typography
          variant='body2'
          align='center'
          style={{
            color: 'gray',
            maxWidth: 380,
            margin: '8px auto 0',
            wordBreak: 'break-word'
          }}
        >
          {enquiryId} | {schoolLocation} | {grade} | {stream}
        </Typography>

        {/* Referrer Information */}
        <div
          style={{
            marginTop: 20,
            backgroundColor: '#f4f4f4',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 14,
            flexWrap: 'wrap',
            gap: 8
          }}
        >
          <Typography
            variant='caption'
            style={{
              fontSize: 14,
              color: '#333',
              fontWeight: 500,
              minWidth: 120
            }}
          >
            {inputLabel}
          </Typography>

          <Typography
            variant='body1'
            style={{
              fontSize: 14,
              color: '#333',
              wordBreak: 'break-word',
              flex: 1,
              textAlign: 'right'
            }}
            title={referrerName}
          >
            {referrerName}
          </Typography>
        </div>

        {/* Phone Number Input */}
        <Typography 
          style={{ 
            marginTop: 25,
            color: '#8a8787ff'
          }} 
          variant='body2'
        >
          Please confirm the referral by entering the{' '}
          <b>{phoneNumberHelperText}</b> phone number.
        </Typography>

        <TextField
          fullWidth
          placeholder="Enter Phone Number"
          variant='outlined'
          size='small'
          style={{ marginTop: 14 }}
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          type="tel"
          inputProps={{
            maxLength: 10,
            pattern: '[0-9]*'
          }}
          required
        />

        {/* Error Message */}
        {errorMessage && (
          <Alert 
            severity="error" 
            style={{ 
              marginTop: 16,
              backgroundColor: '#ffe6e6',
              color: '#b00000'
            }}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: typeof window !== 'undefined' && window.innerWidth < 480 ? 'column' : 'row',
            justifyContent: 'space-between',
            marginTop: 30,
            paddingTop: 20,
            borderTop: '1px solid #bdbdbd',
            marginLeft: -24,
            marginRight: -24,
            paddingLeft: 24,
            paddingRight: 24,
            gap: 12
          }}
        >
          <Button
            variant='outlined'
            fullWidth
            onClick={onCancel}
            style={{
              borderColor: '#bdbdbd',
              color: '#757575',
              borderRadius: 25
            }}
          >
            Cancel
          </Button>

          <Button
            variant='contained'
            onClick={onSubmit}
            fullWidth
            style={{
              backgroundColor: '#006eceff',
              borderRadius: 25
            }}
          >
            Submit
          </Button>
        </div>
      </Card>
    </div>
  )
}