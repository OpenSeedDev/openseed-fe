export type UserRole='USER'|'COMPANY'
export interface SessionUser { id:string;email:string;name:string;profileId:string;role:UserRole;emailVerifiedAt:string|null;companyVerifiedAt:string|null;points:number;pending:number;likedIds:string[];avatarUrl?:string|null;avatarColor?:string }
export interface SignupInput { email:string;password:string;profileId:string;name:string }
export interface LoginInput { email:string;password:string }
export interface ProfileUpdateInput { name:string;profileId:string;avatarUrl?:string|null;avatarColor?:string }
export interface Availability { available:boolean;message?:string }
