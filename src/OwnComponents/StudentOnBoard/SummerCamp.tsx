'use client'

import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { Box } from '@mui/system'
import { DataGrid } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { postRequest } from 'src/services/apiService'
import { FEETYPES } from 'src/utils/constants'
import { getObjectByKeyVal } from 'src/utils/helper'

export default function SummerCamp({
  school,
  feeStructure,
  payload,
  setCalculatedList,
  selectedFees,
  setSelectedFees,
  calculatedList
}: any) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm()
  const formDatVal = watch()

  const { setGlobalState } = useGlobalContext()
  const [psaDetails, setPsaDetails] = useState<any>({})
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])
  const [batchOptions, setBatchOptions] = useState<any[]>([])
  const [subtypeOptions, setSubTypeOptions] = useState<any[]>([])

  const calculateAmmount = async () => {
    setGlobalState({ isLoading: true })

    const params4 = {
      url: `/fee_payment/finance/calculate`,
      serviceURL: 'finance',
      data: {
        academic_year_id: payload?.academic_year ? parseInt(payload?.academic_year) : 25,
        board_id: payload?.board,
        course_id: payload?.course,
        shift_id: payload?.shift,
        stream_id: payload?.stream,
        grade_id: payload?.grade,
        school_id: school,
        batch_id: formDatVal?.psa_batch,
        fee_type_id: FEETYPES?.summerCampFees,
        fee_sub_type_id: formDatVal?.psa_sub_type,
        fee_category_id: formDatVal?.psa_category,
        fee_subcategory_id: formDatVal?.psa_sub_category,
        period_of_service_id: formDatVal?.period_of_service
      }
    }
    try {
      const data = await postRequest(params4)
      if (data?.data) {
        const newObj = {
          id: FEETYPES?.summerCampFees,
          ...data?.data
        }

        const dd = getObjectByKeyVal(calculatedList, 'id', newObj?.id)
        if (!dd) {
          setCalculatedList((prevState: any) => {
            return [...prevState, newObj]
          })
        } else {
          const newList = [...calculatedList]
          const index = newList.findIndex((item: any) => item.id === FEETYPES?.summerCampFees)
          if (index !== -1) {
            newList.splice(index, 1)
          }
          setCalculatedList([...newList, newObj])
        }
      }

      // setCategoryOptions(data?.data?.feeCategory);
    } catch (error) {
      console.error('Error fetching Child lobs:', error)
    }
    setGlobalState({ isLoading: false })
  }

  useEffect(() => {
    setGlobalState({ isLoading: true })
    const handleSearch = async () => {
      const params4 = {
        url: `/api/fc-fees-masters/summer-camp-details`,
        serviceURL: 'mdm',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
        },
        data: {
          academic_year_id: payload?.academic_year ? parseInt(payload?.academic_year) : 25,
          board_id: payload?.board,
          course_id: payload?.course,
          shift_id: payload?.shift,
          stream_id: payload?.stream,
          grade_id: payload?.grade,
          school_id: school
        }
      }
      try {
        const data = await postRequest(params4)
        // setChild(data4?.data);
        setPsaDetails(data?.data)

        setSubTypeOptions(data?.data?.feeSubType)
      } catch (error) {
        console.error('Error fetching Child lobs:', error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    }

    handleSearch()
  }, [school, payload])

  const handleOptions = async (event: any, value: any, name: any) => {
    if (name === 'psa_sub_type') {
      if (value) {
        value = [value]
        const selectedIds = value?.map((val: any) => {
          const item: any = subtypeOptions.find((item: any) => item.fee_sub_type_id == val)

          return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
        })
        const subcategoryOptions = psaDetails.feeSubCategory.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        setCategoryOptions(subcategoryOptions)
      } else {
        setCategoryOptions([])
      }
    }

    if (name === 'psa_category') {
      if (value) {
        value = [value]
        const selectedIds = value?.map((val: any) => {
          const item: any = categoryOptions.find((item: any) => item.fee_subcategory_id == val)

          return item ? item.fee_subcategory_id : undefined // Return item.id if found, otherwise undefined
        })
        const subcategoryOptions = psaDetails.periodOfService.filter((element: any) => {
          return selectedIds.includes(element.fee_subcategory_id)
        })
        setPeriodOfServiceOptions(subcategoryOptions)
        const batchOptions = psaDetails.batches.filter((element: any) => {
          return selectedIds.includes(element.fee_subcategory_id)
        })
        setBatchOptions(batchOptions)
      } else {
        setPeriodOfServiceOptions([])
        setBatchOptions([])
      }
    }

    // if (name === "batch_id") {
    //     if (value) {
    //         value = value.split(',');
    //         const selectedIds = value?.map((val: any) => {
    //             const item: any = batchOptions.find(
    //                 (item: any) =>
    //                     item.batch_name === val
    //             );
    //             return item ? item.batch_id : undefined; // Return item.id if found, otherwise undefined
    //         });
    //         let subcategoryOptions = psaDetails.periodOfService.filter((element: any) => {
    //             return selectedIds.includes(element.batch_id)
    //         })
    //         setPeriodOfServiceOptions(subcategoryOptions)

    //     } else {
    //         setPeriodOfServiceOptions([]);
    //     }

    // }
  }

  return (
    <Box
      sx={{
        background: '#fff',
        padding: '24px',
        borderRadius: '10px',
        width: '100%',
        height: '100%'
      }}
    >
      <Box sx={{ mt: 5, mb: 4 }}>
        <Grid container xs={12} spacing={4}>
          <Grid item xs={12} sm={6}>
            <Controller
              name='psa_sub_type'
              control={control}
              rules={{ required: 'Please select at least one user' }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  id='autocomplete-multiple-filled'
                  getOptionLabel={(option: any) => {
                    console.log('option>>', option)
                    const label = subtypeOptions?.find(opt => opt.fee_sub_type_id === option)

                    return label?.fee_sub_type
                  }}
                  options={subtypeOptions?.map((option: any) => option.fee_sub_type_id)}
                  onChange={(event, value) => {
                    field.onChange(value)
                    handleOptions(event, value, 'psa_sub_type')
                  }}
                  renderOption={(props, option, { selected }) => {
                    const label = subtypeOptions?.find(opt => opt.fee_sub_type_id === option)

                    return (
                      <li {...props}>
                        <Checkbox checked={selected} />
                        {label?.fee_sub_type}
                      </li>
                    )
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={<Box sx={{ display: 'flex', alignItems: 'center' }}>PSA Sub Type</Box>}
                      placeholder='PSA Sub Type'
                      error={!!errors.psa_sub_type}
                    />
                  )}
                  renderTags={(value, getTagProps) => {
                    const displayLimit = 1 // Limit to show only first selected item
                    const displayItems = value.slice(0, displayLimit)
                    const moreItemsCount = value.length - displayLimit

                    return (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {displayItems.map((option, index) => (
                          <Chip
                            color='default'
                            deleteIcon={<span className='icon-trailing-icon'></span>}
                            variant='filled'
                            label={option}
                            {...getTagProps({ index })}
                            key={index}
                            style={{
                              maxWidth: 'calc(100% - 6px)', // Ensuring chip fits within the input
                              margin: '3px'
                            }}
                            sx={{
                              width: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          />
                        ))}
                        {moreItemsCount > 0 && (
                          <Tooltip
                            title={
                              <span style={{ whiteSpace: 'pre-line' }}>{value.slice(displayLimit).join('\n')}</span>
                            }
                          >
                            <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                          </Tooltip>
                        )}
                      </div>
                    )
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {categoryOptions && categoryOptions?.length ? (
              <Controller
                name='psa_category'
                control={control}
                rules={{ required: 'Please select at least one user' }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    id='autocomplete-multiple-filled'
                    getOptionLabel={(option: any) => {
                      console.log('option>>', option)
                      const label = categoryOptions?.find(opt => opt.fee_subcategory_id === option)

                      return label?.fee_subcategory
                    }}
                    options={categoryOptions?.map((option: any) => option.fee_subcategory_id)}
                    onChange={(event, value) => {
                      field.onChange(value)
                      handleOptions(event, value, 'psa_category')
                    }}
                    renderOption={(props, option, { selected }) => {
                      const label = categoryOptions?.find(opt => opt.fee_subcategory_id === option)

                      return (
                        <li {...props}>
                          <Checkbox checked={selected} />
                          {label?.fee_subcategory}
                        </li>
                      )
                    }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={<Box sx={{ display: 'flex', alignItems: 'center' }}>PSA Category</Box>}
                        placeholder='PSA Category'
                        error={!!errors.psa_category}
                      />
                    )}
                    renderTags={(value, getTagProps) => {
                      const displayLimit = 1 // Limit to show only first selected item
                      const displayItems = value.slice(0, displayLimit)
                      const moreItemsCount = value.length - displayLimit

                      return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {displayItems.map((option, index) => (
                            <Chip
                              color='default'
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              variant='filled'
                              label={option}
                              {...getTagProps({ index })}
                              key={index}
                              style={{
                                maxWidth: 'calc(100% - 6px)', // Ensuring chip fits within the input
                                margin: '3px'
                              }}
                              sx={{
                                width: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            />
                          ))}
                          {moreItemsCount > 0 && (
                            <Tooltip
                              title={
                                <span style={{ whiteSpace: 'pre-line' }}>{value.slice(displayLimit).join('\n')}</span>
                              }
                            >
                              <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                            </Tooltip>
                          )}
                        </div>
                      )
                    }}
                  />
                )}
              />
            ) : null}
          </Grid>

          <Grid item xs={12} sm={6}>
            {periodOfServiceOptions && periodOfServiceOptions?.length ? (
              <Controller
                name='period_of_service'
                control={control}
                rules={{ required: 'Please select at least one user' }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    id='autocomplete-multiple-filled'
                    getOptionLabel={(option: any) => {
                      console.log('option>>', option)
                      const label = periodOfServiceOptions?.find(opt => opt.period_of_service_id === option)

                      return label?.period_of_service
                    }}
                    options={periodOfServiceOptions?.map((option: any) => option.period_of_service_id)}
                    onChange={(event, value) => {
                      field.onChange(value)
                      // handleSchoolCategories(event, value, "academic_year");
                    }}
                    renderOption={(props, option, { selected }) => {
                      const label = periodOfServiceOptions?.find(opt => opt.period_of_service_id === option)

                      return (
                        <li {...props}>
                          <Checkbox checked={selected} />
                          {label?.period_of_service}
                        </li>
                      )
                    }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Period Of Service</Box>}
                        placeholder='Period Of Service'
                        error={!!errors.period_of_service}
                      />
                    )}
                    renderTags={(value, getTagProps) => {
                      const displayLimit = 1 // Limit to show only first selected item
                      const displayItems = value.slice(0, displayLimit)
                      const moreItemsCount = value.length - displayLimit

                      return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {displayItems.map((option, index) => (
                            <Chip
                              color='default'
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              variant='filled'
                              label={option}
                              {...getTagProps({ index })}
                              key={index}
                              style={{
                                maxWidth: 'calc(100% - 6px)', // Ensuring chip fits within the input
                                margin: '3px'
                              }}
                              sx={{
                                width: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            />
                          ))}
                          {moreItemsCount > 0 && (
                            <Tooltip
                              title={
                                <span style={{ whiteSpace: 'pre-line' }}>{value.slice(displayLimit).join('\n')}</span>
                              }
                            >
                              <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                            </Tooltip>
                          )}
                        </div>
                      )
                    }}
                  />
                )}
              />
            ) : null}
          </Grid>
          <Grid item xs={12} sm={6}>
            {batchOptions && batchOptions?.length ? (
              <Controller
                name='psa_batch'
                control={control}
                rules={{ required: 'Please select at least one user' }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    id='autocomplete-multiple-filled'
                    getOptionLabel={(option: any) => {
                      console.log('option>>', option)
                      const label = batchOptions?.find(opt => opt.batch_id === option)

                      return label?.batch_name
                    }}
                    options={batchOptions.map((option: any) => option.batch_id)}
                    onChange={(event, value) => {
                      field.onChange(value)
                      // handleSchoolCategories(event, value, "academic_year");
                    }}
                    renderOption={(props, option, { selected }) => {
                      const label = batchOptions?.find(opt => opt.batch_id === option)

                      return (
                        <li {...props}>
                          <Checkbox checked={selected} />
                          {label?.batch_name}
                        </li>
                      )
                    }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={<Box sx={{ display: 'flex', alignItems: 'center' }}>PSA Batch</Box>}
                        placeholder='PSA Batch'
                        error={!!errors.psa_batch}
                      />
                    )}
                    renderTags={(value, getTagProps) => {
                      const displayLimit = 1 // Limit to show only first selected item
                      const displayItems = value.slice(0, displayLimit)
                      const moreItemsCount = value.length - displayLimit

                      return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {displayItems.map((option, index) => (
                            <Chip
                              color='default'
                              deleteIcon={<span className='icon-trailing-icon'></span>}
                              variant='filled'
                              label={option}
                              {...getTagProps({ index })}
                              key={index}
                              style={{
                                maxWidth: 'calc(100% - 6px)', // Ensuring chip fits within the input
                                margin: '3px'
                              }}
                              sx={{
                                width: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            />
                          ))}
                          {moreItemsCount > 0 && (
                            <Tooltip
                              title={
                                <span style={{ whiteSpace: 'pre-line' }}>{value.slice(displayLimit).join('\n')}</span>
                              }
                            >
                              <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                            </Tooltip>
                          )}
                        </div>
                      )
                    }}
                  />
                )}
              />
            ) : null}
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button variant='contained' color='primary' onClick={calculateAmmount}>
          Submit
        </Button>
      </Box>
    </Box>
  )
}
