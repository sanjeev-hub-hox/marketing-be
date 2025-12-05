export const formatDataUrlConfig = (
  data: { module_name: string; [key: string]: any }[]
): { [key: string]: Omit<(typeof data)[0], 'module_name'> } => {
  return data?.reduce((acc: any, { module_name, ...details }) => {
    acc[module_name] = details

    return acc
  }, {})
}

// const getBaseUrl = (module_name: string) => {
//   switch (module_name) {
//     case "write_off":
//       return process.env.NEXT_PUBLIC_FRONT_FINANCE_URL;
//       break;
//     case "discount":
//       return process.env.NEXT_PUBLIC_FRONT_FINANCE_URL;
//       break;
//     case "refund":
//       return process.env.NEXT_PUBLIC_FRONT_FINANCE_URL;
//       break;
//     case "marketing":
//       return process.env.NEXT_PUBLIC_FRONT_MARKETING_URL;
//       break;
//     case "academics":
//       return process.env.NEXT_PUBLIC_FRONT_ACADEMICS_URL;
//       break;
//     case "admin":
//       return process.env.NEXT_PUBLIC_FRONT_ADMIN_URL;
//       break;
//     default:
//       return process.env.NEXT_PUBLIC_FRONT_ADMIN_URL;
//       break;
//   }
// };

const getBaseUrl = (envName: string) => {
  switch (envName) {
    case 'NEXT_PUBLIC_FRONT_FINANCE_URL':
      return process.env.NEXT_PUBLIC_FRONT_FINANCE_URL
      break
    case 'NEXT_PUBLIC_FRONT_MARKETING_URL':
      return process.env.NEXT_PUBLIC_FRONT_MARKETING_URL
      break
    case 'NEXT_PUBLIC_FRONT_ADMIN_URL':
      return process.env.NEXT_PUBLIC_FRONT_ADMIN_URL
      break
    case 'NEXT_PUBLIC_FRONT_ACADEMICS_URL':
      return process.env.NEXT_PUBLIC_FRONT_ACADEMICS_URL
      break
    case 'NEXT_PUBLIC_FRONT_COMMUNICATION_URL':
      return process.env.NEXT_PUBLIC_FRONT_COMMUNICATION_URL
      break
    default:
      return ''
      break
  }
}

export const workflowRedirectionUrl = (
  module_name: string,
  module_id: string | number,
  referenceBase: any,
  reference_id?: string | number
) => {
  if(module_name == 'route_approval'){
    
    return module_name
    ? `${process.env.NEXT_PUBLIC_FRONT_TRANSPORT_URL}route-listing/view/${reference_id}`
    : ''
   }else{
  return module_name
    ? getBaseUrl(referenceBase?.[module_name]?.base_variable) +
        referenceBase?.[module_name]?.sub_url +
        (reference_id ? `?reference_id=${reference_id}` : '') +
        (module_name ? `${reference_id ? '&' : '?'}module_name=${module_name}` : '')
    : ''
   }
}
// url structure
// https://baseUrl/subUrl/?reference_id=9&module_name=
