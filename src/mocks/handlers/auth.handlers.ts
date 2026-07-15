import { delay, http, HttpResponse } from 'msw'
import { authService } from '../services/auth.service'
const error=(status:number,code:string,message:string,fieldErrors?:Record<string,string>)=>HttpResponse.json({code,message,fieldErrors,requestId:`mock-${Date.now()}`},{status})
export const authHandlers=[
  http.get('/api/auth/me',()=>HttpResponse.json(authService.me())),
  http.get('/api/auth/check-email',({request})=>{const email=new URL(request.url).searchParams.get('email')??'';const available=authService.emailAvailable(email);return HttpResponse.json({available,message:available?undefined:'이미 가입된 이메일입니다.'})}),
  http.get('/api/auth/check-profile-id',({request})=>{const id=new URL(request.url).searchParams.get('profileId')??'';const available=authService.profileAvailable(id);return HttpResponse.json({available,message:available?undefined:'이미 사용 중인 프로필 ID입니다.'})}),
  http.post('/api/auth/signup',async({request})=>{await delay(250);const body=await request.json() as {email:string;password:string;profileId:string;name:string};if(!authService.emailAvailable(body.email))return error(409,'EMAIL_ALREADY_EXISTS','이미 가입된 이메일입니다.',{email:'이미 가입된 이메일입니다.'});if(!authService.profileAvailable(body.profileId))return error(409,'PROFILE_ID_ALREADY_EXISTS','이미 사용 중인 프로필 ID입니다.',{profileId:'이미 사용 중인 프로필 ID입니다.'});return HttpResponse.json(authService.signup(body),{status:201})}),
  http.post('/api/auth/login',async({request})=>{await delay(200);const body=await request.json() as {email:string;password:string};const user=authService.login(body.email,body.password);return user?HttpResponse.json(user):error(401,'INVALID_CREDENTIALS','이메일 또는 비밀번호가 올바르지 않습니다.')}),
  http.post('/api/auth/logout',()=>{authService.logout();return new HttpResponse(null,{status:204})}),
  http.post('/api/auth/verify-email',async({request})=>{const {token}=await request.json() as {token:string};const user=authService.verifyEmail(token);return user?HttpResponse.json(user):error(422,'INVALID_VERIFICATION_TOKEN','인증 링크가 만료되었거나 올바르지 않습니다.')}),
  http.post('/api/auth/verification/resend',()=>authService.me()?HttpResponse.json({sent:true}):error(401,'UNAUTHENTICATED','로그인이 필요합니다.')),
  http.post('/api/auth/company-verification',async({request})=>{const {email}=await request.json() as {email:string};if(!authService.me())return error(401,'UNAUTHENTICATED','로그인이 필요합니다.');if(!authService.requestCompany(email))return error(422,'FREE_EMAIL_NOT_ALLOWED','무료 개인 메일은 기업 인증에 사용할 수 없습니다.',{email:'회사 대표 이메일을 입력해 주세요.'});return HttpResponse.json({sent:true})}),
  http.post('/api/auth/company-verification/complete',async({request})=>{const {token}=await request.json() as {token:string};const user=authService.completeCompany(token);return user?HttpResponse.json(user):error(422,'INVALID_COMPANY_TOKEN','기업 인증 링크가 만료되었거나 올바르지 않습니다.')})
]
