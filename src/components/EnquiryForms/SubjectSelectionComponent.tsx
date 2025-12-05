import React, { useState, useEffect } from 'react'
import { FormControl, InputLabel, MenuItem, Select, Typography, Box, Button } from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import {
  DataGrid,
  GridColDef,
  GridValidRowModel,
  GridCellParams,
  GridRenderCellParams,
  useGridApiRef
} from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import { getObjectByKeyVal } from 'src/utils/helper'
import { Controller, useForm } from 'react-hook-form'

interface SubjectSelectionComponentProps {
  allsubjects: any[] // Adjust the type according to your data structure
  classDetails: any[]
  hanldeFinalData?: any
  handleCancel?: any
  optionalSubjectCount?:any
  isSubjectApiLoading: boolean;
}

const SubjectSelectionComponent: React.FC<SubjectSelectionComponentProps> = ({
  allsubjects,
  classDetails,
  hanldeFinalData,
  handleCancel,
  optionalSubjectCount,
  isSubjectApiLoading,
}) => {
  const numberOfOptions = 3
  const [selectedSubjects, setSelectedSubjects] = useState<any>([])

  const [subjectSelectionOptions, setSubjectSelectionOptions] = useState<any[]>([])
  const [optionalCompulsoryOptions, setOptionalCompulsoryOptions] = useState<any[]>([])
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: string }>({})

  interface SubjectRow {
    id: number
    grade: string
    compulsorySubject: string
    optionalSubject: string
    optionalSubject2: string
    spa1: string
    spa2: string
    spa3: string
  }

  const [subjectRow, setSubjectRow] = useState<SubjectRow[]>([])
  const [compSubjects, setCompSubjects] = useState<any>(null)

  const handleSubjectChange = (id: number, subject: string, field: keyof SubjectRow) => {
    setSubjectRow(prevRows => prevRows.map(row => (row.id === id ? { ...row, [field]: subject } : row)))
  }
  const handleNewChange = (params: any, val: any) => {
    const data = getObjectByKeyVal(allsubjects, 'subject_id', val)
    const fnData = [...compSubjects, data]
    hanldeFinalData(fnData)
  }

  type subejctSelectionDetails = {
    optional_subject: {
      [rowId: string | number]: {
        [index: number]: string | undefined // Subject ID or undefined
      }
    }
  }

  const { control: subjectSelectionControl, handleSubmit: subjectSelectionSubmit } = useForm<subejctSelectionDetails>({
    defaultValues: {
      optional_subject: {}
    }
  })

