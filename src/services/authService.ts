export function logoutUser(session: any) {
  const { data, status } = session
  if (status == 'authenticated') {
    const basePath = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${
      process.env.NEXT_PUBLIC_KEYCLOAK_REALM
    }/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
      `${process.env.NEXT_PUBLIC_FRONT_BASE_URL}/signout?logout=true`
    )}`

    const path = data.idToken
      ? `${basePath}&id_token_hint=${data.idToken}`
      : `${basePath}&client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENTID}`

    window.open(path, '_self')
  }
}

export function AutoLogoutUser() {
  const basePath = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${
    process.env.NEXT_PUBLIC_KEYCLOAK_REALM
  }/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
    `${process.env.NEXT_PUBLIC_FRONT_BASE_URL}/signout?logout=true`
  )}`
  const path = `${basePath}&client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENTID}`

  window.open(path, '_self')
}

export function logoutUserData(session: any) {
  if (session) {
    const basePath = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${
      process.env.NEXT_PUBLIC_KEYCLOAK_REALM
    }/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
      `${process.env.NEXT_PUBLIC_FRONT_BASE_URL}/signout?logout=true`
    )}`

    const path = session.idToken
      ? `${basePath}&id_token_hint=${session.idToken}`
      : `${basePath}&client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENTID}`

    return {
      url: path
    }
  }
}
