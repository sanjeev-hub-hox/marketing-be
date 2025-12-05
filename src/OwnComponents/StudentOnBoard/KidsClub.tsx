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
import { FEETYPES, FEETYPES_SLUGS } from 'src/utils/constants'
import { getObjectByKeyVal, removeDuplicatesAndNullByKey } from 'src/utils/helper'

interface Option {
  id: number
  attributes: any
}
interface KidsClubForm {
  kids_club_type?: any
  from_cafeteria_opt_for?: any
  period_of_service?: any
  month?: any
  batch_id?: any
}

export default function KidsClub({
  school,
  feeStructure,
  payload,
  setCalculatedList,
  selectedFees,
  setSelectedFees,
  calculatedList,
  setTotalAmmount,
  scrollToBottom
}: any) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm<KidsClubForm>()

  const formDatVal = watch()
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()

  const [psaDetails, setPsaDetails] = useState<any>({})

  const calculateAmmount = async () => {
    setGlobalState({
      isLoading: true
    })
    const params4 = {
      url: `/fee_payment/finance/calculate`,
      serviceURL: 'finance',
      data: {
        academic_year_id: payload?.academic_year_id ? parseInt(payload?.academic_year_id) : 25,
        ...(payload?.board && { board_id: payload?.board }),
        ...(payload?.course && { course_id: payload?.course }),
        ...(payload?.shift && { shift_id: payload?.shift }),
        ...(payload?.stream && { stream_id: payload?.stream }),
        ...(payload?.grade && { grade_id: payload?.grade }),
        ...(payload?.school && { school_id: payload?.school }),
        batch_id: formDatVal?.batch_id,
        fee_type_id: FEETYPES?.kidsClubFees,
        fee_sub_type_id: formDatVal?.kids_club_type,
        fee_category_id: formDatVal?.month, //getObjectByKeyVal(psaDetails?.batches, 'batch_id', formDatVal?.batch_id)?.fee_category_id,
        fee_subcategory_id: formDatVal?.from_cafeteria_opt_for,
        // fee_subcategory_id: null,
        period_of_service_id: formDatVal?.period_of_service
      }
    }
    try {
      const data = await postRequest(params4)
      if (data?.data) {
        if (scrollToBottom) {
          scrollToBottom()
        }
        const newObj = {
          id: FEETYPES?.kidsClubFees,
          fee_type_id: FEETYPES?.kidsClubFees,
          fee_sub_type_id: formDatVal?.kids_club_type,
          fee_category_id: formDatVal?.month, //getObjectByKeyVal(psaDetails?.batches, 'batch_id', formDatVal?.batch_id)?.fee_category_id,
          fee_subcategory_id: formDatVal?.from_cafeteria_opt_for,
          period_of_service_id: formDatVal?.period_of_service,
          fee_type_val: FEETYPES_SLUGS?.KIDS_CLUB,
          ...data?.data
        }

        const dd = getObjectByKeyVal(calculatedList, 'id', newObj?.id)
        if (!dd) {
          setCalculatedList((prevState: any) => {
            return [...prevState, newObj]
          })
        } else {
          debugger
          const newList = [...calculatedList]
          const index = newList.findIndex((item: any) => item.id === FEETYPES?.kidsClubFees)
          if (index !== -1) {
            newList.splice(index, 1)
          }
          const newSelectedFees = [...selectedFees]
          const selectedIndex = newSelectedFees.findIndex((item: any) => item.id === FEETYPES?.kidsClubFees)
          if (selectedIndex !== -1) {
            newSelectedFees.splice(index, 1)
            const obj = [...newSelectedFees, newObj]
            setSelectedFees(obj)
            const totalAmountC = obj.reduce((sum: any, item: any) => sum + item.amount, 0)
            setTotalAmmount(totalAmountC)
          }
          setCalculatedList([...newList, newObj])
        }
        if (data?.data?.amount == 0) {
          setApiResponseType({ status: true, message: 'Kids Club fees not eligible for the particular student' })
        }
      } else {
        setApiResponseType({ status: true, message: 'Fees Not Found' })
      }

      // setCategoryOptions(data?.data?.feeCategory);
    } catch (error) {
      console.error('Error fetching Child lobs:', error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  const [financialOptions, setFinancialOptions] = useState<Option[]>([])
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])
  const [batchOptions, setBatchOptions] = useState<any[]>([])
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([])
  const [feeCategoryOptions, setFeeCategoryOptions] = useState<any[]>([])

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
          academic_year_id: payload?.academic_year_id ? parseInt(payload?.academic_year_id) : 25,
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

        setCategoryOptions(data?.data?.feeSubType)

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
  }, [payload?.academic_year_id])

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
        // setBatchOptions(subcategoryOptions)
        setBatchOptions(removeDuplicatesAndNullByKey(subcategoryOptions, 'batch_id'))

        const categoryOptionsNew = psaDetails?.feeCategory?.filter((element: any) => {
          return selectedIds.includes(element.fee_sub_type_id)
        })
        // setFeeCategoryOptions(categoryOptionsNew)
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
        const subcategoryOptions = psaDetails.periodOfService.filter((element: any) => {
          return selectedIds.includes(element.batch_id)
        })
        setPeriodOfServiceOptions(subcategoryOptions)
      } else {
        setPeriodOfServiceOptions([])
      }
    }
  }

  return categoryOptions && categoryOptions?.length ? (
    <Box
      sx={{
        background: '#fff',
        padding: '24px',
        borderRadius: '10px',
        width: '100%',
        height: '100%'
      }}
    >
      <form onSubmit={handleSubmit(calculateAmmount)} noValidate>
        <Box sx={{ mt: 5, mb: 4 }}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='kids_club_type'
                control={control}
                rules={{ required: 'Please select type' }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    id='autocomplete-multiple-filled'
                    getOptionLabel={(option: any) => {
                      console.log('option>>', option)
                      const label = categoryOptions.find(opt => opt.fee_sub_type_id === option)

                      return label?.fee_sub_type
                    }}
                    options={categoryOptions.map((option: any) => option.fee_sub_type_id)}
                    onChange={(event, value) => {
                      field.onChange(value)
                      handleOptions(event, value, 'kids_club_type')
                    }}
                    renderOption={(props, option, { selected }) => {
                      const label = categoryOptions.find(opt => opt.fee_sub_type_id === option)

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
                        error={!!errors.kids_club_type}
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
              <FormControl>
                {errors?.kids_club_type?.message && (
                  <span className={'errorField'}>{`${errors?.kids_club_type?.message}`}</span>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              {batchOptions && batchOptions?.length ? (
                <>
                  <Controller
                    name='batch_id'
                    control={control}
                    rules={{ required: 'Please select batch' }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        id='autocomplete-multiple-filled'
                        getOptionLabel={(option: any) => {
                          console.log('option>>', option)
                          const label = batchOptions?.find(opt => opt.batch_id === option)

                          return label?.batch_name
                        }}
                        options={batchOptions?.map((option: any) => option.batch_id)}
                        onChange={(event, value) => {
                          field.onChange(value)
                          handleOptions(event, value, 'batch_id')
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
                            label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Batch</Box>}
                            placeholder='Batch'
                            error={!!errors.batch_id}
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
                  <FormControl>
                    {errors?.batch_id?.message && (
                      <span className={'errorField'}>{`${errors?.batch_id?.message}`}</span>
                    )}
                  </FormControl>
                </>
              ) : null}
            </Grid>

            {feeCategoryOptions && feeCategoryOptions?.length ? (
              <Grid item xs={12} sm={6}>
                <>
                  <Controller
                    name='month'
                    control={control}
                    rules={{ required: 'Please select time' }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        //disabled={viewMode}
                        id='autocomplete-multiple-filled'
                        getOptionLabel={(option: any) => {
                          console.log('option>>', option)
                          const label = feeCategoryOptions?.find(opt => opt.fee_category_id === option)

                          return label?.fee_category
                        }}
                        options={feeCategoryOptions?.map((option: any) => option.fee_category_id)}
                        onChange={(event, value) => {
                          field.onChange(value)
                          // handleSchoolCategories(event, value, "academic_year");
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
                  <FormControl>
                    {errors?.month?.message && <span className={'errorField'}>{`${errors?.month?.message}`}</span>}
                  </FormControl>
                </>
              </Grid>
            ) : null}

            {subCategoryOptions && subCategoryOptions?.length ? (
              <Grid item xs={12} sm={6}>
                <Controller
                  name='from_cafeteria_opt_for'
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      //disabled={viewMode}
                      id='autocomplete-multiple-filled'
                      getOptionLabel={(option: any) => {
                        console.log('option>>', option)
                        const label = subCategoryOptions?.find(opt => opt.fee_subcategory_id === option)

                        return label?.fee_subcategory
                      }}
                      options={subCategoryOptions.map((option: any) => option.fee_subcategory_id)}
                      onChange={(event, value) => {
                        field.onChange(value)
                        // handleSchoolCategories(event, value, "academic_year");
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
            ) : null}

            <Grid item xs={12} sm={6}>
              {periodOfServiceOptions && periodOfServiceOptions?.length ? (
                <>
                  <Controller
                    name='period_of_service'
                    control={control}
                    rules={{ required: 'Please select period of service' }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        id='autocomplete-multiple-filled'
                        getOptionLabel={(option: any) => {
                          console.log('option>>', option)
                          const label = periodOfServiceOptions?.find(opt => opt.period_of_service_id === option)

                          return label?.period_of_service
                        }}
                        options={periodOfServiceOptions.map((option: any) => option.period_of_service_id)}
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
                  <FormControl>
                    {errors?.period_of_service?.message && (
                      <span className={'errorField'}>{`${errors?.period_of_service?.message}`}</span>
                    )}
                  </FormControl>
                </>
              ) : null}
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button type={'submit'} variant='contained' color='primary'>
            Calculate
          </Button>
        </Box>
      </form>
    </Box>
  ) : (
    <Typography sx={{ mr: 2, fontWeight: 400, color: 'text.secondary' }} align='center'>
      Data Not Found
    </Typography>
  )
}
