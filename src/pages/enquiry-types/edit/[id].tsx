'use client'

import { useRouter } from 'next/router'
import EnquiryTypeForm from 'src/components/EnquiryTypeForm'

export default function CreateEnquiryType() {
  const router = useRouter()
  const { id } = router.query

  return <EnquiryTypeForm edit={true} enquiryTypeId={id} />
}
