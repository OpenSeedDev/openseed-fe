import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../../../shared/api/errors'
import { loginSchema } from '../model/auth.schemas'
import type { LoginInput } from '../model/auth.types'
import { useLogin } from '../model/auth.queries'
import { AuthShell, Field } from './AuthShell'
export function LoginPage(){const navigate=useNavigate();const location=useLocation();const mutation=useLogin();const {register,handleSubmit,formState:{errors}}=useForm<LoginInput>({resolver:zodResolver(loginSchema),defaultValues:{email:'minseo@openseed.co.kr',password:'password123'}});const submit=handleSubmit(v=>mutation.mutate(v,{onSuccess:()=>navigate((location.state as {from?:string}|null)?.from??'/')}));return <AuthShell kicker="WELCOME BACK" title="다시 만나 반가워요" description="아이디어의 다음 성장을 이어가세요." footer={<>계정이 없나요? <Link to="/signup">회원가입</Link></>}><form onSubmit={submit}><Field label="이메일" error={errors.email?.message}><input type="email" autoComplete="email" placeholder="name@example.com" {...register('email')}/></Field><Field label="비밀번호" error={errors.password?.message}><input type="password" autoComplete="current-password" placeholder="비밀번호를 입력하세요" {...register('password')}/></Field>{mutation.isError&&<p className="form-error" role="alert">{errorMessage(mutation.error)}</p>}<button className="btn primary wide" disabled={mutation.isPending}>{mutation.isPending?'로그인 중...':'로그인'}</button></form></AuthShell>}
