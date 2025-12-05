'use client'

import { Box, Button, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function FeesStructure({ school, feeStructure }: any) {
  const router = useRouter()
  const [selectedFees, setSelectedFees] = useState<any>([])
  const [totalAmmount, setTotalAmmount] = useState<any>(0)

  const admisionFeeColumn: any = [
    {
      flex: 1,
      minWidth: 100,
      field: 'display_name',
      headerName: 'Fee Description',
      align: 'left',
      headerAlign: 'left'
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'fee_sub_type_name',
      headerName: 'Fees Sub Type',
      align: 'left',
      headerAlign: 'left'
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'fee_category_name',
      headerName: 'Fees Category',
      align: 'left',
      headerAlign: 'left'
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'fee_subcategory_name',
      headerName: 'Fees Sub Category',
      align: 'left',
      headerAlign: 'left'
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'pos_name',
      headerName: 'Period Of Service',
      align: 'left',
      headerAlign: 'left'
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'fee_amount_for_period',
      headerName: 'Amount',
      align: 'center',
      headerAlign: 'center'
    }
  ]

  const handleRowSelectionChange = (rowIds: any) => {
    // `rowIds` contains the selected row IDs, so we need to filter the rows
    const updatedSelectedRows = feeStructure.filter((row: any) => rowIds.includes(row.id))
    const totalAmountC = updatedSelectedRows.reduce((sum: any, item: any) => sum + item.fee_amount_for_period, 0)
    setTotalAmmount(totalAmountC)
    setSelectedFees(updatedSelectedRows) // Set the state with selected rows
  }

  return (
    <>
      <Grid container xs={12} spacing={5}>
        <Grid item xs={12} md={9}>
          <Box
            sx={{
              background: '#fff',
              padding: '24px',
              borderRadius: '10px',
              width: '100%',
              height: '100%'
            }}
          >
            <Box>
              <Typography
                variant='h6'
                color={'text.primary'}
                sx={{ lineHeight: '22px', mt: 4, textTransform: 'capitalize' }}
              >
                Fees Structure
              </Typography>
            </Box>
            <Box>
              <DataGrid
                autoHeight
                columns={admisionFeeColumn}
                checkboxSelection
                rows={feeStructure}
                hideFooterPagination
                className='dataTable'
                sx={{
                  boxShadow: 0,
                  mt: 5,
                  '& .MuiDataGrid-main': {
                    overflow: 'hidden'
                  }
                }}
                onRowSelectionModelChange={handleRowSelectionChange}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              background: '#fff',
              padding: '16px',
              borderRadius: '10px',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <Box>
              <Typography
                variant='caption'
                color={'customColors.text3'}
                sx={{ lineHeight: '16px', letterSpacing: '0.4px' }}
              >
                {' '}
                Total Amount Payable
              </Typography>
              <Typography color={'primary.dark'} sx={{ fontSize: '22px', fontWeight: 600, lineHeight: '28px' }}>
                {totalAmmount}
              </Typography>
            </Box>
            <Divider sx={{ mt: 3, mb: 3 }} />
            <Box>
              <Typography
                variant='subtitle1'
                color={'text.primary'}
                sx={{ lineHeight: '17.6px', textTransform: 'capitalize' }}
              >
                {' '}
                calculated fees
              </Typography>
            </Box>

            <Box
              className='fixedModal'
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                mt: 5,
                height: '510px',
                overflowY: 'auto'
              }}
            >
              <Box>
                {selectedFees && selectedFees?.length
                  ? selectedFees?.map((val: any, index: number) => {
                      return (
                        <Box
                          key={index}
                          sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <Typography
                            variant='body2'
                            color={'text.primary'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            {val?.display_name}
                          </Typography>
                          <Typography
                            variant='subtitle2'
                            color={'success.main'}
                            sx={{ lineHeight: '15.4px', textTransform: 'capitalize' }}
                          >
                            ₹ {val?.fee_amount_for_period}
                          </Typography>
                        </Box>
                      )
                    })
                  : null}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  )
}
