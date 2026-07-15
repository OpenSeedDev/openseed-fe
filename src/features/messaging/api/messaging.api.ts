import { request } from '../../../shared/api/client'
import type { Thread } from '../../../types'
export const messagingApi={threads:()=>request<Thread[]>('/threads'),send:(id:string,text:string)=>request(`/message-threads/${id}/messages`,{method:'POST',body:JSON.stringify({text})}),read:(id:string)=>request<void>(`/message-threads/${id}/read`,{method:'POST'})}
