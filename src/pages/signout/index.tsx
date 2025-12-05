import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
// @ts-ignore
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'

export default function Signout() {
  const router = useRouter()
  const { logout } = router.query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
    const clearSession = async () => {
      // Clear session cookies
      document.cookie = 'next-auth.session-token=; Max-Age=0; Path=/;'
      document.cookie = '__Secure-next-auth.session-token=; Max-Age=0; Path=/;'

      // Clear session storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      Cookies.remove('AuthToken')

      // Sign out the user
      await signOut({ callbackUrl: '/', redirect: true })
    }
    if (logout) {
      clearSession()
    }
  }, [logout])

  return null
}
