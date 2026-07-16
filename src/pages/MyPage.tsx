import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, Building2, Check, Coins, MessageSquareText, Wallet, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { seedUnitApi, type RecoveryQuote } from '../features/seed-unit/api/seedUnit.api'
import { authApi } from '../features/auth/api/auth.api'
import { useSession } from '../features/auth/model/auth.queries'
import { errorMessage } from '../shared/api/errors'
import { queryKeys } from '../shared/api/queryKeys'
import type { Holding, Idea, Ledger } from '../types'

const number=new Intl.NumberFormat('ko-KR')

export function MyPage(){
  const client=useQueryClient()
  const [tab,setTab]=useState('activity')
  const [quote,setQuote]=useState<RecoveryQuote|null>(null)
  const [profileOpen,setProfileOpen]=useState(false)
  const [profileForm,setProfileForm]=useState<{name:string;profileId:string;avatarUrl:string|null;avatarColor:string}>({name:'',profileId:'',avatarUrl:null,avatarColor:'#246bfe'})
  const [profileErrors,setProfileErrors]=useState<{name?:string;profileId?:string;avatar?:string}>({})
  const me=useSession()
  const ideas=useQuery({queryKey:queryKeys.ideas(),queryFn:()=>api<Idea[]>('/ideas')})
  const holdings=useQuery({queryKey:queryKeys.holdings,queryFn:seedUnitApi.holdings})
  const ledger=useQuery({queryKey:queryKeys.ledger,queryFn:()=>api<Ledger[]>('/ledger')})
  const quoteMutation=useMutation({mutationFn:seedUnitApi.recoveryQuote,onSuccess:setQuote})
  const recover=useMutation({mutationFn:seedUnitApi.recover,onSuccess:()=>{setQuote(null);void client.invalidateQueries({queryKey:queryKeys.holdings});void client.invalidateQueries({queryKey:queryKeys.me});void client.invalidateQueries({queryKey:queryKeys.ledger})}})
  const payout=useMutation({mutationFn:seedUnitApi.payout,onSuccess:()=>{void client.invalidateQueries({queryKey:queryKeys.me});void client.invalidateQueries({queryKey:queryKeys.ledger})}})
  const updateProfile=useMutation({mutationFn:authApi.updateProfile,onSuccess:user=>{client.setQueryData(queryKeys.me,user);setProfileOpen(false)}})
  const openProfile=()=>{setProfileForm({name:me.data?.name??'',profileId:me.data?.profileId??'',avatarUrl:me.data?.avatarUrl??null,avatarColor:me.data?.avatarColor??'#246bfe'});setProfileErrors({});setProfileOpen(true)}
  const selectAvatar=(file?:File)=>{if(!file)return;if(!file.type.startsWith('image/')){setProfileErrors(current=>({...current,avatar:'이미지 파일만 선택할 수 있습니다.'}));return}if(file.size>2*1024*1024){setProfileErrors(current=>({...current,avatar:'2MB 이하 이미지를 선택해 주세요.'}));return}const reader=new FileReader();reader.onload=()=>{setProfileForm(current=>({...current,avatarUrl:String(reader.result)}));setProfileErrors(current=>({...current,avatar:undefined}))};reader.readAsDataURL(file)}
  const saveProfile=()=>{const errors:{name?:string;profileId?:string;avatar?:string}={};if(profileForm.name.trim().length<2)errors.name='이름은 2자 이상 입력해 주세요.';if(!/^[a-zA-Z0-9_]{3,20}$/.test(profileForm.profileId))errors.profileId='영문, 숫자, 밑줄 3~20자로 입력해 주세요.';setProfileErrors(errors);if(Object.keys(errors).length===0)updateProfile.mutate({name:profileForm.name.trim(),profileId:profileForm.profileId,avatarUrl:profileForm.avatarUrl,avatarColor:profileForm.avatarColor})}

  const myFeedback=(ideas.data??[]).flatMap(idea=>idea.feedback.filter(feedback=>feedback.author===me.data?.name).map(feedback=>({feedback,idea})))
  const acceptedFeedback=myFeedback.filter(({feedback})=>feedback.accepted)
  const totalUnits=holdings.data?.reduce((sum,holding)=>sum+holding.units,0)??0
  const companyInterests=me.data?.role==='COMPANY'?(ideas.data??[]).filter(idea=>idea.companies.includes(me.data?.name??'')):[]

  return <div className="container mypage-page">
    <header className="mypage-profile">
      <div className="profile-identity"><ProfileAvatar profileId={me.data?.profileId??''} avatarUrl={me.data?.avatarUrl} color={me.data?.avatarColor} large/><div><span className="eyebrow">MY OPENSEED</span><h1>{me.data?.name}</h1><p>@{me.data?.profileId}</p></div></div>
      <div className="profile-badges"><span className="badge green"><Check/>이메일 인증</span>{me.data?.role==='COMPANY'&&<span className="badge"><Building2/>기업 인증</span>}<button className="btn ghost" onClick={openProfile}>프로필 수정</button></div>
    </header>

    <section className="activity-overview">
      <div className="activity-intro"><span>나의 검증 활동</span><h2>아이디어의 가능성을<br/>함께 선명하게 만들고 있어요.</h2><p>피드백과 Seed Unit 참여가 모두 기여 기록으로 남습니다.</p></div>
      <div className="activity-numbers"><span><b>{myFeedback.length}</b>작성한 피드백</span><span><b>{acceptedFeedback.length}</b>채택된 기여</span><span><b>{holdings.data?.length??0}</b>참여 아이디어</span></div>
      <aside className="wallet-summary"><span className="wallet-title"><Wallet/>포인트 지갑</span><div><span>사용 가능<b>{number.format(me.data?.points??0)} P</b></span><span>회수 가능<b>{number.format(me.data?.pending??0)} P</b></span></div>{Boolean(me.data?.pending)&&<button className="btn primary wide" disabled={payout.isPending} onClick={()=>payout.mutate()}>{payout.isPending?'처리 중...':'회수 가능 잔액 받기'}</button>}</aside>
    </section>

    <nav className="mypage-tabs" aria-label="마이페이지 메뉴"><button className={tab==='activity'?'active':''} onClick={()=>setTab('activity')}>내 활동</button><button className={tab==='wallet'?'active':''} onClick={()=>setTab('wallet')}>포인트·내역</button><button className={tab==='holdings'?'active':''} onClick={()=>setTab('holdings')}>Seed Unit <span>{totalUnits}</span></button>{me.data?.role==='COMPANY'&&<button className={tab==='company'?'active':''} onClick={()=>setTab('company')}>기업 활동</button>}</nav>

    {tab==='activity'&&<div className="my-activity-layout">
      <section className="my-feedback-section"><div className="section-heading"><div><span>CONTRIBUTION</span><h2>내 피드백</h2></div><b>{myFeedback.length}개</b></div>{myFeedback.length?myFeedback.map(({feedback,idea})=><Link className="my-feedback-row" to={`/ideas/${idea.id}`} key={feedback.id}><span className={`contribution-status ${feedback.accepted?'accepted':''}`}>{feedback.accepted?<Award/>:<MessageSquareText/>}</span><div><span>{idea.title}</span><h3>{feedback.text}</h3><small>{feedback.type}{feedback.accepted?' · 채택된 기여':' · 검토 중'}</small></div><b>→</b></Link>):<div className="mypage-empty"><MessageSquareText/><b>아직 작성한 피드백이 없어요.</b><p>관심 있는 아이디어에 구체적인 의견을 남겨보세요.</p><Link className="btn ghost" to="/">아이디어 발견하기</Link></div>}</section>
      <aside className="contribution-card"><span><Award/>기여 기록</span><b>{acceptedFeedback.length}회</b><p>작성자의 선택을 받은 피드백입니다.</p><div><span>받은 기여 포인트</span><b>{number.format(acceptedFeedback.length*100)} P</b></div></aside>
    </div>}

    {tab==='wallet'&&<section className="wallet-ledger"><div className="section-heading"><div><span>POINT HISTORY</span><h2>포인트 활동 내역</h2></div><b>{ledger.data?.length??0}건</b></div><div className="ledger-table"><div className="ledger-head"><span>활동</span><span>변동</span><span>일시</span></div>{ledger.data?.map(item=><div key={item.id}><span>{item.label}</span><b className={item.amount>0?'plus':'minus'}>{item.amount>0?'+':''}{item.amount} P</b><span>{item.at}</span></div>)}</div></section>}

    {tab==='holdings'&&<section className="my-holdings"><div className="section-heading"><div><span>SEED UNIT</span><h2>참여 중인 아이디어</h2></div><b>{totalUnits} Unit</b></div><div className="holding-grid">{holdings.data?.map(holding=><HoldingCard key={holding.id} holding={holding} idea={ideas.data?.find(idea=>idea.id===holding.ideaId)} onRecover={()=>quoteMutation.mutate(holding.id)}/>)}</div><div className="notice"><Coins/><span><b>가상 포인트 안내</b> Seed Unit은 현금화할 수 없으며 금전적 권리나 수익 배분을 의미하지 않습니다.</span></div></section>}

    {tab==='company'&&<section className="company-activity"><div className="section-heading"><div><span>COMPANY ACTIVITY</span><h2>관심을 표시한 아이디어</h2></div><b>{companyInterests.length}개</b></div>{companyInterests.length?companyInterests.map(idea=><Link to={`/ideas/${idea.id}`} key={idea.id}><span>{idea.category}</span><b>{idea.title}</b><small>참여자 {idea.investors}명 · 기업 관심 {idea.companies.length}곳</small></Link>):<div className="mypage-empty"><Building2/><b>아직 관심을 표시한 아이디어가 없어요.</b><p>검토 중인 아이디어에 기업 관심을 표시해 보세요.</p></div>}</section>}

    {(quoteMutation.isError||recover.isError||payout.isError)&&<p className="form-error">{errorMessage(quoteMutation.error??recover.error??payout.error)}</p>}
    {profileOpen&&<div className="modal-back"><section className="modal profile-edit-modal"><button className="close" onClick={()=>setProfileOpen(false)} aria-label="닫기"><X/></button><span className="eyebrow">EDIT PROFILE</span><h2>프로필 수정</h2><p>다른 사용자에게 공개되는 프로필 정보입니다.</p><div className="profile-edit-preview"><ProfileAvatar profileId={profileForm.profileId} avatarUrl={profileForm.avatarUrl} color={profileForm.avatarColor}/><div><b>{profileForm.name||'이름'}</b><small>@{profileForm.profileId||'profile_id'}</small></div></div><div className="profile-photo-actions"><label htmlFor="profile-photo">사진 선택<input id="profile-photo" type="file" accept="image/*" onChange={event=>selectAvatar(event.target.files?.[0])}/></label>{profileForm.avatarUrl&&<button onClick={()=>setProfileForm(current=>({...current,avatarUrl:null}))}>기본 프로필로 변경</button>}</div>{profileErrors.avatar&&<small className="field-error avatar-error">{profileErrors.avatar}</small>}<label>이름<input value={profileForm.name} onChange={event=>setProfileForm(current=>({...current,name:event.target.value}))}/>{profileErrors.name&&<small className="field-error">{profileErrors.name}</small>}</label><label>공개 프로필 ID<input value={profileForm.profileId} onChange={event=>setProfileForm(current=>({...current,profileId:event.target.value}))}/>{profileErrors.profileId?<small className="field-error">{profileErrors.profileId}</small>:<small>영문, 숫자, 밑줄 3~20자</small>}</label>{updateProfile.isError&&<p className="form-error">{errorMessage(updateProfile.error)}</p>}<div className="profile-edit-actions"><button className="btn ghost" onClick={()=>setProfileOpen(false)}>취소</button><button className="btn primary" disabled={updateProfile.isPending} onClick={saveProfile}>{updateProfile.isPending?'저장 중...':'변경사항 저장'}</button></div></section></div>}
    {quote&&<div className="modal-back"><section className="modal"><h2>Seed Unit 회수 확인</h2><div className="quote"><span>회수 Unit <b>{quote.units}</b></span><span>확정 현재가 <b>{quote.recoveryPrice} P</b></span><span>실현 포인트 <b>{quote.realizedAmount} P</b></span><span>즉시 지갑 지급 <b>{quote.walletPaidAmount} P</b></span><span>회수 가능 잔액 <b>{quote.pendingAmount} P</b></span></div><p>회수 요청 시 현재 가격이 확정되며 이후 가격 변동의 영향을 받지 않습니다.</p><div className="wizard-actions"><button className="btn ghost" onClick={()=>setQuote(null)}>취소</button><button className="btn primary" onClick={()=>recover.mutate(quote.lotId)}>회수 확정</button></div></section></div>}
  </div>
}

