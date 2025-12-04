//TODO: Handle the constants env wise especially those who hold numeric constants
export const ENQUIRY_STATUS = {
  OPEN: 'Open',
  CLOSED: 'Close',
  ON_HOLD: 'On-hold',
};
export const ENQUIRY_PRIORITY = {
  HOT: 'Hot',
  WARM: 'Warm',
  COLD: 'Cold',
};

export const AdmissionStatus = {
  1: 'Approved',
  2: 'Pending',
  3: 'Rejected',
};

export const enquiryGlobalSearchFields = [
  'enquirer',
  'studentName',
  'mobileNumber',
  'enquiry_number',
];

export const enquiryStageGlobalSearchFields = ['name', 'color'];
export const enquiryTypeGlobalSearchFields = ['name'];

export const APPLICATION_ID = 1; // Got the value from api/applications
export const SERVICE_ID = 3; // Got the value from /api/rbac-services
export const PARENT_USER_TYPE = 1; // Got the value from /api/co-global-users
export const STUDENT_USER_TYPE = 2; // Got the value from /api/co-global-users
export const GLOBAL_ENQUIRY_GENERATOR_ID = 15; // Got the value from /api/global-number-generators

export const AGE_CALCULATOR_STATES = [
  'Maharashtra',
  'Karnataka',
  'Gujarat',
  'Uttar Pradesh',
  'Haryana',
  'Madhya Pradesh',
  'Tamil Nadu',
];

