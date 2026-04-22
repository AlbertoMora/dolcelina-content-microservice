import { fgaClient } from '../config/openfga-config';

export const checkPermission = async (
    userId: string,
    objectName: string,
    objectId: string,
    relation: string,
): Promise<{ allowed: boolean }> => {
    const { allowed } = await fgaClient.check({
        user: `user:${userId}`,
        relation,
        object: `${objectName}:${objectId}`,
    });
    return { allowed: allowed ?? false };
};
