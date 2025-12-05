// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: `icon-home-2`,
      serviceurl: 'academics',
      permission: 'dashboard_academic_overview'
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: `icon-document`,
      permission: 'all_leads',
      serviceurl: 'marketing'
    },
    {
      title: 'CRM',
      icon: `icon-CRM`,
      permissions: ['dashboard_stage_listing', 'dashboard_enquiry_type_listing'],
      children: [
        {
          title: 'Stage Listing',
          path: '/stages',
          serviceurl: 'marketing',
          permission: 'dashboard_stage_listing'
        },
        {
          title: 'Enquiry Type Listing',
          path: '/enquiry-types',
          serviceurl: 'marketing',
          permission: 'dashboard_enquiry_type_listing'
        } ,{
          title: 'Referral Listing',
          path: '/referral-listing',
          serviceurl: 'marketing',
          permission: 'dashboard_enquiry_type_listing'
        },
      ]
    },
    {
      title: 'Enquiry Management',
      icon: `icon-document`,
      path: '/enquiries',
      serviceurl: 'marketing',
      permission: 'dashboard_enquiry_management'
    },

    {
      title: 'Admission Management',
      icon: `icon-CRM`,
      path: '/registered-student-listing',
      serviceurl: 'marketing',
      permission: 'dashboard_admission_management',
      children: [
        {
          title: 'Enquiry Type Listing',
          path: '/enquiry-types',
          serviceurl: 'marketing',
          permission: 'dashboard_enquiry_type_listing'
        }
      ]
    },
    {
      title: 'Fee Collection',
      path: '/fee-collection',
      icon: `icon-fees-collection-1`,
      permission: 'dashboard_fees_collection_list',
      serviceurl: 'finance'
    },
    {
      title: 'Collection Management',
      icon: `icon-collection-management`,

      children: [
        {
          title: 'PDC',
          path: '/collection-management/pdc',
          permission: 'dashboard_pdc_list',
          serviceurl: 'finance'
        },
        {
          title: 'CDC/DD',
          path: '/collection-management/cdc-dd',
          permission: 'dashboard_cdc_dd_list',
          serviceurl: 'finance'
        },
        {
          title: 'Cash Payments',
          path: '/collection-management/cash-payments',
          permission: 'dashboard_cash_payments_list',
          serviceurl: 'finance'
        }
      ],
      permissions: ['dashboard_pdc_list', 'dashboard_cdc_dd_list', 'dashboard_cash_payments_list']
    },

    {
      title: 'Dynamic Forms',
      icon: 'icon-format-square1',
      path: '/dynamic-form-listing/',
      permission: 'dashboard_dynamic_form',
      serviceurl: 'admin'
    },
    {
      title: 'NSS Details',
      path: '/nss-details',
      icon: `icon-user-tag`,
      permission: 'dashboard_nss',
      serviceurl: 'admin'
    },
    {
      title: 'RBAC',
      icon: `icon-document`,
      permissions: [
        'dashboard_premanent_role',
        'dashboard_temporary_role',
        'dashboard_additional_duty',
        'dashboard_external_user'
      ],
      children: [
        {
          title: 'Permanent Role',
          path: '/permanent-role',
          permission: 'dashboard_premanent_role',
          serviceurl: 'admin'
        },
        {
          title: 'Temporary Role',
          path: '/temporary-role-listing',
          permission: 'dashboard_temporary_role',
          serviceurl: 'admin'
        },
        {
          title: 'Additional Duty',
          path: '/additional-duty-role-listing',
          permission: 'dashboard_additional_duty',
          serviceurl: 'admin'
        },
        {
          title: 'External Role',
          path: '/external-role',
          permission: 'dashboard_external_user',
          serviceurl: 'admin'
        }
      ]
    },

