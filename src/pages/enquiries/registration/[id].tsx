'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Enquiries from 'src/OwnComponents/Enquiry-Listing/Enquiries'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

function Index() {
  const router: any = useRouter()
  const { setPagePaths } = useGlobalContext()
  const { id, platform, authToken } = router.query
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Wait for the authToken to be available
    if (authToken) {
      setIsReady(true)
    }
    console.log('token')
    console.log(authToken)
  }, [authToken])

  useEffect(() => {
    setPagePaths([
      {
        title: 'Enquiry Listing',
        path: '/enquiries'
      },
      {
        title: 'Register Student',
        path: '/enquiries/registration'
      }
    ])
  }, [])

  // if (!isReady) {
  //   // Render a loading state or null while waiting for authToken
  //   return <div>Loading...</div>
  // }

  return (
    <>
      <Enquiries
        edit={false}
        setEdit={function (value: React.SetStateAction<boolean>): void {
          throw new Error('Function not implemented.')
        }}
        selectedRowId={id}
        view={false}
        setView={function (value: React.SetStateAction<boolean>): void {
          throw new Error('Function not implemented.')
        }}
        registration={true}
        app={platform}
        authToken={authToken}
      />
    </>
  )
}

export default Index
