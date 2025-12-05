'use client'
import { createContext, useContext, Dispatch, SetStateAction, useState, ReactNode } from 'react'
import { getLocalStorageVal } from 'src/utils/helper'

interface ContextProps {
  userPermissions: any
  setUserPermissions: Dispatch<SetStateAction<any>>
}

const GlobalContext = createContext<ContextProps>({
  userPermissions: [],
  setUserPermissions: (): any => []
})

interface Props {
  children?: ReactNode
}

export const GlobalContextProvider = ({ children }: Props) => {
  let permissions: any = []
  if (process.env.NODE_ENV !== 'development') {
    const userInfoJson = getLocalStorageVal('userInfo')
    const userInfoDetails = userInfoJson ? JSON.parse(userInfoJson) : {}
    permissions = userInfoDetails.permissions
  } else {
    const userInfoJson = getLocalStorageVal('userInfo')
    const userInfoDetails = userInfoJson ? JSON.parse(userInfoJson) : {}
    permissions = userInfoDetails.permissions

    // permissions = [
    //   'fees_collection_concession_request',
    //   'fees_collection_view',
    //   'fees_collection_refund_request',
    //   'fees_collection_list_fees_overdue',
    //   'fees_collection_update',
    //   'fees_collection_list_fees_collected',
    //   'fees_collection_list_student_ledger',
    //   'add_charges-type',
    //   'fees_collection_reallocation_request',
    //   'charges_type',
    //   'fees_collection_writeoff_request',
    //   'fees_collection_download',
    //   'fees_collection_list_fees_collection',
    //   'fees_collection_notification',
    //   'finance_fees_collection',
    //   'fees_collection_mail',
    //   'update_charges_type'
    // ]
  }

  const [userPermissions, setUserPermissions] = useState(permissions)

  return (
    <GlobalContext.Provider value={{ userPermissions, setUserPermissions }}>
      <>{children}</>
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