function HoldingCard({holding,idea,onRecover}:{holding:Holding;idea?:Idea;onRecover:()=>void}){
  const profit=((idea?.price??0)-holding.entryPrice)*holding.units
  return <article className="holding-card"><div className="holding-card-head"><span className={`badge ${holding.unlocked?'green':'orange'}`}>{holding.unlocked?'회수 가능':'24시간 잠금'}</span><small>{holding.purchasedAt} 구매</small></div><h3>{idea?.title}</h3><div className="holding-card-values"><span>보유<b>{holding.units} Unit</b></span><span>매수 원금<b>{holding.units*holding.entryPrice} P</b></span><span>현재 가치<b>{holding.units*(idea?.price??0)} P</b></span><span>손익<b className={profit>=0?'plus':'minus'}>{profit>0?'+':''}{profit} P</b></span></div><button className="btn ghost wide" disabled={!holding.unlocked} onClick={onRecover}>{holding.unlocked?'Seed Unit 회수하기':'회수 대기'}</button></article>
}

function ProfileAvatar({profileId,avatarUrl,color,large=false}:{profileId:string;avatarUrl?:string|null;color?:string;large?:boolean}){return <span className={`avatar${large?' large':''}`} style={{backgroundColor:color??'#246bfe'}}>{avatarUrl?<img src={avatarUrl} alt=""/>:(profileId[0]??'O').toUpperCase()}</span>}
