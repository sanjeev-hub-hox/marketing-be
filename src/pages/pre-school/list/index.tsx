import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  IconButton
} from '@mui/material'
import { DataGrid, GridPaginationModel } from '@mui/x-data-grid'
import { getRequest } from 'src/services/apiService'
import { useRouter } from 'next/router'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const PreSchoolTieUpList = () => {
  const router = useRouter()
  const { setPagePaths } = useGlobalContext()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [rowCount, setRowCount] = useState(0)

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE_OPTIONS[0]
  })

  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
    setPagePaths([
      {
        title: 'Pre-School Tie-Up List',
        path: '/pre-school/list' 
      }
    ])
  }, [])

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      fetchList(paginationModel.page, paginationModel.pageSize, search)
    }, 250)

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, search])

  const buildFilterQuery = (q: string) => {
    if (!q || !q.trim()) return ''
    const s = encodeURIComponent(q.trim())
    
    return `&filters[$or][0][pre_school_name][$containsi]=${s}&filters[$or][1][pre_school_display_name][$containsi]=${s}`
  }

  const fetchList = async (pageIndex = 0, limit = 10, q = '') => {
    try {
      setLoading(true)
      const start = pageIndex * limit
      const filterQuery = buildFilterQuery(q)
      const params = {
        url: `/api/ac-pre-school-tie-ups?populate[school_id]=true&sort=createdAt:desc&pagination[start]=${start}&pagination[limit]=${limit}${filterQuery}`,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        }
      }
      const response = await getRequest(params)
      const data = response?.data || []
      const meta = response?.meta?.pagination || {}

      const formatted = data.map((item: any) => ({
        id: item.id,
        preSchoolName: item.attributes.pre_school_name,
        preSchoolDisplayName: item.attributes.pre_school_display_name,
        location: item.attributes.address_1 || '',
        startDate: item.attributes.validity_start_date
          ? new Date(item.attributes.validity_start_date).toLocaleDateString('en-GB')
          : '',
        endDate: item.attributes.validity_end_date
          ? new Date(item.attributes.validity_end_date).toLocaleDateString('en-GB')
          : '',
        mouStatus: item.attributes.mou_status === 1 ? 'Active' : 'Inactive',
        spocName: item.attributes.spoc_name || '',
        spocNumber: item.attributes.spoc_mobile_no || '',
        totalSchools: item.attributes.school_id.data.length || ''
      }))

      setRows(formatted)
      setRowCount(meta?.total ?? formatted.length)
    } catch (err) {
      console.error('Error fetching pre-school tie-ups:', err)
      setRows([])
      setRowCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPaginationModel(prev => ({ ...prev, page: 0 }))
  }

  const columns = [
    { field: 'preSchoolName', headerName: 'Tied Up Pre-School Name', flex: 1, minWidth: 180 },
    { field: 'preSchoolDisplayName', headerName: 'Pre-School Display Name', flex: 1, minWidth: 180 },
    { field: 'location', headerName: 'Location', flex: 1, minWidth: 160 },
    { field: 'startDate', headerName: 'Start Date', flex: 0.8, minWidth: 120 },
    { field: 'endDate', headerName: 'End Date', flex: 0.8, minWidth: 120 },
    { field: 'spocName', headerName: 'SPOC Name', flex: 0.8, minWidth: 120 },
    { field: 'spocNumber', headerName: 'SPOC Mobile Number', flex: 0.8, minWidth: 120 },
    { field: 'totalSchools', headerName: 'No. Of VIBGYOR schools (Count) where tie-ups are applicable', flex: 0.8, minWidth: 120 },
    {
      field: 'mouStatus',
      headerName: 'MOU Status',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params: any) => (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: '8px',
            bgcolor: params.value === 'Active' ? '#adf2afff' : '#e88f88ff',
            color: '#fff',
            fontWeight: 600,
            textAlign: 'center',
            width: '88px'
          }}
        >
          {params.value}
        </Box>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 0.6,
      minWidth: 140,
      sortable: false,
      renderCell: (params: any) => (
        <Box>
          <IconButton color="primary" onClick={() => router.push(`/pre-school/view/${params.row.id}`)} size="small">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton color="primary" onClick={() => router.push(`/pre-school/edit/${params.row.id}`)} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', mt: 4, p: 3, backgroundColor: '#fff', borderRadius: 2, boxShadow: 3 }}>
   

       <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap', // allows wrapping on smaller screens
          gap: 2
        }}
      >
        <TextField
          size="small"
          placeholder="Search by Pre-School or Display Name"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{
            flex: 1, // takes remaining space
            maxWidth: '55%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '80px'
            }
          }}
        />
      
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/pre-school/create')}
          sx={{ whiteSpace: 'nowrap' }} // prevent button from shrinking
        >
          + Create
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <DataGrid
  autoHeight
  rows={rows}
  columns={columns}
  pagination
  paginationMode="server"
  paginationModel={paginationModel}
  onPaginationModelChange={(model: GridPaginationModel) => {
    setLoading(true)        // ← start loading effect immediately
    setPaginationModel(model)
  }}
  pageSizeOptions={PAGE_SIZE_OPTIONS}
  rowCount={rowCount}
  disableRowSelectionOnClick
  loading={loading}        // ← MUI shows overlay circular loader when true
  sx={{
    '& .MuiDataGrid-cell': {
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      lineHeight: '1.4rem',
      display: 'flex',
      alignItems: 'center'
    },
    '& .MuiDataGrid-virtualScroller': {
      overflowX: 'auto !important'
        }
    }}
    
    />

    </Box>
      )}
</Box>
  )
}

export default PreSchoolTieUpList
