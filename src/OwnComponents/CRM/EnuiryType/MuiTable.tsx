// App.js or MuiTable.js
import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'

interface TAT {
  tat: number
  type: 'Hr' | 'Day'
}

interface Row {
  id: number
  stagesApplicable: string
  isMandatory: 'Yes' | 'No'
  orderOfStage: string
  weightage: string
  tatInHrDay: TAT
  initiateWorkflow: string
}

const MuiTable = () => {
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      stagesApplicable: 'S1',
      isMandatory: 'Yes',
      orderOfStage: 'One',
      weightage: '20%',
      tatInHrDay: { tat: 3, type: 'Hr' },
      initiateWorkflow: 'workflow1'
    },
    {
      id: 2,
      stagesApplicable: 'S2',
      isMandatory: 'No',
      orderOfStage: 'One',
      weightage: '10%',
      tatInHrDay: { tat: 3, type: 'Hr' },
      initiateWorkflow: 'workflow1'
    },
    {
      id: 3,
      stagesApplicable: 'S3',
      isMandatory: 'Yes',
      orderOfStage: 'One',
      weightage: '50%',
      tatInHrDay: { tat: 3, type: 'Hr' },
      initiateWorkflow: 'workflow1'
    },
    {
      id: 4,
      stagesApplicable: 'S4',
      isMandatory: 'Yes',
      orderOfStage: 'One',
      weightage: '10%',
      tatInHrDay: { tat: 3, type: 'Hr' },
      initiateWorkflow: 'workflow1'
    },
    {
      id: 5,
      stagesApplicable: 'S5',
      isMandatory: 'Yes',
      orderOfStage: 'One',
      weightage: '5%',
      tatInHrDay: { tat: 3, type: 'Hr' },
      initiateWorkflow: 'workflow1'
    },
    {
      id: 6,
      stagesApplicable: 'S6',
      isMandatory: 'Yes',
      orderOfStage: 'One',
      weightage: '5%',
      tatInHrDay: { tat: 3, type: 'Hr' },
      initiateWorkflow: 'workflow1'
    }
  ])

  const handleSelectChange = (e: SelectChangeEvent, row: Row, field: keyof Row) => {
    const { value } = e.target
    setRows(prevRows => prevRows.map(r => (r.id === row.id ? { ...r, [field]: value } : r)))
  }

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, row: Row) => {
    const { value } = e.target
    setRows(prevRows =>
      prevRows.map(r => (r.id === row.id ? { ...r, tatInHrDay: { ...r.tatInHrDay, tat: Number(value) } } : r))
    )
  }

  const handleTATTypeChange = (e: SelectChangeEvent, row: Row) => {
    const { value } = e.target
    setRows(prevRows =>
      prevRows.map(r => (r.id === row.id ? { ...r, tatInHrDay: { ...r.tatInHrDay, type: value as 'Hr' | 'Day' } } : r))
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650, maxWidth: '100%' }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell sx={{ flex: 1 }}>Stages Applicable</TableCell>
            <TableCell sx={{ flex: 1 }}>Is Mandatory</TableCell>
            <TableCell sx={{ flex: 1 }}>Order Of Stage</TableCell>
            <TableCell sx={{ flex: 1 }}>Weightage</TableCell>
            <TableCell sx={{ flex: 1 }}>TAT in Hr/Days</TableCell>
            <TableCell sx={{ flex: 1 }}>Initiate Workflow</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.stagesApplicable}</TableCell>
              <TableCell sx={{ flex: 1 }}>
                <FormControl fullWidth size='small'>
                  <Select
                    sx={{ height: '36px', paddingRight: '0px' }}
                    value={row.isMandatory}
                    onChange={e => handleSelectChange(e, row, 'isMandatory')}
                  >
                    <MenuItem value='Yes'>Yes</MenuItem>
                    <MenuItem value='No'>No</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell sx={{ flex: 1 }}>
                <FormControl fullWidth size='small'>
                  <Select
                    sx={{ height: '36px' }}
                    value={row.orderOfStage}
                    onChange={e => handleSelectChange(e, row, 'orderOfStage')}
                  >
                    <MenuItem value='1'>1</MenuItem>
                    <MenuItem value='2'>2</MenuItem>
                    <MenuItem value='3'>3</MenuItem>
                    <MenuItem value='4'>4</MenuItem>
                    <MenuItem value='5'>5</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell sx={{ flex: 1 }}>
                <FormControl fullWidth size='small'>
                  <Select
                    sx={{ height: '36px', paddingRight: '0px' }}
                    value={row.weightage}
                    onChange={e => handleSelectChange(e, row, 'weightage')}
                  >
                    <MenuItem value='5%'>5%</MenuItem>
                    <MenuItem value='10%'>10%</MenuItem>
                    <MenuItem value='15%'>15%</MenuItem>
                    <MenuItem value='20%'>20%</MenuItem>
                    <MenuItem value='25%'>25%</MenuItem>
                    <MenuItem value='30%'>30%</MenuItem>
                    <MenuItem value='35%'>35%</MenuItem>
                    <MenuItem value='40%'>40%</MenuItem>
                    <MenuItem value='45%'>45%</MenuItem>
                    <MenuItem value='50%'>50%</MenuItem>
                    <MenuItem value='55%'>55%</MenuItem>
                    <MenuItem value='60%'>60%</MenuItem>
                    <MenuItem value='65%'>65%</MenuItem>
                    <MenuItem value='70%'>70%</MenuItem>
                    <MenuItem value='75%'>75%</MenuItem>
                    <MenuItem value='80%'>80%</MenuItem>
                    <MenuItem value='85%'>85%</MenuItem>
                    <MenuItem value='90%'>90%</MenuItem>
                    <MenuItem value='95%'>95%</MenuItem>
                    <MenuItem value='100%'>100%</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell sx={{ flex: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={7}>
                    <TextField
                      name='tat'
                      onChange={e => handleTextFieldChange(e, row)}
                      size='small'
                      type='text'
                      value={row.tatInHrDay.tat}
                      InputProps={{
                        style: {
                          fontSize: '14px',
                          padding: '6px 10px',
                          margin: '0',
                          height: '36px'
                        }
                      }}
                      sx={{ height: '36px', padding: 0 }}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={row.tatInHrDay.type}
                        onChange={e => handleTATTypeChange(e, row)}
                        sx={{
                          height: '36px',
                          fontSize: '14px',
                          paddingRight: '0px'
                        }}
                      >
                        <MenuItem value='Hr'>Hr</MenuItem>
                        <MenuItem value='Day'>Day</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </TableCell>
              <TableCell sx={{ flex: 1 }}>
                <FormControl fullWidth size='small'>
                  <Select
                    sx={{ height: '36px', paddingRight: '0px' }}
                    value={row.initiateWorkflow}
                    onChange={e => handleSelectChange(e, row, 'initiateWorkflow')}
                  >
                    <MenuItem value='workflow1'>Stage workflow 1</MenuItem>
                    <MenuItem value='workflow2'>Stage workflow 2</MenuItem>
                    <MenuItem value='workflow3'>Stage workflow 3</MenuItem>
                    <MenuItem value='workflow4'>Stage workflow 4</MenuItem>
                    <MenuItem value='workflow5'>Stage workflow 5</MenuItem>
                    <MenuItem value='workflow6'>Stage workflow 6</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default MuiTable
