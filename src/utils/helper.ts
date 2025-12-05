import * as XLSX from 'xlsx'
import moment from 'moment'
import { getRequest, postRequest } from 'src/services/apiService'

export function getToken() {
  const token = typeof localStorage != 'undefined' ? localStorage.getItem('token') : null

  // const token =
  //   'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ5RHRLNkNTbjE1ZFprdU96R0xqYjR3ZGU3UHlhWExtN3JENW1UNm5HUWdnIn0.eyJleHAiOjE3MzQzNjc5MDUsImlhdCI6MTczNDM2NDMwNSwianRpIjoiMTcxNzQ2ZDQtM2U0My00MjNkLWIxOWQtNmIwMTFkYmY2ZjdhIiwiaXNzIjoiaHR0cHM6Ly9xYS52Z29zLm9yZy9yZWFsbXMvYW1wZXJzYW5kLWludGVybmFsLXFhIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImQwNGM1OTNkLWZjMzUtNDFhYy1hZWQzLTJjYmE4ZTA4YWJmNiIsInR5cCI6IkJlYXJlciIsImF6cCI6Im1hcmtldGluZy1uZW8iLCJzZXNzaW9uX3N0YXRlIjoiMmQ3ODIxOGMtNjYxNy00MDE2LWFmZDUtMTc1YjVmNGQxZjIyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL21hcmtldGluZy1yMjZzcDNtaWJxLXVjLmEucnVuLmFwcCIsImh0dHBzOi8vYWRtaW4tcGFuZWwtYmFja2VuZC1yMjZzcDNtaWJxLXVjLmEucnVuLmFwcCIsImh0dHBzOi8vZnJvbnRlbmQtbWFya2V0aW5nLXIyNnNwM21pYnEtdWMuYS5ydW4uYXBwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWFkLWludHJlZ3JhdGlvbi10ZXN0Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJzaWQiOiIyZDc4MjE4Yy02NjE3LTQwMTYtYWZkNS0xNzViNWY0ZDFmMjIiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJEYW5payBTaGVyYSBTZWhyYSIsInByZWZlcnJlZF91c2VybmFtZSI6ImRhbmlrLnNoZXJhIiwiZ2l2ZW5fbmFtZSI6IkRhbmlrIFNoZXJhIiwiZmFtaWx5X25hbWUiOiJTZWhyYSIsImVtYWlsIjoiZGFuaWsuc2hlcmFAYW1wZXJzYW5kZ3JvdXAuaW4ifQ.Z3BQ1e2KAVJHjX3tPlDanKCTgjDbIp5x5N0LxcreCXC5mgY6UshMz7g7ZedHx2TL1fGnSGb9T0_JWKYm5ezqujJjIbAPw9bmjLN4erA0vwVHZhbNOoAnuiyoAUWfk4cNwBZPXrQcdl2OMWLbZj05XV-vKzov3Z5Px1zEKle_pttSaM77a6h_FmrOhggvXMOKXWYianvmNzTqh8W7DyevkskVGdpHhzeAUWN_Gkb1D2xd8dbcZgnWpxBMm2vvEFNEWAVLhh1Tq7KPoCurbnJ9a5izjKDi0CJQm7oxXgrUB5Yn372cjM4VlPttx2w2oi8xF56RzjG_gdrTN9ABNxgENQ'

  return token
}
export function setSessionStorage(key: any, value: any, isJson: boolean) {
  const obj = typeof window !== 'undefined' ? sessionStorage.setItem(key, isJson ? JSON.stringify(value) : value) : null

  return obj ? true : false
}

export function getLocalStorageVal(key: string) {
  return typeof localStorage != 'undefined' ? localStorage.getItem(key) : null
}

export function getObjectKeyVal(object: any, value: any) {
  return object.find((o: any) => o.id === value)
}
export function convertToTitleCase(str: string) {
  const words = str.split('_')
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1))
  const result = capitalizedWords.join(' ')

  return result
}
export const calculateSerialNumber = (index: any, page: any, pageSize: any) => {
  return page * pageSize + index + 1
}

