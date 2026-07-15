import { z } from 'zod'
export const signupSchema=z.object({email:z.email('올바른 이메일을 입력해 주세요.'),password:z.string().min(8,'비밀번호는 8자 이상이어야 합니다.'),passwordConfirm:z.string(),profileId:z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/,'영문, 숫자, 밑줄만 사용할 수 있습니다.'),name:z.string().min(2).max(20)}).refine(v=>v.password===v.passwordConfirm,{path:['passwordConfirm'],message:'비밀번호가 일치하지 않습니다.'})
export const loginSchema=z.object({email:z.email(),password:z.string().min(1,'비밀번호를 입력해 주세요.')})
export const companyEmailSchema=z.object({email:z.email()})
export type SignupForm=z.infer<typeof signupSchema>
