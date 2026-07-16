import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Check, Coins, Heart, LockKeyhole, MessageCircle, ShieldAlert, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { companyApi } from '../features/company/api/company.api'
import { feedbackApi } from '../features/feedback/api/feedback.api'
import { safetyApi } from '../features/safety/api/safety.api'
import { seedUnitApi } from '../features/seed-unit/api/seedUnit.api'
import { errorMessage } from '../shared/api/errors'
import { queryKeys } from '../shared/api/queryKeys'
import type { Feedback, Idea, Me } from '../types'

const num=new Intl.NumberFormat('ko-KR')

export function IdeaDetailPage(){
  const {id=''}=useParams()
  const client=useQueryClient()
  const detail=useQuery({queryKey:queryKeys.idea(id),queryFn:()=>api<Idea>(`/ideas/${id}`)})
  const me=useQuery({queryKey:['legacy-me'],queryFn:()=>api<Me>('/me')})
  const [tab,setTab]=useState('plan')
  const [feedback,setFeedback]=useState({type:'기능 개선',text:'',evidence:''})
  const [units,setUnits]=useState(1)
  const [buyOpen,setBuyOpen]=useState(false)
  const [accessMessage,setAccessMessage]=useState('')
  const refresh=()=>client.invalidateQueries({queryKey:queryKeys.idea(id)})
  const like=useMutation({mutationFn:()=>api(`/ideas/${id}/like`,{method:'POST'}),onSuccess:refresh})
  const createFeedback=useMutation({mutationFn:()=>feedbackApi.create(id,feedback),onSuccess:()=>{setFeedback({type:'기능 개선',text:'',evidence:''});void refresh();void client.invalidateQueries({queryKey:['legacy-me']})}})
  const purchase=useMutation({mutationFn:()=>seedUnitApi.purchase(id,units),onSuccess:()=>{setBuyOpen(false);void client.invalidateQueries({queryKey:['legacy-me']});void client.invalidateQueries({queryKey:queryKeys.holdings})}})
  const interest=useMutation({mutationFn:()=>companyApi.interest(id),onSuccess:refresh})
  const access=useMutation({mutationFn:()=>companyApi.requestAccess(id,accessMessage),onSuccess:refresh})
  const report=useMutation({mutationFn:()=>safetyApi.report({targetType:'IDEA',targetId:id,reason:'OTHER',detail:'사용자 신고'}),onSuccess:()=>alert('신고가 접수되었습니다. 콘텐츠는 자동 삭제되지 않습니다.')})

  if(detail.isLoading)return <div className="container"><div className="state">아이디어를 불러오고 있어요.</div></div>
  if(detail.isError||!detail.data)return <div className="container"><div className="state">아이디어를 열람할 수 없습니다.</div></div>

  const idea=detail.data
  const liked=me.data?.likedIds.includes(id)
  const questions=idea.validationQuestions??['초기 고객군이 충분히 구체적인가요?']

  return <div className="container detail detail-page">
    <Link className="back" to="/">← 아이디어 랭킹</Link>

    <section className="detail-overview">
      <div className="detail-story-head">
        <div className="row-badges"><span className="badge gray">{idea.category}</span><span className="badge green">{idea.visibility}</span><span className="badge">{idea.maturity}</span></div>
        <h1>{idea.title}</h1>
        <p>{idea.summary}</p>
        <div className="detail-meta">
          <span className="author"><span className="avatar small">{idea.author[0]}</span>{idea.author}</span>
          <button className={`detail-like ${liked?'liked':''}`} onClick={()=>like.mutate()}><Heart fill={liked?'currentColor':'none'}/><span>{idea.likes}</span></button>
          <button className="detail-report" onClick={()=>report.mutate()}><ShieldAlert/>신고</button>
        </div>
      </div>

      <aside className="participation-panel" aria-label="아이디어 참여 현황">
        <span className="participation-label">활성 원금</span>
        <div className="participation-price"><b>{num.format(idea.seedInvested)}</b><span>P</span><em>+{idea.trend}%</em></div>
        <div className="participation-stats">
          <span>Seed Unit 현재가<b>{idea.price} P</b></span>
          <span>참여자<b>{idea.investors}명</b></span>
          <span>기업 관심<b>{idea.companies.length}곳</b></span>
        </div>
        {idea.capabilities?.purchase?<button className="btn primary wide" onClick={()=>setBuyOpen(true)}><Coins/>Seed Unit 참여하기</button>:<span className="participation-unavailable">현재 참여할 수 없는 아이디어입니다.</span>}
      </aside>
    </section>

    <div className="notice detail-notice"><Check/><span><b>가상 포인트 안내</b> 현금화할 수 없으며 금전적 권리나 수익 배분을 의미하지 않습니다.</span></div>

    {idea.contentAccess!=='FULL'&&<section className="locked-panel"><LockKeyhole/><div><h3>{idea.contentAccess==='LOCKED'?'비공개 아이디어입니다':'상세 내용은 작성자 승인 후 볼 수 있습니다'}</h3><p>현재 공개 범위에서 제공되는 요약만 표시하고 있습니다.</p>{idea.capabilities?.requestAccess&&<><textarea value={accessMessage} onChange={e=>setAccessMessage(e.target.value)} placeholder="작성자에게 전달할 요청 메시지"/><button className="btn primary" onClick={()=>access.mutate()}>상세 열람 요청</button></>}</div></section>}

    <div className="tabs detail-tabs"><button className={tab==='plan'?'active':''} onClick={()=>setTab('plan')}>아이디어 소개</button><button className={tab==='feedback'?'active':''} onClick={()=>setTab('feedback')}>피드백 {idea.feedback.length}</button><button className={tab==='timeline'?'active':''} onClick={()=>setTab('timeline')}>성장 기록</button><button className={tab==='company'?'active':''} onClick={()=>setTab('company')}>기업 관심</button></div>

    {tab==='plan'&&<div className="plan-layout">
      <section className="idea-story">
        <div className="story-intro"><span>IDEA STORY</span><h2>아이디어가 해결하려는 문제와<br/>가능성을 확인해 보세요.</h2></div>
        <Section title="문제 정의" text={idea.problem}/>
        <Section title="목표 고객" text={idea.target}/>
        {idea.contentAccess==='FULL'&&<><Section title="해결 방법" text={idea.solution}/><Section title="수익 모델" text={idea.businessModel}/></>}
      </section>
      <aside className="validation-stack">
        <section className="validation-panel"><span>VALIDATION POINT</span><h3>함께 검증할 질문</h3><ol>{questions.map(question=><li key={question}>{question}</li>)}</ol><button className="btn ghost" onClick={()=>setTab('feedback')}>피드백으로 답하기</button></section>
        <section className="company-interest-card">
          <div className="interest-summary"><div><b>{idea.companies.length}개 기업</b><span>이 관심을 표시했어요</span></div><div className="company-avatars" aria-label="관심 기업">{idea.companies.slice(0,4).map((company,index)=><span key={company} style={{zIndex:4-index}} title={company}>{company[0]}</span>)}</div></div>
          <p>성장 가능성을 검토하고 있다면 관심 기업으로 참여해 주세요.</p>
          <button className="interest-button" disabled={!idea.capabilities?.companyInterest||interest.isPending} onClick={()=>interest.mutate()}><Building2/>{interest.isPending?'관심 추가 중...':'기업 관심 추가하기'}</button>
        </section>
        <section className="proposer-contact-card">
          <div className="proposer-profile"><span className="avatar">{idea.author[0]}</span><span><b>{idea.author}</b><small>아이디어 제안자</small></span></div>
          <p>협업이나 사업 검토에 필요한 내용을 제안자에게 직접 문의해 보세요.</p>
          <Link className="contact-button" to={`/messages?idea=${idea.id}`}><MessageCircle/>1:1 문의하기</Link>
        </section>
      </aside>
    </div>}

    {tab==='feedback'&&<div className="feedback-layout"><div><section className="panel feedback-form"><h3>구조화 피드백</h3><select value={feedback.type} onChange={e=>setFeedback({...feedback,type:e.target.value})}>{['문제 공감','고객군 제안','수익 모델 제안','경쟁 서비스 제보','실행 난이도','기능 개선'].map(v=><option key={v}>{v}</option>)}</select><textarea value={feedback.text} onChange={e=>setFeedback({...feedback,text:e.target.value})} placeholder="100자 이상의 구체적인 의견"/><input value={feedback.evidence} onChange={e=>setFeedback({...feedback,evidence:e.target.value})} placeholder="근거 URL 또는 설명 (선택)"/><div className="form-foot"><span>{feedback.text.length}/100자</span><button className="btn primary" disabled={feedback.text.length<100||createFeedback.isPending} onClick={()=>createFeedback.mutate()}>등록</button></div></section>{idea.feedback.filter(v=>!v.deletedAt).sort((a,b)=>Number(b.accepted)-Number(a.accepted)).map(f=><FeedbackCard key={f.id} feedback={f} idea={idea} onChange={refresh}/>)}</div><aside className="panel reward"><h3>검증 질문</h3><ol>{questions.map(v=><li key={v}>{v}</li>)}</ol></aside></div>}

    {tab==='timeline'&&<section className="panel timeline">{idea.timeline.map((v,i)=><div key={i}><span>{v.date}</span><i/><article><b>{v.title}</b><p>{v.detail}</p></article></div>)}</section>}

    {tab==='company'&&<section className="company-grid"><button className="btn primary" disabled={!idea.capabilities?.companyInterest} onClick={()=>interest.mutate()}><Building2/>기업 관심 표시</button>{idea.companies.map(v=><article className="panel company" key={v}><span className="company-logo"><Building2/></span><h3>{v}</h3><span className="badge green">관심 기업</span></article>)}</section>}

    {[createFeedback,purchase,interest,access].some(v=>v.isError)&&<p className="form-error">{errorMessage(createFeedback.error??purchase.error??interest.error??access.error)}</p>}

    {buyOpen&&<div className="modal-back"><section className="modal"><button className="close" onClick={()=>setBuyOpen(false)}><X/></button><h2>Seed Unit 참여</h2><div className="notice"><Coins/><span>가상 포인트이며 현금화할 수 없습니다.</span></div><label>구매 Unit<input type="number" min="1" max={Math.floor(100/idea.price)} value={units} onChange={e=>setUnits(Number(e.target.value))}/></label><div className="quote"><span>현재가 <b>{idea.price} P</b></span><span>총 결제액 <b>{idea.price*units} P</b></span><span>회수 가능 <b>24시간 후</b></span></div><button className="btn primary wide" onClick={()=>purchase.mutate()}>{idea.price*units} P로 참여</button></section></div>}
  </div>
}

