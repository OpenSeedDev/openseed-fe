import type { SessionUser, SignupInput } from '../../features/auth/model/auth.types'

interface MockUser extends SessionUser { password:string }
const users:MockUser[]=[{id:'u-demo',email:'minseo@openseed.co.kr',password:'password123',name:'민서',profileId:'minseo_builder',role:'COMPANY',emailVerifiedAt:'2026-07-09T00:00:00Z',companyVerifiedAt:'2026-07-10T00:00:00Z',points:1280,pending:150,likedIds:['idea-1']},{id:'u-unverified',email:'new@example.com',password:'password123',name:'새싹',profileId:'new_seed',role:'USER',emailVerifiedAt:null,companyVerifiedAt:null,points:0,pending:0,likedIds:[]}]
let sessionUserId:string|null='u-demo'
const publicUser=(user:MockUser):SessionUser=>({id:user.id,email:user.email,name:user.name,profileId:user.profileId,role:user.role,emailVerifiedAt:user.emailVerifiedAt,companyVerifiedAt:user.companyVerifiedAt,points:user.points,pending:user.pending,likedIds:user.likedIds})
export const authService={
  me:()=>{const user=users.find(v=>v.id===sessionUserId);return user?publicUser(user):null},
  emailAvailable:(email:string)=>!users.some(v=>v.email.toLowerCase()===email.toLowerCase()),
  profileAvailable:(profileId:string)=>!users.some(v=>v.profileId.toLowerCase()===profileId.toLowerCase()),
  signup:(input:SignupInput)=>{const user:MockUser={...input,id:`u-${Date.now()}`,role:'USER',emailVerifiedAt:null,companyVerifiedAt:null,points:0,pending:0,likedIds:[]};users.push(user);sessionUserId=user.id;return publicUser(user)},
  login:(email:string,password:string)=>{const user=users.find(v=>v.email.toLowerCase()===email.toLowerCase()&&v.password===password);if(!user)return null;sessionUserId=user.id;return publicUser(user)},
  logout:()=>{sessionUserId=null},
  verifyEmail:(token:string)=>{const user=users.find(v=>v.id===sessionUserId);if(!user||token!=='valid-email-token')return null;if(!user.emailVerifiedAt){user.emailVerifiedAt=new Date().toISOString();user.points=Math.min(2000,user.points+300)}return publicUser(user)},
  requestCompany:(email:string)=>{const free=['gmail.com','naver.com','daum.net','kakao.com','outlook.com'];const domain=email.split('@')[1]?.toLowerCase();return Boolean(domain&&!free.includes(domain))},
  completeCompany:(token:string)=>{const user=users.find(v=>v.id===sessionUserId);if(!user||token!=='valid-company-token'||!user.emailVerifiedAt)return null;user.role='COMPANY';user.companyVerifiedAt=new Date().toISOString();return publicUser(user)},
  setSession:(id:string|null)=>{sessionUserId=id},
}
