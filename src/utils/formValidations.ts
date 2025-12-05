export function validateTextField(value: string, label: string): { error: string | null; label: string } {
  if (!value || !String(value).trim()) {
    return { error: `The ${label} field is required`, label }
  }

  return { error: null, label }
}

export function validateSelect(value: string, label: string): string | null {
  if (!value.trim()) {
    return `Please select a ${label}`
  }

  return null
}

export function validateSelectField(value: string | undefined, label: string): { error: string | null; label: string } {
  if (!value) {
    return { error: `Please select a valid option for the ${label}`, label }
  }

  return { error: null, label }
}

export function validateRequiredField(value: string, errorMessage: string) {
  if (!value || !String(value).trim()) {
    return errorMessage || 'This field is rquired'
  }

  return ''
}

export function validateNumericField(value: string, errorMessage: string) {
  const re = /^[0-9\b]+$/
  if (!value || !re.test(value)) {
    return errorMessage
  }

  return ''
}

export function validateEmailField(value: string, errorMessage: string) {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
 
  if (value === '' || value == null) {
    return ''
  }
  else if (value !== value.toLowerCase()) {
    return 'Email must be all lowercase letters';
  }
  else if (!value || !emailRegex.test(value)) {
    return errorMessage
  }
 
  return ''
}
export function validateAlphaNumericField(value: string, errorMessage: string) {
  const re = /^[0-9a-zA-Z]*$/
  if (!value || !re.test(value)) {
    return errorMessage
  }

  return ''
}
export function validateMobileNoField(value: string, errorMessage: string) {
  const re = /^[0-9]{10}$/

  if (value === '' || value == null) {
    return ''
  } else if (!value || !re.test(value)) {
    return errorMessage || 'Enter valid mobile number'
  }

  return ''
}
export function validateRangeField(value: number, errorMessage: string, min: number, max: number) {
  if (min <= value && value <= max) {
    return errorMessage
  }

  return ''
}
