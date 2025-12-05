import React from 'react'
import CreateEnquiry from 'src/OwnComponents/Enquiry-Listing/CreateEnquiry'

function index() {
  return (
    <>
      <CreateEnquiry
        handleRoleDialog={function (a: boolean): void {
          throw new Error('Function not implemented.')
        }}
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
    </>
  )
}

export default index
