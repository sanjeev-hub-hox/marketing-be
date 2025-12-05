import { createContext, useContext, useState, useEffect } from 'react'
import SpinnerBackdrop from '../../@core/components/backdrop-spinner'
import ErrorDialogBox from 'src/@core/CustomComponent/ErrorDialogBox/ErrorDialogBox'

export const GlobalContext = createContext()

export const useGlobalContext = () => useContext(GlobalContext)

export const GlobalProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    isLoading: false
  })
  const [pagePaths, setPagePaths] = useState([])
  const [userPermissions, setUserPermissions] = useState([])
  const [listingMode, setListingMode] = useState('All')
  const [userInfo, setUserInfo] = useState({})
  const [apiResponseType, setApiResponseType] = useState({
    status: false,
    message: '',
    handleClose: null
  })

  useEffect(() => {
    const savedState = localStorage.getItem('userPermissionsState')
    const savedUserInfo = localStorage.getItem('userInfo')

    if (savedState) {
      setUserPermissions(JSON.parse(savedState))
    }

    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('userPermissionsState', JSON.stringify(userPermissions))
  }, [userPermissions])

  return (
    <GlobalContext.Provider
      value={{
        globalState,
        setGlobalState,
        pagePaths,
        setPagePaths,
        userPermissions,
        setUserPermissions,
        setListingMode,
        listingMode,
        userInfo,
        apiResponseType,
        setApiResponseType
      }}
    >
      <>
        {globalState.isLoading ? <SpinnerBackdrop /> : ''}

        {apiResponseType.status ? (
          <ErrorDialogBox
            openDialog={apiResponseType.status}
            title={apiResponseType.message}
            handleClose={() => {
              apiResponseType?.handleClose ? apiResponseType?.handleClose() : setApiResponseType({ status: false })
            }}
          />
        ) : (
          ''
        )}

        {children}
      </>
    </GlobalContext.Provider>
  )
}
