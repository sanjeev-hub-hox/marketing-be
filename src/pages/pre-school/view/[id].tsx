'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';
import { getRequest } from 'src/services/apiService';
import { useRouter } from 'next/router';
import { useGlobalContext } from 'src/@core/global/GlobalContext';

export default function ViewPreSchoolTieUp() {
  const router = useRouter();
  const { id } = router.query;
  const { setPagePaths } = useGlobalContext();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [allSchools, setAllSchools] = useState<any[]>([]);
  const [mappedSchools, setMappedSchools] = useState<any[]>([]);

  useEffect(() => {
    setPagePaths([
      {
        title: 'Pre-School Tie-Up',
        path: '/pre-school/list',
      },
    ]);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchDetails(id as string);
  }, [id]);

  const fetchDetails = async (preSchoolId: string) => {
    setLoading(true);
    try {
      // Fetch preschool and school master together
      const [preSchoolRes, schoolsRes] = await Promise.all([
        getRequest({
          url: `/api/ac-pre-school-tie-ups/${preSchoolId}?populate[co_pincode][populate]=District_Or_City&populate[school_id]=*`,
          serviceURL: 'mdm',
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
        }),
        getRequest({
          url: `/api/ac-schools?pagination[pageSize]=200`,
          serviceURL: 'mdm',
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` },
        }),
      ]);

      const tieUpData = preSchoolRes?.data?.attributes || null;
      const schoolList = schoolsRes?.data || [];

      setData(tieUpData);
      setAllSchools(schoolList);

      // ✅ Map school IDs from school_id
      const schoolIds = tieUpData?.school_id?.data?.map((s: any) => s.id) || [];
      const matched = schoolList.filter((school: any) =>
        schoolIds.includes(school.id)
      );
      setMappedSchools(matched);
    } catch (err) {
      console.error('Error fetching pre-school details:', err);
      alert('Failed to load details. Check console.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, p: 4 }}>
        <Typography>No data found</Typography>
        <Button onClick={() => router.push('/pre-school/list')} sx={{ mt: 2 }}>
          Cancel
        </Button>
      </Box>
    );
  }

  const coPincode = data.co_pincode?.data;
  const pincode = coPincode?.attributes?.Pincode || '';
  const cityName =
    coPincode?.attributes?.District_Or_City?.data?.attributes?.name || '';

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: 'auto',
        mt: 4,
        p: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        View Pre-School Tie-Up
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Pre-School Name"
            fullWidth
            value={data.pre_school_name || ''}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Pre-School Display Name"
            fullWidth
            value={data.pre_school_display_name || ''}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Address Line 1"
            fullWidth
            value={data.address_1 || ''}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Address Line 2"
            fullWidth
            value={data.address_2 || ''}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Pin Code"
            fullWidth
            value={pincode}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="City"
            fullWidth
            value={cityName}
            InputProps={{ readOnly: true }}
            sx={{ backgroundColor: '#e0e1e2ff' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Validity Start Date"
            fullWidth
            value={
              data.validity_start_date
                ? dayjs(data.validity_start_date).format('DD/MM/YYYY')
                : ''
            }
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Validity End Date"
            fullWidth
            value={
              data.validity_end_date
                ? dayjs(data.validity_end_date).format('DD/MM/YYYY')
                : ''
            }
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="MOU Status"
            fullWidth
            value={data.mou_status === 1 ? 'Active' : 'Inactive'}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="SPOC Name"
            fullWidth
            value={data.spoc_name || ''}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="SPOC Mobile"
            fullWidth
            value={data.spoc_mobile_no || ''}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="SPOC Email"
            fullWidth
            value={data.spoc_email || ''}
            InputProps={{ readOnly: true }}
          />
        </Grid>

        {/* ✅ Schools displayed as chips */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            VIBGYOR Schools where tie-up is applicable
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {mappedSchools.length ? (
              mappedSchools.map((school: any) => (
                <Chip
                  key={school.id}
                  label={
                    school.attributes?.short_name ||
                    school.attributes?.description ||
                    `#${school.id}`
                  }
                />
              ))
            ) : (
              <Typography color="text.secondary">
                No schools assigned
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push('/pre-school/list')}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
