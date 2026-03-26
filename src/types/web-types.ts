export interface ISession {
    id: string;
    color: string;
    email: string;
    isActive: boolean;
    lastname: string;
    username: string;
    name: string;
    prof_pic: any;
    rol_id: string;
    sessionId: string;
    exp: number;
    iat: number;
}

export interface IRefreshToken {
    userId: string;
    sessionId: string;
    deviceId: string;
    exp: number;
}