{
      title: 'Academic',
      icon: `icon-document`,
      permissions: [
        'dashboard_academic_subject_group',
        'dashboard_academic_subject',
        'dashboard_academic_school_subject_group',
        'dashboard_academic_school',
        'dashboard_marks_calculation_config',
        'greensheet_management',
        'download_exception_report_nav'
      ],
      children: [
        {
          title: 'Subject Group',
          path: '/subject-group-master',
          permission: 'dashboard_academic_subject_group',
          serviceurl: 'admin'
        },
        {
          title: 'Subject',
          path: '/subject',
          permission: 'dashboard_academic_subject',
          serviceurl: 'admin'
        },
        {
          title: 'School Subject Mapping',
          path: '/school-subject-mapping',
          permission: 'dashboard_academic_school_subject_group',
          serviceurl: 'admin'
        },
        {
          title: 'School',
          path: '/school',
          permission: 'dashboard_academic_school',
          serviceurl: 'admin'
        },
        {
          title: 'Exams & Assessments',
          path: '/exams_and_assessments/marks-logic-listing',
          permission: 'dashboard_marks_calculation_config',
          serviceurl: 'academics'
        },
        {
          title: 'Download Green Sheet',
          path: '/green-sheet',
          permission: 'greensheet_management',
          serviceurl: 'academics'
        },
        {
          title: 'Exception Report Download',
          path: '/exception-report-download',
          permission: 'download_exception_report_nav',
          serviceurl: 'academics'
        }
      ]
    },
    {
      title: 'Workflow Management',
      icon: `icon-document`,
      permissions: ['dashboard_workflow', 'dashboard_activity'],
      children: [
        {
          title: 'Workflows',
          path: '/workflow/listing',
          permission: 'dashboard_workflow',
          serviceurl: 'admin'
        },
        {
          title: 'Activities',
          path: '/workflow/activity-listing',
          permission: 'dashboard_activity',
          serviceurl: 'admin'
        }
      ]
    },
    {
      title: 'Fee Management',
      icon: `icon-document`,
      permissions: [
        'dashboard_fees_management',
        'dashboard_cheque_bounce',
        'dashboard_payment_mode',
        'dashboard_late_fees',
        'dashboard_concession',
        'dashboard_coupon'
      ],
      children: [
        {
          title: 'Fees Listings',
          path: '/fee-management/fee-listing',
          permission: 'dashboard_fees_management',
          serviceurl: 'admin'
        },
        {
          title: 'Cheque Bounced Listing',
          path: '/fee-management/cheque-bounce-listing/',
          permission: 'dashboard_cheque_bounce',
          serviceurl: 'admin'
        },
        {
          title: 'Payment Mode Listing',
          path: '/fee-management/payment-mode-listing/',
          permission: 'dashboard_payment_mode',
          serviceurl: 'admin'
        },
        {
          title: 'Late Fee Listing',
          path: '/fee-management/late-fee-listing/',
          permission: 'dashboard_late_fees',
          serviceurl: 'admin'
        },
        {
          title: 'Concession',
          path: '/fee-management/fee-discount-listing/',
          permission: 'dashboard_concession',
          serviceurl: 'admin'
        },
        {
          title: 'Coupon',
          path: '/fee-management/coupon-listing/',
          permission: 'dashboard_coupon',
          serviceurl: 'admin'
        }
      ]
    },
    {
      title: 'Communication',
      icon: `icon-document`,
      permissions: ['dashboard_communication_master', 'dashboard_communication_group','dashboard_communication_announcement'],
      children: [
        {
          title: 'Masters',
          path: '/communication-master/',
          permission: 'dashboard_communication_master',
          serviceurl: 'admin'
        },
        {
          title: 'Group',
          path: '/communication-group/',
          permission: 'dashboard_communication_group',
          serviceurl: 'admin'
        },
        {
          title: 'Announcement',
          path: '/communication/announcement',
          permission: 'dashboard_communication_announcement',
          serviceurl: 'academics'
        }
      ]
    },
    {
      title: 'Tie-Up Management',
      icon: `icon-document`,
      permissions: [
        'dashboard_academic_subject_group',
        'dashboard_academic_subject',
        'dashboard_academic_school_subject_group',
        'dashboard_academic_school'
      ],
      children: [
          {
            title: 'Preschool Tie-up',
            path: '/pre-school/list',
            permission: 'dashboard_academic_subject_group',
            serviceurl: 'marketing',
          },
          {
            title: 'Corporate Tie-up',
            path: '/corporate/list',
            permission: 'dashboard_academic_subject_group',
            serviceurl: 'marketing',
          }
      ]
    }
    ,
    {
      title: 'Coordinate Details',
      path: '/subject-selection-summary',
      serviceurl: 'admin',
      icon: `icon-profile-tick`,
      permission: 'dashboard_coordinator'
    },
    {
      title: 'Calendar Management',
      icon: `icon-calendar-1`,
      permission: 'dashboard_calender',
      children: [
        {
          title: 'Holiday Listing',
          path: '/holiday-listing/',
          permission: 'dashboard_calendar_holiday',
          serviceurl: 'admin'
        },
        {
          title: 'Event Listing',
          path: '/event-listing/',
          permission: 'dashboard_calendar_event',
          serviceurl: 'admin'
        },
        {
          title: 'Weekend Listing',
          path: '/weekend-listing/',
          permission: 'dashboard_calendar_weekend',
          serviceurl: 'admin'
        },
        {
          title: 'Subject Wise Period Allocation',
          path: '/subject-wise-period-allocation/',
          permission: 'dashboard_calendar_subject_period_view',
          serviceurl: 'admin'
        },
        {
          title: 'Lesson Plan Mapping',
          path: '/lesson-plan-mapping/',
          permission: 'dashboard_calendar_lesson_plan',
          serviceurl: 'admin'
        }
      ]
    },
    {
      title: 'Gate Management',
      icon: 'icon-Gate-Pass',
      path: '/gate-management/list/',
      permission: 'dashboard_gate_management',
      serviceurl: 'admin'
    },
    {
      title: 'Student Management',
      icon: `icon-document`,
      serviceurl: 'academics',
      permissions: [
        'dashboard_list_student',
        'dashboard_bulk_house_allocatiion',
        'dashboard_academics_subject_allocation',
        'dashboard_division_allocation_slug',
        'dashboard_edit_bulk_subject_allocation_slug'
      ],
      children: [
        {
          title: 'Student Listing',
          path: '/student-listing',
          permission: 'dashboard_list_student',
          serviceurl: 'academics'
        },
        {
          title: 'House Allocation',
          path: '/student-listing/house-allocation',
          permissions: ['dashboard_bulk_house_allocatiion', 'student_house_allocaion_update'],
          serviceurl: 'academics'
        },
        {
          title: 'Division Allocation',
          path: '/student-listing/division-allocation',
          permission: 'dashboard_division_allocation_slug',
          serviceurl: 'academics'
        },
        {
          title: 'Subject Allocation',
          path: '/student-listing/subject-allocation',
          permission: 'dashboard_edit_bulk_subject_allocation_slug',
          serviceurl: 'academics'
        },
        {
          title: 'SPARK Subject Allocation',
          path: '/student-listing/spa-subject-allocation',
          permission: 'dashboard_edit_bulk_subject_allocation_slug',
          serviceurl: 'academics'
        }
      ]
    },

    {
      title: 'Class Room',
      path: '/my-classes',
      icon: `icon-document`,
      permission: 'dashboard_class_room',
      serviceurl: 'academics'
    },
    {
      title: 'Team Management',
      path: '/my-team',
      icon: `icon-document`,
      permission: 'dashboard_list_my_team',
      serviceurl: 'academics'
    },
    {
      title: 'Timetable',
      path: '/timetable',
      icon: `icon-document`,
      permission: 'dashboard_list_timetable',
      serviceurl: 'academics'
    },

    {
      title: 'Calendar',
      icon: `icon-document`,
      permissions: ['dashboard_teacher_working_days'],
      children: [
        {
          title: 'Teacher Working Days',
          path: '/teaching-working-days',
          permission: 'dashboard_teacher_working_days',
          serviceurl: 'academics'
        },
        {
          title: 'Calender Events',
          path: '/calender-event/',
          permission: 'dashboard_teacher_working_days',
          serviceurl: 'academics'
        }
      ]
    },
    {
      title: 'Communication',
      icon: `icon-home-2`,
      permissions: ['create_types'],
      children: [
        {
          title: 'ISR Communication',
          path: '/communication/isr',
          permission: 'dashboard_communication_isr',
          serviceurl: 'academics'
        },
        {
          title: 'PSR Communication',
          path: '/communication/psr',
          permission: 'dashboard_communication_psr',
          serviceurl: 'academics'
        }
      ]
    },
    {
      title: 'Transport',
      icon: `icon-bus`,
      permissions:['dashboard_transport','dashboard_stop_master','dashboard_route_listing','dashboard_bus_listing'],
      children: [
        {
          title: 'Stop Managment',
          path: '/stop-listing',
          permission: 'dashboard_stop_master',
          serviceurl: 'transport'
        },
        {
          title: 'Route Managment',
          path: '/route-listing',
          permission: 'dashboard_route_listing',
          serviceurl: 'transport'
        },
        {
          title: 'Bus Managment',
          path: '/bus-listing',
          permission: 'dashboard_bus_listing',
          serviceurl: 'transport'
        }
      ]
    },
    {
      title: 'Route Assignment',
      icon: `icon-schoolbus`,
      path: '/assign-bus',
      permission:'dashboard_assign_bus',
      serviceurl: 'transport'
    },
    {
      title: 'Logout',
      icon: 'icon-logout'
    }
  ]
}

export default navigation
