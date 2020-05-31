import { IUser } from "@interfaces";

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
        auth_token: string;
        user: IUser;
    }
}