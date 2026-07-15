import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

async function bootstrap(){
  if((import.meta.env.VITE_API_MODE ?? 'mock')==='mock'){
    try{
      await import('./mocks/browser').then(({worker})=>worker.start({onUnhandledRequest:'bypass',serviceWorker:{url:'/mockServiceWorker.js'}}))
    }catch(error){
      console.error('Mock API 초기화에 실패했습니다.',error)
    }
  }
  const client=new QueryClient({defaultOptions:{queries:{staleTime:20_000,retry:1}}})
  createRoot(document.getElementById('root')!).render(<StrictMode><QueryClientProvider client={client}><BrowserRouter><App/></BrowserRouter></QueryClientProvider></StrictMode>)
}
void bootstrap().catch(error=>{
  console.error('애플리케이션 초기화에 실패했습니다.',error)
  const root=document.getElementById('root')
  if(root)root.innerHTML='<main style="max-width:720px;margin:80px auto;padding:24px;font-family:Pretendard,-apple-system,BlinkMacSystemFont,sans-serif"><h1>OpenSeed를 시작하지 못했습니다</h1><p>개발자 도구의 오류 메시지를 확인한 뒤 다시 시도해 주세요.</p></main>'
})
