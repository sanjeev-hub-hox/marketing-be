import { getLocalStorageVal, getToken } from '../utils/helper'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { AutoLogoutUser, logoutUserData } from '../services/authService'
import { toast } from 'react-hot-toast'
import { getSession } from 'next-auth/react'
 
const serviceURLList: any = {
  marketing: process.env.NEXT_PUBLIC_API_BASE_URL,
  admin: process.env.NEXT_PUBLIC_ADMIN_PANEL_BASE_URL,
  mdm: process.env.NEXT_PUBLIC_MDM_BASE_URL,
  finance: process.env.NEXT_PUBLIC_FINANCE_API_BASE_URL,
  transport: process.env.NEXT_PUBLIC_TRANSPORT_API_URL,
  communication: process.env.NEXT_PUBLIC_COMMUNICATION_API_URL
}
const token = getToken()
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`
 
  // headers: {
  //   ...(token && { Authorization: `Bearer ${token.accessToken}` })
  // }
})
 
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'PATCH'
 
const handleSignout = async () => {
  // const storageToken = localStorage.getItem('token')
  const idToken = getLocalStorageVal('idToken')
  const userSession = {
    idToken
  }
  const path = logoutUserData(userSession)
  if (path && path.url) {
    // window.open(path.url, '_self')
    window.open('/', '_self')
  } else {
    window.open('/', '_self')
  }
}
 
const handleResponseError = (error: any) => {
  const res = {
    data: null,
    error: null
  }
 
  switch (error?.response?.status) {
    case 400:
      toast.error('Error - Bad Request')
      break
    case 401:
      toast.error('Unauthenticated Logging out')
      handleSignout()
      break
    case 403:
      toast.error('Unauthorized')
      window.location.href = '/403'
      break
    case 500:
      toast.error('There Is An Internal Error')
      break
    default:
      toast.error('There Is An Internal Error')
  }
 
  if (error?.response?.data) {
    res.error = error.response.data
  } else {
    res.error = error
  }
 
  return res
}
 
async function httpRequest(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  headers: Record<string, string> = {},
  params?: any,
  serviceURL?: string,
  authToken?: string
): Promise<any> {
  try {
    let url = serviceURL ? serviceURLList[serviceURL] + endpoint : axiosInstance.defaults.baseURL + endpoint
 
    if (authToken) {
      url += (url.includes('?') ? '&' : '?') + 'platform=app'
    }
    //const token = getToken()
    const session:any = await getSession();
     console.log('SESSION-TOKEN',session)
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOV01uNDNhNmxPcnU4Y1Z2Nkp5dUdXUUtyYzdIOXVJQnRvaThjUHdYeWhnIn0.eyJleHAiOjE3NjQ5MDgyMTQsImlhdCI6MTc2NDkwNjQxNCwiYXV0aF90aW1lIjoxNzY0OTA0Nzg1LCJqdGkiOiJjODIwOTc0Zi1kM2FlLTQ2ZTEtYWM1OS0yMTgyOWY3NmNhMjEiLCJpc3MiOiJodHRwczovL2dhdGV3YXkuYW1wZXJzYW5kZ3JvdXAuaW4vcmVhbG1zL2FtcGVyc2FuZC1pbnRlcm5hbCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI5NmVkZWUzYi0xMjEwLTQ2NmUtODYzNC04ZDY5MWZiMDBiMGQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJodWJibGVvcmlvbi1tYXJrZXRpbmctcHJlcHJvZCIsInNlc3Npb25fc3RhdGUiOiI4YmMzMGRlMC03Y2I2LTQ5MzktYjRiOC05NDA3ZTEwZWJjMTgiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vcHJlcHJvZC1tYXJrZXRpbmctaHViYmxlb3Jpb24uaHViYmxlaG94LmNvbSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1hZC1pbnRyZWdyYXRpb24tdGVzdCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIGN1c3RvbVRva2VuU2NvcGUiLCJzaWQiOiI4YmMzMGRlMC03Y2I2LTQ5MzktYjRiOC05NDA3ZTEwZWJjMTgiLCJyZWFsbUZsYWciOiJpbnRlcm5hbCIsInBob25lTnVtYmVyIjoiOTY5OTg5MTQyMCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibWFuYWdlciI6IkNOPVJvaGFuIFRoYWxlLE9VPVRlc3QgT1UsT1U9VXNlcnMsT1U9SVQsT1U9VkVSVEVYLERDPXZpYmd5b3JzY2hvb2xzLERDPWNvbSIsIm5hbWUiOiJQUzEiLCJkZXNpZ25hdGlvbiI6IlRlc3QgU1NPIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicHMxIiwiZ2l2ZW5fbmFtZSI6IlBTMSIsImVtYWlsIjoicHMxQHZnb3Mub3JnIn0.a5fhoTtNCaCHZ_oN682Tguo-2h0c5u1Of9Txvy9ResagitTZZ35nEnSacQxMQmox-JvB5LfeTWb1NlIGDeHEgrzz0AKX1iToePqcxbm8Gcm6gpbbD7FdtF4OG_OKWU8PnwTBV0Q3M5TvnUCyrXA-Q2xGx_TE1qHlO5Sm39al1NnZYGCxflUrXpcL3WNJFu-YWdVijPCNyYb0RKdWX2YNOHVm-ElTH8W1EJa7b7bFvmsjPNSGpKcJdET5iUf80beKgbftyRbRhSprdu8xvyogZJ_Aex-OaftQw-bf0UrhWkxN9HufWbf5-DQPm6KxcUgR4KI9U38K3cwADfNjb4rnkg"
    const apiHeaders = {
      ...(serviceURL === 'mdm' && { Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}` }),
      ...(token && serviceURL != 'mdm' && !authToken && { Authorization: `Bearer ${token}` }),
      ...headers,
      ...(authToken && serviceURL != 'mdm' && { Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOV01uNDNhNmxPcnU4Y1Z2Nkp5dUdXUUtyYzdIOXVJQnRvaThjUHdYeWhnIn0.eyJleHAiOjE3NjQ5MDgyMTQsImlhdCI6MTc2NDkwNjQxNCwiYXV0aF90aW1lIjoxNzY0OTA0Nzg1LCJqdGkiOiJjODIwOTc0Zi1kM2FlLTQ2ZTEtYWM1OS0yMTgyOWY3NmNhMjEiLCJpc3MiOiJodHRwczovL2dhdGV3YXkuYW1wZXJzYW5kZ3JvdXAuaW4vcmVhbG1zL2FtcGVyc2FuZC1pbnRlcm5hbCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI5NmVkZWUzYi0xMjEwLTQ2NmUtODYzNC04ZDY5MWZiMDBiMGQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJodWJibGVvcmlvbi1tYXJrZXRpbmctcHJlcHJvZCIsInNlc3Npb25fc3RhdGUiOiI4YmMzMGRlMC03Y2I2LTQ5MzktYjRiOC05NDA3ZTEwZWJjMTgiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vcHJlcHJvZC1tYXJrZXRpbmctaHViYmxlb3Jpb24uaHViYmxlaG94LmNvbSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1hZC1pbnRyZWdyYXRpb24tdGVzdCIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIGN1c3RvbVRva2VuU2NvcGUiLCJzaWQiOiI4YmMzMGRlMC03Y2I2LTQ5MzktYjRiOC05NDA3ZTEwZWJjMTgiLCJyZWFsbUZsYWciOiJpbnRlcm5hbCIsInBob25lTnVtYmVyIjoiOTY5OTg5MTQyMCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibWFuYWdlciI6IkNOPVJvaGFuIFRoYWxlLE9VPVRlc3QgT1UsT1U9VXNlcnMsT1U9SVQsT1U9VkVSVEVYLERDPXZpYmd5b3JzY2hvb2xzLERDPWNvbSIsIm5hbWUiOiJQUzEiLCJkZXNpZ25hdGlvbiI6IlRlc3QgU1NPIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicHMxIiwiZ2l2ZW5fbmFtZSI6IlBTMSIsImVtYWlsIjoicHMxQHZnb3Mub3JnIn0.a5fhoTtNCaCHZ_oN682Tguo-2h0c5u1Of9Txvy9ResagitTZZ35nEnSacQxMQmox-JvB5LfeTWb1NlIGDeHEgrzz0AKX1iToePqcxbm8Gcm6gpbbD7FdtF4OG_OKWU8PnwTBV0Q3M5TvnUCyrXA-Q2xGx_TE1qHlO5Sm39al1NnZYGCxflUrXpcL3WNJFu-YWdVijPCNyYb0RKdWX2YNOHVm-ElTH8W1EJa7b7bFvmsjPNSGpKcJdET5iUf80beKgbftyRbRhSprdu8xvyogZJ_Aex-OaftQw-bf0UrhWkxN9HufWbf5-DQPm6KxcUgR4KI9U38K3cwADfNjb4rnkg` })
    }
 
    if (authToken) {
      data = data ?? {} // Initialize `data` as an empty object if it's undefined
      data.platform ??= 'app' // Add `platform` key if it doesn't exist
    }
    console.log('authToken')
    console.log(authToken)
    console.log(apiHeaders)
 
    const config: AxiosRequestConfig = {
      method: method,
      url: url,
      data: data,
      headers: apiHeaders,
      params: params
    }
    const response: AxiosResponse = await axios(config)
    const jsonData = response.data
 
    return jsonData
 
    // return (res.data = response.data)
  } catch (err: any) {
    return handleResponseError(err)
  }
}
 
export const postRequest = async (params: any) => {
  return httpRequest('POST', `${params.url}`, params?.data, params.headers, null, params?.serviceURL, params?.authToken)
}
 
export const getRequest = async (params: any) => {
  return httpRequest('GET', `${params.url}`, null, params.headers, params?.params, params.serviceURL, params?.authToken)
}
 
export const deleteRequest = async (params: any) => {
  return httpRequest('DELETE', `${params.url}`, null, params.headers, null, params?.serviceURL, params?.authToken)
}
 
export const putRequest = async (params: any) => {
  return httpRequest('PUT', `${params.url}`, params.data, params.headers, null, params?.serviceURL, params?.authToken)
}
// Nikhil
export const patchRequest = async (params: any) => {
  return httpRequest('PATCH', `${params.url}`, params.data, params.headers, null, params?.serviceURL, params?.authToken)
}
 