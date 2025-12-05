import { useSession } from 'next-auth/react'
import CreateForm from 'src/components/FormBuilder/CreateForm'
import ParentsDetails from 'src/components/FormBuilder/ExternalFields/ParentsDetails'
import ResidentislDetails from 'src/components/FormBuilder/ExternalFields/ResidentialDetails'

export default function Sample() {
  const ss = useSession()
  console.log('SESSIONDATA',ss)
  
return <ResidentislDetails />
}

// childform

// ordercreation123
