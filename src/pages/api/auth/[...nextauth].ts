import KeycloakProvider from 'next-auth/providers/keycloak'
import NextAuth from 'next-auth'
import { checkJwtExp, decodeJWT } from 'src/utils/helper'

export const authOptions: any = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENTID || '',
      clientSecret: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || '',
      issuer: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`
    })
  ],
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    verificationOptions: {
      algorithms: ['HS256']
    }
  },
  callbacks: {
    async session({ session, token }: any) {
      session.user.id = token.id
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.idToken = token.idToken
      session.error = token.error || null
      session.accessTokenExpires = token?.accessTokenExpires || null
      session.realTime = token?.realTime || null
      session.refreshTokenExpires = token.refreshTokenExpires ? Date.now() + token.refreshTokenExpires * 1000 : null

      return session
    },
    async jwt({ token, user, account }: any) {
      const now = Date.now()

      // Handle the initial sign-in
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.idToken = account.id_token
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000 // convert sec → ms
          : Date.now() + 5 * 60 * 1000 // fallback: 5 mins
        token.realTime = account
        token.id = user?.id || null
        token.refreshTokenExpires = account.refresh_expires_in ? Date.now() + account.refresh_expires_in * 1000 : null

        console.log('DD>>', account)

        return token
      }

      const refreshWindow = 5 * 60 * 1000 // 5 minutes

      // If access token still valid for more than 5 minutes → return
      if (Date.now() < (token.accessTokenExpires ?? 0) - refreshWindow) {
        return token
      }

      // If refresh token expired → don't try refresh
      if (token.refreshTokenExpires && Date.now() > token.refreshTokenExpires) {
        return { ...token, error: 'RefreshTokenExpired' }
      }

      // Otherwise, token is within 5 min of expiry → refresh now
      return await refreshAccessToken(token)
    }
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        domain: process.env.NEXT_PUBLIC_DOMAIN,
        path: '/',
      },
    },
  },
  callbackUrl: {
    name: '__Secure-next-auth.callback-url',
    options: {
      sameSite: 'lax',

      path: '/',
      secure: true,
      httpOnly: true,
      domain: undefined
    }
  }
}

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENTID || '',
        client_secret: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken || ''
      })
    })

    const refreshedTokens = await response.json()
    if (!response.ok) {
      throw new Error(`Failed to refresh access token:- ${JSON.stringify(refreshedTokens)}`)
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Use existing refresh token if none is returned
      refreshTokenExpires: refreshedTokens.refresh_expires_in
        ? Date.now() + refreshedTokens.refresh_expires_in * 1000
        : null,
      idToken: refreshedTokens.id_token
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)

    return {
      ...token,
      error: 'RefreshAccessTokenError'
    }
  }
}

export default NextAuth(authOptions)
