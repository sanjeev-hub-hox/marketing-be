'use client'

import { height } from '@mui/system'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import TermsAndConditionsPopup from 'src/components/FormBuilder/TermsConditions'

export default function TErmsAndConditions() {
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()
  const router = useRouter()
  const { ids } = router?.query
  const [enquiryId, setEnquiryId] = useState<any>(null)
  const [schoolId, setSchoolId] = useState<any>(null)

  useEffect(() => {
    if (ids && ids?.length) {
      setEnquiryId(ids[0])
      setSchoolId(ids[1])
    }
  }, [ids])

  return (
    <div style={{ height: '100vh' }}>
      <TermsAndConditionsPopup open={true} enquiryId={enquiryId} schoolId={schoolId} />
    </div>
  )
}
