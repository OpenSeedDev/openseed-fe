import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, Building2, MessageCircle, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { messagingApi } from '../features/messaging/api/messaging.api'
import { queryKeys } from '../shared/api/queryKeys'
import type { Idea, Thread } from '../types'

const quickReplies=['검토 자료를 공유드리겠습니다.','미팅 가능한 일정을 알려주세요.','상세 내용을 확인했습니다.']
function threadStatus(thread:Thread){if(thread.unread>0)return {label:'답변 필요',tone:'attention'};if(thread.messages.at(-1)?.mine)return {label:'답변 대기',tone:'waiting'};return {label:'확인 완료',tone:'done'}}

export function MessagesPage(){
  const client=useQueryClient();const [params]=useSearchParams();const requestedIdeaId=params.get('idea');const [selectedId,setSelectedId]=useState<string|null>(null);const [text,setText]=useState('')
  const threads=useQuery({queryKey:queryKeys.threads,queryFn:messagingApi.threads,refetchInterval:45_000})
  const ideas=useQuery({queryKey:queryKeys.ideas(),queryFn:()=>api<Idea[]>('/ideas')})
  const ideaMap=useMemo(()=>new Map(ideas.data?.map(item=>[item.id,item])??[]),[ideas.data])
  const requestedIdea=ideas.data?.find(item=>item.id===requestedIdeaId);const requestedThread=threads.data?.find(item=>item.ideaId===requestedIdeaId);const effectiveSelectedId=selectedId??requestedThread?.id??(!requestedIdeaId?threads.data?.[0]?.id:null);const thread=threads.data?.find(item=>item.id===effectiveSelectedId);const activeIdea=thread?ideaMap.get(thread.ideaId):requestedIdea;const isNewInquiry=Boolean(requestedIdea&&!requestedThread&&!thread)
  const send=useMutation({mutationFn:()=>thread?messagingApi.send(thread.id,text):messagingApi.start(requestedIdea!.id,text),onSuccess:(created)=>{setText('');if(created&&typeof created==='object'&&'id' in created&&typeof created.id==='string')setSelectedId(created.id);void client.invalidateQueries({queryKey:queryKeys.threads})}})
  useEffect(()=>{if(thread?.unread)void messagingApi.read(thread.id).then(()=>client.invalidateQueries({queryKey:queryKeys.threads}))},[thread?.id,thread?.unread,client])
  const submit=(event:React.FormEvent)=>{event.preventDefault();if(text.trim()&&(thread||requestedIdea))send.mutate()}
  return <div className="container messages messages-v2"><div className="page-title message-page-title"><span className="eyebrow">COMPANY CONNECTION</span><h1>기업 문의</h1><p>아이디어의 맥락을 유지하며 기업과 구체적인 협업 가능성을 논의하세요.</p></div><div className="message-shell">
    <aside className="thread-list"><div className="thread-list-head"><h3>문의 목록</h3><span>{threads.data?.length??0}</span></div>{threads.data?.map(item=>{const status=threadStatus(item);const related=ideaMap.get(item.ideaId);return <button className={effectiveSelectedId===item.id?'active':''} onClick={()=>setSelectedId(item.id)} key={item.id}><span className="company-logo"><Building2/></span><span className="thread-copy"><span><b>{item.company}</b><em className={status.tone}>{status.label}</em></span><small>{related?.title??item.title}</small><i>{item.messages.at(-1)?.text}</i></span>{item.unread>0&&<strong>{item.unread}</strong>}</button>})}{!threads.isLoading&&!threads.data?.length&&<div className="thread-empty">아직 시작된 문의가 없습니다.</div>}</aside>
    <section className="conversation-panel">{(thread||isNewInquiry)?<><header className="conversation-head"><div><span>{isNewInquiry?'새 기업 문의':thread?.company}</span><b>{isNewInquiry?'아이디어 제안자에게 문의하기':thread?.title}</b></div><span className="verified-label">인증 기업</span></header>{activeIdea&&<div className="idea-context"><div><span>{activeIdea.category} · 관련 아이디어</span><b>{activeIdea.title}</b><p>{activeIdea.summary}</p></div><Link to={`/ideas/${activeIdea.id}`} aria-label="아이디어 상세 보기"><ArrowUpRight/></Link></div>}{isNewInquiry?<div className="new-inquiry-guide"><MessageCircle/><b>첫 메시지로 문의를 시작하세요</b><p>관심을 가진 이유와 논의하고 싶은 협업 범위를 구체적으로 남기면 답변을 받기 쉬워요.</p></div>:<div className="chat">{thread?.messages.map(message=><div className={message.mine?'mine':''} key={message.id}><p>{message.text}</p><small>{message.at}</small></div>)}</div>}<div className="quick-replies" aria-label="빠른 답장">{quickReplies.map(reply=><button type="button" onClick={()=>setText(reply)} key={reply}>{reply}</button>)}</div><form className="composer" onSubmit={submit}><textarea value={text} onChange={event=>setText(event.target.value)} placeholder={isNewInquiry?'문의 내용을 입력하세요':'메시지를 입력하세요'}/><button className="btn primary" disabled={!text.trim()||send.isPending}><Send/>{send.isPending?'전송 중':'보내기'}</button></form></>:<div className="state message-empty"><MessageCircle/><b>확인할 문의를 선택하세요</b><span>기업과 주고받은 대화가 이곳에 표시됩니다.</span></div>}</section>
  </div></div>
}
