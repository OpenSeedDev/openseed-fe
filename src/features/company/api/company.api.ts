import { request } from '../../../shared/api/client'
import type { AccessRequest } from '../../../types'
export const companyApi={
 interest:(ideaId:string)=>request<{interested:boolean;companies:string[]}>(`/ideas/${ideaId}/company-interest`,{method:'PUT'}),
 removeInterest:(ideaId:string)=>request<void>(`/ideas/${ideaId}/company-interest`,{method:'DELETE'}),
 requestAccess:(ideaId:string,message:string)=>request<AccessRequest>(`/ideas/${ideaId}/access-requests`,{method:'POST',body:JSON.stringify({message})}),
 requests:(ideaId:string)=>request<AccessRequest[]>(`/ideas/${ideaId}/access-requests`),
 decide:(id:string,decision:'APPROVED'|'REJECTED')=>request<AccessRequest>(`/access-requests/${id}/decision`,{method:'POST',body:JSON.stringify({decision})}),
}
