export const AUTH_ACTIVE = true;
export const ROUTE_PREFIX = '/marketing';
export const APPLICATION_ID = 1;
export const SERVICE_NAME = 'marketing_service';
export const MDM_API_URLS = {
  GRADE: '/api/ac-grades',
  BOARD: '/api/ac-boards',
  DEENROLLREASONS: '/api/co-reasons',
  SCHOOL: '/api/ac-schools',
  ACADEMIC_YEAR: '/api/ac-academic-years',
  GENDER: '/api/genders',
  OCCUPATION: '/api/occupations',
  COUNTRY: '/api/countries',
  STATE: '/api/states',
  CITY: '/api/cities',
  BLOOD_GROUP: '/api/blood-groups',
  GLOBAL_USER: '/api/co-global-users/register',
  GLOBAL_ID_GENERATOR: (id: number) =>
    `/api/global-number-generators/${id}/generator`,
  RBAC_USER_PERMISSION: '/api/rbac-role-permissions/role-permissions-for-user',
  REGISTRATION_FEE_CREATE_REQUEST: '',
  HR_EMPLOYEE_MASTER: '/api/hr-employee-masters',
  SCHOOL_SEARCH: '/api/ac-schools/search-school',
  GLOABL_USER_SEARCH: '/api/co-global-users',
  GLOBAL_USER_STATUS: '/api/co-global-users',
  CO_GUARDIAN_RELATIONSHIPS: '/api/co-guardian-relationships',
  SCHOOL_BRAND: '/api/ac-school-brands',
};
export const FINANCE_API_URLS = {
  FEE_CREATE: '/transactions/student/fee/create',
};
export const ADMIN_PANEL_URL = {
  GET_MASTER_DETAILS: 'master/details',
  GET_WORKFLOW_BULK_DEATIL: 'workflow/bulk-details',
  POST_WORKFLOW_LOGS: 'workflow/logs',
  STUDENT_PROCESS_REQUEST: 'student-process-requests/create-request',
  SEARCH_SCHOOL_LIST: 'school/search-list',
};

export const TRANSPORT_PANEL_URL = {
  TRANSPORT_CREATE: 'student-stops-mapping/create',
  UPDATE_STUDENT_STOP_MAPPING: (enquiryNumber: string) =>
    `student-stops-mapping/updateStudentId/${enquiryNumber}`,
};

export const EMAIL_TEMPLATE_SLUGS = {
  COMPETENCY_TEST_SCHEDULED: 'competency_test_scheduled',
  COMPETENCY_TEST_RESCHEDULED: 'competency_test_rescheduled',
  COMPETENCY_TEST_CANCELLED: 'competency_test_cancelled',
  ENQUIRY_CREATED: 'enquiry_creation_domestic',
  ENQUIRY_TRANSFERED: 'enquiry_transfered', // Not found in communication master
  ENQUIRY_REASSIGNED: 'enquiry_reassigned', // Not found in communication master
  ENQUIRY_CLOSED: 'enquiry_closed', // Not found in communication master
  TERMS_AND_CONDITIONS: 'terms_and_conditions',
  ADMISSION_GRANTED: 'admission_offered',
  SCHOOL_TOUR_SCHEDULED: 'school_tour_scheduled',
  SCHOOL_TOUR_RESCHEDULED: 'school_tour_rescheduled',
  SCHOOL_TOUR_CANCELLED: 'school_tour_cancelled',
};

export const SUPPORT_EMAIL_FIELDS = {
  contact_no: '+91 6003000700',
  contact_email: 'info@vgos.org',
  link: 'https://www.vibgyorhigh.com/',
};
