import { } from "@interfaces";

export interface IUserDataToken {
    _id?: string;
    role?: number;
    remember?: any;
    email?: string;
}

export interface IJWTClaim {
    sub: string; // (Subject) Claim - is userID
    iss: string; // (Subject) Claim - baseURL
    permissions: number; // (Role) Claim - user role
    exp?: any; // (Expiration Time) Claim - Date
    iat?: any; // (Issued At) Claim - Date
    adr: string; // (Address) Claim - email
}

export interface IResponseAuth {
    status: number;
    message: string;
    content: {
        bearer_token: string;
        user: IUserQueryData;
    }
}


export interface IUserQueryData {
    _id?: string;
    createdAt?: any;
    updatedAt?: any;
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    token?: string;
    remember?: any;
    active?: boolean;
    role?: number;
    lastLoginAt?: any;
}