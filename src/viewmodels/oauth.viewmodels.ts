export interface IGoogleSessionViewModel {
    code: string;
}

export interface IGoogleOAuthResponse {
    access_token: string;
    expires_in: number;
    id_token: string;
    scope: string;
    token_type: string;
}

export interface IGoogleOAuthTokenInfo {
    at_hash: string;
    aud: string;
    azp: string;
    email: string;
    email_verified: boolean;
    exp: number;
    family_name: string;
    given_name: string;
    iat: number;
    iss: string;
    name: string;
    picture: string;
    sub: string;
}
