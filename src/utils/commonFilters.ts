
export const buildCustomFilter = (column: string, operation: string, value: any) => {
  // this filter isnot been used now bet can be used in future for optimization
  if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
    return {};
  }

  // Helper function to convert DD-MM-YYYY to Date object
  const parseDate = (dateString: string) => {
    if (!dateString || typeof dateString !== 'string') return null;
    const [day, month, year] = dateString.split('-');
    if (!day || !month || !year) return null;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  // Helper function to get date range for a specific day
  const getDayRange = (dateString: string) => {
    const date = parseDate(dateString);
    if (!date) return null;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return { $gte: startOfDay, $lte: endOfDay };
  };

  switch (column) {
    case 'academicYear':
      if (operation === 'multiSelect') {
        return { 'academic_year.value': { $in: Array.isArray(value) ? value : [value] } };
      }
      return { 'academic_year.value': value };

    case 'status':
      return { 'status': value };

    case 'grade':
      return { 'student_details.grade.value': value };

    case 'board':
      return { 'board.value': value };

    case 'school':
      return { 'school_location.value': value };

    case 'enquirySource':
      return { 'enquiry_source.value': value };

    case 'enquiry_number':
      if (operation === 'equals') {
        return { 'enquiry_number': { $regex: value, $options: 'i' } };
      }
      return { 'enquiry_number': value };

    case 'enquiryDate':
      if (operation === 'equals') {
        const dateRange = getDayRange(value);
        return dateRange ? { 'created_at': dateRange } : {};
      }else if (operation === 'isWithin') {
        const stratdateRange = parseDate(value[0]);
        const enddateRange = parseDate(value[1]);
        return stratdateRange && enddateRange ? { 'created_at': { $gte: stratdateRange, $lte: enddateRange } } : {};
      }
      return {};

    case 'nextFollowUpDate':
      if (operation === 'equals') {
        const dateRange = getDayRange(value);
        return dateRange ? { 'next_follow_up_at': dateRange } : {};
      }else if (operation === 'isWithin') {
        const stratdateRange = parseDate(value[0]);
        const enddateRange = parseDate(value[1]);
        return stratdateRange && enddateRange ? { 'next_follow_up_at': { $gte: stratdateRange, $lte: enddateRange } } : {};
      }
      return {};

    case 'mobileNumber':
      if (operation === 'equals') {
        return {
          $or: [
            { 'parent_details.father_details.mobile': { $regex: value, $options: 'i' } },
            { 'parent_details.mother_details.mobile': { $regex: value, $options: 'i' } },
            { 'parent_details.guardian_details.mobile': { $regex: value, $options: 'i' } }
          ]
        };
      }
      return {};

    case 'studentName':
        return {
          $or: [
            { 'student_details.first_name': { $regex: value, $options: 'i' } },
            { 'student_details.last_name': { $regex: value, $options: 'i' } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ['$student_details.first_name', ' ', '$student_details.last_name'] },
                  regex: value,
                  options: 'i'
                }
              }
            }
          ]
        };

    case 'enquirer':
        return {
          $or: [
            { 'parent_details.father_details.first_name': { $regex: value, $options: 'i' } },
            { 'parent_details.father_details.last_name': { $regex: value, $options: 'i' } },
            { 'parent_details.mother_details.first_name': { $regex: value, $options: 'i' } },
            { 'parent_details.mother_details.last_name': { $regex: value, $options: 'i' } },
            { 'parent_details.guardian_details.first_name': { $regex: value, $options: 'i' } },
            { 'parent_details.guardian_details.last_name': { $regex: value, $options: 'i' } }
          ]
        };
    case 'leadOwner':
        return { 'assigned_to': { $regex: value, $options: 'i' } };

    case 'enquiryFor':
      return { 'enquiry_type.name': { $regex: value, $options: 'i' } };

    // case 'isNewLead':
    // case 'priority':
    // case 'stage':
    //   return { [`_${column}_filter`]: value }; // Special markers for post-computation filtering

    default:
      return {};
  }

};

export const buildFilter = (column: string, operation: string, value: any) => {
  switch (operation) {
    case 'contains':
      return { [column]: { $regex: value, $options: 'i' } };
    case 'equals':
      return { [column]: column === 'overdueDays' ? Number(value) : value };
    case 'greaterThan':
      return { [column]: { $gt: Number(value) } };
    case 'greaterThanOrEqual':
      return { [column]: { $gte: Number(value) } };
    case 'lessThan':
      return { [column]: { $lt: Number(value) } };
    case 'lessThanOrEqual':
      return { [column]: { $lte: Number(value) } };
    case 'startsWith':
      return { [column]: { $regex: `^${value}`, $options: 'i' } };
    case 'endsWith':
      return { [column]: { $regex: `${value}$`, $options: 'i' } };
    case 'isEmpty':
      return { [column]: { $exists: true, $in: [null, '', 'N/A'] } };
    case 'multiSelect':
      return { [column]: { $in: Array.isArray(value) ? value : [value] } };
    case 'isNotEmpty':
      return { [column]: { $exists: true, $nin: [null, '', 'N/A'] } };
    case 'isAnyOf':
      return { [column]: { $in: value } };
    case 'isWithin':
      return getDateRangeCondition(column, value);
    default:
      return {};
  }
};

const getDateRangeCondition = (column: string, values: string[]) => {
  const startDate = values[0].split('-').reverse().join('-');
  const endDate = values[1].split('-').reverse().join('-');

  switch (column) {
    case 'enquiryDate':
    case 'actionDate':
      return {
        ['created_at']: {
          $gte: new Date(`${startDate}T00:00:00.000Z`),
          $lte: new Date(`${endDate}T23:59:59.999Z`),
        },
      };
    case 'registrationDate':
      return {
        ['registered_at']: {
          $gte: new Date(`${startDate}T00:00:00.000Z`),
          $lte: new Date(`${endDate}T23:59:59.999Z`),
        },
      };
    case 'nextFollowUpDate':
      return {
        ['next_follow_up_at']: {
          $gte: new Date(`${startDate}T00:00:00.000Z`),
          $lte: new Date(`${endDate}T23:59:59.999Z`),
        },
      };
  }
};
