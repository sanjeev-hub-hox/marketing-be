'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Chip,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getRequest, postRequest } from 'src/services/apiService';
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog';
import CloseIcon from '@mui/icons-material/Close';

const mouStatuses = ['Active', 'Inactive'];


export default function CreatePreSchoolTieUpMaster() {
  const [formData, setFormData] = useState({
    preschoolName: '',
    preschoolDisplayName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    cityId:'',
    pinCode: '',
    co_pincode: '',
    validityStartDate: null,
    validityEndDate: null,
    mouStatus: '',
    spocName: '',
    spocPhone: '',
    spocEmail: '',
    applicableSchools: [] as string[],
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [loadingCity, setLoadingCity] = useState(false);
  const [segmentLobsOptions, setSegmentLobsOptions] = useState<{ id: string; name: string }[]>([]);
   const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  
    const { setPagePaths } = useGlobalContext()

  // 🔹 Generic change handler
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));

    // When pin code changes and is 6 digits, fetch city
    if (field === 'pinCode' && value.length === 6) {
      handlePincodeChange(value);
    }
  };

  // 🔹 Fetch city from API
const handlePincodeChange = async (pincode: string) => {
  setFormData(prev => ({ ...prev, pinCode: pincode }));

  if (pincode.length === 6) {
    setLoadingCity(true);
    try {
      const encodedPincode = encodeURIComponent(pincode);

      // Construct GET query params
      const query = `filters[Pincode][$eq]=${encodedPincode}&populate=District_Or_City,District_Or_City.data.attributes.state`;

      const params = {
        url: `/api/co-pincodes?${query}`,
        serviceURL: 'mdm', // use your service key if needed
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`,
        },
      };

      const response = await getRequest(params);

      // Extract city from API response
      const cityName =
        response?.data[0]['attributes']?.District_Or_City?.data?.attributes?.name;
      const cityId = response?.data[0]['attributes']['District_Or_City']['data']['id']
      const co_pincode = response?.data?.[0]?.id
      if (cityName) {
        setFormData(prev => ({ ...prev, city: cityName, cityId : cityId, co_pincode:co_pincode}));
      } else {
        setFormData(prev => ({ ...prev, city: '', cityId : '',co_pincode: '' }));
      }
    } catch (error) {
      console.error('Error fetching city for pincode:', error);
      setFormData(prev => ({ ...prev, city: '',cityId: '',co_pincode: '' }));
    } finally {
      setLoadingCity(false);
    }
  } else {
    // Clear city if pincode is not 6 digits
    setFormData(prev => ({ ...prev, city: '',cityId: '' }));
  }
};

  // 🔍 Check if corporate name already exists
const checkDuplicatePreschoolName = async (name: string) => {
  try {
    const encodedName = encodeURIComponent(name.trim());
    const params = {
      url: `/api/ac-pre-school-tie-ups?filters[pre_school_name][$eq]=${encodedName}`,
      serviceURL: 'mdm',
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
    };
    const response = await getRequest(params);

    return response?.data?.length > 0; // true if duplicate found
  } catch (err) {
    console.error('Error checking duplicate name:', err);
    
    return false;
  }
};


 useEffect(() => {
    setPagePaths([
      {
        title: 'Create Pre-School Tie-Up',
        path: '/pre-school/create' 
      }
    ])
  }, [])
 // 🔹 Fetch Segment LOBs dynamically (for dropdown)
 useEffect(() => {
  const fetchSchools = async () => {
    try {
     const params = {
  url: '/api/ac-schools?pagination[limit]=1000&sort=name:asc',
  serviceURL: 'mdm',
  headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
};

const res = await getRequest(params);

if (res?.data) {
  const seenCityIds = new Set();
  const uniqueOptions: any[] = [];

  res.data.forEach((item: any) => {
    const cityId = item.attributes?.name;
    if (!seenCityIds.has(cityId)) {
      seenCityIds.add(cityId);
      uniqueOptions.push({
        id: item.id?.toString(),
        name:
          item.attributes?.short_name ||
          item.attributes?.name,
      });
    }
  });

  setSegmentLobsOptions(uniqueOptions);
} else {
  setSegmentLobsOptions([]);
}

    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  fetchSchools();
}, []);

 // 🔹 Validation
const validateForm = async () => {
  const newErrors: any = {};

  // Preschool Name
  if (!formData.preschoolName || formData.preschoolName.trim().length < 3 || formData.preschoolName.trim().length > 100) {
    newErrors.preschoolName = 'Pre-school name must be 3-100 characters';
  }
  else {
    const isDuplicate = await checkDuplicatePreschoolName(formData.preschoolName);
    if (isDuplicate) {
      newErrors.preschoolName = 'Duplicate Pre-school Name. Please enter a unique name.';
    }
  }

  // Preschool Display Name
  if (!formData.preschoolDisplayName || formData.preschoolDisplayName.trim().length < 3 || formData.preschoolDisplayName.trim().length > 50) {
    newErrors.preschoolDisplayName = 'Display name must be 3-50 characters';
  }

  // Address Line 1
  if (!formData.addressLine1 || formData.addressLine1.trim().length < 5) {
    newErrors.addressLine1 = 'Address Line 1 is required';
  }

  // Address Line 2 (optional, max 200)
  if (formData.addressLine2 && formData.addressLine2.length > 200) {
    newErrors.addressLine2 = 'Address Line 2 must be less than 200 characters';
  }

  // Pin Code
  if (!formData.pinCode || !/^\d{6}$/.test(formData.pinCode)) {
    newErrors.pinCode = 'Pin Code must be a valid 6-digit number';
  }

  // City (auto-filled, just ensure exists)
  if (!formData.city) {
    newErrors.city = 'City could not be determined for this pin code';
  }

  // Validity Dates
  if (!formData.validityStartDate) {
    newErrors.validityStartDate = 'Start date is required';
  }
  if (!formData.validityEndDate) {
    newErrors.validityEndDate = 'End date is required';
  }
  if (formData.validityStartDate && formData.validityEndDate) {
    if (dayjs(formData.validityEndDate).isBefore(dayjs(formData.validityStartDate))) {
      newErrors.validityEndDate = 'End date cannot be before start date';
    }
  }

  // MOU Status
  if (!formData.mouStatus) {
    newErrors.mouStatus = 'MOU Status is required';
  }

  // SPOC Name
  if (!formData.spocName || formData.spocName.trim().length < 3 || formData.spocName.trim().length > 50) {
    newErrors.spocName = 'SPOC Name must be 3-50 characters';
  }

  // SPOC Phone
  if (!formData.spocPhone || !/^\d{10}$/.test(formData.spocPhone)) {
    newErrors.spocPhone = 'SPOC Phone must be 10 digits';
  }

  // SPOC Email
  if (!formData.spocEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.spocEmail)) {
    newErrors.spocEmail = 'SPOC Email must be valid';
  }

  // Applicable Schools
  if (!formData.applicableSchools || formData.applicableSchools.length === 0) {
    newErrors.applicableSchools = 'Select at least one school';
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


  // 🔹 Submit
  const handleSubmit = async () => {
    if (!(await validateForm())) return;

    try {
       const payload = {
      data: {
        pre_school_name: formData.preschoolName,
        pre_school_display_name: formData.preschoolDisplayName,
        address_1: formData.addressLine1,
        address_2: formData.addressLine2,
        co_pincode: formData.co_pincode,
        validity_start_date: formData.validityStartDate,
        validity_end_date: formData.validityEndDate,
        mou_status: formData.mouStatus === 'Active' ? 1 : 0, // Convert to numeric if API expects 0/1
        spoc_name: formData.spocName,
        spoc_mobile_no: formData.spocPhone,
        spoc_email: formData.spocEmail,
        school_id: formData.applicableSchools,
      },
    };

    const params = {
      url: '/api/ac-pre-school-tie-ups',
      serviceURL: 'mdm', 
      data: payload,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await postRequest(params);

    setSuccessDialogOpen(true);
    // handleCancel();
  } catch (error: any) {
    console.error('Error submitting form:', error);
    alert(
      `Error creating Preschool Tie-Up: ${
        error?.response?.data?.error?.message || error.message
      }`
    );
    } 
  };

  // 🔹 Reset
  const handleCancel = () => {
    location.replace('/pre-school/list')
    // setFormData({
    //   preschoolName: '',
    //   preschoolDisplayName: '',
    //   addressLine1: '',
    //   addressLine2: '',
    //   city: '',
    //   cityId:'',
    //   pinCode: '',
    //   co_pincode: '',
    //   validityStartDate: null,
    //   validityEndDate: null,
    //   mouStatus: '',
    //   spocName: '',
    //   spocPhone: '',
    //   spocEmail: '',
    //   applicableSchools: [],
    // });
    // setErrors({});
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 1100,
          mx: 'auto',
          mt: 4,
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: '#fff',
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create Pre-School Tie-Up Master
        </Typography>

        <Grid container spacing={2}>
          {/* Preschool Info */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Preschool Name"
              value={formData.preschoolName}
              onChange={e => handleChange('preschoolName', e.target.value)}
              error={errors.preschoolName}
              helperText={errors.preschoolName || ''}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Preschool Display Name"
              value={formData.preschoolDisplayName}
              onChange={e => handleChange('preschoolDisplayName', e.target.value)}
              error={errors.preschoolDisplayName}
              helperText={errors.preschoolDisplayName || ''}
            />
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Address Line 1"
              value={formData.addressLine1}
              onChange={e => handleChange('addressLine1', e.target.value)}
              error={errors.addressLine1}
              helperText={errors.addressLine1 || ''}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2"
              value={formData.addressLine2}
              onChange={e => handleChange('addressLine2', e.target.value)}
            />
          </Grid>

          {/* City + Pin */}

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Pin Code"
              value={formData.pinCode}
              onChange={e => handleChange('pinCode', e.target.value)}
              error={errors.pinCode}
              helperText={errors.pinCode || ''}
              inputProps={{ maxLength: 6 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              InputProps={{
                readOnly: true,
              }}
              style={{
              backgroundColor: '#e0e1e2ff',
            }}
            />
          </Grid>

          {/* Dates */}
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Validity Start Date"
              value={formData.validityStartDate ? dayjs(formData.validityStartDate) : null}
              onChange={date => handleChange('validityStartDate', date)}
              format="DD/MM/YYYY" 
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: errors.validityStartDate,
                  helperText: errors.validityStartDate || '',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Validity End Date"
              value={formData.validityEndDate ? dayjs(formData.validityEndDate) : null}
              onChange={date => handleChange('validityEndDate', date)}
              format="DD/MM/YYYY" 
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: errors.validityEndDate,
                  helperText: errors.validityEndDate || '',
                },
              }}
            />
          </Grid>

          {/* MOU */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={errors.mouStatus}>
              <InputLabel>MOU Status</InputLabel>
              <Select
                label="MOU Status"
                value={formData.mouStatus}
                onChange={e => handleChange('mouStatus', e.target.value)}
              >
                {mouStatuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* SPOC */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="SPOC Name"
              value={formData.spocName}
              onChange={e => handleChange('spocName', e.target.value)}
              error={errors.spocName}
              helperText={errors.spocName || ''}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="SPOC Phone Number"
              value={formData.spocPhone}
              onChange={e => handleChange('spocPhone', e.target.value)}
              error={errors.spocPhone}
              helperText={errors.spocPhone || ''}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="SPOC Email ID"
              value={formData.spocEmail}
              onChange={e => handleChange('spocEmail', e.target.value)}
              error={errors.spocEmail}
              helperText={errors.spocEmail || ''}
            />
          </Grid>

          {/* Schools */}
          <Grid item xs={6}>
           <FormControl fullWidth required error={!!errors.applicableSchools}>
  <InputLabel>VIBGYOR schools where tie-ups are applicable</InputLabel>

  <Select
    multiple
    value={formData.applicableSchools}
    onChange={(e) => handleChange('applicableSchools', e.target.value)}
    input={<OutlinedInput label="VIBGYOR schools where tie-ups are applicable" />}
    renderValue={(selected: string[]) => (
      <Box
        sx={{
          margin: '4px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          maxHeight: 50, // limit chip area height
          overflowY: 'auto', // scroll instead of spill
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        {selected.map((value) => {
          const label = segmentLobsOptions.find((opt) => opt.id === value)?.name || value;
          
          return (
            <Chip
              key={value}
              label={label}
              title={label}
              size="small"
              onMouseDown={(e) => e.stopPropagation()} // prevent reopening dropdown
              onDelete={() => {
                const updated = formData.applicableSchools.filter((v: string) => v !== value);
                handleChange('applicableSchools', updated);
              }}
              deleteIcon={<CloseIcon />}
              sx={{
                maxWidth: '100%',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 150,
                  display: 'inline-block',
                },
              }}
            />
          );
        })}
      </Box>
    )}
    MenuProps={{
      PaperProps: {
        sx: {
          width: 'min(50%, 420px)', // relative width
          maxHeight: 300,
          overflowY: 'auto',
          borderRadius: 2,
          boxShadow: 3,
        },
      },
      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
      transformOrigin: { vertical: 'top', horizontal: 'left' },
    }}
    sx={{
      '& .MuiSelect-select': {
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        whiteSpace: 'normal',
        paddingTop: '6px !important',
        paddingBottom: '6px !important',
        minHeight: '56px',
      },
      '& .MuiOutlinedInput-root': {
        alignItems: 'flex-start',
      },
    }}
  >
    {segmentLobsOptions.map((option) => (
      <MenuItem key={option.id} value={option.id}>
        <Checkbox checked={formData.applicableSchools.includes(option.id)} />
        <ListItemText primary={option.name} />
      </MenuItem>
    ))}
  </Select>

  {errors.applicableSchools && (
    <Box sx={{ color: 'error.main', mt: 0.5 }}>{errors.applicableSchools}</Box>
  )}
</FormControl>
          </Grid>
        </Grid>
        

        <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
      <SuccessDialog
        openDialog={successDialogOpen}
        title="Pre-School Tie-Up created successfully!"
        handleClose={() => {
          setSuccessDialogOpen(false);
          handleCancel(); // navigate to list page after closing
        }}
      />
    </LocalizationProvider>
  );
}
