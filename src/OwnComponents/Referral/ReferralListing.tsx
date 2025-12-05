'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { getRequest, postRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'

interface ReferralRow {
  id: string
  enquiryid: string
  student_name: string
  enquiry_number: string
  parent_name: string
  parent_number: string
  academic_year: string
  school: string
  grade: string
  board: string
  leadOwner: string
  enquirySource: string
  enquirySubSource: string
  sourceNameNumber: string
  status: string
  referrerPhone?: string
  referralPhone?: string
  referrerVerified?: boolean
  referralVerified?: boolean
  referrerManuallyVerified?: boolean
  referralManuallyVerified?: boolean
}

const ReferralListing = () => {
  const [referrals, setReferrals] = useState<ReferralRow[]>([])
  const [filteredReferrals, setFilteredReferrals] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [verifyDialog, setVerifyDialog] = useState<{ open: boolean; row: ReferralRow | null }>({
    open: false,
    row: null
  })
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const { setGlobalState, setPagePaths } = useGlobalContext()

  const handleVerify = (row: ReferralRow) => {
    setVerifyDialog({ open: true, row })
    setError('')
  }

  const confirmVerification = async () => {
    if (!verifyDialog.row) return

    setVerifying(true)
    setError('')

    try {
      const params = {
        url: `marketing/enquiry/verifyReferral`,
        data: {
          enquiryId: verifyDialog.row.enquiryid,
          verificationType: 'both'
        }
      }

      const response = await postRequest(params)

      if (response?.success) {
        const refreshParams = { url: `marketing/enquiry/getSuccessfulReferrals` }
        const refreshResponse = await getRequest(refreshParams)

        if (Array.isArray(refreshResponse?.data)) {
          const formatted = refreshResponse.data.map((item: any, index: number) => ({
            id: item.enquiryid || index + 1,
            ...item
          }))
          setReferrals(formatted)
          setFilteredReferrals(formatted)
        }

        setVerifyDialog({ open: false, row: null })
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Verification failed. Phone numbers may not match.')
    } finally {
      setVerifying(false)
    }
  }

  const columns = useMemo(
    () => [
      { field: 'student_name', headerName: 'Name of the Student', flex: 1, minWidth: 180 },
      { field: 'enquiry_number', headerName: 'Enquiry Number', flex: 1, minWidth: 150 },
      { field: 'parent_name', headerName: 'Parent Name', flex: 1, minWidth: 160 },
      { field: 'parent_number', headerName: 'Parent Phone Number', flex: 1, minWidth: 180 },
      { field: 'academic_year', headerName: 'Admission - Academic Year', flex: 1, minWidth: 180 },
      { field: 'school', headerName: 'School', flex: 1, minWidth: 160 },
      { field: 'grade', headerName: 'Grade', flex: 1, minWidth: 160 },
      { field: 'board', headerName: 'Board', flex: 1, minWidth: 160 },
      { field: 'leadOwner', headerName: 'Lead Owner', flex: 1, minWidth: 160 },
      { field: 'enquirySource', headerName: 'Enquiry Source', flex: 1, minWidth: 160 },
      { field: 'enquirySubSource', headerName: 'Enquiry Sub-source', flex: 1, minWidth: 160 },
      { field: 'sourceNameNumber', headerName: 'Source Name/Number', flex: 1, minWidth: 160 },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 180,
        renderCell: (params: { row: ReferralRow }) => {
          const status = params.row.status

          // ✅ ORIGINAL STATUS COLOR SYSTEM (FROM YOUR FIRST FILE)
          const statusMap: Record<string, { bg: string; color: string; label: string }> = {
            'Referral Verified': { bg: '#cfcff6', color: '#0f0fd2', label: 'Verified by Referrer' },
            'Parent Verified': { bg: 'rgba(144, 238, 144, 0.3)', color: '#006400', label: 'Verified by Parent' },
            'Parent Verification Failed': {
              bg: 'rgba(255, 182, 193, 0.3)',
              color: '#8B0000',
              label: 'Phone Mismatch'
            },
            'Both Verified': { bg: '#ffeacc', color: '#ff9500', label: 'Verified By Both' },
            'In-Active': { bg: 'rgba(255, 182, 193, 0.3)', color: '#8B0000', label: 'In-Active' },
            Pending: { bg: 'rgba(211, 211, 211, 0.3)', color: '#696969', label: 'Pending' }
          }

          const style = statusMap[status] || { bg: '#f0f0f0', color: '#000', label: status }

          console.log('params_data____', params)

          return (
            <Tooltip
              title={
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      rowGap: { xs: 0.5, sm: 1, md: 1.2 }
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#fff',
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        display: 'block'
                      }}
                    >
                      Referrer: {params.row.referrerPhone || 'N/A'}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: '#fff',
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        display: 'block'
                      }}
                    >
                      Referral: {params.row.referralPhone || 'N/A'}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: '#fff',
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        display: 'block'
                      }}
                    >
                      Parent: {params.row.parent_number}
                    </Typography>
                  </Box>
                </Box>
              }
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#333',
                    color: '#fff',
                    borderRadius: '8px',

                    /* ✅ RESPONSIVE WIDTH + PADDING */
                    maxWidth: {
                      xs: 220,
                      sm: 260,
                      md: 320
                    },
                    padding: {
                      xs: '6px 8px',
                      sm: '8px 10px',
                      md: '10px 12px'
                    }
                  }
                },
                arrow: {
                  sx: {
                    color: '#333'
                  }
                }
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: {
                    xs: '0.65rem',
                    sm: '0.7rem',
                    md: '0.75rem'
                  },
                  borderRadius: '45px',
                  px: { xs: 2, sm: 2.5, md: 3 },
                  py: { xs: 1, sm: 1.2, md: 1.5 },
                  display: 'inline-block',
                  backgroundColor: style.bg,
                  color: style.color,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {style.label}
              </Typography>
            </Tooltip>
          )
        }
      },
      {
        field: 'action',
        headerName: 'Action',
        flex: 0.7,
        minWidth: 120,
        renderCell: (params: { row: ReferralRow }) => {
          if (params.row.status === 'Both Verified') {
            return (
              <Typography
                sx={{
                  border: '1px solid green',
                  color: 'green',
                  backgroundColor: 'rgba(0,128,0,0.10)',
                  px: 4.5,
                  py: 2.5,
                  borderRadius: '45px'
                }}
              >
                Verified
              </Typography>
            )
          }

          return (
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleVerify(params.row)}
              sx={{ borderColor: 'green', color: 'green' }}
            >
              Verify
            </Button>
          )
        }
      }
    ],
    []
  )

  useEffect(() => {
    setPagePaths([{ title: 'Referral Listing', path: '/referral-listing' }])
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setGlobalState({ isLoading: true })
      const res = await getRequest({ url: `marketing/enquiry/getSuccessfulReferrals` })

      if (Array.isArray(res?.data)) {
        const formatted = res.data.map((item: any, index: number) => ({
          id: item.enquiryid || index + 1,
          ...item
        }))
        setReferrals(formatted)
        setFilteredReferrals(formatted)
      }

      setLoading(false)
      setGlobalState({ isLoading: false })
    }

    fetchData()
  }, [])

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', mt: 4, p: 3, backgroundColor: '#fff', borderRadius: 2, boxShadow: 3 }}>
      <DataGrid rows={filteredReferrals} columns={columns} autoHeight pageSizeOptions={[10]} />
    </Box>
  )
}

export default ReferralListing
