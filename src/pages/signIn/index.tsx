import { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import FallbackSpinner from 'src/@core/components/backdrop-spinner'

export default function SignIn() {
  const router = useRouter()
  const callbackUrl = Array.isArray(router.query.callbackUrl) ? router.query.callbackUrl[0] : router.query.callbackUrl

  useEffect(() => {
    signIn('keycloak', { callbackUrl: callbackUrl || '/' })
  }, [router])

  return <FallbackSpinner />
}
