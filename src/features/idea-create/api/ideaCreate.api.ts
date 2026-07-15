import { request } from '../../../shared/api/client'
import type { Idea, Visibility } from '../../../types'
export interface Candidate { id:string;title:string;summary:string;category:string;problem:string;target:string;solution:string;businessModel:string }
export interface AiJob { id:string;status:'PENDING'|'PROCESSING'|'COMPLETED'|'FAILED';candidates?:Candidate[];error?:string }
export interface PublishInput extends Omit<Candidate,'id'> { visibility:Visibility;validationQuestions:string[];imageUrl?:string }
export const ideaCreateApi={start:(keyword:string,background:string)=>request<AiJob>('/ai/idea-jobs',{method:'POST',body:JSON.stringify({keyword,background})}),status:(id:string)=>request<AiJob>(`/ai/idea-jobs/${id}`),retry:(id:string)=>request<AiJob>(`/ai/idea-jobs/${id}/retry`,{method:'POST'}),publish:(input:PublishInput)=>request<Idea>('/ideas',{method:'POST',headers:{'Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(input)})}
