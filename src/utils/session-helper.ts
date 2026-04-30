import { getTokenData } from '@amora95/commons';
import { IUserSession } from '../types/commons.types';

export const getUserSession = (authorization: string) => {
    const [, token] = authorization?.split(' ') ?? [];
    return getTokenData<IUserSession>(token);
};
