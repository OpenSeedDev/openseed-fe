import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../model/auth.queries'
export function RequireAuth({children}:{children:ReactNode}){const session=useSession();const location=useLocation();if(session.isLoading)return <div className="state">세션을 확인하고 있어요.</div>;if(!session.data)return <Navigate to="/login" state={{from:location.pathname}} replace/>;return children}
export function RequireVerifiedEmail({children}:{children:ReactNode}){const session=useSession();if(session.isLoading)return <div className="state">세션을 확인하고 있어요.</div>;if(!session.data)return <Navigate to="/login" replace/>;if(!session.data.emailVerifiedAt)return <Navigate to="/verify-email" replace/>;return children}