export const getOrderCount = (a: number) => {
  return Array.from({ length: a }).map((_, index) => {
    return { label: index + 1, value: index + 1 }
  })
}

export const getOrderCountArray = (a: number) => {
  return Array.from({ length: a }).map((_, index) => {
    return index + 1
  })
}

export function findMainObject(array: any, subStageId: string): any {
  for (let i = 0; i < array.length; i++) {
    const mainObj = array[i]
    const foundSubStage = mainObj.sub_lead.find((subStage: any) => subStage._id === subStageId)
    if (foundSubStage) {
      return { mainObject: mainObj, index: i }
    }
  }

  return null
}
export function getObjectKeyValSlug(object: any, value: any) {
  return object.find((o: any) => o.value === value)
}

export function findDifference(filteredValues: any, stageSelection: any) {
  // Find objects in array1 that are not present in array2
  const addedObjects = filteredValues.filter((obj1: any) => !stageSelection.some((obj2: any) => obj1.id === obj2.id))

  // Find objects in stageSelection that are not present in filteredValues
  const removedObjects = stageSelection.filter((obj2: any) => !filteredValues.some((obj1: any) => obj1.id === obj2.id))

  return { addedObjects, removedObjects }
}

export function validateSlug(slug: any) {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  return slugRegex.test(slug)
}

console.log(validateSlug('valid-slug')) // true
export function convertDate(isoDate: any) {
  const date = new Date(isoDate)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const year = date.getFullYear()

  return `${year}-${month}-${day}`
}

