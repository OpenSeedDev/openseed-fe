import { env } from '../config/env'
import { ApiError, type ApiErrorBody } from './errors'

export async function request<T>(path:string,init:RequestInit&{timeoutMs?:number}={}):Promise<T>{
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),init.timeoutMs??15_000)
  try{
    const response=await fetch(`${env.VITE_API_BASE_URL}${path}`,{...init,credentials:'include',signal:init.signal??controller.signal,headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}})
    if(!response.ok){let body:ApiErrorBody={code:`HTTP_${response.status}`};try{body=await response.json() as ApiErrorBody}catch{ /* empty */ }throw new ApiError(response.status,body)}
    if(response.status===204)return undefined as T
    return await response.json() as T
  }finally{clearTimeout(timeout)}
}
