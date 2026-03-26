import { GenericObject } from '@aure/commons';

export interface ILogViewmodel {
    transactionId: string;
    level: string;
    message: GenericObject;
    module: string;
    type: string;
    user?: string;
    error?: string;
}
