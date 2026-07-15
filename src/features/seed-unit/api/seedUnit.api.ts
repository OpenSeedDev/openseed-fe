import { request } from '../../../shared/api/client'
import type { Holding } from '../../../types'
export interface RecoveryQuote { lotId:string;units:number;recoveryPrice:number;realizedAmount:number;walletPaidAmount:number;pendingAmount:number }
export const seedUnitApi={
 holdings:()=>request<Holding[]>('/holdings'),
 purchase:(ideaId:string,units:number)=>request<{points:number}>(`/ideas/${ideaId}/purchase`,{method:'POST',body:JSON.stringify({units})}),
 recoveryQuote:(lotId:string)=>request<RecoveryQuote>(`/seed-units/${lotId}/recovery-quote`,{method:'POST'}),
 recover:(lotId:string)=>request<{walletPaidAmount:number;pendingAmount:number;balance:number}>(`/seed-units/${lotId}/recover`,{method:'POST'}),
 payout:()=>request<{paid:number;balance:number;pending:number}>('/wallet/pending-payout',{method:'POST'}),
}