const handleOptionalSubjectChange = (event: any, index: number) => {
  const selectedValue = event.target.value as string
  setSelectedOptions(prevSelectedOptions => ({
    ...prevSelectedOptions,
    [index]: selectedValue
  }))
}


  const getFilteredSubjects = (optionNumber: number): any => {
    const tempSelectedOptions = Object.entries(selectedOptions)
      .filter(([key]) => Number(key) !== optionNumber)
      ?.map(([, value]) => value)
      const optionalSubjects = allsubjects.filter((item: any) => item.is_compulsory != 1)
        console.log(optionalSubjects,'optionalSubjects>>')
    const selectedSubjectGroups = optionalSubjects
      .filter((element: any) => tempSelectedOptions.includes(element.ac_subject_id) && element.group_name)
      ?.map(item => item.group_name)
    const result = optionalSubjects.filter(
      subject =>
        subject.option_number === optionNumber &&
        !tempSelectedOptions.includes(subject.ac_subject_id) &&
        !selectedSubjectGroups.includes(subject.group_name)
    )

    
    return result
  }

  const generateOptionalSubjectColumns = (optionalCompulsoryOptions: any[]): GridColDef[] => {
    const uniqueGroupIds = [...new Set(optionalCompulsoryOptions.flatMap(option => option.group_id))]

    return optionalSubjectCount.map(
      (groupId:any, index:any) => ({
        flex: 1,
        field: `optionalSubject_${index + 1}`, // Unique field for each group
        headerName: `Optional Subject Group ${index + 1}`,
        headerAlign: 'center',
        align: 'center',
        minWidth: 250,
        renderCell: (params:any) => {
          console.log("groupId>>",groupId)
          
return (
            <Controller
              name={`optional_subject.${params.id}.${index}`}
              control={subjectSelectionControl}
              render={({ field }) => (
                <Select labelId={`select-label-${params.id}-group}`} {...field} style={{ width: '100%' }} onChange={event => {
                  field.onChange(event.target.value)
                  //handleOptionalSubjectChange(event, groupId)
                }}>
                  {getFilteredSubjects(groupId)
                    ?.map((option: any) => (
                      <MenuItem key={option.subject_id} value={option.ac_subject_id}>
                        {option.subject_name}
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
          )

          return params.value
        }
      })
    )
  }

  const subjectColumns: GridColDef[] = [
    {
      flex: 1,
      field: 'grade',
      headerName: 'Grade',
      align: 'center',
      headerAlign: 'center',
      minWidth: 150
    },
    {
      flex: 1,
      field: 'compulsorySubject',
      headerName: 'Compulsory Subject',
      headerAlign: 'left',
      align: 'left',
      minWidth: 250,
      renderCell: params => (
        <div
          style={{
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            lineHeight: 1.5
          }}
        >
          {params.value}
        </div>
      )
    },
    ...generateOptionalSubjectColumns(optionalCompulsoryOptions)
    // {
    //   flex: 1,
    //   field: 'optionalSubject2',
    //   headerName: 'Optional Subject',
    //   headerAlign: 'center',
    //   align: 'center',
    //   minWidth: 250,
    //   renderCell: (params: GridRenderCellParams) =>
    //     params.row.grade === 'Grade 8' ? (
    //       <Select
    //         labelId={`select-label-${params.id}-role`}
    //         value={params.value}
    //         onChange={event =>
    //           handleSubjectChange(params.id as number, event.target.value as string, 'optionalSubject2')
    //         }
    //       >
    //         {getoptionalSubjects(params.id, 'optionalSubject2').map((options: any, index: number) => (
    //           <MenuItem key={index} value={options.subject_id}>
    //             {options.subject_name}
    //           </MenuItem>
    //         ))}
    //       </Select>
    //     ) : (
    //       params.value
    //     )
    // }
  ]

  const handleChange = (index: number) => (event: SelectChangeEvent<string>) => {
    const newSelectedSubjects = [...selectedSubjects]
    newSelectedSubjects[index] = event.target.value
    setSelectedSubjects(newSelectedSubjects)
  }

  const getoptionalSubjects = (rowId: any, currentField: keyof SubjectRow) => {
    const row = subjectRow.find(row => row.id === rowId)

    if (!row) {
      return [] // If the row isn't found, return an empty array
    }

    let selectedSubjectsInRow: any = []
    if (currentField == 'optionalSubject') {
      selectedSubjectsInRow = [
        row.optionalSubject2
        // Add more fields if there are more optional subjects
      ]
    } else {
      selectedSubjectsInRow = [
        row.optionalSubject
        // Add more fields if there are more optional subjects
      ]
    }

    console.log('Selected Subjects in Row:', selectedSubjectsInRow)

    return optionalCompulsoryOptions.filter(subject => {
      // Check if the subject is already selected in another field within the same row
      const isSubjectSelectedInOtherFields = selectedSubjectsInRow.some(
        (selectedSubject: number, index: number) =>
          selectedSubject === subject.subject_id && currentField !== `optionalSubject${index + 1}`
      )

      return !isSubjectSelectedInOtherFields
    })
  }

  // const fetchthedropDownOptions = (index: number) => {
  //   let compulsuryGroupCount = new Set(
  //     subjects
  //       .filter((subject) => subject.is_Optional_compulsory === 1)
  //       .map((subject) => subject.subject_group_name)
  //   ).size;

  //   let compulsoryGroups = new Set(
  //     subjects
  //       .filter((subject) => subject.is_Optional_compulsory === 1)
  //       .map((subject) => subject.subject_group_name)
  //   );

  //   const emptySubjectCount = selectedSubjects.filter(
  //     (subject) => subject === ""
  //   ).length;

  //   let selectedGroups = new Set(
  //     selectedSubjects
  //       .map((selectedSubject) => {
  //         const subject = subjects.find(
  //           (s) => s.subject_name === selectedSubject
  //         );
  //         return subject?.subject_group_name;
  //       })
  //       .filter((groupName) => groupName !== null)
  //   );

  //   // Step 3: Calculate the number of compulsory groups that are not selected
  //   let compulsoryGroupsNotSelected = [...compulsoryGroups].filter(
  //     (groupName) => groupName !== null && !selectedGroups.has(groupName)
  //   ).length;

  //   if (emptySubjectCount === compulsoryGroupsNotSelected) {
  //     let subjectOptions = subjects.filter(
  //       (subject) =>
  //         subject.is_Optional_compulsory === 1 &&
  //         subject.option_number === index + 1 &&
  //         subject.subject_group_name !== null &&
  //         compulsoryGroups.has(subject.subject_group_name) &&
  //         !selectedGroups.has(subject.subject_group_name) &&
  //         !selectedSubjects.includes(subject.subject_name)
  //     );

  //     const updatedOptions = [...subjectSelectionOptions];

  //     // Update the specific index with the new value
  //     updatedOptions[index] = subjectOptions;

  //     // Set the updated array as the new state
  //     setSubjectSelectionOptions(updatedOptions);
  //   } else {
  //     const selectedGroupNames = selectedSubjects
  //       .map((selectedSubject) => {
  //         const subject = subjects.find(
  //           (s) => s.subject_name === selectedSubject
  //         );
  //         return subject?.subject_group_name ?? ""; // Convert null to empty string
  //       })
  //       .filter((groupName) => groupName !== ""); // Remove empty strings

  //     let optionsubjects = subjects.filter(
  //       (subject: any) => subject.option_number === index + 1
  //     );

  //     let subjectOptions = optionsubjects.filter((subject) => {
  //       const groupName = subject.subject_group_name ?? ""; // Convert null to empty string
  //       return (
  //         !selectedGroupNames.includes(groupName) ||
  //         (!selectedSubjects.includes(subject.subject_name) &&
  //           selectedSubjects[index] === subject.subject_name)
  //       );
  //     });

  //     console.log("subjectSelectionOptions");
  //     console.log(subjectSelectionOptions);

  //     const updatedOptions = [...subjectSelectionOptions];

  //     // Update the specific index with the new value
  //     updatedOptions[index] = subjectOptions;

  //     // Set the updated array as the new state
  //     setSubjectSelectionOptions(updatedOptions);
  //   }
  // };

  useEffect(() => {
    // This effect runs when `subjects` changes or is set for the first time
    if (allsubjects.length > 0) {
      console.log('Subjects received:', allsubjects)

      // const optionalCompulsorySubjects = allsubjects.filter((item: any) => item.is_optional_compulsory === 1)
      // setOptionalCompulsoryOptions(optionalCompulsorySubjects)

      const optionalCompulsorySubjects = allsubjects?.filter((item: any) => item.is_compulsory != 1)
      setOptionalCompulsoryOptions(optionalCompulsorySubjects)
      const dd = allsubjects?.filter((item: any) => item.is_compulsory === 1)
      setCompSubjects(dd)
      const compulsorysubjects = allsubjects
        ?.filter((item: any) => item.is_compulsory === 1)
        .map((item: any) => item.subject_name)
        .join(', ')

      const mappedRows: any = classDetails.map((item: any, idx: number) => ({
        id: idx + 1,
        grade: item.className,
        compulsorySubject: compulsorysubjects,
        optionalSubject: []
      }))
      setSubjectRow(mappedRows)
    }
  }, [allsubjects])

  const saveSubjectDetails = async (selectedSubjects: any) => {
    const resultArray:any = [];
    Object.keys(selectedOptions).forEach((key:any) => {
  resultArray.push(getObjectByKeyVal(allsubjects, 'ac_subject_id', selectedOptions[key]));
    });

    const fnData = [...compSubjects, ...resultArray]
    hanldeFinalData(fnData)
    // const formattedValues = Object.keys(selectedSubjects?.optional_subject || {}).flatMap(rowId => {
    //   const rowSubjects = selectedSubjects?.optional_subject[rowId]

    //   return rowSubjects
    //     ? Object.entries(rowSubjects)
    //         .filter(([_, subjectId]) => subjectId !== undefined) // Exclude undefined subject_id
    //         .map(([option, subjectId]) => ({
    //           id: 0,
    //           option_number: Number(option) + 1, // Convert key to a number
    //           subject_id: subjectId, // Use the value directly
    //           student_id: Number(selectedRowId),
    //           academic_year_id: studentProfileDetails?.academic_year_id,
    //           school_id: studentProfileDetails?.crt_school_id
    //         }))
    //     : []
    // })

    // try {
    //   const params3 = {
    //     url: `/subject-master/update-student-subject`,
    //     serviceURL: 'academics',
    //     data: { student_subject_master: formattedValues }
    //   }
    //   const response = await postRequest(params3)
    //   if (response?.data) {
    //     setSuccessTitle('Student Subject Details Updated Successfully')
    //     setSuccessDialog(true)
    //   } else {
    //     console.log('error', response)
    //   }
    // } catch (error) {
    //   console.log(error, 'error')
    // } finally {
    //   setGlobalState({
    //     isLoading: false
    //   })
    // }
  }

return (
  <>
    <Box sx={{ mt: 6, mb: 4 }}>
      <Grid container xs={12} spacing={6}>
        <Grid item xs={12}>

          {isSubjectApiLoading  ? (
            <Typography variant="h6" align="center" sx={{ py: 10 }}>
              Loading subjects...
            </Typography>
          ) : (
            <form onSubmit={subjectSelectionSubmit(saveSubjectDetails)}>
              <>
                <DataGrid
                  autoHeight
                  columns={subjectColumns}
                  rows={subjectRow}
                  rowHeight={80}
                  className={screenWidth < 1520 ? 'datatabaleWShadow' : 'dataTable'}
                  sx={{ boxShadow: 0 }}
                  hideFooter
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: '20px' }}>
                  <Button onClick={handleCancel} variant='outlined' sx={{ mr: 4 }} color='inherit'>
                    Cancel
                  </Button>

                  <Button type='submit' variant='contained' color='secondary'>
                    Save & Next
                  </Button>
                </Box>
              </>
            </form>
          )}
        </Grid>
      </Grid>
    </Box>
  </>
)

}

export default SubjectSelectionComponent
