const port = process.env.PORT ?? 3200;
import { Express } from 'express';

export const setAppConfig = (app: Express) => {
    //settings
    app.set('port', port);
    app.set('json spaces', 2);
};
