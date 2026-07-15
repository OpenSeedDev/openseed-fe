export type Visibility = '공개형' | '반공개형' | '비공개 검증형' | '매칭형 공개'
export type Maturity = 'Seed Idea' | 'Validated Problem' | 'Prototype Ready' | 'Business Ready'

export interface Feedback { id: string; author: string; authorId?:string; type: string; text: string; evidence?:string; accepted: boolean; editedAt?:string; deletedAt?:string; authorReply?:string }
export interface Idea {
  id: string; rank: number; title: string; category: string; visibility: Visibility; maturity: Maturity; authorId?:string;
  author: string; summary: string; problem: string; target: string; solution: string; businessModel: string;
  price: number; seedInvested: number; investors: number; companies: string[]; likes: number; views: number; trend: number;
  feedback: Feedback[]; timeline: Array<{ date: string; title: string; detail?: string }>; validationQuestions?:string[]; contentAccess?:'FULL'|'SUMMARY'|'LOCKED'; capabilities?:{edit:boolean;feedback:boolean;purchase:boolean;companyInterest:boolean;requestAccess:boolean;reviewAccessRequests:boolean};
}
export interface Me { id: string; name: string; profileId: string; role: 'USER' | 'COMPANY'; verified: boolean; points: number; pending: number; likedIds: string[] }
export interface Holding { id: string; ideaId: string; units: number; entryPrice: number; purchasedAt: string; unlocked: boolean }
export interface Ledger { id: string; label: string; amount: number; at: string }
export interface Thread { id: string; ideaId: string; company: string; title: string; unread: number; messages: Array<{ id: string; mine: boolean; text: string; at: string }> }
export interface AccessRequest { id:string;ideaId:string;companyId:string;companyName:string;message:string;status:'PENDING'|'APPROVED'|'REJECTED';createdAt:string }
export interface Report { id:string;targetType:'IDEA'|'FEEDBACK';targetId:string;reason:string;detail?:string;createdAt:string }
