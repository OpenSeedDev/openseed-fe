import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../shared/api/queryKeys'
import { authApi } from '../api/auth.api'
export const useSession=()=>useQuery({queryKey:queryKeys.me,queryFn:authApi.me,retry:false})
export const useLogin=()=>{const client=useQueryClient();return useMutation({mutationFn:authApi.login,onSuccess:user=>client.setQueryData(queryKeys.me,user)})}
export const useSignup=()=>{const client=useQueryClient();return useMutation({mutationFn:authApi.signup,onSuccess:user=>client.setQueryData(queryKeys.me,user)})}
export const useLogout=()=>{const client=useQueryClient();return useMutation({mutationFn:authApi.logout,onSuccess:()=>{client.clear()}})}
