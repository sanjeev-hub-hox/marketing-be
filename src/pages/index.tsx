import { postRequest } from 'src/services/apiService'
import { signIn } from 'next-auth/react'
import { destroyCookie } from 'nookies'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]'
import { logoutUserData } from 'src/services/authService'
import { SSO_TOKEN } from 'src/utils/constants'
import FallbackSpinner from 'src/@core/components/backdrop-spinner'
import { getLocalStorageVal } from 'src/utils/helper'
import Cookies from 'js-cookie';


const Home = (props: any) => {
  const { session } = props

  console.log('SESIION', session, props)
  if (!session) {
    signIn('keycloak')
  }
  const userInfoJson = getLocalStorageVal('userInfo')
  const userInfoDetails = userInfoJson ? JSON.parse(userInfoJson) : {}

  return <div>{session ? <div>Welcome, {userInfoDetails?.userInfo?.name}</div> : <FallbackSpinner />}</div>
}

export async function getServerSideProps(context: any) {

  
  if (process.env.NODE_ENV != 'development') {
    const session: any = await getServerSession(context.req, context.res, authOptions)
    console.log('session_data', session)

    if (!session) {
      return {
        props: {
          session: false
        }
      }
    }

    function removeUndefinedKeys(obj: any) {
      if (typeof obj !== 'object' || obj === null) {
        return obj
      }

      return Object.entries(obj).reduce(
        (acc: any, [key, value]) => {
          if (value !== undefined) {
            acc[key] = removeUndefinedKeys(value)
          }

          return acc
        },
        Array.isArray(obj) ? [] : {}
      )
    }

    const params = {
      url: 'marketing/auth/validate/key-cloak',
      headers: {
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
    const response = await postRequest(params)
    console.log('response123', response)
    console.log('Session token', session?.accessToken)

    if (response.status && response.data.status) {

      if (session?.accessToken) {
        context.res.setHeader('Set-Cookie', `auth-token-ampersandgroup=${session?.accessToken}; Path=/; Domain=.ampersandgroup.in; Max-Age=${7 * 24 * 60 * 60}`)
      }
    
      return {
        props: { session: removeUndefinedKeys(session) }
      }
    } else {
      const path = logoutUserData(session)
      console.log('in API error', path)
      if (path && path.url) {
        return {
          props: { session: false },
          redirect: {
            destination: path && path.url ? path.url : '/403',
            permanent: false
          }
        }
      } else {
        return {
          props: { session: false }
        }
      }
    }
  } else if (process.env.NODE_ENV === 'development') {
    const dummySession = {
      user: { name: 'Developer' },
      accessToken: SSO_TOKEN
    }

    return {
      props: { session: dummySession }
    }
  } else {
    destroyCookie(context, 'next-auth.session-token.1')
    destroyCookie(context, 'next-auth.session-token')
    destroyCookie(context, '__Secure-next-auth.session-token')

    return {
      props: { session: null }
    }
  }
}

export default Home
