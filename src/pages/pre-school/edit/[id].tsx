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
  CircularProgress,
  ListItemText,
  Checkbox
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getRequest, putRequest } from 'src/services/apiService';
import { useRouter } from 'next/router';
import { useGlobalContext } from 'src/@core/global/GlobalContext';
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog';
import CloseIcon from '@mui/icons-material/Close';

const mouStatuses = ['Active', 'Inactive'];

export default function EditPreSchoolTieUpMaster() {
  const router = useRouter();
  const { id } = router.query;
    const { setPagePaths } = useGlobalContext()

  const [formData, setFormData] = useState({
    preschoolName: '',
    preschoolDisplayName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    cityId: '',
    pinCode: '',
    co_pincode: '',
    validityStartDate: null as any,
    validityEndDate: null as any,
    mouStatus: '',
    spocName: '',
    spocPhone: '',
    spocEmail: '',
    applicableSchools: [] as string[],
  });

  const [errors, setErrors] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingCity, setLoadingCity] = useState(false);
  const [segmentLobsOptions, setSegmentLobsOptions] = useState<{ id: string; name: string }[]>([]);
useEffect(() => {
    setPagePaths([
      {
        title: 'Pre-School Tie-Up',
        path: '/pre-school/list' 
      }
    ])
  }, [])
  // Fetch LOBs (school_id) on mount
  useEffect(() => {
    fetchSegmentLobs();
  }, []);

  // Fetch pre-school details when id available
  useEffect(() => {
    if (!id) return;
    fetchPreSchoolDetails(id as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

 const fetchSegmentLobs = async () => {
  try {
   const params = {
    url: '/api/ac-schools?pagination[limit]=1000&sort=name:asc',
    serviceURL: 'mdm',
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
  };
  
  const res = await getRequest(params);
  
  if (res?.data) {
    // Keep only one school per unique city_id
    const uniqueByCity = new Map();
  
    res.data.forEach((item: any) => {
      const cityId = item.attributes?.name;
      if (!uniqueByCity.has(cityId)) {
        uniqueByCity.set(cityId, {
          id: item.id?.toString(),
          name:
            item.attributes?.short_name ||
            item.attributes?.name ||
            `School #${item.id}`,
        });
      }
    });
  
    // Convert Map to array for dropdown
    const options = Array.from(uniqueByCity.values());
    setSegmentLobsOptions(options);}
  } catch (err) {
    console.error('Error fetching ac-schools:', err);
  }
};


  const fetchPreSchoolDetails = async (preSchoolId: string) => {
    try {
      setLoading(true);
      // Populate co_pincode and school_id
      const params = {
        url: `/api/ac-pre-school-tie-ups/${preSchoolId}?populate[co_pincode][populate]=District_Or_City&populate[school_id]=*`,
        serviceURL: 'mdm',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
      };
      const res = await getRequest(params);
      const data = res?.data?.attributes || {};

      const coPincodeData = data?.co_pincode?.data;
      const pincodeValue = coPincodeData?.attributes?.Pincode || '';
      const coPincodeId = coPincodeData?.id?.toString() || '';
      const cityName = coPincodeData?.attributes?.District_Or_City?.data?.attributes?.name || '';
      const cityId = coPincodeData?.attributes?.District_Or_City?.data?.id?.toString() || '';

      const selectedLobs = data?.school_id?.data?.map((lob: any) => lob.id?.toString()) || [];

      setFormData({
        preschoolName: data?.pre_school_name || '',
        preschoolDisplayName: data?.pre_school_display_name || '',
        addressLine1: data?.address_1 || '',
        addressLine2: data?.address_2 || '',
        city: cityName,
        cityId,
        pinCode: pincodeValue,
        co_pincode: coPincodeId,
        validityStartDate: data?.validity_start_date ? dayjs(data.validity_start_date) : null,
        validityEndDate: data?.validity_end_date ? dayjs(data.validity_end_date) : null,
        mouStatus: data?.mou_status === 1 ? 'Active' : 'Inactive',
        spocName: data?.spoc_name || '',
        spocPhone: data?.spoc_mobile_no || '',
        spocEmail: data?.spoc_email || '',
        applicableSchools: selectedLobs,
      });
    } catch (err) {
      console.error('Error fetching pre-school details:', err);
      alert('Failed to fetch pre-school details. See console.');
    } finally {
      setLoading(false);
    }
  };

  // When user types pincode, fetch co_pincode + city if 6 digits
  const handlePincodeChange = async (pincode: string) => {
    setFormData((prev) => ({ ...prev, pinCode: pincode }));
    if (pincode.length === 6) {
      setLoadingCity(true);
      try {
        const encodedPincode = encodeURIComponent(pincode);
        const params = {
          url: `/api/co-pincodes?filters[Pincode][$eq]=${encodedPincode}&populate=District_Or_City`,
          serviceURL: 'mdm',
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
        };
        const response = await getRequest(params);
        const rec = response?.data?.[0];
        if (rec) {
          const cityName = rec.attributes?.District_Or_City?.data?.attributes?.name || '';
          const cityId = rec.attributes?.District_Or_City?.data?.id?.toString() || '';
          const coPincodeId = rec.id?.toString() || '';
          setFormData((prev) => ({ ...prev, city: cityName, cityId, co_pincode: coPincodeId }));
        } else {
          setFormData((prev) => ({ ...prev, city: '', cityId: '', co_pincode: '' }));
        }
      } catch (err) {
        console.error('Error fetching city for pincode:', err);
        setFormData((prev) => ({ ...prev, city: '', cityId: '', co_pincode: '' }));
      } finally {
        setLoadingCity(false);
      }
    } else {
      // clear if not 6
      setFormData((prev) => ({ ...prev, city: '', cityId: '', co_pincode: '' }));
    }
    setErrors((prev) => ({ ...prev, pinCode: false, city: false, co_pincode: false }));
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'pinCode') {
      handlePincodeChange(value);

      return;
    }

    if (field === 'applicableSchools') {
      const val = Array.isArray(value) ? value.map((v: any) => v.toString()) : [];
      setFormData((prev) => ({ ...prev, applicableSchools: val }));
      setErrors((prev) => ({ ...prev, applicableSchools: false }));

      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  // 🔍 Check if another pre-school tie-up exists with the same name
const checkDuplicatePreSchoolName = async (name: string, currentId: string) => {
  try {
    const encodedName = encodeURIComponent(name.trim());
    const params = {
      url: `/api/ac-pre-school-tie-ups?filters[pre_school_name][$eq]=${encodedName}`,
      serviceURL: 'mdm',
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
    };
    const response = await getRequest(params);

    const duplicates = response?.data || [];
    // ✅ Return true if found and it's not the same record
    
    return duplicates.some((item: any) => item.id.toString() !== currentId.toString());
  } catch (err) {
    console.error('Error checking duplicate name:', err);

    return false;
  }
};


  // Validation copied from create page
  const validateForm = async () => {
    const newErrors: any = {};

    // Preschool Name
    if (!formData.preschoolName || formData.preschoolName.trim().length < 3 || formData.preschoolName.trim().length > 100) {
      newErrors.preschoolName = 'Pre-school name must be 3-100 characters';
    } else {
    const isDuplicate = await checkDuplicatePreSchoolName(formData.preschoolName, id as string);
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

    // City (auto-filled)
    if (!formData.city) {
      newErrors.city = 'City could not be determined for this pin code';
    }

    // Validity Dates
    if (!formData.validityStartDate) newErrors.validityStartDate = 'Start date is required';
    if (!formData.validityEndDate) newErrors.validityEndDate = 'End date is required';
    if (formData.validityStartDate && formData.validityEndDate) {
      if (dayjs(formData.validityEndDate).isBefore(dayjs(formData.validityStartDate))) {
        newErrors.validityEndDate = 'End date cannot be before start date';
      }
    }

    // MOU Status
    if (!formData.mouStatus) newErrors.mouStatus = 'MOU Status is required';

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

  const handleSubmit = async () => {
    if (!(await validateForm())) return;

    try {
      setSaving(true);
      const payload = {
        data: {
          pre_school_name: formData.preschoolName,
          pre_school_display_name: formData.preschoolDisplayName,
          address_1: formData.addressLine1,
          address_2: formData.addressLine2,
          co_pincode: formData.co_pincode || formData.pinCode || '',
          validity_start_date: formData.validityStartDate ? dayjs(formData.validityStartDate).toISOString() : null,
          validity_end_date: formData.validityEndDate ? dayjs(formData.validityEndDate).toISOString() : null,
          mou_status: formData.mouStatus === 'Active' ? 1 : 0,
          spoc_name: formData.spocName,
          spoc_mobile_no: formData.spocPhone,
          spoc_email: formData.spocEmail,
          school_id: (formData.applicableSchools || []).map((s) => (isNaN(Number(s)) ? s : Number(s))),
        },
      };

      const params = {
        url: `/api/ac-pre-school-tie-ups/${id}`,
        serviceURL: 'mdm',
        data: payload,
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`,
          'Content-Type': 'application/json',
        },
      };

      await putRequest(params);
     setSuccessMessage('Pre-school Tie-Up updated successfully!');
    setSuccessDialogOpen(true)
    } catch (err) {
      console.error('Error updating pre-school tie-up:', err);
      alert('Failed to update. See console.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/pre-school/list');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, p: 4, borderRadius: 2, boxShadow: 3, backgroundColor: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Edit Pre-School Tie-Up Master
        </Typography>

        <Grid container spacing={2}>
          {/* Preschool Info */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Preschool Name"
              value={formData.preschoolName}
              onChange={(e) => handleChange('preschoolName', e.target.value)}
              error={Boolean(errors.preschoolName)}
              helperText={errors.preschoolName || ''}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Preschool Display Name"
              value={formData.preschoolDisplayName}
              onChange={(e) => handleChange('preschoolDisplayName', e.target.value)}
              error={Boolean(errors.preschoolDisplayName)}
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
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              error={Boolean(errors.addressLine1)}
              helperText={errors.addressLine1 || ''}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2"
              value={formData.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              error={Boolean(errors.addressLine2)}
              helperText={errors.addressLine2 || ''}
            />
          </Grid>

          {/* City + Pin */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Pin Code"
              value={formData.pinCode}
              onChange={(e) => handleChange('pinCode', e.target.value)}
              error={Boolean(errors.pinCode)}
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
              sx={{ backgroundColor: '#e0e1e2ff' }}
              error={Boolean(errors.city)}
              helperText={errors.city || ''}
            />
          </Grid>

          {/* Dates */}
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Validity Start Date"
              value={formData.validityStartDate ? dayjs(formData.validityStartDate) : null}
              onChange={(date) => handleChange('validityStartDate', date)}
              format="DD/MM/YYYY" 
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: Boolean(errors.validityStartDate),
                  helperText: errors.validityStartDate || '',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Validity End Date"
              value={formData.validityEndDate ? dayjs(formData.validityEndDate) : null}
              onChange={(date) => handleChange('validityEndDate', date)}
              format="DD/MM/YYYY" 
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: Boolean(errors.validityEndDate),
                  helperText: errors.validityEndDate || '',
                },
              }}
            />
          </Grid>

          {/* MOU */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={Boolean(errors.mouStatus)}>
              <InputLabel>MOU Status</InputLabel>
              <Select
                label="MOU Status"
                value={formData.mouStatus}
                onChange={(e) => handleChange('mouStatus', e.target.value)}
              >
                {mouStatuses.map((status) => (
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
              onChange={(e) => handleChange('spocName', e.target.value)}
              error={Boolean(errors.spocName)}
              helperText={errors.spocName || ''}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="SPOC Phone Number"
              value={formData.spocPhone}
              onChange={(e) => handleChange('spocPhone', e.target.value)}
              error={Boolean(errors.spocPhone)}
              helperText={errors.spocPhone || ''}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="SPOC Email ID"
              value={formData.spocEmail}
              onChange={(e) => handleChange('spocEmail', e.target.value)}
              error={Boolean(errors.spocEmail)}
              helperText={errors.spocEmail || ''}
            />
          </Grid>

          {/* Schools */}
          <Grid item xs={6}>
            <FormControl fullWidth required error={Boolean(errors.applicableSchools)}>
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
          maxHeight: 50, // ✅ prevent height overflow
          overflowY: 'auto',
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        {selected.map((value) => {
          const label =
            segmentLobsOptions.find((opt) => opt.id === value)?.name || value;

          return (
            <Chip
              key={value}
              label={label}
              size="small"
              onMouseDown={(e) => e.stopPropagation()} // prevent dropdown reopen
              onDelete={() => {
                const updated = formData.applicableSchools.filter(
                  (v: string) => v !== value
                );
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
          width: 'min(50%, 420px)', // ✅ restrict dropdown width
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
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Updating...' : 'Update'}
          </Button>
        </Box>
      </Box>
      <SuccessDialog
        openDialog={successDialogOpen}
        title={successMessage}
        handleClose={() => {
          setSuccessDialogOpen(false);
          router.push('/pre-school/list'); // navigate after closing
        }}
      />
    </LocalizationProvider>
  );
}
