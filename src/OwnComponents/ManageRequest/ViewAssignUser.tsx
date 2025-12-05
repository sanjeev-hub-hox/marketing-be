'use Client'
import React, { useEffect, useState } from 'react'
import { Box, Card, Grid, InputAdornment, Switch, TextField } from '@mui/material'
import { GridColDef, DataGrid } from '@mui/x-data-grid'

import { gridPageCountSelector, GridPagination, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
import MuiPagination from '@mui/material/Pagination'
import { TablePaginationProps } from '@mui/material/TablePagination'
import UserIcon from 'src/layouts/components/UserIcon'
import { styled } from '@mui/material/styles'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SearchBox from '../SharedUIComponent/SearchBox'

function Pagination({
  page,
  onPageChange,
  className
}: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) {
  const apiRef = useGridApiContext()
  const pageCount = useGridSelector(apiRef, gridPageCountSelector)

  return (
    <MuiPagination
      color='primary'
      className={className}
      count={pageCount}
      page={page + 1}
      shape='rounded'
      onChange={(event, newPage) => {
        onPageChange(event as any, newPage - 1)
      }}
    />
  )
}

function CustomPagination(props: any) {
  return <GridPagination ActionsComponent={Pagination} {...props} />
}

export default function ViewAssignUser() {
  const [isSwitch, setIsSwitch] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [searhRole, setSearchRole] = useState<string>('')
  const { setPagePaths } = useGlobalContext()
  const [searchText, setSearchText] = useState('')

  //Handling Search Functionality
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchText('')
  }

  //Column for Data Grid
  const columns: GridColDef[] = [
    // {
    //   field: 'serialNumber',
    //   headerName: 'Sr No',
    //   flex: 1,
    //   align: 'left',
    //   headerAlign: 'left',
    //   minWidth: 80
    // },
    {
      field: 'empName',
      headerName: 'EMP Name',
      flex: 1,
      align: 'left',
      headerAlign: 'left',
      minWidth: 100
    },
    {
      field: 'empId',
      headerName: 'EMP ID',
      flex: 1,
      align: 'left',
      headerAlign: 'left',
      minWidth: 114
    },
    {
      field: 'lob',
      headerName: 'LOB',
      flex: 1,
      align: 'left',
      headerAlign: 'left',
      minWidth: 145
    },
    {
      field: 'school',
      headerName: 'School',
      flex: 1,
      align: 'left',
      headerAlign: 'left',
      minWidth: 100
    },
    {
      field: 'hrRole',
      headerName: 'HR Role',
      flex: 1,
      align: 'left',
      headerAlign: 'left',
      minWidth: 110
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      align: 'left',
      headerAlign: 'left',
      width: 80,
      renderCell: () => <Switch defaultChecked />
    }
  ]

  //Rows For DataGrid
  const rows = [
    {
      id: 1,

      // serialNumber: '01',
      empName: 'Nittal',
      empId: 'EMP 123',
      lob: 'LOB 123',
      school: 'VKH - Airoli',
      hrRole: 'Principal'
    },
    {
      id: 2,

      // serialNumber: '02',
      empName: 'Suman',
      empId: 'EMP 124',
      lob: 'LOB 124',
      school: 'VKH - Balewadi',
      hrRole: 'Manager'
    },
    {
      id: 3,

      // serialNumber: '03',
      empName: 'Imad',
      empId: 'EMP 125',
      lob: 'LOB 125',
      school: 'VKH - Borivali West',
      hrRole: 'Teacher'
    },
    {
      id: 4,

      // serialNumber: '04',
      empName: 'Divanshu',
      empId: 'EMP 126',
      lob: 'LOB 126',
      school: 'VKH - Chinchwad',
      hrRole: 'Vice Principal'
    },
    {
      id: 5,

      // serialNumber: '05',
      empName: 'Ankita',
      empId: 'EMP 127',
      lob: 'LOB 127',
      school: 'VKH - Chokkanahalli',
      hrRole: 'Grades Incharge'
    },
    {
      id: 6,

      // serialNumber: '06',
      empName: 'Chirag',
      empId: 'EMP 128',
      lob: 'LOB 128',
      school: 'VKH - Coiambatore',
      hrRole: 'EF'
    }
  ]

  //Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Permanant Role',
        path: '/permanent-role'
      },
      {
        title: 'User Assigned - Role Teaching Faculty',
        path: '/permanent-role/view-assign-user'
      }
    ])
  }, [])

  return (
    <>
      <Box sx={{ background: '#fff', borderRadius: '10px', paddingTop: '20px' }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12}>
            <Box
              sx={{
                mb: 3,
                ml: 3,
                padding: '0px 10px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}
            >
              {/* <TextField
                className='custom-textfield'
                value={searhRole}
                placeholder='Search Role'
                onChange={e => setSearchRole(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <UserIcon icon='mdi:magnify' />
                    </InputAdornment>
                  )
                }}
              /> */}
              <Box sx={{ mr: 2 }}>
                <SearchBox
                  placeHolderTitle='Search EMP Name'
                  searchText={searchText}
                  handleClearSearch={handleClearSearch}
                  handleInputChange={handleInputChange}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box>
          <DataGrid
            autoHeight
            columns={columns}
            rows={rows}
            pagination={true}
            checkboxSelection={true}
            pageSizeOptions={[7, 10, 25, 50]}
            paginationModel={paginationModel}
            slots={{ pagination: CustomPagination }}
            onPaginationModelChange={setPaginationModel}
            className='dataTable'
          />
        </Box>
      </Box>
    </>
  )
}
