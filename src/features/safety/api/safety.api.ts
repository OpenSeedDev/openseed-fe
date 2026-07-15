import { request } from '../../../shared/api/client'
import type { Report } from '../../../types'
export const safetyApi={report:(input:{targetType:'IDEA'|'FEEDBACK';targetId:string;reason:string;detail?:string})=>request<Report>('/reports',{method:'POST',body:JSON.stringify(input)}),block:(id:string)=>request<{blocked:boolean}>(`/users/${id}/block`,{method:'PUT'}),unblock:(id:string)=>request<void>(`/users/${id}/block`,{method:'DELETE'}),blocked:()=>request<string[]>('/me/blocked-users')}
