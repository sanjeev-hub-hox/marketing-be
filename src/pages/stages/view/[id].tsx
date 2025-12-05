'use client'

import StageForm from 'src/components/SatgeForm'
import { useRouter } from 'next/router'

export default function EditStages() {
  const router = useRouter()
  const { id } = router.query

  return <StageForm view={true} stageId={id} />
}
