import { request } from '../../../shared/api/client'
import type { Feedback } from '../../../types'
export const feedbackApi={
 create:(ideaId:string,input:{type:string;text:string;evidence?:string})=>request<Feedback>(`/ideas/${ideaId}/feedback`,{method:'POST',body:JSON.stringify(input)}),
 update:(id:string,input:{type:string;text:string;evidence?:string})=>request<Feedback>(`/feedback/${id}`,{method:'PUT',body:JSON.stringify(input)}),
 remove:(id:string)=>request<void>(`/feedback/${id}`,{method:'DELETE'}),
 accept:(id:string,reply:string)=>request<Feedback>(`/feedback/${id}/accept`,{method:'POST',body:JSON.stringify({reply})}),
}
