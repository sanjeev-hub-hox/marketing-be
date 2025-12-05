import React, { useState, useEffect, useMemo } from 'react'
import { Autocomplete, TextField, Box, Typography } from '@mui/material'
import { getRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import debounce from 'lodash.debounce'

interface EnquiryOption {
  id: string
  enquiry_number: string
  parent_phone: string
  parent_name?: string
  academic_year?: string
  // raw parent_details kept in response — optional
  parent_details?: {
    father_details?: { first_name?: string; last_name?: string }
    mother_details?: { first_name?: string; last_name?: string }
    guardian_details?: { first_name?: string; last_name?: string }
  }
}

const EnquiryParentSource = ({ enquiryParentSource, handleChange, val, formData, setFormData }: any) => {
  const [options, setOptions] = useState<EnquiryOption[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedOption, setSelectedOption] = useState<EnquiryOption | null>(null)
  const { setGlobalState } = useGlobalContext()

  // Helper to assemble parent name safely (no null/undefined concatenation)
  const buildParentName = (enq?: EnquiryOption) => {
    if (!enq) return ''
    // prefer explicit parent_name if API returns it
    if (enq.parent_name && enq.parent_name.trim()) return enq.parent_name.trim()
    const f = enq.parent_details?.father_details
    const m = enq.parent_details?.mother_details
    const g = enq.parent_details?.guardian_details

    const nameFrom = (p?: { first_name?: string; last_name?: string }) => {
      if (!p) return ''
      const fn = (p.first_name || '').trim()
      const ln = (p.last_name || '').trim()
      
      return (fn || ln) ? `${fn} ${ln}`.trim() : ''
    }

    return nameFrom(f) || nameFrom(m) || nameFrom(g) || ''
  }

  // Fetch function (unchanged endpoint you provided)
  const fetchOptions = async (search: string) => {
    if (!enquiryParentSource) return
    try {
      setGlobalState({ isLoading: true })
      const encoded = encodeURIComponent(search)
      const params = { url: `marketing/enquiry/getEnquiryidAndParentNumber?search=${encoded}` } // keep as you had
      const res = await getRequest(params)
      const data = Array.isArray(res?.data) ? res.data : []
      // ensure parent_name fallback from parent_details if API doesn't include parent_name
      const normalized = data.map((d: any) => ({
        id: d.id,
        enquiry_number: d.enquiry_number,
        parent_phone: d.parent_phone,
        academic_year: d.academic_year,
        parent_name: d.parent_name || undefined,
        parent_details: d.parent_details || undefined
      }))
      setOptions(normalized)
    } catch (err) {
      console.error('Error fetching parent source:', err)
      setOptions([])
    } finally {
      setGlobalState({ isLoading: false })
    }
  }

  const debouncedFetch = useMemo(() => debounce(fetchOptions, 300), [enquiryParentSource])

  // cleanup debounce on unmount
  useEffect(() => {
    return () => debouncedFetch.cancel()
  }, [debouncedFetch])

  // init selectedOption if val already present and options loaded
  useEffect(() => {
    if (val && options.length) {
      const found = options.find(opt => String(opt.id) === String(val))
      if (found) {
        setSelectedOption(found)
        setInputValue(found.parent_phone || '')
      }
    }
  }, [val, options])

  // display string for comparison (to avoid re-fetch when typing equals selected)
  const selectedDisplay = selectedOption ? `${selectedOption.enquiry_number} | ${selectedOption.parent_phone}` : ''

  return (
    <Autocomplete
      options={options}
      // keep getOptionLabel simple for typing behaviour (shows parent_phone so user can search by number too)
      getOptionLabel={(option) => `${option.enquiry_number || ''} | ${option.parent_phone || ''}`}
      value={selectedOption}
      inputValue={inputValue}
      onInputChange={(e, newInputValue, reason) => {
        if (reason === 'input') {
          setInputValue(newInputValue)
          const trimmed = (newInputValue || '').trim()
          // only fetch if there's actual text and it's not equal to the selected display
          if (trimmed && trimmed !== selectedDisplay) {
            debouncedFetch(trimmed)
          } else if (!trimmed) {
            setOptions([]) // clear options when user clears input
          }
        } else if (reason === 'clear') {
          setInputValue('')
          setSelectedOption(null)
          setFormData((prev: any) => ({
            ...prev,
            'enquiry_parent_source.id': '',
            'enquiry_parent_source.value': ''
          }))
        }
      }}
      onChange={(e, newValue) => {
        if (!newValue) {
          setSelectedOption(null)
          setInputValue('')
          setFormData((prev: any) => ({
            ...prev,
            'enquiry_parent_source.id': '',
            'enquiry_parent_source.value': ''
          }))

          return
        }

        setSelectedOption(newValue)
        setInputValue(newValue.parent_phone || '')

        // call handleChange exactly as your other components do (unchanged)
        handleChange('enquiry_parent_source', newValue.id, [], false, null, {
          name: 'enquiry_parent_source',
          input_type: 'masterDropdownExternal',
          masterOptions: options,
          type: 'extFields',
          keyMap: 'id'
        })

        // set formData keys exactly as you used previously
        setFormData((prev: any) => ({
          ...prev,
          'enquiry_parent_source.id': newValue.id,
          'enquiry_parent_source.value': newValue.parent_phone,
          'enquiry_parent_source.enquirynumber': newValue.enquiry_number,
          // keep a readable parent name in formdata (same behaviour as employee)
          'enquiry_parent_source.name': buildParentName(newValue)
        }))
      }}
      renderOption={(props, option) => {
        const parentName = buildParentName(option) || '—'
        const year = option.academic_year || '—'

        return (
          <Box component="li" {...props} key={option.id} sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 1, px: 1.25 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'black', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {parentName}
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#1565c0', flexShrink: 0 }}>
                ({year})
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '0.9rem', color: '#424242', mt: 0.5 }}>
              <strong>Parent Contact:</strong> {option.parent_phone || '—'}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#757575', mt: 0.25 }}>
              Enquiry ID: {option.enquiry_number || '—'}
            </Typography>
          </Box>
        )
      }}
      renderInput={(params) => {
        // create a visual block identical to dropdown row when an option is selected
        const selectedAdornment = selectedOption ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden', lineHeight: 1.05, scale: '0.85'  }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'black', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {buildParentName(selectedOption) || '—'}
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#1565c0', flexShrink: 0 }}>
                ({selectedOption.academic_year || '—'})
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '0.9rem', color: '#424242', mt: 0.4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong>Parent Contact:</strong> {selectedOption.parent_phone || '—'}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#757575', mt: 0.15, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Enquiry ID: {selectedOption.enquiry_number || '—'}
            </Typography>
          </Box>
        ) : null

        return (
          <TextField
            {...params}
            label="Search Parent No. / Enquiry ID"
            variant="outlined"
            required
            error={Boolean(formData?.error?.['enquiry_parent_source'])}
            InputProps={{
              ...params.InputProps,
              startAdornment: selectedAdornment ? (
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 1, pr: 1, py: 0.5, overflow: 'hidden',height: '50px'}}>
                  {selectedAdornment}
                </Box>
              ) : (
                params.InputProps.startAdornment
              )
            }}
            sx={{
              '& .MuiInputBase-root': { alignItems: 'flex-start',
                maxHeight: '56px', 
          height: '56px' },
              '& .MuiInputBase-input': { display: selectedOption ? 'none' : 'block', }
            }}
          />
        )
      }}
      clearOnEscape
      disableClearable={false}
      fullWidth
      sx={{ '& .MuiAutocomplete-inputRoot': { alignItems: 'flex-start', } }}
    />
  )
}

export default EnquiryParentSource
