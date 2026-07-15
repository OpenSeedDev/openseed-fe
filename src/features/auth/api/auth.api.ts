import { request } from '../../../shared/api/client'
import type { Availability, LoginInput, SessionUser, SignupInput } from '../model/auth.types'
export const authApi={
  me:()=>request<SessionUser|null>('/auth/me'),
  checkEmail:(email:string)=>request<Availability>(`/auth/check-email?email=${encodeURIComponent(email)}`),
  checkProfileId:(profileId:string)=>request<Availability>(`/auth/check-profile-id?profileId=${encodeURIComponent(profileId)}`),
  signup:(input:SignupInput)=>request<SessionUser>('/auth/signup',{method:'POST',body:JSON.stringify(input)}),
  login:(input:LoginInput)=>request<SessionUser>('/auth/login',{method:'POST',body:JSON.stringify(input)}),
  logout:()=>request<void>('/auth/logout',{method:'POST'}),
  verifyEmail:(token:string)=>request<SessionUser>('/auth/verify-email',{method:'POST',body:JSON.stringify({token})}),
  resend:()=>request<{sent:boolean}>('/auth/verification/resend',{method:'POST'}),
  verifyCompany:(email:string)=>request<{sent:boolean}>('/auth/company-verification',{method:'POST',body:JSON.stringify({email})}),
  completeCompany:(token:string)=>request<SessionUser>('/auth/company-verification/complete',{method:'POST',body:JSON.stringify({token})}),
}
