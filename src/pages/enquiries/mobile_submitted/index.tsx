'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Enquiries from 'src/OwnComponents/Enquiry-Listing/Enquiries'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'

function Index() {
  const router = useRouter()
  const { setPagePaths } = useGlobalContext()
  const { id, platform, authToken } = router.query
  const [isReady, setIsReady] = useState(false)

  const handleCompetencySuccessClose = () => {
    window?.location?.reload()
  }

  return (
    <SuccessDialog
      openDialog={true}
      title='Details Submitted Successfully'
      handleClose={handleCompetencySuccessClose}
    />
  )
}

export default Index
