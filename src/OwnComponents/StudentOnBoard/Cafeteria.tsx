'use client'

import {
  Button,
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
  Tooltip,
  Typography
} from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import { postRequest } from 'src/services/apiService'
import { FEETYPES, FEETYPES_SLUGS } from 'src/utils/constants'
import { getObjectByKeyVal } from 'src/utils/helper'

export default function Cafeteria({
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
  const DownArrow = () => <span style={{ color: '#666666' }} className='icon-arrow-down-1'></span>

  const [psaDetails, setPsaDetails] = useState<any>({})
  const [categoryOptions, setCategoryOptions] = useState<any[]>([])
  const [periodOfServiceOptions, setPeriodOfServiceOptions] = useState<any[]>([])
  const { setGlobalState, setApiResponseType } = useGlobalContext()
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm()
  const formDatVal = watch()

  useEffect(() => {
    setGlobalState({ isLoading: true })
    const handleSearch = async () => {
      const params4 = {
        url: `/api/fc-fees-masters/cafeteria-details`,
        serviceURL: 'mdm',
        data: {
          academic_year_id: payload?.academic_year_id ? parseInt(payload?.academic_year_id) : 0,
          board_id: payload?.board,
          course_id: payload?.course,
          shift_id: 2,
          stream_id: payload?.stream,
          grade_id: payload?.grade,
          school_id: school
        }
      }
      try {
        const data = await postRequest(params4)
        setPsaDetails(data?.data)
        setCategoryOptions(data?.data?.feeCategory)
      } catch (error) {
        console.error('Error fetching Child lobs:', error)
      } finally {
        setGlobalState({ isLoading: false })
      }
    }

    handleSearch()
  }, [payload?.academic_year_id])

  const handleOptions = (event: any, value: any, name: any) => {
    if (name === 'psa_category') {
      const selectedIds = categoryOptions
        .filter((item: any) => item.fee_category_id == value)
        .map((item: any) => item.fee_category)

      const subcategoryOptions = psaDetails.periodOfService.filter((element: any) => {
        return selectedIds.includes(element.fee_category)
      })
      console.log('value11', value, selectedIds, categoryOptions, subcategoryOptions)
      if (subcategoryOptions && subcategoryOptions?.length) {
        setValue('period_of_service', subcategoryOptions[0]?.period_of_service_id)
      }
      setPeriodOfServiceOptions(subcategoryOptions)
    }
  }

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
        fee_type_id: FEETYPES?.cafeteriaFees,
        fee_category_id: formDatVal?.psa_category ? parseInt(formDatVal?.psa_category) : undefined,
        period_of_service_id: formDatVal?.periodOfService ? parseInt(formDatVal?.periodOfService) : undefined
      }
    }
    try {
      const data = await postRequest(params4)

      if (data?.data) {
        if (scrollToBottom) {
          scrollToBottom()
        }
        const newObj = {
          id: FEETYPES?.cafeteriaFees,
          fee_type_id: FEETYPES?.cafeteriaFees,
          fee_category_id: formDatVal?.psa_category ? parseInt(formDatVal?.psa_category) : null,
          period_of_service_id: formDatVal?.periodOfService ? parseInt(formDatVal?.periodOfService) : null,
          fee_type_val: FEETYPES_SLUGS?.CAFETERIA,
          ...data?.data
        }

        const dd = getObjectByKeyVal(calculatedList, 'id', newObj?.id)
        if (!dd) {
          setCalculatedList((prevState: any) => {
            return [...prevState, newObj]
          })
        } else {
          const newList = [...calculatedList]
          const index = newList.findIndex((item: any) => item.id === FEETYPES?.cafeteriaFees)
          if (index !== -1) {
            newList.splice(index, 1)
          }
          const newSelectedFees = [...selectedFees]
          const selectedIndex = newSelectedFees.findIndex((item: any) => item.id === FEETYPES?.cafeteriaFees)
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
          setApiResponseType({ status: true, message: 'Cafeteria fees not eligible for the particular student' })
        }
      } else {
        setApiResponseType({ status: true, message: 'Fees Not Found' })
      }

      //   // setPsaDetails(data?.data);
      //   if (data?.data?.amount) {
      //     setVasAmount(data?.data?.amount)
      //     setFinalSubmit(true)
      //   }

      // setCategoryOptions(data?.data?.feeCategory);
    } catch (error) {
      console.error('Error fetching Child lobs:', error)
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  return (
    <>
      <Box
        sx={{
          background: '#fff',
          padding: '24px',
          borderRadius: '10px',
          width: '100%',
          height: '100%'
        }}
      >
        {categoryOptions && categoryOptions?.length ? (
          <>
            <form onSubmit={handleSubmit(calculateAmmount)} noValidate>
              <Box sx={{ mt: 3, mb: 4, display: 'flex', alignItems: 'center' }}>
                {/* <Box>
                    <FormControl>
                        <FormLabel
                            sx={{ fontSize: '14px', lineHeight: '15.4px', color: 'text.primary' }}
                            id='demo-row-radio-buttons-group-label'
                        >
                            Opt For
                        </FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby='demo-row-radio-buttons-group-label'
                            name='row-radio-buttons-group'
                        >
                            <FormControlLabel
                                value='lunch'
                                sx={{
                                    '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                        color: 'customColors.text3'
                                    }
                                }}
                                control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                                label='Lunch'
                            />
                            <FormControlLabel
                                sx={{
                                    '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                        color: 'customColors.text3'
                                    }
                                }}
                                value='snacks'
                                control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                                label='Snacks'
                            />
                            <FormControlLabel
                                sx={{
                                    '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                        color: 'customColors.text3'
                                    }
                                }}
                                value='lunchSnacks'
                                control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                                label='Lunch & Snacks'
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>
                <Box>
                    <FormControl>
                        <FormLabel
                            sx={{ fontSize: '14px', lineHeight: '15.4px', color: 'text.primary' }}
                            id='demo-row-radio-buttons-group-label'
                        >
                            Period Of Service
                        </FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby='demo-row-radio-buttons-group-label'
                            name='row-radio-buttons-group'
                        >
                            <FormControlLabel
                                sx={{
                                    '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                        color: 'customColors.text3'
                                    }
                                }}
                                value='term1'
                                control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                                label='Term 1'
                            />
                            <FormControlLabel
                                sx={{
                                    '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                        color: 'customColors.text3'
                                    }
                                }}
                                value='term2'
                                control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                                label='Term 2'
                            />
                            <FormControlLabel
                                sx={{
                                    '&.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root': {
                                        color: 'customColors.text3'
                                    }
                                }}
                                value='fullyear'
                                control={<Radio sx={{ '&.MuiRadio-colorPrimary': { color: 'customColors.text3' } }} />}
                                label='Full Year'
                            />
                        </RadioGroup>
                    </FormControl>
                </Box> */}

                <Grid container>
                  <Grid item xs={12} md={6} sm={12}>
                    {categoryOptions && categoryOptions?.length ? (
                      <FormControl component='fieldset' error={!!errors.psa_category}>
                        <FormLabel component='legend'>Opt for</FormLabel>
                        <Controller
                          name='psa_category'
                          control={control}
                          rules={{ required: 'Please select category' }}
                          render={({ field }) => (
                            <RadioGroup
                              row
                              {...field}
                              onChange={event => {
                                field.onChange(event.target.value)
                                handleOptions(event, event.target.value, 'psa_category')
                              }}
                              value={formDatVal.psa_category}
                            >
                              {categoryOptions.map(option => (
                                <FormControlLabel
                                  key={option.fee_category_id}
                                  value={option.fee_category_id} // Use the unique id as the value
                                  control={<Radio />}
                                  label={option.fee_category}
                                />
                              ))}
                            </RadioGroup>
                          )}
                        />

                        {errors?.psa_category?.message && (
                          <span className={'errorField'}>{`${errors?.psa_category?.message}`}</span>
                        )}
                      </FormControl>
                    ) : null}
                  </Grid>

                  {periodOfServiceOptions && periodOfServiceOptions?.length ? (
                    <Grid item xs={12} md={4}>
                      {periodOfServiceOptions && periodOfServiceOptions?.length ? (
                        <FormControl fullWidth required>
                          <InputLabel id='drop-point-label'>Period of service</InputLabel>
                          <Controller
                            name='periodOfService'
                            control={control}
                            rules={{ required: 'Please select period of service' }}
                            render={({ field }) => (
                              <Select
                                {...field}
                                IconComponent={DownArrow}
                                label='Period of service'
                                error={!!errors.periodOfService}
                                labelId='drop-point-label'
                              >
                                {periodOfServiceOptions?.map((val: any, ind: number) => {
                                  return (
                                    <MenuItem key={ind} value={val?.period_of_service_id}>
                                      {val?.period_of_service}
                                    </MenuItem>
                                  )
                                })}
                              </Select>
                            )}
                          />
                          {errors?.periodOfService?.message && (
                            <span className={'errorField'}>{`${errors?.periodOfService?.message}`}</span>
                          )}
                        </FormControl>
                      ) : (
                        <FormControl fullWidth>
                          <InputLabel id='demo-simple-select-outlined-label'>Period of service</InputLabel>
                          <Select
                            IconComponent={DownArrow}
                            label='Select Drop Point'
                            // defaultValue={pickup}
                            id='demo-simple-select-outlined'
                            labelId='demo-simple-select-outlined-label'

                            // onChange={handlePickup}
                          >
                            <MenuItem value='selectOption'>-Select Option-</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Grid>
                  ) : null}
                </Grid>
              </Box>
              <Box sx={{ mt: '10%', mb: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button type={'submit'} variant='contained' color='primary'>
                  Calculate
                </Button>
              </Box>
            </form>
          </>
        ) : (
          <Typography sx={{ mr: 2, fontWeight: 400, color: 'text.secondary' }} align='center'>
            Data Not Found
          </Typography>
        )}
      </Box>
    </>
  )
}
