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
  Checkbox,
} from '@mui/material';
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getRequest, putRequest } from 'src/services/apiService';
import { useRouter } from 'next/router';
import { useGlobalContext } from 'src/@core/global/GlobalContext';
import CloseIcon from '@mui/icons-material/Close';

const mouStatuses = ['Active', 'Inactive'];

export default function EditCorporateTieUp() {
  const router = useRouter();
    const { setPagePaths } = useGlobalContext()
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [segmentLobsOptions, setSegmentLobsOptions] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState<any>({
    corporateName: '',
    corporateDisplayName: '',
    addressLine1: '',
    addressLine2: '',
    pinCode: '',
    co_pincode: '', // co_pincode id or empty
    city: '',
    cityId: '',
    validityStartDate: null,
    validityEndDate: null,
    mouStatus: '',
    spocName: '',
    spocPhone: '',
    spocEmail: '',
    applicableSchools: [] as string[], // school_id ids as strings
  });

  const [errors, setErrors] = useState<{ [key: string]: any }>({});
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
const [successMessage, setSuccessMessage] = useState('');

useEffect(() => {
  setPagePaths([
    {
      title: 'Corporate Tie-Up',
      path: '/corporate/list' 
    }
  ])
}, [])
  // Fetch LOBs + corporate details
  useEffect(() => {
    if (!id) return;
    fetchSegmentLobs();
    fetchCorporateDetails(id as string);
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
  setSegmentLobsOptions(options);
}

  } catch (err) {
    console.error('Error fetching schools:', err);
  }
};

  const fetchCorporateDetails = async (corporateId: string) => {
    try {
      setLoading(true);
      const params = {
        url: `/api/ac-corporate-tie-ups/${corporateId}?populate[co_pincode][populate]=District_Or_City&populate[school_id]=*`,
        serviceURL: 'mdm',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
      };
      const res = await getRequest(params);
      const data = res?.data?.attributes || {};

      // co_pincode nested data
      const coPincodeData = data?.co_pincode?.data;
      const pincodeValue = coPincodeData?.attributes?.Pincode || '';
      const coPincodeId = coPincodeData?.id?.toString() || '';
      const cityName = coPincodeData?.attributes?.District_Or_City?.data?.attributes?.name || '';
      const cityId = coPincodeData?.attributes?.District_Or_City?.data?.id?.toString() || '';

      const selectedLobs = data?.school_id?.data?.map((lob: any) => lob.id?.toString()) || [];

      setFormData({
        corporateName: data?.corporate_name || '',
        corporateDisplayName: data?.corporate_display_name || '',
        addressLine1: data?.address_1 || '',
        addressLine2: data?.address_2 || '',
        pinCode: pincodeValue,
        co_pincode: coPincodeId,
        city: cityName,
        cityId,
        validityStartDate: data?.validity_start_date ? dayjs(data.validity_start_date) : null,
        validityEndDate: data?.validity_end_date ? dayjs(data.validity_end_date) : null,
        mouStatus: data?.mou_status === 1 ? 'Active' : 'Inactive',
        spocName: data?.spoc_name || '',
        spocPhone: data?.spoc_mobile_no || '',
        spocEmail: data?.spoc_email || '',
        applicableSchools: selectedLobs,
      });
    } catch (err) {
      console.error('Error fetching corporate details:', err);
      alert('Failed to fetch corporate details. See console.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pincode details to populate city when user types a 6-digit pincode
  const fetchPincodeDetails = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      setFormData((prev: any) => ({ ...prev, city: '', cityId: '', co_pincode: '' }));
      
      return;
    }
    try {
      const encoded = encodeURIComponent(pincode);
      const params = {
        url: `/api/co-pincodes?filters[Pincode][$eq]=${encoded}&populate=District_Or_City`,
        serviceURL: 'mdm',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
      };
      const res = await getRequest(params);
      const rec = res?.data?.[0];
      if (rec) {
        const cityName = rec.attributes?.District_Or_City?.data?.attributes?.name || '';
        const cityId = rec.attributes?.District_Or_City?.data?.id?.toString() || '';
        const coPincodeId = rec.id?.toString() || '';
        setFormData((prev: any) => ({
          ...prev,
          city: cityName,
          cityId,
          co_pincode: coPincodeId,
        }));
      } else {
        setFormData((prev: any) => ({ ...prev, city: '', cityId: '', co_pincode: '' }));
      }
    } catch (err) {
      console.error('Error fetching pincode details:', err);
      setFormData((prev: any) => ({ ...prev, city: '', cityId: '', co_pincode: '' }));
    }
  };

  const handleChange = (field: string, value: any) => {
    // pincode logic
    if (field === 'pinCode') {
      setFormData((prev: any) => ({ ...prev, pinCode: value }));
      if (value && value.toString().length === 6) {
        fetchPincodeDetails(value.toString());
      } else {
        setFormData((prev: any) => ({ ...prev, city: '', cityId: '', co_pincode: '' }));
      }
      setErrors((prev) => ({ ...prev, pinCode: false, city: false, co_pincode: false }));

      return;
    }

    if (field === 'applicableSchools') {
      const val = Array.isArray(value) ? value.map((v: any) => v.toString()) : [];
      setFormData((prev: any) => ({ ...prev, applicableSchools: val }));
      setErrors((prev) => ({ ...prev, applicableSchools: false }));

      return;
    }

    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  // 🔍 Check if another corporate tie-up exists with same name
const checkDuplicateCorporateName = async (name: string, currentId: string) => {
  try {
    const encodedName = encodeURIComponent(name.trim());
    const params = {
      url: `/api/ac-corporate-tie-ups?filters[corporate_name][$eq]=${encodedName}`,
      serviceURL: 'mdm',
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
    };
    const response = await getRequest(params);

    // If duplicate found and it's not the same record, return true
    const duplicates = response?.data || [];

    return duplicates.some((item: any) => item.id.toString() !== currentId.toString());
  } catch (err) {
    console.error('Error checking duplicate name:', err);
    
    return false;
  }
};


  // Validation same as create page
  const validateForm = async () => {
    const newErrors: any = {};

    // Corporate Name
    if (!formData.corporateName || formData.corporateName.trim().length < 3 || formData.corporateName.trim().length > 100) {
      newErrors.corporateName = 'Corporate name must be 3-100 characters';
    } else {
    const isDuplicate = await checkDuplicateCorporateName(formData.corporateName, id as string);
    if (isDuplicate) {
      newErrors.corporateName = 'Duplicate Corporate Name. Please enter a unique name.';
    }
  }

    // Corporate Display Name
    if (!formData.corporateDisplayName || formData.corporateDisplayName.trim().length < 3 || formData.corporateDisplayName.trim().length > 50) {
      newErrors.corporateDisplayName = 'Display name must be 3-50 characters';
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

  const handleSubmit = async () => {
    if (! (await validateForm())) return;

    try {
      setSaving(true);

      const payload = {
        data: {
          corporate_name: formData.corporateName,
          corporate_display_name: formData.corporateDisplayName,
          address_1: formData.addressLine1,
          address_2: formData.addressLine2,
          co_pincode: formData.co_pincode || formData.pinCode || '',
          validity_start_date: formData.validityStartDate ? dayjs(formData.validityStartDate).toISOString() : null,
          validity_end_date: formData.validityEndDate ? dayjs(formData.validityEndDate).toISOString() : null,
          mou_status: formData.mouStatus === 'Active' ? 1 : 0,
          spoc_name: formData.spocName,
          spoc_mobile_no: formData.spocPhone,
          spoc_email: formData.spocEmail,
          school_id: (formData.applicableSchools || []).map((s: string) => (isNaN(Number(s)) ? s : Number(s))),
        },
      };

      const params = {
        url: `/api/ac-corporate-tie-ups/${id}`,
        serviceURL: 'mdm',
        data: payload,
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`,
          'Content-Type': 'application/json',
        },
      };

      await putRequest(params);
      setSuccessMessage('Corporate Tie-Up updated successfully!');
    setSuccessDialogOpen(true)
    } catch (err) {
      console.error('Error updating corporate tie-up:', err);
      alert('Failed to update. See console.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/corporate/list');
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
          Edit Corporate Tie-Up Master
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Corporate Name"
              value={formData.corporateName}
              onChange={(e) => handleChange('corporateName', e.target.value)}
              error={Boolean(errors.corporateName)}
              helperText={errors.corporateName || ''}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Corporate Display Name"
              value={formData.corporateDisplayName}
              onChange={(e) => handleChange('corporateDisplayName', e.target.value)}
              error={Boolean(errors.corporateDisplayName)}
              helperText={errors.corporateDisplayName || ''}
            />
          </Grid>

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

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Pin Code"
              value={formData.pinCode}
              onChange={(e) => handleChange('pinCode', e.target.value)}
              inputProps={{ maxLength: 6 }}
              error={Boolean(errors.pinCode)}
              helperText={errors.pinCode || ''}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: '#e0e1e2ff' }}
              error={Boolean(errors.city)}
              helperText={errors.city || ''}
            />
          </Grid>

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
              {errors.mouStatus && <Box sx={{ color: 'error.main', mt: 0.5 }}>{errors.mouStatus}</Box>}
            </FormControl>
          </Grid>

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

          {/* school_id multi-select */}
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
              onMouseDown={(e) => e.stopPropagation()} // prevent dropdown reopen
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
          width: 'min(50%, 420px)', // responsive 50% width relative visual
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
    router.push('/corporate/list'); // navigate after closing
  }}
/>
    </LocalizationProvider>
  );
}
