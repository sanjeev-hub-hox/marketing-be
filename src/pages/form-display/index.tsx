'use client'
import React, { useState } from 'react'
import CreateForm from '../../components/FormBuilder/CreateForm'

export function CreateField() {
  const [auto, setAuto] = useState(true)
  const [url, setUrl] = useState(null)

  const toggleAuto = () => {
    setAuto(!auto)
  }

  const updateUrl = (newUrl: any) => {
    setUrl(newUrl)
  }

  const requestSet = {
    key: 'Dummy'
  }

  return (
    <div>
      <CreateForm auto={auto} url={url} slug='registrationProcessStudentParentDetails' appendRequest={requestSet} />
    </div>
  )
}
export default CreateField
