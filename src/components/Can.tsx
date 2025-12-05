import { useGlobalContext } from 'src/context/store'
import Error401 from 'src/pages/401'
import { getLocalStorageVal } from 'src/utils/helper'

export const Can = (props: any) => {
  const checkMatch = (userPermissions: any, permissions: any) => {
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    let match = false
    const permissionsArr = Array.isArray(permissions) ? permissions : [permissions]
    if (permissionsArr.length === 0) {
      match = false
    } else {
      match = permissionsArr.some(p => userPermissions && userPermissions.includes(p))
    }

    return match
  }

  const { children, action, pagePermission } = props
  // const { userPermissions } = useGlobalContext()
  const userInfo = getLocalStorageVal('userInfo')
  const userInfoDetails = userInfo ? JSON.parse(userInfo) : {}
  const userPermissions = userInfoDetails?.permissions

  const match = checkMatch(userPermissions, pagePermission)
  if (match) {
    return <>{children}</>
  } else {
    switch (action) {
      case 'HIDE':
        return null // Return null instead of undefined
      case 'REDIRECT':
        return <Error401 />
      default:
        return null
    }
  }
}
