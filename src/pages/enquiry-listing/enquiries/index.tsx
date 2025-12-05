import React from 'react'
import Enquiries from '../../../OwnComponents/Enquiry-Listing/Enquiries'

function index() {
  return (
    <Enquiries
      edit={false}
      setEdit={function (value: React.SetStateAction<boolean>): void {
        throw new Error('Function not implemented.')
      }}
      selectedRowId={null}
      view={true}
      setView={function (value: React.SetStateAction<boolean>): void {
        throw new Error('Function not implemented.')
      }}
    />
  )
}

export default index