function Section({title,text}:{title:string;text:string}){return <article className="story-section"><h2>{title}</h2><p>{text||'열람 권한이 필요한 내용입니다.'}</p></article>}

function FeedbackCard({feedback,idea,onChange}:{feedback:Feedback;idea:Idea;onChange:()=>void}){const [editing,setEditing]=useState(false);const [text,setText]=useState(feedback.text);const [reply,setReply]=useState('');const update=useMutation({mutationFn:()=>feedbackApi.update(feedback.id,{type:feedback.type,text}),onSuccess:()=>{setEditing(false);onChange()}});const remove=useMutation({mutationFn:()=>feedbackApi.remove(feedback.id),onSuccess:onChange});const accept=useMutation({mutationFn:()=>feedbackApi.accept(feedback.id,reply),onSuccess:onChange});const mine=feedback.author==='민서';return <article className={`panel feedback ${feedback.accepted?'accepted':''}`}>{feedback.accepted&&<span className="badge green"><Check/>채택된 기여</span>}<div className="feedback-meta"><span className="avatar small">{feedback.author[0]}</span><b>{feedback.author}</b><span className="badge gray">{feedback.type}</span>{feedback.editedAt&&<small>수정됨</small>}</div>{editing?<><textarea value={text} onChange={e=>setText(e.target.value)}/><button className="btn primary" disabled={text.length<100} onClick={()=>update.mutate()}>수정 저장</button></>:<p>{feedback.text}</p>}{feedback.evidence&&<a href={feedback.evidence} target="_blank" rel="noreferrer">근거 보기</a>}{feedback.authorReply&&<blockquote>작성자 답글: {feedback.authorReply}</blockquote>}<div className="feedback-actions">{mine&&<><button onClick={()=>setEditing(!editing)}>수정</button><button onClick={()=>remove.mutate()}>삭제</button></>}{idea.capabilities?.edit&&!feedback.accepted&&<><input value={reply} onChange={e=>setReply(e.target.value)} placeholder="채택 이유와 수정 방향"/><button disabled={reply.length<10} onClick={()=>accept.mutate()}>채택</button></>}</div></article>}
