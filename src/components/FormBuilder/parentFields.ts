export const parentFields = {
  father: [
    {
      input_field_name: 'parent_details.father_details.first_name',
      validations: [
        {
          type: 'is_required',
          validation: true,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.last_name',
      validations: [
        {
          type: 'is_required',
          validation: true,
          error_message: 'This field is requried'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.aadhar',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        },
        {
          type: 'regex',
          validation: true,
          error_message: 'Invalid Aadhar number',
          regexFormat: '^\\d{12}$'
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.pan',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        },
        {
          type: 'regex',
          validation: true,
          error_message: 'Invalid Pan number',
          regexFormat: '[A-Z]{5}[0-9]{4}[A-Z]{1}'
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.occupation',
      is_optional:true,
      type: 'masterdropdown',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.organization_name',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.designation',
      is_optional:true,
      type: 'masterdropdown',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.office_address',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    // {
    //   input_field_name: 'parent_details.father_details.area',
    //   validations: [
    //     {
    //       type: 'is_required',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'numeric',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'alphanumeric',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'email',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'mobile_no',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'range',
    //       validation: false,
    //       error_message: '',
    //       min: 0,
    //       max: 0
    //     },
    //     {
    //       type: 'is_repeatable',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'is_group_repeatable',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'is_hidden',
    //       validation: false,
    //       error_message: ''
    //     }
    //   ]
    // },
    {
      input_field_name: 'parent_details.father_details.country',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ],
      input_dependent_key: null
    },
    {
      input_field_name: 'parent_details.father_details.pin_code',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        },
        {
          type: 'regex',
          validation: true,
          error_message: 'Invalid Pincode',
          regexFormat: '^\\d{6}$'
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.state',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ],
      input_dependent_key: 'filters[country][id]'
    },
    {
      input_field_name: 'parent_details.father_details.city',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ],
      input_dependent_key: 'filters[state][id]'
    },
    {
      input_field_name: 'parent_details.father_details.mobile',
      validations: [
        {
          type: 'is_required',
          validation: true,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: 'Enter proper email'
        },
        {
          type: 'mobile_no',
          validation: true,
          error_message: "Value must be a proper mobile number"
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.email',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: true,
          error_message: 'Enter proper email'
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.father_details.qualification',
      is_optional:true,
      type: 'masterdropdown',
      validations: [
        {
          type: 'is_required',
          validation: true,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    }
  ],
  mother: [
    {
      input_field_name: 'parent_details.mother_details.first_name',
      validations: [
        {
          type: 'is_required',
          validation: true,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.last_name',
      validations: [
        {
          type: 'is_required',
          validation: true,
          error_message: 'This field is requried'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.aadhar',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        },
        {
          type: 'regex',
          validation: true,
          error_message: 'Invalid Aadhar number',
          regexFormat: '^\\d{12}$'
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.pan',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        },
        {
          type: 'regex',
          validation: true,
          error_message: 'Invalid Pan number',
          regexFormat: '[A-Z]{5}[0-9]{4}[A-Z]{1}'
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.occupation',
      is_optional:true,
      type: 'masterdropdown',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.organization_name',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.designation',
      is_optional:true,
      type: 'masterdropdown',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.office_address',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    // {
    //   input_field_name: 'parent_details.mother_details.area',
    //   validations: [
    //     {
    //       type: 'is_required',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'numeric',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'alphanumeric',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'email',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'mobile_no',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'range',
    //       validation: false,
    //       error_message: '',
    //       min: 0,
    //       max: 0
    //     },
    //     {
    //       type: 'is_repeatable',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'is_group_repeatable',
    //       validation: false,
    //       error_message: ''
    //     },
    //     {
    //       type: 'is_hidden',
    //       validation: false,
    //       error_message: ''
    //     }
    //   ]
    // },
    {
      input_field_name: 'parent_details.mother_details.country',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ],
      input_dependent_key: null
    },
    {
      input_field_name: 'parent_details.mother_details.pin_code',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        },
        {
          type: 'regex',
          validation: true,
          error_message: 'Invalid Pincode',
          regexFormat: '^\\d{6}$'
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.state',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ],
      input_dependent_key: 'filters[country][id]'
    },
    {
      input_field_name: 'parent_details.mother_details.city',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ],
      input_dependent_key: 'filters[state][id]'
    },
    {
      input_field_name: 'parent_details.mother_details.mobile',
      validations: [
        {
          type: 'is_required',
          validation: true,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: 'Enter proper email'
        },
        {
          type: 'mobile_no',
          validation: true,
          error_message: 'Value must be a proper mobile number'
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.email',
      validations: [
        {
          type: 'is_required',
          validation: true,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: true,
          error_message: 'Enter proper email'
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.mother_details.qualification',
      is_optional:true,
      type: 'masterdropdown',
      validations: [
        {
          type: 'is_required',
          validation: true,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    }
  ],
  guardian: [
    {
      input_field_name: 'parent_details.guardian_details.first_name',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.last_name',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is requried'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.email',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.mobile',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: true,
          error_message: 'Value must be a proper mobile number'
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.relationship_with_child',
      type: 'masterdropdown',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.house',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.street',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.landmark',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.pin_code',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        },
        {
          type: 'regex',
          validation: true,
          error_message: 'Invalid Pincode',
          regexFormat: '^\\d{6}$'
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.aadhar',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        },
        {
          type: 'regex',
          validation: true,
          error_message: 'Invalid Aadhar number',
          regexFormat: '^\\d{12}$'
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.pan',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: 'This field is required'
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        },
        {
          type: 'regex',
          validation: true,
          error_message: 'Invalid PAN number',
          regexFormat: '^[A-Z]{5}[0-9]{4}[A-Z]$'
        }
      ]
    },
    {
      input_field_name: 'parent_details.guardian_details.country',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ],
      input_dependent_key: null
    },
    {
      input_field_name: 'parent_details.guardian_details.state',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ],
      input_dependent_key: 'filters[country][id]'
    },
    {
      input_field_name: 'parent_details.guardian_details.city',
      is_optional:true,
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ],
      input_dependent_key: 'filters[state][id]'
    },
    {
      input_field_name: 'parent_details.guardian_details.guardian_type',
      validations: [
        {
          type: 'is_required',
          validation: false,
          error_message: ''
        },
        {
          type: 'numeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'alphanumeric',
          validation: false,
          error_message: ''
        },
        {
          type: 'email',
          validation: false,
          error_message: ''
        },
        {
          type: 'mobile_no',
          validation: false,
          error_message: ''
        },
        {
          type: 'range',
          validation: false,
          error_message: '',
          min: 0,
          max: 0
        },
        {
          type: 'is_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_group_repeatable',
          validation: false,
          error_message: ''
        },
        {
          type: 'is_hidden',
          validation: false,
          error_message: ''
        }
      ]
    }
  ]
}
