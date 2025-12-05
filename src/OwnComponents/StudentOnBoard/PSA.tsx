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

export default function PSA({
  school,
  feeStructure,
  payload,
  setCalculatedList,
  selectedFees,
  setSelectedFees,
  calculatedList
}: any) {
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm()

  const formDatVal = watch()

  const [subTypeOptions, setSubTypeOptions] = useState<any[]>([])
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([])
  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])
  const [psaBatchOptions, setPsaBatchOptions] = useState<any[]>([])

  const [psaDetails, setPsaDetails] = useState<any>({})

  const [vasAmount, setVasAmount] = useState<number>(0)
  const [isFinalSubmit, setFinalSubmit] = useState<boolean>(false)
  const { setPagePaths, setGlobalState } = useGlobalContext()

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
        fee_type_id: FEETYPES?.postSchoolActivityFees,
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
          id: FEETYPES?.postSchoolActivityFees,
          ...data?.data
        }

        const dd = getObjectByKeyVal(calculatedList, 'id', newObj?.id)
        if (!dd) {
          setCalculatedList((prevState: any) => {
            return [...prevState, newObj]
          })
        } else {
          const newList = [...calculatedList]
          const index = newList.findIndex((item: any) => item.id === FEETYPES?.postSchoolActivityFees)
          if (index !== -1) {
            newList.splice(index, 1)
          }
          setCalculatedList([...newList, newObj])
        }
      }
      // setPsaDetails(data?.data);
      // setVasAmount(data?.data?.amount)
      if (data?.data?.amount) {
        setVasAmount(data?.data?.amount)
        setFinalSubmit(true)
      }
      // setCategoryOptions(data?.data?.feeCategory);
    } catch (error) {
      console.error('Error fetching Child lobs:', error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  useEffect(() => {
    setGlobalState({ isLoading: true })
    const handleSearch = async () => {
      const params4 = {
        url: `/api/fc-fees-masters/psa-details`,
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
        // setCategoryOptions(data?.data?.feeCategory)
        // setSubCategoryOptions(data?.data?.feeSubCategory)

        // setPeriodOfServiceOptions(data?.data?.periodOfService)
        // setPsaBatchOptions(data?.data?.batches)
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
        const selectedIds = value?.map((name: any) => {
          const item: any = subTypeOptions.find((item: any) => item.fee_sub_type_id === name)

          return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
        })
        const categoryOptions = psaDetails.feeCategory.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        setCategoryOptions(categoryOptions)
      } else {
        setCategoryOptions([])
      }
    }

    if (name === 'psa_category') {
      if (value) {
        value = [value]
        const selectedIds = value?.map((val: any) => {
          const item: any = categoryOptions.find((item: any) => item.fee_category_id === val)

          return item ? item.fee_category_id : undefined // Return item.id if found, otherwise undefined
        })
        const subcategoryOptions = psaDetails.feeSubCategory.filter((element: any) => {
          return selectedIds.includes(element.fee_category_id)
        })
        setSubCategoryOptions(subcategoryOptions)
      } else {
        setSubCategoryOptions([])
      }
    }

    if (name === 'psa_sub_category') {
      if (value) {
        value = [value]
        const selectedIds = value?.map((name: any) => {
          const item: any = subCategoryOptions.find((item: any) => item.fee_subcategory_id === name)

          return item ? item.fee_subcategory_id : undefined // Return item.id if found, otherwise undefined
        })
        const periodOfServiceOptions = psaDetails.periodOfService.filter((element: any) => {
          return selectedIds.includes(element.fee_subcategory_id)
        })

        const batchOptions = psaDetails.batches.filter((element: any) => {
          return selectedIds.includes(element.fee_subcategory_id)
        })
        setPsaBatchOptions(batchOptions)

        setPeriodOfServiceOptions(periodOfServiceOptions)
      } else {
        setPeriodOfServiceOptions([])
        setPsaBatchOptions([])
      }
    }

    // if (name === "period_of_service") {
    //     if (value) {
    //         value = value.split(',');
    //         const selectedIds = value?.map((name: any) => {
    //             const item: any = periodOfServiceOptions.find(
    //                 (item: any) =>
    //                     item.period_of_service === name
    //             );
    //             return item ? item.period_of_service_id : undefined; // Return item.id if found, otherwise undefined
    //         });
    //         let batchOptions = psaDetails.batches.filter((element: any) => {
    //             return selectedIds.includes(element.period_of_service_id)
    //         })
    //         setPsaBatchOptions(batchOptions)

    //     } else {
    //         setPsaBatchOptions([]);
    //     }

    // }
  }

  // useEffect(() => {
  //   if (details && psaDetails && details?.sub_category) {
  //     const psa_sub_type = [details?.sub_type]
  //     const selectedIds = psa_sub_type?.map((name: any) => {
  //       const item: any = subTypeOptions.find((item: any) => item.fee_sub_type_id === name)

  //       return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
  //     })
  //     const categoryOptions = psaDetails?.feeCategory?.filter((element: any) => {
  //       return selectedIds.includes(element.fee_sub_type_id)
  //     })
  //     setCategoryOptions(categoryOptions)

  //     const psa_category = [details?.category]
  //     const selectedIdsNew = psa_category?.map((val: any) => {
  //       const item: any = categoryOptions?.find((item: any) => item.fee_category_id === val)

  //       return item ? item.fee_category_id : undefined // Return item.id if found, otherwise undefined
  //     })
  //     const subcategoryOptionsnew = psaDetails?.feeSubCategory?.filter((element: any) => {
  //       return selectedIdsNew?.includes(element.fee_category_id)
  //     })
  //     setSubCategoryOptions(subcategoryOptionsnew)

  //     const psa_sub_category = [details?.sub_category]
  //     const selectedIds3 = psa_sub_category?.map((name: any) => {
  //       const item: any = subcategoryOptionsnew?.find((item: any) => item.fee_subcategory_id == name)

  //       return item ? item?.fee_subcategory_id : undefined // Return item.id if found, otherwise undefined
  //     })
  //     const periodOfServiceOptions = psaDetails?.periodOfService?.filter((element: any) => {
  //       return selectedIds3.includes(element.fee_subcategory_id)
  //     })

  //     const batchOptions = psaDetails?.batches?.filter((element: any) => {
  //       return selectedIds3.includes(element.fee_subcategory_id)
  //     })

  //     console.log('batchOptions>>', batchOptions, periodOfServiceOptions, selectedIds3)
  //     setPsaBatchOptions(batchOptions)

  //     setPeriodOfServiceOptions(periodOfServiceOptions)

  //     reset({
  //       psa_sub_type: details?.sub_type,
  //       psa_category: details?.category,
  //       psa_sub_category: details?.sub_category,
  //       period_of_service: details?.period_of_service,
  //       psa_batch: details?.psa_batch
  //     })
  //     if (viewMode) {
  //       calculateAmmount()
  //     }
  //   }
  // }, [details, psaDetails])

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
      {subTypeOptions && subTypeOptions?.length ? (
        <>
          <Box>
            {/* <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}> */}
            <Grid container spacing={5}>
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
                        const label = subTypeOptions?.find(opt => opt.fee_sub_type_id === option)

                        return label?.fee_sub_type
                      }}
                      options={subTypeOptions?.map((option: any) => option?.fee_sub_type_id)}
                      onChange={(event, value) => {
                        field.onChange(value)
                        handleOptions(event, value, 'psa_sub_type')
                      }}
                      renderOption={(props, option, { selected }) => {
                        const label = subTypeOptions?.find(opt => opt.fee_sub_type_id === option)

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
                          const label = categoryOptions?.find(opt => opt?.fee_category_id === option)

                          return label?.fee_category
                        }}
                        options={categoryOptions?.map((option: any) => option?.fee_category_id)}
                        onChange={(event, value) => {
                          field.onChange(value)
                          handleOptions(event, value, 'psa_category')
                        }}
                        renderOption={(props, option, { selected }) => {
                          const label = categoryOptions?.find(opt => opt?.fee_category_id === option)

                          return (
                            <li {...props}>
                              <Checkbox checked={selected} />
                              {label?.fee_category}
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
                                    <span style={{ whiteSpace: 'pre-line' }}>
                                      {value.slice(displayLimit).join('\n')}
                                    </span>
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
                {subCategoryOptions && subCategoryOptions?.length ? (
                  <Controller
                    name='psa_sub_category'
                    control={control}
                    rules={{ required: 'Please select at least one user' }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        id='autocomplete-multiple-filled'
                        getOptionLabel={(option: any) => {
                          console.log('option>>', option)
                          const label = subCategoryOptions?.find(opt => opt?.fee_subcategory_id === option)

                          return label?.fee_subcategory
                        }}
                        options={subCategoryOptions?.map((option: any) => option.fee_subcategory_id)}
                        onChange={(event, value) => {
                          field.onChange(value)
                          handleOptions(event, value, 'psa_sub_category')
                        }}
                        renderOption={(props, option, { selected }) => {
                          const label = subCategoryOptions?.find(opt => opt?.fee_subcategory_id === option)

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
                            label={<Box sx={{ display: 'flex', alignItems: 'center' }}>PSA Sub Category</Box>}
                            placeholder='PSA Sub Category'
                            error={!!errors.psa_sub_category}
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
                                    <span style={{ whiteSpace: 'pre-line' }}>
                                      {value.slice(displayLimit).join('\n')}
                                    </span>
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
                          const label = periodOfServiceOptions?.find(opt => opt?.period_of_service_id === option)

                          return label?.period_of_service
                        }}
                        options={periodOfServiceOptions?.map((option: any) => option.period_of_service_id)}
                        onChange={(event, value) => {
                          field.onChange(value)
                          handleOptions(event, value, 'period_of_service')
                        }}
                        renderOption={(props, option, { selected }) => {
                          const label = periodOfServiceOptions?.find(opt => opt?.period_of_service_id === option)

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
                                    <span style={{ whiteSpace: 'pre-line' }}>
                                      {value.slice(displayLimit).join('\n')}
                                    </span>
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
                {psaBatchOptions && psaBatchOptions?.length ? (
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
                          const label = psaBatchOptions?.find(opt => opt?.batch_id === option)

                          return label?.batch_name
                        }}
                        options={psaBatchOptions?.map((option: any) => option.batch_id)}
                        onChange={(event, value) => {
                          field.onChange(value)
                          // handleSchoolCategories(event, value, "academic_year");
                        }}
                        renderOption={(props, option, { selected }) => {
                          const label = psaBatchOptions?.find(opt => opt?.batch_id === option)

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
                                    <span style={{ whiteSpace: 'pre-line' }}>
                                      {value.slice(displayLimit).join('\n')}
                                    </span>
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

            {/* </form> */}
          </Box>
          <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button variant='contained' color='primary' onClick={calculateAmmount}>
              Submit
            </Button>
          </Box>
        </>
      ) : (
        <Typography sx={{ mr: 2, fontWeight: 400, color: 'text.secondary' }} align='center'>
          Data Not Found For Applied Filter
        </Typography>
      )}
    </Box>
  )
}
