import React from 'react'
import StudentSpecificInformation from 'src/OwnComponents/Enquiry-Listing/StudentSpecificInformation'
import { useRouter } from 'next/router'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

function Index() {
  const router: any = useRouter()
  const { setPagePaths } = useGlobalContext()
  const { id, platform, authToken } = router.query

  return <StudentSpecificInformation selectedRowId={id} />
}

export default Index
