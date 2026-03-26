export interface IUserSession {
    user: {
        id: string;
        username: string;
        prof_pic?: string;
        isactive: number;
        ban_case_id?: string;
        rol_id: string;
    };
    sessionId: string;
    exp: number;
}

export interface IRefreshTokenInfo {
    userId: string;
    sessionId: string;
    exp: number;
}

export interface IQueryViewModel {
    limit: string;
    offset: string;
    orderField: string;
    orderDirection: string;
}
