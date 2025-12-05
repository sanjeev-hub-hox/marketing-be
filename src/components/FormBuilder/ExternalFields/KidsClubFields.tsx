'use client'

import { Autocomplete, Box, Checkbox, Chip, Grid, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { postRequest } from 'src/services/apiService'
import { removeDuplicatesAndNullByKey } from 'src/utils/helper'

export default function KidsClubFields({
  handleChange,
  kidsClubType,
  kidsClubBatch,
  kidsClubPeriodOfService,
  kidsclubCafeteriaOptFor,
  kidsClubMonth,
  setFormData,
  formData,
  validation,
  academic_year,
  school,
  board,
  grade,
  stream,
  course
}: any) {
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])
  const [batchOptions, setBatchOptions] = useState<any[]>([])
  const [psaDetails, setPsaDetails] = useState<any>({})
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([])
  const [feeCategoryOptions, setFeeCategoryOptions] = useState<any[]>([])

  const { setGlobalState } = useGlobalContext()
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  useEffect(() => {
    setGlobalState({ isLoading: true })
    const handleSearch = async () => {
      const params4 = {
        url: `/api/fc-fees-masters/kids-club-details`,
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
        const data: any = await postRequest(params4)
        setPsaDetails(data?.data)
        setCategoryOptions(data?.data?.feeSubType)
        // const value: any = [kidsClubType]
        // const selectedIds = value?.map((val: any) => {
        //     const item: any = data?.data?.feeSubType.find((item: any) => item.fee_sub_type_id === val)

        //     return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
        // })
        // const batchesData = data?.data?.filter((element: any) => {
        //     return selectedIds.includes(element.fee_sub_type_id)
        // })
        // setBatchOptions(batchesData)
      } catch (error) {
        console.error('Error fetching Child lobs:', error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    }

    handleSearch()
  }, [school, board, grade, stream, course, academic_year])

  useEffect(() => {
    if (kidsClubType && psaDetails) {
      const value: any = [kidsClubType]
      const selectedIds = value?.map((val: any) => {
        const item: any = categoryOptions.find((item: any) => item.fee_sub_type_id === val)

        return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
      })
      console.log('selectedIds>>', selectedIds, value)
      const subcategoryOptionss = psaDetails?.batches?.filter((element: any) => {
        return selectedIds.includes(element.fee_sub_type_id)
      })
      setBatchOptions(removeDuplicatesAndNullByKey(subcategoryOptionss, 'batch_id'))
      const value2 = [kidsClubBatch] //value.split(',')
      const selectedIdsNew = value2?.map((val: any) => {
        const item: any = subcategoryOptionss?.find((item: any) => item.batch_id === val)

        return item ? item.batch_id : undefined // Return item.id if found, otherwise undefined
      })
      const periodOfService = psaDetails?.periodOfService?.filter((element: any) => {
        return selectedIdsNew.includes(element.batch_id)
      })
      setPeriodOfServiceOptions(removeDuplicatesAndNullByKey(periodOfService, 'period_of_service_id'))

      const categoryOptionsNew = psaDetails?.feeCategory?.filter((element: any) => {
        return selectedIds.includes(element.fee_sub_type_id)
      })

      setFeeCategoryOptions(removeDuplicatesAndNullByKey(categoryOptionsNew, 'fee_category_id'))

      // const feeSubCategoryOptionsNew = psaDetails?.feeSubCategory?.filter((element: any) => {
      //   return selectedIds.includes(element.fee_category_id)
      // })
      // setSubCategoryOptions(feeSubCategoryOptionsNew)

      //   if (viewMode) {
      //     calculateAmmount()
      //   }
    }
  }, [kidsClubType, kidsClubBatch, kidsClubMonth, psaDetails])

  const handleOptions = async (event: any, value: any, name: any) => {
    // debugger;
    if (name === 'kids_club_type') {
      if (value) {
        value = [value] //value?.split(',')
        console.log('selectedIds123>>', value)

        const selectedIds = value?.map((val: any) => {
          const item: any = categoryOptions.find((item: any) => item.fee_sub_type_id === val)

          return item ? item.fee_sub_type_id : undefined // Return item.id if found, otherwise undefined
        })
        console.log('selectedIds>>', selectedIds, value)
        const subcategoryOptions = psaDetails.batches.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        setBatchOptions(subcategoryOptions)
        const categoryOptionsNew = psaDetails?.feeCategory?.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        setFeeCategoryOptions(removeDuplicatesAndNullByKey(categoryOptionsNew, 'fee_category_id'))

        const feeSubCategoryOptionsNew = psaDetails?.feeSubCategory?.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        setSubCategoryOptions(removeDuplicatesAndNullByKey(feeSubCategoryOptionsNew, 'fee_subcategory_id'))
      } else {
        setBatchOptions([])
      }
    }

    if (name === 'batch_id') {
      if (value) {
        value = [value] //value.split(',')
        const selectedIds = value?.map((val: any) => {
          const item: any = batchOptions.find((item: any) => item.batch_id === val)

          return item ? item.batch_id : undefined // Return item.id if found, otherwise undefined
        })
        const subcategoryOptionss = psaDetails.periodOfService.filter((element: any) => {
          return selectedIds.includes(element.batch_id)
        })
        setPeriodOfServiceOptions(subcategoryOptionss)
      } else {
        setPeriodOfServiceOptions([])
      }
    }
  }

  return (
    <>
      {categoryOptions && categoryOptions?.length ? (
        <Grid item xs={4} md={4}>
          <Autocomplete
            value={kidsClubType}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              console.log('option>>', option)
              const label = categoryOptions.find((opt: any) => opt.fee_sub_type_id === option)

              return label?.fee_sub_type
            }}
            options={categoryOptions.map((option: any) => option.fee_sub_type_id)}
            onChange={(event, value) => {
              handleOptions(event, value, 'kids_club_type')
              handleChange('kids_club_type', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'kids_club_type',
                msterOptions: categoryOptions,
                key: ['fee_sub_type_id'],
                type: 'kidsclucb'
              })
            }}
            renderOption={(props, option, { selected }) => {
              const label = categoryOptions.find((opt: any) => opt.fee_sub_type_id === option)

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
                label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Kids Club Type</Box>}
                placeholder='Kids Club Type'
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
        </Grid>
      ) : null}
      {batchOptions && batchOptions?.length ? (
        <Grid item xs={4} md={4}>
          <Autocomplete
            value={kidsClubBatch}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              console.log('option>>', option)
              const label = batchOptions?.find(opt => opt.batch_id === option)

              return label?.batch_name
            }}
            options={batchOptions?.map((option: any) => option.batch_id)}
            onChange={(event, value) => {
              handleOptions(event, value, 'batch_id')
              handleChange('kids_club_batch', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'kids_club_batch',
                msterOptions: batchOptions,
                key: ['batch_id'],
                type: 'kidsclucb'
              })
            }}
            renderOption={(props, option, { selected }) => {
              const label = batchOptions?.find(opt => opt.batch_id === option)

              return (
                <li {...props} key={option.batch_id}>
                  <Checkbox checked={selected} />
                  {label?.batch_name}
                </li>
              )
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Batch</Box>}
                placeholder='Batch'
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
        </Grid>
      ) : null}

      {periodOfServiceOptions && periodOfServiceOptions?.length ? (
        <Grid item xs={4} md={4}>
          <Autocomplete
            value={kidsClubPeriodOfService}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              const label = periodOfServiceOptions?.find(opt => opt.period_of_service_id === option)

              return label?.period_of_service
            }}
            options={periodOfServiceOptions.map((option: any) => option.period_of_service_id)}
            onChange={(event, value) => {
              // handleSchoolCategories(event, value, "academic_year");
              handleChange('kids_club_period_of_service', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'kids_club_period_of_service',
                msterOptions: batchOptions,
                key: ['period_of_service_id'],
                type: 'kidsclucb'
              })
            }}
            renderOption={(props, option, { selected }) => {
              const label = periodOfServiceOptions?.find(opt => opt.period_of_service_id === option)

              return (
                <li {...props} key={option.period_of_service_id}>
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
        </Grid>
      ) : null}
      {feeCategoryOptions && feeCategoryOptions?.length ? (
        <Grid item xs={4} md={4}>
          <Autocomplete
            value={kidsClubMonth}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              console.log('option>>', option)
              const label = feeCategoryOptions?.find(opt => opt.fee_category_id == option)

              return label?.fee_category
            }}
            options={feeCategoryOptions.map((option: any) => option.fee_category_id)}
            onChange={(event, value) => {
              handleOptions(event, value, 'month')
              handleChange('kids_club_month', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'kids_club_month',
                msterOptions: feeCategoryOptions,
                key: ['fee_category_id'],
                type: 'kidsclucb'
              })
            }}
            renderOption={(props, option, { selected }) => {
              const label = feeCategoryOptions?.find(opt => opt.fee_category_id === option)

              return (
                <li {...props} key={option?.fee_category_id}>
                  <Checkbox checked={selected} />
                  {label?.fee_category}
                </li>
              )
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Time</Box>}
                placeholder='Time'
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
        </Grid>
      ) : null}

      {subCategoryOptions && subCategoryOptions?.length ? (
        <Grid item xs={4} md={4}>
          <Autocomplete
            value={kidsclubCafeteriaOptFor}
            id='autocomplete-multiple-filled'
            getOptionLabel={(option: any) => {
              const label = subCategoryOptions?.find(opt => opt.fee_subcategory_id === option)

              return label?.fee_subcategory
            }}
            options={subCategoryOptions.map((option: any) => option.fee_subcategory_id)}
            onChange={(event, value) => {
              // handleSchoolCategories(event, value, "academic_year");
              handleChange('kids_club_from_cafeteria_opt_for', value, validation, false, null, {
                input_type: 'masterDropdownExternal',
                name: 'kids_club_from_cafeteria_opt_for',
                msterOptions: subCategoryOptions,
                key: ['fee_subcategory_id'],
                type: 'kidsclucb'
              })
            }}
            renderOption={(props, option, { selected }) => {
              const label = subCategoryOptions?.find(opt => opt.fee_subcategory_id === option)

              return (
                <li {...props} key={option?.fee_subcategory_id}>
                  <Checkbox checked={selected} />
                  {label?.fee_subcategory}
                </li>
              )
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={<Box sx={{ display: 'flex', alignItems: 'center' }}>From Cafeteria Opt For</Box>}
                placeholder='From Cafeteria Opt For'
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
        </Grid>
      ) : null}
    </>
  )
}
