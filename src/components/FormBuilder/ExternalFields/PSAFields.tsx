'use client'
import { Autocomplete, Box, Checkbox, Chip, Grid, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { postRequest } from 'src/services/apiService'

export default function PSAFields({
  school,
  board,
  grade,
  stream,
  course,
  academic_year,
  validation,
  handleChange,
  setFormData,
  formData,
  psaSubType,
  psaCategory,
  psaSubCategory,
  psaBatch,
  psaPeriodOfService
}: any) {
  const [subTypeOptions, setSubTypeOptions] = useState<any[]>([])
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([])
  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])
  const [psaBatchOptions, setPsaBatchOptions] = useState<any[]>([])
  const [psaDetails, setPsaDetails] = useState<any>({})
  const { setGlobalState } = useGlobalContext()
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

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
          school_id: school,
          board_id: board,
          grade_id: grade,
          stream_id: stream,
          course_id: course,
          academic_year_id: academic_year
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
  }, [school, board, grade, stream, course, academic_year])

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
  console.log(psaSubType, psaCategory, psaSubCategory, 'psaSubType>>')
  useEffect(() => {
    if (psaSubType && psaDetails) {
      const psa_sub_type = [psaSubType]
      const selectedIds = psa_sub_type?.map((name: any) => {
        const item: any = subTypeOptions.find((item: any) => item.fee_sub_type_id === name)

        return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
      })
      const categoryOptions = psaDetails?.feeCategory?.filter((element: any) => {
        return selectedIds.includes(element.fee_sub_type_id)
      })
      setCategoryOptions(categoryOptions)

      const psa_category = [psaCategory]
      const selectedIdsNew = psa_category?.map((val: any) => {
        const item: any = categoryOptions?.find((item: any) => item.fee_category_id === val)

        return item ? item.fee_category_id : undefined // Return item.id if found, otherwise undefined
      })
      const subcategoryOptionsnew = psaDetails?.feeSubCategory?.filter((element: any) => {
        return selectedIdsNew?.includes(element.fee_category_id)
      })
      setSubCategoryOptions(subcategoryOptionsnew)

      const psa_sub_category = [psaSubCategory]
      const selectedIds3 = psa_sub_category?.map((name: any) => {
        const item: any = subcategoryOptionsnew?.find((item: any) => item.fee_subcategory_id == name)

        return item ? item?.fee_subcategory_id : undefined // Return item.id if found, otherwise undefined
      })
      const periodOfServiceOptions = psaDetails?.periodOfService?.filter((element: any) => {
        return selectedIds3.includes(element.fee_subcategory_id)
      })

      const batchOptions = psaDetails?.batches?.filter((element: any) => {
        return selectedIds3.includes(element.fee_subcategory_id)
      })

      setPsaBatchOptions(batchOptions)

      setPeriodOfServiceOptions(periodOfServiceOptions)

      // reset({
      //   psa_sub_type: details?.sub_type,
      //   psa_category: details?.category,
      //   psa_sub_category: details?.sub_category,
      //   period_of_service: details?.period_of_service,
      //   psa_batch: details?.psa_batch
      // })
      // if (viewMode) {
      //   calculateAmmount()
      // }
    }
  }, [psaSubType, psaCategory, psaSubCategory, psaDetails])

  return (
    <>
      <Grid item xs={4} md={4}>
        {subTypeOptions && subTypeOptions?.length ? (
          <Autocomplete
            value={psaSubType}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              console.log('option>>', option)
              const label = subTypeOptions?.find(opt => opt.fee_sub_type_id === option)

              return label?.fee_sub_type
            }}
            options={subTypeOptions?.map((option: any) => option?.fee_sub_type_id)}
            onChange={(event, value) => {
              handleOptions(event, value, 'psa_sub_type')
              handleChange('psa_sub_type', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'psa_sub_type',
                msterOptions: subTypeOptions,
                key: ['fee_sub_type_id'],
                type: 'kidsclucb'
              })
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
                required
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
                      title={<span style={{ whiteSpace: 'pre-line' }}>{value.slice(displayLimit).join('\n')}</span>}
                    >
                      <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                    </Tooltip>
                  )}
                </div>
              )
            }}
            popupIcon={<DownArrow />}
          />
        ) : null}
      </Grid>
      <Grid item xs={4} md={4}>
        {categoryOptions && categoryOptions?.length ? (
          <Autocomplete
            value={psaCategory}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              console.log('option>>', option)
              const label = categoryOptions?.find(opt => opt?.fee_category_id === option)

              return label?.fee_category
            }}
            options={categoryOptions?.map((option: any) => option?.fee_category_id)}
            onChange={(event, value) => {
              handleOptions(event, value, 'psa_category')
              handleChange('psa_category', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'psa_category',
                msterOptions: categoryOptions,
                key: ['fee_category_id'],
                type: 'kidsclucb'
              })
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
                required
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
                      title={<span style={{ whiteSpace: 'pre-line' }}>{value.slice(displayLimit).join('\n')}</span>}
                    >
                      <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                    </Tooltip>
                  )}
                </div>
              )
            }}
            popupIcon={<DownArrow />}
          />
        ) : null}
      </Grid>

      <Grid item xs={4} md={4}>
        {subCategoryOptions && subCategoryOptions?.length ? (
          <Autocomplete
            value={psaSubCategory}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              console.log('option>>', option)
              const label = subCategoryOptions?.find(opt => opt?.fee_subcategory_id === option)

              return label?.fee_subcategory
            }}
            options={subCategoryOptions?.map((option: any) => option.fee_subcategory_id)}
            onChange={(event, value) => {
              handleOptions(event, value, 'psa_sub_category')
              handleChange('psa_sub_category', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'psa_sub_category',
                msterOptions: subCategoryOptions,
                key: ['fee_subcategory_id'],
                type: 'kidsclucb'
              })
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
                required
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
                      title={<span style={{ whiteSpace: 'pre-line' }}>{value.slice(displayLimit).join('\n')}</span>}
                    >
                      <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                    </Tooltip>
                  )}
                </div>
              )
            }}
            popupIcon={<DownArrow />}
          />
        ) : null}
      </Grid>

      <Grid item xs={4} md={4}>
        {periodOfServiceOptions && periodOfServiceOptions?.length ? (
          <Autocomplete
            value={psaPeriodOfService}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              console.log('option>>', option)
              const label = periodOfServiceOptions?.find(opt => opt?.period_of_service_id === option)

              return label?.period_of_service
            }}
            options={periodOfServiceOptions?.map((option: any) => option.period_of_service_id)}
            onChange={(event, value) => {
              handleOptions(event, value, 'period_of_service')
              handleChange('period_of_service', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'period_of_service',
                msterOptions: periodOfServiceOptions,
                key: ['period_of_service_id'],
                type: 'kidsclucb'
              })
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
                required
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
                      title={<span style={{ whiteSpace: 'pre-line' }}>{value.slice(displayLimit).join('\n')}</span>}
                    >
                      <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                    </Tooltip>
                  )}
                </div>
              )
            }}
            popupIcon={<DownArrow />}
          />
        ) : null}
      </Grid>

      <Grid item xs={4} md={4}>
        {psaBatchOptions && psaBatchOptions?.length ? (
          <Autocomplete
            value={psaBatch}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              console.log('option>>', option)
              const label = psaBatchOptions?.find(opt => opt?.batch_id === option)

              return label?.batch_name
            }}
            options={psaBatchOptions?.map((option: any) => option.batch_id)}
            onChange={(event, value) => {
              // handleSchoolCategories(event, value, "academic_year");
              handleChange('psa_batch', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'psa_batch',
                msterOptions: psaBatchOptions,
                key: ['batch_id'],
                type: 'kidsclucb'
              })
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
                required
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
                      title={<span style={{ whiteSpace: 'pre-line' }}>{value.slice(displayLimit).join('\n')}</span>}
                    >
                      <span style={{ margin: '3px' }}>+{moreItemsCount}</span>
                    </Tooltip>
                  )}
                </div>
              )
            }}
            popupIcon={<DownArrow />}
          />
        ) : null}
      </Grid>
    </>
  )
}