// Function to generate Excel file from JSON data
export const generateExcelFromJson = (jsonData: any, excelFilename: any) => {
  // Convert JSON array to worksheet
  jsonData?.map((val: any) => {
    delete val?.id
    delete val?.serialNumber
  })
  const worksheet = XLSX.utils.json_to_sheet(jsonData)

  // Create a workbook with the worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  const workbookBinary = XLSX.write(workbook, { bookType: 'csv', type: 'binary' })

  const buffer = new ArrayBuffer(workbookBinary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < workbookBinary.length; i++) {
    view[i] = workbookBinary.charCodeAt(i) & 0xff
  }
  const blob = new Blob([buffer], { type: 'application/vnd.ms-excel' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${excelFilename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const findIndexBySlug = (array: any, slug: any) => {
  return array.findIndex((obj: any) => obj.slug === slug)
}

export const getNestedProperty = (obj: any, path: any) => {
  const regex = /\[\d\]/

  return path.split('.').reduce((acc: any, part: any) => {
    const stringifiedArrayIndex = part.match(regex)
    if (stringifiedArrayIndex) {
      part = +stringifiedArrayIndex[0].substring(1, stringifiedArrayIndex[0].length - 1)
    }

    return acc && acc[part]
  }, obj)
}

export const removeObjectNullAndEmptyKeys = (obj: any) => {
  return Object.keys(obj).reduce((acc: any, key) => {
    if (obj[key] !== null && obj[key] !== '') {
      acc[key] =
        typeof obj[key] === 'string' && (key?.includes('first_name') || key?.includes('last_name'))
          ? obj[key].trim()
          : obj[key]
    }

    return acc
  }, {})
}

export function formatDate(dateString: any) {
  // Parse the date string to a Date object
  const date = new Date(dateString)

  // Extract the month, day, and year
  const month = ('0' + (date.getMonth() + 1)).slice(-2) // getMonth() is zero-based
  const day = ('0' + date.getDate()).slice(-2)
  const year = date.getFullYear()

  // Extract the time in 12-hour format
  const hours = date.getHours()
  const minutes = ('0' + date.getMinutes()).slice(-2)
  const ampm = hours >= 12 ? 'pm' : 'am'
  const formattedHours = ('0' + (hours % 12 || 12)).slice(-2) // Convert 24-hour time to 12-hour time

  // Combine into the desired format
  // const formattedDate = `${month}/${day}/${year}-${formattedHours}:${minutes} ${ampm}`
  const formattedDate = `${day}/${month}/${year}-${formattedHours}:${minutes} ${ampm}`

  return formattedDate
}

export function formatTimeNew(slug: any, format = 'YYYY-MM-DD') {
  const isValidDate = moment(slug).isValid()

  if (!isValidDate) {
    return 'N.A.' // or any other default/fallback value you prefer
  }

  const date = moment(slug).format(format)

  return date
}
export function convertDateDD(isoDate: any) {
  const date = new Date(isoDate)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}
export function convertTime(isoDate: string) {
  const date = new Date(isoDate)

  const hours = date.getHours()
  const minutes = ('0' + date.getMinutes()).slice(-2)
  const ampm = hours >= 12 ? 'pm' : 'am'
  const formattedHours = ('0' + (hours % 12 || 12)).slice(-2) // Convert 24-hour time to 12-hour time

  return `${formattedHours}:${minutes} ${ampm}`
}

export const getObjectByKeyVal: any = (object: any, key: any, value: any) => {
  return object?.find((o: any) => o[key] === value)
}

export const getInitials = (name: string) => {
  if (name) {
    const nameArray = name.split(' ')
    const initials = nameArray.map(word => word.charAt(0).toUpperCase()).join('')

    return initials
  } else {
    return null
  }
}

export const getObjectByKeyValNew = (object: any, key: string, value: any) => {
  return object?.find((o: any) => {
    // Split the key by dot (.) to handle nested keys like 'attributes.name'
    const keys = key.split('.')

    // Traverse the object based on the keys
    let nestedValue = o
    for (const k of keys) {
      // If the key doesn't exist, return false immediately
      if (!nestedValue || !nestedValue.hasOwnProperty(k)) {
        return false
      }
      nestedValue = nestedValue[k]
    }

    // Check if the final value matches
    return nestedValue === value
  })
}

export const storeFile = async (file: any, fileName: any) => {
  const requestData = {
    file: file,
    fileName: fileName
  }

  const url = {
    url: `/transactions/store_file`,
    data: requestData,
    serviceURL: 'finance'
  }

  const response = await postRequest(url)

  return response
}

export const linkFile = async (fileName: any) => {
  const url = {
    url: `/transactions/link/file?fileName=${fileName}`,
    serviceURL: 'finance'
  }

  const response = await getRequest(url)

  return response
}

export const formatAmount = (amount: any) => {
  return new Intl.NumberFormat('en-IN').format(amount)
}
export function searchObjectsByAttribute(objects: any, attributePath: any, value: any) {
  const keys = attributePath.split('.')

  return objects.filter((obj: any) => {
    let current = obj
    for (const key of keys) {
      if (current[key] === undefined) {
        return false
      }
      current = current[key]
    }

    return current === value
  })
}

export const getUserInfo = () => {
  const userDetailsJsonDt = getLocalStorageVal('userInfo')
  const userDetailsDt = userDetailsJsonDt ? JSON.parse(userDetailsJsonDt) : {}

  return userDetailsDt
}

export function getServiceUrl(serviceurl?: string) {
  if (serviceurl === 'marketing') {
    return process.env.NEXT_PUBLIC_FRONT_MARKETING_URL
  } else if (serviceurl === 'academics') {
    return process.env.NEXT_PUBLIC_FRONT_ACADEMICS_URL
  } else if (serviceurl === 'finance') {
    return process.env.NEXT_PUBLIC_FRONT_FINANCE_URL
  } else if (serviceurl === 'admin') {
    return process.env.NEXT_PUBLIC_FRONT_ADMIN_URL
  } else if (serviceurl === 'transport') {
    return process.env.NEXT_PUBLIC_FRONT_TRANSPORT_URL
  } else {
    return '/'
  }
}

export function getCurrentAcademicYear() {
  const today = new Date()
  const currentYear = today.getFullYear()

  // Financial year starts in April
  return (currentYear + 1).toString().slice(-2)
}

type GenericObject = { [key: string]: any }

export const removeDuplicatesAndNullByKey = <T extends GenericObject>(arr: T[], key: keyof T): T[] => {
  const seen = new Set<T[keyof T]>()

  return arr?.filter(item => {
    const value = item[key]
    // Exclude objects where the key's value is null or already seen
    if (value === null || seen.has(value)) {
      return false
    }
    seen.add(value)

    return true
  })
}

export function getCurrentYearObject(data: any) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const isAfterOctober = today.getMonth() >= 9 // October is the 10th month (index 9)

  const yearToCompare = isAfterOctober ? currentYear + 1 : currentYear // Adjust the year based on the date
  console.log('Year to Compare:', yearToCompare)

  return data.filter((item: any) => {
    const { name } = item.attributes
    const [startYear, endYearShort] = name.split(' - ').map(Number)
    const endYear = startYear + (endYearShort - (startYear % 100)) // Correctly calculate end year
    console.log('Checking range:', { startYear, endYear, yearToCompare })

    return yearToCompare === startYear
  })
}

export function formatDateShort(dateString: any) {
  // Parse the date string to a Date object
  const date = new Date(dateString)

  // Extract the month, day, and year
  const month = ('0' + (date.getMonth() + 1)).slice(-2) // getMonth() is zero-based
  const day = ('0' + date.getDate()).slice(-2)
  const year = date.getFullYear()

  // Extract the time in 12-hour format
  const hours = date.getHours()
  const minutes = ('0' + date.getMinutes()).slice(-2)
  const ampm = hours >= 12 ? 'pm' : 'am'
  const formattedHours = ('0' + (hours % 12 || 12)).slice(-2) // Convert 24-hour time to 12-hour time

  // Combine into the desired format
  // const formattedDate = `${month}/${day}/${year}-${formattedHours}:${minutes} ${ampm}`
  const formattedDate = `${day}/${month}/${year}`

  return formattedDate
}

export function checkJwtExp(jwtExp:any) {
  const expDate = new Date(jwtExp * 1000);

  const istDate = new Date(expDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const adjustedIstDate = new Date(istDate.getTime() - 6 * 60 * 1000);

  const currentDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const isGreaterOrEqual = currentDate  >= adjustedIstDate;

  console.log('SESSION>TIME',adjustedIstDate,currentDate,istDate)


  return isGreaterOrEqual
}


export function decodeJWT(token:any) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = atob(base64);

    return JSON.parse(payload);
  } catch (error:any) {
    console.error('Failed to decode JWT:', error.message);
   
    return null;
  }
}

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371
  const toRadians = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return parseFloat((R * c).toFixed(3))
}

export const setOptionsFromResponse = (response: any, keyMappings: any) => {
  if (!Array.isArray(response)) {
    console.error('Response should be an array')

    return []
  }

  const uniqueItems = response.reduce((acc, item) => {
    const key = `${item[keyMappings.id]}-${item[keyMappings.name]}`
    if (!acc.some((existingItem: any) => existingItem.key === key)) {
      acc.push({
        id: item[keyMappings.id],
        name: item[keyMappings.name],
        value: item[keyMappings.id],
        school_code: item[keyMappings.school_code],
        key // Ensure uniqueness for internal purposes
      })
    }

    return acc
  }, [])

  return uniqueItems
}

export const getObjectByShortNameTwoDigit = (value:any,data:any) => {
  return data.find((item:any) => item.attributes.short_name_two_digit === value);
}

export const getNameWithDate = (name:any) =>{
  const now = new Date();

const pad = (n:any) => n.toString().padStart(2, '0');

const day = pad(now.getDate());
const month = pad(now.getMonth() + 1); // Months are zero-based
const year = now.getFullYear();
const hours = pad(now.getHours());
const minutes = pad(now.getMinutes());
const seconds = pad(now.getSeconds());
const fileName = `${name}-${day}-${month}-${year}-${hours}${minutes}${seconds}`;

return fileName
}