import { NextFunction, Request, Response } from 'express';
import { checkPermission } from '../controllers/authorization.controller';
import { httpCodes, sendClientError, webErrors } from '@aure/commons';
import { getUserSession } from '../utils/session-helper';

export const checkPermissionMiddleware =
    (objectName: string, objectId: string, relation: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
        const userSession = getUserSession(req.headers.authorization ?? '');
        const isActionAllowed = (
            await checkPermission(userSession.user.id, objectName, objectId, relation)
        ).allowed;
        if (!isActionAllowed) return sendClientError(webErrors.auth16, res, httpCodes.bad_request);

        next();
    };
