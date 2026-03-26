import { Request } from 'express';
import { sniffr } from '..';

export const getBasicWebData = (req: Request) => {
    const { authorization, deviceid: deviceId } = req.headers;
    const userAgent = req.headers['user-agent'];
    const userIp = req.socket.remoteAddress;

    return {
        authorizationToken: authorization,
        userOs: sniffr.sniff(userAgent).os.name,
        deviceId,
        userAgent,
        userIp,
    };
};
