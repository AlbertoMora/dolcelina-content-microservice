export interface LoginViewModel {
    username?: string;
    email?: string;
    password: string;
    deviceId: string;
}

export interface ICheckChallengeViewModel {
    signedNonce: string;
    deviceId: string;
    sessionId: string;
    rsaPubKey: string;
    deviceName: string;
    deviceModel: string;
    deviceBrand: string;
    deviceType: string;
}
