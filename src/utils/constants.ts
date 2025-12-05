export const SSO_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnM2ROM2ppMDBCcUo4WEtMYUR2RUFWWkhZM0dXaGVZSWtheGtBUWhJQXFrIn0.eyJleHAiOjE3Mzk5ODU1ODIsImlhdCI6MTczOTk4Mzc4MiwiYXV0aF90aW1lIjoxNzM5OTgzNzgyLCJqdGkiOiI0NGNjZDE2MS0wYmFjLTQ5NzQtYjFmYy1kMTVmOTQwZjM5ODIiLCJpc3MiOiJodHRwczovL3Nzby5hbXBlcnNhbmRncm91cC5pbi9yZWFsbXMvYW1wZXJzYW5kLWludGVybmFsLWRldiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI1MzVjMTk3Zi0yOTIwLTQ5ZTktOWEzMy1lNjBhMzQ5YjAwN2EiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJodWJibGVvcmlvbi1tYXJrZXRpbmctdWF0Iiwic2Vzc2lvbl9zdGF0ZSI6IjhkMzFiMmNmLTQ3MmYtNGVkNy1hOWJlLWJmM2ZkMTk2NjdmMyIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9lbnEyYWRtLXVhdC5hbXBlcnNhbmRncm91cC5pbiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1hZC1pbnRyZWdyYXRpb24tdGVzdCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiOGQzMWIyY2YtNDcyZi00ZWQ3LWE5YmUtYmYzZmQxOTY2N2YzIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiUFMxMCIsImRlc2lnbmF0aW9uIjoiVGVzdCBTU08iLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJwczEwIiwiZ2l2ZW5fbmFtZSI6IlBTMTAiLCJlbWFpbCI6InBzMTBAdmdvcy5vcmcifQ.Ef_Vjt5J7TISPsUM_QpZs9tH6DsoxyXd8xI3qoopFJRju8G9i1vp5PYGJF1VFN7SJT1n9z-k4dDV35KuJUKVfsYq5-E5eRASbJ4Qiobr-3jmRFbdWgKyrebWFr6xMiGrtWvDIhz-F7IzjXChbCRoMb9JWdjdYX8rKnCwyE8s8xOVhG3SXjP4CluCsksfiG2mjmQ_fo2wvQm2kleCT6scmyq1q6d6iCqM-ZbdWdWLqJJlCb1opwJ0OslxrKrswISLw4DwNcvvsMhiXjgzj60qveLmeFca58Q-SePJNNzNoHbMcpdYU3r0jCIdSJhXhRNx7GpIa0lNuwLVqH6xulci0A'
export const ENQUIRY_STATUS = {
  PASSED: 'Passed',
  FAILED: 'Failed',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  ADMITTED: 'Admitted',
  PROVISIONAL: 'Provisional Admission',
  REJECTED: 'Rejected',
  OPEN: 'Open',
  PROGRESS: 'In Progress'
}

export const ENQUIRY_STAGES = {
  ENQUIRY: 'Enquiry',
  SCHOOL_VISIT: 'School visit',
  REGISTRATION: 'Registration',
  REGISTRATION_FEES: 'Academic Kit Selling', //'Registration Fees',
  NEW_REGISTRATION_FEES: 'Academic Kit Selling',
  COMPETENCY_TEST: 'Competency test',
  ADMISSION_STATUS: 'Admission Status',
  PAYMENT: 'Payment',
  ADMITTED_PROVISIONAL: 'Admitted or Provisional Approval'
}

export const PERMISSIONS = {
  EDIT_FEE_DETAILS: "enquiry_listing_edit_fee_details",
  ENQUIRY_REOPEN:'enquiry_reopen',
  ENQUIRY_DOWNLOAD: 'enquiry_listing_download',
  REGISTRION_TRANSFER: 'registration_details_transfer',
  COMPETENCY_TEST: 'registration_details_competency_test',
  REGISTRATION_PAGE: 'enquiry_listing_registration',
  ENQUIRY_LIST: 'enquiry_listing',
  REGISTRATION_MERGE: 'registration_details_merge',
  ENQUIRY_VIEW: 'enquiry_listing_view',
  FOLLOWUP: 'enquiry_listing_follow_up',
  REGISTRATION_LIST: 'registration_listing',
  SCHOOL_VISIT: 'enquiry_listing_school_visit',
  REGISTRATION_SCHOOL_VISIT: 'registration_details_school_tour',
  ENQUIRY_ACTION: 'enquiry_listing_button_action',
  REGISTRATION_LIST_FOLOWUP: 'registration_listing_follow_up',
  REGISTRATION_FOLOWUP: 'registration_details_follow_up',
  REGISTRATION_VIEW: 'registration_listing_view',
  CREATE_ENQUIRY: 'enquiry_listing_create',
  TIMELINE_FILTER: 'timeline_filters',
  REGISTRATION_DETAIL: 'registration_details',
  REGISTRATION_LIST_SCHOOL_VISIT: 'registration_listing_school_visit',
  REGISTRATION_REASSIGN: 'registration_details_reassign',
  TIMELINE: 'timeline'
}
export const FEETYPES = {
  admissionFees: 1,
  cafeteriaFees: 2,
  kidsClubFees: 8,
  postSchoolActivityFees: 11,
  registrationFees: 12,
  summerCampFees: 13,
  transportFees: 15
}

export const googlAlgo =
  '?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=folder-access-sa%40ampersand-group-418009.iam.gserviceaccount.com%2F20241213%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20241213T171703Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D"marketing%2F1734110214914.png"&X-Goog-Signature=69e85b9753aca0bd3ab607f82d1d2fc16df77fabd6ec420f433ce4869adc88a05b4675143cea1843ed8b9a61a45e516ec337ac17cac2ac2591ab505175d70e7d9e502bc6d37b006bc0bbfb5b56deaf54be4267f144d1aaf556d87b12e59508ab78ed2259a33408981dc28de30af1f2b6bcefe24a13b159d13680b91fb8ad41f92ca5f05332921906ca014ecb30695d9a3533e47a08655ed551a56f4d81730fc2f658456d401b434e8e75299492a7de25881903b4f4e15c79415b2b10e8fc769d04dcc8d648134da736ce94505284bd2597c311caa15113ed1fd953d6d8fb7b14e6dabefd4db99907ae88b863c8ad0a718f495db347de4b29f14a46580fde9ef5'

export const NOTIFICATION_LIST_TYPE = {
  all: 'all',
  read: 'read',
  unread: 'unread',
  today: 'today',
  this_week: 'this_week'
}

export const academicYearApiUrl =
  '/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1&sort[0]=id:asc'

export const FEETYPES_SLUGS = {
  CAFETERIA: 'cafeteria',
  KIDS_CLUB: 'kids_club',
  PSA: 'psa',
  SUMMER_CAMP: 'summer_camp',
  TRANSPORT: 'transport'
}

export const schoolApiUrl = '/api/ac-schools/search-school'
