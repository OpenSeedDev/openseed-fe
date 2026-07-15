import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Mail } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { queryKeys } from '../../../shared/api/queryKeys'
import { errorMessage } from '../../../shared/api/errors'
import { authApi } from '../api/auth.api'
import { AuthShell } from './AuthShell'
export function VerifyEmailPage(){const [params]=useSearchParams();const client=useQueryClient();const token=params.get('token');const verify=useMutation({mutationFn:()=>authApi.verifyEmail(token??''),onSuccess:u=>client.setQueryData(queryKeys.me,u)});const resend=useMutation({mutationFn:authApi.resend});return <AuthShell title="이메일을 인증해 주세요" description="인증 후 피드백과 Seed Unit 기능을 사용할 수 있습니다."><div className="verification-box">{verify.isSuccess?<><CheckCircle2 className="success-icon"/><h2>인증이 완료되었습니다</h2><p>가입 보너스 300P가 지급되었습니다.</p><Link className="btn primary" to="/">OpenSeed 시작하기</Link></>:<><Mail/><p>메일에 포함된 인증 링크를 선택해 주세요. Mock 확인용 token은 <code>valid-email-token</code>입니다.</p>{token&&<button className="btn primary" onClick={()=>verify.mutate()} disabled={verify.isPending}>이 링크로 인증 완료</button>}<button className="btn ghost" onClick={()=>resend.mutate()} disabled={resend.isPending}>{resend.isSuccess?'인증 메일을 다시 보냈습니다':'인증 메일 다시 보내기'}</button>{verify.isError&&<p className="form-error">{errorMessage(verify.error)}</p>}</>}</div></AuthShell>}
