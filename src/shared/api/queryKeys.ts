export const queryKeys={
  me:['me'] as const,
  ideas:(filters?:unknown)=>['ideas',filters??{}] as const,
  idea:(id:string)=>['idea',id] as const,
  feedback:(id:string)=>['idea',id,'feedback'] as const,
  timeline:(id:string)=>['idea',id,'timeline'] as const,
  wallet:['wallet'] as const,ledger:['wallet','ledger'] as const,holdings:['holdings'] as const,
  threads:['messages','threads'] as const,messages:(id:string)=>['messages',id] as const,
}
