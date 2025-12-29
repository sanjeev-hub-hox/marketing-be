export const ROUTE_PREFIX = '/marketing';
export const APPLICATION_ID = 1;
export const SERVICE_NAME = 'marketing_service';
export const MDM_API_URLS = {
  GRADE: '/api/ac-grades',
  BOARD: '/api/ac-boards',
  SCHOOL: '/api/ac-schools',
  SCHOOL_FEE: '/api/ac-schools/search-school-fees',
  DE_ENROLL_REASONS: '/api/co-reasons',
  ACADEMIC_YEAR: '/api/ac-academic-years',
  GENDER: '/api/genders',
  OCCUPATION: '/api/occupations',
  COUNTRY: '/api/countries',
  STATE: '/api/states',
  CITY: '/api/cities',
  BLOOD_GROUP: '/api/blood-groups',
  GLOBAL_USER: '/api/co-global-users/register',
  CO_GLOBAL_USER: '/api/co-global-users',
  STREAM: '/api/ac-streams',
  SHIFT: '/api/ac-shifts',
  GLOBAL_ID_GENERATOR: (id: number) =>
    `/api/global-number-generators/${id}/generator`,
  RBAC_USER_PERMISSION: '/api/rbac-role-permissions/role-permissions-for-user',
  REGISTRATION_FEE_CREATE_REQUEST: '',
  HR_EMPLOYEE_MASTER: '/api/hr-employee-masters',
  BRAND: '/api/ac-brands',
  STUDENT_TAGS: '/api/co-student-tags',
  POST_STUDENT_TAGS: '/api/ac-student-tags',
  STUDENTS: '/api/ac-students',
  Student_Siblings: '/api/ac-student-siblings',
  GUARDIANS: '/api/ac-guardians',
  STUDENT_GUARDIAN: '/api/ac-student-guardians',
  EXTERNAL_USER_PERMISSION:
    '/api/rbac-role-permissions/role-permissions-for-external',
  SEARCH_SCHOOL: '/api/ac-schools/search-school',
  GENERATE_KIT_NUMBER: '/api/global-number-generators/student_kit/generator',
  ENQUIRY_MODE: '/api/ad-enquiry-modes',
  SUBMIT_SUBJECT_DETAILS: '/api/ac-nss-subject-selecteds',
  SCHOOL_BRAND: '/api/ac-school-brands',
  PROCESS_REQUEST: '/api/ac-student-process-request',
};
export const FINANCE_API_URLS = {
  FEE_CREATE: '/transactions/student/fee/create',
  FEE_BULK_CREATE: '/transactions/student/fee/bulk-create',
  BULK_DENROLL: '/student-fees/bulk-deenrolment',
};

export const ADMIN_API_URLS = {
  STUDENT_PROFILE_CREATE: 'studentProfile/create',
  STUDENT_PROFILE_UPDATE: 'studentProfile/update',
  STUDENT_DETAILS: 'studentProfile/getEnrollmentDetail',
  MASTER_DATA: 'master/details',
  MAP_STUDENT_DOCUMENTS: 'studentProfile/student-marketing-documents',
  STUDENT_PROFILE: 'studentProfile',
  MAP_FEES: 'studentProfile/enquiry/map-fees',
};

export const FRONTEND_STANDALONE_PAGES_URL = {
  TERMS_AND_CONDITIONS: (enquiryId: string, schoolId: number) =>
    `${process.env.MARKETING_FRONTEND_URL}/accept-terms-conditions/${enquiryId}/${schoolId}`,
};

export const NOTIFICATION_API_URLS = {
  SEND_NOTIFICATION: 'notification/send',
};

export const PUBLIC_UPLOAD = './uploads';
export const PUBLIC_UPLOAD_PATH_PREFIX = '/uploads/';

// Enquiry Mode for walkin
export const walkinEnquiryMode = 2;

export const getCcReHrisCodes = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      CC: ['203CC066', '203CC037'],
      RE: ['203PU037', '203PU066'],
    };
  } else if (
    process.env.NODE_ENV === 'uat' ||
    process.env.NODE_ENV === 'preproduction'
  ) {
    return {
      CC: ['23062039999SMSACC066', '23062039999SMSRCC037', '23062039999SMSACC037'],
      RE: [
        '23061019999SMSANA021',
        '23061029999SMSANA021',
        '23061049999SMSANA021',
        '23062019999SMSANA066',
        '23062019999SMSRNA066',
        '23062019999SMSANA021',
        '23062019999PONANA164',
        '23062019999SMSANA164'
      ],
    };
  } else if (process.env.NODE_ENV === 'production') {
    return {
      CC: ['23062039999SMSACC066', '23062039999SMSRCC037', '23062039999SMSACC037'],
      RE: [
        '23061019999SMSANA021',
        '23061029999SMSANA021',
        '23061049999SMSANA021',
        '23062019999SMSANA066',
        '23062019999SMSRNA066',
        '23062019999SMSANA021',
        '23062019999PONANA164',
        '23062019999SMSANA164'
      ],
    };
  }
};

export const getSdoRoleCodes = () => {
  if (
    process.env.NODE_ENV === 'uat' ||
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'preproduction'
  ) {
    return ['23062019999SMSANA037'];
  }
  return [];
};

/**
 * Below function is used to return the service URLs based on env.
 * This function to be used if service URLs are not updated in env file.
 * NOTE: This function should be used in emergency scenarios only. Best way is to add the service URLs in env file
 */
export const getBaseServiceUrl = (env: string, service: string) => {
  if (env === 'dev') {
    switch (service.toLowerCase()) {
      case 'notification':
        return 'https://notifications-reminders-backend-r26sp3mibq-uc.a.run.app/notification';
    }
  } else {
    switch (service.toLowerCase()) {
      case 'notification':
        return 'https://notifications-reminders-backend-219111640528.us-central1.run.app/notification';
    }
  }
};

export const ALL_LEADS_PERMISSION = 'all_leads';
export const EMPLOYEE_ACTIVITY_STATUS = {
  ACTIVE: 1,
  SERVING_NOTICE_PERIOD: 3,
};
