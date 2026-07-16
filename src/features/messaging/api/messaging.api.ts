import { request } from '../../../shared/api/client'
import type { Thread } from '../../../types'
export const messagingApi={threads:()=>request<Thread[]>('/threads'),start:(ideaId:string,text:string)=>request<Thread>(`/ideas/${ideaId}/inquiries`,{method:'POST',body:JSON.stringify({text})}),send:(id:string,text:string)=>request(`/message-threads/${id}/messages`,{method:'POST',body:JSON.stringify({text})}),read:(id:string)=>request<void>(`/message-threads/${id}/read`,{method:'POST'})}
