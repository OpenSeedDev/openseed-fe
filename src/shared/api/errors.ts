export interface ApiErrorBody { code:string; message?:string; fieldErrors?:Record<string,string>; requestId?:string }
export class ApiError extends Error { constructor(public status:number,public body:ApiErrorBody){super(body.message??body.code);this.name='ApiError'} }
export const errorMessage=(error:unknown)=>error instanceof ApiError?(error.body.message??'요청을 처리하지 못했습니다.'):'네트워크 연결을 확인해 주세요.'
