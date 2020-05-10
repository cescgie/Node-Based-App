export interface IUserDataToken {
    _id?: string;
    role?: number;
    remember?: any;
    email?: string;
    origin?: number;
}

export interface IJWTClaim {
    sub: string; // (Subject) Claim - is userID
    iss: string; // (Subject) Claim - baseURL
    permissions: number; // (Role) Claim - user role
    exp?: any; // (Expiration Time) Claim - Date
    iat?: any; // (Issued At) Claim - Date
    adr: string; // (Address) Claim - email
    tbr?: any; // (User Origin) Claim - origin
}

export interface IResponseAuth {
    status: number;
    message: string;
    content: {
        token: string;
        id: string;
        role: number;
        email: string;
        origin?: any;
        user?: any;
    }
}