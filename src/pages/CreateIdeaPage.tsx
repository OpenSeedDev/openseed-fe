import { useMutation, useQuery } from '@tanstack/react-query'
import { Check, Eye, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ideaCreateApi, type Candidate, type PublishInput } from '../features/idea-create/api/ideaCreate.api'
import type { Visibility } from '../types'

const initial={title:'',summary:'',category:'AI',problem:'',target:'',solution:'',businessModel:'',visibility:'공개형' as Visibility,validationQuestions:['초기 고객군이 충분히 구체적인가요?']}
const steps=['문제 입력','AI 생성','후보 선택','기획서 편집','공개·질문','미리보기']
const candidateDirections=['시장성 중심','실행 가능성 중심','커뮤니티 중심','확장성 중심','차별화 중심']

export function CreateIdeaPage(){
  const navigate=useNavigate()
  const [step,setStep]=useState(1)
  const [keyword,setKeyword]=useState('')
  const [background,setBackground]=useState('')
  const [jobId,setJobId]=useState('')
  const [form,setForm]=useState<PublishInput>(()=>{try{return JSON.parse(sessionStorage.getItem('idea-draft')??'null')??initial}catch{return initial}})
  const start=useMutation({mutationFn:()=>ideaCreateApi.start(keyword,background),onSuccess:j=>{setJobId(j.id);setStep(2)}})
  const job=useQuery({queryKey:['ai-job',jobId],queryFn:()=>ideaCreateApi.status(jobId),enabled:Boolean(jobId),refetchInterval:q=>q.state.data?.status==='COMPLETED'?false:700})
  const publish=useMutation({mutationFn:()=>ideaCreateApi.publish(form),onSuccess:i=>{sessionStorage.removeItem('idea-draft');navigate(`/ideas/${i.id}`)}})
  useEffect(()=>{sessionStorage.setItem('idea-draft',JSON.stringify(form))},[form])
  const choose=(candidate:Candidate)=>{setForm({...candidate,visibility:form.visibility,validationQuestions:form.validationQuestions});setStep(4)}
  const set=(key:keyof PublishInput,value:string|string[])=>setForm(current=>({...current,[key]:value}))
  const completedFields=[form.title,form.summary,form.problem,form.target,form.solution,form.businessModel].filter(Boolean).length
  const completion=Math.round(completedFields/6*100)

  return <div className="container create create-page">
    <header className="create-header">
      <div><span className="eyebrow">AI IDEA BUILDER</span><h1>아이디어를 현실적인 기획으로</h1><p>문제에서 시작해 공개 가능한 기획서까지 한 흐름으로 완성하세요.</p></div>
      <span className="draft-status"><Check/>초안 자동 저장됨</span>
    </header>

    <div className="create-progress" aria-label={`6단계 중 ${step}단계`}>
      <span>{step} / 6</span><div><i style={{width:`${step/6*100}%`}}/></div><b>{steps[step-1]}</b>
    </div>

    <div className="create-workspace">
      <main className="create-main">
        {step===1&&<section className="editor-surface">
          <div className="editor-heading"><span>START WITH A PROBLEM</span><h2>어떤 문제를 해결하고 싶나요?</h2><p>완성된 아이디어보다 실제로 관찰한 문제를 구체적으로 적어주세요.</p></div>
          <label>사업화 키워드<input value={keyword} onChange={event=>setKeyword(event.target.value)} placeholder="예: 소상공인, AI, 재고"/><small>아이디어의 산업이나 기술을 나타내는 단어를 입력하세요.</small></label>
          <label>문제 상황<textarea value={background} onChange={event=>setBackground(event.target.value)} placeholder="누가, 어떤 상황에서, 어떤 어려움을 겪고 있나요?"/><small>{background.length}자 · 10자 이상 입력해 주세요.</small></label>
          <div className="editor-actions"><span/><button className="btn primary" disabled={!keyword||background.length<10||start.isPending} onClick={()=>start.mutate()}><Sparkles/>{start.isPending?'생성 요청 중...':'AI 후보 생성'}</button></div>
        </section>}

        {step===2&&<section className="editor-surface ai-generating"><span className="spinner"/><span>AI GENERATING</span><h2>서로 다른 사업화 방향을 만들고 있어요.</h2><p>입력한 문제를 시장성, 실행 가능성, 차별화 관점에서 분석합니다.</p>{job.data?.status==='COMPLETED'&&<button className="btn primary" onClick={()=>setStep(3)}>5개 후보 확인</button>}{job.data?.status==='FAILED'&&<button className="btn ghost" onClick={()=>start.mutate()}>다시 시도</button>}</section>}

        {step===3&&<section className="editor-surface">
          <div className="editor-heading"><span>CHOOSE A DIRECTION</span><h2>발전시킬 후보를 선택하세요.</h2><p>선택한 초안은 다음 단계에서 자유롭게 수정할 수 있습니다.</p></div>
          <div className="candidate-list">{job.data?.candidates?.map((candidate,index)=><button key={candidate.id} onClick={()=>choose(candidate)}><div><span>0{index+1}</span><em>{candidateDirections[index]??'새로운 관점'}</em></div><h3>{candidate.title}</h3><p>{candidate.summary}</p><b>이 방향 선택하기 →</b></button>)}</div>
          <div className="editor-actions"><button className="btn ghost" onClick={()=>setStep(1)}>문제 다시 입력</button><span/></div>
        </section>}

        {step===4&&<section className="editor-surface">
          <div className="editor-heading"><span>REFINE THE DRAFT</span><h2>AI 기획서 초안을 다듬어 주세요.</h2><p>구체적인 표현을 더할수록 더 좋은 검증 의견을 받을 수 있어요.</p></div>
          <div className="idea-form">{(['title','summary','problem','target','solution','businessModel'] as const).map(key=><label key={key}>{({title:'아이디어 제목',summary:'한 줄 요약',problem:'문제 정의',target:'목표 고객',solution:'해결 방법',businessModel:'수익 모델'})[key]}{key==='title'?<input value={form[key]} onChange={event=>set(key,event.target.value)}/>:<textarea value={form[key]} onChange={event=>set(key,event.target.value)}/>}</label>)}</div>
          <div className="editor-actions"><button className="btn ghost" onClick={()=>setStep(3)}>후보 다시 선택</button><button className="btn primary" onClick={()=>setStep(5)}>공개 설정</button></div>
        </section>}

        {step===5&&<section className="editor-surface">
          <div className="editor-heading"><span>SET THE AUDIENCE</span><h2>공개 범위와 검증 질문을 정하세요.</h2><p>누가 아이디어를 볼 수 있는지와 꼭 확인하고 싶은 질문을 설정합니다.</p></div>
          <div className="visibility-options">{(['공개형','반공개형','비공개 검증형','매칭형 공개'] as Visibility[]).map(visibility=><button className={form.visibility===visibility?'selected':''} onClick={()=>set('visibility',visibility)} key={visibility}><Eye/><span><b>{visibility}</b><small>{visibility==='공개형'?'누구나 전체 내용을 볼 수 있어요.':visibility==='반공개형'?'상세 내용은 로그인 사용자에게 공개해요.':visibility==='비공개 검증형'?'공개 정보를 최소화해 검증해요.':'승인된 기업과 내용을 공유해요.'}</small></span>{form.visibility===visibility&&<Check/>}</button>)}</div>
          <label className="question-field">검증 질문 1~3개<textarea value={form.validationQuestions.join('\n')} onChange={event=>set('validationQuestions',event.target.value.split('\n').filter(Boolean).slice(0,3))}/><small>질문마다 줄을 바꿔 입력해 주세요.</small></label>
          <div className="editor-actions"><button className="btn ghost" onClick={()=>setStep(4)}>기획서 수정</button><button className="btn primary" onClick={()=>setStep(6)}>미리보기</button></div>
        </section>}

        {step===6&&<section className="editor-surface create-preview">
          <div className="preview-top"><span className="badge">{form.visibility}</span><small>게시 전 최종 미리보기</small></div><h1>{form.title||'아이디어 제목'}</h1><p>{form.summary||'아이디어를 한 문장으로 설명해 주세요.'}</p>
          {([['문제 정의',form.problem],['목표 고객',form.target],['해결 방법',form.solution],['수익 모델',form.businessModel]] as const).map(([title,text])=><article key={title}><h2>{title}</h2><p>{text}</p></article>)}
          <div className="editor-actions"><button className="btn ghost" onClick={()=>setStep(4)}>내용 수정</button><button className="btn primary" disabled={publish.isPending} onClick={()=>publish.mutate()}>{publish.isPending?'게시 중...':'아이디어 게시'}</button></div>
        </section>}
      </main>

      <aside className="create-assistant">
        <span className="assistant-mark"><Sparkles/>AI CO-PILOT</span>
        <h3>{step<3?'문제를 구체적으로 적어주세요.':step===3?'완벽한 후보보다 발전시키고 싶은 방향을 고르세요.':step===4?'AI 초안은 시작점입니다. 직접 다듬을수록 좋아요.':step===5?'검증받고 싶은 내용을 질문으로 바꿔보세요.':'게시 후에도 내용을 계속 발전시킬 수 있어요.'}</h3>
        <p>{step===1?'사용자, 상황, 불편함이 드러나면 더 다양한 아이디어를 만들 수 있습니다.':step===2?'잠시만 기다리면 서로 다른 관점의 후보 5개를 비교할 수 있습니다.':step===3?'선택 즉시 상세 기획서 초안으로 이어집니다.':step===4?'추상적인 표현보다 실제 사용자와 행동을 적어보세요.':step===5?'질문은 피드백 작성자가 구체적인 의견을 남기는 기준이 됩니다.':'공개 범위와 내용을 마지막으로 확인해 주세요.'}</p>
        <div className="completion-status"><div><span>기획서 완성도</span><b>{completion}%</b></div><div><i style={{width:`${completion}%`}}/></div></div>
        <div className="assistant-preview"><span>현재 아이디어</span><b>{form.title||keyword||'아직 제목이 없어요'}</b><p>{form.summary||background||'입력한 내용이 여기에 요약됩니다.'}</p></div>
      </aside>
    </div>
  </div>
}
