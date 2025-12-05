export const defaultMedicalDetails = {
  was_hopitalised: false,
  year_of_hospitalisation: null,
  reason_of_hospitalisation: null,
  has_physical_disability: false,
  physical_disability_description: null,
  has_medical_history: false,
  medical_history_description: null,
  has_allergy: false,
  allergy_description: null,
  blood_group: null,
  has_learning_needs: false,
  personalised_learning_needs: null,
};

export const defaultBankDetails = {
  ifsc: null,
  bank_name: null,
  branch_name: null,
  account_holder_name: null,
  account_type: null,
  account_number: null,
  upi: null,
};

export const defaultParentInfo = {
  global_id: null,
  first_name: null,
  last_name: null,
  mobile: null,
  email: null,
  pan: null,
  qualification: null,
  occupation: null,
  organization_name: null,
  designation: null,
  office_address: null,
  area: null,
  country: null,
  pin_code: null,
  state: null,
  city: null,
  aadhar: null,
};

export const defaultGuardianInfo = {
  global_id: null,
  first_name: null,
  last_name: null,
  mobile: null,
  email: null,
  relationship_with_child: null,
  address: null,
  house: null,
  street: null,
  landmark: null,
  country: null,
  pin_code: null,
  state: null,
  city: null,
  aadhar: null,
  pan: null,
  guardian_type: null, //ENUM
};

export const defaultResidentialDetails = {
  current_address: {
    house: null,
    street: null,
    landmark: null,
    country: null,
    pin_code: null,
    state: null,
    city: null,
  },
  permanent_address: {
    house: null,
    street: null,
    landmark: null,
    country: null,
    pin_code: null,
    state: null,
    city: null,
  },
  is_permanent_address: true,
};

export const defaultExistingSchoolDetails = {
  name: null,
  board: null,
  grade: null,
  academic_year: null,
};

export const defaultPreferenceDetails = {
  mobile_of_parent: null,
  mobile: null,
  email_of_parent: null,
  email: null,
};

export const defaultContactDetails = {
  first_preference: {
    mobile_of_parent: null,
    mobile: null,
    email_of_parent: null,
    email: null,
  },
  second_preference: {
    mobile_of_parent: null,
    mobile: null,
    email_of_parent: null,
    email: null,
  },
  third_preference: {
    mobile_of_parent: null,
    mobile: null,
    email_of_parent: null,
    email: null,
  },
  emergency_contact: null,
};

export const defaultAddressDetails = {
  house: null,
  street: null,
  landmark: null,
  pin_code: null,
  country: null,
  state: null,
  city: null,
};

export const CCANDRE = {
  RE: ['203PU037', '203PU066'],
  CC: ['203CC066', '203CC037'],
};