export const STATE_AGE_MAPPING = [
  {
    academic_year: '23-24',
    state: 'Maharashtra',
    eligibleAsOf: '12-31', // MM-DD,
    gradeAgeMapping: [
      {
        grade: 'Play School',
        age: {
          years: 2,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Nursery',
        age: {
          years: 3,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Junior KG',
        age: {
          years: 4,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Senior KG',
        age: {
          years: 5,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade I',
        age: {
          years: 6,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade II',
        age: {
          years: 7,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade III',
        age: {
          years: 8,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IV',
        age: {
          years: 9,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade V',
        age: {
          years: 10,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VI',
        age: {
          years: 11,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VII',
        age: {
          years: 12,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VIII',
        age: {
          years: 13,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IX',
        age: {
          years: 14,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade X',
        age: {
          years: 15,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XI',
        age: {
          years: 16,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XII',
        age: {
          years: 17,
          months: 0,
          days: 0,
        },
      },
    ],
  },
  {
    academic_year: '23-24',
    state: 'Karnataka',
    eligibleAsOf: '06-01',
    gradeAgeMapping: [
      {
        grade: 'Play School',
        age: {
          years: 2,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Nursery',
        age: {
          years: 3,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Junior KG',
        age: {
          years: 4,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Senior KG',
        age: {
          years: 4,
          months: 10,
          days: 0,
        },
      },
      {
        grade: 'Grade I',
        age: {
          years: 7,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade II',
        age: {
          years: 8,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade III',
        age: {
          years: 9,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IV',
        age: {
          years: 10,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade V',
        age: {
          years: 11,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VI',
        age: {
          years: 12,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VII',
        age: {
          years: 13,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VIII',
        age: {
          years: 14,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IX',
        age: {
          years: 15,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade X',
        age: {
          years: 16,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XI',
        age: {
          years: 17,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XII',
        age: {
          years: 18,
          months: 0,
          days: 0,
        },
      },
    ],
  },
  {
    academic_year: '23-24',
    state: 'Gujarat',
    eligibleAsOf: '06-01',
    gradeAgeMapping: [
      {
        grade: 'Play School',
        age: {
          years: 2,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Nursery',
        age: {
          years: 3,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Junior KG',
        age: {
          years: 4,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Senior KG',
        age: {
          years: 5,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade I',
        age: {
          years: 6,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade II',
        age: {
          years: 7,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade III',
        age: {
          years: 8,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IV',
        age: {
          years: 9,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade V',
        age: {
          years: 10,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VI',
        age: {
          years: 11,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VII',
        age: {
          years: 12,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VIII',
        age: {
          years: 13,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IX',
        age: {
          years: 14,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade X',
        age: {
          years: 15,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XI',
        age: {
          years: 16,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XII',
        age: {
          years: 17,
          months: 0,
          days: 0,
        },
      },
    ],
  },
  {
    academic_year: '23-24',
    state: 'Uttar Pradesh',
    eligibleAsOf: '07-01',
    gradeAgeMapping: [
      {
        grade: 'Play School',
        age: {
          years: 1,
          months: 6,
          days: 0,
        },
      },
      {
        grade: 'Nursery',
        age: {
          years: 2,
          months: 6,
          days: 0,
        },
      },
      {
        grade: 'Junior KG',
        age: {
          years: 3,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Senior KG',
        age: {
          years: 4,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade I',
        age: {
          years: 5,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade II',
        age: {
          years: 6,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade III',
        age: {
          years: 7,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IV',
        age: {
          years: 8,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade V',
        age: {
          years: 9,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VI',
        age: {
          years: 10,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VII',
        age: {
          years: 11,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VIII',
        age: {
          years: 12,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IX',
        age: {
          years: 13,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade X',
        age: {
          years: 14,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XI',
        age: {
          years: 15,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XII',
        age: {
          years: 16,
          months: 0,
          days: 0,
        },
      },
    ],
  },
  {
    academic_year: '23-24',
    state: 'Haryana',
    eligibleAsOf: '04-01',
    gradeAgeMapping: [
      {
        grade: 'Play School',
        age: {
          years: 1,
          months: 6,
          days: 0,
        },
      },
      {
        grade: 'Nursery',
        age: {
          years: 2,
          months: 6,
          days: 0,
        },
      },
      {
        grade: 'Junior KG',
        age: {
          years: 3,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Senior KG',
        age: {
          years: 4,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade I',
        age: {
          years: 5,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade II',
        age: {
          years: 6,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade III',
        age: {
          years: 7,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IV',
        age: {
          years: 8,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade V',
        age: {
          years: 9,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VI',
        age: {
          years: 10,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VII',
        age: {
          years: 11,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VIII',
        age: {
          years: 12,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IX',
        age: {
          years: 13,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade X',
        age: {
          years: 14,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XI',
        age: {
          years: 15,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XII',
        age: {
          years: 16,
          months: 0,
          days: 0,
        },
      },
    ],
  },
  {
    academic_year: '23-24',
    state: 'Madhya Pradesh',
    eligibleAsOf: '06-16',
    gradeAgeMapping: [
      {
        grade: 'Play School',
        age: {
          years: 2,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Nursery',
        age: {
          years: 3,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Junior KG',
        age: {
          years: 4,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Senior KG',
        age: {
          years: 5,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade I',
        age: {
          years: 6,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade II',
        age: {
          years: 7,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade III',
        age: {
          years: 8,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IV',
        age: {
          years: 9,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade V',
        age: {
          years: 10,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VI',
        age: {
          years: 11,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VII',
        age: {
          years: 12,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VIII',
        age: {
          years: 13,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IX',
        age: {
          years: 14,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade X',
        age: {
          years: 15,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XI',
        age: {
          years: 16,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XII',
        age: {
          years: 17,
          months: 0,
          days: 0,
        },
      },
    ],
  },
  {
    academic_year: '23-24',
    state: 'Tamil Nadu',
    eligibleAsOf: '07-31',
    mapping: [
      {
        grade: 'Play School',
        age: {
          years: 1,
          months: 6,
          days: 0,
        },
      },
      {
        grade: 'Nursery',
        age: {
          years: 2,
          months: 6,
          days: 0,
        },
      },
      {
        grade: 'Junior KG',
        age: {
          years: 3,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Senior KG',
        age: {
          years: 4,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade I',
        age: {
          years: 5,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade II',
        age: {
          years: 6,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade III',
        age: {
          years: 7,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IV',
        age: {
          years: 8,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade V',
        age: {
          years: 9,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VI',
        age: {
          years: 10,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VII',
        age: {
          years: 11,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade VIII',
        age: {
          years: 12,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade IX',
        age: {
          years: 13,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade X',
        age: {
          years: 14,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XI',
        age: {
          years: 15,
          months: 0,
          days: 0,
        },
      },
      {
        grade: 'Grade XII',
        age: {
          years: 16,
          months: 0,
          days: 0,
        },
      },
    ],
  },
];

export const HRIS_ROLE_CODE = '201SA066'; // RE role code

export const DOCUMENT_TYPE = {
  REGISTRATION: 'Registration',
  ADMISSION: 'Admission',
};

export enum ENQUIRY_TYPE {
  NEW_ADMISSION = 'NewAdmission',
  KIDS_CLUB = 'KidsClub',
  PSA = 'PSA',
  ADMISSION_10_11 = 'readmission_10_11',
}

export enum ENQUIRY_TYPE_SLUG {
  NEW_ADMISSION = 'new_admission',
  KIDS_CLUB = 'kids_club',
  PSA = 'psa',
}

export const ENQUIRY_STAGES = [
  'Enquiry',
  'School visit',
  'Academic Kit Selling',
  'Registration',
  'Competency test',
  'Admission Status',
  'Payment',
  'Admitted or Provisional Approval',
];

export const NO_OF_DAYS = 3;
